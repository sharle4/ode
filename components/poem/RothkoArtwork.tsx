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
        {/* 1. Global Texture Layer */}
        <filter id={`rothko-grain-${data.seed}`} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency={baseFreq} 
            numOctaves="2" 
            stitchTiles="stitch" 
            result="noise" 
          />
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

        {/* 2. Edge Vibration Filter (Point A) 
            Uses high frequency turbulence to displace only the edges of shapes. */}
        <filter id={`rothko-vibration-${data.seed}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.04" 
            numOctaves="3" 
            seed={data.seed} 
            result="vibrationNoise" 
          />
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="vibrationNoise" 
            scale={15} 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>

        {/* 3. Soft Glow / Feathering */}
        <filter id={`rothko-glow-${data.seed}`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
           <feGaussianBlur stdDeviation="6" result="blur" />
           <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Main Background Layer */}
      <rect width="400" height="600" fill={bgColor} />

      {/* 2. Background Depth Layers (Density dependent) 
          Creates that "under-painting" feeling. */}
      {data.density !== 'sparse' && (
        <g opacity="0.3">
          <rect 
            width="400" 
            height="300" 
            fill={`color-mix(in srgb, ${getPaletteVar('shape-1')}, ${bgColor} 70%)`} 
            filter={`url(#rothko-vibration-${data.seed})`}
          />
          <rect 
            y="300" 
            width="400" 
            height="300" 
            fill={`color-mix(in srgb, ${getPaletteVar('shape-2')}, ${bgColor} 70%)`} 
            filter={`url(#rothko-vibration-${data.seed})`}
          />
        </g>
      )}

      {/* 3. Main Shapes Layer (Point A: Vibration applied here) */}
      <g filter={`url(#rothko-vibration-${data.seed})`}>
        {Array.from({ length: numShapes }).map((_, i) => {
          const pos = generateLayoutOverrides(data.layout_bias, i, numShapes);
          
          // Width: Expanded to fill canvas (Point B / Logic)
          const rw = 360 + prng() * 40; // 90-100% of 400
          const rh = (600 / numShapes) * (data.shape_type === 'stacked_fields' ? 1.0 : 0.7) + prng() * 40;
          
          // Point D: Dynamic Intervals using color-mix
          const colorA = getPaletteVar(`shape-${(i % 5) + 1}`);
          const colorB = getPaletteVar(`shape-${((i + 1) % 5) + 1}`);
          const mixPercentage = 20 + prng() * 60;
          const shapeColor = `color-mix(in srgb, ${colorA}, ${colorB} ${mixPercentage}%)`;

          // Opacity Style logic
          const opacity = data.opacity_style === 'opaque' ? 1 : 
                          data.opacity_style === 'translucent' ? 0.6 : 0.85;

          const commonProps = {
            fill: shapeColor,
            opacity: opacity,
            filter: `url(#rothko-glow-${data.seed})`
          };

          if (data.shape_type === 'ellipse' || data.shape_type === 'fluid_blob') {
            return (
              <ellipse 
                key={i}
                {...commonProps}
                cx={pos.cx} 
                cy={pos.cy} 
                rx={rw / 2} 
                ry={rh / 2} 
              />
            );
          }

          if (data.shape_type === 'horizontal_band' || data.shape_type === 'stacked_fields') {
            const yOffset = data.shape_type === 'stacked_fields' ? (600 / numShapes) * i : pos.cy - rh/2;
            const height = data.shape_type === 'stacked_fields' ? (600 / numShapes) + 5 : rh;
            
            return (
              <rect 
                key={i}
                {...commonProps}
                x={200 - rw/2} 
                y={yOffset} 
                width={rw} 
                height={height} 
                rx={data.shape_type === 'stacked_fields' ? 0 : 4} 
              />
            );
          }

          if (data.shape_type === 'gradient_wash') {
             return (
               <rect 
                 key={i}
                 {...commonProps}
                 x={0}
                 y={pos.cy - rh}
                 width={400}
                 height={rh * 2}
                 opacity={opacity * 0.5}
               />
             );
          }

          return (
            <rect 
              key={i}
              {...commonProps}
              x={pos.cx - rw/2} 
              y={pos.cy - rh/2} 
              width={rw} 
              height={rh} 
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
