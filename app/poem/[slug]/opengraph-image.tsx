import { ImageResponse } from 'next/og'
import { getPoemBySlug } from '@/utils/supabase/queries'

export const runtime = 'edge'
export const alt = 'Poème sur ode'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const poem = await getPoemBySlug(resolvedParams.slug)
    const title = poem?.title || "Poème"
    const authorStr = Array.isArray(poem?.authors) 
        ? poem.authors.map((a: any) => a.name).join(', ') 
        : (poem?.authors as any)?.name || "ode"

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #fdfbf7, #e6dec3)',
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
                    <h1 style={{ fontSize: 80, fontFamily: 'serif', color: '#1c1c1c', marginBottom: 20 }}>
                        {title}
                    </h1>
                    <p style={{ fontSize: 40, color: '#6b665d', fontStyle: 'italic' }}>
                        Par {authorStr}
                    </p>
                </div>
                <div style={{ position: 'absolute', bottom: 40, fontSize: 30, color: '#1c1c1c', fontWeight: 'bold' }}>
                    ode.
                </div>
            </div>
        ),
        { ...size }
    )
}
