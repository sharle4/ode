'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { adminActionClient } from '@/lib/safe-action'
import { CACHE_TAGS } from '@/lib/cache-keys'

// ── FEATURED POEMS ──

export const saveFeaturedPoems = adminActionClient
    .schema(z.object({
        poemIds: z.array(z.string().uuid()).max(20),
    }))
    .action(async ({ parsedInput: { poemIds }, ctx: { supabase } }) => {
        const { error } = await supabase.rpc('update_featured_poems', {
            new_poem_ids: poemIds,
        })

        if (error) {
            console.error('Failed to update featured poems:', error.message)
            return { failure: 'Impossible de mettre à jour les poèmes à la une.' }
        }

        revalidateTag(CACHE_TAGS.featured, undefined as never)
        return { success: true }
    })

// ── FEATURED AUTHORS ──

export const saveFeaturedAuthors = adminActionClient
    .schema(z.object({
        authorIds: z.array(z.string().uuid()).max(20),
    }))
    .action(async ({ parsedInput: { authorIds }, ctx: { supabase } }) => {
        const { error } = await supabase.rpc('update_featured_authors', {
            new_author_ids: authorIds,
        })

        if (error) {
            console.error('Failed to update featured authors:', error.message)
            return { failure: 'Impossible de mettre à jour les auteurs à la une.' }
        }

        revalidateTag(CACHE_TAGS.featured, undefined as never)
        return { success: true }
    })

// ── FEATURED COLLECTIONS ──

export const saveFeaturedCollections = adminActionClient
    .schema(z.object({
        collectionIds: z.array(z.string().uuid()).max(20),
    }))
    .action(async ({ parsedInput: { collectionIds }, ctx: { supabase } }) => {
        const { error } = await supabase.rpc('update_featured_collections', {
            new_collection_ids: collectionIds,
        })

        if (error) {
            console.error('Failed to update featured collections:', error.message)
            return { failure: 'Impossible de mettre à jour les recueils à la une.' }
        }

        revalidateTag(CACHE_TAGS.featured, undefined as never)
        return { success: true }
    })

// ── DAILY POEM ──

export const saveDailyPoem = adminActionClient
    .schema(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : YYYY-MM-DD'),
        poemId: z.string().uuid(),
    }))
    .action(async ({ parsedInput: { date, poemId }, ctx: { supabase } }) => {
        const { error } = await supabase.rpc('set_daily_poem', {
            target_date: date,
            target_poem_id: poemId,
        })

        if (error) {
            console.error('Failed to set daily poem:', error.message)
            return { failure: 'Impossible de définir le poème du jour.' }
        }

        revalidateTag(CACHE_TAGS.daily, undefined as never)
        return { success: true }
    })

// ── SEARCH (lightweight payloads) ──

export const searchPoems = adminActionClient
    .schema(z.object({
        query: z.string().min(1).max(100),
    }))
    .action(async ({ parsedInput: { query }, ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('poems')
            .select('id, title, slug, authors:poem_authors(authors(id, name, slug))')
            .ilike('title', `%${query}%`)
            .limit(10)

        if (error) {
            console.error('Search poems failed:', error.message)
            return { failure: 'Erreur lors de la recherche.' }
        }

        // Flatten nested join: authors → flat array
        const results = (data || []).map((poem: any) => ({
            id: poem.id,
            title: poem.title,
            slug: poem.slug,
            authors: (poem.authors || []).map((a: any) => a.authors).filter(Boolean),
        }))

        return { success: true, data: results }
    })

export const searchAuthors = adminActionClient
    .schema(z.object({
        query: z.string().min(1).max(100),
    }))
    .action(async ({ parsedInput: { query }, ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('authors')
            .select('id, name, slug, image_url')
            .ilike('name', `%${query}%`)
            .limit(10)

        if (error) {
            console.error('Search authors failed:', error.message)
            return { failure: 'Erreur lors de la recherche.' }
        }

        return { success: true, data: data || [] }
    })

export const searchCollections = adminActionClient
    .schema(z.object({
        query: z.string().min(1).max(100),
    }))
    .action(async ({ parsedInput: { query }, ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('collections')
            .select('id, title, slug, authors:collection_authors(authors(id, name, slug))')
            .ilike('title', `%${query}%`)
            .limit(10)

        if (error) {
            console.error('Search collections failed:', error.message)
            return { failure: 'Erreur lors de la recherche.' }
        }

        const results = (data || []).map((col: any) => ({
            id: col.id,
            title: col.title,
            slug: col.slug,
            authors: (col.authors || []).map((a: any) => a.authors).filter(Boolean),
        }))

        return { success: true, data: results }
    })

// ── FETCH CURRENT FEATURED (for admin panel initial state) ──

export const fetchCurrentFeaturedPoems = adminActionClient
    .schema(z.object({}))
    .action(async ({ ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('featured_poems')
            .select('position, poems:poem_id(id, title, slug, authors:poem_authors(authors(id, name, slug)))')
            .order('position', { ascending: true })

        if (error) {
            console.error('Fetch featured poems failed:', error.message)
            return { failure: 'Impossible de charger les poèmes à la une.' }
        }

        const results = (data || []).map((row: any) => ({
            id: row.poems?.id,
            title: row.poems?.title,
            slug: row.poems?.slug,
            position: row.position,
            authors: (row.poems?.authors || []).map((a: any) => a.authors).filter(Boolean),
        })).filter((p: any) => p.id)

        return { success: true, data: results }
    })

export const fetchCurrentFeaturedAuthors = adminActionClient
    .schema(z.object({}))
    .action(async ({ ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('featured_authors')
            .select('position, authors:author_id(id, name, slug, image_url)')
            .order('position', { ascending: true })

        if (error) {
            console.error('Fetch featured authors failed:', error.message)
            return { failure: 'Impossible de charger les auteurs à la une.' }
        }

        const results = (data || []).map((row: any) => ({
            id: row.authors?.id,
            name: row.authors?.name,
            slug: row.authors?.slug,
            image_url: row.authors?.image_url,
            position: row.position,
        })).filter((a: any) => a.id)

        return { success: true, data: results }
    })

export const fetchCurrentFeaturedCollections = adminActionClient
    .schema(z.object({}))
    .action(async ({ ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('featured_collections')
            .select('position, collections:collection_id(id, title, slug, authors:collection_authors(authors(id, name, slug)))')
            .order('position', { ascending: true })

        if (error) {
            console.error('Fetch featured collections failed:', error.message)
            return { failure: 'Impossible de charger les recueils à la une.' }
        }

        const results = (data || []).map((row: any) => ({
            id: row.collections?.id,
            title: row.collections?.title,
            slug: row.collections?.slug,
            position: row.position,
            authors: (row.collections?.authors || []).map((a: any) => a.authors).filter(Boolean),
        })).filter((c: any) => c.id)

        return { success: true, data: results }
    })

export const fetchDailyPoemHistory = adminActionClient
    .schema(z.object({}))
    .action(async ({ ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('daily_poems')
            .select('date, is_manual, poems:poem_id(id, title, slug, authors:poem_authors(authors(id, name, slug)))')
            .order('date', { ascending: false })
            .limit(7)

        if (error) {
            console.error('Fetch daily poem history failed:', error.message)
            return { failure: 'Impossible de charger l\'historique.' }
        }

        const results = (data || []).map((row: any) => ({
            date: row.date,
            isManual: row.is_manual,
            id: row.poems?.id,
            title: row.poems?.title,
            slug: row.poems?.slug,
            authors: (row.poems?.authors || []).map((a: any) => a.authors).filter(Boolean),
        })).filter((p: any) => p.id)

        return { success: true, data: results }
    })
