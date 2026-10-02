"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Plus,
    Check,
    Lock,
    Globe,
    Sparkle,
    CircleNotch,
    BookmarkSimple,
    SignIn,
    MagnifyingGlass,
    NotePencil,
    ArrowLeft,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import {
    fetchUserListsWithPoemStatusAction,
    addPoemToListAction,
    removePoemFromListAction,
    createListAction,
    updateListItemNotesAction,
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
    notes?: string | null;
}

type ModalView = "list" | "create";

export function AddToListModal({
    poemId,
    poemTitle,
    isOpen,
    onClose,
}: AddToListModalProps) {
    const [mounted, setMounted] = useState(false);
    const [view, setView] = useState<ModalView>("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [lists, setLists] = useState<ListStatusItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotAuthenticated, setIsNotAuthenticated] = useState(false);
    const [notice, setNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

    // Per-list inline note editing
    const [editingNoteListId, setEditingNoteListId] = useState<string | null>(null);
    const [editingNoteText, setEditingNoteText] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Create list form state
    const [newListTitle, setNewListTitle] = useState("");
    const [newListDescription, setNewListDescription] = useState("");
    const [isNewListRanked, setIsNewListRanked] = useState(false);
    const [isNewListPublic, setIsNewListPublic] = useState(true);
    const [addPoemToNewList, setAddPoemToNewList] = useState(true);
    const [newPoemNote, setNewPoemNote] = useState("");
    const [isCreatingList, setIsCreatingList] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const { executeAsync: fetchStatus } = useAction(fetchUserListsWithPoemStatusAction);
    const { executeAsync: addPoem } = useAction(addPoemToListAction);
    const { executeAsync: removePoem } = useAction(removePoemFromListAction);
    const { executeAsync: createList } = useAction(createListAction);
    const { executeAsync: updateNote } = useAction(updateListItemNotesAction);

    // Client mount state for createPortal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Body scroll lock & Escape key handling
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Fetch lists when modal opens
    useEffect(() => {
        if (!isOpen) {
            // Reset view state when closed
            setView("list");
            setSearchQuery("");
            setEditingNoteListId(null);
            setNotice(null);
            return;
        }

        let isSubscribed = true;
        setIsLoading(true);
        setIsNotAuthenticated(false);

        fetchStatus({ poemId })
            .then((res) => {
                if (!isSubscribed) return;
                if (res?.serverError?.includes("connecté") || res?.serverError?.includes("auth")) {
                    setIsNotAuthenticated(true);
                } else if (res?.data?.lists) {
                    setLists(res.data.lists as ListStatusItem[]);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch lists status:", err);
            })
            .finally(() => {
                if (isSubscribed) setIsLoading(false);
            });

        return () => {
            isSubscribed = false;
        };
    }, [isOpen, poemId]);

    // Notice auto-dismiss
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => {
            setNotice(null);
        }, 2800);
        return () => clearTimeout(timer);
    }, [notice]);

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

        // If untoggling and note editor was open for this list, collapse it
        if (!nextState && editingNoteListId === list.id) {
            setEditingNoteListId(null);
            setEditingNoteText("");
        }

        try {
            if (nextState) {
                const res = await addPoem({
                    listId: list.id,
                    poemId,
                    notes: list.notes || undefined,
                });
                if (res?.data?.success) {
                    setNotice({ text: `Ajouté à « ${list.title} »`, type: "success" });
                } else {
                    revertListState(list.id, !nextState);
                    setNotice({ text: res?.data?.failure || "Erreur lors de l'ajout", type: "error" });
                }
            } else {
                const res = await removePoem({ listId: list.id, poemId });
                if (res?.data?.success) {
                    setNotice({ text: `Retiré de « ${list.title} »`, type: "info" });
                } else {
                    revertListState(list.id, !nextState);
                    setNotice({ text: res?.data?.failure || "Erreur lors du retrait", type: "error" });
                }
            }
        } catch (err) {
            console.error("Toggle poem list error:", err);
            revertListState(list.id, !nextState);
            setNotice({ text: "Une erreur inattendue est survenue", type: "error" });
        }
    };

    const handleOpenNoteEditor = (e: React.MouseEvent, list: ListStatusItem) => {
        e.stopPropagation();
        if (editingNoteListId === list.id) {
            setEditingNoteListId(null);
            setEditingNoteText("");
        } else {
            setEditingNoteListId(list.id);
            setEditingNoteText(list.notes || "");
        }
    };

    const handleSaveNote = async (listId: string) => {
        setIsSavingNote(true);
        const trimmedNote = editingNoteText.trim() ? editingNoteText.trim() : null;

        try {
            const res = await updateNote({
                listId,
                poemId,
                notes: trimmedNote,
            });

            if (res?.data?.success) {
                setLists((prev) =>
                    prev.map((item) =>
                        item.id === listId
                            ? { ...item, notes: trimmedNote }
                            : item
                    )
                );
                setEditingNoteListId(null);
                setNotice({
                    text: trimmedNote ? "Note enregistrée avec succès !" : "Note supprimée",
                    type: "success",
                });
            } else {
                setNotice({
                    text: res?.data?.failure || "Impossible d'enregistrer la note",
                    type: "error",
                });
            }
        } catch (err) {
            console.error("Save note error:", err);
            setNotice({ text: "Erreur lors de l'enregistrement de la note", type: "error" });
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;

        setIsCreatingList(true);
        try {
            // 1. Create list
            const createRes = await createList({
                title: newListTitle.trim(),
                description: newListDescription.trim() ? newListDescription.trim() : undefined,
                isRanked: isNewListRanked,
                isPublic: isNewListPublic,
            });

            if (createRes?.data?.success && createRes.data.listId) {
                const newListId = createRes.data.listId;
                const newSlug = createRes.data.slug || "";
                const noteVal = newPoemNote.trim() ? newPoemNote.trim() : null;

                // 2. Add poem to new list if requested
                if (addPoemToNewList) {
                    await addPoem({
                        listId: newListId,
                        poemId,
                        notes: noteVal || undefined,
                    });
                }

                // 3. Update local state
                const newItem: ListStatusItem = {
                    id: newListId,
                    title: newListTitle.trim(),
                    slug: newSlug,
                    is_public: isNewListPublic,
                    is_ranked: isNewListRanked,
                    poems_count: addPoemToNewList ? 1 : 0,
                    containsPoem: addPoemToNewList,
                    notes: addPoemToNewList ? noteVal : null,
                };

                setLists((prev) => [newItem, ...prev]);

                // Reset form
                setNewListTitle("");
                setNewListDescription("");
                setIsNewListRanked(false);
                setIsNewListPublic(true);
                setAddPoemToNewList(true);
                setNewPoemNote("");
                setView("list");

                setNotice({
                    text: addPoemToNewList
                        ? `Liste « ${newItem.title} » créée et poème ajouté !`
                        : `Liste « ${newItem.title} » créée !`,
                    type: "success",
                });
            } else {
                setNotice({
                    text: createRes?.data?.failure || "Impossible de créer la liste",
                    type: "error",
                });
            }
        } catch (err) {
            console.error("Create list error:", err);
            setNotice({ text: "Erreur lors de la création de la liste", type: "error" });
        } finally {
            setIsCreatingList(false);
        }
    };

    const filteredLists = lists.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Fullscreen Blurred Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-charcoal/50 dark:bg-black/70 backdrop-blur-xs"
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 14 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="relative w-full max-w-md bg-cream dark:bg-[#18181b] border border-soft-border dark:border-zinc-800 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[88vh]"
                    >
                        {/* Notice Banner */}
                        <AnimatePresence>
                            {notice && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full text-xs font-serif font-medium shadow-md border flex items-center gap-1.5 whitespace-nowrap pointer-events-none ${
                                        notice.type === "success"
                                            ? "bg-accent text-white border-accent/30"
                                            : notice.type === "error"
                                            ? "bg-red-600 text-white border-red-700"
                                            : "bg-paper dark:bg-zinc-800 text-charcoal dark:text-zinc-200 border-soft-border dark:border-zinc-700"
                                    }`}
                                >
                                    {notice.type === "success" && <Check size={12} weight="bold" />}
                                    <span>{notice.text}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* View 1: List selection & Search */}
                        {view === "list" ? (
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-soft-border/60 dark:border-zinc-800 flex-shrink-0">
                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                                            <BookmarkSimple size={18} weight="fill" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="font-serif text-base sm:text-lg text-charcoal dark:text-zinc-100 font-medium leading-snug">
                                                Ajouter à une liste
                                            </h2>
                                            <p className="text-xs text-warm-gray dark:text-zinc-400 font-serif italic truncate">
                                                {poemTitle}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-warm-gray hover:text-charcoal dark:hover:text-zinc-200 hover:bg-soft-border/40 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                                        aria-label="Fermer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Search Bar & Quick Create Button */}
                                {!isNotAuthenticated && lists.length > 0 && (
                                    <div className="px-5 pt-3 pb-2 flex items-center gap-2 flex-shrink-0">
                                        <div className="relative flex-grow">
                                            <MagnifyingGlass
                                                size={15}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none"
                                            />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Rechercher une liste..."
                                                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-paper dark:bg-zinc-900 border border-soft-border dark:border-zinc-800 text-xs font-serif text-charcoal dark:text-zinc-200 placeholder:text-warm-gray/60 focus:outline-hidden focus:border-accent"
                                            />
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchQuery("")}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewListTitle("");
                                                setView("create");
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 text-xs font-serif font-medium transition-colors whitespace-nowrap flex-shrink-0"
                                        >
                                            <Plus size={13} weight="bold" />
                                            <span>Nouvelle</span>
                                        </button>
                                    </div>
                                )}

                                {/* Lists Scroll Container */}
                                <div className="flex-grow overflow-y-auto px-5 py-2 space-y-2 min-h-[180px]">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-14 text-warm-gray gap-2">
                                            <CircleNotch size={24} className="animate-spin text-accent" />
                                            <span className="text-xs font-serif italic">Chargement de vos listes...</span>
                                        </div>
                                    ) : isNotAuthenticated ? (
                                        <div className="text-center py-10 px-4 flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
                                                <BookmarkSimple size={24} weight="regular" />
                                            </div>
                                            <h3 className="font-serif text-charcoal dark:text-zinc-100 font-medium text-sm mb-1.5">
                                                Enregistrez vos poèmes favoris
                                            </h3>
                                            <p className="text-xs font-serif text-warm-gray dark:text-zinc-400 mb-5 max-w-[260px] leading-relaxed">
                                                Connectez-vous pour composer vos propres listes et anthologies poétiques.
                                            </p>
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-xs"
                                            >
                                                <SignIn size={14} />
                                                Se connecter
                                            </Link>
                                        </div>
                                    ) : lists.length === 0 ? (
                                        <div className="text-center py-10 px-4 flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-full bg-paper dark:bg-zinc-800 text-warm-gray flex items-center justify-center mb-3 border border-soft-border dark:border-zinc-700">
                                                <BookmarkSimple size={20} />
                                            </div>
                                            <p className="text-xs font-serif italic text-warm-gray dark:text-zinc-400 mb-4 max-w-[240px]">
                                                Vous n'avez pas encore créé de liste pour organiser vos poèmes.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewListTitle("");
                                                    setView("create");
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-xs font-serif font-medium hover:bg-accent-hover transition-colors shadow-xs"
                                            >
                                                <Plus size={14} weight="bold" />
                                                Créer ma première liste
                                            </button>
                                        </div>
                                    ) : filteredLists.length === 0 ? (
                                        <div className="text-center py-8 text-warm-gray">
                                            <p className="text-xs font-serif italic mb-3">
                                                Aucune liste trouvée pour « {searchQuery} »
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewListTitle(searchQuery.trim());
                                                    setView("create");
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-serif hover:bg-accent/20 transition-colors"
                                            >
                                                <Plus size={13} weight="bold" />
                                                Créer « {searchQuery} »
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredLists.map((list) => {
                                                const isExpandedForNote = editingNoteListId === list.id;

                                                return (
                                                    <div
                                                        key={list.id}
                                                        className={`rounded-2xl border transition-all overflow-hidden ${
                                                            list.containsPoem
                                                                ? "bg-accent/5 dark:bg-accent/10 border-accent/35 dark:border-accent/40 shadow-2xs"
                                                                : "bg-paper/70 dark:bg-zinc-900/60 hover:bg-paper dark:hover:bg-zinc-900 border-soft-border/70 dark:border-zinc-800"
                                                        }`}
                                                    >
                                                        {/* Main List Row */}
                                                        <div
                                                            onClick={() => handleToggleList(list)}
                                                            className="flex items-center justify-between p-3 cursor-pointer group select-none"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                                {/* Checkbox button */}
                                                                <div
                                                                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                                                                        list.containsPoem
                                                                            ? "bg-accent text-white shadow-xs scale-100"
                                                                            : "border border-soft-border dark:border-zinc-700 bg-white dark:bg-zinc-800 group-hover:border-accent/50"
                                                                    }`}
                                                                >
                                                                    {list.containsPoem && (
                                                                        <motion.div
                                                                            initial={{ scale: 0.5 }}
                                                                            animate={{ scale: 1 }}
                                                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                                        >
                                                                            <Check size={12} weight="bold" />
                                                                        </motion.div>
                                                                    )}
                                                                </div>

                                                                {/* List Metadata */}
                                                                <div className="min-w-0">
                                                                    <span className="font-serif text-sm font-medium block truncate text-charcoal dark:text-zinc-100">
                                                                        {list.title}
                                                                    </span>
                                                                    <div className="flex items-center gap-2 text-[11px] text-warm-gray dark:text-zinc-400 mt-0.5">
                                                                        <span>
                                                                            {list.poems_count} poème{list.poems_count > 1 ? "s" : ""}
                                                                        </span>
                                                                        {list.is_ranked && (
                                                                            <span className="inline-flex items-center gap-0.5 text-accent text-[10px] font-medium">
                                                                                <Sparkle size={9} weight="fill" />
                                                                                Top
                                                                            </span>
                                                                        )}
                                                                        {!list.is_public ? (
                                                                            <span className="inline-flex items-center gap-0.5 text-warm-gray text-[10px]">
                                                                                <Lock size={9} />
                                                                                Privée
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-0.5 text-warm-gray/70 text-[10px]">
                                                                                <Globe size={9} />
                                                                                Publique
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right actions: Note icon when poem is in list */}
                                                            {list.containsPoem && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleOpenNoteEditor(e, list)}
                                                                    title={list.notes ? "Modifier votre note" : "Ajouter une note personnelle"}
                                                                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs flex-shrink-0 ${
                                                                        list.notes
                                                                            ? "text-accent bg-accent/10 hover:bg-accent/20"
                                                                            : "text-warm-gray hover:text-charcoal hover:bg-soft-border/50 dark:hover:bg-zinc-800"
                                                                    }`}
                                                                >
                                                                    <NotePencil size={15} weight={list.notes ? "fill" : "regular"} />
                                                                    {list.notes && (
                                                                        <span className="text-[10px] font-serif hidden sm:inline">
                                                                            Note
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Expanded Inline Note Editor */}
                                                        <AnimatePresence>
                                                            {isExpandedForNote && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="px-3.5 pb-3.5 pt-1 border-t border-accent/15 bg-paper/90 dark:bg-zinc-900/90"
                                                                >
                                                                    <label className="block text-[11px] font-serif text-warm-gray dark:text-zinc-400 mb-1.5">
                                                                        Note de lecture pour cette liste :
                                                                    </label>
                                                                    <textarea
                                                                        rows={2}
                                                                        maxLength={500}
                                                                        value={editingNoteText}
                                                                        onChange={(e) => setEditingNoteText(e.target.value)}
                                                                        placeholder="Votre vers favori, émotion ou souvenir de lecture..."
                                                                        className="w-full p-2.5 rounded-xl bg-cream dark:bg-zinc-800 border border-soft-border dark:border-zinc-700 text-xs font-serif text-charcoal dark:text-zinc-100 placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent resize-none"
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <span className="text-[10px] text-warm-gray">
                                                                            {editingNoteText.length}/500
                                                                        </span>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setEditingNoteListId(null)}
                                                                                className="px-2.5 py-1 text-xs text-warm-gray hover:text-charcoal font-serif"
                                                                            >
                                                                                Annuler
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                disabled={isSavingNote}
                                                                                onClick={() => handleSaveNote(list.id)}
                                                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-accent text-white text-xs font-serif font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                                                                            >
                                                                                {isSavingNote ? (
                                                                                    <CircleNotch size={12} className="animate-spin" />
                                                                                ) : (
                                                                                    "Enregistrer"
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {!isNotAuthenticated && lists.length > 0 && (
                                    <div className="px-5 py-3 border-t border-soft-border/60 dark:border-zinc-800 flex items-center justify-end flex-shrink-0 bg-cream/70 dark:bg-[#18181b]/70">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-1.5 rounded-full bg-soft-border/50 dark:bg-zinc-800 hover:bg-soft-border dark:hover:bg-zinc-700 text-charcoal dark:text-zinc-200 text-xs font-medium transition-colors"
                                        >
                                            Terminer
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* View 2: Full Create List Form */
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-soft-border/60 dark:border-zinc-800 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setView("list")}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-warm-gray hover:text-charcoal dark:hover:text-zinc-100 hover:bg-soft-border/40 dark:hover:bg-zinc-800 transition-colors"
                                            aria-label="Retour aux listes"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                        <div>
                                            <h2 className="font-serif text-base sm:text-lg text-charcoal dark:text-zinc-100 font-medium">
                                                Nouvelle Liste
                                            </h2>
                                            <p className="text-xs text-warm-gray dark:text-zinc-400 font-serif italic">
                                                Créez une sélection sur-mesure
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-warm-gray hover:text-charcoal dark:hover:text-zinc-100 hover:bg-soft-border/40 dark:hover:bg-zinc-800 transition-colors"
                                        aria-label="Fermer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Form Body */}
                                <form onSubmit={handleCreateList} className="flex-grow overflow-y-auto px-5 py-4 space-y-4">
                                    {/* List Title */}
                                    <div>
                                        <label className="block text-xs font-serif font-medium text-charcoal dark:text-zinc-200 mb-1">
                                            Titre de la liste <span className="text-accent">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={100}
                                            value={newListTitle}
                                            onChange={(e) => setNewListTitle(e.target.value)}
                                            placeholder="Ex: Les plus beaux poèmes sur la mélancolie..."
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-paper dark:bg-zinc-900 border border-soft-border dark:border-zinc-800 text-xs font-serif text-charcoal dark:text-zinc-100 placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-serif font-medium text-charcoal dark:text-zinc-200 mb-1">
                                            Description ou thème (optionnel)
                                        </label>
                                        <textarea
                                            rows={2}
                                            maxLength={500}
                                            value={newListDescription}
                                            onChange={(e) => setNewListDescription(e.target.value)}
                                            placeholder="Le fil conducteur de cette collection..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-paper dark:bg-zinc-900 border border-soft-border dark:border-zinc-800 text-xs font-serif text-charcoal dark:text-zinc-100 placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent resize-none"
                                        />
                                    </div>

                                    {/* Options: Ranked & Public */}
                                    <div className="space-y-2.5 pt-1">
                                        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-paper/60 dark:bg-zinc-900/60 border border-soft-border dark:border-zinc-800 cursor-pointer hover:bg-paper dark:hover:bg-zinc-900 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={isNewListRanked}
                                                onChange={(e) => setIsNewListRanked(e.target.checked)}
                                                className="mt-0.5 h-3.5 w-3.5 rounded border-soft-border text-accent focus:ring-accent"
                                            />
                                            <div className="text-xs">
                                                <span className="font-serif font-medium text-charcoal dark:text-zinc-200 flex items-center gap-1">
                                                    <Sparkle size={12} className="text-accent" weight="fill" />
                                                    Top ordonné (1, 2, 3...)
                                                </span>
                                                <p className="text-[11px] text-warm-gray dark:text-zinc-400 mt-0.5 font-serif">
                                                    Pour un classement personnel ou un palmarès hiérarchisé.
                                                </p>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-paper/60 dark:bg-zinc-900/60 border border-soft-border dark:border-zinc-800 cursor-pointer hover:bg-paper dark:hover:bg-zinc-900 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={isNewListPublic}
                                                onChange={(e) => setIsNewListPublic(e.target.checked)}
                                                className="mt-0.5 h-3.5 w-3.5 rounded border-soft-border text-accent focus:ring-accent"
                                            />
                                            <div className="text-xs">
                                                <span className="font-serif font-medium text-charcoal dark:text-zinc-200 flex items-center gap-1">
                                                    {isNewListPublic ? (
                                                        <Globe size={12} className="text-accent" />
                                                    ) : (
                                                        <Lock size={12} className="text-warm-gray" />
                                                    )}
                                                    {isNewListPublic ? "Liste publique" : "Liste privée"}
                                                </span>
                                                <p className="text-[11px] text-warm-gray dark:text-zinc-400 mt-0.5 font-serif">
                                                    {isNewListPublic
                                                        ? "Visible sur votre profil et partageable."
                                                        : "Visible uniquement par vous."}
                                                </p>
                                            </div>
                                        </label>

                                        {/* Add current poem checkbox */}
                                        <div className="p-2.5 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/25 space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={addPoemToNewList}
                                                    onChange={(e) => setAddPoemToNewList(e.target.checked)}
                                                    className="h-3.5 w-3.5 rounded border-soft-border text-accent focus:ring-accent"
                                                />
                                                <span className="font-serif font-medium text-charcoal dark:text-zinc-100">
                                                    Ajouter « {poemTitle} » à la création
                                                </span>
                                            </label>

                                            {addPoemToNewList && (
                                                <input
                                                    type="text"
                                                    maxLength={250}
                                                    value={newPoemNote}
                                                    onChange={(e) => setNewPoemNote(e.target.value)}
                                                    placeholder="Note personnelle pour ce poème (optionnelle)..."
                                                    className="w-full px-3 py-1.5 rounded-lg bg-cream dark:bg-zinc-800 border border-soft-border dark:border-zinc-700 text-xs font-serif text-charcoal dark:text-zinc-100 placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="pt-2 flex items-center justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setView("list")}
                                            className="px-4 py-2 rounded-full border border-soft-border dark:border-zinc-700 text-warm-gray hover:text-charcoal dark:hover:text-zinc-100 text-xs font-serif transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreatingList || !newListTitle.trim()}
                                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-serif font-medium transition-colors disabled:opacity-50 shadow-xs"
                                        >
                                            {isCreatingList ? (
                                                <>
                                                    <CircleNotch size={14} className="animate-spin" />
                                                    <span>Création...</span>
                                                </>
                                            ) : (
                                                <span>Créer la liste</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default AddToListModal;
