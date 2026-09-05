import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollectionHeader from "@/components/collection/CollectionHeader";
import PoemListItem from "@/components/collection/PoemListItem";
import ReviewSection from "@/components/ui/ReviewSection";
import FadeIn from "@/components/ui/FadeIn";
import { Metadata } from "next";
import { getCollectionWithSections } from "@/utils/supabase/queries";
import { getCoverGradient } from "@/utils/gradient";
import { createClient } from "@/utils/supabase/server";
import { formatAuthors } from "@/utils/author";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const collection = await getCollectionWithSections(resolvedParams.slug);

    const collectionTitle = collection?.title || resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const authorInfo = formatAuthors(collection?.authors);
    const authorDesc = authorInfo.count > 0 ? ` (${authorInfo.displayText})` : '';

    return {
        title: `${collectionTitle}${authorDesc} - ode`,
        description: collection?.summary
            ? collection.summary.substring(0, 160) + '...'
            : `Lisez les poèmes du recueil ${collectionTitle}${authorDesc} sur ode.`,
    };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const collectionSlug = resolvedParams.slug;
    const collectionData = await getCollectionWithSections(collectionSlug);

    if (!collectionData) {
        notFound();
    }

    // Canonical redirect if accessed via UUID but collection has a slug
    if (collectionData.slug && collectionData.slug !== collectionSlug) {
        redirect(`/collection/${collectionData.slug}`);
    }

    // Check user like state
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    let isLiked = false;

    if (userData?.user) {
        const { data: likeData } = await supabase
            .from('collection_likes')
            .select('user_id')
            .eq('user_id', userData.user.id)
            .eq('collection_id', collectionData.id)
            .maybeSingle();

        if (likeData) isLiked = true;
    }

    // Normalisation et formatage des auteurs
    const authorInfo = formatAuthors(collectionData.authors);

    let globalPoemIndex = 0;

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* 1. Header du Recueil */}
                <CollectionHeader collection={{
                    id: collectionData.id,
                    title: collectionData.title,
                    slug: collectionData.slug,
                    authorName: authorInfo.displayText,
                    authorSlug: authorInfo.authors[0]?.slug || '',
                    authors: authorInfo.authors,
                    year: collectionData.publication_year || 0,
                    poemCount: collectionData.poems_count || collectionData.allPoems?.length || 0,
                    coverColor: getCoverGradient(collectionData.slug || ''),
                    description: collectionData.summary || '',
                    averageReview: collectionData.average_review || 0,
                    reviewsCount: collectionData.reviews_count || 0,
                    initialIsLiked: isLiked,
                    likesCount: collectionData.likes_count || 0,
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
                                                            slug: poem.slug,
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
