import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ReviewCard from '@/components/ReviewCard'
import ListCard from '@/components/ListCard'
import { UserIcon } from '@heroicons/react/24/solid'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { username } = params

  const { data: { user: loggedInUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const isOwnProfile = loggedInUser?.id === profile.id

  const { data: listsData } = await supabase.rpc('get_lists_with_poem_count', {
    profile_id_param: profile.id,
  })
  
  const lists = isOwnProfile ? listsData : listsData?.filter(list => list.is_public)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, poems(*, authors(name))')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-gray-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Dernières critiques
          </h2>
          {reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <ReviewCard key={index} review={review as any} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {profile.username} n'a pas encore écrit de critique.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Listes
          </h2>
          {lists && lists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {profile.username} n'a pas encore créé de liste.
            </p>
          )}
        </div>
      </main>
    </>
  )
}