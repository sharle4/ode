import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Link from 'next/link'
import ExplorerCard from '@/components/ExplorerCard'

export const dynamic = 'force-dynamic'

export default async function ExplorerPage() {
  const supabase = createClient()

  const [
    { data: popularPoems },
    { data: allCategories }
  ] = await Promise.all([
    supabase.rpc('get_popular_poems', { limit_count: 4 }),
    supabase.rpc('get_all_categories')
  ])

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          Explorer
        </h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Poèmes Populaires
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularPoems?.map(poem => (
              <ExplorerCard
                key={poem.id}
                type="poem"
                id={poem.id}
                title={poem.title}
                subtitle={poem.author_name}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Explorer par Thèmes
          </h2>
          <div className="flex flex-wrap gap-3">
            {allCategories?.map(cat => (
              <Link key={cat.category} href={`/recherche?q=${encodeURIComponent(cat.category)}`}>
                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                  {cat.category}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
