"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Heart,
    BookOpen,
    Feather,
    MagnifyingGlass,
    X,
    Sparkle,
    ArrowRight
} from "@phosphor-icons/react";
import PoemCard from "@/components/ui/PoemCard";
import { getCoverGradient, getInitials } from "@/utils/gradient";
import { formatAuthors } from "@/utils/author";

interface LikedPoem {
    id: string;
    title: string;
    slug: string;
    publication_year?: number;
    average_review?: number;
    reviews_count?: number;
    reads_count?: number;
    likes_count?: number;
    liked_at?: string;
    authors?: { id: string; name: string; slug: string }[];
    collections?: { id: string; title: string; slug: string };
    rothko_params?: any;
}

interface LikedCollection {
    id: string;
    title: string;
    slug: string;
    publication_year?: number;
    summary?: string;
    cover_url?: string;
    poems_count?: number;
    average_review?: number;
    reviews_count?: number;
    likes_count?: number;
    liked_at?: string;
    authors?: { id: string; name: string; slug: string }[];
}

interface LikedAuthor {
    id: string;
    name: string;
    slug: string;
    biography?: string;
    image_url?: string;
    date_of_birth?: string;
    date_of_death?: string;
    nationality?: string;
    movement?: string[];
    likes_count?: number;
    liked_at?: string;
}

interface ProfileLikesProps {
    username: string;
    isOwner?: boolean;
    initialLikedPoems?: LikedPoem[];
    initialLikedCollections?: LikedCollection[];
    initialLikedAuthors?: LikedAuthor[];
}

type LikeCategory = "all" | "poems" | "collections" | "authors";

export default function ProfileLikes({
    username,
    isOwner = false,
    initialLikedPoems = [],
    initialLikedCollections = [],
    initialLikedAuthors = [],
}: ProfileLikesProps) {
    const [likedPoems, setLikedPoems] = useState<LikedPoem[]>(initialLikedPoems);
    const [likedCollections, setLikedCollections] = useState<LikedCollection[]>(initialLikedCollections);
    const [likedAuthors, setLikedAuthors] = useState<LikedAuthor[]>(initialLikedAuthors);

    const [activeCategory, setActiveCategory] = useState<LikeCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter by search query
    const filteredPoems = useMemo(() => {
        if (!searchQuery.trim()) return likedPoems;
        const q = searchQuery.toLowerCase();
        return likedPoems.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.authors?.some((a) => a.name.toLowerCase().includes(q))
        );
    }, [likedPoems, searchQuery]);

    const filteredCollections = useMemo(() => {
        if (!searchQuery.trim()) return likedCollections;
        const q = searchQuery.toLowerCase();
        return likedCollections.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.authors?.some((a) => a.name.toLowerCase().includes(q))
        );
    }, [likedCollections, searchQuery]);

    const filteredAuthors = useMemo(() => {
        if (!searchQuery.trim()) return likedAuthors;
        const q = searchQuery.toLowerCase();
        return likedAuthors.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.nationality?.toLowerCase().includes(q) ||
                a.movement?.some((m) => m.toLowerCase().includes(q))
        );
    }, [likedAuthors, searchQuery]);

    const totalLikes = likedPoems.length + likedCollections.length + likedAuthors.length;

    const tabs: { id: LikeCategory; label: string; count: number }[] = [
        { id: "all", label: "Tout", count: totalLikes },
        { id: "poems", label: "Poèmes", count: likedPoems.length },
        { id: "collections", label: "Recueils", count: likedCollections.length },
        { id: "authors", label: "Auteurs", count: likedAuthors.length },
    ];

    function extractLifespan(author: LikedAuthor): string {
        const birth = author.date_of_birth?.match(/\d{4}/)?.[0];
        const death = author.date_of_death?.match(/\d{4}/)?.[0];
        if (birth && death) return `${birth} — ${death}`;
        if (birth) return `Né en ${birth}`;
        return "";
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header & Controls: Categories + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                {/* Sub-tabs */}
                <div className="inline-flex p-1 bg-soft-border/30 dark:bg-zinc-800/40 rounded-xl border border-soft-border/50 self-start">
                    {tabs.map((tab) => {
                        const isActive = activeCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveCategory(tab.id)}
                                className={`relative px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all select-none flex items-center gap-2 ${
                                    isActive
                                        ? "text-charcoal shadow-sm"
                                        : "text-warm-gray hover:text-charcoal"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="likesSubTab"
                                        className="absolute inset-0 bg-paper dark:bg-zinc-800 rounded-lg shadow-sm"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.label}</span>
                                <span
                                    className={`relative z-10 text-[11px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                                        isActive
                                            ? "bg-accent/15 text-accent font-semibold"
                                            : "bg-black/5 dark:bg-white/10 text-warm-gray"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Live Search */}
                {totalLikes > 0 && (
                    <div className="relative w-full sm:w-64">
                        <MagnifyingGlass
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-8 py-2 text-xs md:text-sm rounded-full bg-paper dark:bg-zinc-900 border border-soft-border text-charcoal focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-warm-gray/60"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Global Empty State */}
            {totalLikes === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-12 md:p-16 text-center bg-paper/60 dark:bg-zinc-900/40 border border-soft-border border-dashed rounded-3xl flex flex-col items-center gap-4 my-8"
                >
                    <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-2 shadow-inner">
                        <Heart size={32} weight="duotone" />
                    </div>
                    <h3 className="font-serif text-2xl text-charcoal">
                        Aucun favori pour le moment
                    </h3>
                    <p className="font-serif italic text-warm-gray text-sm md:text-base max-w-md">
                        {isOwner
                            ? "Le cœur garde en mémoire les vers qui l'ont touché. Explorez les poèmes, recueils et poètes pour composer votre panthéon personnel."
                            : `${username} n'a pas encore ajouté de poèmes, recueils ou auteurs à ses favoris.`}
                    </p>
                    {isOwner && (
                        <Link
                            href="/explore"
                            className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white text-xs font-semibold uppercase tracking-wider hover:bg-accent-light transition-all shadow-md hover:shadow-lg shadow-accent/20"
                        >
                            <Sparkle size={16} weight="fill" />
                            Découvrir les poèmes
                        </Link>
                    )}
                </motion.div>
            )}

            {/* Content Display */}
            {totalLikes > 0 && (
                <div className="flex flex-col gap-12">
                    {/* 1. VUE TOUT OU POÈMES */}
                    {(activeCategory === "all" || activeCategory === "poems") && (
                        <section className="flex flex-col gap-6">
                            {(activeCategory === "all" || searchQuery) && (
                                <div className="flex items-center justify-between border-b border-soft-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <Feather size={20} className="text-accent" />
                                        <h3 className="font-serif text-xl text-charcoal">
                                            Poèmes Favoris
                                        </h3>
                                        <span className="text-xs text-warm-gray font-mono">
                                            ({filteredPoems.length})
                                        </span>
                                    </div>
                                    {activeCategory === "all" && filteredPoems.length > 4 && (
                                        <button
                                            onClick={() => setActiveCategory("poems")}
                                            className="text-xs uppercase tracking-widest text-accent hover:underline flex items-center gap-1 font-medium"
                                        >
                                            Tout voir
                                            <ArrowRight size={12} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {filteredPoems.length === 0 ? (
                                <p className="text-sm font-serif italic text-warm-gray py-4">
                                    Aucun poème ne correspond à votre recherche.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                    <AnimatePresence>
                                        {(activeCategory === "all" ? filteredPoems.slice(0, 4) : filteredPoems).map(
                                            (poem, idx) => (
                                                <PoemCard
                                                    key={poem.id}
                                                    poem={poem}
                                                    index={idx}
                                                    layout="grid"
                                                />
                                            )
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>
                    )}

                    {/* 2. VUE TOUT OU RECUEILS */}
                    {(activeCategory === "all" || activeCategory === "collections") && (
                        <section className="flex flex-col gap-6">
                            {(activeCategory === "all" || searchQuery) && (
                                <div className="flex items-center justify-between border-b border-soft-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={20} className="text-accent" />
                                        <h3 className="font-serif text-xl text-charcoal">
                                            Recueils Favoris
                                        </h3>
                                        <span className="text-xs text-warm-gray font-mono">
                                            ({filteredCollections.length})
                                        </span>
                                    </div>
                                    {activeCategory === "all" && filteredCollections.length > 4 && (
                                        <button
                                            onClick={() => setActiveCategory("collections")}
                                            className="text-xs uppercase tracking-widest text-accent hover:underline flex items-center gap-1 font-medium"
                                        >
                                            Tout voir
                                            <ArrowRight size={12} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {filteredCollections.length === 0 ? (
                                <p className="text-sm font-serif italic text-warm-gray py-4">
                                    Aucun recueil ne correspond à votre recherche.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                    <AnimatePresence>
                                        {(activeCategory === "all"
                                            ? filteredCollections.slice(0, 4)
                                            : filteredCollections
                                        ).map((col, idx) => {
                                            const coverColor = getCoverGradient(col.slug);
                                            const authorInfo = formatAuthors(col.authors);

                                            return (
                                                <motion.div
                                                    key={col.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.96 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                                                    className="group relative flex flex-col cursor-pointer select-none rounded-r-xl rounded-l-sm"
                                                >
                                                    {/* Couverture Livre 2/3 */}
                                                    <div
                                                        className={`relative w-full aspect-[2/3] rounded-r-xl rounded-l-sm shadow-md group-hover:shadow-xl transition-all duration-300 md:group-hover:-translate-y-1.5 overflow-hidden bg-gradient-to-br ${coverColor}`}
                                                    >
                                                        {/* Reliure */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-3.5 sm:w-4 bg-black/25 z-10 border-r border-white/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.2)]" />

                                                        {/* Contenu centré de la couverture avec typographie agrandie et équilibrée */}
                                                        <div className="absolute inset-0 flex flex-col justify-between items-center p-4 sm:p-5 text-center z-20">
                                                            <span className="text-xs sm:text-[13px] tracking-widest uppercase text-white/90 font-sans font-medium line-clamp-2 px-2 pt-1 drop-shadow-sm">
                                                                {authorInfo.coverText}
                                                            </span>

                                                            <h4 className="font-serif text-white text-lg sm:text-xl md:text-2xl text-center leading-snug drop-shadow-md font-medium px-2 line-clamp-4">
                                                                {col.title}
                                                            </h4>

                                                            <span className="text-xs sm:text-sm tracking-widest text-white/80 font-mono pb-1 drop-shadow-sm">
                                                                {col.publication_year || ""}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={`/collection/${col.slug}`}
                                                        className="absolute inset-0 z-20 rounded-r-xl rounded-l-sm outline-none"
                                                        aria-label={col.title}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>
                    )}

                    {/* 3. VUE TOUT OU AUTEURS */}
                    {(activeCategory === "all" || activeCategory === "authors") && (
                        <section className="flex flex-col gap-6">
                            {(activeCategory === "all" || searchQuery) && (
                                <div className="flex items-center justify-between border-b border-soft-border pb-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkle size={20} className="text-accent" />
                                        <h3 className="font-serif text-xl text-charcoal">
                                            Auteurs Favoris
                                        </h3>
                                        <span className="text-xs text-warm-gray font-mono">
                                            ({filteredAuthors.length})
                                        </span>
                                    </div>
                                    {activeCategory === "all" && filteredAuthors.length > 4 && (
                                        <button
                                            onClick={() => setActiveCategory("authors")}
                                            className="text-xs uppercase tracking-widest text-accent hover:underline flex items-center gap-1 font-medium"
                                        >
                                            Tout voir
                                            <ArrowRight size={12} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {filteredAuthors.length === 0 ? (
                                <p className="text-sm font-serif italic text-warm-gray py-4">
                                    Aucun auteur ne correspond à votre recherche.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    <AnimatePresence>
                                        {(activeCategory === "all"
                                            ? filteredAuthors.slice(0, 5)
                                            : filteredAuthors
                                        ).map((author, idx) => {
                                            const lifespan = extractLifespan(author);

                                            return (
                                                <motion.div
                                                    key={author.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.96 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                                                    className="group relative flex flex-col items-center text-center p-4 bg-paper dark:bg-zinc-900 border border-soft-border rounded-2xl hover:border-accent/40 hover:shadow-md transition-all duration-300"
                                                >
                                                    {/* Portrait Avatar */}
                                                    <div className="relative mb-3">
                                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-soft-border group-hover:border-accent transition-colors shadow-sm bg-zinc-200 dark:bg-zinc-800">
                                                            {author.image_url ? (
                                                                <Image
                                                                    src={author.image_url}
                                                                    alt={author.name}
                                                                    width={96}
                                                                    height={96}
                                                                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-charcoal/60">
                                                                    {getInitials(author.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <h4 className="font-serif text-sm sm:text-base text-charcoal group-hover:text-accent transition-colors font-medium line-clamp-1">
                                                        {author.name}
                                                    </h4>

                                                    {lifespan && (
                                                        <span className="text-[11px] text-warm-gray font-mono mt-0.5">
                                                            {lifespan}
                                                        </span>
                                                    )}

                                                    {author.movement && author.movement.length > 0 && (
                                                        <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium tracking-wide">
                                                            {author.movement[0]}
                                                        </span>
                                                    )}

                                                    <Link
                                                        href={`/author/${author.slug}`}
                                                        className="absolute inset-0 z-10"
                                                        aria-label={author.name}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
