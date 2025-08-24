import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import AuthorPoemRow from '@/components/AuthorPoemRow'
import StaticRating from '@/components/StaticRating'

export const dynamic = 'force-dynamic'

export default async function AuthorPage({ params }: { params: { name: string } }) {
  const supabase = createClient()
  const authorName = decodeURIComponent(params.name)

  const { data: pageData } = await supabase
    .rpc('get_author_details', { author_name_param: authorName })
    .single()

  if (!pageData || !pageData.author_data) {
    notFound()
  }

  const { author_data: author, poems_data: poems, stats_data: stats } = pageData
  const averageRating = stats?.average_rating ? Math.round(stats.average_rating) : 0
  const reviewsCount = stats?.reviews_count || 0

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{author.name}</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            {author.birth_date} - {author.death_date}
          </p>
          <div className="flex items-center space-x-4 mt-4">
            <StaticRating rating={averageRating} size="md" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Note moyenne sur {reviewsCount} avis
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Œuvres</h2>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              {poems && poems.length > 0 ? (
                poems.map((poem: any) => (
                  <AuthorPoemRow key={poem.id} poem={poem} />
                ))
              ) : (
                <p className="p-4 text-gray-500 dark:text-gray-400">Aucun poème de cet auteur n'a été trouvé.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Biographie</h2>
              <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400">
                <p>{author.bio || "Aucune biographie disponible pour le moment."}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
