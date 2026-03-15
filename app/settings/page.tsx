import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SettingsForm from "@/components/settings/SettingsForm";
import FadeIn from "@/components/ui/FadeIn";
import { Metadata } from "next";
import { Gear } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/utils/supabase/server";
import { getUserProfileByUsername } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Paramètres - ode",
    description:
        "Gérez votre profil, vos préférences et la sécurité de votre compte ode.",
};

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

    if (!userData?.username) {
        redirect("/"); // Fallback if no profile is somewhat synced
    }

    const userProfile = await getUserProfileByUsername(userData.username);
    if (!userProfile) {
        redirect("/");
    }

    const isOAuth = !user.identities?.some(id => id.provider === 'email');

    const initialData = {
        username: userProfile.username || "",
        description: userProfile.description || "",
        annotationColor: userProfile.annotation_color || "#B85450",
        avatarUrl: userProfile.avatar_url || null,
        topAuthors: (userProfile.topAuthors || []).map((a: any) => ({
            id: a.id,
            label: a.name,
            sublabel: ""
        })),
        topPoems: (userProfile.topPoems || []).map((p: any) => ({
            id: p.id,
            label: p.title,
            sublabel: Array.isArray(p.authors) ? p.authors.map((x:any)=>x.name).join(', ') : (p.authors?.name || ""),
        })),
        isOAuth
    };

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <FadeIn delay={0.1}>
                        <div className="mb-12 md:mb-16">
                            <div className="flex items-center gap-3 mb-3">
                                <Gear size={24} className="text-accent" />
                                <h1 className="font-serif text-3xl md:text-4xl text-charcoal tracking-tight">
                                    Paramètres
                                </h1>
                            </div>
                            <p className="text-sm text-warm-gray max-w-lg">
                                Personnalisez votre profil, choisissez vos
                                préférences et gérez la sécurité de votre
                                compte.
                            </p>
                        </div>
                    </FadeIn>

                    {/* Settings Sections */}
                    <FadeIn delay={0.3}>
                        <SettingsForm initialData={initialData} />
                    </FadeIn>
                </div>
            </main>

            <Footer />
        </div>
    );
}
