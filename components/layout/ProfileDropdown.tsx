"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    BookOpenText,
    Notebook,
    ChatCircle,
    ListBullets,
    Heart,
    UsersThree,
    Gear,
    SignOut,
} from "@phosphor-icons/react";

const MOCK_USERNAME = "BaudelaireFan";

const menuItems = [
    { label: "Profil", icon: User, href: `/profile/${MOCK_USERNAME}` },
    { label: "Mes poèmes", icon: BookOpenText, href: `/profile/${MOCK_USERNAME}?tab=poems` },
    { label: "Mon journal", icon: Notebook, href: `/profile/${MOCK_USERNAME}?tab=journal` },
    { label: "Mes critiques", icon: ChatCircle, href: `/profile/${MOCK_USERNAME}?tab=reviews` },
    { label: "Mes listes", icon: ListBullets, href: `/profile/${MOCK_USERNAME}?tab=lists` },
    { label: "Mes likes", icon: Heart, href: `/profile/${MOCK_USERNAME}?tab=likes` },
    { label: "Mon réseau", icon: UsersThree, href: `/profile/${MOCK_USERNAME}?tab=network` },
];

export default function ProfileDropdown() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    return (
        <div ref={containerRef} className="relative ml-3">
            {/* Avatar trigger */}
            <button
                onClick={() => setOpen(!open)}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-accent/30"
                aria-label="Menu utilisateur"
                aria-expanded={open}
            >
                B
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-cream border border-soft-border shadow-xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-soft-border">
                            <p className="text-sm font-medium text-charcoal truncate">BaudelaireFan</p>
                            <p className="text-xs text-warm-gray truncate">baudelaire@ode.fr</p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-charcoal/5 hover:text-charcoal transition-colors"
                                >
                                    <item.icon size={16} className="text-warm-gray flex-shrink-0" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Bottom section */}
                        <div className="border-t border-soft-border py-1">
                            <Link
                                href="/settings"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 hover:bg-charcoal/5 hover:text-charcoal transition-colors"
                            >
                                <Gear size={16} className="text-warm-gray flex-shrink-0" />
                                Paramètres
                            </Link>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    // TODO: implement actual logout
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600/80 hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                                <SignOut size={16} className="flex-shrink-0" />
                                Déconnexion
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
