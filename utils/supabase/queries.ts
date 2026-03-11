import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { CACHE_TAGS } from '@/lib/cache-keys';

// Create a single public client for cached queries to avoid cookie parsing dynamically 
// (which would opt routes into dynamic rendering and break unstable_cache).
// Instantiate safely inside the function to prevent Cross-Request State Pollution
// Wrap in React cache() to memoize the instance per-request, avoiding duplicate instantiations in the same render cycle
export const getPublicClient = cache(() => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
})

export const getPoemBySlug = async (slug: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient()
            const { data: poem, error } = await supabase
                .from('poems')
                .select(`
                  id, title, slug, original_text, language, publication_year, average_review, reviews_count, content,
                  authors ( id, name, slug ),
                  collections ( id, title )
                `)
                .eq('slug', slug)
                .maybeSingle()

            if (error) {
                console.error('Database Error fetching poem by slug:', error);
                throw error;
            }

            if (poem && Array.isArray(poem.content)) {
                return { ...poem, content: { stanzas: poem.content } };
            }

            return poem
        },
        [CACHE_TAGS.poem(slug)],
        { tags: [CACHE_TAGS.poem(slug)], revalidate: 86400 } // 24 hours caching
    )()
}

const fetchAuthorByField = async (field: 'id' | 'slug', value: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient()
            const { data: author, error } = await supabase
                .from('authors')
                .select(`
                    *,
                    poems ( id, title, slug ),
                    collections ( id, title, publication_year )
                `)
                .eq(field, value)
                .maybeSingle()

            if (error) {
                console.error(`Database Error fetching author by ${field}:`, error);
                throw error;
            }

            return author
        },
        [CACHE_TAGS.author(value)],
        { tags: [CACHE_TAGS.author(value)], revalidate: 86400 }
    )()
}

export const getAuthorById = (id: string) => fetchAuthorByField('id', id);
export const getAuthorBySlug = (slug: string) => fetchAuthorByField('slug', slug);

const fetchCollectionByField = async (field: 'id' | 'slug', value: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient()
            const { data: collection, error } = await supabase
                .from('collections')
                .select('id, title, slug, publication_year, summary, cover_url, poems_count, average_review, reviews_count, authors ( id, name, slug )')
                .eq(field, value)
                .maybeSingle()

            if (error) {
                console.error(`Error fetching collection by ${field}:`, error);
                throw error;
            }
            if (!collection) {
                return null;
            }

            const { data: poems } = await supabase
                .from('poems')
                .select('id, title, slug, poem_order')
                .eq('collection_id', collection.id)
                .order('poem_order', { ascending: true, nullsFirst: false })

            return { ...collection, poems }
        },
        [CACHE_TAGS.collection(value)],
        { tags: [CACHE_TAGS.collection(value)], revalidate: 86400 }
    )()
}

export const getCollectionById = (id: string) => fetchCollectionByField('id', id);
export const getCollectionBySlug = (slug: string) => fetchCollectionByField('slug', slug);

export const getDailyPoem = async () => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient()
            const today = new Date().toISOString().split('T')[0]

            let { data: dailyPoem, error: fetchError } = await supabase
                .from('daily_poems')
                .select('poem_id')
                .eq('date', today)
                .maybeSingle()

            if (fetchError) {
                console.error('Database Error fetching daily poem id:', fetchError);
                throw fetchError;
            }
            if (!dailyPoem?.poem_id) {
                return null;
            }

            const { data: poem, error } = await supabase
                .from('poems')
                .select('*, authors ( id, name, slug )')
                .eq('id', dailyPoem.poem_id)
                .maybeSingle()

            if (error) {
                console.error('Database Error fetching daily poem details:', error);
                throw error;
            }

            if (poem && Array.isArray(poem.content)) {
                return { ...poem, content: { stanzas: poem.content } };
            }

            return poem
        },
        [CACHE_TAGS.daily],
        { tags: [CACHE_TAGS.daily], revalidate: 3600 } // Check every hour
    )()
}

export const getTrendingPoems = async (limit: number = 10) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient()
            const { data: poems, error } = await supabase
                .from('poems')
                .select(`
                    *,
                    authors ( id, name, slug )
                `)
                .limit(limit)
                .order('reads_count', { ascending: false })
                .order('id', { ascending: false }) // Tie-breaker

            if (error) {
                console.error('Database Error fetching trending poems:', error);
                throw error;
            }

            return poems
        },
        [`trending-poems-${limit}`],
        { tags: [CACHE_TAGS.trending], revalidate: 3600 }
    )()
}
