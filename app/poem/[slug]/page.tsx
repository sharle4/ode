import { notFound } from "next/navigation";
import { getPoemBySlug } from "@/utils/supabase/queries";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PoemReader from "@/components/poem/PoemReader";
import PoemActions from "@/components/poem/PoemActions";
import { Metadata } from "next";
import Link from "next/link";

interface PoemPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PoemPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const poem = await getPoemBySlug(resolvedParams.slug);

    if (!poem) {
        return { title: "Poème introuvable - ode" };
    }

    const authorName = poem.authors?.name || "Auteur inconnu";

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

    const authorName = poem.authors?.name || "Auteur inconnu";
    const collectionTitle = poem.collections?.title;

    return (
        <div className="min-h-screen bg-cream">
            <Navbar />

            <main className="pb-32">
                {/* Header Immersif */}
                <header className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 md:mb-8 text-xs uppercase tracking-[0.15em] font-medium text-warm-gray">
                            {poem.originalLanguage && (
                                <span className="px-3 py-1 bg-paper border border-soft-border rounded-full">
                                    {poem.originalLanguage}
                                </span>
                            )}
                            {poem.publicationYear && (
                                <span className="px-3 py-1 bg-paper border border-soft-border rounded-full">
                                    {poem.publicationYear}
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
                                href={`/author/${poem.authors?.id || '#'}`}
                                className="text-lg md:text-xl text-warm-gray hover:text-charcoal transition-colors italic"
                            >
                                Par {authorName}
                            </Link>

                            {collectionTitle && (
                                <p className="text-sm text-warm-gray/60 font-serif">
                                    Tiré du recueil <span className="italic">« {collectionTitle} »</span>
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                {/* Separator */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-soft-border to-transparent" />
                </div>

                {/* Corps du Poème */}
                <PoemReader content={poem.content} />

            </main>

            <PoemActions poemId={poem.id} />

            <Footer />
        </div>
    );
}
