"use client";

import React from "react";
import { Globe } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";

interface BilingualSpotlightProps {
  poem: any;
}

const BilingualSpotlight = React.memo(function BilingualSpotlight({ poem }: BilingualSpotlightProps) {

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <FadeIn delay={0.2} duration={0.8} y={30} className="mb-10 md:mb-16">
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
            <p className="text-sm text-warm-gray">par {poem.authors?.name}</p>
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-warm-gray/80" />
              <span className="text-xs text-warm-gray/80">
                Français
              </span>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
          <FadeIn delay={0.4} duration={0.8} y={30} className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent/30 via-accent/10 to-transparent hidden md:block" />

            <p className="text-xs uppercase tracking-[0.15em] text-warm-gray/80 mb-4 font-medium">
              Extrait original
            </p>

            <p className="drop-cap font-serif text-xl md:text-2xl leading-loose text-charcoal/90 whitespace-pre-line">
              {poem.normalized_text?.substring(0, 150) || "Poème non disponible..."}...
            </p>
          </FadeIn>

          <FadeIn delay={0.6} duration={0.8} y={30} className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-soft-border/60 via-soft-border/30 to-transparent hidden md:block" />

            <p className="text-xs uppercase tracking-[0.15em] text-warm-gray/80 mb-4 font-medium">
              Suite de l'extrait
            </p>

            <p className="font-serif text-xl md:text-2xl leading-loose text-warm-gray/80 italic whitespace-pre-line">
              {poem.normalized_text?.substring(150, 300) || ""}...
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.8} duration={0.8} y={20} className="mt-12 flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-warm-gray font-mono">
              Note moyenne 4.8
            </span>
          </div>

          <div className="h-4 w-px bg-soft-border/60" />

          <span className="text-sm text-warm-gray/80 font-mono">
            {((poem.title?.length || 10) * 137 + 342) % 5000 + 1000} lecteurs
          </span>

          <div className="h-4 w-px bg-soft-border/60" />

          <button
            className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors active:scale-95"
          >
            Enregistrer
          </button>
        </FadeIn>
      </div>
    </section>
  );
});

export default BilingualSpotlight;
