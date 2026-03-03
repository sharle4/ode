"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Category {
    id: string; // The URL param value
    title: string; // Display name
    color: string; // Tailwind gradient classes
}

const THEMES: Category[] = [
    { id: "Amour", title: "Amour", color: "from-rose-500 to-pink-600" },
    { id: "Nature", title: "Nature", color: "from-emerald-500 to-teal-700" },
    { id: "Spleen", title: "Spleen", color: "from-slate-600 to-slate-900" },
    { id: "Mélancolie", title: "Mélancolie", color: "from-blue-400 to-indigo-600" },
    { id: "Temps", title: "Temps", color: "from-amber-600 to-orange-700" },
    { id: "Mort", title: "Mort", color: "from-zinc-700 to-black" },
];

const PERIODS: Category[] = [
    { id: "16e siècle", title: "XVIe siècle", color: "from-stone-500 to-stone-700" },
    { id: "17e siècle", title: "XVIIe siècle", color: "from-orange-400 to-amber-700" },
    { id: "19e siècle", title: "XIXe siècle", color: "from-yellow-700 to-amber-900" },
    { id: "20e siècle", title: "XXe siècle", color: "from-blue-600 to-indigo-900" },
];

const MOVEMENTS: Category[] = [
    { id: "Romantisme", title: "Romantisme", color: "from-red-600 to-rose-900" },
    { id: "Symbolisme", title: "Symbolisme", color: "from-purple-500 to-indigo-800" },
    { id: "Surréalisme", title: "Surréalisme", color: "from-cyan-500 to-blue-700" },
    { id: "Parnasse", title: "Parnasse", color: "from-emerald-600 to-cyan-900" },
    { id: "Classicisme", title: "Classicisme", color: "from-yellow-600 to-amber-800" },
];

function CategorySection({ title, paramKey, categories }: { title: string, paramKey: string, categories: Category[] }) {
    const searchParams = useSearchParams();

    return (
        <div className="mb-10 w-full">
            <h2 className="font-serif text-2xl text-charcoal mb-4 ml-2">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((cat) => {
                    const isActive = searchParams?.get(paramKey) === cat.id;

                    // Créer l'URL : si déjà actif on supprime le filtre, sinon on le définit
                    const params = new URLSearchParams(searchParams?.toString() || "");
                    if (isActive) {
                        params.delete(paramKey);
                    } else {
                        params.set(paramKey, cat.id);
                    }
                    const href = `/explore?${params.toString()}`;

                    return (
                        <Link
                            key={cat.id}
                            href={href}
                            scroll={false}
                            className={`
                                relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-square flex items-end p-4 shadow-sm hover:shadow-md transition-all duration-300 group
                                ${isActive ? 'ring-4 ring-accent ring-offset-2 ring-offset-cream' : ''}
                            `}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110 ${cat.color} opacity-90 group-hover:opacity-100`}></div>
                            {/* Optionnel: un petit bruit ou texture pourrait être ajouté ici */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>

                            <h3 className="relative z-10 text-white font-serif text-lg md:text-xl font-medium drop-shadow-md">
                                {cat.title}
                            </h3>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function CategoryGrid() {
    return (
        <div className="w-full mt-4 flex flex-col">
            <CategorySection title="Thèmes" paramKey="theme" categories={THEMES} />
            <CategorySection title="Mouvements poétiques" paramKey="movement" categories={MOVEMENTS} />
            <CategorySection title="Époques" paramKey="period" categories={PERIODS} />
        </div>
    );
}
