'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email("L'adresse email est invalide."),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères."),
})

const signupSchema = z.object({
    email: z.string().email("L'adresse email est invalide."),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères."),
    username: z.string().min(3, "Le nom d'utilisateur doit faire au moins 3 caractères."),
})

function translateAuthError(error: any) {
    const msg = error.message?.toLowerCase() || ''
    if (msg.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.'
    if (msg.includes('already registered')) return 'Cet email est déjà utilisé.'
    if (msg.includes('unique constraint')) return "Ce nom d'utilisateur ou cet email est déjà pris."
    if (msg.includes('password should be')) return 'Le mot de passe est trop faible.'
    return 'Une erreur est survenue. Veuillez réessayer.'
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const parsed = loginSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        redirect('/login?error=' + encodeURIComponent(parsed.error.issues[0].message))
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data)

    if (error) {
        redirect('/login?error=' + encodeURIComponent(translateAuthError(error)))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const parsed = signupSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        redirect('/signup?error=' + encodeURIComponent(parsed.error.issues[0].message))
    }

    // Envoi du `username` dans les user_metadata
    // pour que notre trigger on_auth_user_created puisse 
    // générer la copie dans public.users !
    const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            data: {
                username: parsed.data.username,
            }
        }
    })

    if (error) {
        redirect('/signup?error=' + encodeURIComponent(translateAuthError(error)))
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=' + encodeURIComponent('Vérifiez votre boîte mail pour valider votre compte.'))
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout')
    redirect('/login');
}
