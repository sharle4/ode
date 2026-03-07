"use client";

import React, { useState } from "react";
import { Star, User, ThumbsUp, ChatCircle } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";

// Mock review distribution
const mockDistribution = [
    { stars: 5, pct: 58 },
    { stars: 4, pct: 22 },
    { stars: 3, pct: 12 },
    { stars: 2, pct: 5 },
    { stars: 1, pct: 3 },
];

// Mock reviews
const mockReviews = [
    {
        id: 1,
        author: "Marguerite D.",
        date: "14 fév. 2026",
        review: 5,
        text: "Ce poème m'a profondément touchée. La musicalité des vers et la richesse des images créent une atmosphère envoûtante. Un chef-d'œuvre intemporel.",
        likes: 24,
    },
    {
        id: 2,
        author: "Émile V.",
        date: "8 fév. 2026",
        review: 4,
        text: "Baudelaire capture avec génie l'essence même de la mélancolie. On sent la tension constante entre le sordide et le sublime. Quelques passages restent hermétiques à la première lecture.",
        likes: 17,
    },
    {
        id: 3,
        author: "Clara S.",
        date: "2 fév. 2026",
        review: 5,
        text: "Chaque relecture révèle une couche de sens nouvelle. La modernité de ce texte, écrit il y a plus d'un siècle, est saisissante.",
        likes: 11,
    },
];

interface ReviewSectionProps {
    averageReview?: number;
    totalReviews?: number;
    /** Optional: use 'minimal' for poem pages that should be less intrusive */
    variant?: "full" | "minimal";
}

export default function ReviewSection({
    averageReview = 4.8,
    totalReviews = 1247,
    variant = "full",
}: ReviewSectionProps) {
    const [showAllReviews, setShowAllReviews] = useState(false);
    const visibleReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 2);

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
                                    {averageReview}
                                </span>
                                <span className="text-sm text-warm-gray">/ 5</span>
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
                                {totalReviews.toLocaleString("fr-FR")} avis
                            </p>

                            {/* Distribution bars */}
                            <div className="space-y-2">
                                {mockDistribution.map(({ stars, pct }) => (
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
                                                <div className="w-8 h-8 rounded-full bg-paper border border-soft-border flex items-center justify-center">
                                                    <User size={14} className="text-warm-gray" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-charcoal">
                                                        {review.author}
                                                    </p>
                                                    <p className="text-xs text-warm-gray">
                                                        {review.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        weight={i < review.review ? "fill" : "regular"}
                                                        className={
                                                            i < review.review
                                                                ? "text-accent"
                                                                : "text-soft-border"
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Review text */}
                                        <p className="text-sm text-charcoal/80 leading-relaxed font-serif mb-3">
                                            {review.text}
                                        </p>

                                        {/* Review actions */}
                                        <button className="flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal transition-colors">
                                            <ThumbsUp size={12} />
                                            Utile ({review.likes})
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {!showAllReviews && mockReviews.length > 2 && (
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
