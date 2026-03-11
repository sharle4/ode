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

interface CacheOptions {
    keyParts: string[];
    tags: string[];
    revalidate?: number | false;
    errorMessage: string;
}

const executeCachedQuery = <T>(
    options: CacheOptions,
    queryFn: (supabase: ReturnType<typeof getPublicClient>) => Promise<T>
): Promise<T> => {
    return unstable_cache(
        async () => {
            try {
                const supabase = getPublicClient();
                return await queryFn(supabase);
            } catch (error) {
                console.error(options.errorMessage, error);
                throw error;
            }
        },
        options.keyParts,
        { tags: options.tags, revalidate: options.revalidate }
    )();
};

export const getPoemBySlug = (slug: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.poem(slug)],
        tags: [CACHE_TAGS.poem(slug)],
        revalidate: 86400, // 24 hours caching
        errorMessage: 'Database Error fetching poem by slug:'
    },
    async (supabase) => {
        const { data: poem } = await supabase
            .from('poems')
            .select(`
                id, title, slug, original_text, language, publication_year, average_review, reviews_count, content,
                authors ( id, name, slug ),
                collections ( id, title )
            `)
            .eq('slug', slug)
            .maybeSingle()
            .throwOnError();

        if (poem && Array.isArray(poem.content)) {
            return { ...poem, content: { stanzas: poem.content } };
        }

        return poem;
    }
);

const fetchAuthorByField = (field: 'id' | 'slug', value: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.author(value)],
        tags: [CACHE_TAGS.author(value)],
        revalidate: 86400,
        errorMessage: `Database Error fetching author by ${field}:`
    },
    async (supabase) => {
        const { data: author } = await supabase
            .from('authors')
            .select(`
                *,
                poems ( id, title, slug ),
                collections ( id, title, publication_year )
            `)
            .eq(field, value)
            .maybeSingle()
            .throwOnError();

        return author;
    }
);

export const getAuthorById = (id: string) => fetchAuthorByField('id', id);
export const getAuthorBySlug = (slug: string) => fetchAuthorByField('slug', slug);

const fetchCollectionByField = (field: 'id' | 'slug', value: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.collection(value)],
        tags: [CACHE_TAGS.collection(value)],
        revalidate: 86400,
        errorMessage: `Error fetching collection by ${field}:`
    },
    async (supabase) => {
        const { data: collection } = await supabase
            .from('collections')
            .select('id, title, slug, publication_year, summary, cover_url, poems_count, average_review, reviews_count, authors ( id, name, slug )')
            .eq(field, value)
            .maybeSingle()
            .throwOnError();

        if (!collection) {
            return null;
        }

        const { data: poems } = await supabase
            .from('poems')
            .select('id, title, slug, poem_order')
            .eq('collection_id', collection.id)
            .order('poem_order', { ascending: true, nullsFirst: false })
            .throwOnError();

        return { ...collection, poems };
    }
);

export const getCollectionById = (id: string) => fetchCollectionByField('id', id);
export const getCollectionBySlug = (slug: string) => fetchCollectionByField('slug', slug);

export const getDailyPoem = () => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.daily],
        tags: [CACHE_TAGS.daily],
        revalidate: 3600, // Check every hour
        errorMessage: 'Database Error fetching daily poem:'
    },
    async (supabase) => {
        const today = new Date().toISOString().split('T')[0];

        const { data: dailyPoem } = await supabase
            .from('daily_poems')
            .select('poem_id')
            .eq('date', today)
            .maybeSingle()
            .throwOnError();

        if (!dailyPoem?.poem_id) {
            return null;
        }

        const { data: poem } = await supabase
            .from('poems')
            .select('*, authors ( id, name, slug )')
            .eq('id', dailyPoem.poem_id)
            .maybeSingle()
            .throwOnError();

        if (poem && Array.isArray(poem.content)) {
            return { ...poem, content: { stanzas: poem.content } };
        }

        return poem;
    }
);

export const getTrendingPoems = (limit: number = 10) => executeCachedQuery(
    {
        keyParts: [`trending-poems-${limit}`],
        tags: [CACHE_TAGS.trending],
        revalidate: 3600,
        errorMessage: 'Database Error fetching trending poems:'
    },
    async (supabase) => {
        const { data: poems } = await supabase
            .from('poems')
            .select(`
                *,
                authors ( id, name, slug )
            `)
            .limit(limit)
            .order('reads_count', { ascending: false })
            .order('id', { ascending: false }) // Tie-breaker
            .throwOnError();

        return poems;
    }
);
