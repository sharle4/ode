"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, BookmarkSimple } from "@phosphor-icons/react";
import { spotlightPoem } from "@/constants/mockData";
import StarRating from "@/components/ui/StarRating";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
  },
};

const BilingualSpotlight = React.memo(function BilingualSpotlight() {
  const poem = spotlightPoem;

  return (
    <motion.section
      className="py-20 md:py-32"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <motion.div
          className="mb-10 md:mb-16"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px flex-1 max-w-[40px] bg-accent/40" />
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-medium">
              Poème du jour
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal">
            {poem.title}
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-warm-gray">par {poem.author}</p>
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-warm-gray/50" />
              <span className="text-xs text-warm-gray/50">
                {poem.originalLanguage}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
          <motion.div
            className="relative"
            variants={itemVariants}
          >
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent/30 via-accent/10 to-transparent hidden md:block" />

            <p className="text-xs uppercase tracking-[0.15em] text-warm-gray/50 mb-4 font-medium">
              Original -- {poem.originalLanguage}
            </p>

            <p className="drop-cap font-serif text-xl md:text-2xl leading-loose text-charcoal/90 whitespace-pre-line">
              {poem.snippet.original}
            </p>
          </motion.div>

          <motion.div
            className="relative"
            variants={itemVariants}
          >
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-soft-border via-soft-border/30 to-transparent hidden md:block" />

            <p className="text-xs uppercase tracking-[0.15em] text-warm-gray/50 mb-4 font-medium">
              Traduction -- Français
            </p>

            <p className="font-serif text-xl md:text-2xl leading-loose text-charcoal/60 italic whitespace-pre-line">
              {poem.snippet.translation}
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 flex flex-wrap items-center gap-4 md:gap-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <StarRating rating={poem.averageRating} size={16} />
            <span className="text-sm text-warm-gray font-mono">
              {poem.averageRating.toFixed(1)}
            </span>
          </div>

          <div className="h-4 w-px bg-soft-border/60" />

          <span className="text-sm text-warm-gray/60 font-mono">
            {poem.totalLogs.toLocaleString()} lecteurs
          </span>

          <div className="h-4 w-px bg-soft-border/60" />

          <motion.button
            className="flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-accent transition-colors"
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <BookmarkSimple size={16} weight="regular" />
            Enregistrer
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
});

export default BilingualSpotlight;
