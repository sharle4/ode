import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/solid'

interface AuthorResult {
  id: number
  title: string
}

interface AuthorSearchResultCardProps {
  result: AuthorResult
}

export default function AuthorSearchResultCard({ result }: AuthorSearchResultCardProps) {
  return (
    <Link href={`/auteurs/${encodeURIComponent(result.title)}`}>
      <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {result.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Auteur</p>
        </div>
      </div>
    </Link>
  )
}