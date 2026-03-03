"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

interface NavbarSearchProps {
    variant?: 'desktop' | 'mobile';
}

export default function NavbarSearch({ variant = 'desktop' }: NavbarSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [searchFocused, setSearchFocused] = useState(false);
    const isMobile = variant === 'mobile';

    // Initialisation avec la valeur de l'URL pour la persistance
    const initialQuery = searchParams?.get("q") || "";
    const [searchTerm, setSearchTerm] = useState(initialQuery);

    const [debouncedValue] = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (!searchParams) return;
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedValue) {
            params.set("q", debouncedValue);
            if (pathname !== "/explore") {
                router.push(`/explore?${params.toString()}`);
            } else {
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
        } else {
            params.delete("q");
            if (pathname === "/explore") {
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
        }
    }, [debouncedValue, pathname, router]);

    // Synchronisation depuis l'URL (Bouton précédent)
    useEffect(() => {
        if (!searchParams) return;
        const urlQuery = searchParams.get("q") || "";
        if (urlQuery !== searchTerm && urlQuery !== debouncedValue) {
            setSearchTerm(urlQuery);
        }
    }, [searchParams]);

    return (
        <div
            className={`relative w-full transition-all duration-300 ${searchFocused && !isMobile ? "scale-[1.02]" : "scale-100"}`}
        >
            <MagnifyingGlass
                size={18}
                weight="bold"
                className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${searchFocused ? "text-accent" : (isMobile ? "text-white/80" : "text-charcoal/80 dark:text-white/80")}`}
            />

            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isMobile ? "Rechercher des poèmes..." : "Rechercher un poème, un auteur, une émotion..."}
                className={`w-full rounded-full outline-none transition-all duration-300 shadow-sm border-2 
                    ${isMobile
                        ? "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 py-3 pl-12 pr-10 focus:border-accent/50 focus:bg-zinc-900 focus:ring-4 focus:ring-accent/10"
                        : "bg-paper/80 backdrop-blur border-soft-border/50 py-2.5 pl-12 pr-10 text-sm md:text-base text-charcoal placeholder:text-warm-gray/60 focus:bg-paper focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
                    }`}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
            />

            {searchTerm && (
                <button
                    onClick={() => setSearchTerm("")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center transition-colors focus:outline-none 
                        ${isMobile ? "text-zinc-500 hover:text-white" : "text-warm-gray hover:text-charcoal"}
                    `}
                    aria-label="Effacer la recherche"
                >
                    <X size={16} weight="bold" />
                </button>
            )}
        </div>
    );
}
