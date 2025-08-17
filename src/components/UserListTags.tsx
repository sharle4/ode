import Link from 'next/link'
import { Bars4Icon } from '@heroicons/react/24/solid'

interface UserList {
  id: number
  name: string
}

interface UserListTagsProps {
  lists: UserList[]
}

export default function UserListTags({ lists }: UserListTagsProps) {
  if (!lists || lists.length === 0) {
    return null
  }

  return (
    <div className="flex items-start space-x-2 mt-4">
      <Bars4Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
      <div className="flex flex-wrap gap-2">
        {lists.map(list => (
          <Link key={list.id} href={`/listes/${list.id}`}>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-medium rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors">
              {list.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
