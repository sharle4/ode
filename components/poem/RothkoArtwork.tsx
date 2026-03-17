import React from 'react';
import { RothkoGenomeSchema, type RothkoParams, mulberry32 } from '@/types/generative';

interface RothkoArtworkProps {
  /**
   * The ~150 bytes JSON pulled from Supabase (`rothko_params` column).
   * Passed as unknown for strict validation via Zod before rendering.
   */
  params: unknown;
  /**
   * Defines sizing constraints, letting the parent control the width/height.
   */
  className?: string;
  /**
   * Fallback color to display in case the data contract is violated (e.g. malformed JSON in DB).
   */
  fallbackColor?: string;
}

export function RothkoArtwork({ 
  params, 
  className = '', 
  fallbackColor = 'var(--color-charcoal)' 
}: RothkoArtworkProps) {
  
  // 1. Zod Runtime Validation
  // CRITICAL: Prevents Next.js Server Components from crashing internally (Status 500)
  // due to bad DB state (corrupted json, mismatched schemas).
  const parsed = RothkoGenomeSchema.safeParse(params);
  
  if (!parsed.success) {
    console.warn("Invalid generative artwork parameters. Gracefully falling back to baseline.", parsed.error);
    return (
      <div 
        className={`rothko-fallback ${className}`} 
        style={{ backgroundColor: fallbackColor, width: '100%', height: '100%' }}
        aria-hidden="true"
      />
    );
  }

  const data = parsed.data;
  const prng = mulberry32(data.seed);

  // 2. Semantic CSS Color Mapping
  // Ensures 100% Dark Mode compatibility by never hardcoding hex colors.
  // Tailwind/CSS vars dynamically update via the browser's theme.
  const getPaletteVar = (layerName: string) => `var(--rothko-${data.palette_id}-${layerName})`;
  const bgColor = getPaletteVar('bg');

  const numShapes = data.complexity;

  // 3. Mathematical Shape Layout Engine
  const generateLayoutOverrides = (bias: typeof data.layout_bias, index: number, total: number) => {
    // Adds organic variability using determinist PRNG
    const randX = prng() * 40 - 20; 
    const randY = prng() * 40 - 20;
    
    let baseY = (600 / total) * index + (600 / total) / 2;
    
    switch(bias) {
      case 'weighted_bottom':
        baseY = 600 - (600 / (total + 1)) * (index + 1);
        break;
      case 'weighted_top':
        baseY = (600 / (total + 1)) * (index + 1);
        break;
      case 'centered':
        baseY = 300 + (index - total / 2) * 80;
        break;
      case 'dispersed':
        baseY = prng() * 500 + 50;
        break;
    }
    
    return {
      cx: 200 + randX, // Viewbox width is 400
      cy: baseY + randY,
    };
  };

  // 4. Texture & Grain Settings mapping
  const textureFreqs = {
    smooth_silk: "0.8",
    fine_grain: "1.5",
    heavy_canvas: "0.4",
    rough_paper: "0.6"
  };
  const baseFreq = textureFreqs[data.texture_profile];

  return (
    <svg
      viewBox="0 0 400 600"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Generative Rothko Field Artwork"
      style={{
        width: '100%',
        height: '100%',
        // GPU Acceleration Fix: forces the browser to composite this svg locally 
        // mitigating scroll-jank on long poem lists.
        transform: 'translateZ(0)',
        willChange: 'transform',
        display: 'block'
      }}
    >
      <defs>
        {/* Soft edge blur. Note `colorInterpolationFilters="sRGB"` prevents artifacting */}
        <filter id={`rothko-blur-${data.seed}`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={30 + prng() * 20} result="blur" />
        </filter>

        {/* Global Texture Layer. 
            numOctaves capped at 2 to preserve iPhone battery and reduce CPU thrashing. */}
        <filter id={`rothko-grain-${data.seed}`} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency={baseFreq} 
            numOctaves="2" 
            stitchTiles="stitch" 
            result="noise" 
          />
          {/* Lower opacity of grain directly via matrix rather than CSS to limit repaints */}
          <feColorMatrix 
            type="matrix" 
            values="1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 0.12 0" 
            in="noise" 
            result="coloredNoise" 
          />
        </filter>
      </defs>

      {/* Main Canvas Background */}
      <rect width="400" height="600" fill={bgColor} />

      {/* Shapes Rendering Layer */}
      <g filter={`url(#rothko-blur-${data.seed})`}>
        {Array.from({ length: numShapes }).map((_, i) => {
          const pos = generateLayoutOverrides(data.layout_bias, i, numShapes);
          const rw = 250 + prng() * 100;
          const rh = (600 / numShapes) * 0.8 + prng() * 50;
          
          const shapeColor = getPaletteVar(`shape-${(i % 3) + 1}`);

          if (data.shape_type === 'ellipse' || data.shape_type === 'fluid_blob') {
            return (
              <ellipse 
                key={i} 
                cx={pos.cx} 
                cy={pos.cy} 
                rx={rw / 2} 
                ry={rh / 2} 
                fill={shapeColor} 
              />
            );
          }

          if (data.shape_type === 'horizontal_band') {
            return (
              <rect 
                key={i} 
                x={pos.cx - rw/2 - 50} 
                y={pos.cy - rh/2} 
                width={rw + 100} 
                height={rh * 0.6} 
                fill={shapeColor} 
                rx={10} 
              />
            );
          }

          return (
            <rect 
              key={i} 
              x={pos.cx - rw/2} 
              y={pos.cy - rh/2} 
              width={rw} 
              height={rh} 
              fill={shapeColor} 
            />
          );
        })}
      </g>

      {/* Global Grain Filter. Applied to one single DOM node globally. 
          Use CSS mixBlendMode to prevent complex feBlend node trees. */}
      <rect 
        width="100%" 
        height="100%" 
        filter={`url(#rothko-grain-${data.seed})`} 
        style={{ 
          mixBlendMode: data.blend_mode as any, 
          // Prevents the texture from capturing hover states intended for the list parent
          pointerEvents: 'none' 
        }} 
      />
    </svg>
  );
}
