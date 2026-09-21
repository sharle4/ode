"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ShareNetwork,
    Copy,
    DownloadSimple,
    LinkSimple,
    Check,
    CircleNotch,
} from "@phosphor-icons/react";
import { usePoemShare } from "./PoemShareContext";
import PoemCardPreview from "./PoemCardPreview";
import {
    generatePoemCardBlob,
    downloadPoemCard,
    copyPoemCardToClipboard,
    sharePoemCardNative,
} from "./card-generator";

export default function PoemShareModal() {
    const shareContext = usePoemShare();
    if (!shareContext) return null;
    return <PoemShareModalInner context={shareContext} />;
}

function PoemShareModalInner({
    context,
}: {
    context: NonNullable<ReturnType<typeof usePoemShare>>;
}) {
    const {
        isOpen,
        closeShare,
        activeVerses,
        isCustomSelection,
        poem,
        getShareUrl,
    } = context;

    const [isGenerating, setIsGenerating] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [hasNativeShare, setHasNativeShare] = useState(false);

    // Détection appareil mobile et capacité de partage natif
    useEffect(() => {
        const updateDevice = () => {
            if (typeof window === "undefined") return;
            const userAgent = navigator.userAgent || "";
            const isMobile = /android|iphone|ipad|ipod/i.test(userAgent) || window.innerWidth < 768;
            setIsMobileDevice(isMobile);
            setHasNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
        };
        updateDevice();
        window.addEventListener("resize", updateDevice);
        return () => window.removeEventListener("resize", updateDevice);
    }, []);

    // Fermeture avec la touche Échap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                closeShare();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeShare]);

    const showFeedback = (message: string) => {
        setStatusFeedback(message);
        setTimeout(() => setStatusFeedback(null), 2500);
    };

    if (!poem) return null;

    // 1. Partage natif (Mobile ou Web Share API)
    const handleNativeShare = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const url = getShareUrl();
            const blob = await generatePoemCardBlob({
                title: poem.title,
                authorName: poem.authorName,
                verses: activeVerses,
                collectionTitle: poem.collectionTitle,
                publicationYear: poem.publicationYear,
                url,
            });

            const shared = await sharePoemCardNative(blob, poem.title, url);
            if (!shared) {
                // Repli si le partage natif n'a pas abouti : copie de l'image ou lien
                const copied = await copyPoemCardToClipboard(blob);
                if (copied) {
                    showFeedback("Image copiée dans le presse-papiers !");
                } else {
                    downloadPoemCard(blob, `${poem.authorName}-${poem.title}-ode.png`);
                    showFeedback("Image téléchargée !");
                }
            }
        } catch (err) {
            console.error("Erreur partage natif:", err);
            showFeedback("Erreur lors de la génération");
        } finally {
            setIsGenerating(false);
        }
    };

    // 2. Copier l'image PNG dans le presse-papiers (Desktop / Rapide)
    const handleCopyImage = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const blob = await generatePoemCardBlob({
                title: poem.title,
                authorName: poem.authorName,
                verses: activeVerses,
                collectionTitle: poem.collectionTitle,
                publicationYear: poem.publicationYear,
                url: getShareUrl(),
            });

            const success = await copyPoemCardToClipboard(blob);
            if (success) {
                showFeedback("Image copiée ! (Prête à coller)");
            } else {
                // Si l'accès presse-papier image est bloqué, on télécharge le PNG
                downloadPoemCard(blob, `${poem.authorName}-${poem.title}-ode.png`);
                showFeedback("Image téléchargée (accès presse-papier restreint)");
            }
        } catch (err) {
            console.error("Erreur copie image:", err);
            showFeedback("Erreur de copie");
        } finally {
            setIsGenerating(false);
        }
    };

    // 3. Télécharger le fichier PNG
    const handleDownload = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const blob = await generatePoemCardBlob({
                title: poem.title,
                authorName: poem.authorName,
                verses: activeVerses,
                collectionTitle: poem.collectionTitle,
                publicationYear: poem.publicationYear,
                url: getShareUrl(),
            });

            downloadPoemCard(blob, `${poem.authorName}-${poem.title}-ode.png`);
            showFeedback("Image téléchargée !");
        } catch (err) {
            console.error("Erreur téléchargement image:", err);
            showFeedback("Erreur de téléchargement");
        } finally {
            setIsGenerating(false);
        }
    };

    // 4. Copier uniquement le lien avec tracking UTM
    const handleCopyLink = () => {
        const url = getShareUrl();
        navigator.clipboard.writeText(url);
        showFeedback("Lien copié dans le presse-papiers !");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
                    {/* Arrière-plan flouté */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeShare}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Conteneur de la Modale */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="relative z-10 w-full max-w-lg bg-[#FAF8F5] dark:bg-[#18181b] border border-soft-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                    >
                        {/* En-tête de la Modale */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-soft-border/80">
                            <span className="font-serif font-semibold text-base sm:text-lg text-charcoal">
                                Partager la carte poétique
                            </span>

                            <button
                                type="button"
                                onClick={closeShare}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                aria-label="Fermer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Corps : Aperçu de la carte */}
                        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center bg-[#F3EFE6]/40 dark:bg-black/20">
                            <PoemCardPreview
                                title={poem.title}
                                authorName={poem.authorName}
                                verses={activeVerses}
                                collectionTitle={poem.collectionTitle}
                                publicationYear={poem.publicationYear}
                            />
                        </div>

                        {/* Barre d'actions épurée */}
                        <div className="p-4 sm:p-5 border-t border-soft-border/80 bg-paper/60 flex flex-col gap-3">
                            {/* Actions principales */}
                            <div className="flex items-center gap-2.5">
                                {isMobileDevice ? (
                                    /* Action Reine sur Mobile : Partage Natif + Télécharger */
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleNativeShare}
                                            disabled={isGenerating}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#2C2C2B] dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-sans text-sm font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
                                        >
                                            {isGenerating ? (
                                                <CircleNotch size={18} className="animate-spin" />
                                            ) : (
                                                <ShareNetwork size={18} weight="bold" />
                                            )}
                                            <span>Partager</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            disabled={isGenerating}
                                            title="Télécharger l'image PNG"
                                            className="flex items-center justify-center w-10 h-10 rounded-xl border border-soft-border bg-paper hover:bg-black/5 dark:hover:bg-white/5 text-charcoal transition-colors active:scale-[0.98]"
                                        >
                                            <DownloadSimple size={18} />
                                        </button>
                                    </>
                                ) : (
                                    /* Actions sur Desktop : Copier Image + Télécharger */
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCopyImage}
                                            disabled={isGenerating}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#2C2C2B] dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-sans text-sm font-medium transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
                                        >
                                            {isGenerating ? (
                                                <CircleNotch size={17} className="animate-spin" />
                                            ) : (
                                                <Copy size={17} weight="bold" />
                                            )}
                                            <span>Copier l'image</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            disabled={isGenerating}
                                            title="Télécharger l'image PNG en haute résolution"
                                            className="flex items-center justify-center w-10 h-10 rounded-xl border border-soft-border bg-paper hover:bg-black/5 dark:hover:bg-white/5 text-charcoal transition-colors active:scale-[0.98]"
                                        >
                                            <DownloadSimple size={18} />
                                        </button>
                                    </>
                                )}

                                {/* Bouton Copier le lien (Toujours accessible et rapide) */}
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    title="Copier le lien du poème"
                                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-soft-border bg-paper hover:bg-black/5 dark:hover:bg-white/5 text-charcoal font-sans text-xs font-medium transition-colors active:scale-[0.98] ${
                                        isMobileDevice ? "w-auto" : ""
                                    }`}
                                >
                                    <LinkSimple size={16} />
                                    <span>Lien</span>
                                </button>
                            </div>

                            {/* Toast / Message de statut */}
                            <AnimatePresence>
                                {statusFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center justify-center gap-1.5 text-xs text-[#B85450] font-sans font-medium text-center"
                                    >
                                        <Check size={14} weight="bold" />
                                        <span>{statusFeedback}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
