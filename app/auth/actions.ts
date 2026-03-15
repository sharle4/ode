'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const loginSchema = z.object({
    email: z.string().email("L'adresse email est invalide."),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères."),
    redirectTo: z.string().optional(),
})

const signupSchema = z.object({
    email: z.string().email("L'adresse email est invalide."),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères."),
    username: z.string().min(3, "Le nom d'utilisateur doit faire au moins 3 caractères."),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function translateAuthError(error: any) {
    const msg = error.message?.toLowerCase() || ''
    if (msg.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.'
    if (msg.includes('already registered')) return 'Cet email est déjà utilisé.'
    if (msg.includes('unique constraint')) return "Ce nom d'utilisateur ou cet email est déjà pris."
    if (msg.includes('password should be')) return 'Le mot de passe est trop faible.'
    return 'Une erreur est survenue. Veuillez réessayer.'
}

/** Open-redirect protection: only allow relative paths */
function safeRedirectUrl(url?: string): string {
    if (url && url.startsWith('/') && !url.startsWith('//')) {
        return url
    }
    return '/'
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const loginAction = actionClient
    .schema(loginSchema)
    .action(async ({ parsedInput: { email, password, redirectTo } }) => {
        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            return { failure: translateAuthError(error) }
        }

        revalidatePath('/', 'layout')
        redirect(safeRedirectUrl(redirectTo))
    })

export const signupAction = actionClient
    .schema(signupSchema)
    .action(async ({ parsedInput: { email, password, username } }) => {
        const supabase = await createClient()

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
            },
        })

        if (error) {
            return { failure: translateAuthError(error) }
        }

        revalidatePath('/', 'layout')
        return { success: 'Vérifiez votre boîte mail pour valider votre compte.' }
    })

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
