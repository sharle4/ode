'use client'

import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import { notFound, useRouter } from 'next/navigation';
import ReviewSection from '@/components/ReviewSection';
import RatingsChart from '@/components/RatingsChart';
import Rating from '@/components/Rating';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface PoemData {
  title: string;
  content: string;
  publication_date: string | null;
  source: string | null;
  authors: { name: string | null } | null;
}
interface ReviewData {
  id: number;
  content: string | null;
  rating: number | null;
  created_at: string;
  profiles: { username: string | null; avatar_url: string | null; } | null;
}
interface StatsData {
  average_rating: number | null;
  reviews_count: number | null;
}
interface DistributionData {
  rating_value: number;
  count: number;
}

export default function PoemPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [poem, setPoem] = useState<PoemData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [distribution, setDistribution] = useState<DistributionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: { user } },
        { data: poemData },
        { data: reviewsData },
        { data: statsData },
        { data: distributionData }
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('poems').select('*, authors(name)').eq('id', id).single(),
        supabase.from('reviews').select('*, profiles(username, avatar_url)').eq('poem_id', id).order('created_at', { ascending: false }),
        supabase.rpc('get_poem_stats', { poem_id_param: parseInt(id) }).single(),
        supabase.rpc('get_poem_rating_distribution', { poem_id_param: parseInt(id) })
      ]);

      if (!poemData) return notFound();
      
      setUser(user);
      setPoem(poemData);
      setReviews(reviewsData || []);
      setStats(statsData);
      setDistribution(distributionData || []);
      setIsLoading(false);
    };
    fetchData();
  }, [id, supabase]);

  useEffect(() => {
    if (user) {
      const userReview = reviews.find(r => (r as any).user_id === user.id);
      setRating(userReview?.rating || null);
      setContent(userReview?.content || '');
    }
  }, [user, reviews, isModalOpen]);

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
      poem_id: parseInt(id),
      content: content.trim(),
      rating: rating,
    }, { onConflict: 'user_id, poem_id' });

    if (error) {
      setError(error.message);
    } else {
      setIsModalOpen(false);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div>Chargement...</div>; // Ou un composant de squelette
  }

  if (!poem) {
    return notFound();
  }

  const averageRating = stats?.average_rating ? Math.round(stats.average_rating) / 2 : 0;
  const reviewsCount = stats?.reviews_count || 0;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{poem.title}</h1>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">par {poem.authors?.name || 'Auteur inconnu'}</p>
            <div className="mt-8 prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{poem.content}</p>
            </div>
            <ReviewSection reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">À propos</h2>
                <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li><strong>Auteur:</strong> {poem.authors?.name || 'N/A'}</li>
                  <li><strong>Recueil:</strong> {poem.source || 'N/A'}</li>
                  <li><strong>Publié en:</strong> {poem.publication_date || 'N/A'}</li>
                </ul>
                <hr className="my-6 border-gray-200 dark:border-gray-700" />
                <div className="flex items-center">
                  <span className="text-yellow-400 text-3xl font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">({reviewsCount} avis)</span>
                </div>
                <div className="mt-4">
                  <RatingsChart data={distribution} totalReviews={reviewsCount} />
                </div>
                <hr className="my-6 border-gray-200 dark:border-gray-700" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Votre avis</h2>
                <div className="mt-4">
                  <Rating rating={rating} setRating={setRating} hoverRating={hoverRating} setHoverRating={setHoverRating} />
                </div>
                {user && (
                  <button onClick={() => setIsModalOpen(true)} className="mt-4 w-full bg-transparent border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 py-2 px-4 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm">
                    {reviews.some(r => (r as any).user_id === user.id) ? 'Modifier la critique' : 'Ajouter une critique'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Votre avis sur "{poem.title}"</h3>
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
  );
}