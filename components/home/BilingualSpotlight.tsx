"use client";

import React from "react";
import Link from "next/link";
import { Globe, ArrowRight, Star } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";

interface BilingualSpotlightProps {
  poem: any;
}

// Mock rating distribution for the bar chart
const mockRatings = [
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
    // Use the same bg as AuthorRow: bg-charcoal resolves to #1A1A1A in light, #fafafa in dark via CSS var
    // We pin to a literal dark color so it's always dark regardless of color-scheme
    <section id="daily-poem" style={{ backgroundColor: "#1A1A1A" }} className="py-20 md:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Section heading — same pattern as TrendingRow / CommunityFeed */}
        <FadeIn delay={0.1} duration={0.8} y={30} className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs uppercase tracking-[0.15em] text-white/40 font-medium">
              À lire aujourd'hui
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-white">
            Poème du jour
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">

          {/* ── Left : poem extract ── */}
          <div className="md:col-span-7 lg:col-span-8">
            <FadeIn delay={0.2} duration={0.8} y={30} className="w-full">
              <h3 className="font-serif text-3xl md:text-4xl tracking-tight text-white mb-8 leading-tight">
                {poem.title}
              </h3>

              {/* 4-line extract with left accent border */}
              <div className="pl-6 md:pl-8 border-l-2 border-accent/50 mb-10">
                {lines.map((line, i) => (
                  <p
                    key={i}
                    className={`font-serif text-xl md:text-2xl leading-loose whitespace-pre-wrap ${i === 0
                        ? "text-white before:content-[attr(data-first-letter)] "
                        : "text-white/80"
                      }`}
                    style={i === 0 ? { color: "rgba(255,255,255,0.95)" } : undefined}
                  >
                    {i === 0 ? (
                      <>
                        <span
                          className="float-left font-serif font-bold mr-2 pr-1 leading-none"
                          style={{
                            fontSize: "4.5rem",
                            lineHeight: "0.8",
                            paddingTop: "0.2rem",
                            color: "white",
                          }}
                        >
                          {line[0]}
                        </span>
                        {line.slice(1)}
                      </>
                    ) : line}
                  </p>
                ))}
                <p className="font-serif text-xl md:text-2xl leading-loose text-white/40 italic mt-1">...</p>
              </div>

              <Link href={`/poem/${poem.slug || poem.id}`}>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white/80 transition-all hover:border-white/60 hover:text-white active:scale-[0.98]">
                  Lire la suite
                  <ArrowRight size={16} weight="regular" />
                </button>
              </Link>
            </FadeIn>
          </div>

          {/* ── Right : info panel ── */}
          <div className="md:col-span-5 lg:col-span-4">
            <FadeIn delay={0.4} duration={0.8} y={30}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-7 space-y-5">
                <h4 className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                  À propos de l'œuvre
                </h4>

                {/* Author */}
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Auteur</p>
                  <Link href={`/author/${poem.authors?.slug || "inconnu"}`}>
                    <p className="text-sm text-white/90 font-serif font-medium hover:text-accent transition-colors cursor-pointer">
                      {poem.authors?.name || poem.author || "Anonyme"}
                    </p>
                  </Link>
                </div>

                {/* Collection (mocked) */}
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Recueil</p>
                  <p className="text-sm text-white/80 font-serif">Les Fleurs du mal</p>
                </div>

                {/* Date (mocked) */}
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Date de publication</p>
                  <p className="text-sm text-white/80">1857</p>
                </div>

                {/* Language */}
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">Langue originale</p>
                  <div className="flex items-center gap-1.5 text-white/80 text-sm">
                    <Globe size={14} className="text-white/50 flex-shrink-0" />
                    Français
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* Rating summary */}
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3">Note moyenne</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-serif text-2xl font-bold text-white">4.8</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < 5 ? "fill" : "regular"}
                          className={i < 5 ? "text-accent" : "text-white/20"}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Rating bar chart */}
                  <div className="space-y-1.5">
                    {mockRatings.map(({ stars, pct }) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-[11px] text-white/40 w-3 text-right">{stars}</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent/70 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-white/30 w-6">{pct}%</span>
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
