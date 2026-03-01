"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";
import OdeLogo from "@/components/ui/OdeLogo";

interface HeroSectionProps {
  dailyPoem: any;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
  },
};

const HeroSection = React.memo(function HeroSection({ dailyPoem }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 min-h-[100dvh] items-center">
          <motion.div
            className="flex flex-col justify-center pt-28 pb-8 md:pt-0 md:pb-0 md:pr-16 lg:pr-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="mb-6"
              variants={itemVariants}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-soft-border bg-paper/50 backdrop-blur-sm px-3.5 py-1.5 text-xs text-warm-gray shadow-[inset_0_1px_0_rgba(26,26,26,0.05)]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                La plus grande base de données de poésie
              </span>
            </motion.div>

            <h1 className="font-serif text-4xl md:text-6xl tracking-tighter leading-none text-charcoal text-balance">
              {dailyPoem ? (
                <>
                  Plongez dans l'œuvre de <br />
                  <span className="italic text-warm-gray">{dailyPoem.authors?.name}</span>
                </>
              ) : (
                <>
                  Découvrez, notez et
                  <br />
                  <span className="italic text-warm-gray">partagez la poésie.</span>
                </>
              )}
            </h1>

            <motion.p
              className="mt-6 text-base text-warm-gray leading-relaxed max-w-[52ch]"
              variants={itemVariants}
            >
              Explorez la plus grande base de données de poèmes au monde. Lisez des œuvres de toutes les époques, notez vos coups de cœur et créez votre propre anthologie avec notre communauté de lecteurs passionnés.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              variants={itemVariants}
            >
              <motion.button
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98] active:-translate-y-[1px]"
                whileTap={{ scale: 0.98 }}
              >
                Explorer
                <ArrowRight size={16} weight="bold" />
              </motion.button>

              <motion.button
                className="inline-flex items-center gap-2 rounded-full border border-soft-border/60 px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-paper active:scale-[0.98] active:-translate-y-[1px]"
                whileTap={{ scale: 0.98 }}
              >
                <BookOpen size={16} weight="regular" />
                Ajouter un poème
              </motion.button>
            </motion.div>

            <motion.div
              className="mt-14 flex items-center gap-6"
              variants={itemVariants}
            >
              <div>
                <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">
                  42.8k
                </p>
                <p className="text-xs text-warm-gray/70 mt-0.5">Poèmes catalogués</p>
              </div>
              <div className="h-8 w-px bg-soft-border" />
              <div>
                <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">
                  127
                </p>
                <p className="text-xs text-warm-gray/70 mt-0.5">Langues</p>
              </div>
              <div className="h-8 w-px bg-soft-border" />
              <div>
                <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">
                  18.3k
                </p>
                <p className="text-xs text-warm-gray/70 mt-0.5">Lecteurs actifs</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex items-center justify-center pb-16 md:pb-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 20,
              delay: 0.5,
            }}
          >
            <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl">
              <motion.div
                className="absolute inset-0 rounded-full bg-accent/5 blur-3xl"
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <OdeLogo className="relative z-10 drop-shadow-sm" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
    </section>
  );
});

export default HeroSection;
