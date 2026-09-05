import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthorHeader from "@/components/author/AuthorHeader";
import AuthorBioSidebar from "@/components/author/AuthorBioSidebar";
import CollectionCard from "@/components/author/CollectionCard";
import PoemCard from "@/components/ui/PoemCard";
import { getAuthorWithWorks } from "@/utils/supabase/queries";
import { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { createClient } from "@/utils/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const author = await getAuthorWithWorks(resolvedParams.slug);

    const authorName = author?.name || resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const description = author?.biography
        ? author.biography.substring(0, 160) + '...'
        : `Explorez l'œuvre poétique de ${authorName} sur ode.`;

    return {
        title: `${authorName} - ode`,
        description,
    };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const authorSlug = resolvedParams.slug;

    const authorData = await getAuthorWithWorks(authorSlug);

    if (!authorData) {
        notFound();
    }

    // Canonical redirect if accessed via UUID but author has a slug
    if (authorData.slug && authorData.slug !== authorSlug) {
        redirect(`/author/${authorData.slug}`);
    }

    // Check user like state
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    let isLiked = false;

    if (userData?.user) {
        const { data: likeData } = await supabase
            .from('author_likes')
            .select('user_id')
            .eq('user_id', userData.user.id)
            .eq('author_id', authorData.id)
            .maybeSingle();

        if (likeData) isLiked = true;
    }

    // Extract year from date string safely
    function extractYear(dateStr: string | null | undefined): string {
        if (!dateStr) return '';
        const match = dateStr.match(/\d{4}/);
        return match ? match[0] : dateStr;
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: authorData.name,
        birthDate: authorData.date_of_birth || undefined,
        deathDate: authorData.date_of_death || undefined,
        description: authorData.biography || undefined,
        image: authorData.image_url || undefined,
    };

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar forceSolidBackground />

            <main className="flex-grow">
                {/* 1. Hero Header */}
                <AuthorHeader author={{
                    id: authorData.id,
                    name: authorData.name,
                    slug: authorData.slug,
                    date_of_birth: authorData.date_of_birth,
                    date_of_death: authorData.date_of_death,
                    image_url: authorData.image_url,
                    signature_url: authorData.signature_url,
                }} />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12">

                    {/* Colonne Principale (Top 5 & Recueils) */}
                    <div className="lg:col-span-8 flex flex-col gap-20">

                        {/* SECTION: Poèmes Populaires */}
                        {authorData.poems && authorData.poems.length > 0 && (
                            <FadeIn delay={0.2}>
                                <h2 className="font-serif text-2xl text-charcoal mb-8 border-b border-soft-border pb-4 flex items-center justify-between">
                                    Poèmes Populaires
                                    <span className="text-sm font-sans text-warm-gray font-normal cursor-pointer hover:text-charcoal transition-colors">Tout voir</span>
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {authorData.poems.slice(0, 5).map((poem: any, index: number) => (
                                        <Link key={poem.id} href={`/poem/${poem.slug || poem.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                            <span className="w-6 text-center text-warm-gray font-serif text-lg">{index + 1}</span>
                                            <div className="w-12 h-12 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center text-white/20">
                                                {poem.title.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-serif text-charcoal group-hover:text-accent transition-colors">{poem.title}</h3>
                                                <p className="text-xs text-warm-gray uppercase tracking-widest mt-1">{poem.reads_count || 0} lectures</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </FadeIn>
                        )}

                        {/* SECTION: Recueils */}
                        {authorData.collections && authorData.collections.length > 0 && (
                            <FadeIn delay={0.4}>
                                <h2 className="font-serif text-2xl text-charcoal mb-8 border-b border-soft-border pb-4">
                                    Recueils
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                                    {authorData.collections.map((collection: any, index: number) => (
                                        <CollectionCard
                                            key={collection.id || index}
                                            collection={{
                                                title: collection.title,
                                                slug: collection.slug,
                                                year: collection.publication_year || 0,
                                                poemCount: collection.poems_count || 0,
                                            }}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </FadeIn>
                        )}

                    </div>

                    {/* Colonne Latérale (Biographie, Repères & Actions) */}
                    <div className="lg:col-span-4 min-w-0">
                        <FadeIn delay={0.3}>
                            <AuthorBioSidebar
                                author={{
                                    id: authorData.id,
                                    name: authorData.name,
                                    slug: authorData.slug,
                                    biography: authorData.biography,
                                    date_of_birth: authorData.date_of_birth,
                                    date_of_death: authorData.date_of_death,
                                    birth_place: authorData.birth_place,
                                    death_place: authorData.death_place,
                                    birth_place_detailed: authorData.birth_place_detailed,
                                    death_place_detailed: authorData.death_place_detailed,
                                    nationality: authorData.nationality,
                                    language: authorData.language,
                                    native_name: authorData.native_name,
                                    movement: authorData.movement,
                                    influenced_by: authorData.influenced_by,
                                    signature_url: authorData.signature_url,
                                    image_url: authorData.image_url,
                                    likes_count: authorData.likes_count || 0,
                                    poems_count: authorData.poems?.length || 0,
                                    collections_count: authorData.collections?.length || 0,
                                }}
                                isLiked={isLiked}
                            />
                        </FadeIn>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
