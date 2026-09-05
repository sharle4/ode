import { ImageResponse } from 'next/og';
import { getCollectionBySlug } from '@/utils/supabase/queries';

export const runtime = 'edge';
export const alt = 'Recueil de poésie sur ode';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const collection = await getCollectionBySlug(resolvedParams.slug);

  const title = collection?.title || 'Recueil de poèmes';
  const poemCount = collection?.poems_count || (Array.isArray(collection?.poems) ? collection.poems.length : 0);
  const year = collection?.publication_year ? `(${collection.publication_year})` : '';

  let authorsStr = 'Auteurs multiples';
  if (collection?.authors) {
    if (Array.isArray(collection.authors)) {
      authorsStr = collection.authors.map((a: any) => a.name).join(', ');
    } else if ((collection.authors as any)?.name) {
      authorsStr = (collection.authors as any).name;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          backgroundColor: '#121214',
          position: 'relative',
        }}
      >
        {/* Motif d'arrière-plan élégant et minimaliste */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '380px',
            height: '100%',
            backgroundColor: '#1a1a1e',
            borderLeft: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '240px',
              height: '340px',
              border: '2px solid #3f3f46',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#18181b',
            }}
          >
            <span style={{ fontSize: 18, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Recueil
            </span>
            <span style={{ fontSize: 22, color: '#f4f4f5', fontFamily: 'serif', fontWeight: 600, lineHeight: 1.2 }}>
              {title}
            </span>
            <span style={{ fontSize: 16, color: '#71717a', marginTop: 16 }}>
              {poemCount > 0 ? `${poemCount} poèmes` : ''}
            </span>
          </div>
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#e4d5b7',
            }}
          />
          <span
            style={{
              fontSize: 28,
              letterSpacing: '0.05em',
              fontWeight: 700,
              color: '#fdfbf7',
              fontFamily: 'serif',
            }}
          >
            ode.
          </span>
        </div>

        {/* Info Principale */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '660px',
          }}
        >
          <span
            style={{
              fontSize: 20,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#a1a1aa',
              marginBottom: 16,
            }}
          >
            Recueil Poétique {year}
          </span>
          <h1
            style={{
              fontSize: title.length > 40 ? 50 : 64,
              lineHeight: 1.15,
              fontFamily: 'serif',
              color: '#ffffff',
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 30,
              color: '#d4d4d8',
              fontStyle: 'italic',
              fontFamily: 'serif',
            }}
          >
            {authorsStr}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: '#71717a',
              letterSpacing: '0.04em',
            }}
          >
            Explorer le recueil complet et ses poèmes
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
