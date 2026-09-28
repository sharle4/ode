"use client";

import React from "react";
import { RothkoArtwork } from "@/components/poem/RothkoArtwork";
import { ListBullets } from "@phosphor-icons/react";

interface ListCoverProps {
    coverUrl?: string | null;
    previewPoems?: Array<{
        id: string;
        title: string;
        slug: string;
        rothko_params?: any;
    }>;
    size?: "sm" | "md" | "lg" | "hero";
    className?: string;
}

export function ListCover({
    coverUrl,
    previewPoems = [],
    size = "md",
    className = "",
}: ListCoverProps) {
    const sizeClasses = {
        sm: "w-12 h-12 rounded-lg text-xs",
        md: "w-24 h-24 md:w-28 md:h-28 rounded-xl text-sm",
        lg: "w-36 h-36 md:w-44 md:h-44 rounded-2xl text-base",
        hero: "w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl text-lg",
    }[size];

    if (coverUrl) {
        return (
            <div className={`relative overflow-hidden bg-soft-border/30 shadow-sm flex-shrink-0 ${sizeClasses} ${className}`}>
                <img
                    src={coverUrl}
                    alt="Couverture de la liste"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const poemsWithRothko = previewPoems.filter((p) => p && p.rothko_params);

    // Case 1: 4 or more poems -> 2x2 Rothko mosaic
    if (poemsWithRothko.length >= 4) {
        return (
            <div className={`relative overflow-hidden grid grid-cols-2 grid-rows-2 bg-charcoal/5 shadow-sm border border-soft-border/50 flex-shrink-0 ${sizeClasses} ${className}`}>
                {poemsWithRothko.slice(0, 4).map((p, i) => (
                    <div key={p.id || i} className="relative w-full h-full overflow-hidden border-[0.5px] border-cream/20">
                        <RothkoArtwork params={p.rothko_params} className="w-full h-full" />
                    </div>
                ))}
            </div>
        );
    }

    // Case 2: 1 to 3 poems -> Heroic primary Rothko artwork
    if (poemsWithRothko.length > 0) {
        return (
            <div className={`relative overflow-hidden shadow-sm border border-soft-border/50 flex-shrink-0 ${sizeClasses} ${className}`}>
                <RothkoArtwork params={poemsWithRothko[0].rothko_params} className="w-full h-full object-cover" />
                {poemsWithRothko.length > 1 && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-charcoal/60 backdrop-blur-xs text-[10px] text-white font-mono">
                        +{previewPoems.length}
                    </div>
                )}
            </div>
        );
    }

    // Case 3: Empty list placeholder (noble antique paper gradient)
    return (
        <div
            className={`relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-paper to-cream border border-soft-border text-warm-gray shadow-xs flex-shrink-0 ${sizeClasses} ${className}`}
        >
            <ListBullets size={size === "sm" ? 20 : size === "md" ? 32 : 44} weight="light" className="text-warm-gray/60" />
        </div>
    );
}

export default ListCover;
