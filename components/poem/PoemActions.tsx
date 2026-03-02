"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    ListPlus,
    Star,
    ChatCircle,
    ShareNetwork,
    X
} from "@phosphor-icons/react";

interface PoemActionsProps {
    poemId: string;
}

export default function PoemActions({ poemId }: PoemActionsProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [showShareTooltip, setShowShareTooltip] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
    };

    const actionButtons = [
        {
            id: "like",
            icon: <Heart size={22} weight={isLiked ? "fill" : "regular"} className={isLiked ? "text-accent" : "text-charcoal dark:text-white"} />,
            label: "Liker",
            onClick: () => setIsLiked(!isLiked),
        },
        {
            id: "list",
            icon: <ListPlus size={22} weight="regular" className="text-charcoal dark:text-white" />,
            label: "Ajouter",
            onClick: () => console.log("Open List Modal"),
        },
        {
            id: "rate",
            icon: <Star size={22} weight="regular" className="text-charcoal dark:text-white" />,
            label: "Noter",
            onClick: () => console.log("Open Rate Modal"),
        },
        {
            id: "log",
            icon: <ChatCircle size={22} weight="regular" className="text-charcoal dark:text-white" />,
            label: "Commenter",
            onClick: () => console.log("Open Log Modal"),
        },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <motion.div
                className="flex items-center gap-1 md:gap-3 p-2 bg-paper/80 dark:bg-zinc-900/80 backdrop-blur-md border border-soft-border dark:border-zinc-800 rounded-full shadow-lg"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5,
                }}
            >
                {actionButtons.map((btn) => (
                    <motion.button
                        key={btn.id}
                        onClick={btn.onClick}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        {btn.icon}

                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-charcoal dark:bg-white text-cream dark:text-charcoal text-[10px] uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {btn.label}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-charcoal dark:border-t-white" />
                        </div>
                    </motion.button>
                ))}

                <div className="w-px h-6 bg-soft-border dark:bg-zinc-700 mx-2" />

                <div className="relative">
                    <motion.button
                        onClick={handleShare}
                        className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        <ShareNetwork size={22} weight="regular" className="text-charcoal dark:text-white" />
                    </motion.button>

                    <AnimatePresence>
                        {showShareTooltip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: 5, x: "-50%" }}
                                className="absolute -top-12 left-1/2 px-3 py-1.5 bg-accent text-white text-[10px] uppercase tracking-widest rounded whitespace-nowrap shadow-md pointer-events-none"
                            >
                                Lien copié !
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-accent" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>
        </div>
    );
}
