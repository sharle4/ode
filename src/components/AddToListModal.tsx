'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface List {
  id: number
  name: string
  contains_poem: boolean
}

interface AddToListModalProps {
  poemId: number
  onClose: () => void
}

export default function AddToListModal({ poemId, onClose }: AddToListModalProps) {
  const [lists, setLists] = useState<List[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newListName, setNewListName] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchLists = async () => {
      const { data, error } = await supabase.rpc('get_user_lists_with_poem_status', {
        poem_id_param: poemId,
      })
      if (data) setLists(data)
      setIsLoading(false)
    }
    fetchLists()
  }, [poemId, supabase])

  const handleTogglePoemInList = async (listId: number, containsPoem: boolean) => {
    if (containsPoem) {
      await supabase.from('list_items').delete().match({ list_id: listId, poem_id: poemId })
    } else {
      await supabase.from('list_items').insert({ list_id: listId, poem_id: poemId })
    }
    setLists(lists.map(list => list.id === listId ? { ...list, contains_poem: !containsPoem } : list))
  }

  const handleCreateList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newListName.trim() === '') return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: newList, error } = await supabase
      .from('lists')
      .insert({ name: newListName.trim(), user_id: user.id })
      .select()
      .single()
    
    if (newList) {
      await handleTogglePoemInList(newList.id, false)
      setNewListName('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Ajouter à une liste</h3>
        
        {/* Liste des listes existantes */}
        <div className="max-h-60 overflow-y-auto pr-2">
          {isLoading ? <p>Chargement...</p> : lists.map(list => (
            <div key={list.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-800 dark:text-gray-200">{list.name}</span>
              <button onClick={() => handleTogglePoemInList(list.id, list.contains_poem)} className={`px-3 py-1 text-xs rounded-full ${list.contains_poem ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {list.contains_poem ? 'Ajouté' : 'Ajouter'}
              </button>
            </div>
          ))}
        </div>

        {/* Formulaire de création de liste */}
        <form onSubmit={handleCreateList} className="mt-4">
          <input
            type="text"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            placeholder="Créer une nouvelle liste..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="w-full mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
            Créer et ajouter
          </button>
        </form>
      </div>
    </div>
  )
}
