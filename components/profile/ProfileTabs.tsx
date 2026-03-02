"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PoemCard from "@/components/ui/PoemCard";

interface ProfileTabsProps {
    username: string;
    favoritePoems: any[];
}

const TABS = [
    { id: "activity", label: "Activité" },
    { id: "favorites", label: "Favoris" },
    { id: "lists", label: "Listes" },
];

export default function ProfileTabs({ username, favoritePoems }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState(TABS[0].id);

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
                    {activeTab === "activity" && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            {username} n'a pas encore d'activité publique.
                        </motion.div>
                    )}

                    {activeTab === "favorites" && (
                        <motion.div
                            key="favorites"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {favoritePoems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {favoritePoems.map((poem, i) => (
                                        <PoemCard key={poem.id} poem={poem} index={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-warm-gray italic font-serif">
                                    Aucun poème favori pour le moment.
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "lists" && (
                        <motion.div
                            key="lists"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-center py-20 text-warm-gray italic font-serif"
                        >
                            {username} n'a pas encore créé de listes.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
