"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { getInitials } from "@/utils/gradient";

interface Author {
    id?: string;
    name: string;
    slug: string;
    image_url?: string | null;
}

interface ExploreAuthorsProps {
    authors: Author[];
    title?: string;
}

/**
 * Visibilité Tailwind pour les auteurs en mode replié (1 ligne max sans CLS) :
 * - Mobile (< 640px) : 2 colonnes (slot 1 : auteur 0, slot 2 : bouton si total > 2)
 * - sm (640px - 767px) : 3 colonnes (slot 1-2 : auteurs 0-1, slot 3 : bouton si total > 3)
 * - md (768px - 1023px) : 4 colonnes (slot 1-3 : auteurs 0-2, slot 4 : bouton si total > 4)
 * - lg (>= 1024px) : 6 colonnes (slot 1-5 : auteurs 0-4, slot 6 : bouton si total > 6)
 */
function getAuthorVisibilityClass(index: number, total: number, isExpanded: boolean): string {
    if (isExpanded) return "block";
    if (index === 0) return "block";
    if (index === 1) return total <= 2 ? "block" : "hidden sm:block";
    if (index === 2) return total <= 3 ? "hidden sm:block" : "hidden md:block";
    if (index === 3) return total <= 4 ? "hidden md:block" : "hidden lg:block";
    if (index === 4) return "hidden lg:block";
    if (index === 5) return total === 6 ? "hidden lg:block" : "hidden";
    return "hidden";
}

function getAuthorButtonVisibilityClass(total: number, isExpanded: boolean): string {
    if (isExpanded) return "flex";
    if (total <= 2) return "hidden";
    if (total === 3) return "flex sm:hidden";
    if (total === 4) return "flex md:hidden";
    if (total === 5 || total === 6) return "flex lg:hidden";
    return "flex";
}

function getHeaderButtonVisibilityClass(total: number, isExpanded: boolean): string {
    if (total <= 2) return "hidden";
    if (isExpanded) return "inline-flex";
    if (total === 3) return "inline-flex sm:hidden";
    if (total === 4) return "inline-flex md:hidden";
    if (total === 5 || total === 6) return "inline-flex lg:hidden";
    return "inline-flex";
}

export default function ExploreAuthors({ authors, title = "Auteurs à l'honneur" }: ExploreAuthorsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const total = authors.length;

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

    const buttonVisibilityClass = getAuthorButtonVisibilityClass(total, isExpanded);
    const headerButtonClass = getHeaderButtonVisibilityClass(total, isExpanded);

    return (
        <div ref={containerRef} className="w-full mt-2 sm:mt-4 flex flex-col scroll-mt-24">
            <div className="mb-6 sm:mb-8 w-full">
                {/* En-tête de section avec titre, compteur et bouton toggle */}
                <div className="flex items-baseline justify-between mb-4 px-1 sm:px-2">
                    <div className="flex items-baseline gap-2.5">
                        <h2 className="font-serif text-2xl text-charcoal tracking-tight">
                            {title}
                        </h2>
                        <span
                            className="text-xs font-mono text-warm-gray px-2 py-0.5 rounded-full bg-soft-border/50"
                            title={`${total} ${total > 1 ? "auteurs" : "auteur"}`}
                        >
                            {total}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={toggleExpand}
                        className={`items-center gap-1.5 text-xs sm:text-sm font-medium text-warm-gray hover:text-charcoal transition-colors group cursor-pointer py-1 px-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 ${headerButtonClass}`}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Replier la section ${title}` : `Déplier et voir tous les auteurs`}
                    >
                        <span>{isExpanded ? "Voir moins" : "Tout afficher"}</span>
                        <CaretDown
                            size={14}
                            weight="bold"
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>

                {/* Grille principale : 1 ligne max par défaut, 6 colonnes sur desktop */}
                <motion.div
                    layout="position"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8"
                >
                    {authors.map((author, idx) => {
                        const visibilityClass = getAuthorVisibilityClass(idx, total, isExpanded);
                        return (
                            <motion.div
                                key={author.id || author.slug || idx}
                                layout="position"
                                initial={false}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className={visibilityClass}
                            >
                                <Link
                                    href={`/author/${author.slug}`}
                                    className="flex flex-col items-center group cursor-pointer text-center"
                                >
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all duration-300 ease-out md:group-hover:-translate-y-1.5 border-2 border-transparent group-hover:border-accent/20">
                                        {author.image_url ? (
                                            <Image
                                                src={author.image_url}
                                                alt={author.name}
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-soft-border/50 flex items-center justify-center font-serif text-2xl text-charcoal">
                                                {getInitials(author.name)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-serif text-sm sm:text-base text-charcoal group-hover:text-accent transition-colors block line-clamp-1">
                                        {author.name}
                                    </span>
                                </Link>
                            </motion.div>
                        );
                    })}

                    {/* Carte bouton « Voir plus » circulaire (Fidèle à AuthorRow sur l'accueil) */}
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
                                className="w-full flex flex-col items-center group cursor-pointer text-center outline-hidden"
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? "Replier les auteurs" : `Voir tous les ${total} auteurs`}
                            >
                                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-dashed border-soft-border hover:border-charcoal/40 bg-paper/40 hover:bg-paper/80 flex items-center justify-center text-warm-gray group-hover:text-charcoal mb-3 transition-all duration-300 md:group-hover:-translate-y-1.5 shadow-xs hover:shadow-md active:scale-95">
                                    {isExpanded ? (
                                        <CaretUp size={28} weight="bold" className="transition-transform group-hover:-translate-y-0.5" />
                                    ) : (
                                        <CaretDown size={28} weight="bold" className="transition-transform group-hover:translate-y-0.5" />
                                    )}
                                </div>
                                <span className="font-serif text-sm sm:text-base font-medium text-charcoal group-hover:text-charcoal transition-colors block line-clamp-1">
                                    {isExpanded ? "Voir moins" : "Voir plus"}
                                </span>
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
