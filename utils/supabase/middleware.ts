import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // refreshing the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // -------------------------------------------------------------
    // ONBOARDING REDIRECTION LOGIC (Zero-latency JWT check)
    // -------------------------------------------------------------
    if (user) {
        // Read status directly from the JWT to avoid hitting the DB
        const onboardingStatus = user.user_metadata?.onboarding_status || 'pending'
        const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')

        if (onboardingStatus === 'pending') {
            // User hasn't finished onboarding, force them to /onboarding
            if (!isOnboardingRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/onboarding'
                return NextResponse.redirect(url)
            }
        } else {
            // User is 'completed' or 'skipped'
            // If they try to access /onboarding, kick them out to home
            if (isOnboardingRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }
    }
    // -------------------------------------------------------------


    return supabaseResponse
}
