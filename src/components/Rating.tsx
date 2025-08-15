'use client'

import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid'
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline'

interface RatingProps {
  rating: number | null
  setRating: (rating: number | null) => void
  hoverRating: number | null
  setHoverRating: (rating: number | null) => void
}

export default function Rating({ rating, setRating, hoverRating, setHoverRating }: RatingProps) {
  const displayRating = hoverRating ?? rating ?? 0

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fullStarValue = starIndex * 2
        const halfStarValue = starIndex * 2 - 1

        return (
          <div key={starIndex} className="relative cursor-pointer">
            <OutlineStarIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{
                width:
                  displayRating >= fullStarValue
                    ? '100%'
                    : displayRating >= halfStarValue
                    ? '50%'
                    : '0%',
              }}
            >
              <SolidStarIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <div
              className="absolute top-0 left-0 w-1/2 h-full"
              onMouseEnter={() => setHoverRating(halfStarValue)}
              onClick={() => setRating(halfStarValue)}
            />
            <div
              className="absolute top-0 right-0 w-1/2 h-full"
              onMouseEnter={() => setHoverRating(fullStarValue)}
              onClick={() => setRating(fullStarValue)}
            />
          </div>
        )
      })}
    </div>
  )
}
