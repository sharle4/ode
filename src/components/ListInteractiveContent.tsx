'use client'

import Link from 'next/link'
import PoemListCard from '@/components/PoemListCard'
import EditListModal from '@/components/EditListModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import { deleteList, reorderListItems } from '@/app/actions'
import { GlobeAltIcon, LockClosedIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { useState, useEffect, useTransition } from 'react'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'

interface ListData {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  is_ranked: boolean;
  user_id: string;
  profiles: { username: string | null; } | null;
}
interface PoemItem {
  id: number;
  title: string | null;
  content: string | null;
  authors: { name: string | null; } | null;
}

interface ListInteractiveContentProps {
  initialList: ListData
  initialPoems: PoemItem[]
  initialUser: User | null
}

export default function ListInteractiveContent({ initialList, initialPoems, initialUser }: ListInteractiveContentProps) {
  const [list, setList] = useState(initialList)
  const [poems, setPoems] = useState(initialPoems)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)
  const [hasOrderChanged, setHasOrderChanged] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setList(initialList)
    setPoems(initialPoems)
  }, [initialList, initialPoems])

  const isOwner = initialUser?.id === list.user_id
  const isModalOpen = isEditModalOpen || isDeleteModalOpen

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isModalOpen]);

  const showConfirmation = (message: string) => {
    setConfirmationMessage(message)
    setTimeout(() => setConfirmationMessage(null), 3000)
  }

  const handleDelete = async () => {
    setIsDeleteModalOpen(false)
    const result = await deleteList(list.id)
    if (result.success && result.username) {
      router.push(`/profil/${result.username}`)
      showConfirmation("Liste supprimée avec succès !")
    } else {
      alert(result.error || "Une erreur est survenue lors de la suppression.")
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    router.refresh()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = poems.findIndex((p) => p.id === active.id)
      const newIndex = poems.findIndex((p) => p.id === over.id)
      const newOrder = arrayMove(poems, oldIndex, newIndex)
      
      setPoems(newOrder)
      setHasOrderChanged(true)
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    const poemIds = poems.map(p => p.id)
    const result = await reorderListItems(list.id, poemIds)
    
    if (result.success) {
      setHasOrderChanged(false)
      showConfirmation("Classement sauvegardé !")
    } else {
      alert(result.error || "Une erreur est survenue lors de la sauvegarde.")
    }
    setIsSaving(false)
  }

  return (
    <>
      <div 
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          confirmationMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'
        }`}
      >
        <div className="bg-green-100 dark:bg-green-900/70 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>{confirmationMessage}</span>
        </div>
      </div>

      <div className={`transition-filter duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {list.is_public ? <GlobeAltIcon className="w-6 h-6 text-gray-400" /> : <LockClosedIcon className="w-6 h-6 text-gray-400" />}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{list.name}</h1>
              </div>
              {isOwner && (
                <div className="flex items-center space-x-2">
                  {list.is_ranked && hasOrderChanged && (
                    <button 
                      onClick={handleSaveChanges} 
                      disabled={isSaving}
                      className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm disabled:bg-indigo-400"
                    >
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  )}
                  <button onClick={() => setIsEditModalOpen(true)} className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-500">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Une liste par{' '}
              <Link href={`/profil/${list.profiles?.username}`} className="font-semibold hover:underline">
                {list.profiles?.username}
              </Link>
            </p>
            {list.description && <p className="mt-4 text-gray-500 dark:text-gray-300 max-w-2xl">{list.description}</p>}
          </div>

          {isMounted ? (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={poems} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                  {poems.map((poem, index) => (
                    <PoemListCard key={poem.id} poem={poem} index={index} isRanked={list.is_ranked} isOwner={isOwner} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-6">
              {poems.map((poem, index) => (
                <PoemListCard key={poem.id} poem={poem} index={index} isRanked={list.is_ranked} isOwner={isOwner} />
              ))}
            </div>
          )}

          {poems.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">Cette liste est vide pour le moment.</p>
          )}
        </main>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <EditListModal list={list} onClose={handleCloseEditModal} />
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <ConfirmationModal
            title="Supprimer la liste"
            message={`Êtes-vous sûr de vouloir supprimer la liste "${list.name}" ? Cette action est irréversible.`}
            onConfirm={handleDelete}
            onClose={() => setIsDeleteModalOpen(false)}
          />
        </div>
      )}
    </>
  )
}