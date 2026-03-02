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
    { title: "Mécène", icon: <Sparkle size={18} weight="fill" className="text-accent" /> },
    { title: "Critique Averti", icon: <Star size={18} weight="fill" className="text-amber-500" /> },
    { title: "Pionnier", icon: <Medal size={18} weight="fill" className="text-zinc-400" /> }
];

const RATINGS = [
    { stars: 5, count: 42 },
    { stars: 4, count: 85 },
    { stars: 3, count: 56 },
    { stars: 2, count: 12 },
    { stars: 1, count: 3 }
];

export default function ProfileHome({ username, favoritePoems }: ProfileHomeProps) {
    const maxCount = Math.max(...RATINGS.map(r => r.count));

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

            {/* Colonne Principale Gauche (Top 3, Critiques) */}
            <div className="md:col-span-8 flex flex-col gap-12">

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

                {/* SECTION: Top Auteurs (Déplacé ici pour la proximité) */}
                <section>
                    <div className="flex items-center justify-between mb-4 border-b border-soft-border pb-2">
                        <h2 className="font-serif text-xl text-charcoal">Auteurs Favoris (Top 3)</h2>
                        <span className="text-xs text-warm-gray uppercase tracking-widest cursor-pointer hover:text-charcoal transition-colors">Modifier</span>
                    </div>
                    <p className="text-sm text-warm-gray italic mb-4">Ces auteurs ont été méticuleusement choisis par {username}.</p>
                    <ul className="flex flex-col gap-3">
                        {["Charles Baudelaire", "Arthur Rimbaud", "Victor Hugo"].map((author, i) => (
                            <li key={i} className="flex items-center justify-between group cursor-pointer p-4 bg-paper border border-soft-border rounded-xl hover:bg-white transition-colors">
                                <span className="text-charcoal font-serif text-lg group-hover:text-accent transition-colors flex items-center gap-3">
                                    <span className="text-warm-gray text-sm font-sans">{i + 1}.</span> {author}
                                </span>
                            </li>
                        ))}
                    </ul>
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
            <div className="md:col-span-4 flex flex-col gap-10">

                {/* SECTION: Graphique des Notes */}
                <section>
                    <h2 className="font-serif text-lg text-charcoal mb-6 border-b border-soft-border pb-2">Répartition des Notes</h2>
                    <div className="flex flex-col gap-2">
                        {RATINGS.map((rating) => {
                            const percentage = (rating.count / maxCount) * 100;
                            return (
                                <div key={rating.stars} className="flex items-center gap-3">
                                    <span className="w-4 text-xs text-warm-gray font-medium">{rating.stars}</span>
                                    <Star size={10} weight="fill" className="text-warm-gray" />
                                    <div className="flex-grow h-3 bg-soft-border rounded-sm overflow-hidden relative">
                                        <motion.div
                                            className="absolute top-0 left-0 bottom-0 bg-accent rounded-sm"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        />
                                    </div>
                                    <span className="w-6 text-xs text-warm-gray text-right">{rating.count}</span>
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
                    <div className="flex flex-wrap gap-2">
                        {BADGES.map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-paper border border-soft-border rounded-full text-xs font-medium text-charcoal">
                                {badge.icon}
                                {badge.title}
                            </div>
                        ))}
                    </div>
                </section>



            </div>
        </div>
    );
}
