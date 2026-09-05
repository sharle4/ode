"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareNetwork } from "@phosphor-icons/react";

interface ShareButtonProps {
    variant?: "default" | "glass";
    ariaLabel?: string;
    className?: string;
    size?: number;
}

export default function ShareButton({
    variant = "default",
    ariaLabel = "Partager",
    className = "",
    size = 20,
}: ShareButtonProps) {
    const [showCopied, setShowCopied] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (typeof window !== "undefined") {
            try {
                await navigator.clipboard.writeText(window.location.href);
            } catch (err) {
                // Fallback for older browsers or restricted contexts
                const input = document.createElement("textarea");
                input.value = window.location.href;
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                document.body.removeChild(input);
            }

            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    const variantClasses =
        variant === "glass"
            ? "bg-black/30 border border-white/20 text-white hover:bg-black/40 hover:border-white/40 backdrop-blur-md"
            : "border border-soft-border text-charcoal hover:bg-black/5 dark:hover:bg-white/5 hover:border-charcoal/30";

    return (
        <div className="relative inline-flex items-center group">
            <motion.button
                onClick={handleShare}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 select-none ${variantClasses} ${className}`}
                aria-label={ariaLabel}
            >
                <ShareNetwork size={size} weight="regular" />
            </motion.button>

            {/* Infobulle standard au hover (masquée lorsque le lien est copié) */}
            <div
                className={`absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-paper dark:bg-zinc-900 border border-soft-border text-charcoal dark:text-cream text-[10px] uppercase tracking-widest rounded shadow-md transition-opacity whitespace-nowrap pointer-events-none flex items-center justify-center z-20 ${
                    showCopied ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                }`}
            >
                Partager
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-paper dark:bg-zinc-900 border-b border-r border-soft-border rotate-45" />
            </div>

            {/* Joli popup animé "Lien copié !" */}
            <AnimatePresence>
                {showCopied && (
                    <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 pointer-events-none z-30">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 3 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 3 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="relative px-2.5 py-1.5 bg-accent text-white text-[10px] uppercase tracking-widest rounded whitespace-nowrap shadow-lg flex items-center justify-center font-medium"
                        >
                            Lien copié !
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rotate-45" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
