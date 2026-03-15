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
import { signout } from "@/app/auth/actions";
import { type UserProfile } from "./Navbar";

const getMenuItems = (username: string) => [
    { label: "Profil", icon: User, href: `/profile/${username}` },
    { label: "Mes poèmes", icon: BookOpenText, href: `/profile/${username}?tab=poems` },
    { label: "Mon journal", icon: Notebook, href: `/profile/${username}?tab=journal` },
    { label: "Mes critiques", icon: ChatCircle, href: `/profile/${username}?tab=reviews` },
    { label: "Mes listes", icon: ListBullets, href: `/profile/${username}?tab=lists` },
    { label: "Mes likes", icon: Heart, href: `/profile/${username}?tab=likes` },
    { label: "Mon réseau", icon: UsersThree, href: `/profile/${username}?tab=network` },
];

function getInitials(name: string) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}

export default function ProfileDropdown({ userProfile }: { userProfile: UserProfile }) {
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

    if (!userProfile) {
        return (
            <div className="flex items-center gap-2 ml-4">
                <Link
                    href="/login"
                    className="rounded-full border border-soft-border bg-transparent text-charcoal px-5 py-2 text-sm font-medium transition-colors hover:bg-soft-border/50"
                >
                    Connexion
                </Link>
                <Link
                    href="/signup"
                    className="rounded-full bg-charcoal text-white px-5 py-2 text-sm font-medium transition-transform hover:scale-105"
                >
                    Inscription
                </Link>
            </div>
        );
    }

    const menuItems = getMenuItems(userProfile.username);

    return (
        <div ref={containerRef} className="relative ml-3">
            {/* Avatar trigger */}
            <button
                onClick={() => setOpen(!open)}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-accent/30 relative overflow-hidden"
                aria-label="Menu utilisateur"
                aria-expanded={open}
            >
                {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt={userProfile.username} className="w-full h-full object-cover" />
                ) : (
                    getInitials(userProfile.username)
                )}
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
                            <p className="text-sm font-medium text-charcoal truncate">{userProfile.username}</p>
                            <p className="text-xs text-warm-gray truncate">{userProfile.email}</p>
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
                                    React.startTransition(() => {
                                        signout();
                                    });
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600/80 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
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
