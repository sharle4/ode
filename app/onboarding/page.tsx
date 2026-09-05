import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingWizard from "./onboarding-wizard";

export const metadata = {
  title: "Bienvenue - ode",
  description: "Configurez vos auteurs favoris et vos préférences de lecture.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pre-fetch data for the wizard in parallel
  const [categoriesResult, authorsResult] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("authors").select("id, name, slug, image_url").order("name").limit(50), // Fetch top 50 
  ]);

  const categories = categoriesResult.data || [];
  const authors = authorsResult.data || [];

  return (
    <main className="min-h-[100dvh] w-full bg-cream dark:bg-zinc-950 selection:bg-rose-900/30">
      <OnboardingWizard initialCategories={categories} initialAuthors={authors} />
    </main>
  );
}
