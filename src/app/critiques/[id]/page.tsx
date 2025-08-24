import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import StaticRating from '@/components/StaticRating'
import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/solid'

export const dynamic = 'force-dynamic'

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pageData } = await supabase
    .rpc('get_review_details', {
      review_id_param: parseInt(id),
      user_id_param: user?.id,
    })
    .single()

  if (!pageData || !pageData.review_data || !pageData.poem_data) {
    notFound()
  }

  const { review_data: review, poem_data: poem, comments_data: comments, likes_data: likes } = pageData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2">
            <div className="flex space-x-4">
              <Link href={`/profil/${review.profiles?.username}`} className="flex-shrink-0">
                {review.profiles?.avatar_url ? (
                  <img src={review.profiles.avatar_url} alt={review.profiles.username || ''} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </Link>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Critique par{' '}
                  <Link href={`/profil/${review.profiles?.username}`} className="font-semibold text-gray-800 dark:text-gray-200 hover:underline">
                    {review.profiles?.username}
                  </Link>
                </p>
                <StaticRating rating={review.rating} size="md" />
              </div>
            </div>
            {review.content && (
              <div className="mt-6 prose prose-lg dark:prose-invert max-w-none">
                <p>{review.content}</p>
              </div>
            )}
            <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              Publiée le {formatDate(review.created_at)}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Commentaires ({comments?.length || 0})
              </h2>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{poem.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">par {poem.authors.name}</p>
                </div>
                <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <p className="text-sm text-gray-500">Infos du poème</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}