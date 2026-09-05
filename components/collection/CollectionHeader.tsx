"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, ShareNetwork } from "@phosphor-icons/react";
import Link from "next/link";

import CollectionLikeButton from "./CollectionLikeButton";
import ShareButton from "@/components/ui/ShareButton";

interface CollectionHeaderProps {
    collection: {
        id: string;
        title: string;
        slug: string;
        authorName: string;
        authorSlug: string;
        year: number;
        poemCount: number;
        coverColor: string;
        description: string;
        averageReview?: number;
        reviewsCount?: number;
        initialIsLiked?: boolean;
        likesCount?: number;
    };
}

export default function CollectionHeader({ collection }: CollectionHeaderProps) {
    return (
        <section className="relative w-full pt-32 pb-16 flex justify-center text-charcoal">
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">

                {/* Couverture du Livre */}
                <motion.div
                    className="w-48 sm:w-64 flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className={`relative w-full aspect-[2/3] rounded-r-xl rounded-l-sm shadow-2xl overflow-hidden bg-gradient-to-br ${collection.coverColor}`}>
                        {/* Reliure */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 lg:w-4 bg-black/20 z-10 border-r border-white/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]"></div>

                        <div className="absolute inset-0 flex flex-col p-6 z-20 justify-between">
                            <div className="text-white/80 text-xs tracking-widest uppercase font-sans text-center mt-2">
                                {collection.authorName}
                            </div>
                            <h1 className="font-serif text-white text-3xl md:text-4xl text-center leading-tight drop-shadow-md">
                                {collection.title}
                            </h1>
                            <div className="text-white/60 text-xs tracking-widest text-center mb-2">
                                {collection.year}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Infos du Recueil */}
                <motion.div
                    className="flex flex-col flex-grow text-center md:text-left mt-4 md:mt-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal mb-4 leading-tight">
                        {collection.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center md:items-start gap-2 sm:gap-4 mb-6 text-warm-gray font-serif">
                        <Link href={`/author/${collection.authorSlug}`} className="text-lg hover:text-accent transition-colors flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs">
                                {collection.authorName.charAt(0)}
                            </div>
                            {collection.authorName}
                        </Link>
                        <span className="hidden sm:inline text-soft-border">•</span>
                        <span className="text-sm pt-1">{collection.year}</span>
                        <span className="hidden sm:inline text-soft-border">•</span>
                        <span className="text-sm pt-1">{collection.poemCount} poèmes</span>
                    </div>

                    <p className="text-charcoal/80 font-serif leading-relaxed mb-8 max-w-2xl text-sm md:text-base">
                        {collection.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <button className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-full uppercase tracking-wider text-xs font-semibold hover:bg-accent-light transition-colors shadow-lg shadow-accent/20">
                            <BookOpen size={18} weight="fill" />
                            Commencer
                        </button>
                        <CollectionLikeButton
                            collectionId={collection.id}
                            slug={collection.slug}
                            initialIsLiked={collection.initialIsLiked}
                            initialLikesCount={collection.likesCount}
                        />
                        <ShareButton ariaLabel="Partager ce recueil" />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
