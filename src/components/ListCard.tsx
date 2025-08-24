import Link from 'next/link'
import { LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/solid'

interface List {
  id: number
  name: string
  description: string | null
  is_public: boolean
  poem_count: number
}

interface ListCardProps {
  list: List
}

export default function ListCard({ list }: ListCardProps) {
  const poemCountText = `${list.poem_count} poème${list.poem_count !== 1 ? 's' : ''}`

  return (
    <Link href={`/listes/${list.id}`}>
      <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            {list.is_public ? (
              <GlobeAltIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <LockClosedIcon className="w-4 h-4 text-gray-400" />
            )}
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {list.name}
            </h3>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {list.description || "Aucune description"}
          </p>
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          {poemCountText}
        </p>
      </div>
    </Link>
  )
}