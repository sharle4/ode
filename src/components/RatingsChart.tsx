'use client'

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
    const ratingValue = i + 1
    const ratingData = data.find(d => d.rating_value === ratingValue)
    return {
      count: ratingData ? Number(ratingData.count) : 0,
    }
  })

  const maxCount = Math.max(...fullDistribution.map(d => d.count), 1)

  return (
    <div className="flex items-end justify-center space-x-1 h-24 w-full">
      {fullDistribution.map((bar, index) => (
        <div
          key={index}
          className="w-full bg-indigo-600 rounded-sm"
          style={{ height: `${(bar.count / maxCount) * 100}%` }}
          title={`${bar.count} vote(s) pour ${ (index + 1) / 2 } étoiles`}
        />
      ))}
    </div>
  )
}