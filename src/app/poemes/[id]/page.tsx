import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import { notFound } from 'next/navigation';
import Rating from '@/components/Rating';
import ReviewSection from '@/components/ReviewSection';

export const dynamic = 'force-dynamic'

export default async function PoemPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();

  const [
    { data: { user } },
    { data: poem, error: poemError },
    { data: reviews, error: reviewsError },
    { data: stats, error: statsError }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('poems').select('*, authors(name)').eq('id', id).single(),
    supabase.from('reviews').select('*, profiles(username)').eq('poem_id', id),
    supabase.rpc('get_poem_stats', { poem_id_param: parseInt(id) }).single()
  ]);

  if (poemError || !poem) {
    notFound();
  }
  
  const averageRating = stats?.average_rating ? Math.round(stats.average_rating) / 2 : 0;
  const reviewsCount = stats?.reviews_count || 0;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {poem.title}
            </h1>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">
              par {poem.authors?.name || 'Auteur inconnu'}
            </p>
            {/* Affichage de la note moyenne */}
            <div className="flex items-center mt-4">
              <span className="text-yellow-400 text-2xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">({reviewsCount} avis)</span>
            </div>
            <div className="mt-8 prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">
                {poem.content}
              </p>
            </div>
            
            {/* On déplace la section des critiques ici, dans la colonne principale */}
            <ReviewSection poemId={parseInt(id)} user={user} initialReviews={reviews || []} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Votre avis
                </h2>
                <div className="mt-4">
                  <Rating poemId={parseInt(id)} user={user} />
                </div>
                
                <hr className="my-6 border-gray-200 dark:border-gray-700" />

                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  À propos de ce poème
                </h2>
                <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Auteur:</strong> {poem.authors?.name || 'N/A'}</li>
                  <li><strong>Recueil:</strong> {poem.source || 'N/A'}</li>
                  <li><strong>Publié en:</strong> {poem.publication_date || 'N/A'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
