import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrendingRow from "@/components/home/TrendingRow";
import BilingualSpotlight from "@/components/home/BilingualSpotlight";
import CommunityFeed from "@/components/home/CommunityFeed";
import AuthorRow from "@/components/home/AuthorRow";
import CollectionRow from "@/components/home/CollectionRow";
import CategoryGrid from "@/components/explore/CategoryGrid";
import FadeIn from "@/components/ui/FadeIn";
import { getDailyPoem, getTrendingPoems } from "@/utils/supabase/queries";

export default async function Home() {
  // Fetch data in parallel to avoid waterfalls
  const [dailyPoem, trendingPoems] = await Promise.all([
    getDailyPoem(),
    getTrendingPoems(10)
  ]);
  
  // Derive curated poems from trending to avoid a redundant database hit
  const curatedPoems = trendingPoems ? trendingPoems.slice(0, 8) : [];

  const keyAuthors = [
    { name: "Charles Baudelaire", slug: "charles-baudelaire", img: "https://upload.wikimedia.org/wikipedia/commons/1/16/Charles_Baudelaire%2C_by_Etienne_Carjat.jpg" },
    { name: "Victor Hugo", slug: "victor-hugo", img: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Victor_Hugo_by_Étienne_Carjat_1876_-_full.jpg" },
    { name: "Arthur Rimbaud", slug: "arthur-rimbaud", img: "https://upload.wikimedia.org/wikipedia/commons/1/19/Arthur_Rimbaud.jpg" },
    { name: "Paul Verlaine", slug: "paul-verlaine", img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Paul_Verlaine_1893_2.jpg" },
    { name: "Guillaume Apollinaire", slug: "guillaume-apollinaire", img: "https://upload.wikimedia.org/wikipedia/commons/8/86/Guillaume_Apollinaire.jpg" },
    { name: "Stéphane Mallarmé", slug: "stephane-mallarme", img: "https://upload.wikimedia.org/wikipedia/commons/4/49/Nadar_-_Stéphane_Mallarmé.jpg" }
  ];

  const trendingCollections = [
    { title: "Les Fleurs du mal", slug: "les-fleurs-du-mal", authors: [{ id: "charles-baudelaire-id", name: "Charles Baudelaire", slug: "charles-baudelaire" }], year: 1857, poemCount: 163, coverColor: "from-zinc-800 to-black" },
    { title: "Les Contemplations", slug: "les-contemplations", authors: [{ id: "victor-hugo-id", name: "Victor Hugo", slug: "victor-hugo" }], year: 1856, poemCount: 158, coverColor: "from-indigo-900 to-zinc-900" },
    { title: "Alcools", slug: "alcools", authors: [{ id: "guillaume-apollinaire-id", name: "Guillaume Apollinaire", slug: "guillaume-apollinaire" }], year: 1913, poemCount: 50, coverColor: "from-amber-900 to-zinc-900" },
    { title: "Le Spleen de Paris", slug: "le-spleen-de-paris", authors: [{ id: "charles-baudelaire-id", name: "Charles Baudelaire", slug: "charles-baudelaire" }], year: 1869, poemCount: 50, coverColor: "from-stone-700 to-zinc-900" },
    { title: "Romances sans paroles", slug: "romances-sans-paroles", authors: [{ id: "paul-verlaine-id", name: "Paul Verlaine", slug: "paul-verlaine" }], year: 1874, poemCount: 21, coverColor: "from-emerald-900 to-zinc-900" },
    { title: "Une Saison en enfer", slug: "une-saison-en-enfer", authors: [{ id: "arthur-rimbaud-id", name: "Arthur Rimbaud", slug: "arthur-rimbaud" }], year: 1873, poemCount: 9, coverColor: "from-red-900 to-zinc-900" },
    { title: "Les Épaves", slug: "les-epaves", authors: [{ id: "charles-baudelaire-id", name: "Charles Baudelaire", slug: "charles-baudelaire" }], year: 1866, poemCount: 23, coverColor: "from-violet-900 to-zinc-900" },
    { title: "L'Après-midi d'un faune", slug: "lapres-midi-dun-faune", authors: [{ id: "stéphane-mallarmé-id", name: "Stéphane Mallarmé", slug: "stéphane-mallarmé" }], year: 1876, poemCount: 1, coverColor: "from-teal-900 to-zinc-900" },
  ];

  return (
    <div className="min-h-[100dvh] bg-cream">
      <Navbar />

      <main>
        <HeroSection dailyPoem={dailyPoem} />

        <div id="explore" className="pb-12 md:pb-24">
          <TrendingRow
            title="Tendances mondiales"
            subtitle="Les poèmes les plus lus et parcategoryés cette semaine"
            poems={trendingPoems}
          />

          <AuthorRow
            title="Auteurs à la une"
            subtitle="Plumes intemporelles et vers inoubliables"
            authors={keyAuthors}
          />

          <CollectionRow
            title="Recueils en vogue"
            subtitle="Les recueils qui font parler d'eux en ce moment"
            collections={trendingCollections}
          />

          <TrendingRow
            title="Notre sélection pour vous"
            subtitle="Basé sur l'évolution de vos lectures"
            poems={curatedPoems}
          />
        </div>

        {dailyPoem && <BilingualSpotlight poem={dailyPoem} />}

        <FadeIn delay={0.4}>
          <CommunityFeed />
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}

