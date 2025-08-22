'use client'

import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import Link from 'next/link'
import PoemListCard from '@/components/PoemListCard'
import EditListModal from '@/components/EditListModal'
import { deleteList } from '@/app/actions'
import { GlobeAltIcon, LockClosedIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useEffect, useState, use } from 'react'
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
  poems: { id: number; title: string | null; content: string | null; authors: { name: string | null; } | null; } | null;
}

export default function ListPage({ params }: { params: { id: string } }) {
  const { id } = use(Promise.resolve(params));
  
  const [list, setList] = useState<ListData | null>(null)
  const [poems, setPoems] = useState<any[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: listData } = await supabase
        .from('lists')
        .select('*, profiles(username)')
        .eq('id', id)
        .single()
      
      if (!listData || (!listData.is_public && user?.id !== listData.user_id)) {
        setList(null)
        setIsLoading(false)
        return
      }
      setList(listData)

      const { data: listItems } = await supabase
        .from('list_items')
        .select('poems(*, authors(name))')
        .eq('list_id', id)
        .order('added_at', { ascending: true })
      
      setPoems(listItems?.map(item => item.poems).filter(Boolean) || [])
      setIsLoading(false)
    }
    fetchData()
  }, [id, supabase, router]);

  useEffect(() => {
    if (isEditModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isEditModalOpen]);

  const handleDelete = async () => {
    if (list && window.confirm(`Êtes-vous sûr de vouloir supprimer la liste "${list.name}" ?`)) {
      await deleteList(list.id)
    }
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    router.refresh()
  }

  if (isLoading) return <div>Chargement...</div>
  if (!list) return <div>Liste non trouvée ou accès refusé.</div>

  const isOwner = user?.id === list.user_id

  return (
    <>
      <Header />
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-filter duration-300 ${isEditModalOpen ? 'blur-sm' : ''}`}>
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
                <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-500">
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

        {poems.length > 0 ? (
          <div className="space-y-6">
            {poems.map((poem, index) => (
              <PoemListCard key={poem!.id} poem={poem as any} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Cette liste est vide pour le moment.</p>
        )}
      </main>

      {isEditModalOpen && <EditListModal list={list} onClose={handleCloseModal} />}
    </>
  )
}