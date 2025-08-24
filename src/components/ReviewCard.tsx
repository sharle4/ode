'use client'

import Link from 'next/link'
import StaticRating from './StaticRating'
import { useRouter } from 'next/navigation'

interface Review {
  id: number
  rating: number | null
  content: string | null
  poems: {
    id: number
    title: string | null
    authors: {
      name: string | null
    } | null
  } | null
}

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const router = useRouter()

  if (!review.poems || !review.poems.authors) {
    return null
  }

  const handleCardClick = () => {
    if (review.content) {
      router.push(`/critiques/${review.id}`)
    } else {
      router.push(`/poemes/${review.poems.id}`)
    }
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full cursor-pointer group transition-all duration-300 hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-1"
    >
      <div className="flex-grow">
        <Link href={`/poemes/${review.poems.id}`} onClick={stopPropagation}>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {review.poems.title}
          </h3>
        </Link>
        <Link href={`/auteurs/${encodeURIComponent(review.poems.authors.name || '')}`} onClick={stopPropagation}>
          <p className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
            {review.poems.authors.name || 'Auteur inconnu'}
          </p>
        </Link>
        
        <div className="mt-2">
          <StaticRating rating={review.rating} size="md" />
        </div>

        {review.content && (
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm italic border-l-2 border-gray-200 dark:border-gray-700 pl-3 line-clamp-4">
            "{review.content}"
          </p>
        )}
      </div>
    </div>
  )
}