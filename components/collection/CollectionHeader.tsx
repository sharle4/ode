"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "@phosphor-icons/react";
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

                    <div className="flex flex-col sm:flex-row items-center md:items-baseline gap-2.5 sm:gap-4 mb-6 text-warm-gray font-serif text-lg">
                        {/* CAS 1 : Un seul auteur */}
                        {authorInfo.count === 1 && (
                            <Link
                                href={authorInfo.authors[0].slug ? `/author/${authorInfo.authors[0].slug}` : "#"}
                                className="text-lg hover:text-accent transition-colors text-charcoal font-medium"
                            >
                                {authorInfo.authors[0].name}
                            </Link>
                        )}

                        {/* CAS 2 : Exactement 2 auteurs (alignés avec & en font-serif) */}
                        {authorInfo.count === 2 && (
                            <div className="inline-flex items-baseline gap-2 flex-wrap">
                                <Link
                                    href={authorInfo.authors[0].slug ? `/author/${authorInfo.authors[0].slug}` : "#"}
                                    className="text-lg text-charcoal hover:text-accent transition-colors font-medium"
                                >
                                    {authorInfo.authors[0].name}
                                </Link>
                                <span className="text-lg text-warm-gray font-serif select-none">&</span>
                                <Link
                                    href={authorInfo.authors[1].slug ? `/author/${authorInfo.authors[1].slug}` : "#"}
                                    className="text-lg text-charcoal hover:text-accent transition-colors font-medium"
                                >
                                    {authorInfo.authors[1].name}
                                </Link>
                            </div>
                        )}

                        {/* CAS 3 : Au-delà (> 2 auteurs, 'Auteurs multiples' + modal) */}
                        {authorInfo.count > 2 && (
                            <button
                                type="button"
                                onClick={() => setIsAuthorsModalOpen(true)}
                                className="group inline-flex items-center gap-2 text-lg text-charcoal hover:text-accent transition-all cursor-pointer"
                                title="Voir tous les auteurs contributeurs"
                            >
                                <span className="font-serif font-medium">
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

                        <span className="hidden sm:inline text-soft-border select-none">•</span>
                        <span className="text-base sm:text-lg text-warm-gray">{collection.year || "—"}</span>
                        <span className="hidden sm:inline text-soft-border select-none">•</span>
                        <span className="text-base sm:text-lg text-warm-gray">{collection.poemCount} poèmes</span>
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

