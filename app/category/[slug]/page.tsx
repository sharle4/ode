import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PoemCard from "@/components/ui/PoemCard";
import CollectionCard from "@/components/author/CollectionCard";
import { getCategoryWithContent } from "@/utils/supabase/queries";
import FadeIn from "@/components/ui/FadeIn";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getInitials, getCoverGradient } from "@/utils/gradient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const category = await getCategoryWithContent(resolvedParams.slug);
    const categoryName = category?.name || resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `${categoryName} | ode`,
        description: category?.description || `Explorez la catégorie ${categoryName} sur ode.`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const categorySlug = resolvedParams.slug;

    const categoryData = await getCategoryWithContent(categorySlug);

    if (!categoryData) {
        notFound();
    }

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* HERO CATEGORY */}
                <section className="relative w-full pt-32 pb-16 flex flex-col items-center overflow-hidden bg-charcoal text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-black/80 z-0"></div>
                    <FadeIn delay={0.1} className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
                        <span className="text-sm font-sans uppercase tracking-widest text-white/70 mb-4 block">Découverte</span>
                        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl mb-6 leading-tight drop-shadow-md">
                            {categoryData.name}
                        </h1>
                        {categoryData.description && (
                            <p className="font-serif text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                                {categoryData.description}
                            </p>
                        )}
                    </FadeIn>
                </section>

                <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-24 flex flex-col gap-16">

                    {/* Poèmes Phares */}
                    {categoryData.poems && categoryData.poems.length > 0 && (
                        <FadeIn delay={0.2} className="w-full">
                            <div className="flex items-end justify-between mb-6 border-b border-soft-border pb-2">
                                <h2 className="font-serif text-2xl text-charcoal">Poèmes majeurs</h2>
                                <span className="text-sm uppercase tracking-widest text-warm-gray cursor-pointer hover:text-accent transition-colors">Tout voir</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {categoryData.poems.map((poem: any, i: number) => (
                                    <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                                ))}
                            </div>
                        </FadeIn>
                    )}

                    {/* Auteurs Emblématiques */}
                    {categoryData.authors && categoryData.authors.length > 0 && (
                        <FadeIn delay={0.3} className="w-full">
                            <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Figures emblématiques</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
                                {categoryData.authors.map((author: any, idx: number) => (
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

                    {/* Recueils Fondateurs */}
                    {categoryData.collections && categoryData.collections.length > 0 && (
                        <FadeIn delay={0.4} className="w-full">
                            <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Recueils fondateurs</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl">
                                {categoryData.collections.map((collection: any, index: number) => (
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

                </section>
            </main>

            <Footer />
        </div>
    );
}
