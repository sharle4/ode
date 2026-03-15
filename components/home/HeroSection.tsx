"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, BookOpenText } from "@phosphor-icons/react";
import OdeLogo from "@/components/ui/OdeLogo";
import FadeIn from "@/components/ui/FadeIn";
import { formatCount } from "@/utils/gradient";

interface HeroSectionProps {
  dailyPoem: any;
  stats: { poemsCount: number; collectionsCount: number; authorsCount: number };
}

const HeroSection = React.memo(function HeroSection({ dailyPoem, stats }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 min-h-[100dvh] items-center">

          {/* Ligne 1 : Présentation ou Daily Poem Intro */}
          <div className="flex flex-col justify-center pt-28 pb-8 md:pt-0 md:pb-0 md:pr-16 lg:pr-24">

            <FadeIn delay={0.2}>
              <h1 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none text-charcoal text-balance">
                {dailyPoem ? (
                  <>
                    Lumière sur <br />
                    <span className="italic text-warm-gray">{dailyPoem.authors?.name || dailyPoem.authors?.[0]?.name}</span>
                  </>
                ) : (
                  <>
                    La maison de <br />
                    <span className="italic text-warm-gray">la poésie.</span>
                  </>
                )}
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-8 text-base text-warm-gray leading-relaxed max-w-[45ch]">
                Lisez, notez et parcourez des milliers de poèmes. Rejoignez la communauté francophone de la poésie.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/explore">
                  <button className="inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98]">
                    Explorer
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </Link>

                {dailyPoem ? (
                  <Link href="#daily-poem">
                    <button className="inline-flex items-center gap-2 rounded-full border-2 border-soft-border/60 px-7 py-3.5 text-sm font-medium text-charcoal transition-colors hover:bg-paper active:scale-[0.98]">
                      <BookOpenText size={18} weight="regular" />
                      Lire le poème du jour
                    </button>
                  </Link>
                ) : (
                  <Link href="/explore">
                    <button className="inline-flex items-center gap-2 rounded-full border-2 border-soft-border/60 px-7 py-3.5 text-sm font-medium text-charcoal transition-colors hover:bg-paper active:scale-[0.98]">
                      <BookOpen size={18} weight="regular" />
                      Parcourir les œuvres
                    </button>
                  </Link>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="mt-14 flex items-center gap-6">
                <div>
                  <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">{formatCount(stats.poemsCount)}</p>
                  <p className="text-xs text-warm-gray/70 mt-0.5">Poèmes</p>
                </div>
                <div className="h-8 w-px bg-soft-border" />
                <div>
                  <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">{formatCount(stats.collectionsCount)}</p>
                  <p className="text-xs text-warm-gray/70 mt-0.5">Recueils</p>
                </div>
                <div className="h-8 w-px bg-soft-border" />
                <div>
                  <p className="text-2xl font-serif font-semibold text-charcoal tracking-tight">{formatCount(stats.authorsCount)}</p>
                  <p className="text-xs text-warm-gray/70 mt-0.5">Auteurs</p>
                </div>
              </div>
            </FadeIn>

          </div>

          {/* Ligne 2 : Logo Animé majestueux */}
          <FadeIn delay={0.4} className="relative flex items-center justify-center pb-16 md:pb-0">
            <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl flex items-center justify-center">

              <div className="absolute inset-0 rounded-full bg-accent/5 blur-3xl w-full h-full animate-pulse" />

              <div className="relative z-10 drop-shadow-sm w-[350px] md:w-[500px]">
                <OdeLogo />
              </div>

            </div>
          </FadeIn>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
    </section>
  );
});

export default HeroSection;
