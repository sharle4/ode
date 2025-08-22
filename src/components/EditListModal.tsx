'use client'

import { useState } from 'react'
import { updateListDetails } from '@/app/actions'
import { XMarkIcon } from '@heroicons/react/24/solid'

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
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
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
            <div className="flex items-center">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                defaultChecked={list.is_public}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Rendre cette liste publique</label>
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
      </div>
    </div>
  )
}