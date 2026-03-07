"use client";

import React from "react";
import { motion } from "framer-motion";
import { Medal, Star, Sparkle, ChatCircle } from "@phosphor-icons/react";
import PoemCard from "@/components/ui/PoemCard";

interface ProfileHomeProps {
    username: string;
    favoritePoems: any[]; // Temp mock
}

const BADGES = [
    { title: "Mécène", desc: "A soutenu l'auteur", icon: <Sparkle size={18} weight="fill" className="text-accent" /> },
    { title: "Critique Averti", desc: "Top 1% des critiques", icon: <Star size={18} weight="fill" className="text-amber-500" /> },
    { title: "Pionnier", desc: "Membre depuis la bêta", icon: <Medal size={18} weight="fill" className="text-zinc-400" /> }
];

const REVIEWS = [
    { stars: 5, count: 42 },
    { stars: 4, count: 85 },
    { stars: 3, count: 56 },
    { stars: 2, count: 12 },
    { stars: 1, count: 3 }
];

export default function ProfileHome({ username, favoritePoems }: ProfileHomeProps) {
    const maxCount = Math.max(...REVIEWS.map(r => r.count));

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16     ">

            {/* Colonne Principale Gauche (Top 3, Critiques) */}
            <div className="md:col-span-8 flex flex-col gap-16">

                {/* SECTION: Top 3 Poèmes */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-soft-border pb-2">
                        <h2 className="font-serif text-xl text-charcoal">Poèmes Favoris (Top 3)</h2>
                    </div>
                    {favoritePoems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {favoritePoems.slice(0, 3).map((poem, i) => (
                                <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                            ))}
                        </div>
                    ) : (
                        <p className="text-warm-gray italic font-serif">Aucun poème défini en favori.</p>
                    )}
                </section>



                {/* SECTION: Critiques Récentes (Mock) */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-soft-border pb-2">
                        <h2 className="font-serif text-xl text-charcoal">Critiques Récentes</h2>
                        <span className="text-xs text-warm-gray uppercase tracking-widest cursor-pointer hover:text-charcoal transition-colors">Tout voir</span>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Mock Review 1 */}
                        <article className="p-6 bg-paper border border-soft-border rounded-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-serif text-lg text-charcoal mb-1">El Desdichado</h3>
                                    <p className="text-xs uppercase tracking-widest text-warm-gray">Gérard de Nerval</p>
                                </div>
                                <div className="flex text-amber-500">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} weight="fill" />)}
                                </div>
                            </div>
                            <p className="text-charcoal/80 leading-relaxed font-serif text-sm">
                                "Le prince d'Aquitaine à la tour abolie...". Une musique inégalable. Nerval touche ici à la perfection du sonnet, chaque vers est un joyau mélancolique.
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-xs text-warm-gray">
                                <span>Il y a 2 jours</span>
                                <div className="flex items-center gap-1 hover:text-accent cursor-pointer transition-colors">
                                    <ChatCircle size={14} /> 2
                                </div>
                            </div>
                        </article>

                        {/* Mock Review 2 */}
                        <article className="p-6 bg-paper border border-soft-border rounded-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-serif text-lg text-charcoal mb-1">L'Albatros</h3>
                                    <p className="text-xs uppercase tracking-widest text-warm-gray">Charles Baudelaire</p>
                                </div>
                                <div className="flex text-amber-500">
                                    {[1, 2, 3, 4].map(s => <Star key={s} size={14} weight="fill" />)}
                                </div>
                            </div>
                            <p className="text-charcoal/80 leading-relaxed font-serif text-sm">
                                Un classique incontournable, même si j'ai une préférence pour "Spleen". L'allégorie est toujours aussi puissante.
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-xs text-warm-gray">
                                <span>Il y a 1 semaine</span>
                                <div className="flex items-center gap-1 hover:text-accent cursor-pointer transition-colors">
                                    <ChatCircle size={14} /> 0
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            </div>

            {/* Colonne Sidebar Droite (Graphes, Badges, Top Auteurs) */}
            <div className="md:col-span-4 flex flex-col gap-14">

                {/* SECTION: Top Auteurs Sidebar */}
                <section>
                    <h2 className="font-serif text-lg text-charcoal mb-4 border-b border-soft-border pb-2">Auteurs Favoris</h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                        {[
                            { name: "Charles Baudelaire", url: "https://upload.wikimedia.org/wikipedia/commons/1/16/Charles_Baudelaire%2C_by_Etienne_Carjat.jpg" },
                            { name: "Arthur Rimbaud", url: "https://upload.wikimedia.org/wikipedia/commons/1/19/Arthur_Rimbaud.jpg" },
                            { name: "Victor Hugo", url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Victor_Hugo_by_Étienne_Carjat_1876_-_full.jpg" }
                        ].map((author, i) => (
                            <div key={i} className="flex flex-col items-center group cursor-pointer">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-accent transition-colors shadow-sm mb-2">
                                    <img src={author.url} alt={author.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300" />
                                    <div className="absolute bottom-0 right-0 bg-accent text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                                        {i + 1}
                                    </div>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider text-warm-gray group-hover:text-charcoal transition-colors text-center w-20 leading-tight">
                                    {author.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION: Graphique des Notes */}
                <section>
                    <h2 className="font-serif text-lg text-charcoal mb-6 border-b border-soft-border pb-2">Répartition des Notes</h2>
                    <div className="flex flex-col gap-2">
                        {REVIEWS.map((review) => {
                            const percencategorye = (review.count / maxCount) * 100;
                            return (
                                <div key={review.stars} className="flex items-center gap-3">
                                    <span className="w-4 text-xs text-warm-gray font-medium">{review.stars}</span>
                                    <Star size={10} weight="fill" className="text-warm-gray" />
                                    <div className="flex-grow h-3 bg-soft-border rounded-sm overflow-hidden relative">
                                        <motion.div
                                            className="absolute top-0 left-0 bottom-0 bg-accent rounded-sm"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percencategorye}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        />
                                    </div>
                                    <span className="w-6 text-xs text-warm-gray text-right">{review.count}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-center text-xs text-warm-gray uppercase tracking-widest">
                        198 Poèmes Notés
                    </div>
                </section>

                {/* SECTION: Badges */}
                <section>
                    <h2 className="font-serif text-lg text-charcoal mb-4 border-b border-soft-border pb-2">Badges</h2>
                    <div className="flex flex-wrap gap-3">
                        {BADGES.map((badge, i) => (
                            <div key={i} className="relative group flex items-center gap-2 px-3 py-1.5 bg-paper border border-soft-border hover:border-accent/40 rounded-full text-xs font-medium text-charcoal cursor-default transition-colors">
                                {badge.icon}
                                {badge.title}
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-charcoal text-cream text-[10px] uppercase tracking-widest rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 flex flex-col items-center">
                                    {badge.desc}
                                    <div className="absolute -bottom-[4px] w-2 h-2 bg-charcoal rotate-45" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
