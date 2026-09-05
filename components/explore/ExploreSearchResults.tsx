"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PoemCard from "@/components/ui/PoemCard";
import CollectionCard from "@/components/author/CollectionCard";
import { RothkoArtwork } from "@/components/poem/RothkoArtwork";
import { getInitials, getCoverGradient } from "@/utils/gradient";
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

    const topPoem = results.poems?.[0];
    const isMultiWord = query.trim().split(/\s+/).length > 1;
    const hasYearMatch = Boolean(topPoem?.publication_year && query.includes(String(topPoem.publication_year)));
    const hasStrongSpotlight = Boolean(
        topPoem && (
            topPoem.matchType === "author_title" ||
            topPoem.matchType === "verse" ||
            hasYearMatch ||
            (isMultiWord && topPoem.matchType === "title") ||
            (isMultiWord && poemsCount <= 2)
        )
    );
    const showPoemsFirst = Boolean(
        poemsCount > 0 && (
            hasStrongSpotlight ||
            isMultiWord ||
            authorsCount === 0
        )
    );

    const tabs: { key: TabKey; label: string; count: number; icon: React.ComponentType<any> }[] = [
        { key: "all", label: "Tous", count: totalCount, icon: Sparkle },
        { key: "poems", label: "Poèmes", count: poemsCount, icon: Feather },
        { key: "authors", label: "Auteurs", count: authorsCount, icon: User },
        { key: "collections", label: "Recueils", count: collectionsCount, icon: BookOpen },
    ];

    if (totalCount === 0) {
        return (
            <div className="w-full py-16 px-4 text-center max-w-lg mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-charcoal/5 flex items-center justify-center text-warm-gray mb-4">
                    <Sparkle size={32} weight="regular" />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-2">
                    Aucun résultat trouvé
                </h2>
                <p className="text-warm-gray mb-6 text-sm md:text-base leading-relaxed">
                    Nous n&apos;avons trouvé aucun poème, auteur ou recueil correspondant à «&nbsp;
                    <span className="text-charcoal font-medium">{query}</span>
                    &nbsp;».
                </p>
                <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all shadow-sm active:scale-95"
                >
                    Explorer le catalogue
                </Link>
            </div>
        );
    }

    const renderSpotlight = () => {
        if (!hasStrongSpotlight || !topPoem) return null;

        const authorNames = Array.isArray(topPoem.authors) && topPoem.authors.length > 0
            ? topPoem.authors.map((a: any) => (typeof a === "string" ? a : a?.name || "")).filter(Boolean).join(", ")
            : "Auteur inconnu";

        const fallbackGradient = topPoem.slug
            ? getCoverGradient(topPoem.slug)
            : "from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900";

        return (
            <div className="w-full mb-8 p-6 sm:p-8 rounded-3xl bg-paper border border-soft-border shadow-sm relative overflow-hidden group hover:border-accent/40 transition-all">
                <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-wider text-accent font-semibold mb-4">
                    <Sparkle size={16} weight="fill" />
                    <span>Meilleur résultat</span>
                    {topPoem.matchType === "author_title" && (
                        <span className="text-[11px] font-sans font-normal text-warm-gray lowercase">
                            · accord titre & auteur
                        </span>
                    )}
                    {topPoem.matchType === "verse" && (
                        <span className="text-[11px] font-sans font-normal text-warm-gray lowercase">
                            · vers extrait
                        </span>
                    )}
                    {hasYearMatch && (
                        <span className="text-[11px] font-sans font-normal text-warm-gray lowercase">
                            · édition {topPoem.publication_year}
                        </span>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Link
                        href={`/poem/${topPoem.slug || topPoem.id}`}
                        className="w-24 h-32 sm:w-28 sm:h-36 rounded-2xl overflow-hidden shadow-md flex-shrink-0 relative group-hover:scale-[1.02] transition-transform duration-500"
                    >
                        {topPoem.rothko_params ? (
                            <RothkoArtwork
                                params={topPoem.rothko_params}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient}`} />
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-2xl" />
                    </Link>

                    <div className="flex-1 min-w-0">
                        <Link href={`/poem/${topPoem.slug || topPoem.id}`} className="inline-block group-hover:text-accent transition-colors">
                            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal font-medium leading-tight">
                                {topPoem.title}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm text-warm-gray font-serif">
                            <span className="text-charcoal font-medium">{authorNames}</span>
                            {topPoem.publication_year && (
                                <>
                                    <span>·</span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-charcoal/5 text-charcoal">
                                        {topPoem.publication_year}
                                    </span>
                                </>
                            )}
                            {topPoem.collections?.title && (
                                <>
                                    <span>·</span>
                                    <span className="italic text-warm-gray truncate">
                                        {topPoem.collections.title}
                                    </span>
                                </>
                            )}
                        </div>

                        {topPoem.snippet && (
                            <div className="mt-3.5 pl-4 border-l-2 border-accent py-1 bg-accent/5 rounded-r-xl">
                                <p className="font-serif italic text-sm sm:text-base text-charcoal leading-relaxed">
                                    « {topPoem.snippet} »
                                </p>
                            </div>
                        )}
                    </div>

                    <Link
                        href={`/poem/${topPoem.slug || topPoem.id}`}
                        className="flex-shrink-0 self-stretch sm:self-center px-6 py-3 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent-light transition-all shadow-sm flex items-center justify-center gap-2 group/btn active:scale-95"
                    >
                        <span>Lire le poème</span>
                        <ArrowRight size={16} weight="bold" className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        );
    };

    const renderAuthorsSection = () => {
        if (authorsCount === 0) return null;
        return (
            <section className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-xl text-charcoal flex items-center gap-2">
                        <User size={20} className="text-accent" />
                        <span>Auteurs ({authorsCount})</span>
                    </h3>
                    {authorsCount > 4 && (
                        <button
                            type="button"
                            onClick={() => setActiveTab("authors")}
                            className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
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
                            className="flex flex-col items-center p-4 rounded-2xl bg-paper border border-soft-border hover:border-accent/40 hover:shadow-md transition-all group text-center"
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
                                    <div className="w-full h-full bg-charcoal/10 flex items-center justify-center font-serif text-xl text-charcoal">
                                        {getInitials(author.name)}
                                    </div>
                                )}
                            </div>
                            <span className="font-serif text-sm sm:text-base font-medium text-charcoal group-hover:text-accent transition-colors truncate w-full">
                                {author.name}
                            </span>
                            <span className="text-xs text-warm-gray mt-0.5 truncate w-full">
                                {author.date_of_birth && author.date_of_death
                                    ? `${author.date_of_birth.slice(0, 4)} – ${author.date_of_death.slice(0, 4)}`
                                    : author.nationality || "Auteur"}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        );
    };

    const renderPoemsSection = () => {
        if (poemsCount === 0) return null;
        return (
            <section className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-xl text-charcoal flex items-center gap-2">
                        <Feather size={20} className="text-accent" />
                        <span>Poèmes ({poemsCount})</span>
                    </h3>
                    {poemsCount > 4 && (
                        <button
                            type="button"
                            onClick={() => setActiveTab("poems")}
                            className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Voir tous ({poemsCount})
                            <ArrowRight size={13} weight="bold" />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                    {results.poems.slice(0, 4).map((poem, i) => (
                        <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                    ))}
                </div>
            </section>
        );
    };

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header & Onglets de filtrage sur une seule ligne */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-soft-border pb-5">
                <div className="min-w-0 flex-1 pr-0 md:pr-6">
                    <h2 className="font-serif text-2xl sm:text-3xl text-charcoal leading-snug">
                        Résultats pour <span className="italic text-accent break-words">«&nbsp;{query}&nbsp;»</span>
                    </h2>
                </div>

                <div className="flex-shrink-0 self-start md:self-center max-w-full overflow-x-auto no-scrollbar py-0.5">
                    <div className="p-1 rounded-full bg-paper border border-soft-border inline-flex items-center gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap cursor-pointer select-none ${
                                        isActive
                                            ? "bg-charcoal text-cream shadow-sm"
                                            : "text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
                                    }`}
                                >
                                    <Icon size={14} weight={isActive ? "fill" : "regular"} />
                                    <span>{tab.label}</span>
                                    <span
                                        className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                                            isActive
                                                ? "bg-cream/20 text-cream"
                                                : "bg-charcoal/10 text-warm-gray"
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contenu selon l'onglet actif */}

            {/* 1. ONGLET TOUS */}
            {activeTab === "all" && (
                <div className="flex flex-col gap-10">
                    {/* Spotlight si accord fort */}
                    {renderSpotlight()}

                    {/* Ordre intelligent Poèmes / Auteurs */}
                    {showPoemsFirst ? (
                        <>
                            {renderPoemsSection()}
                            {renderAuthorsSection()}
                        </>
                    ) : (
                        <>
                            {renderAuthorsSection()}
                            {renderPoemsSection()}
                        </>
                    )}

                    {/* Recueils (1 ligne max : 4 colonnes sur desktop) */}
                    {collectionsCount > 0 && (
                        <section className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-xl text-charcoal flex items-center gap-2">
                                    <BookOpen size={20} className="text-accent" />
                                    <span>Recueils ({collectionsCount})</span>
                                </h3>
                                {collectionsCount > 4 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("collections")}
                                        className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
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
                            <h3 className="font-serif text-xl text-charcoal mb-4 flex items-center gap-2">
                                <Tag size={20} className="text-accent" />
                                <span>Thèmes & Mouvements associés</span>
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {results.categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-paper border border-soft-border hover:border-accent/40 text-charcoal transition-all text-sm font-serif hover:text-accent"
                                    >
                                        <span>{cat.name}</span>
                                        <span className="text-[10px] uppercase font-sans tracking-wider text-warm-gray">
                                            {cat.type === "THEME" ? "Thème" : cat.type === "MOVEMENT" ? "Mouvement" : "Époque"}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* 2. ONGLET POÈMES (grille complète) */}
            {activeTab === "poems" && (
                <div className="w-full">
                    {poemsCount === 0 ? (
                        <p className="text-warm-gray text-center py-12">
                            Aucun poème ne correspond à cette recherche.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.poems.map((poem, i) => (
                                <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 3. ONGLET AUTEURS (grille complète) */}
            {activeTab === "authors" && (
                <div className="w-full">
                    {authorsCount === 0 ? (
                        <p className="text-warm-gray text-center py-12">
                            Aucun auteur ne correspond à cette recherche.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.authors.map((author, index) => (
                                <Link
                                    key={author.id}
                                    href={`/author/${author.slug}`}
                                    className="flex flex-col items-center p-6 rounded-2xl bg-paper border border-soft-border hover:border-accent/40 hover:shadow-lg transition-all group text-center"
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
                                            <div className="w-full h-full bg-charcoal/10 flex items-center justify-center font-serif text-2xl text-charcoal">
                                                {getInitials(author.name)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-serif text-base sm:text-lg font-medium text-charcoal group-hover:text-accent transition-colors truncate w-full">
                                        {author.name}
                                    </span>
                                    <span className="text-xs text-warm-gray mt-1">
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

            {/* 4. ONGLET RECUEILS (grille complète) */}
            {activeTab === "collections" && (
                <div className="w-full">
                    {collectionsCount === 0 ? (
                        <p className="text-warm-gray text-center py-12">
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
