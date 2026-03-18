'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { adminActionClient } from '@/lib/safe-action'
import { CACHE_TAGS } from '@/lib/cache-keys'

// ── CATEGORIES ──

const categorySchema = z.object({
    id: z.string().uuid().optional(), // optional for create
    name: z.string().min(1).max(100),
    description: z.string().nullable().optional(),
    ornament_id: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    slug: z.string().max(100).optional(),
    type: z.enum(['THEME', 'MOVEMENT', 'ERA']).default('THEME'),
    sort_order: z.coerce.number().int().default(0),
});

export const saveCategory = adminActionClient
    .schema(categorySchema)
    .action(async ({ parsedInput, ctx: { supabase } }) => {
        let slugToInvalidate = parsedInput.slug;

        // Upsert category details
        // We use insert...on conflict or straight insert / update 
        if (parsedInput.id) {
            const { error, data } = await supabase
                .from('categories')
                .update({
                    name: parsedInput.name,
                    description: parsedInput.description,
                    ornament_id: parsedInput.ornament_id,
                    color: parsedInput.color,
                    type: parsedInput.type,
                    sort_order: parsedInput.sort_order,
                })
                .eq('id', parsedInput.id)
                .select('slug')
                .single();

            if (error) {
                return { failure: 'Failed to update category: ' + error.message };
            }
            if (data?.slug) slugToInvalidate = data.slug;
        } else {
            const { error, data } = await supabase
                .from('categories')
                .insert({
                    name: parsedInput.name,
                    description: parsedInput.description,
                    ornament_id: parsedInput.ornament_id,
                    color: parsedInput.color,
                    type: parsedInput.type,
                    sort_order: parsedInput.sort_order,
                })
                .select('slug')
                .single();

            if (error) {
                return { failure: 'Failed to create category: ' + error.message };
            }
            if (data?.slug) slugToInvalidate = data.slug;
        }

        revalidateTag(CACHE_TAGS.categories, undefined as never);
        if (slugToInvalidate) {
            revalidateTag(CACHE_TAGS.categoryDetail(slugToInvalidate), undefined as never);
        }

        return { success: true };
    });

export const deleteCategory = adminActionClient
    .schema(z.object({
        id: z.string().uuid(),
    }))
    .action(async ({ parsedInput: { id }, ctx: { supabase } }) => {
        const { data, error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .select('slug')
            .single();

        if (error) {
            return { failure: 'Failed to delete category: ' + error.message };
        }

        revalidateTag(CACHE_TAGS.categories, undefined as never);
        if (data?.slug) {
            revalidateTag(CACHE_TAGS.categoryDetail(data.slug), undefined as never);
        }

        return { success: true };
    });

// ── CATEGORY LINK MANAGEMENT (Poems, Authors, Collections) ──

export const saveCategoryPoems = adminActionClient
    .schema(z.object({
        categoryId: z.string().uuid(),
        categorySlug: z.string().max(100),
        poemIds: z.array(z.string().uuid()),
    }))
    .action(async ({ parsedInput: { categoryId, categorySlug, poemIds }, ctx: { supabase } }) => {
        // Delete existing links for this category
        const { error: deletionError } = await supabase
            .from('poem_categories')
            .delete()
            .eq('category_id', categoryId);

        if (deletionError) return { failure: 'Failed to clear previous poem links: ' + deletionError.message };

        // Insert new links with position
        if (poemIds.length > 0) {
            const insertions = poemIds.map((poemId, index) => ({
                category_id: categoryId,
                poem_id: poemId,
                position: index + 1,
            }));

            const { error: insertionError } = await supabase
                .from('poem_categories')
                .insert(insertions);

            if (insertionError) return { failure: 'Failed to insert poem links: ' + insertionError.message };
        }

        revalidateTag(CACHE_TAGS.categories, undefined as never);
        revalidateTag(CACHE_TAGS.categoryDetail(categorySlug), undefined as never);
        return { success: true };
    });

export const saveCategoryAuthors = adminActionClient
    .schema(z.object({
        categoryId: z.string().uuid(),
        categorySlug: z.string().max(100),
        authorIds: z.array(z.string().uuid()),
    }))
    .action(async ({ parsedInput: { categoryId, categorySlug, authorIds }, ctx: { supabase } }) => {
        const { error: deletionError } = await supabase
            .from('author_categories')
            .delete()
            .eq('category_id', categoryId);

        if (deletionError) return { failure: 'Failed to clear previous author links: ' + deletionError.message };

        if (authorIds.length > 0) {
            const insertions = authorIds.map((authorId, index) => ({
                category_id: categoryId,
                author_id: authorId,
                position: index + 1,
            }));

            const { error: insertionError } = await supabase
                .from('author_categories')
                .insert(insertions);

            if (insertionError) return { failure: 'Failed to insert author links: ' + insertionError.message };
        }

        revalidateTag(CACHE_TAGS.categories, undefined as never);
        revalidateTag(CACHE_TAGS.categoryDetail(categorySlug), undefined as never);
        return { success: true };
    });

export const saveCategoryCollections = adminActionClient
    .schema(z.object({
        categoryId: z.string().uuid(),
        categorySlug: z.string().max(100),
        collectionIds: z.array(z.string().uuid()),
    }))
    .action(async ({ parsedInput: { categoryId, categorySlug, collectionIds }, ctx: { supabase } }) => {
        const { error: deletionError } = await supabase
            .from('collection_categories')
            .delete()
            .eq('category_id', categoryId);

        if (deletionError) return { failure: 'Failed to clear previous collection links: ' + deletionError.message };

        if (collectionIds.length > 0) {
            const insertions = collectionIds.map((collectionId, index) => ({
                category_id: categoryId,
                collection_id: collectionId,
                position: index + 1,
            }));

            const { error: insertionError } = await supabase
                .from('collection_categories')
                .insert(insertions);

            if (insertionError) return { failure: 'Failed to insert collection links: ' + insertionError.message };
        }

        revalidateTag(CACHE_TAGS.categories, undefined as never);
        revalidateTag(CACHE_TAGS.categoryDetail(categorySlug), undefined as never);
        return { success: true };
    });
