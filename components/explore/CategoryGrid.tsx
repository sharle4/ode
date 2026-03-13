"use client";

import React from "react";
import Link from "next/link";
import { getCategoryColor } from "@/utils/gradient";

interface Category {
    id: string;
    name: string;
    description?: string;
}

interface CategoryGridProps {
    categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-4 flex flex-col">
            <div className="mb-10 w-full">
                <h2 className="font-serif text-2xl text-charcoal mb-4 ml-2">Catégories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => {
                        const slug = cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
                        const href = `/category/${slug}`;
                        const color = getCategoryColor(cat.name);

                        return (
                            <Link
                                key={cat.id}
                                href={href}
                                className={`
                                    relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-square flex items-end p-4 shadow-sm hover:shadow-md transition-all duration-300 group
                                `}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110 ${color} opacity-90 group-hover:opacity-100`}></div>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>

                                <h3 className="relative z-10 text-white font-serif text-lg md:text-xl font-medium drop-shadow-md">
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
