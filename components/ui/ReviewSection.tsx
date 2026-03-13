"use client";

import React, { useState } from "react";
import { Star, User, ThumbsUp, ChatCircle } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";
import { formatRelativeTime } from "@/utils/gradient";

interface ReviewItem {
    id: string | number;
    username?: string;
    avatar_url?: string | null;
    date?: string;
    created_at?: string;
    score: number;
    review_text?: string;
    likes?: number;
}

interface ReviewSectionProps {
    averageReview?: number;
    totalReviews?: number;
    /** Optional: review distribution from DB, otherwise derived from totalReviews */
    distribution?: { stars: number; pct: number }[];
    /** Optional: actual review items from DB */
    reviews?: ReviewItem[];
    /** Optional: use 'minimal' for poem pages that should be less intrusive */
    variant?: "full" | "minimal";
}

export default function ReviewSection({
    averageReview = 0,
    totalReviews = 0,
    distribution,
    reviews = [],
    variant = "full",
}: ReviewSectionProps) {
    const [showAllReviews, setShowAllReviews] = useState(false);

    // If no distribution provided, generate a placeholder based on averageReview
    const displayDistribution = distribution || [
        { stars: 5, pct: averageReview >= 4.5 ? 58 : averageReview >= 3.5 ? 35 : 15 },
        { stars: 4, pct: averageReview >= 4.0 ? 22 : 25 },
        { stars: 3, pct: 12 },
        { stars: 2, pct: averageReview <= 3.0 ? 15 : 5 },
        { stars: 1, pct: averageReview <= 2.0 ? 20 : 3 },
    ];

    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);

    return (
        <FadeIn delay={0.3} duration={0.8} y={30}>
            <section className="py-12 md:py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Subtle separator */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-soft-border to-transparent mb-12 md:mb-16" />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
                        {/* Left: Review summary */}
                        <div className="md:col-span-4">
                            <h3 className="font-serif text-xl md:text-2xl text-charcoal mb-6">
                                Avis des lecteurs
                            </h3>

                            {/* Big review number */}
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="font-serif text-5xl font-bold text-charcoal tracking-tight">
                                    {averageReview > 0 ? averageReview.toFixed(1) : '—'}
                                </span>
                                {averageReview > 0 && <span className="text-sm text-warm-gray">/ 5</span>}
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        weight={i < Math.round(averageReview) ? "fill" : "regular"}
                                        className={
                                            i < Math.round(averageReview)
                                                ? "text-accent"
                                                : "text-soft-border"
                                        }
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-warm-gray mb-8">
                                {totalReviews > 0 ? `${totalReviews.toLocaleString("fr-FR")} avis` : 'Aucun avis'}
                            </p>

                            {/* Distribution bars */}
                            {totalReviews > 0 && (
                                <div className="space-y-2">
                                    {displayDistribution.map(({ stars, pct }) => (
                                        <div key={stars} className="flex items-center gap-3">
                                            <span className="text-xs text-warm-gray w-6 text-right font-medium">
                                                {stars}
                                                <Star
                                                    size={9}
                                                    weight="fill"
                                                    className="text-warm-gray/60 inline ml-0.5 -mt-0.5"
                                                />
                                            </span>
                                            <div className="flex-1 h-2 bg-paper rounded-full overflow-hidden border border-soft-border/50">
                                                <div
                                                    className="h-full bg-accent/60 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-warm-gray/60 w-8">
                                                {pct}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Reviews list */}
                        <div className="md:col-span-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <ChatCircle size={18} className="text-warm-gray" />
                                    <h3 className="font-serif text-xl md:text-2xl text-charcoal">
                                        Critiques
                                    </h3>
                                </div>
                                {variant === "full" && (
                                    <button className="text-xs text-accent hover:text-charcoal transition-colors uppercase tracking-wider font-medium">
                                        Écrire un avis
                                    </button>
                                )}
                            </div>

                            {visibleReviews.length > 0 ? (
                                <div className="space-y-0">
                                    {visibleReviews.map((review, index) => (
                                        <div
                                            key={review.id}
                                            className={`py-6 ${index < visibleReviews.length - 1
                                                    ? "border-b border-soft-border/60"
                                                    : ""
                                                }`}
                                        >
                                            {/* Review header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-paper border border-soft-border flex items-center justify-center overflow-hidden">
                                                        {review.avatar_url ? (
                                                            <img src={review.avatar_url} alt={review.username || ''} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={14} className="text-warm-gray" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-charcoal">
                                                            {review.username || 'Anonyme'}
                                                        </p>
                                                        <p className="text-xs text-warm-gray">
                                                            {review.created_at ? formatRelativeTime(review.created_at) : review.date || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            weight={i < Math.round(review.score) ? "fill" : "regular"}
                                                            className={
                                                                i < Math.round(review.score)
                                                                    ? "text-accent"
                                                                    : "text-soft-border"
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Review text */}
                                            {review.review_text && (
                                                <p className="text-sm text-charcoal/80 leading-relaxed font-serif mb-3">
                                                    {review.review_text}
                                                </p>
                                            )}

                                            {/* Review actions */}
                                            {review.likes !== undefined && review.likes > 0 && (
                                                <button className="flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal transition-colors">
                                                    <ThumbsUp size={12} />
                                                    Utile ({review.likes})
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-warm-gray italic font-serif py-8">
                                    Aucune critique pour le moment. Soyez le premier à donner votre avis !
                                </p>
                            )}

                            {!showAllReviews && reviews.length > 2 && (
                                <button
                                    onClick={() => setShowAllReviews(true)}
                                    className="mt-4 text-sm text-accent hover:text-charcoal transition-colors font-medium"
                                >
                                    Voir toutes les critiques →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </FadeIn>
    );
}
