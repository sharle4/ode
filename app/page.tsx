import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrendingRow from "@/components/home/TrendingRow";
import BilingualSpotlight from "@/components/home/BilingualSpotlight";
import CommunityFeed from "@/components/home/CommunityFeed";
import AuthorRow from "@/components/home/AuthorRow";
import CategoryGrid from "@/components/explore/CategoryGrid";
import FadeIn from "@/components/ui/FadeIn";
import { getDailyPoem, getTrendingPoems } from "@/utils/supabase/queries";

export default async function Home() {
  const dailyPoem = await getDailyPoem();
  // Fetch two distinct sets of poems for the rows
  const trendingPoems = await getTrendingPoems(10);
  const curatedPoems = await getTrendingPoems(8);

  const keyAuthors = [
    { name: "Charles Baudelaire", slug: "charles-baudelaire", img: "https://upload.wikimedia.org/wikipedia/commons/1/16/Charles_Baudelaire%2C_by_Etienne_Carjat.jpg" },
    { name: "Victor Hugo", slug: "victor-hugo", img: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Victor_Hugo_by_Étienne_Carjat_1876_-_full.jpg" },
    { name: "Arthur Rimbaud", slug: "arthur-rimbaud", img: "https://upload.wikimedia.org/wikipedia/commons/1/19/Arthur_Rimbaud.jpg" },
    { name: "Paul Verlaine", slug: "paul-verlaine", img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Paul_Verlaine_1893_2.jpg" },
    { name: "Guillaume Apollinaire", slug: "guillaume-apollinaire", img: "https://upload.wikimedia.org/wikipedia/commons/8/86/Guillaume_Apollinaire.jpg" },
    { name: "Stéphane Mallarmé", slug: "stephane-mallarme", img: "https://upload.wikimedia.org/wikipedia/commons/4/49/Nadar_-_Stéphane_Mallarmé.jpg" }
  ];

  return (
    <div className="min-h-[100dvh] bg-cream">
      <Navbar />

      <main>
        <HeroSection dailyPoem={dailyPoem} />

        <div id="explore" className="pb-12 md:pb-24">
          <TrendingRow
            title="Tendances mondiales"
            subtitle="Les poèmes les plus lus et partagés cette semaine"
            poems={trendingPoems}
          />

          <FadeIn delay={0.2} duration={0.8} y={40} className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 md:py-20">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal">
                  Explorer par
                </h2>
                <p className="mt-1.5 text-sm text-warm-gray">
                  Thèmes, Mouvements et Époques
                </p>
              </div>
            </div>
            <CategoryGrid />
          </FadeIn>

          <AuthorRow
            title="Auteurs à la une"
            subtitle="Plumes intemporelles et vers inoubliables"
            authors={keyAuthors}
          />

          <TrendingRow
            title="Notre sélection pour vous"
            subtitle="Basé sur l'évolution de vos lectures"
            poems={curatedPoems as any}
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
