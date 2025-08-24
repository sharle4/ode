'use client'

import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import StaticRating from '@/components/StaticRating'
import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/solid'
import CommentSection from '@/components/CommentSection'
import PoemInfoCard from '@/components/PoemInfoCard'
import ReviewInteractions from '@/components/ReviewInteractions'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function ReviewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase.rpc('get_review_details', {
        review_id_param: parseInt(id),
        user_id_param: user?.id,
      }).single();

      if (!data || !data.review_data || !data.poem_data) {
        setIsLoading(false);
        return;
      }

      const [ { data: stats }, { data: distribution }, { data: userLists } ] = await Promise.all([
        supabase.rpc('get_poem_stats', { poem_id_param: data.poem_data.id }).single(),
        supabase.rpc('get_poem_rating_distribution', { poem_id_param: data.poem_data.id }),
        supabase.rpc('get_user_lists_for_poem', { poem_id_param: data.poem_data.id })
      ]);

      setPageData({ ...data, stats, distribution, userLists });
      setIsLoading(false);
    };

    if (id) {
      fetchData();
    }
  }, [id, supabase, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (isLoading) return <div>Chargement...</div>;
  if (!pageData) return <div>Critique non trouvée.</div>;

  const { review_data: review, poem_data: poem, comments_data: comments, likes_data: likes, stats, distribution, userLists } = pageData;
  const likesCount = likes?.length || 0;
  const isLikedByUser = user ? likes?.some((like: any) => like.id === user.id) : false;

  return (
    <>
      <Header />
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
            />
          </div>
        </div>
      </main>
    </>
  );
}