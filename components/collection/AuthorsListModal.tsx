"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MagnifyingGlass, Users, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import type { AuthorItem } from "@/utils/author";

interface AuthorsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionTitle: string;
    authors: AuthorItem[];
}

export default function AuthorsListModal({
    isOpen,
    onClose,
    collectionTitle,
    authors,
}: AuthorsListModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Bloquer le défilement de l'arrière-plan quand le modal est ouvert
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // Fermeture avec la touche Échap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Filtrage dynamique des auteurs
    const filteredAuthors = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return authors;
        return authors.filter((a) => a.name.toLowerCase().includes(query));
    }, [authors, searchQuery]);

    // Réinitialiser la recherche à la fermeture
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
                    {/* Arrière-plan flouté sombre */}
                    <motion.div
                        className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Contenu de la fenêtre modale */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-authors-title"
                        className="relative w-full max-w-2xl bg-paper rounded-3xl border border-soft-border shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {/* En-tête du modal */}
                        <div className="p-6 pb-4 border-b border-soft-border/60 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Users size={22} weight="bold" />
                                </div>
                                <div>
                                    <h2
                                        id="modal-authors-title"
                                        className="font-serif text-2xl text-charcoal leading-tight"
                                    >
                                        Auteurs contributeurs
                                    </h2>
                                    <p className="text-xs text-warm-gray mt-1 line-clamp-1">
                                        Recueil : <span className="italic font-serif">{collectionTitle}</span>
                                        {" "}• {authors.length} auteurs au total
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-9 h-9 rounded-full border border-soft-border flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-cream transition-colors cursor-pointer"
                                aria-label="Fermer"
                            >
                                <X size={18} weight="bold" />
                            </button>
                        </div>

                        {/* Barre de recherche si plus de 6 auteurs */}
                        {authors.length > 6 && (
                            <div className="px-6 pt-4 pb-2">
                                <div className="relative flex items-center">
                                    <MagnifyingGlass
                                        size={18}
                                        className="absolute left-3.5 text-warm-gray/60 pointer-events-none"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher parmi les auteurs..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream border border-soft-border/80 text-sm text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 text-xs text-warm-gray hover:text-charcoal"
                                        >
                                            Effacer
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Liste d'auteurs scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 pt-3">
                            {filteredAuthors.length === 0 ? (
                                <div className="text-center py-12 text-warm-gray font-serif italic text-sm">
                                    Aucun auteur ne correspond à « {searchQuery} »
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {filteredAuthors.map((author, index) => {
                                        const slug = author.slug || author.id;
                                        const initial = author.name.charAt(0).toUpperCase();

                                        return (
                                            <Link
                                                key={author.id || index}
                                                href={slug ? `/author/${slug}` : "#"}
                                                onClick={onClose}
                                                className="group flex items-center justify-between p-3 rounded-xl border border-soft-border/60 hover:border-accent/40 bg-cream/50 hover:bg-white transition-all shadow-xs"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-serif flex-shrink-0 group-hover:bg-accent transition-colors">
                                                        {initial}
                                                    </div>
                                                    <span className="font-serif text-sm text-charcoal group-hover:text-accent transition-colors truncate font-medium">
                                                        {author.name}
                                                    </span>
                                                </div>

                                                <CaretRight
                                                    size={14}
                                                    className="text-warm-gray/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2"
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pied du modal */}
                        <div className="px-6 py-3 bg-cream/40 border-t border-soft-border/60 flex items-center justify-between text-xs text-warm-gray">
                            <span>
                                {searchQuery
                                    ? `${filteredAuthors.length} sur ${authors.length} auteurs`
                                    : `${authors.length} auteurs répertoriés`}
                            </span>
                            <span className="italic font-serif">Cliquez sur un auteur pour explorer son œuvre</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
