'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Ensures a user is authenticated before performing an action
 */
async function protectAction() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        throw new Error('You must be logged in to perform this action.')
    }
    return { supabase, user }
}

export async function ratePoem(poemId: string, slug: string, score: number, reviewText?: string) {
    const { supabase, user } = await protectAction()

    // Upsert rating (id will be generated if missing, but we rely on the unique constraint user_id+poem_id)
    const { error } = await supabase
        .from('ratings')
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
        return { error: 'Could not save rating.' }
    }

    // Revalidate the current poem page
    revalidatePath(`/poem/${slug}`)
    return { success: true }
}

export async function highlightPoem(poemId: string, slug: string, stanzaIndex: number, lineIndex: number, text: string, annotation?: string) {
    const { supabase, user } = await protectAction()

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
        return { error: 'Could not save highlight.' }
    }

    revalidatePath(`/poem/${slug}`)
    return { success: true }
}

export async function createList(title: string, description?: string, isPublic: boolean = true) {
    const { supabase, user } = await protectAction()

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
        return { error: 'Could not create list.' }
    }

    revalidatePath('/lists', 'page')
    revalidatePath('/profile/[username]', 'page')
    return { success: true, listId: data.id }
}

export async function addToList(listId: string, poemId: string, itemOrder: number, notes?: string) {
    const { supabase, user } = await protectAction()

    // Ideally, verify the user owns the list first, 
    // but RLS should block the insert if they don't!
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
        return { error: 'Could not add poem to list.' }
    }

    revalidatePath(`/lists/${listId}`, 'page')
    return { success: true }
}

export async function toggleFollow(followingId: string) {
    const { supabase, user } = await protectAction()

    // Check if already following
    const { data: existing } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single()

    if (existing) {
        // Unfollow
        const { error } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', followingId)

        if (error) return { error: 'Failed to unfollow.' }
    } else {
        // Follow
        const { error } = await supabase
            .from('followers')
            .insert({
                follower_id: user.id,
                following_id: followingId
            })

        if (error) return { error: 'Failed to follow.' }
    }

    revalidatePath('/profile/[username]', 'page')
    return { success: true, isFollowing: !existing }
}
