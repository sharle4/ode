'use client'

import Link from 'next/link'
import PoemListCard from '@/components/PoemListCard'
import EditListModal from '@/components/EditListModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import { deleteList } from '@/app/actions'
import { GlobeAltIcon, LockClosedIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface ListData {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setList(initialList)
  }, [initialList])

  const isOwner = initialUser?.id === list.user_id
  const isModalOpen = isEditModalOpen || isDeleteModalOpen

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isModalOpen]);

  const handleDelete = async () => {
    await deleteList(list.id)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    router.refresh()
  }

  return (
    <>
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

          {initialPoems.length > 0 ? (
            <div className="space-y-6">
              {initialPoems.map((poem, index) => (
                <PoemListCard key={poem!.id} poem={poem as any} index={index} />
              ))}
            </div>
          ) : (
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