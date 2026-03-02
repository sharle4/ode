"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";

interface PoemListItemProps {
    poem: {
        id: string;
        title: string;
        likes: number;
    };
    order: number;
}

export default function PoemListItem({ poem, order }: PoemListItemProps) {
    return (
        <Link href={`/poem/${poem.id}`} className="group relative flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            {/* Numérotation */}
            <div className="w-6 sm:w-8 text-right font-sans text-warm-gray text-sm font-medium opacity-60 group-hover:opacity-100 group-hover:text-accent transition-colors">
                {order}
            </div>

            {/* Titre */}
            <div className="flex-grow">
                <h3 className="font-serif text-charcoal text-base md:text-lg group-hover:text-accent transition-colors line-clamp-1">
                    {poem.title}
                </h3>
            </div>

            {/* Likes (Optionnel) */}
            <div className="flex items-center gap-1.5 text-xs text-warm-gray opacity-60 group-hover:opacity-100 transition-opacity">
                <span>{poem.likes || 0}</span>
                <Heart size={14} />
            </div>

            {/* Ligne de séparation (masquée sur le hover) */}
            <div className="absolute bottom-0 left-12 right-4 h-px bg-soft-border group-hover:opacity-0 transition-opacity"></div>
        </Link>
    );
}
