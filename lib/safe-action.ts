import { createSafeActionClient } from "next-safe-action";
import { createClient } from "@/utils/supabase/server";

// Base client for public actions
export const actionClient = createSafeActionClient({
    handleServerError(e: Error) {
        if (e instanceof Error) {
            return e.message;
        }
        return "Une erreur inattendue s'est produite.";
    },
});

// Authenticated client requiring user login
export const authActionClient = actionClient.use(async ({ next }) => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Vous devez être connecté pour effectuer cette action.");
    }

    // TODO: Implémenter un vrai Rate Limiting distribué (Upstash Redis ou table Supabase RPC).
    // Ne pas utiliser de Map Javascript en mémoire dans un environnement Serverless.

    return next({ ctx: { supabase, user } });
});
