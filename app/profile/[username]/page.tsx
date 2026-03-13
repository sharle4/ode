import { notFound } from "next/navigation";
import { getUserProfileByUsername, getTrendingPoems } from "@/utils/supabase/queries";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileTabs from "@/components/profile/ProfileTabs";
import FadeIn from "@/components/ui/FadeIn";
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

    // Try to fetch user profile from DB; fallback to trending poems for a graceful display
    const userProfile = await getUserProfileByUsername(decodedUsername);

    // If no user found in DB, show a graceful fallback with minimal data
    const stats = userProfile?.stats || { reads: 0, reviews: 0, lists: 0, followers: 0, following: 0 };
    const topPoems = userProfile?.topPoems || [];
    const topAuthors = userProfile?.topAuthors || [];
    const recentReviews = userProfile?.recentReviews || [];
    const badges = userProfile?.badges || [];
    const reviewDistribution = userProfile?.reviewDistribution || [5, 4, 3, 2, 1].map(s => ({ stars: s, count: 0 }));
    const avatarUrl = userProfile?.avatar_url || null;
    const bio = userProfile?.bio || null;
    const createdAt = userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : null;

    // Fallback: if user has no top poems, show trending as recommendations
    let displayPoems = topPoems;
    if (displayPoems.length === 0) {
        try {
            displayPoems = await getTrendingPoems(4);
        } catch { /* non-critical */ }
    }

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    {/* Header Profil */}
                    <FadeIn delay={0.1}>
                        <header className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-16">
                            {/* Avatar */}
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-3xl md:text-4xl font-serif shadow-xl flex-shrink-0 overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={decodedUsername} className="w-full h-full object-cover" />
                                ) : (
                                    decodedUsername.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Infos & Stats */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
                                <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
                                    {decodedUsername}
                                </h1>
                                {(bio || createdAt) && (
                                    <p className="text-warm-gray text-sm italic mb-6">
                                        {bio || (createdAt ? `Amoureux de poésie depuis ${createdAt}` : '')}
                                    </p>
                                )}

                                {/* Stats Bar */}
                                <div className="flex flex-wrap items-center gap-6 md:gap-10 w-full justify-center md:justify-start">
                                    <StatBlock value={stats.reads} label="Poèmes lus" />
                                    <StatBlock value={stats.reviews} label="Avis" />
                                    <StatBlock value={stats.lists} label="Listes" />
                                    <div className="hidden md:block w-px h-8 bg-soft-border"></div>
                                    <StatBlock value={stats.followers} label="Abonnés" />
                                    <StatBlock value={stats.following} label="Abonnements" />
                                </div>
                            </div>

                            {/* Edit / Follow Button */}
                            <div className="mt-4 md:mt-0">
                                <button className="px-6 py-2 rounded-full bg-charcoal text-cream hover:bg-charcoal/90 transition-colors font-medium text-sm">
                                    Suivre
                                </button>
                            </div>
                        </header>
                    </FadeIn>

                    {/* Systèmes d'Onglets */}
                    <FadeIn delay={0.3}>
                        <ProfileTabs
                            username={decodedUsername}
                            favoritePoems={displayPoems as any}
                            topAuthors={topAuthors}
                            recentReviews={recentReviews}
                            badges={badges}
                            reviewDistribution={reviewDistribution}
                        />
                    </FadeIn>
                </div>
            </main>

            <Footer />
        </div>
    );
}
