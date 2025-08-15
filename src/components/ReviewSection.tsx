'use client'

import { StarIcon } from '@heroicons/react/24/solid'

interface Review {
  id: number
  content: string | null
  rating: number | null
  created_at: string
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
}

interface ReviewSectionProps {
  reviews: Review[]
}

const UserIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export default function ReviewSection({ reviews }: ReviewSectionProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Critiques</h2>
      <div className="space-y-8">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                {review.profiles?.avatar_url ? (
                  <img src={review.profiles.avatar_url} alt={review.profiles.username || ''} className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {review.profiles?.username || 'Utilisateur anonyme'}
                    </p>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            review.rating && (review.rating / 2) > i
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                    {formatDate(review.created_at)}
                  </p>
                </div>
                {review.content && <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{review.content}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucune critique pour le moment. Soyez le premier !</p>
        )}
      </div>
    </div>
  )
}
