'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Rating from './Rating'
import ReviewSection from './ReviewSection'
import AddToListModal from './AddToListModal'
import PoemInfoCard from './PoemInfoCard'
import PublicListsSection from './PublicListsSection'
import { XMarkIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

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

  const handleCloseReviewModal = () => setIsReviewModalOpen(false);
  const handleCloseListModal = () => {
    setIsListModalOpen(false);
    router.refresh();
  };
  const handleBackdropClick = () => {
    if (isReviewModalOpen) handleCloseReviewModal();
    if (isListModalOpen) handleCloseListModal();
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full">
        <div className={`lg:col-span-2 transition-filter duration-300 ${isModalActive ? 'blur-sm' : ''}`}>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{initialPoem.title}</h1>
          <Link href={`/auteurs/${encodeURIComponent(initialPoem.authors?.name || '')}`}>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              par {initialPoem.authors?.name || 'Auteur inconnu'}
            </p>
          </Link>
          <div className="mt-8 prose prose-lg dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{initialPoem.content}</p>
          </div>
          <ReviewSection reviews={initialReviews} user={user} />
          <PublicListsSection lists={initialPublicLists} />
        </div>

        <div className={`lg:col-span-1 transition-filter duration-300 ${isModalActive ? 'blur-sm' : ''}`}>
          <PoemInfoCard
            poem={initialPoem}
            stats={initialStats}
            distribution={initialDistribution}
            user={user}
            userLists={initialUserLists}
            userRating={rating}
            onRate={handleRatingOnly}
            onCritique={() => setIsReviewModalOpen(true)}
            onAddToList={() => setIsListModalOpen(true)}
          />
        </div>
      </div>

      <div 
        className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isModalActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleBackdropClick}
      >
        {isReviewModalOpen && (
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={handleCloseReviewModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
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
                <button type="button" onClick={handleCloseReviewModal} className="text-sm text-gray-600 dark:text-gray-400">Annuler</button>
                <button type="submit" disabled={isSubmitting || !rating} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}
        {isListModalOpen && <AddToListModal poemId={poemId} poemTitle={initialPoem.title} onClose={handleCloseListModal} />}
      </div>
    </>
  )
}