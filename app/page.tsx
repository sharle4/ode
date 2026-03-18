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
import { getDailyPoem, getTrendingPoems, getFeaturedAuthors, getFeaturedCollections, getCommunityFeed, getPlatformStats, getCategories, getPoemReviewDistribution } from "@/utils/supabase/queries";

export default async function Home() {
  // Fetch ALL data from database in parallel. Using allSettled so one failing query
  // doesn't crash the entire landing page — each section degrades independently.
  const [
    dailyPoemResult,
    trendingPoemsResult,
    authorsResult,
    collectionsResult,
    communityResult,
    statsResult,
  ] = await Promise.allSettled([
    getDailyPoem(),
    getTrendingPoems(10),
    getFeaturedAuthors(),
    getFeaturedCollections(),
    getCommunityFeed(8),
    getPlatformStats(),
  ]);

  const dailyPoem = dailyPoemResult.status === 'fulfilled' ? dailyPoemResult.value : null;
  const trendingPoems = trendingPoemsResult.status === 'fulfilled' ? trendingPoemsResult.value : [];
  const featuredAuthors = authorsResult.status === 'fulfilled' ? authorsResult.value : [];
  const featuredCollections = collectionsResult.status === 'fulfilled' ? collectionsResult.value : [];
  const communityFeed = communityResult.status === 'fulfilled' ? communityResult.value : [];
  const platformStats = statsResult.status === 'fulfilled' ? statsResult.value : { poemsCount: 0, collectionsCount: 0, authorsCount: 0 };

  // Fetch review distribution for the daily poem if available
  let dailyPoemReviews: any[] = [];
  if (dailyPoem?.id) {
    try {
      dailyPoemReviews = await getPoemReviewDistribution(dailyPoem.id);
    } catch { /* non-critical */ }
  }

  // Derive curated poems from trending to avoid a redundant database hit
  const curatedPoems = trendingPoems?.slice(0, 8) ?? [];

  return (
    <div className="min-h-[100dvh] bg-cream">
      <Navbar />

      <main>
        <HeroSection dailyPoem={dailyPoem} stats={platformStats} />

        <section id="explore" className="pb-12 md:pb-24">
          <TrendingRow
            title="Poèmes tendances"
            subtitle="Les poèmes les plus lus et parcourés cette semaine"
            poems={trendingPoems}
          />

          {featuredAuthors.length > 0 && (
            <AuthorRow
              title="Auteurs à l'honneur"
              subtitle="Plumes intemporelles et vers inoubliables"
              authors={featuredAuthors}
            />
          )}

          {featuredCollections.length > 0 && (
            <CollectionRow
              title="Recueils en vogue"
              subtitle="Les recueils qui font parler d'eux en ce moment"
              collections={featuredCollections}
            />
          )}

          <TrendingRow
            title="Notre sélection pour vous"
            subtitle="Basé sur l'évolution de vos lectures"
            poems={curatedPoems}
          />
        </section>

        {dailyPoem && <BilingualSpotlight poem={dailyPoem} reviewDistribution={dailyPoemReviews} />}

        <FadeIn delay={0.4}>
          <CommunityFeed activities={communityFeed} />
        </FadeIn>
      </main>

      <Footer />
    </div>
  );
}
