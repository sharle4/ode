"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";
import OdeLogo from "@/components/ui/OdeLogo";
import MagneticButton from "@/components/ui/MagneticButton";

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

const HeroSection = React.memo(function HeroSection() {
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
              <span className="inline-flex items-center gap-2 rounded-full border border-soft-border/60 bg-white/60 backdrop-blur-sm px-3.5 py-1.5 text-xs text-warm-gray shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                La poésie dans toutes les langues
              </span>
            </motion.div>

            <motion.h1
              className="font-serif text-4xl md:text-6xl tracking-tighter leading-none text-charcoal text-balance"
              variants={itemVariants}
            >
              Lisez la poésie comme
              <br />
              <span className="italic text-charcoal/70">elle a été écrite.</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-base text-warm-gray leading-relaxed max-w-[52ch]"
              variants={itemVariants}
            >
              Accédez à des poèmes de toutes les époques et de toutes les langues dans leur version originale aux côtés de leur traduction. Notez, discutez et créez votre anthologie personnelle avec une communauté mondiale de lecteurs.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              variants={itemVariants}
            >
              <MagneticButton
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-ink active:scale-[0.98] active:-translate-y-[1px]"
              >
                Explorer
                <ArrowRight size={16} weight="bold" />
              </MagneticButton>

              <MagneticButton
                className="inline-flex items-center gap-2 rounded-full border border-soft-border px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal/5 active:scale-[0.98] active:-translate-y-[1px]"
              >
                <BookOpen size={16} weight="regular" />
                Ajouter un poème
              </MagneticButton>
            </motion.div>

            <motion.div
              className="mt-14 flex items-center gap-6"
              variants={itemVariants}
            >
              <div>
                <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">
                  42.8k
                </p>
                <p className="text-xs text-warm-gray/60 mt-0.5">Poèmes catalogués</p>
              </div>
              <div className="h-8 w-px bg-soft-border/60" />
              <div>
                <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">
                  127
                </p>
                <p className="text-xs text-warm-gray/60 mt-0.5">Langues</p>
              </div>
              <div className="h-8 w-px bg-soft-border/60" />
              <div>
                <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">
                  18.3k
                </p>
                <p className="text-xs text-warm-gray/60 mt-0.5">Lecteurs actifs</p>
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

              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-soft-border to-transparent"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scaleX: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
    </section>
  );
});

export default HeroSection;
