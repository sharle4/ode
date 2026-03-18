"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { RothkoArtwork } from "@/components/poem/RothkoArtwork";
import Link from "next/link";

interface PoemCardProps {
  poem: any;
  index: number;
  layout?: "flex" | "grid";
}

const PoemCard = React.memo(function PoemCard({ poem, index, layout = "flex" }: PoemCardProps) {
  const containerClass = `group relative cursor-pointer select-none flex flex-col gap-3.5 rounded-2xl focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ring-offset-cream outline-none ${
    layout === "flex" ? "flex-shrink-0 w-[200px] md:w-[240px]" : "w-full"
  }`;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "200px" });

  const authorName = poem.authors?.length
    ? poem.authors.map((a: any) => a.name).join(', ')
    : poem.author?.name || "Auteur inconnu";
    
  // Support both direct slug or slug inside a nested generic structure if any.
  // We prefer poem.slug, fallback to poem.id
  const href = `/poem/${poem.slug || poem.id}`;

  return (
    <motion.article
      className={containerClass}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.05,
      }}
    >
      {/* Invisible Link Pattern for A11y - Covers the whole relative card */}
      <Link href={href} className="absolute inset-0 z-20 rounded-2xl outline-none" aria-label={`Lire le poème ${poem.title} par ${authorName}`} />

      {/* Artwork Container (Gallery Canvas style) */}
      <div 
        ref={ref}
        className="relative aspect-[4/5] rounded-xl overflow-hidden bg-soft-border/50 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:shadow-lg dark:bg-zinc-900/50"
      >
        <div className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
          {isInView ? (
            poem.rothko_params ? (
              <div className="absolute inset-0 z-0">
                <RothkoArtwork 
                  params={poem.rothko_params} 
                  className="w-full h-full object-cover" 
                  shapesClassName="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:saturate-[1.3] group-hover:brightness-110 group-hover:hue-rotate-[10deg]"
                />
              </div>
            ) : (
              <div className={`absolute inset-0 z-0 bg-gradient-to-br transition-all duration-700 group-hover:saturate-[1.3] group-hover:brightness-110 ${poem.coverGradient || 'from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900'}`} />
            )
          ) : null}
        </div>

        {/* Elegant overlay on hover for deeper color modification */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 mix-blend-overlay transition-colors duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-10 pointer-events-none" />

        {/* Subtle inner border for elegance */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10 z-10 pointer-events-none" />
      </div>

      {/* Typography Section (Outside the image, on the background) */}
      <div className="px-1 flex flex-col gap-1 z-10 pointer-events-none">
        <h3 className="font-serif text-charcoal text-lg md:text-xl leading-snug font-medium line-clamp-2 text-balance group-hover:text-accent transition-colors duration-500">
          {poem.title}
        </h3>
        
        <p className="text-warm-gray text-xs md:text-[13px] font-sans tracking-wide uppercase mt-0.5 line-clamp-1 group-hover:text-charcoal transition-colors duration-500">
          {authorName}
        </p>
      </div>
    </motion.article>
  );
});

export default PoemCard;
