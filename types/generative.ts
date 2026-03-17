import { z } from 'zod';

export const RothkoGenomeSchema = z.object({
  seed: z.number().int(),
  palette_id: z.enum([
    'crimson_fog',
    'deep_void',
    'morning_paper',
    'melancholy',
    'golden_haze',
    'ocean_depths',
    'sunset_ash',
    'forest_whisper'
  ]),
  shape_type: z.enum([
    'ellipse',
    'fluid_blob',
    'horizontal_band',
    'rectangle'
  ]),
  layout_bias: z.enum([
    'centered',
    'weighted_bottom',
    'weighted_top',
    'dispersed'
  ]),
  complexity: z.number().min(1).max(5),
  texture_profile: z.enum([
    'smooth_silk',
    'fine_grain',
    'heavy_canvas',
    'rough_paper'
  ]),
  blend_mode: z.enum([
    'multiply',
    'screen',
    'overlay',
    'color-burn',
    'hard-light',
    'normal'
  ]),
});

export type RothkoParams = z.infer<typeof RothkoGenomeSchema>;

/**
 * A lightweight Pseudo-Random Number Generator (Mulberry32)
 * Ensures deterministic rendering based on the seed.
 */
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
