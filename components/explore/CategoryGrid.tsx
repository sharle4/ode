"use client";

import React from "react";
import Link from "next/link";
import { getCategoryColor } from "@/utils/gradient";
import { OrnamentIcon } from "@/components/ui/ornaments";

import { Category } from "@/types";

interface CategoryGridProps {
    categories: Category[];
    title?: string;
}

export default function CategoryGrid({ categories, title }: CategoryGridProps) {
    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-4 flex flex-col">
            <div className="mb-10 w-full">
                {title && <h2 className="font-serif text-2xl text-charcoal mb-4 ml-2">{title}</h2>}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => {
                        const slug = cat.slug || cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                        const href = `/category/${slug}`;
                        const fallbackGradient = getCategoryColor(cat.name);

                        return (
                            <Link
                                key={cat.id}
                                href={href}
                                className="relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-square flex flex-col items-center p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-out group hover:scale-105"
                                style={cat.color ? { backgroundColor: cat.color } : undefined}
                            >
                                {/* Background fallback gradient if no custom color */}
                                {!cat.color && (
                                    <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 group-hover:scale-110 ${fallbackGradient} opacity-90 group-hover:opacity-100 group-hover:saturate-150`}></div>
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>

                                {/* Ornament */}
                                <div className="flex-grow flex items-center justify-center w-full z-10 w-full mt-2">
                                    {cat.ornament_id && (
                                        <OrnamentIcon
                                            id={cat.ornament_id}
                                            aria-hidden="true"
                                            className="h-16 w-16 sm:h-20 sm:w-20 text-white/60 group-hover:text-white/80 transition-colors"
                                        />
                                    )}
                                </div>

                                <h3 className="relative z-10 w-full text-white font-serif text-lg md:text-xl font-medium drop-shadow-md text-center mt-auto pb-1">
                                    {cat.name}
                                </h3>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

