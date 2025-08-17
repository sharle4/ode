import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'

interface Review {
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
  if (!review.poems) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <Link href={`/poemes/${review.poems.id}`}>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          {review.poems.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {review.poems.authors?.name || 'Auteur inconnu'}
      </p>
      
      <div className="flex items-center mt-2">
        {review.rating && Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            className={`w-5 h-5 ${
              (review.rating! / 2) > i
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>

      {review.content && (
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm italic border-l-2 border-gray-200 dark:border-gray-700 pl-3">
          "{review.content}"
        </p>
      )}
    </div>
  )
}
