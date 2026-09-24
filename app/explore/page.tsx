import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CategoryGrid from "@/components/explore/CategoryGrid";
import ExplorePoems from "@/components/explore/ExplorePoems";
import ExploreAuthors from "@/components/explore/ExploreAuthors";
import ExploreCollections from "@/components/explore/ExploreCollections";
import ExploreSearchResults from "@/components/explore/ExploreSearchResults";
import {
    getTrendingPoems,
    getFeaturedAuthors,
    getFeaturedCollections,
    getCategories,
    searchCatalog
} from "@/utils/supabase/queries";
import FadeIn from "@/components/ui/FadeIn";
import { Category } from "@/types";

export const metadata: Metadata = {
    title: "Explorer - ode",
    description: "Parcourez les poèmes, auteurs, recueils et catégories du catalogue de poésie ode.",
};

// ── Skeleton Components (Strictement 1 ligne max pour préserver le layout) ──
function CategorySkeleton() {
    return (
        <div className="w-full animate-pulse mt-2 sm:mt-4 mb-6">
            <div className="flex items-baseline justify-between mb-3.5 px-1 sm:px-2">
                <div className="h-7 bg-soft-border/50 rounded w-36"></div>
                <div className="h-4 bg-soft-border/30 rounded w-20"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                        key={i}
                        className={`aspect-[4/3] sm:aspect-square bg-soft-border/40 rounded-xl ${
                            i === 3 ? 'hidden sm:block' : ''
                        } ${i === 4 ? 'hidden md:block' : ''} ${i >= 5 ? 'hidden lg:block' : ''}`}
                    ></div>
                ))}
            </div>
        </div>
    );
}

function PoemsSkeleton() {
    return (
        <div className="w-full animate-pulse mt-2 sm:mt-4 mb-6">
            <div className="flex items-baseline justify-between mb-3.5 px-1 sm:px-2">
                <div className="h-7 bg-soft-border/50 rounded w-44"></div>
                <div className="h-4 bg-soft-border/30 rounded w-20"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`aspect-[4/5] bg-soft-border/40 rounded-xl ${
                            i === 3 ? 'hidden md:block' : ''
                        } ${i === 4 ? 'hidden lg:block' : ''}`}
                    ></div>
                ))}
            </div>
        </div>
    );
}

function AuthorsSkeleton() {
    return (
        <div className="w-full animate-pulse mt-2 sm:mt-4 mb-6">
            <div className="flex items-baseline justify-between mb-3.5 px-1 sm:px-2">
                <div className="h-7 bg-soft-border/50 rounded w-48"></div>
                <div className="h-4 bg-soft-border/30 rounded w-20"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                        key={i}
                        className={`flex flex-col items-center ${
                            i === 3 ? 'hidden sm:flex' : ''
                        } ${i === 4 ? 'hidden md:flex' : ''} ${i >= 5 ? 'hidden lg:flex' : ''}`}
                    >
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-soft-border/40 mb-3" />
                        <div className="h-4 bg-soft-border/30 rounded w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function CollectionsSkeleton() {
    return (
        <div className="w-full animate-pulse mt-2 sm:mt-4 mb-6">
            <div className="flex items-baseline justify-between mb-3.5 px-1 sm:px-2">
                <div className="h-7 bg-soft-border/50 rounded w-44"></div>
                <div className="h-4 bg-soft-border/30 rounded w-20"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`flex flex-col ${
                            i === 3 ? 'hidden sm:flex' : ''
                            } ${i === 4 ? 'hidden lg:flex' : ''}`}
                    >
                        <div className="aspect-[2/3] w-full bg-soft-border/40 rounded-r-lg rounded-l-sm" />
                        <div className="mt-4 flex justify-between px-1">
                            <div className="h-3 bg-soft-border/30 rounded w-10" />
                            <div className="h-3 bg-soft-border/30 rounded w-16" />
                        </div>
                    </div>
                ))}
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
    const trendingPoems = await getTrendingPoems(16);
    if (!trendingPoems?.length) return null;
    return <ExplorePoems poems={trendingPoems} />;
}

async function FeaturedAuthorsSection() {
    const featuredAuthors = await getFeaturedAuthors();
    if (!featuredAuthors?.length) return null;
    return <ExploreAuthors authors={featuredAuthors} />;
}

async function PopularCollectionsSection() {
    const featuredCollections = await getFeaturedCollections();
    if (!featuredCollections?.length) return null;
    return <ExploreCollections collections={featuredCollections} />;
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
                                    <Suspense fallback={<CategorySkeleton />}>
                                        <CategorySections />
                                    </Suspense>
                                </FadeIn>

                                <FadeIn delay={0.3}>
                                    <Suspense fallback={<PoemsSkeleton />}>
                                        <TrendingPoemsSection />
                                    </Suspense>
                                </FadeIn>

                                <FadeIn delay={0.4}>
                                    <Suspense fallback={<AuthorsSkeleton />}>
                                        <FeaturedAuthorsSection />
                                    </Suspense>
                                </FadeIn>

                                <FadeIn delay={0.5}>
                                    <Suspense fallback={<CollectionsSkeleton />}>
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
