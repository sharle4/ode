'use client'

import { useState } from 'react'
import { updateListDetails } from '@/app/actions'
import { XMarkIcon, CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/24/solid'

interface List {
  id: number
  name: string
  description: string | null
  is_public: boolean
}

interface EditListModalProps {
  list: List
  onClose: () => void
}

export default function EditListModal({ list, onClose }: EditListModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const result = await updateListDetails(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setConfirmation("Liste mise à jour avec succès !")
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
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
          <h3 className="text-lg font-bold mb-4">Modifier la liste</h3>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="listId" value={list.id} />
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  defaultValue={list.name}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  name="description"
                  id="description"
                  defaultValue={list.description || ''}
                  rows={3}
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibilité</label>
                <label className="relative inline-flex items-center cursor-pointer mt-2">
                  <input type="checkbox" id="isPublic" name="isPublic" defaultChecked={list.is_public} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center">
                    <GlobeAltIcon className="w-4 h-4 mr-1" /> Publique
                  </span>
                </label>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
            <div className="flex justify-end space-x-4 mt-6">
              <button type="button" onClick={onClose} className="text-sm text-gray-600 dark:text-gray-400">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}