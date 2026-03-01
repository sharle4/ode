import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrendingRow from "@/components/home/TrendingRow";
import BilingualSpotlight from "@/components/home/BilingualSpotlight";
import CommunityFeed from "@/components/home/CommunityFeed";
import { getDailyPoem, getTrendingPoems } from "@/utils/supabase/queries";

export default async function Home() {
  const dailyPoem = await getDailyPoem();
  // Fetch two distinct sets of poems for the rows
  const trendingPoems = await getTrendingPoems(10);
  const curatedPoems = await getTrendingPoems(8);

  return (
    <div className="min-h-[100dvh] bg-zinc-950">
      <Navbar />

      <main>
        <HeroSection dailyPoem={dailyPoem} />

        <div id="explore">
          <TrendingRow
            title="Tendances de la semaine"
            subtitle="Les poèmes les plus partagés par la communauté mondiale"
            poems={trendingPoems}
          />

          <TrendingRow
            title="Notre Sélection pour vous"
            subtitle="Basé sur votre activité récente et vos préférences"
            poems={curatedPoems as any}
          />
        </div>

        {dailyPoem && <BilingualSpotlight poem={dailyPoem} />}

        <CommunityFeed />
      </main>

      <Footer />
    </div>
  );
}
