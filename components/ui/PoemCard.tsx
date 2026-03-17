"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ListPlus } from "@phosphor-icons/react";
import StarReview from "./StarReview";
import { RothkoArtwork } from "@/components/poem/RothkoArtwork";
import Link from "next/link";

interface PoemCardProps {
  poem: any;
  index: number;
  layout?: "flex" | "grid";
}

const PoemCard = React.memo(function PoemCard({ poem, index, layout = "flex" }: PoemCardProps) {
  const containerClass = `group relative cursor-pointer select-none flex flex-col gap-3 rounded-2xl focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ring-offset-cream outline-none ${
    layout === "flex" ? "flex-shrink-0 w-[200px] md:w-[240px]" : "w-full"
  }`;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "200px" });

  const handleListClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: implement list action
  };

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
      <Link href={href} className="absolute inset-0 z-0 rounded-2xl outline-none" aria-label={`Lire le poème ${poem.title}`} />

      {/* Artwork Container (Gallery Canvas style) */}
      <div 
        ref={ref}
        className="relative aspect-[4/5] rounded-xl overflow-hidden bg-soft-border/50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-zinc-900/50 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
      >
        <div className="absolute inset-0 scale-100 group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform origin-center">
          {isInView ? (
            poem.rothko_params ? (
              <div className="absolute inset-0 z-0">
                <RothkoArtwork params={poem.rothko_params} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`absolute inset-0 z-0 bg-gradient-to-br ${poem.coverGradient || 'from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900'}`} />
            )
          ) : null}
        </div>

        {/* Floating actions - Z-index higher than the invisible link */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleListClick}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-md text-charcoal shadow-sm hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent dark:bg-black/80 dark:text-cream dark:hover:bg-black"
            aria-label="Ajouter à la liste"
            title="Ajouter à la liste"
          >
            <ListPlus size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Typography Section (Outside the image, on the background) */}
      <div className="px-1 flex flex-col gap-1.5 z-10 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          <p className="font-serif text-[10px] leading-[1.2] font-medium tracking-widest uppercase text-warm-gray">
            {poem.originalLanguage || "Français"}
          </p>
          <div className="flex items-center gap-1 opacity-80">
            <StarReview review={poem.averageReview || 0} size={10} />
          </div>
        </div>
        
        <h3 className="font-serif text-charcoal text-base leading-tight font-medium line-clamp-2 text-balance group-hover:text-accent transition-colors">
          {poem.title}
        </h3>
        
        <p className="text-warm-gray text-xs line-clamp-1">
          {authorName}
        </p>
      </div>
    </motion.article>
  );
});

export default PoemCard;
