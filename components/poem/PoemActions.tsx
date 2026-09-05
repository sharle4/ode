"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    ListPlus,
    Star,
    ChatCircle,
    ShareNetwork,
    X,
    CheckCircle,
    Smiley
} from "@phosphor-icons/react";

import { usePathname } from "next/navigation";
import { ratePoem, toggleLike } from "@/app/actions/poetry";
import { useAction } from "next-safe-action/hooks";
import { useDebouncedCallback } from "use-debounce";

interface PoemActionsProps {
    poemId: string;
    initialIsLiked?: boolean;
}

export default function PoemActions({ poemId, initialIsLiked = false }: PoemActionsProps) {
    const pathname = usePathname();
    const slug = pathname?.split('/').pop() || "";

    const [isRead, setIsRead] = useState(false);
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const [likeNotice, setLikeNotice] = useState<string | null>(null);

    // True Instant Optimistic Like State (0ms visual feedback)
    const [isLiked, setIsLiked] = useState(initialIsLiked);

    const { executeAsync: executeRate } = useAction(ratePoem);
    const { executeAsync: executeLike } = useAction(toggleLike);

    const debouncedToggleLike = useDebouncedCallback(async (liked: boolean) => {
        try {
            const result = await executeLike({ poemId, slug, targetState: liked });
            if (result?.serverError || result?.validationErrors) {
                console.error("Erreur serveur lors du like:", result);
                if (result?.serverError?.includes("connecté")) {
                    setLikeNotice("Connexion requise");
                    setTimeout(() => { window.location.href = "/login"; }, 1200);
                } else {
                    setLikeNotice("Erreur d'enregistrement");
                    setTimeout(() => setLikeNotice(null), 2500);
                }
                // Rollback if server rejects
                setIsLiked(!liked);
            }
        } catch (err) {
            console.error("Erreur toggleLike:", err);
            setIsLiked(!liked);
        }
    }, 250);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
    };

    const handleLikeClick = () => {
        const newValue = !isLiked;
        setIsLiked(newValue); // Instant 0ms update!
        debouncedToggleLike(newValue);
    };

    const actionButtons = [
        {
            id: "read",
            icon: <CheckCircle size={22} weight={isRead ? "fill" : "regular"} className={isRead ? "text-accent" : "text-charcoal"} />,
            label: "Lu",
            onClick: () => setIsRead(!isRead),
        },
        {
            id: "like",
            icon: (
                <motion.div
                    animate={isLiked ? { scale: [1, 1.35, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <Heart size={22} weight={isLiked ? "fill" : "regular"} className={isLiked ? "text-accent fill-accent" : "text-charcoal"} />
                </motion.div>
            ),
            label: isLiked ? "Aimé" : "Liker",
            onClick: handleLikeClick,
        },
        {
            id: "list",
            icon: <ListPlus size={22} weight="regular" className="text-charcoal" />,
            label: "Ajouter",
            onClick: () => console.log("Open List Modal"),
        },
        {
            id: "emotion",
            icon: <Smiley size={22} weight="regular" className="text-charcoal" />,
            label: "Émotions",
            onClick: () => console.log("Open Emotion Modal"),
        },
        {
            id: "rate",
            icon: <Star size={22} weight="regular" className="text-charcoal" />,
            label: "Noter",
            onClick: () => console.log("Open Rate Modal"),
        },
        {
            id: "log",
            icon: <ChatCircle size={22} weight="regular" className="text-charcoal" />,
            label: "Commenter",
            onClick: () => console.log("Open Log Modal"),
        },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <motion.div
                className="flex items-center gap-1 md:gap-3 p-2 bg-paper/90 backdrop-blur-md border border-soft-border rounded-full shadow-lg"
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
                        type="button"
                        onClick={btn.onClick}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-charcoal/5 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        {btn.icon}

                        <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-paper border border-soft-border text-charcoal text-[10px] uppercase tracking-widest rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex flex-col items-center">
                            {btn.label}
                            {/* Flèche Tooltip */}
                            <div className="absolute -bottom-[5px] w-2 h-2 bg-paper border-b border-r border-soft-border rotate-45" />
                        </div>
                    </motion.button>
                ))}

                <div className="w-px h-6 bg-soft-border mx-2" />

                <div className="relative group">
                    <motion.button
                        onClick={handleShare}
                        className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-charcoal/5 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        <ShareNetwork size={22} weight="regular" className="text-charcoal" />
                    </motion.button>

                    {/* Infobulle standard au hover (masquée si showShareTooltip est vrai) */}
                    <div
                        className={`absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-paper border border-soft-border text-charcoal text-[10px] uppercase tracking-widest rounded shadow-md transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center z-20 ${
                            showShareTooltip ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                        }`}
                    >
                        Partager
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-paper border-b border-r border-soft-border rotate-45" />
                    </div>

                    <AnimatePresence>
                        {showShareTooltip && (
                            <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 pointer-events-none z-30">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 3 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 3 }}
                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                    className="relative px-2.5 py-1.5 bg-accent text-white text-[10px] uppercase tracking-widest rounded whitespace-nowrap shadow-md flex items-center justify-center font-medium"
                                >
                                    Lien copié !
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rotate-45" />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Like Notice (Auth/Error) Toast */}
                <AnimatePresence>
                    {likeNotice && (
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 6 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="relative px-3.5 py-1.5 bg-charcoal text-white text-xs font-medium rounded-full shadow-xl whitespace-nowrap flex items-center justify-center font-sans"
                            >
                                {likeNotice}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}
