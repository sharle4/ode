import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

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
                  *,
                  authors ( id, name, slug ),
                  collections ( id, title )
                `)
                .eq('slug', slug)
                .maybeSingle()

            if (error) {
                console.error('Database Error fetching poem by slug:', error)
                throw new Error('Database Error fetching poem')
            }

            if (poem && Array.isArray(poem.content)) {
                poem.content = { stanzas: poem.content }
            }

            return poem
        },
        [`poem-${slug}`],
        { tags: [`poem-${slug}`], revalidate: 86400 } // 24 hours caching
    )()
}

export const getAuthorById = async (id: string) => {
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
                .eq('id', id)
                .maybeSingle()

            if (error) {
                console.error('Database Error fetching author by ID:', error)
                throw new Error('Database Error fetching author')
            }

            return author
        },
        [`author-${id}`],
        { tags: [`author-${id}`], revalidate: 86400 }
    )()
}

export const getAuthorBySlug = async (slug: string) => {
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
                .eq('slug', slug)
                .maybeSingle()

            if (error) {
                console.error('Database Error fetching author by slug:', error)
                throw new Error('Database Error fetching author')
            }

            return author
        },
        [`author-slug-${slug}`],
        { tags: [`author-${slug}`], revalidate: 86400 }
    )()
}

export const getCollectionBySlug = async (slug: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient()
            const { data: collection, error } = await supabase
                .from('collections')
                .select('*, authors ( id, name, slug )')
                .eq('slug', slug)
                .single()

            if (error) {
                console.error('Error fetching collection by slug:', error)
                return null
            }

            const { data: poems } = await supabase
                .from('poems')
                .select('id, title, slug, poem_order')
                .eq('collection_id', collection.id)
                .order('poem_order', { ascending: true, nullsFirst: false })

            return { ...collection, poems }
        },
        [`collection-slug-${slug}`],
        { tags: [`collection-${slug}`], revalidate: 86400 }
    )()
}

export const getCollectionById = async (id: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient()
            const { data: collection, error } = await supabase
                .from('collections')
                .select('*, authors ( id, name, slug )')
                .eq('id', id)
                .maybeSingle()

            if (error) {
                console.error('Database Error fetching collection by ID:', error)
                throw new Error('Database Error fetching collection')
            }

            const { data: poems, error: poemsError } = await supabase
                .from('poems')
                .select('id, title, slug, poem_order')
                .eq('collection_id', id)
                .order('poem_order', { ascending: true, nullsFirst: false })

            return { ...collection, poems }
        },
        [`collection-${id}`],
        { tags: [`collection-${id}`], revalidate: 86400 }
    )()
}

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

            if (fetchError || !dailyPoem?.poem_id) {
                if (fetchError && fetchError.code !== 'PGRST116') {
                    console.error('Database Error fetching daily poem id:', fetchError)
                    throw new Error('Database Error fetching daily poem')
                }
                return null
            }

            const { data: poem, error } = await supabase
                .from('poems')
                .select('*, authors ( id, name, slug )')
                .eq('id', dailyPoem.poem_id)
                .maybeSingle()

            if (error) {
                console.error('Database Error fetching daily poem details:', error)
                throw new Error('Database Error fetching daily poem details')
            }

            if (poem && Array.isArray(poem.content)) {
                poem.content = { stanzas: poem.content }
            }

            return poem
        },
        ['daily-poem'],
        { tags: ['daily-poem'], revalidate: 3600 } // Check every hour
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
                .order('reads_count', { ascending: false }) // Sort by new reads_count column

            if (error) {
                console.error('Database Error fetching trending poems:', error)
                throw new Error('Database Error fetching trending poems')
            }

            return poems
        },
        [`trending-poems-${limit}`],
        { tags: ['trending-poems'], revalidate: 3600 }
    )()
}
