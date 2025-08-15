import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

type Poem = {
  id: number;
  title: string;
  authors: {
    name: string;
  } | null;
};

export default async function HomePage() {
  
  const { data: poems, error } = await supabase
    .from('poems')
    .select(`
        id,
        title,
        authors ( name )
    `)
    .limit(6);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Bienvenue sur Ode</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Votre nouvelle destination pour explorer le monde de la poésie.</p>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Derniers ajouts</h3>

        {error && <p className="text-center text-red-500">Erreur: {error.message}</p>}

        {!error && poems && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {poems.map((poem: Poem) => (
              <div key={poem.id} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="flex-grow">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{poem.title}</p>
                  <p className="mt-1 text-md text-gray-500 dark:text-gray-400">
                    par {poem.authors?.name || 'Auteur inconnu'}
                  </p>
                </div>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                  Lire le poème
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
