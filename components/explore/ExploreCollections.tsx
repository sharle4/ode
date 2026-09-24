"use client";

import React, { useState, useRef, useCallback } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import CollectionCard from "@/components/author/CollectionCard";

interface CollectionItem {
    id?: string;
    title: string;
    slug?: string;
    publication_year?: number;
    year?: number;
    poems_count?: number;
    poemCount?: number;
    [key: string]: any;
}

interface ExploreCollectionsProps {
    collections: CollectionItem[];
    title?: string;
}

/**
 * Visibilité Tailwind pour les recueils en mode replié (1 ligne max sans CLS) :
 * Grille : grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
 * - Mobile (< 640px) : 2 colonnes (slot 1 : recueil 0, slot 2 : bouton si total > 2)
 * - sm (640px - 1023px) : 3 colonnes (slot 1-2 : recueils 0-1, slot 3 : bouton si total > 3)
 * - lg (>= 1024px) : 4 colonnes (slot 1-3 : recueils 0-2, slot 4 : bouton si total > 4)
 */
function getCollectionVisibilityClass(index: number, total: number, isExpanded: boolean): string {
    if (isExpanded) return "block";
    if (index === 0) return "block";

    // Index 1 : rentre sur mobile si total <= 2. Sinon masqué sur mobile, visible dès sm.
    if (index === 1) return total <= 2 ? "block" : "hidden sm:block";

    // Index 2 : rentre sur sm si total <= 3. Sinon masqué sur sm, visible dès lg.
    if (index === 2) return total <= 3 ? "hidden sm:block" : "hidden lg:block";

    // Index 3 : sur lg, visible uniquement si total === 4 (aucun bouton sur lg).
    if (index === 3) return total === 4 ? "hidden lg:block" : "hidden";

    // Index >= 4 : masqué en mode replié sur tous les écrans
    return "hidden";
}

function getCollectionButtonVisibilityClass(total: number, isExpanded: boolean): string {
    if (isExpanded) return "flex";
    if (total <= 2) return "hidden";
    if (total === 3) return "flex sm:hidden";
    if (total === 4) return "flex lg:hidden";
    return "flex";
}

function getHeaderButtonVisibilityClass(total: number, isExpanded: boolean): string {
    if (total <= 2) return "hidden";
    if (isExpanded) return "inline-flex";
    if (total === 3) return "inline-flex sm:hidden";
    if (total === 4) return "inline-flex lg:hidden";
    return "inline-flex";
}

export default function ExploreCollections({
    collections,
    title = "Recueils populaires",
}: ExploreCollectionsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const total = collections.length;

    const toggleExpand = useCallback(() => {
        setIsExpanded((prev) => {
            const nextState = !prev;
            if (!nextState && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.top < 80) {
                    containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
            return nextState;
        });
    }, []);

    if (total === 0) return null;

    const buttonVisibilityClass = getCollectionButtonVisibilityClass(total, isExpanded);
    const headerButtonClass = getHeaderButtonVisibilityClass(total, isExpanded);

    return (
        <div ref={containerRef} className="w-full mt-2 sm:mt-4 flex flex-col scroll-mt-24">
            <div className="mb-6 sm:mb-8 w-full">
                {/* En-tête de section avec titre, compteur et bouton toggle */}
                <div className="flex items-baseline justify-between mb-3.5 px-1 sm:px-2">
                    <div className="flex items-baseline gap-2.5">
                        <h2 className="font-serif text-2xl text-charcoal tracking-tight">
                            {title}
                        </h2>
                        <span
                            className="text-xs font-mono text-warm-gray px-2 py-0.5 rounded-full bg-soft-border/50"
                            title={`${total} ${total > 1 ? "recueils" : "recueil"}`}
                        >
                            {total}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={toggleExpand}
                        className={`items-center gap-1.5 text-xs sm:text-sm font-medium text-warm-gray hover:text-charcoal transition-colors group cursor-pointer py-1 px-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 ${headerButtonClass}`}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Replier la section ${title}` : `Déplier et voir tous les recueils`}
                    >
                        <span>{isExpanded ? "Voir moins" : "Tout afficher"}</span>
                        <CaretDown
                            size={14}
                            weight="bold"
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>

                {/* Grille principale : 1 ligne max par défaut, 4 colonnes sur desktop */}
                <motion.div
                    layout="position"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                    {collections.map((collection, index) => {
                        const visibilityClass = getCollectionVisibilityClass(index, total, isExpanded);
                        const cardData = {
                            title: collection.title,
                            slug: collection.slug,
                            year: collection.publication_year ?? collection.year ?? 0,
                            poemCount: collection.poems_count ?? collection.poemCount ?? 0,
                        };

                        return (
                            <motion.div
                                key={collection.id || collection.slug || index}
                                layout="position"
                                initial={false}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className={visibilityClass}
                            >
                                <CollectionCard collection={cardData} index={index} />
                            </motion.div>
                        );
                    })}

                    {/* Carte bouton « Voir plus » format livre relié */}
                    {buttonVisibilityClass !== "hidden" && (
                        <motion.div
                            layout="position"
                            initial={false}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className={buttonVisibilityClass}
                        >
                            <button
                                type="button"
                                onClick={toggleExpand}
                                className="w-full flex flex-col group cursor-pointer text-left select-none outline-hidden h-full"
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? "Replier les recueils" : `Voir tous les ${total} recueils`}
                            >
                                <div className="relative w-full aspect-[2/3] rounded-r-lg rounded-l-sm border-2 border-dashed border-soft-border hover:border-charcoal/40 bg-paper/40 hover:bg-paper/80 flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-xs hover:shadow-md active:scale-[0.98] overflow-hidden">
                                    {/* Effet reliure du livre rappelant CollectionCard */}
                                    <div className="absolute left-0 top-0 bottom-0 w-3 lg:w-4 border-r border-dashed border-soft-border/80 bg-black/[0.03] dark:bg-white/[0.03]" />

                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-soft-border bg-paper flex items-center justify-center text-warm-gray group-hover:text-charcoal shadow-xs group-hover:scale-105 group-hover:border-charcoal/40 transition-all duration-300 mb-2 sm:mb-2.5 z-10">
                                        {isExpanded ? (
                                            <CaretUp size={20} weight="bold" className="transition-transform group-hover:-translate-y-0.5" />
                                        ) : (
                                            <CaretDown size={20} weight="bold" className="transition-transform group-hover:translate-y-0.5" />
                                        )}
                                    </div>

                                    <span className="font-serif text-sm sm:text-base font-medium text-charcoal group-hover:text-charcoal transition-colors text-center block leading-tight z-10">
                                        {isExpanded ? "Voir moins" : "Voir plus"}
                                    </span>

                                    <span className="text-[11px] sm:text-xs text-warm-gray mt-1 font-sans text-center block truncate max-w-full z-10">
                                        {isExpanded ? "Replier" : `Tout afficher (${total})`}
                                    </span>
                                </div>

                                <div className="mt-4 flex justify-between items-baseline px-1">
                                    <span className="text-sm font-sans text-warm-gray">Catalogue</span>
                                    <span className="text-xs uppercase tracking-widest text-warm-gray/60">{total} recueils</span>
                                </div>
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
