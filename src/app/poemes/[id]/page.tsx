import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import { notFound } from 'next/navigation';
import PoemInteractiveContent from '@/components/PoemInteractiveContent';

export const dynamic = 'force-dynamic'

export default async function PoemPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();

  const [
    { data: { user } },
    { data: poem, error: poemError },
    { data: reviews },
    { data: stats },
    { data: distribution }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('poems').select('*, authors(name)').eq('id', id).single(),
    supabase.from('reviews').select('*, profiles(username, avatar_url)').eq('poem_id', id).order('created_at', { ascending: false }),
    supabase.rpc('get_poem_stats', { poem_id_param: parseInt(id) }).single(),
    supabase.rpc('get_poem_rating_distribution', { poem_id_param: parseInt(id) })
  ]);

  if (poemError || !poem) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* On passe toutes les données au composant client qui gère l'interactivité */}
          <PoemInteractiveContent
            poemId={parseInt(id)}
            initialUser={user}
            initialPoem={poem}
            initialReviews={reviews || []}
            initialStats={stats}
            initialDistribution={distribution || []}
          />
        </div>
      </main>
    </>
  );
}