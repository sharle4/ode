"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, BookOpen, Lock, Globe } from "@phosphor-icons/react";
import { UserList } from "@/types";
import ListCover from "./ListCover";

interface ListCardProps {
    list: UserList;
    showOwner?: boolean;
}

export function ListCard({ list, showOwner = false }: ListCardProps) {
    const username = list.user?.username || "utilisateur";
    const href = `/${encodeURIComponent(username)}/lists/${list.slug}`;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="group block"
        >
            <Link
                href={href}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-paper/60 hover:bg-paper border border-soft-border/70 hover:border-accent/30 shadow-xs hover:shadow-md transition-all duration-300"
            >
                {/* Visual Cover */}
                <div className="flex-shrink-0 self-center sm:self-start">
                    <ListCover
                        coverUrl={list.cover_url}
                        previewPoems={list.preview_poems}
                        size="md"
                        className="group-hover:scale-[1.02] transition-transform duration-300"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between flex-grow min-w-0">
                    <div>
                        {/* Title & Visibility */}
                        <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                            <h3 className="font-serif text-lg sm:text-xl font-medium text-charcoal group-hover:text-accent transition-colors line-clamp-1 min-w-0">
                                {list.title}
                            </h3>
                            <div className="flex items-center flex-shrink-0">
                                {list.is_public ? (
                                    <span
                                        className="text-warm-gray/45 group-hover:text-accent/70 transition-colors p-0.5"
                                        title="Liste publique"
                                        aria-label="Liste publique"
                                    >
                                        <Globe size={15} weight="regular" />
                                    </span>
                                ) : (
                                    <span
                                        className="text-warm-gray/45 group-hover:text-warm-gray/80 transition-colors p-0.5"
                                        title="Liste privée"
                                        aria-label="Liste privée"
                                    >
                                        <Lock size={14} weight="regular" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {list.description ? (
                            <p className="text-xs sm:text-sm text-warm-gray font-serif italic line-clamp-2 mb-3">
                                {list.description}
                            </p>
                        ) : (
                            <p className="text-xs text-warm-gray/60 italic mb-3 font-serif">
                                Aucune description
                            </p>
                        )}
                    </div>

                    {/* Metadata footer */}
                    <div className="flex items-center justify-between text-xs text-warm-gray/80 pt-2 border-t border-soft-border/50">
                        {showOwner && list.user && (
                            <div className="flex items-center gap-1.5 min-w-0 mr-2">
                                <div className="w-4 h-4 rounded-full bg-accent/20 text-accent font-serif flex items-center justify-center text-[9px] flex-shrink-0">
                                    {list.user.avatar_url ? (
                                        <img src={list.user.avatar_url} alt={list.user.username} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        list.user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="truncate hover:text-charcoal transition-colors">
                                    {list.user.username}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3 ml-auto font-mono text-[11px]">
                            <span className="flex items-center gap-1" title={`${list.poems_count} poème(s)`}>
                                <BookOpen size={13} weight="regular" />
                                {list.poems_count}
                            </span>
                            <span className="flex items-center gap-1" title={`${list.likes_count} like(s)`}>
                                <Heart size={13} weight={list.likes_count > 0 ? "fill" : "regular"} className={list.likes_count > 0 ? "text-accent fill-accent" : ""} />
                                {list.likes_count}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default ListCard;
