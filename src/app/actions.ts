'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateListDetails(formData: FormData) {
  const supabase = createClient()

  const listId = formData.get('listId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const isPublic = formData.get('isPublic') === 'on'
  const isRanked = formData.get('isRanked') === 'on'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { error } = await supabase
    .from('lists')
    .update({ name, description, is_public: isPublic, is_ranked: isRanked })
    .eq('id', listId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erreur lors de la mise à jour de la liste.' }
  }

  revalidatePath(`/listes/${listId}`)
  return { success: true }
}

export async function deleteList(listId: number) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { data: list } = await supabase.from('lists').select('user_id, profiles(username)').eq('id', listId).single();
  if (!list || list.user_id !== user.id) {
    return { error: 'Permission refusée.' }
  }

  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId)

  if (error) {
    return { error: 'Erreur lors de la suppression de la liste.' }
  }

  revalidatePath(`/profil/${list.profiles?.username}`)
  return { success: true, username: list.profiles?.username }
}

export async function reorderListItems(listId: number, poemIds: number[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { data: list } = await supabase.from('lists').select('user_id').eq('id', listId).single()
  if (!list || list.user_id !== user.id) {
    return { error: 'Permission refusée.' }
  }

  const { error } = await supabase.rpc('update_list_order', {
    list_id_param: listId,
    poem_ids_param: poemIds,
  })

  if (error) {
    console.error("Erreur RPC reorderListItems:", error)
    return { error: 'Erreur lors de la réorganisation.' }
  }

  revalidatePath(`/listes/${listId}`)
  return { success: true }
}

export async function followUser(profileIdToFollow: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { error } = await supabase
    .from('followers')
    .insert({ follower_id: user.id, following_id: profileIdToFollow })

  if (error) {
    console.error(error)
    return { error: 'Erreur lors du suivi.' }
  }

  revalidatePath(`/profil/${(await supabase.from('profiles').select('username').eq('id', profileIdToFollow).single()).data?.username}`)
  return { success: true }
}

export async function unfollowUser(profileIdToUnfollow: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', profileIdToUnfollow)

  if (error) {
    console.error(error)
    return { error: 'Erreur lors du désabonnement.' }
  }
  
  revalidatePath(`/profil/${(await supabase.from('profiles').select('username').eq('id', profileIdToUnfollow).single()).data?.username}`)
  return { success: true }
}

export async function likeReview(reviewId: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { error } = await supabase
    .from('review_likes')
    .insert({ review_id: reviewId, user_id: user.id })

  if (error) {
    console.error(error)
    return { error: 'Erreur lors du like.' }
  }

  revalidatePath('/poemes/[id]', 'page')
  return { success: true }
}

export async function unlikeReview(reviewId: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { error } = await supabase
    .from('review_likes')
    .delete()
    .eq('review_id', reviewId)
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    return { error: "Erreur lors de l'unlike." }
  }

  revalidatePath('/poemes/[id]', 'page')
  return { success: true }
}