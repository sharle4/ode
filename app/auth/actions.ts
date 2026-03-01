'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        username: formData.get('username') as string,
    }

    // Envoi du `username` dans les user_metadata
    // pour que notre trigger on_auth_user_created puisse 
    // générer la copie dans public.users !
    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                username: data.username,
            }
        }
    })

    if (error) {
        redirect('/signup?error=' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to verified account')
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout')
    redirect('/login');
}
