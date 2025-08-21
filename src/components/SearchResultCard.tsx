import Link from 'next/link'

interface SearchResult {
  id: number
  title: string
  snippet: string 
  author_name: string
}

interface SearchResultCardProps {
  result: SearchResult
}

export default function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <Link href={`/poemes/${result.id}`}>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          {result.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        par {result.author_name}
      </p>
      <p 
        className="mt-3 text-gray-600 dark:text-gray-400 text-sm"
        dangerouslySetInnerHTML={{ __html: result.snippet || '' }} 
      />
    </div>
  )
}