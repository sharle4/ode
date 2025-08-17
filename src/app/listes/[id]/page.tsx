import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import PoemListCard from '@/components/PoemListCard'
import { GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/solid'

export const dynamic = 'force-dynamic'

export default async function ListPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  const { data: list } = await supabase
    .from('lists')
    .select(`
      name,
      description,
      is_public,
      user_id,
      profiles ( username )
    `)
    .eq('id', id)
    .single()

  if (!list) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === list.user_id
  
  if (!list.is_public && !isOwner) {
    notFound()
  }

  const { data: listItems } = await supabase
    .from('list_items')
    .select(`
      poems (
        id,
        title,
        content,
        authors ( name )
      )
    `)
    .eq('list_id', id)
    .order('added_at', { ascending: true })

  const poems = listItems?.map(item => item.poems).filter(Boolean) || []

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la liste */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            {list.is_public ? (
              <GlobeAltIcon className="w-6 h-6 text-gray-400" />
            ) : (
              <LockClosedIcon className="w-6 h-6 text-gray-400" />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{list.name}</h1>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Une liste par{' '}
            <Link href={`/profil/${list.profiles?.username}`} className="font-semibold hover:underline">
              {list.profiles?.username}
            </Link>
          </p>
          {list.description && (
            <p className="mt-4 text-gray-500 dark:text-gray-300 max-w-2xl">{list.description}</p>
          )}
        </div>

        {/* Contenu de la liste */}
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
    </>
  )
}