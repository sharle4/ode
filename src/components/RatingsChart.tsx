'use client'

import { StarIcon } from '@heroicons/react/24/solid'

interface ChartData {
  rating_value: number
  count: number
}

interface RatingsChartProps {
  data: ChartData[]
  totalReviews: number
}

export default function RatingsChart({ data, totalReviews }: RatingsChartProps) {
  const fullDistribution = Array.from({ length: 10 }, (_, i) => {
    const ratingValue = 10 - i
    const ratingData = data.find(d => d.rating_value === ratingValue)
    return {
      rating: ratingValue / 2,
      count: ratingData ? Number(ratingData.count) : 0,
    }
  })

  const maxCount = Math.max(...fullDistribution.map(d => d.count), 1)

  return (
    <div className="space-y-1.5">
      {fullDistribution.map(({ rating, count }) => (
        <div key={rating} className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-6 text-right">
            {rating}
          </span>
          <StarIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}