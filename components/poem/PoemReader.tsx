"use client";

import React from "react";
import { motion } from "framer-motion";

interface PoemReaderProps {
    content: {
        stanzas?: string[][];
        raw_markers?: string[];
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            scategorygerChildren: 0.15,
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
    const stanzas = content?.stanzas;

    if (!stanzas || !Array.isArray(stanzas) || stanzas.length === 0) {
        return (
            <p className="text-warm-gray text-center italic font-serif py-12">
                Le contenu de ce poème n'est pas disponible dans ce format.
            </p>
        );
    }

    return (
        <motion.article
            className="poem-container [&>div:first-child>p:first-of-type]:first-letter:text-5xl [&>div:first-child>p:first-of-type]:first-letter:float-left [&>div:first-child>p:first-of-type]:first-letter:mt-2 [&>div:first-child>p:first-of-type]:first-letter:mr-2 [&>div:first-child>p:first-of-type]:first-letter:font-bold max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 font-serif"
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
                    {stanza.map((line, lineIndex) => (
                        <p
                            key={`line-${stanzaIndex}-${lineIndex}`}
                            className="text-lg md:text-2xl leading-loose md:leading-[2.5] text-charcoal min-h-[1.5em]"
                        >
                            {line}
                        </p>
                    ))}
                </motion.div>
            ))}
        </motion.article>
    );
}
