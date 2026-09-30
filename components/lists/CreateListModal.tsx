"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkle, Globe, Lock, CircleNotch } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { createListAction } from "@/app/actions/lists";

interface CreateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (result: { listId: string; slug: string; title: string; isPublic?: boolean }) => void;
}

export function CreateListModal({ isOpen, onClose, onSuccess }: CreateListModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isRanked, setIsRanked] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { executeAsync, isExecuting } = useAction(createListAction);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!title.trim()) {
            setErrorMessage("Veuillez saisir un titre pour votre liste.");
            return;
        }

        try {
            const res = await executeAsync({
                title: title.trim(),
                description: description.trim() ? description.trim() : undefined,
                isRanked,
                isPublic,
            });

            if (res?.data?.success && res.data.listId && res.data.slug) {
                // Reset fields
                setTitle("");
                setDescription("");
                setIsRanked(false);
                setIsPublic(true);
                onSuccess?.({
                    listId: res.data.listId,
                    slug: res.data.slug,
                    title: res.data.title || title,
                    isPublic: res.data.isPublic ?? isPublic,
                });
                onClose();
            } else if (res?.data?.failure) {
                setErrorMessage(res.data.failure);
            } else if (res?.serverError) {
                setErrorMessage("Une erreur est survenue lors de la création.");
            }
        } catch (err) {
            console.error("Create list error:", err);
            setErrorMessage("Une erreur inattendue est survenue.");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-lg bg-cream border border-soft-border rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-soft-border/60 mb-6">
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal font-medium">
                                    Nouvelle Liste
                                </h2>
                                <p className="text-xs text-warm-gray font-serif italic mt-0.5">
                                    Créez une anthologie thématique ou un classement personnel.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-soft-border/50 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Error notice */}
                        {errorMessage && (
                            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-serif">
                                {errorMessage}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-medium text-charcoal uppercase tracking-wider mb-1.5">
                                    Titre de la liste <span className="text-accent">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Les poèmes du crépuscule..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-paper border border-soft-border text-charcoal placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-serif text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium text-charcoal uppercase tracking-wider mb-1.5">
                                    Description ou note d'intention
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={1000}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Partagez le fil conducteur de cette sélection..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-paper border border-soft-border text-charcoal placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-serif text-sm resize-none"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3 pt-1">
                                {/* isRanked toggle */}
                                <label className="flex items-start gap-3 p-3 rounded-xl bg-paper/60 border border-soft-border cursor-pointer hover:bg-paper transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isRanked}
                                        onChange={(e) => setIsRanked(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-soft-border text-accent focus:ring-accent cursor-pointer"
                                    />
                                    <div className="text-xs">
                                        <span className="font-medium text-charcoal flex items-center gap-1.5">
                                            <Sparkle size={13} className="text-accent" />
                                            Top classé / ordonné
                                        </span>
                                        <p className="text-warm-gray text-[11px] mt-0.5">
                                            Affiche les rangs 1, 2, 3... Utile pour un classement personnel ordonné.
                                        </p>
                                    </div>
                                </label>

                                {/* isPublic toggle */}
                                <label className="flex items-start gap-3 p-3 rounded-xl bg-paper/60 border border-soft-border cursor-pointer hover:bg-paper transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-soft-border text-accent focus:ring-accent cursor-pointer"
                                    />
                                    <div className="text-xs">
                                        <span className="font-medium text-charcoal flex items-center gap-1.5">
                                            {isPublic ? <Globe size={13} className="text-accent" /> : <Lock size={13} className="text-warm-gray" />}
                                            {isPublic ? "Liste publique" : "Liste privée"}
                                        </span>
                                        <p className="text-warm-gray text-[11px] mt-0.5">
                                            {isPublic
                                                ? "Visible sur votre profil et accessible publiquement via son lien."
                                                : "Vous seul pouvez voir et modifier cette liste."}
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Submit buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-soft-border/60">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-full border border-soft-border text-warm-gray hover:text-charcoal hover:bg-soft-border/30 text-xs font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isExecuting || !title.trim()}
                                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isExecuting ? (
                                        <>
                                            <CircleNotch size={14} className="animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        "Créer la liste"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default CreateListModal;
