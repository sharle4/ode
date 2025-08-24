import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Bars3Icon } from '@heroicons/react/24/solid'

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
  isRanked: boolean
  isOwner: boolean
}

export default function PoemListCard({ poem, index, isRanked, isOwner }: PoemListCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: poem.id, disabled: !isRanked || !isOwner })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  }

  const snippet = poem.content?.split('\n').slice(0, 4).join('\n')

  return (
    <div ref={setNodeRef} style={style} className="flex space-x-4 items-center">
      {isRanked ? (
        <div className="flex-shrink-0 text-2xl font-bold text-gray-300 dark:text-gray-700 w-8 text-center">
          {index + 1}
        </div>
      ) : null}
      <div className="flex-grow bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center">
        <div className="flex-grow">
          <Link href={`/poemes/${poem.id}`}>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {poem.title}
            </h3>
          </Link>
          <Link href={`/auteurs/${encodeURIComponent(poem.authors?.name || '')}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
              {poem.authors?.name || 'Auteur inconnu'}
            </p>
          </Link>
          <Link href={`/poemes/${poem.id}`}>
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap italic line-clamp-2">
              {snippet}...
            </p>
          </Link>
        </div>
        {isRanked && isOwner && (
          <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing">
            <Bars3Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
    </div>
  )
}