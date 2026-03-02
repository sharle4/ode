"use client";

import React from "react";
import { motion } from "framer-motion";

interface PoemReaderProps {
    content: {
        stanzas?: string[][];
        raw_markers?: string[];
    } | string[][]; // Support both legacy array and new object format
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const stanzaVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 80,
            damping: 20,
        },
    },
};

export default function PoemReader({ content }: PoemReaderProps) {
    // Determine the stanzas array based on the format
    const stanzas = Array.isArray(content) ? content : content?.stanzas;

    if (!stanzas || !Array.isArray(stanzas) || stanzas.length === 0) {
        return (
            <p className="text-warm-gray text-center italic font-serif py-12">
                Le contenu de ce poème n'est pas disponible dans ce format.
            </p>
        );
    }

    return (
        <motion.article
            className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 font-serif"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {stanzas.map((stanza, stanzaIndex) => (
                <motion.div
                    key={`stanza-${stanzaIndex}`}
                    variants={stanzaVariants}
                    className="mb-10 md:mb-14"
                >
                    {stanza.map((line, lineIndex) => {
                        // Appliquer la lettrine uniquement sur la première lettre de la première strophe, et si la ligne n'est pas vide
                        const isFirstLine = stanzaIndex === 0 && lineIndex === 0 && line.length > 0;

                        if (isFirstLine) {
                            const firstChar = line.charAt(0);
                            const restOfLine = line.slice(1);
                            return (
                                <p
                                    key={`line-${stanzaIndex}-${lineIndex}`}
                                    className="text-lg md:text-2xl leading-loose md:leading-[2.5] text-charcoal dark:text-white"
                                >
                                    <span className="drop-cap">{firstChar}</span>
                                    {restOfLine}
                                </p>
                            );
                        }

                        return (
                            <p
                                key={`line-${stanzaIndex}-${lineIndex}`}
                                className="text-lg md:text-2xl leading-loose md:leading-[2.5] text-charcoal dark:text-white min-h-[1.5em]"
                            >
                                {line}
                            </p>
                        );
                    })}
                </motion.div>
            ))}
        </motion.article>
    );
}
