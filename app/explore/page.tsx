import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/explore/SearchBar";
import FilterPills from "@/components/explore/FilterPills";
import PoemCard from "@/components/ui/PoemCard";
import CollectionCard from "@/components/author/CollectionCard";
import { getTrendingPoems } from "@/utils/supabase/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explorer | ode",
    description: "Recherchez et découvrez des poèmes, des auteurs et des recueils."
};

// Next.js 14+ recommande de rendre la page dynamique si on utilise searchParams pour éviter les erreurs de build statique
export const dynamic = 'force-dynamic';

export default async function ExplorePage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const rawParams = await searchParams;

    // --- LECTURE DES PARAMÈTRES D'URL (URL-DRIVEN SEARCH) ---
    const query = typeof rawParams.q === 'string' ? rawParams.q : '';
    const theme = typeof rawParams.theme === 'string' ? rawParams.theme : '';
    const period = typeof rawParams.period === 'string' ? rawParams.period : '';

    const isSearching = query.length > 0 || theme.length > 0 || period.length > 0;

    // --- MOCK DATA --- 
    // Dans le futur, ceci proviendra de Supabase: await supabase.from('').select().textSearch()..
    const trendingPoems = await getTrendingPoems(4);

    const mockedAuthors = [
        { name: "Charles Baudelaire", slug: "charles-baudelaire", img: "https://upload.wikimedia.org/wikipedia/commons/1/16/Charles_Baudelaire%2C_by_Etienne_Carjat.jpg" },
        { name: "Arthur Rimbaud", slug: "arthur-rimbaud", img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Arthur_Rimbaud_by_Etienne_Carjat.jpg" },
        { name: "Paul Verlaine", slug: "paul-verlaine", img: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Paul_Verlaine_1893.jpg" },
        { name: "Victor Hugo", slug: "victor-hugo", img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Victor_Hugo_by_Ã%89tienne_Carjat_1876_-_full.jpg" }
    ];

    const mockedCollections = [
        { title: "Les Contemplations", slug: "les-contemplations", year: 1856, poemCount: 158, coverColor: "from-blue-900 to-black" },
        { title: "Illuminations", slug: "illuminations", year: 1886, poemCount: 42, coverColor: "from-emerald-900 to-zinc-900" },
        { title: "Poèmes saturniens", slug: "poemes-saturniens", year: 1866, poemCount: 37, coverColor: "from-stone-800 to-black" },
    ];

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-[72px]">

                {/* HERO SEARCH SECTION */}
                <section className="w-full pt-16 pb-8 px-4 sm:px-6 flex flex-col items-center">
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal mb-8 text-center leading-tight">
                        Que cherchez-vous ?
                    </h1>

                    {/* Suspens nécessaire pour le useSearchParams côté client dans SearchBar/FilterPills */}
                    <Suspense fallback={<div className="h-16 w-full max-w-3xl bg-black/5 animate-pulse rounded-2xl"></div>}>
                        <SearchBar />
                    </Suspense>

                    <Suspense fallback={<div className="h-12 w-full mt-6 bg-black/5 animate-pulse rounded-full"></div>}>
                        <FilterPills />
                    </Suspense>
                </section>

                {/* CONTENT SECTION : DISCOVERY OR SEARCH RESULTS */}
                <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">

                    {isSearching ? (
                        /* ETAT : RECHERCHE ACTIVE */
                        <div className="flex flex-col gap-12 animate-in fade-in duration-500">
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-6 flex items-center gap-3">
                                    Résultats pour <span className="text-accent italic">"{query || theme || period}"</span>
                                </h2>

                                {/* Mock Résultats Poèmes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {trendingPoems.map((poem: any, i: number) => (
                                        <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ETAT : DÉCOUVERTE PAR DÉFAUT */
                        <div className="flex flex-col gap-16 animate-in fade-in duration-500">

                            {/* Découverte: Poèmes */}
                            <div>
                                <div className="flex items-end justify-between mb-6">
                                    <h2 className="font-serif text-2xl text-charcoal">Poèmes Tendances</h2>
                                    <span className="text-sm uppercase tracking-widest text-warm-gray cursor-pointer hover:text-accent transition-colors">Voir tout</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {trendingPoems.map((poem: any, i: number) => (
                                        <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                                    ))}
                                </div>
                            </div>

                            {/* Découverte: Auteurs */}
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-6">Auteurs à l'honneur</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
                                    {mockedAuthors.map((author, idx) => (
                                        <a href={`/author/${author.slug}`} key={idx} className="flex flex-col items-center group cursor-pointer text-center">
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 md:group-hover:-translate-y-2 border-2 border-transparent group-hover:border-accent/20">
                                                <img
                                                    src={author.img}
                                                    alt={author.name}
                                                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                />
                                            </div>
                                            <span className="font-serif text-charcoal group-hover:text-accent transition-colors">
                                                {author.name}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Découverte: Recueils */}
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal mb-6">Recueils Incontournables</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl">
                                    {mockedCollections.map((collection, index) => (
                                        <CollectionCard key={index} collection={collection} index={index} />
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                </section>
            </main>

            <Footer />
        </div>
    );
}
