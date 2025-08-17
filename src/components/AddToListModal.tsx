'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

interface List {
  id: number
  name: string
  contains_poem: boolean
}

interface AddToListModalProps {
  poemId: number
  poemTitle: string
  onClose: () => void
}

export default function AddToListModal({ poemId, poemTitle, onClose }: AddToListModalProps) {
  const [lists, setLists] = useState<List[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newListName, setNewListName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchLists = async () => {
      const { data } = await supabase.rpc('get_user_lists_with_poem_status', {
        poem_id_param: poemId,
      })
      if (data) setLists(data)
      setIsLoading(false)
    }
    fetchLists()
  }, [poemId, supabase])

  const showConfirmation = (message: string) => {
    setConfirmation(message)
    setTimeout(() => {
      setConfirmation(null)
      onClose()
    }, 2000)
  }

  const handleTogglePoemInList = async (list: List) => {
    if (list.contains_poem) {
      await supabase.from('list_items').delete().match({ list_id: list.id, poem_id: poemId })
    } else {
      await supabase.from('list_items').insert({ list_id: list.id, poem_id: poemId })
      showConfirmation(`"${poemTitle}" ajouté à la liste "${list.name}".`)
    }
    setLists(lists.map(l => l.id === list.id ? { ...l, contains_poem: !l.contains_poem } : l))
  }

  const handleCreateList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newListName.trim() === '') return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: newList } = await supabase
      .from('lists')
      .insert({ name: newListName.trim(), user_id: user.id, is_public: isPublic })
      .select()
      .single()
    
    if (newList) {
      await supabase.from('list_items').insert({ list_id: newList.id, poem_id: poemId })
      showConfirmation(`"${poemTitle}" ajouté à la nouvelle liste "${newList.name}".`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        {confirmation ? (
          <div className="flex flex-col items-center justify-center h-48">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
            <p className="mt-4 text-center text-gray-800 dark:text-gray-200">{confirmation}</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-4">Ajouter à une liste</h3>
            <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
              {isLoading ? <p className="text-sm text-gray-500">Chargement...</p> : lists.map(list => (
                <div key={list.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-800 dark:text-gray-200">{list.name}</span>
                  <button onClick={() => handleTogglePoemInList(list)} className={`px-3 py-1 text-xs rounded-full ${list.contains_poem ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {list.contains_poem ? 'Retirer' : 'Ajouter'}
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleCreateList} className="mt-4">
              <input
                type="text"
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="Créer une nouvelle liste..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded" />
                  <span>Rendre publique</span>
                </label>
                <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 text-sm">
                  Créer et ajouter
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}