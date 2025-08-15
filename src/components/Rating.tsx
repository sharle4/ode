'use client'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid'
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline'

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

  const displayRating = hoverRating ?? currentRating ?? 0

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">Notez ce poème :</p>
      <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fullStarValue = starIndex * 2
          const halfStarValue = starIndex * 2 - 1

          return (
            <div key={starIndex} className="relative cursor-pointer">
              {/* L'étoile de fond, toujours visible */}
              <OutlineStarIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              
              {/* L'étoile pleine, superposée et potentiellement coupée */}
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

              {/* Zones de clic invisibles pour la demi-étoile et l'étoile pleine */}
              <div
                className="absolute top-0 left-0 w-1/2 h-full"
                onMouseEnter={() => setHoverRating(halfStarValue)}
                onClick={() => handleRating(halfStarValue)}
                aria-label={`Noter ${halfStarValue / 2} étoiles`}
              />
              <div
                className="absolute top-0 right-0 w-1/2 h-full"
                onMouseEnter={() => setHoverRating(fullStarValue)}
                onClick={() => handleRating(fullStarValue)}
                aria-label={`Noter ${fullStarValue / 2} étoiles`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}