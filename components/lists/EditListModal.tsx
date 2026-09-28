"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkle, Globe, Lock, Trash, CircleNotch, Warning } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { updateListAction, deleteListAction } from "@/app/actions/lists";
import { UserList } from "@/types";

interface EditListModalProps {
    isOpen: boolean;
    onClose: () => void;
    list: UserList;
    onUpdated?: (data: { title: string; description?: string | null; isPublic: boolean; isRanked: boolean }) => void;
    onDeleted?: () => void;
}

export function EditListModal({
    isOpen,
    onClose,
    list,
    onUpdated,
    onDeleted,
}: EditListModalProps) {
    const [title, setTitle] = useState(list.title);
    const [description, setDescription] = useState(list.description || "");
    const [isRanked, setIsRanked] = useState(list.is_ranked);
    const [isPublic, setIsPublic] = useState(list.is_public);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { executeAsync: executeUpdate, isExecuting: isUpdating } = useAction(updateListAction);
    const { executeAsync: executeDelete, isExecuting: isDeleting } = useAction(deleteListAction);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!title.trim()) {
            setErrorMessage("Le titre de la liste ne peut pas être vide.");
            return;
        }

        try {
            const res = await executeUpdate({
                listId: list.id,
                title: title.trim(),
                description: description.trim() ? description.trim() : null,
                isRanked,
                isPublic,
            });

            if (res?.data?.success) {
                onUpdated?.({
                    title: title.trim(),
                    description: description.trim() || null,
                    isRanked,
                    isPublic,
                });
                onClose();
            } else if (res?.data?.failure) {
                setErrorMessage(res.data.failure);
            }
        } catch (err) {
            console.error("Update list error:", err);
            setErrorMessage("Erreur lors de la modification de la liste.");
        }
    };

    const handleDelete = async () => {
        setErrorMessage(null);
        try {
            const res = await executeDelete({ listId: list.id });
            if (res?.data?.success) {
                onDeleted?.();
                onClose();
            } else if (res?.data?.failure) {
                setErrorMessage(res.data.failure);
            }
        } catch (err) {
            console.error("Delete list error:", err);
            setErrorMessage("Erreur lors de la suppression de la liste.");
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
                                    Paramètres de la Liste
                                </h2>
                                <p className="text-xs text-warm-gray font-serif italic mt-0.5">
                                    Modifiez les détails ou la visibilité de votre liste.
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
                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-medium text-charcoal uppercase tracking-wider mb-1.5">
                                    Titre de la liste
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-paper border border-soft-border text-charcoal placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-serif text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium text-charcoal uppercase tracking-wider mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={1000}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-paper border border-soft-border text-charcoal placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-serif text-sm resize-none"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="space-y-2.5 pt-1">
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
                                            Affiche les numéros 1, 2, 3... devant chaque poème.
                                        </p>
                                    </div>
                                </label>

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
                                                ? "Visible sur votre profil et accessible à tous via l'URL."
                                                : "Visible uniquement par vous."}
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-soft-border/60">
                                {/* Delete button */}
                                {!confirmDelete ? (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete(true)}
                                        className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:underline transition-colors"
                                    >
                                        <Trash size={14} />
                                        Supprimer la liste
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={handleDelete}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
                                        >
                                            {isDeleting ? <CircleNotch size={12} className="animate-spin" /> : <Warning size={12} />}
                                            Confirmer la suppression
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete(false)}
                                            className="text-xs text-warm-gray hover:text-charcoal"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                )}

                                {/* Save changes */}
                                <div className="flex items-center gap-2 ml-auto">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-full border border-soft-border text-warm-gray hover:text-charcoal text-xs font-medium"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating || !title.trim()}
                                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <CircleNotch size={14} className="animate-spin" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            "Enregistrer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default EditListModal;
