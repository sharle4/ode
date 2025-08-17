'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import RatingsChart from './RatingsChart'
import Rating from './Rating'
import ReviewSection from './ReviewSection'
import AddToListModal from './AddToListModal'
import UserListTags from './UserListTags'
import PublicListsSection from './PublicListsSection'
import { XMarkIcon } from '@heroicons/react/24/solid'

interface PoemData { title: string; authors: { name: string | null } | null; publication_date: string | null; source: string | null; content: string; categories: string[] | null; }
interface ReviewData { id: number; content: string | null; rating: number | null; created_at: string; profiles: { username: string | null; avatar_url: string | null; } | null; }
interface StatsData { average_rating: number | null; reviews_count: number | null; }
interface DistributionData { rating_value: number; count: number; }
interface UserListData { id: number; name: string; }
interface PublicListData { id: number; name: string; username: string | null; }

interface PoemInteractiveContentProps {
  poemId: number
  initialUser: User | null
  initialPoem: PoemData
  initialReviews: ReviewData[]
  initialStats: StatsData | null
  initialDistribution: DistributionData[]
  initialUserLists: UserListData[]
  initialPublicLists: PublicListData[]
}

export default function PoemInteractiveContent({ poemId, initialUser, initialPoem, initialReviews, initialStats, initialDistribution, initialUserLists, initialPublicLists }: PoemInteractiveContentProps) {
  const supabase = createClient()
  const router = useRouter()

  const [user] = useState(initialUser)
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isReviewModalOpen || isListModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isReviewModalOpen, isListModalOpen]);

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

  const isModalActive = isReviewModalOpen || isListModalOpen;

  const closeModal = () => {
    setIsReviewModalOpen(false);
    setIsListModalOpen(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full">
        <div className={`lg:col-span-2 transition-filter duration-300 ${isModalActive ? 'blur-sm' : ''}`}>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{initialPoem.title}</h1>
          <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">par {initialPoem.authors?.name || 'Auteur inconnu'}</p>
          <div className="mt-8 prose prose-lg dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{initialPoem.content}</p>
          </div>
          <ReviewSection reviews={initialReviews} />
          <PublicListsSection lists={initialPublicLists} />
        </div>

        <div className={`lg:col-span-1 transition-filter duration-300 ${isModalActive ? 'blur-sm' : ''}`}>
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{initialPoem.title}</h2>
              <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                <li><strong>Auteur:</strong> {initialPoem.authors?.name || 'N/A'}</li>
                <li><strong>Recueil:</strong> {initialPoem.source || 'N/A'}</li>
                {initialPoem.categories && initialPoem.categories.length > 0 && (
                  <li>
                    <strong>Catégories:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {initialPoem.categories.map(cat => (
                        <span key={cat} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </li>
                )}
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
              <UserListTags lists={initialUserLists} />
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
      </div>

      {/* Section des Modals */}
      <div 
        className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isModalActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModal}
      >
        {isReviewModalOpen && (
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
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
        )}
        {isListModalOpen && <AddToListModal poemId={poemId} poemTitle={initialPoem.title} onClose={() => setIsListModalOpen(false)} />}
      </div>
    </>
  )
}