import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
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
import { formatAuthors } from "@/utils/author";

interface PoemPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PoemPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const poem = await getPoemBySlug(resolvedParams.slug);

    if (!poem) {
        return { title: "Poème introuvable - ode" };
    }

    const authorInfo = formatAuthors(poem.authors);
    const authorName = authorInfo.count > 0 ? authorInfo.displayText : "Auteur inconnu";

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

    // Canonical redirect if accessed via UUID but poem has a slug
    if (poem.slug && poem.slug !== resolvedParams.slug) {
        redirect(`/poem/${poem.slug}`);
    }

    const authorInfo = formatAuthors(poem.authors);
    const authorsList = authorInfo.authors;
    const authorName = authorInfo.displayText;

    const collectionTitle = Array.isArray(poem.collections)
        ? poem.collections[0]?.title
        : (poem.collections as any)?.title;
    const collectionSlug = Array.isArray(poem.collections)
        ? poem.collections[0]?.slug
        : (poem.collections as any)?.slug;

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

            <div className="relative z-10">
                <Navbar />

                <main className="pb-32">
                    {/* Header Immersif */}
                    <FadeIn delay={0.1}>
                        <header className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6">
                            <div className="max-w-4xl mx-auto text-center">

                                {/* Title */}
                                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tighter leading-[1.1] text-charcoal mb-8 text-balance mx-auto">
                                    {poem.title}
                                </h1>

                                {/* Author details */}
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="text-lg md:text-xl text-warm-gray italic">
                                        Par{" "}
                                        {authorInfo.count === 1 && (
                                            authorsList[0].slug ? (
                                                <Link
                                                    href={`/author/${authorsList[0].slug}`}
                                                    className="hover:text-charcoal transition-colors not-italic font-serif"
                                                >
                                                    {authorsList[0].name}
                                                </Link>
                                            ) : (
                                                <span className="not-italic font-serif">{authorsList[0].name}</span>
                                            )
                                        )}
                                        {authorInfo.count === 2 && (
                                            <span className="not-italic font-serif inline-flex items-center gap-1.5 flex-wrap">
                                                {authorsList[0].slug ? (
                                                    <Link
                                                        href={`/author/${authorsList[0].slug}`}
                                                        className="hover:text-charcoal transition-colors"
                                                    >
                                                        {authorsList[0].name}
                                                    </Link>
                                                ) : (
                                                    <span>{authorsList[0].name}</span>
                                                )}
                                                <span className="text-warm-gray/60 font-sans text-base">&</span>
                                                {authorsList[1].slug ? (
                                                    <Link
                                                        href={`/author/${authorsList[1].slug}`}
                                                        className="hover:text-charcoal transition-colors"
                                                    >
                                                        {authorsList[1].name}
                                                    </Link>
                                                ) : (
                                                    <span>{authorsList[1].name}</span>
                                                )}
                                            </span>
                                        )}
                                        {authorInfo.count > 2 && (
                                            <span className="not-italic font-serif">Auteurs multiples</span>
                                        )}
                                        {authorInfo.count === 0 && (
                                            <span className="not-italic font-serif">Auteur inconnu</span>
                                        )}
                                        {poem.publication_year ? ` (${poem.publication_year})` : ""}
                                    </div>

                                    {collectionTitle && (
                                        <p className="text-sm text-warm-gray/60 font-serif">
                                            Tiré du recueil{" "}
                                            {collectionSlug ? (
                                                <Link
                                                    href={`/collection/${collectionSlug}`}
                                                    className="italic hover:text-charcoal transition-colors"
                                                >
                                                    « {collectionTitle} »
                                                </Link>
                                            ) : (
                                                <span className="italic">« {collectionTitle} »</span>
                                            )}
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
