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
            title="Trending This Week"
            subtitle="The most-logged poems across the global community"
            poems={trendingPoems}
          />

          <TrendingRow
            title="Curated for You: Japanese Haikus"
            subtitle="Based on your recent activity and taste profile"
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
