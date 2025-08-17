import Link from 'next/link'

interface Poem {
  id: number
  title: string | null
  content: string | null
  authors: {
    name: string | null
  } | null
}

interface PoemListCardProps {
  poem: Poem
  index: number
}

export default function PoemListCard({ poem, index }: PoemListCardProps) {
  const snippet = poem.content?.split('\n').slice(0, 4).join('\n')

  return (
    <div className="flex space-x-4">
      <div className="flex-shrink-0 text-2xl font-bold text-gray-300 dark:text-gray-700 w-8 text-center">
        {index + 1}
      </div>
      <div className="flex-grow bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <Link href={`/poemes/${poem.id}`}>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {poem.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {poem.authors?.name || 'Auteur inconnu'}
        </p>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap italic">
          {snippet}...
        </p>
      </div>
    </div>
  )
}