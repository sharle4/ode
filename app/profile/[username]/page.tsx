import { notFound } from "next/navigation";
import { getTrendingPoems } from "@/utils/supabase/queries";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileTabs from "@/components/profile/ProfileTabs";
import StatBlock from "@/components/profile/StatBlock";
import { Metadata } from "next";

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const decodedUsername = decodeURIComponent(resolvedParams.username);

    return {
        title: `${decodedUsername} - Profil ode`,
        description: `Découvrez les poèmes favoris et l'activité de ${decodedUsername} sur ode, la communauté de poésie.`,
    };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const resolvedParams = await params;
    const decodedUsername = decodeURIComponent(resolvedParams.username);

    // Pour la V1 : Données statiques / mockées car la base de données ne lie pas encore les utilisateurs aux poèmes.
    // Exception : Nous utiliserons getTrendingPoems() pour simuler les "Poèmes Favoris".
    const mockedFavorites = await getTrendingPoems(4);

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 md:pt-32 pb-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header Profil */}
                    <header className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-16">
                        {/* Avatar (Mocked ou Initiales) */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-3xl md:text-4xl font-serif shadow-xl flex-shrink-0">
                            {decodedUsername.charAt(0).toUpperCase()}
                        </div>

                        {/* Infos & Stats */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
                            <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
                                {decodedUsername}
                            </h1>
                            <p className="text-warm-gray text-sm italic mb-6">
                                Amoureux de poésie depuis 2026
                            </p>

                            {/* Stats Bar */}
                            <div className="flex flex-wrap items-center gap-6 md:gap-10 w-full justify-center md:justify-start">
                                <StatBlock value={312} label="Poèmes lus" />
                                <StatBlock value={42} label="Avis" />
                                <StatBlock value={8} label="Listes" />
                                <div className="hidden md:block w-px h-8 bg-soft-border"></div> {/* Séparateur */}
                                <StatBlock value={124} label="Abonnés" />
                                <StatBlock value={68} label="Abonnements" />
                            </div>
                        </div>

                        {/* Edit / Follow Button */}
                        <div className="mt-4 md:mt-0">
                            <button className="px-6 py-2 rounded-full border border-soft-border text-charcoal hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-medium text-sm">
                                Suivre
                            </button>
                        </div>
                    </header>

                    {/* Systèmes d'Onglets */}
                    <ProfileTabs
                        username={decodedUsername}
                        favoritePoems={mockedFavorites as any}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}
