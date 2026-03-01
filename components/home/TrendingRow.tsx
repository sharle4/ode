"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import type { Poem } from "@/types";
import PoemCard from "@/components/ui/PoemCard";

interface TrendingRowProps {
  title: string;
  subtitle?: string;
  poems: Poem[];
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const TrendingRow = React.memo(function TrendingRow({
  title,
  subtitle,
  poems,
}: TrendingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <motion.section
      className="py-8 md:py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <motion.h2
              className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    type: "spring" as const,
                    stiffness: 100,
                    damping: 20,
                  },
                },
              }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                className="mt-1.5 text-sm text-warm-gray"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { delay: 0.15 } },
                }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={() => scrollBy("left")}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-soft-border/60 text-warm-gray hover:text-charcoal hover:border-soft-border hover:bg-paper transition-colors"
              whileTap={{ scale: 0.92, y: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
              aria-label="Scroll left"
            >
              <CaretLeft size={16} weight="bold" />
            </motion.button>
            <motion.button
              onClick={() => scrollBy("right")}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-soft-border/60 text-warm-gray hover:text-charcoal hover:border-soft-border hover:bg-paper transition-colors"
              whileTap={{ scale: 0.92, y: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
              aria-label="Scroll right"
            >
              <CaretRight size={16} weight="bold" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="hide-scrollbar flex gap-4 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 md:px-8"
          style={{
            paddingLeft: "max(1rem, calc((100vw - 1400px) / 2 + 2rem))",
            paddingRight: "2rem",
          }}
        >
          {poems.map((poem, index) => (
            <div key={poem.id} className="snap-start">
              <PoemCard poem={poem} index={index} />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-cream to-transparent" />
      </div>
    </motion.section>
  );
});

export default TrendingRow;
