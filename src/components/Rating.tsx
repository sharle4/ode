'use client'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'

interface RatingProps {
  poemId: number
  user: User | null
}

export default function Rating({ poemId, user }: RatingProps) {
  const [currentRating, setCurrentRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchRating = async () => {
      if (!user) return

      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('poem_id', poemId)
        .eq('user_id', user.id)
        .single()

      if (data) {
        setCurrentRating(data.rating)
      }
    }
    fetchRating()
  }, [user, poemId, supabase])

  const handleRating = async (ratingValue: number) => {
    if (!user || isSubmitting) return
    setIsSubmitting(true)

    const { error } = await supabase.from('reviews').upsert({
      user_id: user.id,
      poem_id: poemId,
      rating: ratingValue,
    }, { onConflict: 'user_id, poem_id' })

    if (!error) {
      setCurrentRating(ratingValue)
    } else {
      console.error("Erreur lors de la sauvegarde de la note:", error)
    }
    setIsSubmitting(false)
  }

  if (!user) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <a href="/login" className="underline">Connectez-vous</a> pour noter ce poème.
      </p>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">Notez ce poème :</p>
      <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
          const isHalf = value % 2 !== 0
          const starValue = Math.ceil(value / 2)
          
          return (
            <div
              key={value}
              className="relative cursor-pointer"
              onMouseEnter={() => setHoverRating(value)}
              onClick={() => handleRating(value)}
            >
              <StarIcon
                className={`w-8 h-8 ${
                  (hoverRating ?? currentRating ?? 0) >= value
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                } transition-colors`}
                style={{
                  clipPath: isHalf
                    ? 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)'
                    : 'none',
                  transform: isHalf ? 'translateX(50%)' : 'none',
                  marginLeft: isHalf ? '-1rem' : '0',
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}