"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

export default function SearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialiser l'état local avec la valeur de l'URL pour la persistance
    const initialQuery = searchParams.get("q") || "";
    const [searchTerm, setSearchTerm] = useState(initialQuery);

    // Debounce la valeur de 300ms pour ne pas surcharger l'URL/Historique à chaque touche
    const [debouncedValue] = useDebounce(searchTerm, 300);

    // Mettre à jour l'URL lorsque la valeur debouncée change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedValue) {
            params.set("q", debouncedValue);
        } else {
            params.delete("q");
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [debouncedValue, pathname, router, searchParams]);

    // Synchronisation inverse: si l'utilisateur utilise le bouton "Précédent" du navigateur
    useEffect(() => {
        const urlQuery = searchParams.get("q") || "";
        if (urlQuery !== debouncedValue) {
            setSearchTerm(urlQuery);
        }
    }, [searchParams]);

    return (
        <div className="relative w-full max-w-3xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-warm-gray group-focus-within:text-accent transition-colors">
                <MagnifyingGlass size={24} weight="bold" />
            </div>

            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Chercher un poème, un auteur, un vers..."
                className="w-full bg-paper/80 backdrop-blur border-2 border-soft-border/50 text-charcoal font-serif text-lg md:text-xl rounded-2xl py-4 pl-14 pr-12 focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/10 transition-all shadow-sm placeholder:text-warm-gray/60"
            />

            {searchTerm && (
                <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-warm-gray hover:text-charcoal transition-colors focus:outline-none"
                    aria-label="Effacer la recherche"
                >
                    <X size={20} weight="bold" />
                </button>
            )}
        </div>
    );
}
