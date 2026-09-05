import { ImageResponse } from 'next/og';
import { getPoemBySlug } from '@/utils/supabase/queries';

export const runtime = 'edge';
export const alt = 'Poème sur ode';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PALETTES: Record<string, { bg: string; darkBg: string; accent: string; shape: string }> = {
  melancholy: { bg: '#eef2f3', darkBg: '#1c2833', accent: '#425e71', shape: '#2b4354' },
  golden_haze: { bg: '#fbf4ea', darkBg: '#2d1f11', accent: '#d49a4e', shape: '#7a4a19' },
  ocean_depths: { bg: '#e6f0f2', darkBg: '#0d2229', accent: '#3b788c', shape: '#123e4d' },
  sunset_ash: { bg: '#f7eeed', darkBg: '#2b1716', accent: '#b06f69', shape: '#4e2b29' },
  forest_whisper: { bg: '#edf2ea', darkBg: '#132012', accent: '#5c7857', shape: '#1a2b19' },
  twilight_ink: { bg: '#ececf4', darkBg: '#141426', accent: '#62628f', shape: '#2d2d4f' },
  warm_earth: { bg: '#f6f0e8', darkBg: '#291809', accent: '#a67d54', shape: '#452b14' },
  violet_dusk: { bg: '#f3ebf5', darkBg: '#210d26', accent: '#8b5b96', shape: '#33173b' },
  arctic_mist: { bg: '#e8f3f6', darkBg: '#0f262c', accent: '#468391', shape: '#1a4a54' },
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const poem = await getPoemBySlug(resolvedParams.slug);

  const title = poem?.title || "Poème";
  const authorStr = Array.isArray(poem?.authors)
    ? poem.authors.map((a: any) => a.name).join(', ')
    : (poem?.authors as any)?.name || "Auteur Classique";

  const collectionTitle = Array.isArray(poem?.collections)
    ? poem.collections[0]?.title
    : (poem?.collections as any)?.title;

  const year = poem?.publication_year ? `(${poem.publication_year})` : '';

  // Extraction d'un extrait poétique significatif (2 premiers vers)
  let excerpt = "";
  try {
    const stanzas = (poem?.content as any)?.stanzas;
    if (Array.isArray(stanzas) && stanzas.length > 0 && Array.isArray(stanzas[0])) {
      excerpt = stanzas[0].slice(0, 2).join(' / ');
    }
  } catch {
    excerpt = "";
  }

  // Sélection de la palette selon le génome Rothko
  const paletteKey = (poem?.rothko_params as any)?.palette_id || 'melancholy';
  const palette = PALETTES[paletteKey] || PALETTES.melancholy;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '55px 70px',
          backgroundColor: '#0c0c0e',
          position: 'relative',
        }}
      >
        {/* Composition d'Art Génératif de fond (Style Rothko) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '450px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: '30px',
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '42%',
              backgroundColor: palette.shape,
              borderRadius: '16px',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              width: '100%',
              height: '48%',
              backgroundColor: palette.accent,
              borderRadius: '16px',
              opacity: 0.75,
            }}
          />
        </div>

        {/* Header : Logo & Recueil */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
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
                backgroundColor: palette.accent,
              }}
            />
            <span
              style={{
                fontSize: 26,
                letterSpacing: '0.05em',
                fontWeight: 700,
                color: '#fdfbf7',
                fontFamily: 'serif',
              }}
            >
              ode.
            </span>
          </div>

          {collectionTitle && (
            <span
              style={{
                fontSize: 18,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#a1a1aa',
                fontFamily: 'sans-serif',
              }}
            >
              Recueil : {collectionTitle} {year}
            </span>
          )}
        </div>

        {/* Centre : Titre & Auteur */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '680px',
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize: title.length > 35 ? 54 : 68,
              lineHeight: 1.1,
              fontFamily: 'serif',
              color: '#ffffff',
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: 28,
              color: '#d4d4d8',
              fontStyle: 'italic',
              fontFamily: 'serif',
              marginBottom: excerpt ? 24 : 0,
            }}
          >
            Par {authorStr}
          </p>

          {excerpt && (
            <div
              style={{
                display: 'flex',
                borderLeft: `3px solid ${palette.accent}`,
                paddingLeft: '20px',
                marginTop: '10px',
              }}
            >
              <p
                style={{
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: '#a1a1aa',
                  fontStyle: 'italic',
                  fontFamily: 'serif',
                }}
              >
                « {excerpt} »
              </p>
            </div>
          )}
        </div>

        {/* Footer : Badge & Découverte */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: '#71717a',
              letterSpacing: '0.04em',
            }}
          >
            Anthologie & Bibliothèque Poétique Mondiale
          </span>
          <span
            style={{
              fontSize: 16,
              color: '#e4e4e7',
              backgroundColor: '#27272a',
              padding: '6px 16px',
              borderRadius: '20px',
              letterSpacing: '0.04em',
            }}
          >
            Lire sur ode
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
