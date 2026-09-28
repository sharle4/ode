"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Plus,
    Check,
    Lock,
    Sparkle,
    CircleNotch,
    BookmarkSimple,
    SignIn
} from "@phosphor-icons/react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import {
    fetchUserListsWithPoemStatusAction,
    addPoemToListAction,
    removePoemFromListAction,
    createListAction
} from "@/app/actions/lists";

interface AddToListModalProps {
    poemId: string;
    poemTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

interface ListStatusItem {
    id: string;
    title: string;
    slug: string;
    is_public: boolean;
    is_ranked: boolean;
    poems_count: number;
    containsPoem: boolean;
}

export function AddToListModal({
    poemId,
    poemTitle,
    isOpen,
    onClose,
}: AddToListModalProps) {
    const [lists, setLists] = useState<ListStatusItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotAuthenticated, setIsNotAuthenticated] = useState(false);
    const [showNewListForm, setShowNewListForm] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [isNewListRanked, setIsNewListRanked] = useState(false);
    const [poemNote, setPoemNote] = useState("");
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const { executeAsync: fetchStatus } = useAction(fetchUserListsWithPoemStatusAction);
    const { executeAsync: addPoem } = useAction(addPoemToListAction);
    const { executeAsync: removePoem } = useAction(removePoemFromListAction);
    const { executeAsync: createList } = useAction(createListAction);

    // Fetch lists when modal opens
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setIsLoading(true);
        setIsNotAuthenticated(false);
        setNotice(null);

        fetchStatus({ poemId })
            .then((res) => {
                if (!isMounted) return;
                if (res?.serverError?.includes("connecté") || res?.serverError?.includes("auth")) {
                    setIsNotAuthenticated(true);
                } else if (res?.data?.lists) {
                    setLists(res.data.lists);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch lists status:", err);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, poemId]);

    const handleToggleList = async (list: ListStatusItem) => {
        const nextState = !list.containsPoem;

        // Instant Optimistic Update
        setLists((prev) =>
            prev.map((item) =>
                item.id === list.id
                    ? {
                          ...item,
                          containsPoem: nextState,
                          poems_count: nextState ? item.poems_count + 1 : Math.max(0, item.poems_count - 1),
                      }
                    : item
            )
        );

        try {
            if (nextState) {
                const res = await addPoem({
                    listId: list.id,
                    poemId,
                    notes: poemNote.trim() ? poemNote.trim() : undefined,
                });
                if (res?.data?.success) {
                    setNotice(`Ajouté à "${list.title}"`);
                    setTimeout(() => setNotice(null), 2500);
                } else {
                    // Rollback
                    revertListState(list.id, !nextState);
                }
            } else {
                const res = await removePoem({ listId: list.id, poemId });
                if (res?.data?.success) {
                    setNotice(`Retiré de "${list.title}"`);
                    setTimeout(() => setNotice(null), 2500);
                } else {
                    // Rollback
                    revertListState(list.id, !nextState);
                }
            }
        } catch (err) {
            console.error("Toggle poem list error:", err);
            revertListState(list.id, !nextState);
        }
    };

    const revertListState = (listId: string, prevState: boolean) => {
        setLists((prev) =>
            prev.map((item) =>
                item.id === listId
                    ? {
                          ...item,
                          containsPoem: prevState,
                          poems_count: prevState ? item.poems_count + 1 : Math.max(0, item.poems_count - 1),
                      }
                    : item
            )
        );
    };

    const handleCreateAndAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;

        setIsCreatingList(true);
        try {
            // 1. Create list
            const createRes = await createList({
                title: newListTitle.trim(),
                isRanked: isNewListRanked,
                isPublic: true,
            });

            if (createRes?.data?.success && createRes.data.listId) {
                const newListId = createRes.data.listId;
                const newSlug = createRes.data.slug;

                // 2. Add poem to new list
                await addPoem({
                    listId: newListId,
                    poemId,
                    notes: poemNote.trim() ? poemNote.trim() : undefined,
                });

                // 3. Update local state
                const newItem: ListStatusItem = {
                    id: newListId,
                    title: newListTitle.trim(),
                    slug: newSlug || "",
                    is_public: true,
                    is_ranked: isNewListRanked,
                    poems_count: 1,
                    containsPoem: true,
                };
                setLists((prev) => [newItem, ...prev]);

                // Reset creation form
                setNewListTitle("");
                setIsNewListRanked(false);
                setShowNewListForm(false);
                setNotice(`Liste créée et poème ajouté !`);
                setTimeout(() => setNotice(null), 2500);
            }
        } catch (err) {
            console.error("Error creating and adding poem:", err);
        } finally {
            setIsCreatingList(false);
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
                        className="relative w-full max-w-md bg-cream border border-soft-border rounded-3xl shadow-2xl p-6 z-10 overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-soft-border/60 mb-4 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                    <BookmarkSimple size={18} weight="fill" />
                                </div>
                                <div>
                                    <h2 className="font-serif text-lg text-charcoal font-medium">
                                        Ajouter à une liste
                                    </h2>
                                    <p className="text-xs text-warm-gray font-serif italic line-clamp-1 max-w-[260px]">
                                        {poemTitle}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-soft-border/50 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Temporary Feedback Notification */}
                        {notice && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-3 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-serif text-center"
                            >
                                {notice}
                            </motion.div>
                        )}

                        {/* Modal Body */}
                        <div className="flex-grow overflow-y-auto space-y-2 pr-1 min-h-[160px]">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-warm-gray gap-2">
                                    <CircleNotch size={24} className="animate-spin text-accent" />
                                    <span className="text-xs font-serif italic">Chargement de vos listes...</span>
                                </div>
                            ) : isNotAuthenticated ? (
                                <div className="text-center py-8 px-4 flex flex-col items-center">
                                    <p className="text-sm font-serif text-charcoal mb-4">
                                        Connectez-vous pour organiser vos poèmes favoris en listes personnalisées.
                                    </p>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-xs"
                                    >
                                        <SignIn size={14} />
                                        Se connecter
                                    </Link>
                                </div>
                            ) : lists.length === 0 && !showNewListForm ? (
                                <div className="text-center py-8 text-warm-gray">
                                    <p className="text-xs font-serif italic mb-3">
                                        Vous n'avez pas encore créé de liste.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewListForm(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-serif hover:bg-accent/20 transition-colors"
                                    >
                                        <Plus size={14} />
                                        Créer ma première liste
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {lists.map((list) => (
                                        <button
                                            key={list.id}
                                            type="button"
                                            onClick={() => handleToggleList(list)}
                                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left group ${
                                                list.containsPoem
                                                    ? "bg-accent/5 border-accent/30 text-charcoal"
                                                    : "bg-paper/60 hover:bg-paper border-soft-border/70 text-charcoal"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                {/* Checkbox badge */}
                                                <div
                                                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                                                        list.containsPoem
                                                            ? "bg-accent text-white shadow-xs"
                                                            : "border border-soft-border bg-white/70 group-hover:border-accent/40"
                                                    }`}
                                                >
                                                    {list.containsPoem && <Check size={12} weight="bold" />}
                                                </div>

                                                <div className="min-w-0">
                                                    <span className="font-serif text-sm font-medium block truncate">
                                                        {list.title}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[11px] text-warm-gray">
                                                        <span>{list.poems_count} poème(s)</span>
                                                        {list.is_ranked && (
                                                            <span className="inline-flex items-center gap-0.5 text-accent text-[10px]">
                                                                <Sparkle size={9} weight="fill" />
                                                                Top
                                                            </span>
                                                        )}
                                                        {!list.is_public && (
                                                            <span className="inline-flex items-center gap-0.5 text-warm-gray text-[10px]">
                                                                <Lock size={9} />
                                                                Privée
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Inline New List Form */}
                            {showNewListForm && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    onSubmit={handleCreateAndAdd}
                                    className="p-3.5 rounded-2xl bg-paper border border-accent/20 mt-3 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-serif font-medium text-charcoal">
                                            Nouvelle liste
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewListForm(false)}
                                            className="text-xs text-warm-gray hover:text-charcoal"
                                        >
                                            Annuler
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                        placeholder="Nom de votre liste..."
                                        className="w-full px-3 py-2 rounded-xl bg-cream border border-soft-border text-xs font-serif text-charcoal placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent"
                                        autoFocus
                                    />

                                    <label className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isNewListRanked}
                                            onChange={(e) => setIsNewListRanked(e.target.checked)}
                                            className="h-3.5 w-3.5 rounded border-soft-border text-accent focus:ring-accent"
                                        />
                                        <span className="text-[11px] font-serif">
                                            Top classé (avec numéros 1, 2, 3...)
                                        </span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={isCreatingList || !newListTitle.trim()}
                                        className="w-full py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    >
                                        {isCreatingList ? (
                                            <>
                                                <CircleNotch size={12} className="animate-spin" />
                                                Création...
                                            </>
                                        ) : (
                                            "Créer et ajouter ce poème"
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </div>

                        {/* Optional Curator Note on Poem */}
                        {!isNotAuthenticated && lists.length > 0 && (
                            <div className="pt-3 border-t border-soft-border/50 mt-2 flex-shrink-0">
                                <label className="block text-[11px] font-medium text-warm-gray font-serif mb-1">
                                    Note personnelle sur ce poème (optionnelle) :
                                </label>
                                <input
                                    type="text"
                                    maxLength={250}
                                    value={poemNote}
                                    onChange={(e) => setPoemNote(e.target.value)}
                                    placeholder="Ex: Mon vers préféré, ou souvenir de lecture..."
                                    className="w-full px-3 py-1.5 rounded-xl bg-paper border border-soft-border text-xs font-serif text-charcoal placeholder:text-warm-gray/40 focus:outline-hidden focus:border-accent"
                                />
                            </div>
                        )}

                        {/* Footer Controls */}
                        {!isNotAuthenticated && !showNewListForm && lists.length > 0 && (
                            <div className="pt-3 flex items-center justify-between border-t border-soft-border/60 mt-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowNewListForm(true)}
                                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-serif font-medium transition-colors"
                                >
                                    <Plus size={13} />
                                    Créer une autre liste
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-1.5 rounded-full bg-soft-border/40 hover:bg-soft-border text-charcoal text-xs font-medium transition-colors"
                                >
                                    Terminer
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default AddToListModal;
