"use client";

import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryState } from "nuqs";
import PoemCard from "@/components/ui/PoemCard";
import ProfileHome from "@/components/profile/ProfileHome";
import ProfileLikes from "@/components/profile/ProfileLikes";

interface ProfileTabsProps {
    username: string;
    favoritePoems: any[];
    topAuthors?: any[];
    recentReviews?: any[];
    badges?: any[];
    reviewDistribution?: { stars: number; count: number }[];
    isOwner?: boolean;
    likedPoems?: any[];
    likedCollections?: any[];
    likedAuthors?: any[];
    likesCount?: { poems: number; collections: number; authors: number; total: number };
}

const TABS = [
    { id: "profil", label: "Profil", param: undefined },
    { id: "poemes", label: "Poèmes", param: "poems" },
    { id: "journal", label: "Journal", param: "journal" },
    { id: "critiques", label: "Critiques", param: "reviews" },
    { id: "listes", label: "Listes", param: "lists" },
    { id: "likes", label: "Likes", param: "likes" },
    { id: "reseau", label: "Réseau", param: "network" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Mapping bidirectionnel robuste pour supporter les paramètres anglais et français
const PARAM_TO_TAB_ID: Record<string, TabId> = {
    poems: "poemes",
    poemes: "poemes",
    journal: "journal",
    reviews: "critiques",
    critiques: "critiques",
    lists: "listes",
    listes: "listes",
    likes: "likes",
    network: "reseau",
    reseau: "reseau",
};

const TAB_ID_TO_PARAM: Record<TabId, string | null> = {
    profil: null,
    poemes: "poems",
    journal: "journal",
    critiques: "reviews",
    listes: "lists",
    likes: "likes",
    reseau: "network",
};

export default function ProfileTabs({
    username,
    favoritePoems,
    topAuthors = [],
    recentReviews = [],
    badges = [],
    reviewDistribution = [],
    isOwner = false,
    likedPoems = [],
    likedCollections = [],
    likedAuthors = [],
    likesCount,
}: ProfileTabsProps) {
    // ⚡ Hook nuqs avec shallow: true, history: "replace", scroll: false
    // Évite tout rechargement serveur (0 ms de latence, zéro freeze)
    const [tabParam, setTabParam] = useQueryState("tab", {
        shallow: true,
        history: "replace",
        scroll: false,
    });

    const activeTab = useMemo<TabId>(() => {
        if (!tabParam) return "profil";
        const normalized = tabParam.toLowerCase();
        return PARAM_TO_TAB_ID[normalized] || "profil";
    }, [tabParam]);

    const setActiveTab = useCallback(
        (tabId: TabId) => {
            const nextParam = TAB_ID_TO_PARAM[tabId] ?? null;
            setTabParam(nextParam);
        },
        [setTabParam]
    );

    // Support de la navigation accessible au clavier (flèches gauche/droite)
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            const nextIndex = (index + 1) % TABS.length;
            setActiveTab(TABS[nextIndex].id);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const prevIndex = (index - 1 + TABS.length) % TABS.length;
            setActiveTab(TABS[prevIndex].id);
        } else if (e.key === "Home") {
            e.preventDefault();
            setActiveTab(TABS[0].id);
        } else if (e.key === "End") {
            e.preventDefault();
            setActiveTab(TABS[TABS.length - 1].id);
        }
    };

    return (
        <div className="w-full">
            <div
                role="tablist"
                aria-label="Navigation du profil"
                className="flex items-center justify-start gap-8 border-b border-soft-border mb-12 overflow-x-auto hide-scrollbar"
            >
                {TABS.map((tab, index) => {
                    const isSelected = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            role="tab"
                            aria-selected={isSelected}
                            aria-controls={`panel-${tab.id}`}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => setActiveTab(tab.id)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`relative pb-4 text-sm font-medium transition-colors whitespace-nowrap ${
                                isSelected ? "text-charcoal" : "text-warm-gray hover:text-charcoal"
                            }`}
                        >
                            {tab.label}
                            {isSelected && (
                                <motion.div
                                    layoutId="profileTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === "profil" && (
                        <motion.div
                            key="profil"
                            id="panel-profil"
                            role="tabpanel"
                            aria-labelledby="tab-profil"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ProfileHome
                                username={username}
                                favoritePoems={favoritePoems}
                                topAuthors={topAuthors}
                                recentReviews={recentReviews}
                                badges={badges}
                                reviewDistribution={reviewDistribution}
                            />
                        </motion.div>
                    )}

                    {activeTab === "poemes" && (
                        <motion.div
                            key="poemes"
                            id="panel-poemes"
                            role="tabpanel"
                            aria-labelledby="tab-poemes"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            Catalogue des poèmes de {username} (lus, notés, likés).
                        </motion.div>
                    )}

                    {activeTab === "journal" && (
                        <motion.div
                            key="journal"
                            id="panel-journal"
                            role="tabpanel"
                            aria-labelledby="tab-journal"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            Journal chronologique de l'activité de {username}.
                        </motion.div>
                    )}

                    {activeTab === "critiques" && (
                        <motion.div
                            key="critiques"
                            id="panel-critiques"
                            role="tabpanel"
                            aria-labelledby="tab-critiques"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            Toutes les critiques rédigées par {username}.
                        </motion.div>
                    )}

                    {activeTab === "listes" && (
                        <motion.div
                            key="listes"
                            id="panel-listes"
                            role="tabpanel"
                            aria-labelledby="tab-listes"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            Collections et listes créées par {username}.
                        </motion.div>
                    )}

                    {activeTab === "likes" && (
                        <motion.div
                            key="likes"
                            id="panel-likes"
                            role="tabpanel"
                            aria-labelledby="tab-likes"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ProfileLikes
                                username={username}
                                isOwner={isOwner}
                                initialLikedPoems={likedPoems}
                                initialLikedCollections={likedCollections}
                                initialLikedAuthors={likedAuthors}
                                likesCount={likesCount}
                            />
                        </motion.div>
                    )}

                    {activeTab === "reseau" && (
                        <motion.div
                            key="reseau"
                            id="panel-reseau"
                            role="tabpanel"
                            aria-labelledby="tab-reseau"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            Abonnés et abonnements de {username}.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
