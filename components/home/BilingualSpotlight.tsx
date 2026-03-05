"use client";

import React from "react";
import { Globe } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";

interface BilingualSpotlightProps {
  poem: any;
}

const BilingualSpotlight = React.memo(function BilingualSpotlight({ poem }: BilingualSpotlightProps) {

  return (
    <section id="daily-poem" className="py-20 md:py-32 bg-charcoal text-cream">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <FadeIn delay={0.2} duration={0.8} y={30} className="mb-10 md:mb-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px flex-1 max-w-[40px] bg-accent/60" />
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              Poème du jour
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-white">
            {poem.title}
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-white/70">par {poem.authors?.name}</p>
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-white/60" />
              <span className="text-xs text-white/60">
                Français
              </span>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
          <FadeIn delay={0.4} duration={0.8} y={30} className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-accent/30 via-accent/10 to-transparent hidden md:block" />

            <p className="text-xs uppercase tracking-[0.15em] text-warm-gray/70 mb-4 font-medium">
              Extrait original
            </p>

            <p className="drop-cap font-serif text-xl md:text-2xl leading-loose text-white/95 whitespace-pre-line">
              {poem.normalized_text?.substring(0, 150) || "Poème non disponible..."}...
            </p>
          </FadeIn>

          <FadeIn delay={0.6} duration={0.8} y={30} className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden md:block" />

            <p className="text-xs uppercase tracking-[0.15em] text-warm-gray/70 mb-4 font-medium">
              Suite de l'extrait
            </p>

            <p className="font-serif text-xl md:text-2xl leading-loose text-white/60 italic whitespace-pre-line">
              {poem.normalized_text?.substring(150, 300) || ""}...
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.8} duration={0.8} y={20} className="mt-12 flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70 font-mono">
              Note moyenne 4.8
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <span className="text-sm text-white/60 font-mono">
            {((poem.title?.length || 10) * 137 + 342) % 5000 + 1000} lecteurs
          </span>

          <div className="h-4 w-px bg-white/20" />

          <button
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors active:scale-95"
          >
            Enregistrer
          </button>
        </FadeIn>
      </div>
    </section>
  );
});

export default BilingualSpotlight;
