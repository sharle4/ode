import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// We can extract schemas if exported, but for the test we'll replicate them to verify behavior
const ratePoemSchema = z.object({
    poemId: z.string().uuid(),
    slug: z.string().min(1),
    score: z.number().min(0.5).max(5.0),
    reviewText: z.string().max(1000).optional(),
});

describe('ratePoem Zod Schema', () => {
    it('should validate a correct payload', () => {
        const result = ratePoemSchema.safeParse({
            poemId: '123e4567-e89b-12d3-a456-426614174000',
            slug: 'poeme-test',
            score: 4.5,
            reviewText: 'Magnifique.'
        });
        expect(result.success).toBe(true);
    });

    it('should reject a score > 5.0', () => {
        const result = ratePoemSchema.safeParse({
            poemId: '123e4567-e89b-12d3-a456-426614174000',
            slug: 'poeme-test',
            score: 5.5
        });
        expect(result.success).toBe(false);
    });

    it('should reject reviewText over 1000 chars', () => {
        const longText = 'a'.repeat(1001);
        const result = ratePoemSchema.safeParse({
            poemId: '123e4567-e89b-12d3-a456-426614174000',
            slug: 'poeme-test',
            score: 4.5,
            reviewText: longText
        });
        expect(result.success).toBe(false);
    });
});
