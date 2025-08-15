'use client'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// On définit les types pour les props que le composant va recevoir
interface Review {
  id: number
  content: string | null
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
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || content.trim() === '') return
    setIsSubmitting(true)
    setError(null)

    // On met à jour la critique existante (upsert)
    const { data, error } = await supabase
      .from('reviews')
      .upsert(
        { user_id: user.id, poem_id: poemId, content: content.trim() },
        { onConflict: 'user_id, poem_id' }
      )
      .select('*, profiles(username)')
      .single()

    if (error) {
      setError(error.message)
      console.error("Erreur lors de la soumission de la critique:", error)
    } else {
      // On met à jour la liste des critiques localement pour un retour immédiat
      setReviews(currentReviews => {
        const existingReviewIndex = currentReviews.findIndex(r => r.id === data.id)
        if (existingReviewIndex > -1) {
          const updatedReviews = [...currentReviews]
          updatedReviews[existingReviewIndex] = data
          return updatedReviews
        }
        return [data, ...currentReviews]
      })
      setContent('')
      router.refresh() // Rafraîchit les données du serveur en arrière-plan
    }
    setIsSubmitting(false)
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Critiques</h2>
      
      {/* Formulaire de soumission */}
      {user && (
        <form onSubmit={handleSubmitReview} className="my-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez votre critique ici..."
            className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          />
          <div className="flex justify-end items-center mt-2">
            {error && <p className="text-sm text-red-500 mr-4">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting || content.trim() === ''}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      )}

      {/* Liste des critiques */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {review.profiles?.username || 'Utilisateur anonyme'}
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{review.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucune critique pour le moment. Soyez le premier !</p>
        )}
      </div>
    </div>
  )
}