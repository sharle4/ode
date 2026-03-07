'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authActionClient } from '@/lib/safe-action'

export const ratePoem = authActionClient
    .schema(z.object({
        poemId: z.string().uuid(),
        slug: z.string().min(1),
        score: z.number().min(0.5).max(5.0),
        reviewText: z.string().max(1000).optional(),
    }))
    .action(async ({ parsedInput: { poemId, slug, score, reviewText }, ctx: { supabase, user } }) => {
        const { error } = await supabase
            .from('reviews')
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
            throw new Error('Impossible de sauvegarder votre avis.')
        }

        revalidatePath(`/poem/${slug}`)
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
            throw new Error('Impossible de sauvegarder votre surbrillance.')
        }

        revalidatePath(`/poem/${slug}`)
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
            throw new Error('Impossible de créer la liste.')
        }

        revalidatePath('/lists', 'page')
        revalidatePath('/profile/[username]', 'page')
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
            throw new Error('Impossible d\'ajouter le poème à la liste.')
        }

        revalidatePath(`/lists/${listId}`, 'page')
        return { success: true }
    })

export const toggleFollow = authActionClient
    .schema(z.object({
        followingId: z.string().uuid()
    }))
    .action(async ({ parsedInput: { followingId }, ctx: { supabase, user } }) => {
        const { data: existing } = await supabase
            .from('followers')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', followingId)
            .single()

        if (existing) {
            const { error } = await supabase
                .from('followers')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', followingId)

            if (error) throw new Error('Impossible de se désabonner.')
        } else {
            const { error } = await supabase
                .from('followers')
                .insert({
                    follower_id: user.id,
                    following_id: followingId
                })

            if (error) throw new Error('Impossible de s\'abonner.')
        }

        revalidatePath('/profile/[username]', 'page')
        return { success: true, isFollowing: !existing }
    })
