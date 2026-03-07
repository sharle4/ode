import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

// Create a single public client for cached queries to avoid cookie parsing dynamically 
// (which would opt routes into dynamic rendering and break unstable_cache).
const getPublicClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

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
                .single()

            if (error) {
                console.error('Error fetching poem by slug:', error)
                return null
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
                .single()

            if (error) {
                console.error('Error fetching author by ID:', error)
                return null
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
                .single()

            if (error) {
                console.error('Error fetching author by slug:', error)
                return null
            }

            return author
        },
        [`author-slug-${slug}`],
        { tags: [`author-${slug}`], revalidate: 86400 }
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
                .single()

            if (error) {
                console.error('Error fetching collection by ID:', error)
                return null
            }

            const { data: poems } = await supabase
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
                console.error('Error/Missing daily poem:', fetchError)
                return null
            }

            const { data: poem } = await supabase
                .from('poems')
                .select('*, authors ( id, name, slug )')
                .eq('id', dailyPoem.poem_id)
                .single()

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
                console.error('Error fetching trending poems:', error)
                return []
            }

            return poems
        },
        [`trending-poems-${limit}`],
        { tags: ['trending-poems'], revalidate: 3600 }
    )()
}
