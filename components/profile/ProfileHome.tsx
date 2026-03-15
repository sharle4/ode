"use client";

import React from "react";
import { motion } from "framer-motion";
import { Medal, Star, Sparkle, ChatCircle } from "@phosphor-icons/react";
import PoemCard from "@/components/ui/PoemCard";
import Link from "next/link";
import Image from "next/image";
import { getInitials, formatRelativeTime } from "@/utils/gradient";
import EditProfileCTA from "./EditProfileCTA";

interface ProfileHomeProps {
    username: string;
    favoritePoems: any[];
    topAuthors?: any[];
    recentReviews?: any[];
    badges?: any[];
    reviewDistribution?: { stars: number; count: number }[];
}

// Fallback icons for badges when no DB-sourced icon is available
const BADGE_ICONS: Record<string, React.ReactNode> = {
    default: <Sparkle size={18} weight="fill" className="text-accent" />,
    critique: <Star size={18} weight="fill" className="text-amber-500" />,
    pionnier: <Medal size={18} weight="fill" className="text-zinc-400" />,
};

function getBadgeIcon(badgeName: string): React.ReactNode {
    const normalized = badgeName.toLowerCase();
    if (normalized.includes('critique') || normalized.includes('review')) return BADGE_ICONS.critique;
    if (normalized.includes('pionnier') || normalized.includes('pioneer') || normalized.includes('beta')) return BADGE_ICONS.pionnier;
    return BADGE_ICONS.default;
}

export default function ProfileHome({
    username,
    favoritePoems,
    topAuthors = [],
    recentReviews = [],
    badges = [],
    reviewDistribution = [],
}: ProfileHomeProps) {
    const maxCount = Math.max(...(reviewDistribution.length > 0 ? reviewDistribution.map(r => r.count) : [1]));
    const totalRated = reviewDistribution.reduce((sum, r) => sum + r.count, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">

            {/* Colonne Principale Gauche */}
            <div className="md:col-span-8 flex flex-col gap-16">

                {/* SECTION: Top 3 Poèmes */}
                <section>
                    <div className="flex items-center justify-between mb-6 border-b border-soft-border pb-2">
                        <h2 className="font-serif text-xl text-charcoal">Poèmes Favoris (Top 3)</h2>
                    </div>
                    {favoritePoems && favoritePoems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {favoritePoems.slice(0, 3).map((poem, i) => (
                                <PoemCard key={poem.id} poem={poem} index={i} layout="grid" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-paper border border-soft-border border-dashed rounded-xl">
                            <p className="text-warm-gray italic font-serif">Cet utilisateur n'a pas encore défini de poèmes favoris.</p>
                            <EditProfileCTA profileUsername={username} />
                        </div>
                    )}
                </section>

                {/* SECTION: Critiques Récentes */}
                {recentReviews.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6 border-b border-soft-border pb-2">
                            <h2 className="font-serif text-xl text-charcoal">Critiques Récentes</h2>
                            <span className="text-xs text-warm-gray uppercase tracking-widest cursor-pointer hover:text-charcoal transition-colors">Tout voir</span>
                        </div>

                        <div className="flex flex-col gap-6">
                            {recentReviews.map((review: any) => {
                                const poemTitle = review.poems?.title || 'Poème';
                                const poemSlug = review.poems?.slug || review.poems?.id;
                                const authorName = review.poems?.authors?.map((a: any) => a.name).join(', ') || '';
                                const filledStars = Math.round(review.score || 0);

                                return (
                                    <article key={review.id} className="p-6 bg-paper border border-soft-border rounded-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Link href={`/poem/${poemSlug}`}>
                                                    <h3 className="font-serif text-lg text-charcoal mb-1 hover:text-accent transition-colors">{poemTitle}</h3>
                                                </Link>
                                                {authorName && (
                                                    <p className="text-xs uppercase tracking-widest text-warm-gray">{authorName}</p>
                                                )}
                                            </div>
                                            <div className="flex text-amber-500">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={14} weight={i < filledStars ? "fill" : "regular"} />
                                                ))}
                                            </div>
                                        </div>
                                        {review.review_text && (
                                            <p className="text-charcoal/80 leading-relaxed font-serif text-sm">
                                                {review.review_text}
                                            </p>
                                        )}
                                        <div className="mt-4 flex items-center gap-4 text-xs text-warm-gray">
                                            <span>{formatRelativeTime(review.created_at)}</span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            {/* Colonne Sidebar Droite */}
            <div className="md:col-span-4 flex flex-col gap-14">

                {/* SECTION: Top Auteurs Sidebar */}
                {topAuthors && topAuthors.length > 0 ? (
                    <section>
                        <h2 className="font-serif text-lg text-charcoal mb-4 border-b border-soft-border pb-2">Auteurs Favoris</h2>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                            {topAuthors.map((author: any, i: number) => (
                                <Link href={`/author/${author.slug}`} key={author.id || i} className="flex flex-col items-center group cursor-pointer">
                                    <div className="relative group mb-2">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-accent transition-colors shadow-sm">
                                            {author.image_url ? (
                                                <Image
                                                    src={author.image_url}
                                                    alt={author.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-300 flex items-center justify-center">
                                                    <span className="text-sm font-serif text-white">{getInitials(author.name)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 z-10 bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-cream">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-warm-gray group-hover:text-charcoal transition-colors text-center w-20 leading-tight">
                                        {author.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section>
                        <h2 className="font-serif text-lg text-charcoal mb-4 border-b border-soft-border pb-2">Auteurs Favoris</h2>
                        <div className="text-center py-6 bg-paper border border-soft-border border-dashed rounded-xl">
                            <p className="text-warm-gray italic font-serif text-sm">Aucun auteur défini.</p>
                            <EditProfileCTA profileUsername={username} />
                        </div>
                    </section>
                )}

                {/* SECTION: Graphique des Notes */}
                {reviewDistribution.length > 0 && totalRated > 0 && (
                    <section>
                        <h2 className="font-serif text-lg text-charcoal mb-6 border-b border-soft-border pb-2">Répartition des Notes</h2>
                        <div className="flex flex-col gap-2">
                            {reviewDistribution.map((review) => {
                                const percentage = maxCount > 0 ? (review.count / maxCount) * 100 : 0;
                                return (
                                    <div key={review.stars} className="flex items-center gap-3">
                                        <span className="w-4 text-xs text-warm-gray font-medium">{review.stars}</span>
                                        <Star size={10} weight="fill" className="text-warm-gray" />
                                        <div className="flex-grow h-3 bg-soft-border rounded-sm overflow-hidden relative">
                                            <motion.div
                                                className="absolute top-0 left-0 bottom-0 bg-accent rounded-sm"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                            />
                                        </div>
                                        <span className="w-6 text-xs text-warm-gray text-right">{review.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 text-center text-xs text-warm-gray uppercase tracking-widest">
                            {totalRated} Poèmes Notés
                        </div>
                    </section>
                )}

                {/* SECTION: Badges */}
                {badges.length > 0 && (
                    <section>
                        <h2 className="font-serif text-lg text-charcoal mb-4 border-b border-soft-border pb-2">Badges</h2>
                        <div className="flex flex-wrap gap-3">
                            {badges.map((badge: any, i: number) => (
                                <div key={badge.id || i} className="relative group flex items-center gap-2 px-3 py-1.5 bg-paper border border-soft-border hover:border-accent/40 rounded-full text-xs font-medium text-charcoal cursor-default transition-colors">
                                    {getBadgeIcon(badge.name || '')}
                                    {badge.name}
                                    {badge.description && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-charcoal text-cream text-[10px] uppercase tracking-widest rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 flex flex-col items-center">
                                            {badge.description}
                                            <div className="absolute -bottom-[4px] w-2 h-2 bg-charcoal rotate-45" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
