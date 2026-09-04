"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

interface ExploreSearchHeaderProps {
    initialQuery?: string;
}

const POPULAR_SUGGESTIONS = [
    "Charles Baudelaire",
    "Arthur Rimbaud",
    "Paul Verlaine",
    "Victor Hugo",
    "L’Albatros",
    "Amour",
    "Mélancolie",
    "Spleen",
];

export default function ExploreSearchHeader({ initialQuery = "" }: ExploreSearchHeaderProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const handleSearch = (searchTerm: string) => {
        const trimmed = searchTerm.trim();
        if (trimmed) {
            router.push(`/explore?q=${encodeURIComponent(trimmed)}`);
        } else {
            router.push("/explore");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleClear = () => {
        setQuery("");
        router.push("/explore");
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSubmit} className="relative w-full">
                <MagnifyingGlass
                    size={20}
                    weight="bold"
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-warm-gray dark:text-zinc-400 pointer-events-none"
                />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un poème, un auteur, une strophe, un recueil..."
                    className="w-full rounded-full bg-paper dark:bg-zinc-900 border-2 border-soft-border dark:border-zinc-800 py-3.5 pl-14 pr-24 text-base md:text-lg text-charcoal dark:text-white placeholder:text-warm-gray/60 dark:placeholder:text-zinc-500 outline-none transition-all duration-300 shadow-sm focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 text-warm-gray hover:text-charcoal dark:hover:text-white rounded-full transition-colors"
                            aria-label="Effacer la recherche"
                        >
                            <X size={16} weight="bold" />
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all shadow-sm active:scale-95"
                    >
                        Chercher
                    </button>
                </div>
            </form>

            {/* Suggestions rapides */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-serif text-warm-gray dark:text-zinc-400 mr-1">
                    Suggestions :
                </span>
                {POPULAR_SUGGESTIONS.map((suggestion) => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                            setQuery(suggestion);
                            handleSearch(suggestion);
                        }}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-paper/70 dark:bg-zinc-800/70 hover:bg-paper dark:hover:bg-zinc-800 border border-soft-border dark:border-zinc-700/60 text-charcoal/80 dark:text-zinc-300 transition-all hover:border-accent/30 hover:text-accent"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}
