import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollectionHeader from "@/components/collection/CollectionHeader";
import PoemListItem from "@/components/collection/PoemListItem";
import ReviewSection from "@/components/ui/ReviewSection";
import FadeIn from "@/components/ui/FadeIn";
import { Metadata } from "next";
import { getCollectionWithSections } from "@/utils/supabase/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const collection = await getCollectionWithSections(resolvedParams.slug);

    const collectionTitle = collection?.title || resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `${collectionTitle} - Recueil de poésie | ode`,
        description: collection?.summary
            ? collection.summary.substring(0, 160) + '...'
            : `Lisez les poèmes du recueil ${collectionTitle} sur ode.`,
    };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const collectionSlug = resolvedParams.slug;
    const collectionData = await getCollectionWithSections(collectionSlug);

    if (!collectionData) {
        notFound();
    }

    // Get author name from the collection's authors join
    const authorName = Array.isArray(collectionData.authors)
        ? collectionData.authors.map((a: any) => a.name).join(', ')
        : (collectionData.authors as any)?.name || '';
    const authorSlug = Array.isArray(collectionData.authors)
        ? collectionData.authors[0]?.slug
        : (collectionData.authors as any)?.slug || '';

    let globalPoemIndex = 0;

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* 1. Header du Recueil */}
                <CollectionHeader collection={{
                    title: collectionData.title,
                    authorName,
                    authorSlug,
                    year: collectionData.publication_year || 0,
                    poemCount: collectionData.poems_count || collectionData.allPoems?.length || 0,
                    description: collectionData.summary || '',
                    averageReview: collectionData.average_review || 0,
                    reviewsCount: collectionData.reviews_count || 0,
                }} />

                {/* 2. Table des Matières */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <h2 className="font-serif text-3xl text-charcoal mb-10 text-center">Table des Matières</h2>

                    {collectionData.sections && collectionData.sections.length > 0 ? (
                        <div className="flex flex-col gap-12">
                            {collectionData.sections.map((section: any, sIndex: number) => (
                                <FadeIn key={sIndex} delay={0.2 + sIndex * 0.1}>
                                    <section className="bg-paper p-6 md:p-8 rounded-2xl border border-soft-border shadow-sm">
                                        <h3 className="font-serif text-2xl text-accent mb-6 pb-4 border-b border-soft-border">
                                            {section.title}
                                        </h3>

                                        <div className="flex flex-col">
                                            {section.poems.map((poem: any) => {
                                                globalPoemIndex++;
                                                return (
                                                    <PoemListItem
                                                        key={poem.id}
                                                        poem={{
                                                            id: poem.id,
                                                            title: poem.title,
                                                            likes: poem.reads_count || 0,
                                                        }}
                                                        order={globalPoemIndex}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </section>
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-warm-gray italic font-serif py-12">
                            Aucun poème disponible pour ce recueil.
                        </p>
                    )}
                </div>

                {/* Avis & Notes */}
                <ReviewSection
                    averageReview={collectionData.average_review || 0}
                    totalReviews={collectionData.reviews_count || 0}
                    variant="full"
                />

            </main>

            <Footer />
        </div>
    );
}
