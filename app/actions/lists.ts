'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { authActionClient, actionClient } from '@/lib/safe-action'
import { CACHE_TAGS } from '@/lib/cache-keys'

async function getUsername(supabase: any, user: any): Promise<string | null> {
    if (user.user_metadata?.username) {
        return user.user_metadata.username;
    }
    const { data } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle();
    return data?.username || null;
}

export const createListAction = authActionClient
    .schema(z.object({
        title: z.string().trim().min(1, "Le titre est requis").max(100, "Le titre ne doit pas dépasser 100 caractères"),
        description: z.string().trim().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
        isPublic: z.boolean().default(true),
        isRanked: z.boolean().default(false),
    }))
    .action(async ({ parsedInput: { title, description, isPublic, isRanked }, ctx: { supabase, user } }) => {
        const { data, error } = await supabase
            .from('lists')
            .insert({
                user_id: user.id,
                title,
                description: description || null,
                is_public: isPublic,
                is_ranked: isRanked,
            })
            .select('id, slug, title, is_public')
            .single()

        if (error) {
            console.error('Failed to create list:', error.message)
            return { failure: 'Impossible de créer la liste. Veuillez réessayer.' }
        }

        const username = await getUsername(supabase, user);
        if (username) {
            revalidateTag(CACHE_TAGS.profile(username), undefined as never)
            revalidateTag(CACHE_TAGS.userLists(username), undefined as never)
        }
        revalidateTag('public-lists', undefined as never)

        return { success: true, listId: data.id, slug: data.slug, title: data.title, isPublic: data.is_public }
    })

export const updateListAction = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
        title: z.string().trim().min(1, "Le titre est requis").max(100),
        description: z.string().trim().max(1000).optional().nullable(),
        isPublic: z.boolean(),
        isRanked: z.boolean(),
    }))
    .action(async ({ parsedInput: { listId, title, description, isPublic, isRanked }, ctx: { supabase, user } }) => {
        const { data, error } = await supabase
            .from('lists')
            .update({
                title,
                description: description || null,
                is_public: isPublic,
                is_ranked: isRanked,
            })
            .eq('id', listId)
            .eq('user_id', user.id)
            .select('id, slug')
            .single()

        if (error) {
            console.error('Failed to update list:', error.message)
            return { failure: 'Impossible de modifier la liste.' }
        }

        const username = await getUsername(supabase, user);
        if (username) {
            revalidateTag(CACHE_TAGS.userLists(username), undefined as never)
            if (data?.slug) {
                revalidateTag(CACHE_TAGS.userList(username, data.slug), undefined as never)
            }
            revalidateTag(CACHE_TAGS.profile(username), undefined as never)
        }
        revalidateTag(CACHE_TAGS.list(listId), undefined as never)

        return { success: true }
    })

export const deleteListAction = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
    }))
    .action(async ({ parsedInput: { listId }, ctx: { supabase, user } }) => {
        // Fetch slug before deleting for cache invalidation
        const { data: listData } = await supabase
            .from('lists')
            .select('slug')
            .eq('id', listId)
            .eq('user_id', user.id)
            .maybeSingle();

        const { error } = await supabase
            .from('lists')
            .delete()
            .eq('id', listId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Failed to delete list:', error.message)
            return { failure: 'Impossible de supprimer la liste.' }
        }

        const username = await getUsername(supabase, user);
        if (username) {
            revalidateTag(CACHE_TAGS.userLists(username), undefined as never)
            if (listData?.slug) {
                revalidateTag(CACHE_TAGS.userList(username, listData.slug), undefined as never)
            }
            revalidateTag(CACHE_TAGS.profile(username), undefined as never)
        }
        revalidateTag(CACHE_TAGS.list(listId), undefined as never)

        return { success: true }
    })

export const addPoemToListAction = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
        poemId: z.string().uuid(),
        notes: z.string().trim().max(1000).optional(),
    }))
    .action(async ({ parsedInput: { listId, poemId, notes }, ctx: { supabase, user } }) => {
        // Find next item_order in the list
        const { data: maxItem } = await supabase
            .from('list_items')
            .select('item_order')
            .eq('list_id', listId)
            .order('item_order', { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextOrder = (maxItem?.item_order ?? -1) + 1;

        const { error } = await supabase
            .from('list_items')
            .insert({
                list_id: listId,
                poem_id: poemId,
                item_order: nextOrder,
                notes: notes || null
            })

        if (error) {
            if (error.code === '23505') {
                return { failure: 'Ce poème est déjà présent dans cette liste.' }
            }
            console.error('Failed to add poem to list:', error.message)
            return { failure: "Impossible d'ajouter le poème à la liste." }
        }

        const username = await getUsername(supabase, user);
        if (username) {
            revalidateTag(CACHE_TAGS.userLists(username), undefined as never)
        }
        revalidateTag(CACHE_TAGS.list(listId), undefined as never)
        revalidateTag(CACHE_TAGS.poemListsMembership(user.id, poemId), undefined as never)

        return { success: true }
    })

export const removePoemFromListAction = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
        poemId: z.string().uuid(),
    }))
    .action(async ({ parsedInput: { listId, poemId }, ctx: { supabase, user } }) => {
        const { error } = await supabase
            .from('list_items')
            .delete()
            .eq('list_id', listId)
            .eq('poem_id', poemId)

        if (error) {
            console.error('Failed to remove poem from list:', error.message)
            return { failure: 'Impossible de retirer le poème de la liste.' }
        }

        const username = await getUsername(supabase, user);
        if (username) {
            revalidateTag(CACHE_TAGS.userLists(username), undefined as never)
        }
        revalidateTag(CACHE_TAGS.list(listId), undefined as never)
        revalidateTag(CACHE_TAGS.poemListsMembership(user.id, poemId), undefined as never)

        return { success: true }
    })

export const updateListItemNotesAction = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
        poemId: z.string().uuid(),
        notes: z.string().trim().max(1000).optional().nullable(),
    }))
    .action(async ({ parsedInput: { listId, poemId, notes }, ctx: { supabase, user } }) => {
        const { error } = await supabase
            .from('list_items')
            .update({ notes: notes || null })
            .eq('list_id', listId)
            .eq('poem_id', poemId)

        if (error) {
            console.error('Failed to update poem notes:', error.message)
            return { failure: "Impossible d'enregistrer la note." }
        }

        revalidateTag(CACHE_TAGS.list(listId), undefined as never)
        return { success: true }
    })

export const reorderListItemsAction = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
        orderedPoemIds: z.array(z.string().uuid()),
    }))
    .action(async ({ parsedInput: { listId, orderedPoemIds }, ctx: { supabase, user } }) => {
        // Check list ownership
        const { data: list } = await supabase
            .from('lists')
            .select('id, slug')
            .eq('id', listId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (!list) {
            return { failure: 'Liste introuvable ou droits insuffisants.' }
        }

        // Perform parallel update of orders
        const updatePromises = orderedPoemIds.map((poemId, index) =>
            supabase
                .from('list_items')
                .update({ item_order: index })
                .eq('list_id', listId)
                .eq('poem_id', poemId)
        );

        const results = await Promise.all(updatePromises);
        const hasError = results.some(r => r.error);

        if (hasError) {
            console.error('Failed to reorder items in list')
            return { failure: 'Erreur lors du réordonnancement.' }
        }

        const username = await getUsername(supabase, user);
        if (username && list.slug) {
            revalidateTag(CACHE_TAGS.userList(username, list.slug), undefined as never)
        }
        revalidateTag(CACHE_TAGS.list(listId), undefined as never)

        return { success: true }
    })

export const toggleListLikeAction = authActionClient
    .schema(z.object({
        listId: z.string().uuid(),
        targetState: z.boolean(),
    }))
    .action(async ({ parsedInput: { listId, targetState }, ctx: { supabase, user } }) => {
        if (targetState) {
            const { error } = await supabase
                .from('list_likes')
                .upsert({ user_id: user.id, list_id: listId }, { onConflict: 'user_id, list_id' });

            if (error) {
                console.error('Failed to like list:', error.message)
                return { failure: 'Impossible de liker la liste.' }
            }
        } else {
            const { error } = await supabase
                .from('list_likes')
                .delete()
                .eq('user_id', user.id)
                .eq('list_id', listId);

            if (error) {
                console.error('Failed to unlike list:', error.message)
                return { failure: 'Impossible de retirer le like.' }
            }
        }

        revalidateTag(CACHE_TAGS.list(listId), undefined as never)
        return { success: true }
    })

export const fetchUserListsWithPoemStatusAction = authActionClient
    .schema(z.object({
        poemId: z.string().uuid(),
    }))
    .action(async ({ parsedInput: { poemId }, ctx: { supabase, user } }) => {
        const { data: lists, error } = await supabase
            .from('lists')
            .select('id, title, slug, is_public, is_ranked, poems_count')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error || !lists || lists.length === 0) {
            return { lists: [] };
        }

        const listIds = lists.map(l => l.id);
        const { data: memberships } = await supabase
            .from('list_items')
            .select('list_id, notes')
            .eq('poem_id', poemId)
            .in('list_id', listIds);

        const notesMap = new Map<string, string | null>();
        (memberships || []).forEach(m => {
            notesMap.set(m.list_id, m.notes ?? null);
        });

        return {
            lists: lists.map(l => ({
                ...l,
                containsPoem: notesMap.has(l.id),
                notes: notesMap.get(l.id) || null
            }))
        };
    })

export const fetchUserListsAction = actionClient
    .schema(z.object({
        username: z.string().min(1),
    }))
    .action(async ({ parsedInput: { username } }) => {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: profileUser } = await supabase
            .from('users')
            .select('id, username, avatar_url')
            .eq('username', username)
            .maybeSingle();

        if (!profileUser) {
            return { lists: [] };
        }

        const isOwner = user?.id === profileUser.id;

        if (isOwner) {
            const { getOwnerLists } = await import('@/utils/supabase/queries');
            const lists = await getOwnerLists(supabase, profileUser);
            return { lists: lists || [] };
        }

        const { getUserLists } = await import('@/utils/supabase/queries');
        const lists = await getUserLists(username);
        return { lists: lists || [] };
    })

// Backward compatibility aliases
export const createList = createListAction;
export const addToList = addPoemToListAction;


