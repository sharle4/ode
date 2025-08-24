import Link from 'next/link'
import StaticRating from './StaticRating'
import { UserIcon } from '@heroicons/react/24/solid'

interface ActivityItem {
  activity_type: 'review' | 'list' | 'new_user'
  created_at: string
  username: string | null
  avatar_url: string | null
  item_id: number | null
  item_title: string | null
  review_rating: number | null
  review_content: string | null
  poem_author_name: string | null
}

interface ActivityCardProps {
  item: ActivityItem
}

export default function ActivityCard({ item }: ActivityCardProps) {
  const actionText = {
    review: 'a noté le poème',
    list: 'a créé la liste',
    new_user: 'a rejoint Ode'
  }[item.activity_type];

  const itemLink = {
    review: `/poemes/${item.item_id}`,
    list: `/listes/${item.item_id}`,
    new_user: `/profil/${item.username}`
  }[item.activity_type];

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3 mb-3">
        <Link href={`/profil/${item.username}`}>
          {item.avatar_url ? (
            <img src={item.avatar_url} alt={item.username || ''} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <Link href={`/profil/${item.username}`} className="font-semibold text-gray-800 dark:text-gray-200 hover:underline">
            {item.username}
          </Link>
          {' '}{actionText}
        </p>
      </div>

      {item.activity_type !== 'new_user' && (
        <div className="pl-13">
          <Link href={itemLink}>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {item.item_title}
            </h3>
          </Link>
          {item.activity_type === 'review' && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              par {item.poem_author_name}
            </p>
          )}
          
          {item.review_rating && (
            <div className="mt-2">
              <StaticRating rating={item.review_rating} size="md" />
            </div>
          )}

          {item.review_content && (
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm italic border-l-2 border-gray-200 dark:border-gray-700 pl-3 line-clamp-3">
              "{item.review_content}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}