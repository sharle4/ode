"use client";

import React, { useRef } from "react";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import type { Poem } from "@/types";
import PoemCard from "@/components/ui/PoemCard";
import FadeIn from "@/components/ui/FadeIn";

interface TrendingRowProps {
  title: string;
  subtitle?: string;
  poems: Poem[];
}

const CARD_GAP = 20; // gap-5 = 1.25rem = 20px
const VISIBLE_CARDS = 4;

const TrendingRow = React.memo(function TrendingRow({
  title,
  subtitle,
  poems,
}: TrendingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-poem-card]") as HTMLElement;
    const scrollAmount = card ? card.offsetWidth + CARD_GAP : 220;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  // CSS variable approach: each card takes (100% - total_gaps) / VISIBLE_CARDS
  const cardWidth = `calc((100% - ${CARD_GAP * (VISIBLE_CARDS - 1)}px) / ${VISIBLE_CARDS})`;

  return (
    <FadeIn className="py-8 md:py-12" y={40} duration={0.8} delay={0.1}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-sm text-warm-gray">
                {subtitle}
              </p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollBy("left")}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-soft-border/60 text-warm-gray hover:text-charcoal hover:border-soft-border hover:bg-paper transition-colors"
              aria-label="Scroll left"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button
              onClick={() => scrollBy("right")}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-soft-border/60 text-warm-gray hover:text-charcoal hover:border-soft-border hover:bg-paper transition-colors"
              aria-label="Scroll right"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto pb-4 pt-2 hide-scrollbar snap-x snap-mandatory scroll-smooth"
            style={{
              gap: `${CARD_GAP}px`,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {poems.slice(0, 10).map((poem, index) => (
              <div
                key={poem.id}
                data-poem-card
                className="flex-none snap-start"
                style={{ width: cardWidth }}
              >
                <PoemCard poem={poem} index={index} layout="grid" />
              </div>
            ))}

            <div
              className="flex-none snap-start flex flex-col items-center justify-center border-2 border-dashed border-soft-border/40 rounded-2xl p-6 hover:border-soft-border transition-colors cursor-pointer bg-paper/30"
              style={{ width: cardWidth }}
            >
              <div className="w-12 h-12 rounded-full border border-soft-border/60 flex items-center justify-center text-warm-gray mb-3 bg-paper hover:scale-105 transition-transform">
                <CaretRight size={20} />
              </div>
              <span className="text-sm font-medium text-charcoal">Voir tout</span>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
});

export default TrendingRow;
