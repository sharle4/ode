"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PoemCard from "@/components/ui/PoemCard";
import CollectionCard from "@/components/author/CollectionCard";
import { getInitials } from "@/utils/gradient";
import { Feather, User, BookOpen, Sparkle, Tag, ArrowRight } from "@phosphor-icons/react";
import type { SearchResults } from "@/types";

interface ExploreSearchResultsProps {
    query: string;
    results: SearchResults;
}

type TabKey = "all" | "poems" | "authors" | "collections";

export default function ExploreSearchResults({ query, results }: ExploreSearchResultsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("all");

    const poemsCount = results.poems?.length || 0;
    const authorsCount = results.authors?.length || 0;
    const collectionsCount = results.collections?.length || 0;
    const totalCount = results.total || 0;

    const tabs: { key: TabKey; label: string; count: number; icon: React.ComponentType<any> }[] = [
        { key: "all", label: "Tous", count: totalCount, icon: Sparkle },
        { key: "poems", label: "Poèmes", count: poemsCount, icon: Feather },
        { key: "authors", label: "Auteurs", count: authorsCount, icon: User },
        { key: "collections", label: "Recueils", count: collectionsCount, icon: BookOpen },
    ];

    if (totalCount === 0) {
        return (
            <div className="w-full py-16 px-4 text-center max-w-lg mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-charcoal/5 dark:bg-white/5 flex items-center justify-center text-warm-gray mb-4">
                    <Sparkle size={32} weight="regular" />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal dark:text-white mb-2">
                    Aucun résultat trouvé
                </h2>
                <p className="text-warm-gray dark:text-zinc-400 mb-6 text-sm md:text-base leading-relaxed">
                    Nous n&apos;avons trouvé aucun poème, auteur ou recueil correspondant à «&nbsp;
                    <span className="text-charcoal dark:text-white font-medium">{query}</span>
                    &nbsp;».
                </p>
                <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all shadow-sm active:scale-95"
                >
                    Explorer les poèmes tendances
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header & Onglets de filtrage */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soft-border dark:border-zinc-800 pb-4">
                <div className="flex items-baseline gap-2">
                    <h2 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-white">
                        Résultats pour <span className="italic text-accent">«&nbsp;{query}&nbsp;»</span>
                    </h2>
                    <span className="text-sm font-sans text-warm-gray dark:text-zinc-400">
                        ({totalCount} résultat{totalCount > 1 ? "s" : ""})
                    </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                                    isActive
                                        ? "bg-charcoal text-cream dark:bg-white dark:text-charcoal shadow-sm"
                                        : "bg-paper dark:bg-zinc-800 text-charcoal/70 dark:text-zinc-300 hover:text-charcoal dark:hover:text-white hover:bg-paper/80"
                                }`}
                            >
                                <Icon size={14} weight={isActive ? "bold" : "regular"} />
                                <span>{tab.label}</span>
                                <span
                                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                                        isActive
                                            ? "bg-white/20 dark:bg-black/20 text-cream dark:text-charcoal"
                                            : "bg-charcoal/10 dark:bg-white/10 text-warm-gray dark:text-zinc-400"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contenu selon l'onglet actif */}

            {/* 1. ONGLET TOUS */}
            {activeTab === "all" && (
                <div className="flex flex-col gap-12">
                    {/* Auteurs */}
                    {authorsCount > 0 && (
                        <section className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-xl text-charcoal dark:text-white flex items-center gap-2">
                                    <User size={20} className="text-accent" />
                                    <span>Auteurs ({authorsCount})</span>
                                </h3>
                                {authorsCount > 4 && (
                                    <button
                                        onClick={() => setActiveTab("authors")}
                                        className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                                    >
                                        Voir tous ({authorsCount})
                                        <ArrowRight size={13} weight="bold" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                                {results.authors.slice(0, 4).map((author) => (
                                    <Link
                                        key={author.id}
                                        href={`/author/${author.slug}`}
                                        className="flex flex-col items-center p-4 rounded-2xl bg-paper/60 dark:bg-zinc-900/60 border border-soft-border/80 dark:border-zinc-800/80 hover:border-accent/30 hover:shadow-md transition-all group text-center"
                                    >
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-accent/40 transition-all">
                                            {author.image_url ? (
                                                <Image
                                                    src={author.image_url}
                                                    alt={author.name}
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-300 dark:bg-zinc-800 flex items-center justify-center font-serif text-xl text-charcoal dark:text-white">
                                                    {getInitials(author.name)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-serif text-sm sm:text-base font-medium text-charcoal dark:text-white group-hover:text-accent transition-colors truncate w-full">
                                            {author.name}
                                        </span>
                                        <span className="text-xs text-warm-gray dark:text-zinc-400 mt-0.5">
                                            {author.date_of_birth && author.date_of_death
                                                ? `${author.date_of_birth.slice(0, 4)} – ${author.date_of_death.slice(0, 4)}`
                                                : author.nationality || "Auteur"}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Poèmes */}
                    {poemsCount > 0 && (
                        <section className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-xl text-charcoal dark:text-white flex items-center gap-2">
                                    <Feather size={20} className="text-accent" />
                                    <span>Poèmes ({poemsCount})</span>
                                </h3>
                                {poemsCount > 8 && (
                                    <button
                                        onClick={() => setActiveTab("poems")}
                                        className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                                    >
                                        Voir tous ({poemsCount})
                                        <ArrowRight size={13} weight="bold" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {results.poems.slice(0, 8).map((poem, i) => (
                                    <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recueils */}
                    {collectionsCount > 0 && (
                        <section className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-xl text-charcoal dark:text-white flex items-center gap-2">
                                    <BookOpen size={20} className="text-accent" />
                                    <span>Recueils ({collectionsCount})</span>
                                </h3>
                                {collectionsCount > 4 && (
                                    <button
                                        onClick={() => setActiveTab("collections")}
                                        className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                                    >
                                        Voir tous ({collectionsCount})
                                        <ArrowRight size={13} weight="bold" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {results.collections.slice(0, 4).map((col, index) => (
                                    <CollectionCard
                                        key={col.id || index}
                                        collection={{
                                            title: col.title,
                                            slug: col.slug,
                                            year: col.publication_year,
                                            poemCount: col.poems_count || 0,
                                        }}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Catégories / Thèmes */}
                    {results.categories && results.categories.length > 0 && (
                        <section className="w-full">
                            <h3 className="font-serif text-xl text-charcoal dark:text-white mb-4 flex items-center gap-2">
                                <Tag size={20} className="text-accent" />
                                <span>Thèmes & Mouvements associés</span>
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {results.categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-paper dark:bg-zinc-800 border border-soft-border dark:border-zinc-700 hover:border-accent/40 text-charcoal dark:text-white transition-all text-sm font-serif hover:text-accent"
                                    >
                                        <span>{cat.name}</span>
                                        <span className="text-[10px] uppercase font-sans tracking-wider text-warm-gray dark:text-zinc-400">
                                            {cat.type === "THEME" ? "Thème" : cat.type === "MOVEMENT" ? "Mouvement" : "Époque"}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* 2. ONGLET POÈMES */}
            {activeTab === "poems" && (
                <div className="w-full">
                    {poemsCount === 0 ? (
                        <p className="text-warm-gray dark:text-zinc-400 text-center py-12">
                            Aucun poème ne correspond à cette recherche.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {results.poems.map((poem, i) => (
                                <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 3. ONGLET AUTEURS */}
            {activeTab === "authors" && (
                <div className="w-full">
                    {authorsCount === 0 ? (
                        <p className="text-warm-gray dark:text-zinc-400 text-center py-12">
                            Aucun auteur ne correspond à cette recherche.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.authors.map((author, index) => (
                                <Link
                                    key={author.id}
                                    href={`/author/${author.slug}`}
                                    className="flex flex-col items-center p-6 rounded-2xl bg-paper/60 dark:bg-zinc-900/60 border border-soft-border/80 dark:border-zinc-800/80 hover:border-accent/40 hover:shadow-lg transition-all group text-center"
                                >
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 shadow-md border-2 border-transparent group-hover:border-accent/40 transition-all">
                                        {author.image_url ? (
                                            <Image
                                                src={author.image_url}
                                                alt={author.name}
                                                width={112}
                                                height={112}
                                                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-300 dark:bg-zinc-800 flex items-center justify-center font-serif text-2xl text-charcoal dark:text-white">
                                                {getInitials(author.name)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-serif text-base sm:text-lg font-medium text-charcoal dark:text-white group-hover:text-accent transition-colors truncate w-full">
                                        {author.name}
                                    </span>
                                    <span className="text-xs text-warm-gray dark:text-zinc-400 mt-1">
                                        {author.date_of_birth && author.date_of_death
                                            ? `${author.date_of_birth.slice(0, 4)} – ${author.date_of_death.slice(0, 4)}`
                                            : author.nationality || "Auteur"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 4. ONGLET RECUEILS */}
            {activeTab === "collections" && (
                <div className="w-full">
                    {collectionsCount === 0 ? (
                        <p className="text-warm-gray dark:text-zinc-400 text-center py-12">
                            Aucun recueil ne correspond à cette recherche.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.collections.map((col, index) => (
                                <CollectionCard
                                    key={col.id || index}
                                    collection={{
                                        title: col.title,
                                        slug: col.slug,
                                        year: col.publication_year,
                                        poemCount: col.poems_count || 0,
                                    }}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
