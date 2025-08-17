'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import RatingsChart from './RatingsChart'
import Rating from './Rating'
import ReviewSection from './ReviewSection'
import AddToListModal from './AddToListModal'

interface PoemData { title: string; authors: { name: string | null } | null; publication_date: string | null; source: string | null; }
interface ReviewData { id: number; content: string | null; rating: number | null; created_at: string; profiles: { username: string | null; avatar_url: string | null; } | null; }
interface StatsData { average_rating: number | null; reviews_count: number | null; }
interface DistributionData { rating_value: number; count: number; }

interface PoemInteractiveContentProps {
  poemId: number
  initialUser: User | null
  initialPoem: PoemData
  initialReviews: ReviewData[]
  initialStats: StatsData | null
  initialDistribution: DistributionData[]
}

export default function PoemInteractiveContent({ poemId, initialUser, initialPoem, initialReviews, initialStats, initialDistribution }: PoemInteractiveContentProps) {
  const supabase = createClient()
  const router = useRouter()

  const [user] = useState(initialUser)
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isListModalOpen, setIsListModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const userReview = initialReviews.find(r => (r as any).user_id === user.id)
      setRating(userReview?.rating || null)
      setContent(userReview?.content || '')
    }
  }, [user, initialReviews])

  const handleRatingOnly = async (newRating: number) => {
    if (!user) return;
    setRating(newRating);

    const { error } = await supabase.from('reviews').upsert({
      user_id: user.id,
      poem_id: poemId,
      rating: newRating,
    }, { onConflict: 'user_id, poem_id' });

    if (error) console.error("Erreur lors de la notation :", error);
    else router.refresh();
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !rating) {
      setError("Une note est requise.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const { error } = await supabase.from('reviews').upsert({
      user_id: user.id,
      poem_id: poemId,
      content: content.trim(),
      rating: rating,
    }, { onConflict: 'user_id, poem_id' });

    if (error) setError(error.message);
    else {
      setIsReviewModalOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  const averageRating = initialStats?.average_rating ? Math.round(initialStats.average_rating) / 2 : 0;
  const reviewsCount = initialStats?.reviews_count || 0;

  return (
    <>
      <div className="lg:col-span-2">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{initialPoem.title}</h1>
        <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">par {initialPoem.authors?.name || 'Auteur inconnu'}</p>
        <div className="mt-8 prose prose-lg dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{initialPoem.content}</p>
        </div>
        <ReviewSection reviews={initialReviews} />
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">À propos</h2>
            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li><strong>Auteur:</strong> {initialPoem.authors?.name || 'N/A'}</li>
              <li><strong>Recueil:</strong> {initialPoem.source || 'N/A'}</li>
              <li><strong>Publié en:</strong> {initialPoem.publication_date || 'N/A'}</li>
            </ul>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
            <div className="flex items-center">
              <span className="text-yellow-400 text-3xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">({reviewsCount} avis)</span>
            </div>
            <div className="mt-4">
              <RatingsChart data={initialDistribution} totalReviews={reviewsCount} />
            </div>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Votre avis</h2>
            <div className="mt-4">
              <Rating rating={rating} setRating={handleRatingOnly} hoverRating={hoverRating} setHoverRating={setHoverRating} />
            </div>
            {user && (
              <div className="flex space-x-2 mt-4">
                <button onClick={() => setIsReviewModalOpen(true)} className="w-full bg-transparent border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 py-2 px-4 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm">
                  Critiquer
                </button>
                <button onClick={() => setIsListModalOpen(true)} className="w-full bg-transparent border border-gray-400 text-gray-600 dark:border-gray-500 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
                  Ajouter à une liste
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour la critique */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Votre avis sur "{initialPoem.title}"</h3>
            <form onSubmit={handleSubmitReview}>
              <Rating rating={rating} setRating={setRating} hoverRating={hoverRating} setHoverRating={setHoverRating} />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre critique (optionnel)..."
                className="mt-4 w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              <div className="flex justify-end space-x-4 mt-4">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="text-sm text-gray-600 dark:text-gray-400">Annuler</button>
                <button type="submit" disabled={isSubmitting || !rating} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour les listes */}
      {isListModalOpen && <AddToListModal poemId={poemId} onClose={() => setIsListModalOpen(false)} />}
    </>
  )
}