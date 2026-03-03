import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PoemCard from "@/components/ui/PoemCard";
import CollectionCard from "@/components/author/CollectionCard";
import { getTrendingPoems } from "@/utils/supabase/queries";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const categoryName = resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `${categoryName} | ode`,
        description: `Explorez la catégorie ${categoryName} sur ode. Poèmes, recueils et auteurs emblématiques.`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const categorySlug = resolvedParams.slug;
    const title = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // --- MOCK DATA --- 
    const trendingPoems = await getTrendingPoems(4);

    const mockedAuthors = [
        { name: "Charles Baudelaire", slug: "charles-baudelaire", img: "https://upload.wikimedia.org/wikipedia/commons/1/16/Charles_Baudelaire%2C_by_Etienne_Carjat.jpg" },
        { name: "Victor Hugo", slug: "victor-hugo", img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Victor_Hugo_by_Ã%89tienne_Carjat_1876_-_full.jpg" },
        { name: "Arthur Rimbaud", slug: "arthur-rimbaud", img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Arthur_Rimbaud_by_Etienne_Carjat.jpg" },
        { name: "Paul Verlaine", slug: "paul-verlaine", img: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Paul_Verlaine_1893.jpg" },
    ];

    const mockedCollections = [
        { title: "Les Fleurs du mal", slug: "les-fleurs-du-mal", year: 1857, poemCount: 163, coverColor: "from-zinc-800 to-black" },
        { title: "Les Contemplations", slug: "les-contemplations", year: 1856, poemCount: 158, coverColor: "from-blue-900 to-black" },
        { title: "Illuminations", slug: "illuminations", year: 1886, poemCount: 42, coverColor: "from-emerald-900 to-zinc-900" },
    ];

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-[72px]">
                {/* HERO CATEGORY */}
                <section className="relative w-full pt-20 pb-16 flex flex-col items-center overflow-hidden bg-charcoal text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-black/80 z-0"></div>
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 text-center">
                        <span className="text-sm font-sans uppercase tracking-widest text-white/70 mb-4 block">Découverte</span>
                        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl mb-6 leading-tight drop-shadow-md">
                            {title}
                        </h1>
                        <p className="font-serif text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                            Plongez au cœur des œuvres essentielles de ce mouvement ou genre. Découvrez ses poètes majeurs, ses vers mythiques et ses recueils fondateurs.
                        </p>
                    </div>
                </section>

                <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24 flex flex-col gap-16 animate-in fade-in duration-500">

                    {/* Poèmes Phares */}
                    <div>
                        <div className="flex items-end justify-between mb-6 border-b border-soft-border pb-2">
                            <h2 className="font-serif text-2xl text-charcoal">Poèmes majeurs</h2>
                            <span className="text-sm uppercase tracking-widest text-warm-gray cursor-pointer hover:text-accent transition-colors">Tout voir</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {trendingPoems.map((poem: any, i: number) => (
                                <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                            ))}
                        </div>
                    </div>

                    {/* Auteurs Emblématiques */}
                    <div>
                        <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Figures emblématiques</h2>
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

                    {/* Recueils Fondateurs */}
                    <div>
                        <h2 className="font-serif text-2xl text-charcoal mb-6 border-b border-soft-border pb-2">Recueils fondateurs</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl">
                            {mockedCollections.map((collection, index) => (
                                <CollectionCard key={index} collection={collection} index={index} />
                            ))}
                        </div>
                    </div>

                </section>
            </main>

            <Footer />
        </div>
    );
}
