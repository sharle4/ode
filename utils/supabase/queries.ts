import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

// Using React's cache to deduplicate requests within a single render pass
export const getPoemBySlug = cache(async (slug: string) => {
    const supabase = await createClient()
    const { data: poem, error } = await supabase
        .from('poems')
        .select(`
      *,
      authors ( id, name ),
      collections ( id, title )
    `)
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching poem by slug:', error)
        return null
    }

    return poem
})

export const getAuthorById = cache(async (id: string) => {
    const supabase = await createClient()
    const { data: author, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching author by ID:', error)
        return null
    }

    // Fetch author's poems and collections
    const { data: poems } = await supabase.from('poems').select('id, title, slug').eq('author_id', id)
    const { data: collections } = await supabase.from('collections').select('id, title, publication_year').eq('author_id', id)

    return { ...author, poems, collections }
})

export const getCollectionById = cache(async (id: string) => {
    const supabase = await createClient()
    const { data: collection, error } = await supabase
        .from('collections')
        .select('*, authors ( id, name )')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching collection by ID:', error)
        return null
    }

    // Fetch collection's poems ordered by poem_order or fallback
    const { data: poems } = await supabase
        .from('poems')
        .select('id, title, slug, poem_order')
        .eq('collection_id', id)
        .order('poem_order', { ascending: true, nullsFirst: false })

    return { ...collection, poems }
})

export const getDailyPoem = cache(async () => {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Check if we already have a daily poem for today
    let { data: dailyPoem, error: fetchError } = await supabase
        .from('daily_poems')
        .select('poem_id')
        .eq('date', today)
        .maybeSingle()

    if (fetchError) {
        console.error('Error fetching daily poem:', fetchError)
        return null
    }

    let poemId = dailyPoem?.poem_id

    // If not, randomly pick one and save it (this logic could also live in an edge function/cron job)
    if (!poemId) {
        // Note: In a massive DB, ordering by random() is slow, but acceptable for demo. 
        // A better approach is fetching a random offset or using a specialized RPC.
        const { data: randomPoems, error: randomError } = await supabase
            .from('poems')
            .select('id')
            .limit(1)

        // Because auth isn't necessarily available here, a service role key might be needed
        // to INsert if RLS blocks it. Assuming public can't insert, we might just return a random one
        // without saving to daily_poems if we hit RLS issues, or we handle this in a cron job.
        if (!randomError && randomPoems && randomPoems.length > 0) {
            poemId = randomPoems[0].id
            // Best effort to save it (might fail if RLS prevents anonymous inserts to daily_poems)
            await supabase.from('daily_poems').insert({ date: today, poem_id: poemId }).select().maybeSingle()
        }
    }

    if (!poemId) return null

    // Fetch the actual poem details
    const { data: poem } = await supabase
        .from('poems')
        .select('*, authors ( id, name )')
        .eq('id', poemId)
        .single()

    return poem
})

export const getTrendingPoems = cache(async (limit: number = 10) => {
    const supabase = await createClient()

    // Pour une démo élégante, on prend des poèmes au hasard ou récents
    // Idéalement, on trierait par un score de popularité calculé
    const { data: poems, error } = await supabase
        .from('poems')
        .select(`
            *,
            authors ( id, name )
        `)
        .limit(limit)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching trending poems:', error)
        return []
    }

    return poems
})
