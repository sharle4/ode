"use client";

import React from "react";
import Link from "next/link";
import { Globe, ArrowRight, Star } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";

interface BilingualSpotlightProps {
  poem: any;
}

// Mock review distribution for the bar chart
const mockReviews = [
  { stars: 5, pct: 60 },
  { stars: 4, pct: 20 },
  { stars: 3, pct: 10 },
  { stars: 2, pct: 6 },
  { stars: 1, pct: 4 },
];

const BilingualSpotlight = React.memo(function BilingualSpotlight({ poem }: BilingualSpotlightProps) {
  // Split on real newlines and filter blanks, take first 4 non-empty lines
  const lines: string[] = poem.normalized_text
    ? poem.normalized_text
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .slice(0, 4)
    : ["Poème non disponible..."];

  return (
    // bg-charcoal text-cream: same pattern as AuthorRow – adapts to dark mode automatically
    <section id="daily-poem" className="py-20 md:py-32 bg-charcoal text-cream">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <FadeIn delay={0.1} duration={0.8} y={30} className="mb-10 md:mb-14">
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-cream">
            Poème du jour
          </h2>
          <p className="mt-1.5 text-sm text-cream/50">
            Chaque jour, un nouveau chef-d'œuvre à (re)découvrir.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">

          {/* ── Left : poem extract ── */}
          <div className="md:col-span-7 lg:col-span-8">
            <FadeIn delay={0.2} duration={0.8} y={30} className="w-full">
              <h3 className="font-serif text-3xl md:text-4xl tracking-tight text-cream mb-8 leading-tight">
                {poem.title}
              </h3>

              {/* 4-line extract with left accent border */}
              <div className="pl-6 md:pl-8 border-l-2 border-accent/50 mb-10">
                {lines.map((line, i) => (
                  <p
                    key={i}
                    className={`font-serif text-xl md:text-2xl leading-relaxed whitespace-pre-wrap ${i === 0 ? "text-cream" : "text-cream/70"
                      }`}
                  >
                    {i === 0 ? (
                      <>
                        <span
                          className="float-left font-serif font-bold mr-3 text-cream"
                          style={{
                            fontSize: "4rem",
                            lineHeight: "1",
                            marginTop: "0.1em",
                          }}
                        >
                          {line[0]}
                        </span>
                        {line.slice(1)}
                      </>
                    ) : line}
                  </p>
                ))}
                <p className="font-serif text-xl md:text-2xl leading-relaxed text-cream/30 italic mt-1">...</p>
              </div>

              <Link href={`/poem/${poem.slug || poem.id}`}>
                <button className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-6 py-3 text-sm font-medium text-cream/80 transition-all hover:bg-cream/10 active:scale-[0.98]">
                  Lire la suite
                  <ArrowRight size={16} weight="regular" />
                </button>
              </Link>
            </FadeIn>
          </div>

          {/* ── Right : info panel ── */}
          <div className="md:col-span-5 lg:col-span-4">
            <FadeIn delay={0.4} duration={0.8} y={30}>
              <div className="bg-cream/5 border border-cream/10 rounded-2xl p-6 md:p-7 space-y-5">
                <h4 className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                  À propos de l'œuvre
                </h4>

                {/* Author */}
                <div>
                  <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-1">Auteur</p>
                  <Link href={`/author/${poem.authors?.[0]?.slug || "inconnu"}`}>
                    <p className="text-sm text-cream/90 font-serif font-medium hover:text-accent transition-colors cursor-pointer">
                      {poem.authors?.map((a: any) => a.name).join(', ') || "Anonyme"}
                    </p>
                  </Link>
                </div>

                {/* Collection (mocked) */}
                <div>
                  <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-1">Recueil</p>
                  <Link href="/collection/les-fleurs-du-mal">
                    <p className="text-sm text-cream/80 font-serif hover:text-accent transition-colors cursor-pointer">
                      Les Fleurs du mal
                    </p>
                  </Link>
                </div>

                {/* Date (mocked) */}
                <div>
                  <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-1">Date de publication</p>
                  <p className="text-sm text-cream/80">1857</p>
                </div>

                {/* Language */}
                <div>
                  <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-1">Langue originale</p>
                  <div className="flex items-center gap-1.5 text-cream/80 text-sm">
                    <Globe size={14} className="text-cream/50 flex-shrink-0" />
                    Français
                  </div>
                </div>

                <hr className="border-cream/10" />

                {/* Review summary */}
                <div>
                  <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-3">Note moyenne</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-serif text-2xl font-bold text-cream">4.8</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < 5 ? "fill" : "regular"}
                          className={i < 5 ? "text-accent" : "text-cream/20"}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Review bar chart */}
                  <div className="space-y-1.5">
                    {mockReviews.map(({ stars, pct }) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-[11px] text-cream/40 w-3 text-right">{stars}</span>
                        <div className="flex-1 h-1.5 bg-cream/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent/70 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-cream/30 w-6">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
});

export default BilingualSpotlight;
