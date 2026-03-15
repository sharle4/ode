import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import SignupForm from "@/components/auth/SignupForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Inscription — ode",
    description: "Créez un compte ode pour rejoindre la plus grande communauté francophone de poésie. Découvrez, notez et partagez des milliers de poèmes.",
};

export default async function SignupPage() {
    // Server-side auth check — redirect if already logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        redirect("/");
    }

    return (
        <div className="min-h-[100dvh] grid grid-cols-1 md:grid-cols-2">
            {/* Left — Social proof (hidden on mobile) */}
            <AuthSidePanel variant="signup" />

            {/* Right — Form */}
            <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 pb-32 md:pb-12 bg-cream">
                {/* Mobile logo */}
                <div className="md:hidden mb-10">
                    <a href="/" className="font-serif text-3xl tracking-tight text-charcoal">
                        ode.
                    </a>
                </div>

                <SignupForm />
            </div>
        </div>
    );
}
