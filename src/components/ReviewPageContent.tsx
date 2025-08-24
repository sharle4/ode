'use client'

import { createClient } from '@/lib/supabase/client'
import StaticRating from '@/components/StaticRating'
import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/solid'
import CommentSection from '@/components/CommentSection'
import PoemInfoCard from '@/components/PoemInfoCard'
import ReviewInteractions from '@/components/ReviewInteractions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface PageData {
  review_data: any;
  poem_data: any;
  comments_data: any[];
  likes_data: any[];
  stats: any;
  distribution: any[];
  userLists: any[];
}

interface ReviewPageContentProps {
  initialData: PageData;
  user: User | null;
}

export default function ReviewPageContent({ initialData, user }: ReviewPageContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const { review_data: review, poem_data: poem, comments_data: comments, likes_data: likes, stats, distribution, userLists } = initialData;
  
  const [userRatingForPoem, setUserRatingForPoem] = useState<number | null>(() => {
    const userReview = initialData.review_data.user_id === user?.id ? initialData.review_data : null;
    return userReview?.rating || null;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handlePoemRate = async (newRating: number) => {
    if (!user || !poem) return;
    setUserRatingForPoem(newRating);
    await supabase.from('reviews').upsert({
      user_id: user.id,
      poem_id: poem.id,
      rating: newRating,
    }, { onConflict: 'user_id, poem_id' });
    router.refresh();
  };

  const likesCount = likes?.length || 0;
  const isLikedByUser = user ? likes?.some((like: any) => like.id === user.id) : false;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start">
            <div className="flex space-x-4 items-center">
              <Link href={`/profil/${review.profiles?.username}`} className="flex-shrink-0">
                {review.profiles?.avatar_url ? (
                  <img src={review.profiles.avatar_url} alt={review.profiles.username || ''} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </Link>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Critique par{' '}
                  <Link href={`/profil/${review.profiles?.username}`} className="font-semibold text-gray-800 dark:text-gray-200 hover:underline">
                    {review.profiles?.username}
                  </Link>
                </p>
                <StaticRating rating={review.rating} size="md" />
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {formatDate(review.created_at)}
            </p>
          </div>
          {review.content && (
            <div className="mt-6 prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{review.content}</p>
            </div>
          )}
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2">
            <ReviewInteractions
              reviewId={review.id}
              initialLikesCount={likesCount}
              initialCommentsCount={comments?.length || 0}
              isLikedByUser={isLikedByUser}
              isLoggedIn={!!user}
            />
          </div>
          <CommentSection 
            reviewId={review.id} 
            initialComments={comments || []} 
            user={user} 
          />
        </div>
        <div className="lg:col-span-1">
          <PoemInfoCard
            poem={poem}
            stats={stats}
            distribution={distribution || []}
            user={user}
            userLists={userLists || []}
            userRating={userRatingForPoem}
            onRate={handlePoemRate}
            onCritique={() => router.push(`/poemes/${poem.id}`)}
            onAddToList={() => router.push(`/poemes/${poem.id}`)}
          />
        </div>
      </div>
    </main>
  )
}