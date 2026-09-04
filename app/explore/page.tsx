import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PoemCard from "@/components/ui/PoemCard";
import CategoryGrid from "@/components/explore/CategoryGrid";
import CollectionCard from "@/components/author/CollectionCard";
import ExploreSearchResults from "@/components/explore/ExploreSearchResults";
import {
    getTrendingPoems,
    getFeaturedAuthors,
    getFeaturedCollections,
    getCategories,
    searchCatalog
} from "@/utils/supabase/queries";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { getInitials } from "@/utils/gradient";
import { Category } from "@/types";

export const metadata: Metadata = {
    title: "Explorer - ode",
    description: "Parcourez les poèmes, auteurs, recueils et catégories du catalogue de poésie ode.",
};

// ── Skeleton Components ──
function SectionSkeleton() {
    return (
        <div className="w-full animate-pulse mt-4 mb-4">
            <div className="h-8 bg-zinc-200/50 dark:bg-zinc-800/50 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/3] sm:aspect-square bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl"></div>)}
            </div>
        </div>
    );
}

// ── Server Components for Streaming Discovery ──

async function CategorySections() {
    const categories = await getCategories();
    
    // O(N) Grouping based on type
    const grouped = categories.reduce((acc: Record<string, Category[]>, cat: any) => {
        const type = cat.type || 'THEME';
        if (!acc[type]) acc[type] = [];
        acc[type].push(cat);
        return acc;
    }, { THEME: [], MOVEMENT: [], ERA: [] });

    return (
        <div className="flex flex-col gap-2 w-full">
            {grouped.THEME?.length > 0 && <CategoryGrid categories={grouped.THEME} title="Thèmes" />}
            {grouped.MOVEMENT?.length > 0 && <CategoryGrid categories={grouped.MOVEMENT} title="Mouvements poétiques" />}
            {grouped.ERA?.length > 0 && <CategoryGrid categories={grouped.ERA} title="Époques" />}
        </div>
    );
}

async function TrendingPoemsSection() {
    const trendingPoems = await getTrendingPoems(8);
    if (!trendingPoems?.length) return null;
    return (
        <div className="w-full">
            <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Poèmes tendances</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingPoems.slice(0, 8).map((poem: any, i: number) => (
                    <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                ))}
            </div>
        </div>
    );
}

async function FeaturedAuthorsSection() {
    const featuredAuthors = await getFeaturedAuthors();
    if (!featuredAuthors?.length) return null;
    return (
        <div className="w-full">
            <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Auteurs à l&apos;honneur</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
                {featuredAuthors.map((author: any, idx: number) => (
                    <Link href={`/author/${author.slug}`} key={author.id || idx} className="flex flex-col items-center group cursor-pointer text-center">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 ease-out md:group-hover:-translate-y-2 border-2 border-transparent group-hover:border-accent/20">
                            {author.image_url ? (
                                <Image
                                    src={author.image_url}
                                    alt={author.name}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-charcoal/10 flex items-center justify-center font-serif text-2xl text-charcoal">
                                    {getInitials(author.name)}
                                </div>
                            )}
                        </div>
                        <span className="font-serif text-charcoal group-hover:text-accent transition-colors">
                            {author.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

async function PopularCollectionsSection() {
    const featuredCollections = await getFeaturedCollections();
    if (!featuredCollections?.length) return null;
    return (
        <div className="w-full">
            <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Recueils populaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredCollections.slice(0, 4).map((collection: any, index: number) => {
                     const cardCollection = {
                         title: collection.title,
                         slug: collection.slug,
                         year: collection.publication_year,
                         poemCount: collection.poems_count || 0
                     };
                     return (
                         <CollectionCard key={collection.id || index} collection={cardCollection} index={index} />
                     );
                })}
            </div>
        </div>
    );
}

interface ExplorePageProps {
    searchParams: Promise<{ q?: string; theme?: string; period?: string; movement?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
    const resolvedParams = await searchParams;
    const searchQuery = (resolvedParams.q || "").trim();

    // Si une recherche est effectuée, interroger le catalogue
    const searchResults = searchQuery
        ? await searchCatalog(searchQuery, { limit: 24, includeVerses: true })
        : null;

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">

                    {searchQuery && searchResults ? (
                        /* Mode Résultats de Recherche : direct, épuré et ciblé */
                        <FadeIn delay={0.1}>
                            <ExploreSearchResults
                                query={searchQuery}
                                results={searchResults}
                            />
                        </FadeIn>
                    ) : (
                        /* Mode Découverte pure sans recherche */
                        <>
                            <FadeIn delay={0.1}>
                                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal text-center leading-tight mb-8">
                                    Explorer
                                </h1>
                            </FadeIn>

                            <div className="flex flex-col gap-12 mt-4">
                                <FadeIn delay={0.2}>
                                    <Suspense fallback={<SectionSkeleton />}>
                                        <CategorySections />
                                    </Suspense>
                                </FadeIn>

                                <FadeIn delay={0.3}>
                                    <Suspense fallback={<SectionSkeleton />}>
                                        <TrendingPoemsSection />
                                    </Suspense>
                                </FadeIn>

                                <FadeIn delay={0.4}>
                                    <Suspense fallback={<SectionSkeleton />}>
                                        <FeaturedAuthorsSection />
                                    </Suspense>
                                </FadeIn>

                                <FadeIn delay={0.5}>
                                    <Suspense fallback={<SectionSkeleton />}>
                                        <PopularCollectionsSection />
                                    </Suspense>
                                </FadeIn>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
