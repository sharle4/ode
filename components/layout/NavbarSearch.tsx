"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
    Sparkle
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { getInitials } from "@/utils/gradient";
import type { SearchResults } from "@/types";

interface NavbarSearchProps {
    variant?: "desktop" | "mobile";
    onNavigate?: () => void;
}

type NavigableItem =
    | { type: "poem"; id: string; title: string; subtitle: string; href: string }
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

    // Synchroniser avec l'URL uniquement si l'utilisateur n'a pas le focus dans l'input
    useEffect(() => {
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
        }
    };

    // Construction de la liste aplatie pour la navigation au clavier
    const flatItems: NavigableItem[] = [];

    if (results) {
        (results.authors || []).slice(0, 3).forEach((a) => {
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

        (results.poems || []).slice(0, 4).forEach((p) => {
            const authorName = p.authors?.length
                ? p.authors.map((a: any) => a.name).join(", ")
                : "Auteur inconnu";
            flatItems.push({
                type: "poem",
                id: `poem-${p.id}`,
                title: p.title,
                subtitle: `${authorName}${p.publication_year ? ` · ${p.publication_year}` : ""}`,
                href: `/poem/${p.slug || p.id}`,
            });
        });

        (results.collections || []).slice(0, 2).forEach((c) => {
            const authorName = c.authors?.length
                ? c.authors.map((a: any) => a.name).join(", ")
                : "";
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
        router.push(href);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && e.key === "ArrowDown" && searchTerm.trim().length >= 1 && results) {
            setIsOpen(true);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (flatItems.length > 0) {
                setSelectedIndex((prev) => (prev + 1) % flatItems.length);
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (flatItems.length > 0) {
                setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
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
                            ? "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 py-3 pl-12 pr-12 focus:border-accent/50 focus:bg-zinc-900 focus:ring-4 focus:ring-accent/10 text-base"
                            : "bg-paper dark:bg-zinc-900 border-soft-border dark:border-zinc-800 py-2.5 pl-12 pr-14 text-sm md:text-base text-charcoal dark:text-white placeholder:text-warm-gray/60 dark:placeholder:text-zinc-500 focus:bg-paper dark:focus:bg-zinc-900 focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
                    }`}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isLoading && (
                        <Spinner
                            size={16}
                            weight="bold"
                            className="animate-spin text-accent"
                        />
                    )}

                    {searchTerm && !isLoading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={`p-1 rounded-full transition-colors ${
                                isMobile
                                    ? "text-zinc-400 hover:text-white"
                                    : "text-warm-gray hover:text-charcoal dark:hover:text-white"
                            }`}
                            aria-label="Effacer la recherche"
                        >
                            <X size={15} weight="bold" />
                        </button>
                    )}

                    {!isMobile && !searchTerm && !isLoading && (
                        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-sans font-medium text-warm-gray/70 bg-charcoal/5 dark:bg-white/5 rounded-md border border-soft-border/80 dark:border-zinc-800 select-none">
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
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute top-full mt-2 left-0 right-0 z-50 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
                            isMobile
                                ? "bg-zinc-950/98 border-zinc-800 text-white max-h-[70vh]"
                                : "bg-paper/95 dark:bg-zinc-900/95 border-soft-border dark:border-zinc-800 text-charcoal dark:text-zinc-100 max-h-[480px]"
                        } flex flex-col`}
                    >
                        <div className="overflow-y-auto divide-y divide-soft-border/50 dark:divide-zinc-800/60 p-2">
                            {/* Auteurs */}
                            {results?.authors && results.authors.length > 0 && (
                                <div className="py-2 first:pt-1">
                                    <div className="px-3 py-1.5 text-xs font-serif tracking-wider uppercase text-warm-gray dark:text-zinc-400 flex items-center gap-1.5">
                                        <User size={13} weight="bold" />
                                        <span>Auteurs</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {results.authors.slice(0, 3).map((author) => {
                                            const itemIndex = flatItems.findIndex(
                                                (fi) => fi.id === `author-${author.id}`
                                            );
                                            const isSelected = selectedIndex === itemIndex;
                                            return (
                                                <button
                                                    key={author.id}
                                                    type="button"
                                                    onClick={() => handleNavigate(`/author/${author.slug}`)}
                                                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                                                        isSelected
                                                            ? "bg-accent/10 text-accent dark:bg-accent/20 dark:text-white"
                                                            : "hover:bg-charcoal/5 dark:hover:bg-white/5"
                                                    }`}
                                                >
                                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-charcoal/10 dark:bg-white/10 flex items-center justify-center font-serif text-xs font-medium">
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
                                                        <span className="text-sm font-medium truncate">
                                                            {author.name}
                                                        </span>
                                                        <span className="text-xs text-warm-gray dark:text-zinc-400 truncate">
                                                            {author.date_of_birth && author.date_of_death
                                                                ? `${author.date_of_birth.slice(0, 4)} – ${author.date_of_death.slice(0, 4)}`
                                                                : author.nationality || "Auteur"}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Poèmes */}
                            {results?.poems && results.poems.length > 0 && (
                                <div className="py-2 first:pt-1">
                                    <div className="px-3 py-1.5 text-xs font-serif tracking-wider uppercase text-warm-gray dark:text-zinc-400 flex items-center gap-1.5">
                                        <Feather size={13} weight="bold" />
                                        <span>Poèmes</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {results.poems.slice(0, 4).map((poem) => {
                                            const itemIndex = flatItems.findIndex(
                                                (fi) => fi.id === `poem-${poem.id}`
                                            );
                                            const isSelected = selectedIndex === itemIndex;
                                            const authorName = poem.authors?.length
                                                ? poem.authors.map((a: any) => a.name).join(", ")
                                                : "Auteur inconnu";

                                            return (
                                                <button
                                                    key={poem.id}
                                                    type="button"
                                                    onClick={() => handleNavigate(`/poem/${poem.slug || poem.id}`)}
                                                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                                                        isSelected
                                                            ? "bg-accent/10 text-accent dark:bg-accent/20 dark:text-white"
                                                            : "hover:bg-charcoal/5 dark:hover:bg-white/5"
                                                    }`}
                                                >
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-sm font-serif font-medium truncate">
                                                            {poem.title}
                                                        </span>
                                                        <span className="text-xs text-warm-gray dark:text-zinc-400 truncate">
                                                            {authorName}
                                                        </span>
                                                    </div>
                                                    {poem.publication_year && (
                                                        <span className="text-xs text-warm-gray/70 dark:text-zinc-500 font-sans flex-shrink-0">
                                                            {poem.publication_year}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Recueils */}
                            {results?.collections && results.collections.length > 0 && (
                                <div className="py-2">
                                    <div className="px-3 py-1.5 text-xs font-serif tracking-wider uppercase text-warm-gray dark:text-zinc-400 flex items-center gap-1.5">
                                        <BookOpen size={13} weight="bold" />
                                        <span>Recueils</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {results.collections.slice(0, 2).map((col) => {
                                            const itemIndex = flatItems.findIndex(
                                                (fi) => fi.id === `col-${col.id}`
                                            );
                                            const isSelected = selectedIndex === itemIndex;
                                            const authorName = col.authors?.length
                                                ? col.authors.map((a: any) => a.name).join(", ")
                                                : "";

                                            return (
                                                <button
                                                    key={col.id}
                                                    type="button"
                                                    onClick={() => handleNavigate(`/collection/${col.slug}`)}
                                                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                                                        isSelected
                                                            ? "bg-accent/10 text-accent dark:bg-accent/20 dark:text-white"
                                                            : "hover:bg-charcoal/5 dark:hover:bg-white/5"
                                                    }`}
                                                >
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-sm font-medium truncate">
                                                            {col.title}
                                                        </span>
                                                        <span className="text-xs text-warm-gray dark:text-zinc-400 truncate">
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

                            {/* Aucun résultat */}
                            {isEmpty && (
                                <div className="py-8 px-4 text-center">
                                    <Sparkle size={24} weight="regular" className="mx-auto text-warm-gray/60 mb-2" />
                                    <p className="text-sm text-charcoal/80 dark:text-zinc-300 font-serif">
                                        Aucun résultat pour « {searchTerm.trim()} »
                                    </p>
                                    <p className="text-xs text-warm-gray dark:text-zinc-500 mt-1">
                                        Essayez un nom d&apos;auteur ou un vers emblématique.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pied de dropdown : Voir tous les résultats */}
                        {hasResults && (
                            <div className="p-2 border-t border-soft-border/60 dark:border-zinc-800 bg-paper/60 dark:bg-zinc-900/60">
                                {(() => {
                                    const allIndex = flatItems.findIndex((fi) => fi.type === "all");
                                    const isSelected = selectedIndex === allIndex;
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => handleNavigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`)}
                                            onMouseEnter={() => setSelectedIndex(allIndex)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                isSelected
                                                    ? "bg-accent text-white"
                                                    : "text-accent dark:text-accent-light hover:bg-accent/10"
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
