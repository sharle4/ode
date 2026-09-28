"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    ShareNetwork,
    Gear,
    Trash,
    Sparkle,
    Lock,
    Globe,
    DotsSixVertical,
    PencilSimple,
    Check,
    X,
    BookOpen,
    ArrowLeft,
    CheckCircle
} from "@phosphor-icons/react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { UserList, UserListItem } from "@/types";
import ListCover from "@/components/lists/ListCover";
import EditListModal from "@/components/lists/EditListModal";
import { RothkoArtwork } from "@/components/poem/RothkoArtwork";
import { formatAuthors } from "@/utils/author";
import {
    toggleListLikeAction,
    reorderListItemsAction,
    removePoemFromListAction,
    updateListItemNotesAction
} from "@/app/actions/lists";
import { useAction } from "next-safe-action/hooks";

interface ListDetailViewProps {
    list: UserList & {
        items: UserListItem[];
        user: { id: string; username: string; avatar_url?: string | null; description?: string | null };
    };
    isOwner: boolean;
    initialHasLiked: boolean;
}

export function ListDetailView({
    list: initialList,
    isOwner,
    initialHasLiked,
}: ListDetailViewProps) {
    const router = useRouter();
    const dndId = useId();

    const [listData, setListData] = useState(initialList);
    const [items, setItems] = useState<UserListItem[]>(initialList.items || []);
    const [isLiked, setIsLiked] = useState(initialHasLiked);
    const [likesCount, setLikesCount] = useState(initialList.likes_count || 0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const [editingNotePoemId, setEditingNotePoemId] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState("");

    const { executeAsync: toggleLike } = useAction(toggleListLikeAction);
    const { executeAsync: reorderItems } = useAction(reorderListItemsAction);
    const { executeAsync: removePoem } = useAction(removePoemFromListAction);
    const { executeAsync: updateNote } = useAction(updateListItemNotesAction);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Like toggle
    const handleLikeClick = async () => {
        const nextState = !isLiked;
        setIsLiked(nextState);
        setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

        try {
            await toggleLike({ listId: listData.id, targetState: nextState });
        } catch (err) {
            console.error("Like error:", err);
            setIsLiked(!nextState);
            setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
        }
    };

    // Share link
    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 2200);
        }
    };

    // Drag and Drop reorder
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((item) => item.poem_id === active.id);
        const newIndex = items.findIndex((item) => item.poem_id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
            ...item,
            item_order: index,
        }));

        setItems(newItems);

        try {
            await reorderItems({
                listId: listData.id,
                orderedPoemIds: newItems.map((item) => item.poem_id),
            });
        } catch (err) {
            console.error("Reorder error:", err);
        }
    };

    // Remove poem from list
    const handleRemovePoem = async (poemId: string) => {
        setItems((prev) => prev.filter((i) => i.poem_id !== poemId));
        setListData((prev) => ({
            ...prev,
            poems_count: Math.max(0, prev.poems_count - 1),
        }));

        try {
            await removePoem({ listId: listData.id, poemId });
        } catch (err) {
            console.error("Remove poem error:", err);
        }
    };

    // Edit poem note
    const handleSaveNote = async (poemId: string) => {
        const nextNotes = tempNote.trim() || null;
        setItems((prev) =>
            prev.map((i) => (i.poem_id === poemId ? { ...i, notes: nextNotes } : i))
        );
        setEditingNotePoemId(null);

        try {
            await updateNote({ listId: listData.id, poemId, notes: nextNotes });
        } catch (err) {
            console.error("Update note error:", err);
        }
    };

    // Format date in French
    const formattedDate = listData.created_at
        ? new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Europe/Paris",
          }).format(new Date(listData.created_at))
        : null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-serif text-warm-gray mb-8">
                <Link
                    href={`/profile/${encodeURIComponent(listData.user.username)}?tab=lists`}
                    className="inline-flex items-center gap-1.5 hover:text-charcoal transition-colors"
                >
                    <ArrowLeft size={14} />
                    Listes de {listData.user.username}
                </Link>
                <span>/</span>
                <span className="text-charcoal truncate max-w-[200px] sm:max-w-md">
                    {listData.title}
                </span>
            </div>

            {/* List Hero Header */}
            <header className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-12 pb-10 border-b border-soft-border/70">
                {/* Visual Cover */}
                <div className="flex-shrink-0">
                    <ListCover
                        coverUrl={listData.cover_url}
                        previewPoems={items.map((i) => ({
                            id: i.poem?.id || i.poem_id,
                            title: i.poem?.title || "",
                            slug: i.poem?.slug || "",
                            rothko_params: i.poem?.rothko_params,
                        }))}
                        size="lg"
                        className="shadow-md"
                    />
                </div>

                {/* Info Block */}
                <div className="flex flex-col flex-grow items-center md:items-start text-center md:text-left min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                        {listData.is_ranked && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-serif tracking-wide bg-accent/10 text-accent border border-accent/20">
                                <Sparkle size={12} weight="fill" />
                                Top Classé
                            </span>
                        )}
                        {!listData.is_public && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-charcoal/10 text-charcoal/80 border border-charcoal/15">
                                <Lock size={12} weight="fill" />
                                Liste Privée
                            </span>
                        )}
                        {listData.is_public && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-paper border border-soft-border text-warm-gray">
                                <Globe size={12} />
                                Publique
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-medium tracking-tight mb-4 leading-tight">
                        {listData.title}
                    </h1>

                    {/* Author & Date metadata */}
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-warm-gray mb-6">
                        <Link
                            href={`/profile/${encodeURIComponent(listData.user.username)}`}
                            className="flex items-center gap-2 group hover:text-charcoal transition-colors"
                        >
                            <div className="w-6 h-6 rounded-full bg-accent/20 text-accent font-serif flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
                                {listData.user.avatar_url ? (
                                    <img src={listData.user.avatar_url} alt={listData.user.username} className="w-full h-full object-cover" />
                                ) : (
                                    listData.user.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            <span className="font-serif font-medium group-hover:underline">
                                {listData.user.username}
                            </span>
                        </Link>
                        {formattedDate && (
                            <>
                                <span>•</span>
                                <span>Créée le {formattedDate}</span>
                            </>
                        )}
                        <span>•</span>
                        <span className="font-mono text-xs">
                            {listData.poems_count} {listData.poems_count <= 1 ? "poème" : "poèmes"}
                        </span>
                    </div>

                    {/* Description */}
                    {listData.description && (
                        <p className="text-charcoal/80 font-serif italic text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
                            « {listData.description} »
                        </p>
                    )}

                    {/* Action buttons bar */}
                    <div className="flex items-center gap-3">
                        {/* Like button */}
                        <button
                            type="button"
                            onClick={handleLikeClick}
                            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-medium transition-all ${
                                isLiked
                                    ? "bg-accent/10 border-accent/30 text-accent"
                                    : "bg-paper/80 border-soft-border text-charcoal hover:bg-paper"
                            }`}
                        >
                            <Heart
                                size={16}
                                weight={isLiked ? "fill" : "regular"}
                                className={isLiked ? "text-accent fill-accent" : ""}
                            />
                            <span>{likesCount}</span>
                        </button>

                        {/* Share button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={handleShare}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-paper/80 border border-soft-border text-charcoal hover:bg-paper text-xs font-medium transition-colors"
                            >
                                <ShareNetwork size={16} />
                                Partager
                            </button>

                            <AnimatePresence>
                                {showCopiedToast && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-charcoal text-white text-[11px] rounded-md whitespace-nowrap shadow-md flex items-center gap-1"
                                    >
                                        <CheckCircle size={12} weight="bold" />
                                        Lien copié !
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Owner settings button */}
                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-paper/80 border border-soft-border text-warm-gray hover:text-charcoal text-xs font-medium transition-colors"
                            >
                                <Gear size={15} />
                                Paramètres
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* List Items Content */}
            <section className="space-y-4">
                <div className="flex items-center justify-between pb-3">
                    <h2 className="font-serif text-xl text-charcoal font-medium">
                        Poèmes de la sélection ({items.length})
                    </h2>
                    {isOwner && items.length > 1 && (
                        <span className="text-xs text-warm-gray font-serif italic hidden sm:inline">
                            Glissez-déposez les poèmes pour réorganiser l'ordre.
                        </span>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-paper/40 rounded-3xl border border-soft-border/50">
                        <BookOpen size={32} weight="light" className="text-warm-gray/60 mx-auto mb-3" />
                        <h3 className="font-serif text-base text-charcoal mb-1">
                            Cette liste ne contient aucun poème pour le moment.
                        </h3>
                        <p className="text-xs text-warm-gray font-serif italic mb-4">
                            Explorez les poèmes sur Ode et cliquez sur « Ajouter » pour enrichir votre liste.
                        </p>
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
                        >
                            Explorer les poèmes
                        </Link>
                    </div>
                ) : isOwner ? (
                    /* Drag and Drop enabled for Owner */
                    <DndContext
                        id={dndId}
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map((i) => i.poem_id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <SortablePoemRow
                                        key={item.poem_id}
                                        item={item}
                                        index={index}
                                        isRanked={listData.is_ranked}
                                        isOwner={true}
                                        isEditingNote={editingNotePoemId === item.poem_id}
                                        tempNote={tempNote}
                                        onStartEditNote={(currentNote) => {
                                            setEditingNotePoemId(item.poem_id);
                                            setTempNote(currentNote || "");
                                        }}
                                        onCancelEditNote={() => setEditingNotePoemId(null)}
                                        onSaveNote={() => handleSaveNote(item.poem_id)}
                                        onTempNoteChange={setTempNote}
                                        onRemove={() => handleRemovePoem(item.poem_id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    /* Read-only view for visitors */
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <SortablePoemRow
                                key={item.poem_id}
                                item={item}
                                index={index}
                                isRanked={listData.is_ranked}
                                isOwner={false}
                                isEditingNote={false}
                                tempNote=""
                                onStartEditNote={() => {}}
                                onCancelEditNote={() => {}}
                                onSaveNote={() => {}}
                                onTempNoteChange={() => {}}
                                onRemove={() => {}}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Edit List Modal */}
            {isOwner && (
                <EditListModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    list={listData}
                    onUpdated={(updated) => {
                        setListData((prev) => ({
                            ...prev,
                            title: updated.title,
                            description: updated.description,
                            is_public: updated.isPublic,
                            is_ranked: updated.isRanked,
                        }));
                    }}
                    onDeleted={() => {
                        router.push(`/profile/${encodeURIComponent(listData.user.username)}?tab=lists`);
                    }}
                />
            )}
        </div>
    );
}

// Single poem row inside the list
function SortablePoemRow({
    item,
    index,
    isRanked,
    isOwner,
    isEditingNote,
    tempNote,
    onStartEditNote,
    onCancelEditNote,
    onSaveNote,
    onTempNoteChange,
    onRemove,
}: {
    item: UserListItem;
    index: number;
    isRanked: boolean;
    isOwner: boolean;
    isEditingNote: boolean;
    tempNote: string;
    onStartEditNote: (currentNote?: string | null) => void;
    onCancelEditNote: () => void;
    onSaveNote: () => void;
    onTempNoteChange: (v: string) => void;
    onRemove: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.poem_id, disabled: !isOwner });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const poem = item.poem;
    if (!poem) return null;

    const authorInfo = formatAuthors(poem.authors as any);
    const displayRank = (index + 1).toString().padStart(2, "0");

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 sm:p-5 rounded-2xl bg-paper/70 border border-soft-border/70 hover:border-soft-border transition-all ${
                isDragging ? "opacity-40 shadow-xl z-20" : ""
            }`}
        >
            <div className="flex items-start gap-4 sm:gap-6">
                {/* Drag Handle (Owner only) */}
                {isOwner && (
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="mt-1 cursor-grab active:cursor-grabbing text-warm-gray/60 hover:text-charcoal transition-colors p-1"
                        title="Glisser pour réorganiser"
                    >
                        <DotsSixVertical size={18} />
                    </button>
                )}

                {/* Rank number or simple bullet */}
                {isRanked ? (
                    <div className="font-serif text-2xl sm:text-3xl text-accent/70 font-light flex-shrink-0 w-8 sm:w-10 text-right select-none pt-0.5">
                        {displayRank}
                    </div>
                ) : (
                    <div className="font-serif text-sm text-warm-gray/40 flex-shrink-0 w-6 text-right select-none pt-1">
                        {index + 1}
                    </div>
                )}

                {/* Micro Rothko Preview */}
                <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden shadow-xs border border-soft-border/50 flex-shrink-0 hidden xs:block">
                    {poem.rothko_params ? (
                        <RothkoArtwork params={poem.rothko_params} className="w-full h-full" />
                    ) : (
                        <div className="w-full h-full bg-cream border border-soft-border flex items-center justify-center text-xs font-serif text-warm-gray">
                            {poem.title.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Poem Info */}
                <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <Link
                                href={`/poem/${poem.slug}`}
                                className="font-serif text-base sm:text-lg text-charcoal font-medium hover:text-accent transition-colors line-clamp-1"
                            >
                                {poem.title}
                            </Link>
                            <p className="text-xs text-warm-gray font-serif">
                                {authorInfo.displayText || "Auteur inconnu"}
                                {poem.publication_year ? ` (${poem.publication_year})` : ""}
                            </p>
                        </div>

                        {/* Owner item actions */}
                        {isOwner && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onStartEditNote(item.notes)}
                                    className="p-1.5 rounded-lg text-warm-gray hover:text-charcoal hover:bg-soft-border/40 transition-colors"
                                    title="Ajouter ou modifier une note"
                                >
                                    <PencilSimple size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={onRemove}
                                    className="p-1.5 rounded-lg text-warm-gray hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Retirer de la liste"
                                >
                                    <Trash size={15} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Curator Note Bubble */}
                    {isEditingNote ? (
                        <div className="mt-3 p-3 rounded-xl bg-cream border border-accent/20 space-y-2">
                            <label className="block text-[11px] font-serif text-charcoal font-medium">
                                Note du curateur sur ce poème :
                            </label>
                            <textarea
                                rows={2}
                                maxLength={500}
                                value={tempNote}
                                onChange={(e) => onTempNoteChange(e.target.value)}
                                placeholder="Partagez pourquoi ce poème figure ici..."
                                className="w-full px-3 py-1.5 rounded-lg bg-paper border border-soft-border text-xs font-serif text-charcoal placeholder:text-warm-gray/50 focus:outline-hidden focus:border-accent resize-none"
                                autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onCancelEditNote}
                                    className="px-3 py-1 rounded-md text-xs text-warm-gray hover:text-charcoal"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={onSaveNote}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover"
                                >
                                    <Check size={12} weight="bold" />
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    ) : (
                        item.notes && (
                            <div className="mt-2.5 px-3 py-2 rounded-xl bg-paper/90 border border-soft-border/50 text-xs font-serif text-charcoal/80 italic flex items-start gap-2">
                                <span className="text-accent not-italic font-bold">“</span>
                                <span className="flex-grow">{item.notes}</span>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default ListDetailView;
