import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const CHUNK_SIZE = 5000;
const TOTAL_EXPECTED_POEMS = 35000;

export async function generateSitemaps() {
  const numSitemaps = Math.ceil(TOTAL_EXPECTED_POEMS / CHUNK_SIZE);
  return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: { id?: number }): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ode.poesie.fr';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const id = typeof props?.id === 'number' ? props.id : 0;

  // Fallback si la base n'est pas joignable lors du build
  if (!supabaseAnonKey) {
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${siteUrl}/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const routes: MetadataRoute.Sitemap = [];

  // Le premier sitemap (id: 0) inclut les pages clés, les catégories, et les recueils
  if (id === 0) {
    routes.push(
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${siteUrl}/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }
    );

    try {
      // Indexation des auteurs
      const { data: authors } = await supabase
        .from('authors')
        .select('slug, updated_at')
        .limit(2000);

      if (authors) {
        authors.forEach((a) => {
          if (a.slug) {
            routes.push({
              url: `${siteUrl}/author/${a.slug}`,
              lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        });
      }

      // Indexation des recueils
      const { data: collections } = await supabase
        .from('collections')
        .select('slug, updated_at')
        .limit(1000);

      if (collections) {
        collections.forEach((c) => {
          if (c.slug) {
            routes.push({
              url: `${siteUrl}/collection/${c.slug}`,
              lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
              changeFrequency: 'monthly',
              priority: 0.7,
            });
          }
        });
      }
    } catch (err) {
      console.warn('Erreur lors de la récupération des auteurs/recueils pour le sitemap 0:', err);
    }
  }

  // Indexation par lot des poèmes selon l'id du sitemap
  try {
    const from = id * CHUNK_SIZE;
    const to = from + CHUNK_SIZE - 1;

    const { data: poems } = await supabase
      .from('poems')
      .select('slug, updated_at')
      .order('id')
      .range(from, to);

    if (poems) {
      poems.forEach((poem) => {
        if (poem.slug) {
          routes.push({
            url: `${siteUrl}/poem/${poem.slug}`,
            lastModified: poem.updated_at ? new Date(poem.updated_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      });
    }
  } catch (err) {
    console.warn(`Erreur lors de la récupération des poèmes pour le sitemap ${id}:`, err);
  }

  return routes;
}
