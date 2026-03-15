"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-keys";

// Schema for profile update
const updateProfileSchema = z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores."),
    description: z.string().max(200).optional().nullable(),
    annotationColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Code couleur invalide."),
    avatarUrl: z.string().url().optional().nullable(),
});

export const updateProfile = authActionClient
    .schema(updateProfileSchema)
    .action(async ({ parsedInput, ctx }) => {
        const { supabase, user } = ctx;

        // Fetch current user to know if we need to invalidate multiple caches
        const { data: currentUser } = await supabase
            .from("users")
            .select("username")
            .eq("id", user.id)
            .single();

        if (!currentUser) throw new Error("Utilisateur introuvable.");

        // Check if username is already taken by someone else
        if (parsedInput.username !== currentUser.username) {
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("username", parsedInput.username)
                .single();

            if (existingUser) {
                throw new Error("Ce nom d'utilisateur est déjà pris.");
            }
        }

        // Update profile
        const { error } = await supabase
            .from("users")
            .update({
                username: parsedInput.username,
                description: parsedInput.description || null,
                annotation_color: parsedInput.annotationColor,
                avatar_url: parsedInput.avatarUrl || null,
            })
            .eq("id", user.id);

        if (error) throw new Error("Erreur lors de la mise à jour du profil.");

        // Revalidate caches
        revalidateTag(`profile-${currentUser.username}`);
        if (parsedInput.username !== currentUser.username) {
            revalidateTag(`profile-${parsedInput.username}`);
        }

        return { success: true, username: parsedInput.username };
    });

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export const updatePassword = authActionClient
    .schema(updatePasswordSchema)
    .action(async ({ parsedInput, ctx }) => {
        const { supabase, user } = ctx;

        if (!user.email) {
            throw new Error("Impossible de changer le mot de passe pour un compte sans email.");
        }

        // Verify current password first to ensure absolute security
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: parsedInput.currentPassword,
        });

        if (signInError) {
            throw new Error("Le mot de passe actuel est incorrect.");
        }

        // Proceed to update
        const { error } = await supabase.auth.updateUser({
            password: parsedInput.newPassword,
        });

        if (error) {
            throw new Error(`Erreur lors du changement de mot de passe: ${error.message}`);
        }

        return { success: true };
    });

const updateFavoritesSchema = z.object({
    topAuthors: z.array(z.string()).max(3, "Maximum 3 auteurs."),
    topPoems: z.array(z.string()).max(3, "Maximum 3 poèmes."),
});

export const updateFavorites = authActionClient
    .schema(updateFavoritesSchema)
    .action(async ({ parsedInput, ctx }) => {
        const { supabase, user } = ctx;

        // Efficient delete of existing favorites to avoid unique constraint violations
        await supabase.from("user_top_authors").delete().eq("user_id", user.id);
        await supabase.from("user_top_poems").delete().eq("user_id", user.id);

        if (parsedInput.topAuthors.length > 0) {
            const authorInserts = parsedInput.topAuthors.map((id, index) => ({
                user_id: user.id,
                author_id: id,
                position: index + 1,
            }));
            const { error: authorErr } = await supabase.from("user_top_authors").insert(authorInserts);
            if (authorErr) throw new Error("Erreur lors de la sauvegarde des auteurs favoris.");
        }

        if (parsedInput.topPoems.length > 0) {
            const poemInserts = parsedInput.topPoems.map((id, index) => ({
                user_id: user.id,
                poem_id: id,
                position: index + 1,
            }));
            const { error: poemErr } = await supabase.from("user_top_poems").insert(poemInserts);
            if (poemErr) throw new Error("Erreur lors de la sauvegarde des poèmes favoris.");
        }

        // We must fetch the username to invalidate cache correctly
        const { data: activeUser } = await supabase
            .from("users")
            .select("username")
            .eq("id", user.id)
            .single();

        if (activeUser) {
            revalidateTag(`profile-${activeUser.username}`);
        }

        return { success: true };
    });

const searchContentSchema = z.object({
    query: z.string().min(1),
    type: z.enum(["author", "poem"]),
});

export const searchContent = authActionClient
    .schema(searchContentSchema)
    .action(async ({ parsedInput, ctx }) => {
        const { supabase } = ctx;

        if (parsedInput.type === "author") {
            const { data, error } = await supabase
                .from("authors")
                .select("id, name")
                .ilike("name", `%${parsedInput.query}%`)
                .limit(10);

            if (error) throw new Error("Erreur lors de la recherche des auteurs.");
            return data.map((d) => ({ id: d.id, label: d.name }));
        }

        if (parsedInput.type === "poem") {
            const { data, error } = await supabase
                .from("poems")
                .select("id, title, authors!inner(name)")
                .ilike("title", `%${parsedInput.query}%`)
                .limit(10);

            if (error) throw new Error("Erreur lors de la recherche des poèmes.");
            return data.map((d: any) => ({
                id: d.id,
                label: d.title,
                sublabel: Array.isArray(d.authors) ? d.authors.map((a: any) => a.name).join(', ') : d.authors?.name || '',
            }));
        }

        return [];
    });
