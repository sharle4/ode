"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { toggleAuthorLike } from "@/app/actions/poetry";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";

interface AuthorLikeButtonProps {
    authorId: string;
    slug: string;
    initialIsLiked?: boolean;
    initialLikesCount?: number;
    showCount?: boolean;
    className?: string;
}

export default function AuthorLikeButton({
    authorId,
    slug,
    initialIsLiked = false,
    initialLikesCount = 0,
    showCount = true,
    className = "",
}: AuthorLikeButtonProps) {
    const router = useRouter();

    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [showTooltip, setShowTooltip] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { executeAsync } = useAction(toggleAuthorLike);

    const debouncedToggle = useDebouncedCallback(async (targetState: boolean) => {
        try {
            const result = await executeAsync({ authorId, slug, targetState });

            if (result?.serverError) {
                if (result.serverError.includes("connecté")) {
                    setErrorMessage("Connexion requise");
                    setTimeout(() => router.push("/login"), 1200);
                } else {
                    setErrorMessage(result.serverError);
                    setTimeout(() => setErrorMessage(null), 3000);
                }
                // Rollback on error
                setIsLiked(!targetState);
                setLikesCount((prev) => targetState ? Math.max(0, prev - 1) : prev + 1);
            } else if (result?.data?.success) {
                if (typeof result.data.likesCount === "number") {
                    setLikesCount(result.data.likesCount);
                }
            }
        } catch (error) {
            console.error("Erreur toggleAuthorLike:", error);
            setIsLiked(!targetState);
            setLikesCount((prev) => targetState ? Math.max(0, prev - 1) : prev + 1);
        }
    }, 250);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !isLiked;
        const newCount = newState ? likesCount + 1 : Math.max(0, likesCount - 1);
        setIsLiked(newState); // True 0ms instant visual feedback
        setLikesCount(newCount);

        debouncedToggle(newState);
    };

    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <motion.button
                type="button"
                onClick={handleClick}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`flex items-center justify-center gap-2 h-11 px-4 rounded-full backdrop-blur-md transition-all duration-200 select-none shadow-md border ${
                    isLiked
                        ? "bg-accent/20 border-accent/60 text-white shadow-accent/20"
                        : "bg-black/30 border-white/20 text-white/90 hover:bg-black/40 hover:border-white/40"
                }`}
                aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
                <motion.div
                    animate={
                        isLiked
                            ? { scale: [1, 1.35, 1], rotate: [0, -10, 10, 0] }
                            : { scale: 1 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <Heart
                        size={20}
                        weight={isLiked ? "fill" : "regular"}
                        className={isLiked ? "text-accent fill-accent" : "text-white"}
                    />
                </motion.div>

                <span className="text-xs font-medium font-sans tracking-wide">
                    {isLiked ? "Favori" : "Aimer"}
                </span>

                {showCount && likesCount > 0 && (
                    <span className="text-[11px] font-sans font-medium px-1.5 py-0.5 rounded-full bg-white/15 text-white">
                        {likesCount}
                    </span>
                )}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && !errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-charcoal text-white text-[10px] uppercase tracking-wider rounded shadow-md pointer-events-none whitespace-nowrap z-30"
                    >
                        {isLiked ? "Auteur dans vos favoris" : "Aimer cet auteur"}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600 text-white text-[11px] rounded-md shadow-lg pointer-events-none whitespace-nowrap z-40 font-sans"
                    >
                        {errorMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
