"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users } from "@phosphor-icons/react";
import Link from "next/link";

import CollectionLikeButton from "./CollectionLikeButton";
import ShareButton from "@/components/ui/ShareButton";
import AuthorsListModal from "./AuthorsListModal";
import { formatAuthors } from "@/utils/author";

interface CollectionHeaderProps {
    collection: {
        id: string;
        title: string;
        slug: string;
        authorName?: string;
        authorSlug?: string;
        authors?: any;
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
    const [isAuthorsModalOpen, setIsAuthorsModalOpen] = useState(false);

    // Détermine les informations d'auteurs selon la règle métier :
    // 1 auteur -> fiche auteur
    // 2 auteurs -> 2 auteurs affichés avec liens distincts
    // > 2 auteurs -> "Auteurs multiples" + modal
    const rawAuthorsInput = collection.authors || (collection.authorName ? [{ name: collection.authorName, slug: collection.authorSlug }] : []);
    const authorInfo = formatAuthors(rawAuthorsInput);

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
                            <div className="text-white/85 text-xs tracking-widest uppercase font-sans text-center mt-2 px-2 line-clamp-2 drop-shadow-sm">
                                {authorInfo.coverText}
                            </div>
                            <h1 className="font-serif text-white text-3xl md:text-4xl text-center leading-tight drop-shadow-md">
                                {collection.title}
                            </h1>
                            <div className="text-white/60 text-xs tracking-widest text-center mb-2">
                                {collection.year || ""}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Infos du Recueil */}
                <motion.div
                    className="flex flex-col flex-grow text-center md:text-left mt-4 md:mt-8 min-w-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal mb-4 leading-tight">
                        {collection.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center md:items-start gap-2 sm:gap-4 mb-6 text-warm-gray font-serif">
                        {/* CAS 1 : Un seul auteur */}
                        {authorInfo.count === 1 && (
                            <Link
                                href={authorInfo.authors[0].slug ? `/author/${authorInfo.authors[0].slug}` : "#"}
                                className="text-lg hover:text-accent transition-colors flex items-center gap-2"
                            >
                                <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-serif flex-shrink-0">
                                    {authorInfo.authors[0].name.charAt(0)}
                                </div>
                                <span>{authorInfo.authors[0].name}</span>
                            </Link>
                        )}

                        {/* CAS 2 : Exactement 2 auteurs (conservés affichés avec liens distincts) */}
                        {authorInfo.count === 2 && (
                            <div className="flex items-center gap-2.5 text-lg">
                                <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                                    <div className="inline-block w-8 h-8 rounded-full ring-2 ring-cream bg-zinc-800 text-white flex items-center justify-center text-xs font-serif">
                                        {authorInfo.authors[0].name.charAt(0)}
                                    </div>
                                    <div className="inline-block w-8 h-8 rounded-full ring-2 ring-cream bg-accent text-white flex items-center justify-center text-xs font-serif">
                                        {authorInfo.authors[1].name.charAt(0)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Link
                                        href={authorInfo.authors[0].slug ? `/author/${authorInfo.authors[0].slug}` : "#"}
                                        className="hover:text-accent transition-colors underline-offset-4 hover:underline"
                                    >
                                        {authorInfo.authors[0].name}
                                    </Link>
                                    <span className="text-warm-gray/60 font-sans text-base">&</span>
                                    <Link
                                        href={authorInfo.authors[1].slug ? `/author/${authorInfo.authors[1].slug}` : "#"}
                                        className="hover:text-accent transition-colors underline-offset-4 hover:underline"
                                    >
                                        {authorInfo.authors[1].name}
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* CAS 3 : Au-delà (> 2 auteurs, 'Auteurs multiples' + ouverture du modal) */}
                        {authorInfo.count > 2 && (
                            <button
                                type="button"
                                onClick={() => setIsAuthorsModalOpen(true)}
                                className="group inline-flex items-center gap-2.5 text-lg text-charcoal hover:text-accent transition-all cursor-pointer text-left"
                                title="Voir tous les auteurs contributeurs"
                            >
                                <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-accent text-white flex items-center justify-center text-xs transition-colors shadow-sm flex-shrink-0">
                                    <Users size={16} weight="bold" />
                                </div>
                                <span className="font-serif underline-offset-4 group-hover:underline">
                                    Auteurs multiples
                                </span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-charcoal/5 group-hover:bg-accent/10 group-hover:text-accent text-warm-gray font-sans transition-colors">
                                    {authorInfo.count} auteurs
                                </span>
                            </button>
                        )}

                        {/* CAS 4 : Aucun auteur répertorié */}
                        {authorInfo.count === 0 && (
                            <span className="text-lg text-warm-gray">Auteur inconnu</span>
                        )}

                        <span className="hidden sm:inline text-soft-border">•</span>
                        <span className="text-sm pt-1">{collection.year || "—"}</span>
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

            {/* Modal des auteurs si auteurs multiples */}
            <AuthorsListModal
                isOpen={isAuthorsModalOpen}
                onClose={() => setIsAuthorsModalOpen(false)}
                collectionTitle={collection.title}
                authors={authorInfo.authors}
            />
        </section>
    );
}

