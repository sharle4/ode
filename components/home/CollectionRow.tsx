"use client";

import React, { useRef } from "react";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { getCoverGradient } from "@/utils/gradient";

interface Collection {
    id?: string;
    title: string;
    slug: string;
    publication_year: number | null;
    poems_count: number;
    authors?: { id: string; name: string; slug: string }[] | { id: string; name: string; slug: string };
}

interface CollectionRowProps {
    title: string;
    subtitle?: string;
    collections: Collection[];
}

const CARD_GAP = 24; // gap-6
const VISIBLE_CARDS = 4;

const CollectionRow = React.memo(function CollectionRow({
    title,
    subtitle,
    collections,
}: CollectionRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    function scrollBy(direction: "left" | "right") {
        if (!scrollRef.current) return;
        const card = scrollRef.current.querySelector("[data-collection-card]") as HTMLElement;
        const scrollAmount = card ? card.offsetWidth + CARD_GAP : 220;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    }

    const cardWidth = `calc((100% - ${CARD_GAP * (VISIBLE_CARDS - 1)}px) / ${VISIBLE_CARDS})`;

    function getAuthorName(collection: Collection): string {
        if (!collection.authors) return '';
        if (Array.isArray(collection.authors)) {
            return collection.authors.map(a => a.name).join(', ');
        }
        return collection.authors.name;
    }

    return (
        <FadeIn className="py-8 md:py-12" y={40} duration={0.8} delay={0.15}>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-6 md:mb-8">
                    <div>
                        <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1.5 text-sm text-warm-gray">{subtitle}</p>
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
                        {collections.map((collection, index) => {
                            const coverColor = getCoverGradient(collection.slug);
                            return (
                                <Link
                                    href={`/collection/${collection.slug}`}
                                    key={collection.slug}
                                    data-collection-card
                                    className="flex-none snap-start"
                                    style={{ width: cardWidth }}
                                >
                                    <motion.div
                                        className="flex flex-col group cursor-pointer h-full"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.08 }}
                                    >
                                        <div
                                            className={`relative w-full aspect-[2/3] rounded-r-lg rounded-l-sm shadow-md group-hover:shadow-xl transition-all duration-300 md:group-hover:-translate-y-2 overflow-hidden bg-gradient-to-br ${coverColor}`}
                                        >
                                            {/* Spine effect */}
                                            <div className="absolute left-0 top-0 bottom-0 w-3 lg:w-4 bg-black/20 z-10 border-r border-white/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]" />

                                            <div className="absolute inset-x-0 bottom-0 p-4 border-t border-white/10 bg-black/10 backdrop-blur-sm z-20">
                                                <p className="font-serif text-white drop-shadow-md leading-tight text-base sm:text-lg line-clamp-2">
                                                    {collection.title}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-col gap-0.5 px-1">
                                            <span className="text-sm font-serif text-charcoal truncate">
                                                {getAuthorName(collection)}
                                            </span>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs text-warm-gray">{collection.publication_year || '—'}</span>
                                                <span className="text-xs text-warm-gray/60 uppercase tracking-wider">
                                                    {collection.poems_count} poèmes
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}

                        <Link
                            href="/explore"
                            className="flex-none snap-start flex flex-col items-center justify-center border-2 border-dashed border-soft-border/40 rounded-2xl p-6 hover:border-soft-border transition-colors cursor-pointer bg-paper/30"
                            style={{ width: cardWidth }}
                        >
                            <div className="w-12 h-12 rounded-full border border-soft-border/60 flex items-center justify-center text-warm-gray mb-3 bg-paper hover:scale-105 transition-transform">
                                <CaretRight size={20} />
                            </div>
                            <span className="text-sm font-medium text-charcoal">
                                Tous les recueils
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
});

export default CollectionRow;
