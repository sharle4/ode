import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PoemCard from "@/components/ui/PoemCard";
import CategoryGrid from "@/components/explore/CategoryGrid";
import ExploreSearch from "@/components/explore/ExploreSearch";
import { getTrendingPoems, getFeaturedAuthors, getFeaturedCollections, getCategories } from "@/utils/supabase/queries";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { getCoverGradient, getInitials } from "@/utils/gradient";

export const metadata: Metadata = {
    title: "Explorer - ode",
    description: "Parcourez les poèmes, auteurs, recueils et catégories du catalogue de poésie ode.",
};

interface ExplorePageProps {
    searchParams: Promise<{ q?: string; theme?: string; period?: string; movement?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
    const resolvedParams = await searchParams;
    const searchQuery = resolvedParams.q;

    // Fetch all data from database in parallel
    const [trendingPoems, featuredAuthors, featuredCollections, categories] = await Promise.all([
        getTrendingPoems(8),
        getFeaturedAuthors(),
        getFeaturedCollections(),
        getCategories(),
    ]);

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">

                    {/* Search Header */}
                    <FadeIn delay={0.1}>
                        <h1 className="font-serif text-4xl md:text-5xl text-charcoal tracking-tight mb-8">
                            Explorer
                        </h1>
                        <ExploreSearch />
                    </FadeIn>

                    {!searchQuery ? (
                        <>
                            {/* Découverte Mode */}
                            <div className="flex flex-col gap-16 mt-10">
                                {/* Catégories */}
                                {categories.length > 0 && (
                                    <FadeIn delay={0.2}>
                                        <CategoryGrid categories={categories} />
                                    </FadeIn>
                                )}

                                {/* Auteurs vedettes */}
                                {featuredAuthors.length > 0 && (
                                    <FadeIn delay={0.3} className="w-full">
                                        <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Auteurs vedettes</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
                                            {featuredAuthors.map((author: any, idx: number) => (
                                                <Link href={`/author/${author.slug}`} key={author.id || idx} className="flex flex-col items-center group cursor-pointer text-center">
                                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 md:group-hover:-translate-y-2 border-2 border-transparent group-hover:border-accent/20">
                                                        {author.image_url ? (
                                                            <Image
                                                                src={author.image_url}
                                                                alt={author.name}
                                                                width={128}
                                                                height={128}
                                                                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-zinc-300 flex items-center justify-center">
                                                                <span className="text-2xl font-serif text-white">{getInitials(author.name)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-serif text-charcoal group-hover:text-accent transition-colors">
                                                        {author.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </FadeIn>
                                )}

                                {/* Recueils vedettes */}
                                {featuredCollections.length > 0 && (
                                    <FadeIn delay={0.4} className="w-full">
                                        <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Recueils populaires</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {featuredCollections.slice(0, 3).map((collection: any, index: number) => {
                                                const coverColor = getCoverGradient(collection.slug);
                                                const authorName = Array.isArray(collection.authors)
                                                    ? collection.authors.map((a: any) => a.name).join(', ')
                                                    : collection.authors?.name || '';
                                                return (
                                                    <Link href={`/collection/${collection.slug}`} key={collection.id || index}>
                                                        <div className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br ${coverColor} shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                                            <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                                                                <h3 className="font-serif text-white text-xl drop-shadow-md mb-1">{collection.title}</h3>
                                                                <p className="text-white/70 text-sm">{authorName} · {collection.publication_year || '—'}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </FadeIn>
                                )}

                                {/* Tendances */}
                                <FadeIn delay={0.5} className="w-full">
                                    <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Tendances</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {trendingPoems.slice(0, 8).map((poem: any, i: number) => (
                                            <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                                        ))}
                                    </div>
                                </FadeIn>
                            </div>
                        </>
                    ) : (
                        <FadeIn delay={0.2}>
                            <div className="mt-10">
                                <p className="text-warm-gray mb-8">
                                    Résultats pour <span className="text-charcoal font-medium">«{searchQuery}»</span>
                                </p>
                                {/* Search results will come from future search implementation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {trendingPoems.map((poem: any, i: number) => (
                                        <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
