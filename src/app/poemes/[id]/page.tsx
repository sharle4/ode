import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import PoemInteractiveContent from '@/components/PoemInteractiveContent'

export const dynamic = 'force-dynamic'

export default async function PoemPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  const { data: { user } } = await supabase.auth.getUser()

  const reviewsQuery = supabase.rpc('get_reviews_for_poem', {
    poem_id_param: parseInt(id),
    user_id_param: user?.id,
  })

  const [
    { data: poem, error: poemError },
    { data: reviews },
    { data: stats },
    { data: distribution },
    { data: userLists },
    { data: publicLists }
  ] = await Promise.all([
    supabase.from('poems').select('*, authors(name)').eq('id', id).single(),
    reviewsQuery,
    supabase.rpc('get_poem_stats', { poem_id_param: parseInt(id) }).single(),
    supabase.rpc('get_poem_rating_distribution', { poem_id_param: parseInt(id) }),
    supabase.rpc('get_user_lists_for_poem', { poem_id_param: parseInt(id) }),
    supabase.rpc('get_public_lists_for_poem', { poem_id_param: parseInt(id) })
  ]);

  if (poemError || !poem) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PoemInteractiveContent
          poemId={parseInt(id)}
          initialUser={user}
          initialPoem={poem}
          initialReviews={reviews || []}
          initialStats={stats}
          initialDistribution={distribution || []}
          initialUserLists={userLists || []}
          initialPublicLists={publicLists || []}
        />
      </main>
    </>
  );
}