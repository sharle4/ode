import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Variables d\'environnement Supabase manquantes',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // Requête ultra-légère pour mesurer la réactivité de la base PostgreSQL
    const { error } = await supabase
      .from('poems')
      .select('id')
      .limit(1)
      .maybeSingle();

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: 'degraded',
          database: 'error',
          error: error.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        latencyMs,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        version: '2.1.8',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err?.message || 'Erreur inconnue',
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
