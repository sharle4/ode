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

if (error || !user) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
}

// Basic Rate Limiting
const now = Date.now();
const lastRequestTime = rateLimitMap.get(user.id) || 0;

// 1 action per second rate limit
if (now - lastRequestTime < 1000) {
    throw new Error("Veuillez patienter avant de refaire cette action.");
}
rateLimitMap.set(user.id, now);

return next({ ctx: { supabase, user } });
});
