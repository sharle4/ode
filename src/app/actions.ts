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
  const isRanked = formData.get('isRanked') === 'on' // On récupère la nouvelle valeur

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { error } = await supabase
    .from('lists')
    .update({ name, description, is_public: isPublic, is_ranked: isRanked }) // On met à jour is_ranked
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

  redirect(`/profil/${list.profiles?.username}`)
}

export async function reorderListItems(listId: number, poemIds: number[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentification requise.' }

  const { data: list } = await supabase.from('lists').select('user_id').eq('id', listId).single()
  if (!list || list.user_id !== user.id) {
    return { error: 'Permission refusée.' }
  }

  const updates = poemIds.map((poemId, index) => ({
    list_id: listId,
    poem_id: poemId,
    position: index + 1,
  }))

  const { error } = await supabase.from('list_items').upsert(updates)

  if (error) {
    console.error(error)
    return { error: 'Erreur lors de la réorganisation.' }
  }

  revalidatePath(`/listes/${listId}`)
  return { success: true }
}