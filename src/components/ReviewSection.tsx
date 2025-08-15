'use client'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Rating from './Rating'

interface Review {
  id: number
  content: string | null
  rating: number | null
  profiles: {
    username: string | null
  } | null
}

interface ReviewSectionProps {
  poemId: number
  user: User | null
  initialReviews: Review[]
}

export default function ReviewSection({ poemId, user, initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (isModalOpen && user) {
      const userReview = reviews.find(r => (r as any).user_id === user.id)
      if (userReview) {
        setContent(userReview.content || '')
        setRating(userReview.rating || null)
      } else {
        setContent('')
        setRating(null)
      }
    }
  }, [isModalOpen, user, reviews])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !rating) {
      setError("Une note est requise.")
      return
    }
    setIsSubmitting(true)
    setError(null)

    const { error } = await supabase
      .from('reviews')
      .upsert(
        { user_id: user.id, poem_id: poemId, content: content.trim(), rating: rating },
        { onConflict: 'user_id, poem_id' }
      )

    if (error) {
      setError(error.message)
    } else {
      setIsModalOpen(false)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Critiques</h2>
          {user && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm"
            >
              Ajouter une critique
            </button>
          )}
        </div>

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {review.profiles?.username || 'Utilisateur anonyme'}
                </p>
                {review.content && <p className="mt-2 text-gray-600 dark:text-gray-400">{review.content}</p>}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucune critique pour le moment. Soyez le premier !</p>
          )}
        </div>
      </div>

      {/* Modal pour ajouter/modifier une critique */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Votre avis</h3>
            <form onSubmit={handleSubmit}>
              <Rating rating={rating} setRating={setRating} hoverRating={hoverRating} setHoverRating={setHoverRating} />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre critique (optionnel)..."
                className="mt-4 w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              <div className="flex justify-end space-x-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm text-gray-600 dark:text-gray-400">Annuler</button>
                <button type="submit" disabled={isSubmitting || !rating} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}