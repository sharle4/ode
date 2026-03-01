"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ListPlus } from "@phosphor-icons/react";
import type { Poem } from "@/types";
import StarRating from "./StarRating";

interface PoemCardProps {
  poem: any;
  index: number;
}

const PoemCard = React.memo(function PoemCard({ poem, index }: PoemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      className="relative flex-shrink-0 w-[200px] md:w-[240px] cursor-pointer select-none"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.08,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br ${poem.coverGradient || 'from-zinc-900 to-zinc-800'}`}
        whileHover={{ scale: 1.03 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
          <div className="space-y-1.5">
            <p className="font-serif text-white/50 text-xs tracking-wide uppercase">
              {poem.originalLanguage}
            </p>
            <h3 className="font-serif text-white text-lg leading-tight font-medium">
              {poem.title}
            </h3>
            <p className="text-white/60 text-sm">{poem.authors?.name || poem.author || "Auteur inconnu"}</p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent" />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-zinc-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StarRating interactive size={22} />

              <div className="flex items-center gap-3">
                <motion.button
                  className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] px-3.5 py-2 text-white text-xs backdrop-blur-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.18)" }}
                  whileTap={{ scale: 0.95, y: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                >
                  <ListPlus size={14} weight="bold" />
                  Lister
                </motion.button>

                <motion.button
                  className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-white text-xs font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                >
                  <BookOpen size={14} weight="bold" />
                  Lire
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-3 px-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating rating={poem.averageRating || 0} size={12} />
            <span className="text-zinc-400 text-xs font-mono">
              {(poem.averageRating || 0).toFixed(1)}
            </span>
          </div>
          <span className="text-zinc-500 text-xs font-mono">
            {(poem.totalLogs || 0).toLocaleString()} ajouts
          </span>
        </div>
      </div>
    </motion.article>
  );
});

export default PoemCard;
