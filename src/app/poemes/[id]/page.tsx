import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { notFound } from 'next/navigation';

export default async function PoemPage({ params }: { params: { id: string } }) {
  
  const { data: poem, error } = await supabase
    .from('poems')
    .select(`
      title,
      content,
      publication_date,
      source,
      authors ( name )
    `)
    .eq('id', params.id)
    .single();

  if (error || !poem) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Colonne de Gauche : Le Poème */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {poem.title}
            </h1>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">
              par {poem.authors?.name || 'Auteur inconnu'}
            </p>
            <div className="mt-8 prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">
                {poem.content}
              </p>
            </div>
          </div>

          {/* Colonne de Droite : Métadonnées et Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24"> {/* Pour que le bloc suive le scroll */}
              <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  À propos de ce poème
                </h2>
                <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Auteur:</strong> {poem.authors?.name || 'N/A'}</li>
                  <li><strong>Recueil:</strong> {poem.source || 'N/A'}</li>
                  <li><strong>Publié en:</strong> {poem.publication_date || 'N/A'}</li>
                </ul>

                <hr className="my-6 border-gray-200 dark:border-gray-700" />

                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Votre avis
                </h2>
                <div className="mt-4">
                  {/* Section de notation (statique pour l'instant) */}
                  <p className="text-sm text-gray-500">Notez ce poème :</p>
                  <div className="flex items-center text-2xl text-gray-300 dark:text-gray-600">
                    <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
                  </div>
                </div>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                  Ajouter une critique
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
