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
    ArrowRight,
    Trash
} from "@phosphor-icons/react";
import { RothkoArtwork } from "@/components/poem/RothkoArtwork";
import { getCoverGradient, getInitials } from "@/utils/gradient";
import { toggleLike, toggleCollectionLike, toggleAuthorLike } from "@/app/actions/poetry";
import { useAction } from "next-safe-action/hooks";

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

    const { executeAsync: executePoemLike } = useAction(toggleLike);
    const { executeAsync: executeCollectionLike } = useAction(toggleCollectionLike);
    const { executeAsync: executeAuthorLike } = useAction(toggleAuthorLike);

    // Unlike handlers with optimistic removal
    const handleUnlikePoem = async (poem: LikedPoem) => {
        setLikedPoems((prev) => prev.filter((p) => p.id !== poem.id));
        try {
            await executePoemLike({ poemId: poem.id, slug: poem.slug, targetState: false });
        } catch (error) {
            console.error("Erreur unlike poème:", error);
        }
    };

    const handleUnlikeCollection = async (col: LikedCollection) => {
        setLikedCollections((prev) => prev.filter((c) => c.id !== col.id));
        try {
            await executeCollectionLike({ collectionId: col.id, slug: col.slug, targetState: false });
        } catch (error) {
            console.error("Erreur unlike recueil:", error);
        }
    };

    const handleUnlikeAuthor = async (author: LikedAuthor) => {
        setLikedAuthors((prev) => prev.filter((a) => a.id !== author.id));
        try {
            await executeAuthorLike({ authorId: author.id, slug: author.slug, targetState: false });
        } catch (error) {
            console.error("Erreur unlike auteur:", error);
        }
    };

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
                                        ? "text-charcoal dark:text-cream shadow-sm"
                                        : "text-warm-gray hover:text-charcoal dark:hover:text-cream"
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
                            className="w-full pl-9 pr-8 py-2 text-xs md:text-sm rounded-full bg-paper dark:bg-zinc-900 border border-soft-border text-charcoal dark:text-cream focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-warm-gray/60"
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
                    <h3 className="font-serif text-2xl text-charcoal dark:text-cream">
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
                                        <h3 className="font-serif text-xl text-charcoal dark:text-cream">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {(activeCategory === "all" ? filteredPoems.slice(0, 6) : filteredPoems).map(
                                            (poem, idx) => {
                                                const authorName =
                                                    poem.authors?.map((a) => a.name).join(", ") ||
                                                    "Auteur inconnu";
                                                const coverGradient = getCoverGradient(poem.slug);

                                                return (
                                                    <motion.div
                                                        key={poem.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.96 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ duration: 0.25, delay: idx * 0.03 }}
                                                        className="group relative flex flex-col bg-paper dark:bg-zinc-900 border border-soft-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                                                    >
                                                        {/* Artwork / Canvas Header */}
                                                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-soft-border/30">
                                                            {poem.rothko_params ? (
                                                                <RothkoArtwork
                                                                    params={poem.rothko_params}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`w-full h-full bg-gradient-to-br ${coverGradient}`}
                                                                />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                                                            {/* Direct unlike button for owner */}
                                                            {isOwner && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleUnlikePoem(poem);
                                                                    }}
                                                                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow"
                                                                    title="Retirer des favoris"
                                                                >
                                                                    <Trash size={14} />
                                                                </button>
                                                            )}

                                                            <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-mono">
                                                                <Heart size={12} weight="fill" className="inline mr-1 text-accent" />
                                                                {poem.likes_count || 1}
                                                            </div>
                                                        </div>

                                                        {/* Poem Details */}
                                                        <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                                                            <div>
                                                                <Link
                                                                    href={`/poem/${poem.slug || poem.id}`}
                                                                    className="font-serif text-lg text-charcoal dark:text-cream group-hover:text-accent transition-colors line-clamp-1 font-medium"
                                                                >
                                                                    {poem.title}
                                                                </Link>
                                                                <p className="text-xs uppercase tracking-wider text-warm-gray line-clamp-1 mt-0.5">
                                                                    {authorName}
                                                                </p>
                                                            </div>

                                                            {poem.collections?.title && (
                                                                <div className="pt-2 border-t border-soft-border/50 text-[11px] text-warm-gray font-serif italic line-clamp-1">
                                                                    Recueil : {poem.collections.title}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Full card clickable link */}
                                                        <Link
                                                            href={`/poem/${poem.slug || poem.id}`}
                                                            className="absolute inset-0 z-10"
                                                            aria-label={poem.title}
                                                        />
                                                    </motion.div>
                                                );
                                            }
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
                                        <h3 className="font-serif text-xl text-charcoal dark:text-cream">
                                            Recueils Favoris
                                        </h3>
                                        <span className="text-xs text-warm-gray font-mono">
                                            ({filteredCollections.length})
                                        </span>
                                    </div>
                                    {activeCategory === "all" && filteredCollections.length > 3 && (
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
                                            const authorName =
                                                col.authors?.map((a) => a.name).join(", ") ||
                                                "Auteur inconnu";

                                            return (
                                                <motion.div
                                                    key={col.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.96 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                                                    className="group relative flex flex-col cursor-pointer"
                                                >
                                                    {/* Couverture Livre 2/3 */}
                                                    <div
                                                        className={`relative w-full aspect-[2/3] rounded-r-lg rounded-l-sm shadow-md group-hover:shadow-xl transition-all duration-300 md:group-hover:-translate-y-1.5 overflow-hidden bg-gradient-to-br ${coverColor}`}
                                                    >
                                                        {/* Reliure */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/25 z-10 border-r border-white/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.15)]" />

                                                        <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-20">
                                                            <span className="text-[10px] tracking-widest uppercase text-white/80 font-sans text-center mt-1 line-clamp-1">
                                                                {authorName}
                                                            </span>

                                                            <h4 className="font-serif text-white text-base sm:text-lg text-center leading-tight drop-shadow line-clamp-3">
                                                                {col.title}
                                                            </h4>

                                                            <span className="text-[10px] tracking-widest text-white/70 text-center mb-1 font-mono">
                                                                {col.publication_year || ""}
                                                            </span>
                                                        </div>

                                                        {/* Unlike Button */}
                                                        {isOwner && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleUnlikeCollection(col);
                                                                }}
                                                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 shadow"
                                                                title="Retirer des favoris"
                                                            >
                                                                <Trash size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 flex flex-col px-1">
                                                        <span className="font-serif text-sm text-charcoal dark:text-cream group-hover:text-accent transition-colors line-clamp-1 font-medium">
                                                            {col.title}
                                                        </span>
                                                        <div className="flex justify-between items-center text-[11px] text-warm-gray mt-0.5">
                                                            <span className="line-clamp-1">{authorName}</span>
                                                            {col.poems_count ? (
                                                                <span className="font-mono text-[10px] uppercase">
                                                                    {col.poems_count}p.
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={`/collection/${col.slug}`}
                                                        className="absolute inset-0 z-10"
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
                                        <h3 className="font-serif text-xl text-charcoal dark:text-cream">
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
                                                                <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-charcoal/60 dark:text-cream/60">
                                                                    {getInitials(author.name)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Unlike Button */}
                                                        {isOwner && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleUnlikeAuthor(author);
                                                                }}
                                                                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 shadow"
                                                                title="Retirer des favoris"
                                                            >
                                                                <Trash size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <h4 className="font-serif text-sm sm:text-base text-charcoal dark:text-cream group-hover:text-accent transition-colors font-medium line-clamp-1">
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
