import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthorHeader from "@/components/author/AuthorHeader";
import CollectionCard from "@/components/author/CollectionCard";
import PoemCard from "@/components/ui/PoemCard";
import { getTrendingPoems } from "@/utils/supabase/queries";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    // Basic formatting from slug for now ("charles-baudelaire" -> "Charles Baudelaire")
    const authorName = resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
        title: `${authorName} - Poèmes et Biographie | ode`,
        description: `Explorez l'œuvre poétique de ${authorName} sur ode. Parcourez ses recueils et ses poèmes les plus célèbres.`,
    };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const authorSlug = resolvedParams.slug;

    // --- MOCK DATA --- 
    // Dans le futur, ceci proviendra de Supabase: await supabase.from('authors').select('*').eq('slug', authorSlug)
    const mockedAuthor = {
        name: authorSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        birthYear: 1821,
        deathYear: 1867,
        bioShort: "Poète français, Charles Baudelaire est l'un des poètes les plus célèbres du XIXe siècle. Il est connu pour son recueil de poèmes, Les Fleurs du mal, qui a fait scandale à sa parution en 1857 pour son exploration de thèmes sulfureux.",
        coverImage: "https://upload.wikimedia.org/wikipedia/commons/1/16/Charles_Baudelaire%2C_by_Etienne_Carjat.jpg", // Photo libre de droits
    };

    const mockedCollections = [
        { title: "Les Fleurs du mal", year: 1857, poemCount: 163, coverColor: "from-zinc-800 to-black" },
        { title: "Le Spleen de Paris", year: 1869, poemCount: 50, coverColor: "from-amber-900 to-zinc-900" },
        { title: "Les Épaves", year: 1866, poemCount: 23, coverColor: "from-stone-700 to-zinc-900" },
    ];

    // Utilisation de mocks temporaires pour les poèmes populaires de l'auteur
    const popularPoems = await getTrendingPoems(5);

    if (authorSlug !== "charles-baudelaire") {
        // Pour les tests, on autorise charles-baudelaire. Sinon 404.
        // nOtFound(); // Temporairement désactivé pour laisser voir la maquette universellement
    }

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-[72px]">
                {/* 1. Hero Header */}
                <AuthorHeader author={mockedAuthor} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                    {/* Colonne Principale (Top 5 & Recueils) */}
                    <div className="lg:col-span-8 flex flex-col gap-20">

                        {/* SECTION: Poèmes Populaires */}
                        <section>
                            <h2 className="font-serif text-2xl text-charcoal mb-8 border-b border-soft-border pb-4 flex items-center justify-between">
                                Poèmes Populaires
                                <span className="text-sm font-sans text-warm-gray font-normal cursor-pointer hover:text-charcoal transition-colors">Tout voir</span>
                            </h2>
                            <div className="flex flex-col gap-4">
                                {popularPoems.slice(0, 5).map((poem: any, index: number) => (
                                    <Link key={poem.id} href={`/poem/${poem.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                        <span className="w-6 text-center text-warm-gray font-serif text-lg">{index + 1}</span>
                                        <div className="w-12 h-12 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center text-white/20">
                                            {/* Miniature (idéalement image, ici placeholder initiales) */}
                                            {poem.title.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-serif text-charcoal group-hover:text-accent transition-colors">{poem.title}</h3>
                                            <p className="text-xs text-warm-gray uppercase tracking-widest mt-1">{poem.likes || 142} likes</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* SECTION: Recueils */}
                        <section>
                            <h2 className="font-serif text-2xl text-charcoal mb-8 border-b border-soft-border pb-4">
                                Recueils
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                                {mockedCollections.map((collection, index) => (
                                    <CollectionCard key={index} collection={collection} index={index} />
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Colonne Latérale (À propos, Stats, Liens) */}
                    <aside className="lg:col-span-4 flex flex-col gap-12">

                        {/* SECTION: À propos */}
                        <section>
                            <h2 className="font-serif text-xl text-charcoal mb-6">À propos</h2>
                            <div className="bg-paper p-6 md:p-8 rounded-2xl border border-soft-border">
                                <p className="text-charcoal/80 font-serif leading-relaxed text-sm mb-6 drop-cap">
                                    Charles-Pierre Baudelaire est né à Paris le 9 avril 1821 et y est mort le 31 août 1867. Il est l'un des poètes majeurs du XIXe siècle. Il s'attache à extraire la beauté du mal, transcendant les conventions morales de son époque.
                                </p>
                                <p className="text-charcoal/80 font-serif leading-relaxed text-sm">
                                    Influencé par Edgar Allan Poe, qu'il a traduit, et par les Romantiques, il est le pont entre le Romantisme et le Symbolisme. Ses poèmes sont marqués par la dualité entre le spleen et l'idéal.
                                </p>
                                <button className="mt-8 text-accent hover:text-charcoal text-sm uppercase tracking-widest transition-colors w-full text-center border border-accent/20 rounded-full py-2 hover:border-black/10">
                                    Lire la biographie complète
                                </button>
                            </div>
                        </section>

                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}
