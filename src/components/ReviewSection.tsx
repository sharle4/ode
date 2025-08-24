'use client'

import Link from 'next/link'
import StaticRating from './StaticRating'
import ReviewInteractions from './ReviewInteractions'
import type { User } from '@supabase/supabase-js'

interface Review {
  id: number
  content: string | null
  rating: number | null
  created_at: string
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
  review_likes: { count: number }[]
  review_comments: { count: number }[]
  user_has_liked: { count: number }[]
}

interface ReviewSectionProps {
  reviews: Review[]
  user: User | null
}

const UserIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export default function ReviewSection({ reviews, user }: ReviewSectionProps) {
  
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
          reviews.map((review) => {
            const likesCount = review.review_likes[0]?.count || 0
            const commentsCount = review.review_comments[0]?.count || 0
            const isLikedByUser = (review.user_has_liked[0]?.count || 0) > 0

            return (
              <div key={review.id} className="flex space-x-4">
                <Link href={`/profil/${review.profiles?.username}`} className="flex-shrink-0">
                  {review.profiles?.avatar_url ? (
                    <img src={review.profiles.avatar_url} alt={review.profiles.username || ''} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </Link>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/profil/${review.profiles?.username}`}>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                          {review.profiles?.username || 'Utilisateur anonyme'}
                        </p>
                      </Link>
                      <div className="mt-1">
                        <StaticRating rating={review.rating} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  {review.content && <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{review.content}</p>}
                  <div className="mt-4">
                    <ReviewInteractions
                      reviewId={review.id}
                      initialLikesCount={likesCount}
                      initialCommentsCount={commentsCount}
                      isLikedByUser={isLikedByUser}
                      isLoggedIn={!!user}
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucune critique pour le moment. Soyez le premier !</p>
        )}
      </div>
    </div>
  )
}