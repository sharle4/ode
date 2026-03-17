import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPoemBySlug } from "@/utils/supabase/queries";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PoemReader from "@/components/poem/PoemReader";
import PoemActionsWrapper from "@/components/poem/PoemActionsWrapper";
import ReviewSection from "@/components/ui/ReviewSection";
import { RothkoArtwork } from "@/components/poem/RothkoArtwork";
import { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { CreativeWork, WithContext } from "schema-dts";

interface PoemPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PoemPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const poem = await getPoemBySlug(resolvedParams.slug);

    if (!poem) {
        return { title: "Poème introuvable - ode" };
    }

    const authorName = Array.isArray(poem.authors)
        ? poem.authors.map((a: any) => a.name).join(', ')
        : (poem.authors as any)?.name || "Auteur inconnu";

    return {
        title: `${poem.title} de ${authorName} - ode`,
        description: `Lisez et découvrez "${poem.title}" par ${authorName} sur ode, la plus grande communauté de poésie.`,
    };
}

export default async function PoemPage({ params }: PoemPageProps) {
    const resolvedParams = await params;
    const poem = await getPoemBySlug(resolvedParams.slug);

    if (!poem) {
        notFound();
    }

    const authorName = Array.isArray(poem.authors)
        ? poem.authors.map((a: any) => a.name).join(', ')
        : (poem.authors as any)?.name || "Auteur inconnu";
    const authorId = Array.isArray(poem.authors)
        ? poem.authors[0]?.id
        : (poem.authors as any)?.id || '#';
    const collectionTitle = Array.isArray(poem.collections)
        ? poem.collections[0]?.title
        : (poem.collections as any)?.title;

    const jsonLd: WithContext<CreativeWork> = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: poem.title,
        author: {
            '@type': 'Person',
            name: authorName,
        },
        text: (poem as any).normalized_text || "Texte du poème",
        datePublished: poem.publication_year?.toString(),
        inLanguage: poem.language || 'fr',
    };

    return (
        <div className="min-h-screen bg-cream relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* Immersive Rothko Background (Fade to bottom) */}
            {poem.rothko_params && (
                <div className="absolute top-0 left-0 right-0 h-[80vh] w-full z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-multiply dark:mix-blend-screen dark:opacity-30">
                    <RothkoArtwork 
                        params={poem.rothko_params} 
                        className="w-full h-full object-cover scale-110 blur-xl md:blur-3xl transform-gpu" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cream to-transparent dark:from-zinc-950" />
                </div>
            )}

            <div className="relative z-10">
                <Navbar />

                <main className="pb-32">
                    {/* Header Immersif */}
                    <FadeIn delay={0.1}>
                        <header className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Meta Categories */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 md:mb-8 text-xs uppercase tracking-[0.15em] font-medium text-warm-gray">
                                {poem.language && (
                                    <span className="px-3 py-1 bg-paper border border-soft-border rounded-full">
                                        {poem.language}
                                    </span>
                                )}
                                {poem.publication_year && (
                                    <span className="px-3 py-1 bg-paper border border-soft-border rounded-full">
                                        {poem.publication_year}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tighter leading-[1.1] text-charcoal mb-8 text-balance mx-auto">
                                {poem.title}
                            </h1>

                            {/* Author details */}
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Link
                                    href={`/author/${authorId}`}
                                    className="text-lg md:text-xl text-warm-gray hover:text-charcoal transition-colors italic"
                                >
                                    Par {authorName} {poem.publication_year ? `(${poem.publication_year})` : ""}
                                </Link>

                                {collectionTitle && (
                                    <p className="text-sm text-warm-gray/60 font-serif">
                                        Tiré du recueil <span className="italic">« {collectionTitle} »</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </header>
                </FadeIn>

                {/* Separator */}
                <FadeIn delay={0.3}>
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-soft-border to-transparent" />
                    </div>
                </FadeIn>

                {/* Corps du Poème */}
                <FadeIn delay={0.5}>
                    <PoemReader content={poem.content} />
                </FadeIn>

                {/* Avis & Notes — placed after reading, not intrusive */}
                <ReviewSection
                    averageReview={poem.average_review || 0}
                    totalReviews={poem.reviews_count || 0}
                    variant="minimal"
                />

            </main>

                <Suspense fallback={null}>
                    <PoemActionsWrapper poemId={poem.id} />
                </Suspense>

                <Footer />
            </div>
        </div>
    );
}
