"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    MagnifyingGlass,
    ListBullets,
    Sparkle,
    CircleNotch
} from "@phosphor-icons/react";
import { UserList } from "@/types";
import ListCard from "@/components/lists/ListCard";
import CreateListModal from "@/components/lists/CreateListModal";
import { fetchUserListsAction } from "@/app/actions/lists";
import { useAction } from "next-safe-action/hooks";

interface ProfileListsProps {
    username: string;
    isOwner?: boolean;
    initialLists?: UserList[];
}

export function ProfileLists({
    username,
    isOwner = false,
    initialLists,
}: ProfileListsProps) {
    const hasInitialLists = initialLists !== undefined;
    const [lists, setLists] = useState<UserList[]>(initialLists || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(!hasInitialLists);

    const { executeAsync: fetchLists } = useAction(fetchUserListsAction);

    // If initialLists was undefined (e.g. client tab switch), fetch client-side once
    useEffect(() => {
        if (initialLists !== undefined) {
            setLists(initialLists);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        fetchLists({ username })
            .then((res) => {
                if (isMounted && res?.data?.lists) {
                    setLists(res.data.lists as UserList[]);
                }
            })
            .catch((err) => console.error("Error fetching user lists:", err))
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [username, initialLists]);

    // Client-side instant search
    const filteredLists = useMemo(() => {
        if (!searchQuery.trim()) return lists;
        const q = searchQuery.toLowerCase().trim();
        return lists.filter(
            (l) =>
                l.title.toLowerCase().includes(q) ||
                (l.description && l.description.toLowerCase().includes(q))
        );
    }, [lists, searchQuery]);

    const handleListCreated = (created: { listId: string; slug: string; title: string; isPublic?: boolean }) => {
        const dummyNewList: UserList = {
            id: created.listId,
            user_id: "",
            title: created.title,
            slug: created.slug,
            description: null,
            is_public: created.isPublic ?? true,
            is_ranked: false,
            likes_count: 0,
            poems_count: 0,
            cover_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
                id: "",
                username,
            },
            preview_poems: [],
        };
        setLists((prev) => [dummyNewList, ...prev]);
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-charcoal font-medium">
                        {lists.length} {lists.length <= 1 ? "liste" : "listes"}
                    </span>
                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-xs transition-colors"
                        >
                            <Plus size={13} weight="bold" />
                            Créer une liste
                        </button>
                    )}
                </div>

                {/* Search input (if >= 2 lists) */}
                {lists.length >= 2 && (
                    <div className="relative w-full sm:w-64">
                        <MagnifyingGlass
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une liste..."
                            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-paper/80 border border-soft-border text-xs font-serif text-charcoal placeholder:text-warm-gray/60 focus:outline-hidden focus:border-accent transition-colors"
                        />
                    </div>
                )}
            </div>

            {/* List Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-warm-gray gap-2">
                    <CircleNotch size={24} className="animate-spin text-accent" />
                    <span className="text-xs font-serif italic">Chargement des listes...</span>
                </div>
            ) : filteredLists.length === 0 ? (
                <div className="text-center py-16 px-4 bg-paper/40 rounded-3xl border border-soft-border/50 max-w-xl mx-auto">
                    <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                        <ListBullets size={24} weight="light" />
                    </div>
                    {searchQuery.trim() ? (
                        <p className="font-serif text-sm text-warm-gray italic">
                            Aucune liste ne correspond à votre recherche « {searchQuery} ».
                        </p>
                    ) : isOwner ? (
                        <div className="space-y-3">
                            <h3 className="font-serif text-lg text-charcoal font-medium">
                                Vous n'avez pas encore créé de liste
                            </h3>
                            <p className="text-xs text-warm-gray font-serif italic max-w-md mx-auto">
                                Rassemblez vos poèmes préférés dans des anthologies thématiques,
                                ou composez vos classements personnels (Top 5, Top 10...).
                            </p>
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-sm transition-colors"
                                >
                                    <Plus size={14} weight="bold" />
                                    Créer ma première liste
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="font-serif text-sm text-warm-gray italic">
                            {username} n'a pas encore partagé de liste publique.
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLists.map((list) => (
                        <ListCard key={list.id} list={list} showOwner={false} />
                    ))}
                </div>
            )}

            {/* Create List Modal */}
            <CreateListModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={handleListCreated}
            />
        </div>
    );
}

export default ProfileLists;
