"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

// Schema conditionally validates based on the action type
const onboardingSchema = z.object({
  action: z.enum(["submit", "skip"]),
  authors: z.array(z.string().uuid()).max(5),
  categories: z.array(z.string().uuid()).max(5),
  typography: z.enum(["serif", "sans"]).default("serif"),
  theme: z.enum(["dark", "light", "system"]).default("system"),
  fontSize: z.enum(["small", "medium", "large", "xlarge"]).default("medium"),
}).refine(
  (data) => {
    // If they explicitly submit, they must have chosen at least one of each
    if (data.action === "submit") {
      if (data.authors.length === 0 || data.categories.length === 0) {
        return false;
      }
    }
    return true;
  },
  { message: "Veuillez sélectionner au moins un auteur et une catégorie pour continuer.", path: ["authors"] }
);

export const submitOnboarding = actionClient
  .schema(onboardingSchema)
  .action(async ({ parsedInput }) => {
    // We instantiate the client here (which uses cookies() under the hood)
    // so that later refreshSession() sets cookies properly in the browser.
    const supabase = await createClient();

    const status = parsedInput.action === "submit" ? "completed" : "skipped";

    const payload = {
      p_status: status,
      p_typography: parsedInput.typography,
      p_theme: parsedInput.theme,
      p_font_size: parsedInput.fontSize,
      p_authors: parsedInput.authors,
      p_categories: parsedInput.categories,
    };

    const { error: rpcError } = await supabase.rpc("complete_user_onboarding", payload);

    if (rpcError) {
      console.error("RPC complete_user_onboarding failed:", rpcError);
      return { failure: "Une erreur est survenue lors de la sauvegarde de vos préférences." };
    }

    // Crucial: Refresh the server-side session to force the JWT update
    // Downstream, this `supabase` client writes the Set-Cookie headers back to the browser
    const { error: refreshError, data: sessionData } = await supabase.auth.refreshSession();
    
    // Fallback if refresh fails 
    if (refreshError || !sessionData.session) {
      await supabase.auth.getUser();
    }

    // Purge the router cache for the home page (and layout) so that when redirected to `/`, 
    // it performs a fresh server render including the newly unlocked "For You" segments.
    revalidatePath("/", "layout");

    return { success: true };
  });
