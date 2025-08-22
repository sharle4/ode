import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import ActivityCard from '@/components/ActivityCard';

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient();
  
  const { data: feedItems, error } = await supabase
    .rpc('get_activity_feed', { limit_count: 20 });

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Activité récente
          </h1>

          {error && <p className="text-center text-red-500">Erreur lors du chargement du fil d'activité.</p>}

          {feedItems && feedItems.length > 0 ? (
            <div className="space-y-6">
              {feedItems.map((item, index) => (
                <ActivityCard key={`${item.activity_type}-${item.item_id}-${index}`} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              L'activité est encore calme. Soyez le premier à noter un poème ou à créer une liste !
            </p>
          )}
        </div>
      </main>
    </>
  );
}