"use client";

import React, { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
    MagnifyingGlass,
    X,
    ArrowRight,
    Spinner,
    User,
    BookOpen,
    Feather,
    Sparkle,
    Tag
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { getInitials } from "@/utils/gradient";
import { formatAuthors } from "@/utils/author";
import type { SearchResults } from "@/types";

interface NavbarSearchProps {
    variant?: "desktop" | "mobile";
    onNavigate?: () => void;
}

type NavigableItem =
    | { type: "poem"; id: string; title: string; subtitle: string; href: string; snippet?: string | null; year?: number | null; matchType?: string }
    | { type: "author"; id: string; title: string; subtitle: string; href: string; image_url?: string }
    | { type: "collection"; id: string; title: string; subtitle: string; href: string }
    | { type: "category"; id: string; title: string; subtitle: string; href: string; color?: string }
    | { type: "all"; id: string; title: string; href: string };

export default function NavbarSearch({ variant = "desktop", onNavigate }: NavbarSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isMobile = variant === "mobile";
    const urlQuery = searchParams?.get("q") || "";

    const [searchTerm, setSearchTerm] = useState(urlQuery);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResults | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isFocused, setIsFocused] = useState(false);

    // Optimistic UI state during navigation transitions
    const [isNavigating, startTransition] = useTransition();
    const submittedQueryRef = useRef<string | null>(null);

    // Synchroniser avec l'URL uniquement si l'utilisateur n'a pas le focus dans l'input
    // et qu'aucune navigation optimiste n'est en cours
    useEffect(() => {
        if (submittedQueryRef.current !== null) {
            if (urlQuery.trim().toLowerCase() === submittedQueryRef.current.trim().toLowerCase()) {
                submittedQueryRef.current = null;
            } else {
                // Toujours en attente du rendu de la nouvelle route : conserver l'UI optimiste
                return;
            }
        }

        if (!isFocused && pathname === "/explore") {
            setSearchTerm(urlQuery);
        }
    }, [urlQuery, isFocused, pathname]);

    // Raccourci clavier global Cmd+K / Ctrl+K pour Desktop
    useEffect(() => {
        if (isMobile) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                if (searchTerm.trim().length >= 1 && results) {
                    setIsOpen(true);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobile, searchTerm, results]);

    // Fermeture lors d'un clic en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Requête de recherche debouncée
    const fetchResults = useDebouncedCallback(async (query: string) => {
        const trimmed = query.trim();
        if (trimmed.length < 1) {
            setResults(null);
            setIsLoading(false);
            setIsOpen(false);
            setSelectedIndex(-1);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
            if (res.ok) {
                const data: SearchResults = await res.json();
                setResults(data);
                setIsOpen(true);
                setSelectedIndex(-1);
            }
        } catch (error) {
            console.error("Search fetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, 250);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.trim().length >= 1) {
            setIsLoading(true);
            fetchResults(val);
        } else {
            setResults(null);
            setIsOpen(false);
            setIsLoading(false);
            setSelectedIndex(-1);
        }
    };

    // Determine whether Authors should precede Poems or vice-versa
    const topPoem = results?.poems?.[0];
    const isMultiWord = searchTerm.trim().split(/\s+/).length > 1;
    const hasPoemSpecificIntent = Boolean(topPoem && (
        topPoem.matchType === 'author_title' ||
        topPoem.matchType === 'verse' ||
        topPoem.matchType === 'cross_author' ||
        isMultiWord
    ));
    const showAuthorsFirst = !hasPoemSpecificIntent && (results?.authors?.length || 0) > 0;

    // Construction de la liste aplatie pour la navigation au clavier
    const flatItems: NavigableItem[] = [];

    const pushAuthors = () => {
        (results?.authors || []).slice(0, 3).forEach((a) => {
            flatItems.push({
                type: "author",
                id: `author-${a.id}`,
                title: a.name,
                subtitle: a.date_of_birth && a.date_of_death
                    ? `${a.date_of_birth.slice(0, 4)} – ${a.date_of_death.slice(0, 4)}`
                    : a.nationality || "Auteur",
                href: `/author/${a.slug}`,
                image_url: a.image_url,
            });
        });
    };

    const pushPoems = () => {
        (results?.poems || []).slice(0, 5).forEach((p) => {
            const authorInfo = formatAuthors(p.authors);
            const authorName = authorInfo.count > 0 ? authorInfo.displayText : "Auteur inconnu";
            flatItems.push({
                type: "poem",
                id: `poem-${p.id}`,
                title: p.title,
                subtitle: `${authorName}${p.publication_year ? ` · ${p.publication_year}` : ""}`,
                href: `/poem/${p.slug || p.id}`,
                snippet: p.snippet,
                year: p.publication_year,
                matchType: p.matchType,
            });
        });
    };

    if (results) {
        if (showAuthorsFirst) {
            pushAuthors();
            pushPoems();
        } else {
            pushPoems();
            pushAuthors();
        }

        (results.collections || []).slice(0, 2).forEach((c) => {
            const authorInfo = formatAuthors(c.authors);
            const authorName = authorInfo.count > 0 ? authorInfo.displayText : "";
            flatItems.push({
                type: "collection",
                id: `col-${c.id}`,
                title: c.title,
                subtitle: `${authorName ? `${authorName} · ` : ""}${c.poems_count || 0} poèmes`,
                href: `/collection/${c.slug}`,
            });
        });

        (results.categories || []).slice(0, 2).forEach((cat) => {
            flatItems.push({
                type: "category",
                id: `cat-${cat.id}`,
                title: cat.name,
                subtitle: cat.type === "THEME" ? "Thème" : cat.type === "MOVEMENT" ? "Mouvement" : "Époque",
                href: `/category/${cat.slug}`,
                color: cat.color,
            });
        });

        // Touche d'accès à tous les résultats
        if (searchTerm.trim()) {
            flatItems.push({
                type: "all",
                id: "all-results",
                title: `Voir tous les résultats pour « ${searchTerm.trim()} »`,
                href: `/explore?q=${encodeURIComponent(searchTerm.trim())}`,
            });
        }
    }

    const handleNavigate = (href: string) => {
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        if (onNavigate) onNavigate();

        if (href.startsWith("/explore")) {
            try {
                const url = new URL(href, "http://localhost");
                const q = url.searchParams.get("q") || "";
                submittedQueryRef.current = q;
                setSearchTerm(q);
            } catch {
                submittedQueryRef.current = searchTerm.trim();
            }
        } else {
            submittedQueryRef.current = null;
            setSearchTerm("");
            setResults(null);
        }

        startTransition(() => {
            router.push(href);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && e.key === "ArrowDown" && searchTerm.trim().length >= 1 && results) {
            setIsOpen(true);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (flatItems.length > 0) {
                setSelectedIndex((prev) => (prev < 0 ? 0 : (prev + 1) % flatItems.length));
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (flatItems.length > 0) {
                setSelectedIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
                handleNavigate(flatItems[selectedIndex].href);
            } else if (searchTerm.trim()) {
                handleNavigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setSelectedIndex(-1);
            inputRef.current?.blur();
        }
    };

    const handleClear = () => {
        setSearchTerm("");
        setResults(null);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
            handleNavigate(flatItems[selectedIndex].href);
        } else if (searchTerm.trim()) {
            handleNavigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const hasResults = results && results.total > 0;
    const isEmpty = results && results.total === 0 && !isLoading;

    const renderAuthorsSection = () => {
        if (!results?.authors || results.authors.length === 0) return null;
        return (
            <div key="section-authors" className="py-2 first:pt-1">
                <div className="px-3 py-1.5 text-xs font-serif tracking-wider uppercase text-warm-gray flex items-center gap-1.5">
                    <User size={13} weight="bold" />
                    <span>Auteurs</span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                    {results.authors.slice(0, 3).map((author) => {
                        const itemIndex = flatItems.findIndex((fi) => fi.id === `author-${author.id}`);
                        const isSelected = selectedIndex === itemIndex;
                        return (
                            <button
                                key={author.id}
                                type="button"
                                onClick={() => handleNavigate(`/author/${author.slug}`)}
                                onMouseMove={() => setSelectedIndex(itemIndex)}
                                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                    isSelected ? "bg-accent/10" : "hover:bg-charcoal/5"
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-charcoal/10 flex items-center justify-center font-serif text-xs font-medium text-charcoal">
                                        {author.image_url ? (
                                            <Image
                                                src={author.image_url}
                                                alt={author.name}
                                                width={36}
                                                height={36}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{getInitials(author.name)}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className={`text-sm font-medium truncate ${isSelected ? "text-accent font-semibold" : "text-charcoal"}`}>
                                            {author.name}
                                        </span>
                                        <span className="text-xs text-warm-gray truncate">
                                            {author.date_of_birth && author.date_of_death
                                                ? `${author.date_of_birth.slice(0, 4)} – ${author.date_of_death.slice(0, 4)}`
                                                : author.nationality || "Auteur"}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && (
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-medium text-accent bg-accent/15 flex-shrink-0">
                                        Entrée ↵
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPoemsSection = () => {
        if (!results?.poems || results.poems.length === 0) return null;
        return (
            <div key="section-poems" className="py-2 first:pt-1">
                <div className="px-3 py-1.5 text-xs font-serif tracking-wider uppercase text-warm-gray flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Feather size={13} weight="bold" />
                        <span>Poèmes</span>
                    </div>
                    {results.poems[0]?.matchType === 'author_title' && (
                        <span className="text-[10px] text-accent font-sans font-medium tracking-normal">
                            Accord titre & auteur
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                    {results.poems.slice(0, 5).map((poem) => {
                        const itemIndex = flatItems.findIndex((fi) => fi.id === `poem-${poem.id}`);
                        const isSelected = selectedIndex === itemIndex;
                        const authorName = poem.authors?.length
                            ? poem.authors.map((a: any) => a.name).join(", ")
                            : "Auteur inconnu";

                        return (
                            <button
                                key={poem.id}
                                type="button"
                                onClick={() => handleNavigate(`/poem/${poem.slug || poem.id}`)}
                                onMouseMove={() => setSelectedIndex(itemIndex)}
                                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                    isSelected ? "bg-accent/10" : "hover:bg-charcoal/5"
                                }`}
                            >
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-serif font-medium truncate ${isSelected ? "text-accent font-semibold" : "text-charcoal"}`}>
                                            {poem.title}
                                        </span>
                                        {poem.matchType === 'verse' && (
                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-sans font-medium bg-accent/15 text-accent">
                                                Vers
                                            </span>
                                        )}
                                        {poem.matchType === 'author_title' && (
                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-sans font-medium bg-charcoal/10 text-charcoal/80">
                                                Titre & Auteur
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-warm-gray truncate">
                                        <span className="truncate">{authorName}</span>
                                        {poem.publication_year && (
                                            <>
                                                <span>·</span>
                                                <span className="font-sans font-medium text-charcoal/70">{poem.publication_year}</span>
                                            </>
                                        )}
                                        {poem.collections?.title && (
                                            <>
                                                <span>·</span>
                                                <span className="italic truncate">{poem.collections.title}</span>
                                            </>
                                        )}
                                    </div>
                                    {poem.snippet && (
                                        <span className="text-xs italic text-accent font-serif truncate mt-0.5">
                                            « {poem.snippet} »
                                        </span>
                                    )}
                                </div>

                                {isSelected && (
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-medium text-accent bg-accent/15 flex-shrink-0">
                                        Entrée ↵
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <form onSubmit={handleSubmit} className="relative w-full">
                <MagnifyingGlass
                    size={18}
                    weight="bold"
                    className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                        isFocused ? "text-accent" : isMobile ? "text-zinc-500" : "text-warm-gray"
                    }`}
                />

                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-label="Rechercher sur ode"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsFocused(true);
                        if (searchTerm.trim().length >= 1 && results) {
                            setIsOpen(true);
                        }
                    }}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isMobile
                            ? "Rechercher un poème, auteur..."
                            : "Rechercher un poème, un auteur, une émotion..."
                    }
                    className={`w-full rounded-full outline-none transition-all duration-300 shadow-sm border-2 ${
                        isMobile
                            ? "bg-paper border-soft-border text-charcoal placeholder:text-warm-gray/60 py-3 pl-12 pr-12 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 text-base"
                            : "bg-paper border-soft-border py-2.5 pl-12 pr-14 text-sm md:text-base text-charcoal placeholder:text-warm-gray/60 focus:bg-paper focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
                    }`}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {(isLoading || isNavigating) && (
                        <Spinner
                            size={16}
                            weight="bold"
                            className="animate-spin text-accent"
                        />
                    )}

                    {searchTerm && !isLoading && !isNavigating && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-full transition-colors text-warm-gray hover:text-charcoal"
                            aria-label="Effacer la recherche"
                        >
                            <X size={15} weight="bold" />
                        </button>
                    )}

                    {!isMobile && !searchTerm && !isLoading && !isNavigating && (
                        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-sans font-medium text-warm-gray/70 bg-charcoal/5 rounded-md border border-soft-border select-none">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    )}
                </div>
            </form>

            {/* Dropdown Palette de Recherche Instantanée */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="navbar-search-results"
                        role="listbox"
                        onMouseLeave={() => setSelectedIndex(-1)}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute top-full mt-2 left-0 right-0 z-50 overflow-hidden rounded-2xl border border-soft-border shadow-2xl backdrop-blur-xl bg-paper/98 text-charcoal flex flex-col ${
                            isMobile ? "max-h-[70vh]" : "max-h-[480px]"
                        }`}
                    >
                        <div className="overflow-y-auto divide-y divide-soft-border/50 p-2">
                            {showAuthorsFirst ? (
                                <>
                                    {renderAuthorsSection()}
                                    {renderPoemsSection()}
                                </>
                            ) : (
                                <>
                                    {renderPoemsSection()}
                                    {renderAuthorsSection()}
                                </>
                            )}

                            {/* Recueils */}
                            {results?.collections && results.collections.length > 0 && (
                                <div className="py-2">
                                    <div className="px-3 py-1.5 text-xs font-serif tracking-wider uppercase text-warm-gray flex items-center gap-1.5">
                                        <BookOpen size={13} weight="bold" />
                                        <span>Recueils</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {results.collections.slice(0, 2).map((col) => {
                                            const itemIndex = flatItems.findIndex(
                                                (fi) => fi.id === `col-${col.id}`
                                            );
                                            const isSelected = selectedIndex === itemIndex;
                                            const authorInfo = formatAuthors(col.authors);
                                            const authorName = authorInfo.count > 0 ? authorInfo.displayText : "";

                                            return (
                                                <button
                                                    key={col.id}
                                                    type="button"
                                                    onClick={() => handleNavigate(`/collection/${col.slug}`)}
                                                    onMouseMove={() => setSelectedIndex(itemIndex)}
                                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                                        isSelected ? "bg-accent/10" : "hover:bg-charcoal/5"
                                                    }`}
                                                >
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className={`text-sm font-medium truncate ${isSelected ? "text-accent font-semibold" : "text-charcoal"}`}>
                                                            {col.title}
                                                        </span>
                                                        <span className="text-xs text-warm-gray truncate">
                                                            {authorName ? `${authorName} · ` : ""}
                                                            {col.poems_count || 0} poèmes
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Thèmes & Mouvements */}
                            {results?.categories && results.categories.length > 0 && (
                                <div className="py-2">
                                    <div className="px-3 py-1.5 text-xs font-serif tracking-wider uppercase text-warm-gray flex items-center gap-1.5">
                                        <Tag size={13} weight="bold" />
                                        <span>Thèmes & Mouvements</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {results.categories.slice(0, 2).map((cat) => {
                                            const itemIndex = flatItems.findIndex(
                                                (fi) => fi.id === `cat-${cat.id}`
                                            );
                                            const isSelected = selectedIndex === itemIndex;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => handleNavigate(`/category/${cat.slug}`)}
                                                    onMouseMove={() => setSelectedIndex(itemIndex)}
                                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                                        isSelected ? "bg-accent/10" : "hover:bg-charcoal/5"
                                                    }`}
                                                >
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className={`text-sm font-medium truncate ${isSelected ? "text-accent font-semibold" : "text-charcoal"}`}>
                                                            {cat.name}
                                                        </span>
                                                        <span className="text-xs text-warm-gray truncate">
                                                            {cat.type === "THEME" ? "Thème" : cat.type === "MOVEMENT" ? "Mouvement" : "Époque"}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Aucun résultat */}
                            {isEmpty && (
                                <div className="py-8 px-4 text-center">
                                    <Sparkle size={24} weight="regular" className="mx-auto text-warm-gray mb-2" />
                                    <p className="text-sm text-charcoal font-serif">
                                        Aucun résultat pour « {searchTerm.trim()} »
                                    </p>
                                    <p className="text-xs text-warm-gray mt-1">
                                        Essayez un nom d&apos;auteur ou un vers emblématique.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pied de dropdown : Voir tous les résultats */}
                        {hasResults && (
                            <div className="p-2 border-t border-soft-border/60 bg-paper/60">
                                {(() => {
                                    const allIndex = flatItems.findIndex((fi) => fi.type === "all");
                                    const isSelected = selectedIndex === allIndex;
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => handleNavigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`)}
                                            onMouseMove={() => setSelectedIndex(allIndex)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                isSelected
                                                    ? "bg-accent text-white"
                                                    : "text-accent hover:bg-accent/10"
                                            }`}
                                        >
                                            <span className="truncate">
                                                Voir tous les résultats pour « {searchTerm.trim()} »
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className="text-xs opacity-70">
                                                    {results.total} résultat{results.total > 1 ? "s" : ""}
                                                </span>
                                                <ArrowRight size={15} weight="bold" />
                                            </div>
                                        </button>
                                    );
                                })()}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
