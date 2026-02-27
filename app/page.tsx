import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrendingRow from "@/components/home/TrendingRow";
import BilingualSpotlight from "@/components/home/BilingualSpotlight";
import CommunityFeed from "@/components/home/CommunityFeed";
import { trendingPoems, curatedHaikus } from "@/constants/mockData";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-cream">
      <Navbar />

      <main>
        <HeroSection />

        <div id="explore">
          <TrendingRow
            title="Tendances de la semaine"
            subtitle="Les poèmes les plus partagés par la communauté mondiale"
            poems={trendingPoems}
          />

          <TrendingRow
            title="Sélection pour vous : Haïkus japonais"
            subtitle="Basé sur votre activité récente et vos préférences"
            poems={curatedHaikus}
          />
        </div>

        <BilingualSpotlight />

        <CommunityFeed />
      </main>

      <Footer />
    </div>
  );
}
