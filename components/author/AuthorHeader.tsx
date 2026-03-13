"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface AuthorHeaderProps {
    author: {
        name: string;
        date_of_birth?: string | null;
        date_of_death?: string | null;
        biography?: string | null;
        image_url?: string | null;
        signature_url?: string | null;
    };
}

function extractYear(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const match = dateStr.match(/\d{4}/);
    return match ? match[0] : dateStr;
}

export default function AuthorHeader({ author }: AuthorHeaderProps) {
    const birthYear = extractYear(author.date_of_birth);
    const deathYear = extractYear(author.date_of_death);
    const dateRange = birthYear ? `${birthYear} - ${deathYear || 'Présent'}` : '';

    return (
        <section className="relative w-full h-[60vh] min-h-[400px] flex justify-center overflow-hidden">
            {/* Image de Fond (Cover) */}
            <div className="absolute inset-0 z-0">
                {author.image_url ? (
                    <Image
                        src={author.image_url}
                        alt={author.name}
                        fill
                        sizes="100vw"
                        className="object-cover object-center scale-105"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"></div>
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-end px-4 sm:px-6 pb-12 h-full gap-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {dateRange && (
                            <span className="text-xs sm:text-sm font-sans uppercase tracking-widest text-[#fffdfa]/80 mb-2 block font-medium">
                                {dateRange}
                            </span>
                        )}
                        <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] leading-tight">
                            {author.name}
                        </h1>
                    </motion.div>

                    {author.signature_url && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="hidden md:block pb-2"
                        >
                            <img
                                src={author.signature_url}
                                alt={`Signature de ${author.name}`}
                                className="h-16 lg:h-24 filter invert drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] opacity-80 mix-blend-screen"
                                loading="lazy"
                            />
                        </motion.div>
                    )}
                </div>

                {author.biography && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <p className="text-base sm:text-lg text-white/90 font-serif leading-relaxed drop-shadow-md line-clamp-3">
                            {author.biography}
                        </p>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
