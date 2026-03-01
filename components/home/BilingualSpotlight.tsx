"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, BookmarkSimple } from "@phosphor-icons/react";
import StarRating from "@/components/ui/StarRating";

interface BilingualSpotlightProps {
  poem: any;
}

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

const BilingualSpotlight = React.memo(function BilingualSpotlight({ poem }: BilingualSpotlightProps) {

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
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-white">
            {poem.title}
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-zinc-400">par {poem.authors?.name}</p>
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-zinc-500" />
              <span className="text-xs text-zinc-500">
                Français
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

            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-4 font-medium">
              Extrait original
            </p>

            <p className="drop-cap font-serif text-xl md:text-2xl leading-loose text-zinc-300 whitespace-pre-line">
              {poem.normalized_text?.substring(0, 150) || "Poème non disponible..."}...
            </p>
          </motion.div>

          <motion.div
            className="relative"
            variants={itemVariants}
          >
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-800 via-zinc-800/30 to-transparent hidden md:block" />

            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-4 font-medium">
              Suite de l'extrait
            </p>

            <p className="font-serif text-xl md:text-2xl leading-loose text-zinc-500 italic whitespace-pre-line">
              {poem.normalized_text?.substring(150, 300) || ""}...
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 flex flex-wrap items-center gap-4 md:gap-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <StarRating rating={4.8} size={16} />
            <span className="text-sm text-zinc-400 font-mono">
              4.8
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          <span className="text-sm text-zinc-500 font-mono">
            {Math.floor(Math.random() * 5000)} lecteurs
          </span>

          <div className="h-4 w-px bg-zinc-800" />

          <motion.button
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
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
