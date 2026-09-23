"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { getCategoryColor } from "@/utils/gradient";
import { OrnamentIcon } from "@/components/ui/ornaments";
import { Category } from "@/types";

interface CategoryGridProps {
    categories: Category[];
    title?: string;
}

/**
 * Calcule la classe de visibilité Tailwind d'une vignette selon son index et le nombre total
 * d'éléments, afin de garantir strictement 1 ligne maximum en mode replié sans CLS (SSR-safe).
 * 
 * Grille :
 * - Mobile (< 640px) : 2 colonnes (slot 1 : item 0, slot 2 : bouton si total > 2)
 * - sm (640px - 767px) : 3 colonnes (slot 1-2 : items 0-1, slot 3 : bouton si total > 3)
 * - md (768px - 1023px) : 4 colonnes (slot 1-3 : items 0-2, slot 4 : bouton si total > 4)
 * - lg (>= 1024px) : 6 colonnes (slot 1-5 : items 0-4, slot 6 : bouton si total > 6)
 */
function getCardVisibilityClass(index: number, total: number, isExpanded: boolean): string {
    if (isExpanded) {
        return "block";
    }

    // Index 0 : toujours visible sur tous les écrans
    if (index === 0) {
        return "block";
    }

    // Index 1 :
    // Tient sur mobile uniquement si total <= 2.
    // Si total > 2, le slot 2 sur mobile est réservé au bouton « Voir plus ».
    if (index === 1) {
        return total <= 2 ? "block" : "hidden sm:block";
    }

    // Index 2 :
    // Tient sur sm uniquement si total <= 3.
    // Si total > 3, le slot 3 sur sm est réservé au bouton.
    if (index === 2) {
        return total <= 3 ? "hidden sm:block" : "hidden md:block";
    }

    // Index 3 :
    // Tient sur md uniquement si total <= 4.
    // Si total > 4, le slot 4 sur md est réservé au bouton.
    if (index === 3) {
        return total <= 4 ? "hidden md:block" : "hidden lg:block";
    }

    // Index 4 :
    // Visible sur lg (6 colonnes).
    if (index === 4) {
        return "hidden lg:block";
    }

    // Index 5 :
    // Sur lg, le slot 6 est index 5 seulement si total === 6 (pas de bouton sur lg).
    // Si total > 6, le slot 6 est réservé au bouton, donc index 5 est masqué.
    if (index === 5) {
        return total === 6 ? "hidden lg:block" : "hidden";
    }

    // Index >= 6 : toujours masqué en mode replié
    return "hidden";
}

/**
 * Détermine la classe de visibilité Tailwind de la carte bouton « Voir plus »
 * selon le breakpoint où le contenu dépasse effectivement 1 ligne.
 */
function getButtonVisibilityClass(total: number, isExpanded: boolean): string {
    if (isExpanded) {
        return "flex";
    }

    // Si total <= 2 : ne dépasse jamais sur aucun format (mobile = 2 colonnes)
    if (total <= 2) {
        return "hidden";
    }

    // Si total === 3 : dépasse uniquement sur mobile (2 col). Tient sur sm (3 col), md (4 col), lg (6 col).
    if (total === 3) {
        return "flex sm:hidden";
    }

    // Si total === 4 : dépasse sur mobile et sm. Tient sur md et lg.
    if (total === 4) {
        return "flex md:hidden";
    }

    // Si total === 5 ou 6 : dépasse sur mobile, sm, md. Tient sur lg (6 colonnes).
    if (total === 5 || total === 6) {
        return "flex lg:hidden";
    }

    // Si total > 6 : dépasse sur tous les formats d'écran
    return "flex";
}

/**
 * Détermine la classe de visibilité Tailwind du bouton de bascule rapide dans le header.
 */
function getHeaderButtonVisibilityClass(total: number, isExpanded: boolean): string {
    if (total <= 2) {
        return "hidden";
    }
    if (isExpanded) {
        return "inline-flex";
    }
    if (total === 3) {
        return "inline-flex sm:hidden";
    }
    if (total === 4) {
        return "inline-flex md:hidden";
    }
    if (total === 5 || total === 6) {
        return "inline-flex lg:hidden";
    }
    return "inline-flex";
}

export default function CategoryGrid({ categories, title }: CategoryGridProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const total = categories.length;

    const toggleExpand = useCallback(() => {
        setIsExpanded((prev) => {
            const nextState = !prev;
            // Si on replie et que le haut du conteneur est en dehors du viewport, recentrer délicatement
            if (!nextState && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.top < 80) {
                    containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
            return nextState;
        });
    }, []);

    if (total === 0) {
        return null;
    }

    const buttonVisibilityClass = getButtonVisibilityClass(total, isExpanded);
    const headerButtonClass = getHeaderButtonVisibilityClass(total, isExpanded);

    return (
        <div ref={containerRef} className="w-full mt-2 sm:mt-4 flex flex-col scroll-mt-24">
            <div className="mb-6 sm:mb-8 w-full">
                {/* En-tête de section avec titre, compteur et bouton toggle d'accès rapide */}
                <div className="flex items-baseline justify-between mb-3.5 px-1 sm:px-2">
                    <div className="flex items-baseline gap-2.5">
                        {title && (
                            <h2 className="font-serif text-2xl text-charcoal tracking-tight">
                                {title}
                            </h2>
                        )}
                        <span
                            className="text-xs font-mono text-warm-gray px-2 py-0.5 rounded-full bg-soft-border/50"
                            title={`${total} ${total > 1 ? "catégories" : "catégorie"}`}
                        >
                            {total}
                        </span>
                    </div>

                    {/* Bouton rapide dans le header pour une accessibilité maximale */}
                    <button
                        type="button"
                        onClick={toggleExpand}
                        className={`items-center gap-1.5 text-xs sm:text-sm font-medium text-warm-gray hover:text-charcoal transition-colors group cursor-pointer py-1 px-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 ${headerButtonClass}`}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Replier la section ${title || ""}` : `Déplier et voir toutes les options de ${title || ""}`}
                    >
                        <span>{isExpanded ? "Voir moins" : "Tout afficher"}</span>
                        <CaretDown
                            size={14}
                            weight="bold"
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>

                {/* Grille principale : 1 ligne max par défaut, s'anime lors du dépliage */}
                <motion.div
                    layout="position"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
                >
                    {categories.map((cat, index) => {
                        const slug =
                            cat.slug ||
                            cat.name
                                .toLowerCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "")
                                .replace(/\s+/g, "-");
                        const href = `/category/${slug}`;
                        const fallbackGradient = getCategoryColor(cat.name);
                        const visibilityClass = getCardVisibilityClass(index, total, isExpanded);

                        return (
                            <motion.div
                                key={cat.id || slug}
                                layout="position"
                                initial={false}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className={visibilityClass}
                            >
                                <Link
                                    href={href}
                                    className="relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-square flex flex-col items-start p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-out group"
                                    style={cat.color ? { backgroundColor: cat.color } : undefined}
                                >
                                    {/* Background fallback gradient if no custom color */}
                                    {!cat.color && (
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 ${fallbackGradient} opacity-90 group-hover:opacity-100 saturate-100 group-hover:saturate-[2.5] brightness-100 group-hover:brightness-110`}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                                    {/* Ornement distinctif */}
                                    <div className="flex-grow flex items-center justify-center w-full z-10 mt-1 sm:mt-2">
                                        {cat.ornament_id && (
                                            <OrnamentIcon
                                                id={cat.ornament_id}
                                                aria-hidden="true"
                                                className="h-14 w-14 sm:h-20 sm:w-20 text-white/60 group-hover:text-white/80 transition-colors"
                                            />
                                        )}
                                    </div>

                                    <h3 className="relative z-10 w-full text-white font-serif text-base sm:text-lg md:text-xl font-medium drop-shadow-md text-left mt-auto pb-0.5 sm:pb-1 line-clamp-1">
                                        {cat.name}
                                    </h3>
                                </Link>
                            </motion.div>
                        );
                    })}

                    {/* Carte bouton « Voir plus » / « Voir moins » (Design fidèle aux cartes de la page d'accueil) */}
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
                                className="w-full relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-square flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-dashed border-soft-border hover:border-charcoal/40 bg-paper/40 hover:bg-paper/80 transition-all duration-300 ease-out group cursor-pointer shadow-xs hover:shadow-md active:scale-[0.98] text-center"
                                aria-expanded={isExpanded}
                                aria-label={
                                    isExpanded
                                        ? `Replier la section ${title || "catégories"}`
                                        : `Déplier et voir toutes les ${total} catégories de ${title || "cette section"}`
                                }
                            >
                                {/* Pastille circulaire avec icône Phosphor */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-soft-border bg-paper flex items-center justify-center text-warm-gray group-hover:text-charcoal shadow-xs group-hover:scale-105 group-hover:border-charcoal/40 transition-all duration-300 mb-1.5 sm:mb-2.5">
                                    {isExpanded ? (
                                        <CaretUp
                                            size={20}
                                            weight="bold"
                                            className="transition-transform group-hover:-translate-y-0.5"
                                        />
                                    ) : (
                                        <CaretDown
                                            size={20}
                                            weight="bold"
                                            className="transition-transform group-hover:translate-y-0.5"
                                        />
                                    )}
                                </div>

                                {/* Titre principal de la carte */}
                                <span className="font-serif text-sm sm:text-base font-medium text-charcoal group-hover:text-charcoal transition-colors block leading-tight">
                                    {isExpanded ? "Voir moins" : "Voir plus"}
                                </span>

                                {/* Sous-titre indicatif avec nombre total */}
                                <span className="text-[11px] sm:text-xs text-warm-gray mt-0.5 font-sans block truncate max-w-full">
                                    {isExpanded ? "Replier" : `Tout afficher (${total})`}
                                </span>
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
