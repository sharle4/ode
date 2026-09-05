"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { toggleCollectionLike } from "@/app/actions/poetry";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";

interface CollectionLikeButtonProps {
    collectionId: string;
    slug: string;
    initialIsLiked?: boolean;
    initialLikesCount?: number;
    showCount?: boolean;
    className?: string;
}

export default function CollectionLikeButton({
    collectionId,
    slug,
    initialIsLiked = false,
    initialLikesCount = 0,
    showCount = true,
    className = "",
}: CollectionLikeButtonProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [showTooltip, setShowTooltip] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [optimisticLike, setOptimisticLike] = React.useOptimistic(
        { isLiked, count: likesCount },
        (state, newLiked: boolean) => ({
            isLiked: newLiked,
            count: newLiked ? state.count + 1 : Math.max(0, state.count - 1),
        })
    );

    const { executeAsync } = useAction(toggleCollectionLike);

    const debouncedToggle = useDebouncedCallback(async (targetState: boolean) => {
        try {
            const result = await executeAsync({ collectionId, slug, targetState });

            if (result?.serverError) {
                if (result.serverError.includes("connecté")) {
                    setErrorMessage("Connexion requise");
                    setTimeout(() => router.push("/login"), 1200);
                } else {
                    setErrorMessage(result.serverError);
                    setTimeout(() => setErrorMessage(null), 3000);
                }
                // Revert
                setIsLiked(!targetState);
            } else if (result?.data?.success) {
                setIsLiked(targetState);
                if (typeof result.data.likesCount === "number") {
                    setLikesCount(result.data.likesCount);
                }
            }
        } catch (error) {
            console.error("Erreur toggleCollectionLike:", error);
            setIsLiked(!targetState);
        }
    }, 400);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !optimisticLike.isLiked;
        startTransition(() => {
            setOptimisticLike(newState);
        });

        debouncedToggle(newState);
    };

    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <motion.button
                onClick={handleClick}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-full border transition-all duration-200 select-none ${
                    optimisticLike.isLiked
                        ? "border-accent/40 bg-accent/10 text-accent shadow-sm"
                        : "border-soft-border text-charcoal hover:bg-black/5 dark:hover:bg-white/5 hover:border-charcoal/30"
                }`}
                aria-label={optimisticLike.isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
                <motion.div
                    animate={
                        optimisticLike.isLiked
                            ? { scale: [1, 1.35, 1], rotate: [0, -10, 10, 0] }
                            : { scale: 1 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <Heart
                        size={20}
                        weight={optimisticLike.isLiked ? "fill" : "regular"}
                        className={optimisticLike.isLiked ? "text-accent" : "text-charcoal"}
                    />
                </motion.div>

                {showCount && optimisticLike.count > 0 && (
                    <span className="text-xs font-sans font-medium tracking-wide">
                        {optimisticLike.count}
                    </span>
                )}
            </motion.button>

            {/* Tooltip standard */}
            <AnimatePresence>
                {showTooltip && !errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-charcoal text-white text-[10px] uppercase tracking-wider rounded shadow-md pointer-events-none whitespace-nowrap z-30"
                    >
                        {optimisticLike.isLiked ? "Coup de cœur !" : "Aimer ce recueil"}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error / Auth banner */}
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
