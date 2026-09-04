"use client";

import React from "react";
import Link from "next/link";
import { Globe, ArrowRight, Star } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";

interface BilingualSpotlightProps {
  poem: any;
  reviewDistribution?: { stars: number; pct: number; count: number }[];
}

const BilingualSpotlight = React.memo(function BilingualSpotlight({ poem, reviewDistribution }: BilingualSpotlightProps) {
  // Split on real newlines and filter blanks, take first 4 non-empty lines
  const lines: string[] = poem.normalized_text
    ? poem.normalized_text
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .slice(0, 4)
    : ["Poème non disponible..."];

  // Use real data or derive sensible defaults
  const avgReview = poem.average_review || 0;
  const reviewsCount = poem.reviews_count || 0;
  const filledStars = Math.round(avgReview);
  const language = poem.language || 'fr';

  // Map language code to display name
  const languageNames: Record<string, string> = { fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand', it: 'Italien', pt: 'Portugais' };
  const languageDisplay = languageNames[language] || language;

  // Collection info from poem join
  const collectionTitle = poem.collections?.[0]?.title || poem.collections?.title || null;
  const collectionSlug = poem.collections?.[0]?.slug || (poem.collections as any)?.slug || (poem.collections?.[0]?.id ? poem.collections[0].id : null);

  // Default review distribution if none provided
  const reviews = reviewDistribution && reviewDistribution.length > 0
    ? reviewDistribution
    : [5, 4, 3, 2, 1].map(s => ({ stars: s, pct: 0, count: 0 }));

  return (
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
                      {poem.authors?.map((a: any) => a.name).join(', ') || poem.authors?.name || "Anonyme"}
                    </p>
                  </Link>
                </div>

                {/* Collection */}
                {collectionTitle && (
                  <div>
                    <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-1">Recueil</p>
                    {collectionSlug ? (
                      <Link href={`/collection/${collectionSlug}`}>
                        <p className="text-sm text-cream/80 font-serif hover:text-accent transition-colors cursor-pointer">
                          {collectionTitle}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-sm text-cream/80 font-serif">{collectionTitle}</p>
                    )}
                  </div>
                )}

                {/* Date */}
                {poem.publication_year && (
                  <div>
                    <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-1">Date de publication</p>
                    <p className="text-sm text-cream/80">{poem.publication_year}</p>
                  </div>
                )}

                {/* Language */}
                <div>
                  <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-1">Langue originale</p>
                  <div className="flex items-center gap-1.5 text-cream/80 text-sm">
                    <Globe size={14} className="text-cream/50 flex-shrink-0" />
                    {languageDisplay}
                  </div>
                </div>

                <hr className="border-cream/10" />

                {/* Review summary */}
                <div>
                  <p className="text-[11px] text-cream/40 uppercase tracking-wider mb-3">Note moyenne</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-serif text-2xl font-bold text-cream">
                      {avgReview > 0 ? avgReview.toFixed(1) : '—'}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < filledStars ? "fill" : "regular"}
                          className={i < filledStars ? "text-accent" : "text-cream/20"}
                        />
                      ))}
                    </div>
                    {reviewsCount > 0 && (
                      <span className="text-[11px] text-cream/40 ml-1">({reviewsCount})</span>
                    )}
                  </div>
                  {/* Review bar chart */}
                  <div className="space-y-1.5">
                    {reviews.map(({ stars, pct }) => (
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
