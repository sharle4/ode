import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import SearchResultCard from '@/components/SearchResultCard'

export const dynamic = 'force-dynamic'

// La page reçoit les paramètres de recherche depuis l'URL
export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const query = searchParams?.q as string || ''

  const { data: results, error } = await supabase.rpc('search_poems', {
    search_term: query,
  })

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Résultats de recherche pour "{query}"
        </h1>

        {error && <p className="text-red-500">Une erreur est survenue lors de la recherche.</p>}

        {results && results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(result => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Aucun résultat trouvé pour votre recherche.
          </p>
        )}
      </main>
    </>
  )
}