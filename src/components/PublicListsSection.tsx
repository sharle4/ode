import Link from 'next/link'

interface PublicList {
  id: number
  name: string
  username: string | null
}

interface PublicListsSectionProps {
  lists: PublicList[]
}

export default function PublicListsSection({ lists }: PublicListsSectionProps) {
  if (!lists || lists.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dans les listes publiques
      </h2>
      <div className="space-y-4">
        {lists.map(list => (
          <div key={list.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <Link href={`/listes/${list.id}`}>
              <p className="font-semibold text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                {list.name}
              </p>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              par{' '}
              <Link href={`/profil/${list.username}`}>
                <span className="hover:underline">{list.username}</span>
              </Link>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}