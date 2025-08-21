'use client'

import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid'
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline'

interface StaticRatingProps {
  rating: number | null
  size?: 'sm' | 'md'
}

export default function StaticRating({ rating, size = 'sm' }: StaticRatingProps) {
  const ratingValue = (rating || 0) / 2
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const fullStars = Math.floor(ratingValue)
  const hasHalfStar = ratingValue % 1 !== 0

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        let fillPercentage = '0%';
        if (starIndex <= fullStars) {
          fillPercentage = '100%';
        } else if (starIndex === fullStars + 1 && hasHalfStar) {
          fillPercentage = '50%';
        }

        return (
          <div key={starIndex} className={`relative ${starSize} flex-shrink-0`}>
            <OutlineStarIcon className={`absolute text-gray-300 dark:text-gray-600 ${starSize}`} />
            
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: fillPercentage }}
            >
              <SolidStarIcon className={`text-yellow-400 ${starSize}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}