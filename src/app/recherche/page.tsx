import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import SearchResultCard from '@/components/SearchResultCard'
import AuthorSearchResultCard from '@/components/AuthorSearchResultCard'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const query = searchParams?.q as string || ''
  const category = searchParams?.category as string || ''

  let results: any[] | null = []
  let error = null
  let pageTitle = ''

  if (category) {
    pageTitle = `Poèmes dans la catégorie "${category}"`
    const response = await supabase.rpc('get_poems_by_category', { category_name: category })
    
    results = response.data?.map(poem => ({
      ...poem,
      snippet: poem.content?.substring(0, 150) || ''
    })) || []
    
    error = response.error
  } else {
    pageTitle = `Résultats de recherche pour "${query}"`
    const response = await supabase.rpc('search_poems', { search_term: query })
    results = response.data
    error = response.error
  }

  const authors = category ? [] : results?.filter(r => r.type === 'author') || []
  const poems = category ? results : results?.filter(r => r.type === 'poem') || []

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {pageTitle}
        </h1>

        {error && <p className="text-red-500">Une erreur est survenue lors de la recherche.</p>}

        {!error && results && results.length > 0 ? (
          <div className="space-y-12">
            {authors.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Auteurs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {authors.map(result => (
                    <AuthorSearchResultCard key={result.id} result={result} />
                  ))}
                </div>
              </section>
            )}

            {poems.length > 0 && (
              <section>
                {!category && (
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Poèmes</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {poems.map(result => (
                    <SearchResultCard key={result.id} result={result} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Aucun résultat trouvé.
          </p>
        )}
      </main>
    </>
  )
}