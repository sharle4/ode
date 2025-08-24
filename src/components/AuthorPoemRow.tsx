import Link from 'next/link'

interface Poem {
  id: number
  title: string
  publication_date: string | null
}

interface AuthorPoemRowProps {
  poem: Poem
}

export default function AuthorPoemRow({ poem }: AuthorPoemRowProps) {
  return (
    <Link href={`/poemes/${poem.id}`}>
      <div className="block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{poem.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{poem.publication_date}</p>
        </div>
      </div>
    </Link>
  )
}