'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { authActionClient } from '@/lib/safe-action'
import { CACHE_TAGS } from '@/lib/cache-keys'

export const ratePoem = authActionClient
    .schema(z.object({
        poemId: z.string().uuid(),
        slug: z.string().min(1),
        score: z.number().min(0.5).max(5.0),
        reviewText: z.string().max(1000).optional(),
    }))
    .action(async ({ parsedInput: { poemId, slug, score, reviewText }, ctx: { supabase, user } }) => {
        const { error } = await supabase
            .from('poem_reviews')
            .upsert(
                {
                    user_id: user.id,
                    poem_id: poemId,
                    score,
                    review_text: reviewText || null,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id,poem_id' }
            )

        if (error) {
            console.error('Failed to rate poem:', error.message)
            return { failure: 'Impossible de sauvegarder votre avis.' }
        }

        revalidateTag(CACHE_TAGS.poem(slug))
        return { success: true }
    })

export const rateCollection = authActionClient
    .schema(z.object({
        collectionId: z.string().uuid(),
        slug: z.string().min(1),
        score: z.number().min(0.5).max(5.0),
        reviewText: z.string().max(1000).optional(),
    }))
    .action(async ({ parsedInput: { collectionId, slug, score, reviewText }, ctx: { supabase, user } }) => {
        const { error } = await supabase
            .from('collection_reviews')
            .upsert(
                {
                    user_id: user.id,
                    collection_id: collectionId,
                    score,
                    review_text: reviewText || null,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id,collection_id' }
            )

        if (error) {
            console.error('Failed to rate collection:', error.message)
            return { failure: 'Impossible de sauvegarder votre avis sur ce recueil.' }
        }

        revalidateTag(CACHE_TAGS.collection(slug))
        return { success: true }
    })

export const toggleLike = authActionClient
    .schema(z.object({
        poemId: z.string().uuid(),
        slug: z.string().min(1),
        targetState: z.boolean()
    }))
    .action(async ({ parsedInput: { poemId, slug, targetState }, ctx: { supabase, user } }) => {
        if (targetState) {
            const { error } = await supabase.from('poem_likes')
                .upsert({ user_id: user.id, poem_id: poemId }, { onConflict: 'user_id,poem_id' })

            if (error) return { failure: 'Impossible de liker ce poème.' }
        } else {
            const { error } = await supabase.from('poem_likes')
                .delete()
                .eq('user_id', user.id)
                .eq('poem_id', poemId)

            if (error) return { failure: 'Impossible de retirer votre like.' }
        }

        return { success: true }
    })

export const highlightPoem = authActionClient
    .schema(z.object({
        poemId: z.string().uuid(),
        slug: z.string().min(1),
        stanzaIndex: z.number().int().min(0),
        lineIndex: z.number().int().min(0),
        text: z.string().min(1).max(500),
        annotation: z.string().max(1000).optional()
    }))
    .action(async ({ parsedInput: { poemId, slug, stanzaIndex, lineIndex, text, annotation }, ctx: { supabase, user } }) => {
        const { error } = await supabase
            .from('highlights')
            .insert({
                user_id: user.id,
                poem_id: poemId,
                stanza_index: stanzaIndex,
                line_index: lineIndex,
                text,
                annotation: annotation || null
            })

        if (error) {
            console.error('Failed to save highlight:', error.message)
            return { failure: 'Impossible de sauvegarder votre surbrillance.' }
        }

        revalidateTag(CACHE_TAGS.poem(slug))
        return { success: true }
    })

export const createList = authActionClient
    .schema(z.object({
        title: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().default(true)
    }))
    .action(async ({ parsedInput: { title, description, isPublic }, ctx: { supabase, user } }) => {
        const { data, error } = await supabase
            .from('lists')
            .insert({
                user_id: user.id,
                title,
                description,
                is_public: isPublic
            })
            .select('id')
            .single()

        if (error) {
            console.error('Failed to create list:', error.message)
            return { failure: 'Impossible de créer la liste.' }
        }

        revalidateTag('public-lists')
        // Invalidate the creator's profile using the safe dynamic tag, assuming their username relies on user_metadata
        const { data: currentUser } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle();
        if (currentUser?.username) {
            revalidateTag(CACHE_TAGS.profile(currentUser.username))
            return { success: true, listId: data.id }
        })

export const addToList = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
        poemId: z.string().uuid(),
        itemOrder: z.number().int().min(0),
        notes: z.string().max(1000).optional()
    }))
    .action(async ({ parsedInput: { listId, poemId, itemOrder, notes }, ctx: { supabase, user } }) => {
        const { error } = await supabase
            .from('list_items')
            .insert({
                list_id: listId,
                poem_id: poemId,
                item_order: itemOrder,
                notes: notes || null
            })

        if (error) {
            console.error('Failed to add to list:', error.message)
            return { failure: "Impossible d'ajouter le poème à la liste." }
        }

        revalidateTag(CACHE_TAGS.list(listId))
        return { success: true }
    })

export const toggleFollow = authActionClient
    .schema(z.object({
        followingId: z.string().uuid()
    }))
    .action(async ({ parsedInput: { followingId }, ctx: { supabase, user } }) => {
        const { data: existing } = await supabase
            .from('followers')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', followingId)
            .maybeSingle()

        if (existing) {
            const { error } = await supabase
                .from('followers')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', followingId)

            if (error) return { failure: 'Impossible de se désabonner.' }
        } else {
            const { error } = await supabase
                .from('followers')
                .insert({
                    follower_id: user.id,
                    following_id: followingId
                })

            if (error) return { failure: 'Impossible de s\'abonner.' }
        }

        // Granular cache invalidation avoiding massive cross-user purge
        const { data: followedUser } = await supabase.from('users').select('username').eq('id', followingId).maybeSingle();
        if (followedUser?.username) {
            revalidateTag(CACHE_TAGS.profile(followedUser.username));
        }
        const { data: currentUser } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle();
        if (currentUser?.username) {
            revalidateTag(CACHE_TAGS.profile(currentUser.username))

            return { success: true, isFollowing: !existing }
        })
