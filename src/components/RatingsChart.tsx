'use client'

import { useState } from 'react'

interface ChartData {
  rating_value: number
  count: number
}

interface RatingsChartProps {
  data: ChartData[]
  totalReviews: number
}

export default function RatingsChart({ data, totalReviews }: RatingsChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const fullDistribution = Array.from({ length: 10 }, (_, i) => {
    const ratingValue = i + 1
    const ratingData = data.find(d => d.rating_value === ratingValue)
    return {
      count: ratingData ? Number(ratingData.count) : 0,
    }
  })

  const maxCount = Math.max(...fullDistribution.map(d => d.count), 1)

  return (
    <div 
      className="flex items-end justify-center space-x-1 h-24 w-full relative"
      onMouseLeave={() => setHoveredBar(null)}
    >
      {fullDistribution.map((bar, index) => {
        const ratingValue = (index + 1) / 2
        const percentage = totalReviews > 0 ? ((bar.count / totalReviews) * 100).toFixed(0) : 0

        return (
          <div
            key={index}
            className="w-full h-full flex items-end"
            onMouseEnter={() => setHoveredBar(index)}
          >
            <div
              className="w-full bg-indigo-600 rounded-sm transition-colors duration-200"
              style={{ height: `${(bar.count / maxCount) * 100}%` }}
            />
            {hoveredBar === index && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap">
                {bar.count} vote{bar.count > 1 ? 's' : ''} ({percentage}%)
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 dark:border-t-gray-900" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}