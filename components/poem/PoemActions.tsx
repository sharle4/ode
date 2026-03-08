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

    // Optimistic Like State
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [optimisticLike, addOptimisticLike] = React.useOptimistic(
        isLiked,
        (state: boolean, newState: boolean) => newState
    );

    const { executeAsync: executeRate } = useAction(ratePoem);
    const { executeAsync: executeLike } = useAction(toggleLike);

    const debouncedToggleLike = useDebouncedCallback(async (liked: boolean) => {
        const result = await executeLike({ poemId, slug, isLiked: liked });
        if (result?.serverError || result?.validationErrors || result?.data?.failure) {
            console.error("Erreur serveur lors du like:", result);
            alert("Une erreur est survenue lors de l'enregistrement de votre like. Veuillez réessayer.");
            // Si erreur, on force potentiellement un re-fetch ou on notifie
        }
    }, 500);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
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
            icon: <Heart size={22} weight={optimisticLike ? "fill" : "regular"} className={optimisticLike ? "text-accent" : "text-charcoal"} />,
            label: "Liker",
            onClick: () => {
                const newValue = !optimisticLike;
                React.startTransition(() => {
                    addOptimisticLike(newValue);
                });
                // Sincéronise le state local réel pour la prochaine transition
                setIsLiked(newValue);

                // Déclenche l'action Serveur dé-bouncée pour protéger la db
                debouncedToggleLike(newValue);
            },
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
                    <div className={`absolute -top-11 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-paper border border-soft-border text-charcoal text-[10px] uppercase tracking-widest rounded shadow-md transition-opacity whitespace-nowrap pointer-events-none flex flex-col items-center ${showShareTooltip ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                        Parcategoryer
                        <div className="absolute -bottom-[5px] w-2 h-2 bg-paper border-b border-r border-soft-border rotate-45" />
                    </div>

                    <AnimatePresence>
                        {showShareTooltip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: 5, x: "-50%" }}
                                className="absolute -top-12 left-1/2 px-3 py-1.5 bg-accent text-white text-[10px] uppercase tracking-widest rounded whitespace-nowrap shadow-md pointer-events-none flex flex-col items-center"
                            >
                                Lien copié !
                                <div className="absolute -bottom-[4px] w-2 h-2 bg-accent rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>
        </div>
    );
}
