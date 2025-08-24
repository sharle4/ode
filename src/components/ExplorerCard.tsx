import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/solid'

interface ExplorerCardProps {
  type: 'poem' | 'author'
  id: number | string
  title: string
  subtitle: string
  imageUrl?: string | null
}

export default function ExplorerCard({ type, id, title, subtitle, imageUrl }: ExplorerCardProps) {
  const link = type === 'poem' ? `/poemes/${id}` : `/auteurs/${encodeURIComponent(id as string)}`

  return (
    <Link href={link}>
      <div className="group relative bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex-grow">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-32 object-cover rounded-md mb-4" />
          ) : (
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center">
              {type === 'author' && <UserIcon className="w-12 h-12 text-gray-400" />}
            </div>
          )}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  )
}