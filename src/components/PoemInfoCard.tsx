'use client'

import type { User } from '@supabase/supabase-js'
import RatingsChart from './RatingsChart'
import Rating from './Rating'
import UserListTags from './UserListTags'

interface PoemData { title: string; authors: { name: string | null } | null; publication_date: string | null; source: string | null; categories: string[] | null; }
interface StatsData { average_rating: number | null; reviews_count: number | null; }
interface DistributionData { rating_value: number; count: number; }
interface UserListData { id: number; name: string; }

interface PoemInfoCardProps {
  poem: PoemData
  stats: StatsData | null
  distribution: DistributionData[]
  user: User | null
  userLists: UserListData[]
  onRate: (newRating: number) => void
  userRating: number | null
  onCritique: () => void
  onAddToList: () => void
}

export default function PoemInfoCard({ poem, stats, distribution, user, userLists, onRate, userRating, onCritique, onAddToList }: PoemInfoCardProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  
  const averageRating = stats?.average_rating ? Math.round(stats.average_rating) / 2 : 0;
  const reviewsCount = stats?.reviews_count || 0;

  return (
    <div className="sticky top-24">
      <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{poem.title}</h2>
        <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <li><strong>Auteur:</strong> {poem.authors?.name || 'N/A'}</li>
          <li><strong>Recueil:</strong> {poem.source || 'N/A'}</li>
          {poem.categories && poem.categories.length > 0 && (
            <li>
              <strong>Catégories:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {poem.categories.map(cat => (
                  <span key={cat} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </li>
          )}
        </ul>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <div className="flex items-center">
          <span className="text-yellow-400 text-3xl font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">({reviewsCount} avis)</span>
        </div>
        <div className="mt-4">
          <RatingsChart data={distribution} totalReviews={reviewsCount} />
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Votre avis</h2>
        <div className="mt-4">
          <Rating rating={userRating} setRating={onRate} hoverRating={hoverRating} setHoverRating={setHoverRating} />
        </div>
        <UserListTags lists={userLists} />
        {user && (
          <div className="flex space-x-2 mt-4">
            <button onClick={onCritique} className="w-full bg-transparent border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 py-2 px-4 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm">
              Critiquer
            </button>
            <button onClick={onAddToList} className="w-full bg-transparent border border-gray-400 text-gray-600 dark:border-gray-500 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
              Ajouter à une liste
            </button>
          </div>
        )}
      </div>
    </div>
  )
}