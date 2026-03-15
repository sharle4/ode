import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import LoginForm from "@/components/auth/LoginForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Connexion — ode",
    description: "Connectez-vous à ode pour retrouver votre bibliothèque de poèmes, vos notes et votre communauté.",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    // Server-side auth check — redirect if already logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        redirect("/");
    }

    const { next } = await searchParams;

    return (
        <div className="min-h-[100dvh] grid grid-cols-1 md:grid-cols-2">
            {/* Left — Social proof (hidden on mobile) */}
            <AuthSidePanel variant="login" />

            {/* Right — Form */}
            <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 pb-32 md:pb-12 bg-cream">
                {/* Mobile logo */}
                <div className="md:hidden mb-10">
                    <a href="/" className="font-serif text-3xl tracking-tight text-charcoal">
                        ode.
                    </a>
                </div>

                <LoginForm redirectTo={next} />
            </div>
        </div>
    );
}
