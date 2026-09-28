import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createListSchema = z.object({
    title: z.string().trim().min(1, "Le titre est requis").max(100, "Le titre ne doit pas dépasser 100 caractères"),
    description: z.string().trim().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
    isPublic: z.boolean().default(true),
    isRanked: z.boolean().default(false),
});

const updateListSchema = z.object({
    listId: z.string().uuid(),
    title: z.string().trim().min(1, "Le titre est requis").max(100),
    description: z.string().trim().max(1000).optional().nullable(),
    isPublic: z.boolean(),
    isRanked: z.boolean(),
});

const addPoemToListSchema = z.object({
    listId: z.string().uuid(),
    poemId: z.string().uuid(),
    notes: z.string().trim().max(1000).optional(),
});

const reorderListItemsSchema = z.object({
    listId: z.string().uuid(),
    orderedPoemIds: z.array(z.string().uuid()),
});

const toggleListLikeSchema = z.object({
    listId: z.string().uuid(),
    targetState: z.boolean(),
});

describe('Lists Zod Schemas Validation', () => {
    describe('createListSchema', () => {
        it('should validate a standard thematic list', () => {
            const result = createListSchema.safeParse({
                title: 'Poèmes romantiques du XIXe siècle',
                description: 'Une anthologie personnelle de vers mélancoliques.',
                isPublic: true,
                isRanked: false,
            });
            expect(result.success).toBe(true);
        });

        it('should validate a ranked top list', () => {
            const result = createListSchema.safeParse({
                title: 'Mon Top 10 Baudelaire',
                isRanked: true,
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.isRanked).toBe(true);
                expect(result.data.isPublic).toBe(true);
            }
        });

        it('should reject empty or whitespace-only title', () => {
            const result = createListSchema.safeParse({
                title: '   ',
            });
            expect(result.success).toBe(false);
        });

        it('should reject title exceeding 100 characters', () => {
            const result = createListSchema.safeParse({
                title: 'A'.repeat(101),
            });
            expect(result.success).toBe(false);
        });
    });

    describe('updateListSchema', () => {
        it('should validate a valid update payload', () => {
            const result = updateListSchema.safeParse({
                listId: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Nouveau Titre',
                description: 'Nouvelle description',
                isPublic: false,
                isRanked: true,
            });
            expect(result.success).toBe(true);
        });

        it('should reject non-UUID listId', () => {
            const result = updateListSchema.safeParse({
                listId: 'not-a-uuid',
                title: 'Nouveau Titre',
                isPublic: true,
                isRanked: false,
            });
            expect(result.success).toBe(false);
        });
    });

    describe('addPoemToListSchema', () => {
        it('should validate poem addition with curator note', () => {
            const result = addPoemToListSchema.safeParse({
                listId: '123e4567-e89b-12d3-a456-426614174000',
                poemId: '123e4567-e89b-12d3-a456-426614174001',
                notes: 'Un de mes vers favoris de Rimbaud.',
            });
            expect(result.success).toBe(true);
        });
    });

    describe('reorderListItemsSchema', () => {
        it('should validate list reorder payload with poem UUIDs', () => {
            const result = reorderListItemsSchema.safeParse({
                listId: '123e4567-e89b-12d3-a456-426614174000',
                orderedPoemIds: [
                    '123e4567-e89b-12d3-a456-426614174001',
                    '123e4567-e89b-12d3-a456-426614174002',
                    '123e4567-e89b-12d3-a456-426614174003',
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should reject non-UUID elements in orderedPoemIds', () => {
            const result = reorderListItemsSchema.safeParse({
                listId: '123e4567-e89b-12d3-a456-426614174000',
                orderedPoemIds: ['123', 'invalid-uuid'],
            });
            expect(result.success).toBe(false);
        });
    });

    describe('toggleListLikeSchema', () => {
        it('should validate liking a list', () => {
            const result = toggleListLikeSchema.safeParse({
                listId: '123e4567-e89b-12d3-a456-426614174000',
                targetState: true,
            });
            expect(result.success).toBe(true);
        });

        it('should validate unliking a list', () => {
            const result = toggleListLikeSchema.safeParse({
                listId: '123e4567-e89b-12d3-a456-426614174000',
                targetState: false,
            });
            expect(result.success).toBe(true);
        });
    });
});
