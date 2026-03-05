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

        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-5 pb-8 pt-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {poems.slice(0, 10).map((poem, index) => (
              <div
                key={poem.id}
                className="flex-none w-[280px] sm:w-[320px] lg:w-[340px] snap-center md:snap-start"
              >
                <PoemCard poem={poem} index={index} layout="grid" />
              </div>
            ))}

            <div className="flex-none w-[200px] snap-center md:snap-start flex flex-col items-center justify-center border-2 border-dashed border-soft-border/40 rounded-2xl p-6 group-hover:border-soft-border transition-colors cursor-pointer bg-paper/30">
              <div className="w-12 h-12 rounded-full border border-soft-border/60 flex items-center justify-center text-warm-gray mb-3 bg-paper group-hover:scale-105 transition-transform">
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
