"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PoemCard from "@/components/ui/PoemCard";
import ProfileHome from "@/components/profile/ProfileHome";

interface ProfileTabsProps {
    username: string;
    favoritePoems: any[];
}

const TABS = [
    { id: "profil", label: "Profil", param: undefined },
    { id: "poemes", label: "Poèmes", param: "poems" },
    { id: "journal", label: "Journal", param: "journal" },
    { id: "critiques", label: "Critiques", param: "reviews" },
    { id: "listes", label: "Listes", param: "lists" },
    { id: "likes", label: "Likes", param: "likes" },
    { id: "reseau", label: "Réseau", param: "network" },
];

export default function ProfileTabs({ username, favoritePoems }: ProfileTabsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const activeTab = useMemo(() => {
        const tabParam = searchParams.get("tab");
        if (!tabParam) return "profil";
        const found = TABS.find((t) => t.param === tabParam);
        return found ? found.id : "profil";
    }, [searchParams]);

    function setActiveTab(tabId: string) {
        const tab = TABS.find((t) => t.id === tabId);
        if (!tab) return;
        const params = new URLSearchParams(searchParams.toString());
        if (tab.param) {
            params.set("tab", tab.param);
        } else {
            params.delete("tab");
        }
        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-start gap-6 border-b border-soft-border mb-8 overflow-x-auto hide-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative pb-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-charcoal" : "text-warm-gray hover:text-charcoal"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="profileTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === "profil" && (
                        <motion.div
                            key="profil"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ProfileHome username={username} favoritePoems={favoritePoems} />
                        </motion.div>
                    )}

                    {activeTab === "poemes" && (
                        <motion.div
                            key="poemes"
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            Tous les poèmes aimés par {username}.
                        </motion.div>
                    )}

                    {activeTab === "reseau" && (
                        <motion.div
                            key="reseau"
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
