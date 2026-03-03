"use client";

import React, { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterCategory {
    id: string;
    label: string;
    options: string[];
}

const FILTERS: FilterCategory[] = [
    {
        id: "theme",
        label: "Thèmes",
        options: ["Amour", "Mélancolie", "Nature", "Spleen", "Mort", "Temps", "Voyage"]
    },
    {
        id: "period",
        label: "Époques",
        options: ["19e siècle", "16e siècle", "20e siècle", "Romantisme", "Symbolisme", "Surréalisme"]
    }
];

export default function FilterPills() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Réf pour le scroll horizontal
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleFilterToggle = (category: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentValue = params.get(category);

        if (currentValue === value) {
            // Si déjà actif, on le retire (Toggle Off)
            params.delete(category);
        } else {
            // Sinon on l'applique
            params.set(category, value);
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="w-full relative mt-6 mb-8 overflow-hidden">
            {/* Dégradés sur les bords pour indiquer le scroll (masqués en CSS si au bout) */}
            <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none"></div>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide snap-x px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {FILTERS.map((filterGroup) => (
                    <div key={filterGroup.id} className="flex gap-2 items-center flex-shrink-0 snap-start">
                        <span className="text-xs uppercase tracking-widest text-warm-gray mr-2 font-medium">
                            {filterGroup.label}
                        </span>
                        {filterGroup.options.map((option) => {
                            const isActive = searchParams.get(filterGroup.id) === option;

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleFilterToggle(filterGroup.id, option)}
                                    className={`
                                        px-4 py-1.5 rounded-full text-sm font-sans whitespace-nowrap transition-all border
                                        ${isActive
                                            ? 'bg-charcoal text-white border-charcoal shadow-md'
                                            : 'bg-white text-charcoal border-soft-border hover:border-accent/40 hover:bg-black/5'}
                                    `}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
