import { ImageResponse } from 'next/og'
import { getAuthorBySlug } from '@/utils/supabase/queries'

export const runtime = 'edge'
export const alt = 'Auteur sur ode'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const author = await getAuthorBySlug(resolvedParams.slug)
    const name = author?.name || resolvedParams.slug.split('-').join(' ')

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#1c1c1c',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h1 style={{ fontSize: 100, fontFamily: 'serif', color: '#fdfbf7', marginBottom: 20 }}>
                        {name}
                    </h1>
                    <p style={{ fontSize: 40, color: '#a39e93', fontStyle: 'italic' }}>
                        Poète
                    </p>
                </div>
                <div style={{ position: 'absolute', bottom: 40, fontSize: 30, color: '#fdfbf7', fontWeight: 'bold' }}>
                    ode.
                </div>
            </div>
        ),
        { ...size }
    )
}
