import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const poemLikeSchema = z.object({
    poemId: z.string().uuid(),
    slug: z.string().min(1),
    targetState: z.boolean()
});

const collectionLikeSchema = z.object({
    collectionId: z.string().uuid(),
    slug: z.string().min(1),
    targetState: z.boolean()
});

const authorLikeSchema = z.object({
    authorId: z.string().uuid(),
    slug: z.string().min(1),
    targetState: z.boolean()
});

describe('Likes Zod Schemas', () => {
    describe('Poem Like Schema', () => {
        it('should validate valid poem like payload', () => {
            const valid = poemLikeSchema.safeParse({
                poemId: '123e4567-e89b-12d3-a456-426614174000',
                slug: 'le-dormeur-du-val',
                targetState: true
            });
            expect(valid.success).toBe(true);
        });

        it('should reject invalid UUID for poemId', () => {
            const invalid = poemLikeSchema.safeParse({
                poemId: 'not-a-valid-uuid',
                slug: 'le-dormeur-du-val',
                targetState: true
            });
            expect(invalid.success).toBe(false);
        });

        it('should reject empty slug', () => {
            const invalid = poemLikeSchema.safeParse({
                poemId: '123e4567-e89b-12d3-a456-426614174000',
                slug: '',
                targetState: false
            });
            expect(invalid.success).toBe(false);
        });
    });

    describe('Collection Like Schema', () => {
        it('should validate valid collection like payload', () => {
            const valid = collectionLikeSchema.safeParse({
                collectionId: '123e4567-e89b-12d3-a456-426614174001',
                slug: 'les-fleurs-du-mal',
                targetState: true
            });
            expect(valid.success).toBe(true);
        });

        it('should reject invalid collectionId', () => {
            const invalid = collectionLikeSchema.safeParse({
                collectionId: 'abc-123',
                slug: 'les-fleurs-du-mal',
                targetState: true
            });
            expect(invalid.success).toBe(false);
        });
    });

    describe('Author Like Schema', () => {
        it('should validate valid author like payload', () => {
            const valid = authorLikeSchema.safeParse({
                authorId: '123e4567-e89b-12d3-a456-426614174002',
                slug: 'charles-baudelaire',
                targetState: true
            });
            expect(valid.success).toBe(true);
        });

        it('should reject invalid authorId', () => {
            const invalid = authorLikeSchema.safeParse({
                authorId: 'invalid-id',
                slug: 'charles-baudelaire',
                targetState: false
            });
            expect(invalid.success).toBe(false);
        });
    });
});
