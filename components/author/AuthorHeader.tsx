"use client";

import React from "react";
import { motion } from "framer-motion";

interface AuthorHeaderProps {
    author: {
        name: string;
        birthYear: number;
        deathYear?: number;
        bioShort: string;
        coverImage: string;
    };
}

export default function AuthorHeader({ author }: AuthorHeaderProps) {
    return (
        <section className="relative w-full h-[60vh] min-h-[400px] flex justify-center overflow-hidden">
            {/* Image de Fond (Cover) */}
            <div className="absolute inset-0 z-0">
                <img
                    src={author.coverImage}
                    alt={author.name}
                    className="w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"></div>
                {/* Vignette Noire supplémentaire pour l'ambiance */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-end px-4 sm:px-6 pb-12 h-full gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="text-xs sm:text-sm font-sans uppercase tracking-widest text-[#fffdfa]/80 mb-2 block font-medium">
                        {author.birthYear} - {author.deathYear || "Présent"}
                    </span>
                    <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl text-white mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] leading-tight">
                        {author.name}
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <p className="text-base sm:text-lg text-white/90 font-serif leading-relaxed drop-shadow-md">
                        {author.bioShort}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
