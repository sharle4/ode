import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollectionHeader from "@/components/collection/CollectionHeader";
import PoemListItem from "@/components/collection/PoemListItem";
import ReviewSection from "@/components/ui/ReviewSection";
import FadeIn from "@/components/ui/FadeIn";
import { Metadata } from "next";
import { getCollectionBySlug } from "@/utils/supabase/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const collectionTitle = resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `${collectionTitle} - Recueil de poésie | ode`,
        description: `Lisez les poèmes du recueil ${collectionTitle} sur ode. Parcourez la table des matières de cette œuvre classique.`,
    };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const collectionSlug = resolvedParams.slug;
    const collectionData = await getCollectionBySlug(collectionSlug);

    // --- MOCK DATA --- 
    // Dans une version avec BDD, ceci serait un appel à Supabase récupérant `collections` et ses `poems` triés par `order_index`.
    const mockedCollection = {
        title: collectionData?.title || collectionSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        authorName: "Charles Baudelaire",
        authorSlug: "charles-baudelaire",
        year: collectionData?.publication_year || 1857,
        poemCount: collectionData?.poems_count || 163,
        coverColor: "from-zinc-800 to-black",
        description: collectionData?.summary || "Œuvre majeure de la poésie française, Les Fleurs du mal intègre le romantisme, le Parnasse et le symbolisme.",
        averageReview: collectionData?.average_review || 4.6,
        reviewsCount: collectionData?.reviews_count || 892
    };

    // Mock des poèmes groupés par "Section" (Livre/Partie) - comme demandé
    const mockedSections = [
        {
            title: "Spleen et Idéal",
            poems: [
                { id: "1", title: "Bénédiction", likes: 89 },
                { id: "2", title: "L'Albatros", likes: 342 },
                { id: "3", title: "Élévation", likes: 156 },
                { id: "4", title: "Correspondances", likes: 231 },
                { id: "10", title: "L'Ennemi", likes: 198 },
                { id: "11", title: "Le Guignon", likes: 76 },
                { id: "12", title: "La Vie antérieure", likes: 112 },
            ]
        },
        {
            title: "Tableaux parisiens",
            poems: [
                { id: "86", title: "Paysage", likes: 65 },
                { id: "87", title: "Le Soleil", likes: 43 },
                { id: "88", title: "À une mendiante rousse", likes: 134 },
                { id: "89", title: "Le Cygne", likes: 210 },
            ]
        },
        {
            title: "Le Vin",
            poems: [
                { id: "104", title: "L'Âme du vin", likes: 98 },
                { id: "105", title: "Le Vin des chiffonniers", likes: 87 },
            ]
        }
    ];

    if (collectionSlug !== "les-fleurs-du-mal") {
        // Optionnel : ne permet de tester visuellement que sur cette route mockée
        // notFound();
    }

    let globalPoemIndex = 0; // Pour maintenir la numérotation globale au fil des sections

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* 1. Header du Recueil */}
                <CollectionHeader collection={mockedCollection} />

                {/* 2. Table des Matières (Liste des poèmes organisée par sections) */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <h2 className="font-serif text-3xl text-charcoal mb-10 text-center">Table des Matières</h2>

                    <div className="flex flex-col gap-12">
                        {mockedSections.map((section, sIndex) => (
                            <FadeIn key={sIndex} delay={0.2 + sIndex * 0.1}>
                                <section className="bg-paper p-6 md:p-8 rounded-2xl border border-soft-border shadow-sm">
                                    <h3 className="font-serif text-2xl text-accent mb-6 pb-4 border-b border-soft-border">
                                        {section.title}
                                    </h3>

                                    <div className="flex flex-col">
                                        {section.poems.map((poem) => {
                                            globalPoemIndex++; // Incrémentation continue
                                            return (
                                                <PoemListItem
                                                    key={poem.id}
                                                    poem={poem}
                                                    order={globalPoemIndex}
                                                />
                                            );
                                        })}
                                    </div>
                                </section>
                            </FadeIn>
                        ))}
                    </div>
                </div>

                {/* Avis & Notes */}
                <ReviewSection
                    averageReview={mockedCollection.averageReview}
                    totalReviews={mockedCollection.reviewsCount}
                    variant="full"
                />

            </main>

            <Footer />
        </div>
    );
}
