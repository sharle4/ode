"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface PoemMetadata {
    id: string;
    title: string;
    slug: string;
    authorName: string;
    collectionTitle?: string;
    publicationYear?: number | null;
    stanzas?: string[][];
}

interface PoemShareContextType {
    isOpen: boolean;
    activeVerses: string[];
    isCustomSelection: boolean;
    poem: PoemMetadata | null;
    openShare: (customVerses?: string[]) => void;
    closeShare: () => void;
    getShareUrl: () => string;
}

const PoemShareContext = createContext<PoemShareContextType | null>(null);

export function PoemShareProvider({
    poem,
    children,
}: {
    poem: PoemMetadata;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeVerses, setActiveVerses] = useState<string[]>([]);
    const [isCustomSelection, setIsCustomSelection] = useState(false);

    // Récupère les vers par défaut (première strophe du poème)
    const getDefaultVerses = useCallback((): string[] => {
        if (poem.stanzas && poem.stanzas.length > 0 && poem.stanzas[0].length > 0) {
            // Prendre la 1ère strophe (ou max 6 vers si strophe très longue)
            return poem.stanzas[0].slice(0, 6);
        }
        return [poem.title];
    }, [poem]);

    const openShare = useCallback(
        (customVerses?: string[]) => {
            // 1. Si des vers personnalisés sont explicitement fournis
            if (customVerses && customVerses.length > 0) {
                setActiveVerses(customVerses);
                setIsCustomSelection(true);
                setIsOpen(true);
                return;
            }

            // 2. Option A : Vérifier silencieusement si l'utilisateur a surligné du texte STRICTEMENT dans le poème
            if (typeof window !== "undefined") {
                const selection = window.getSelection();
                const selectedText = selection?.toString()?.trim();

                if (selection && selection.rangeCount > 0 && selectedText && selectedText.length > 3) {
                    const range = selection.getRangeAt(0);
                    const poemContainer = document.getElementById("poem-text-content");

                    // Vérifier rigoureusement que la sélection provient bien du poème
                    const isInsidePoem =
                        poemContainer &&
                        (poemContainer.contains(range.commonAncestorContainer) ||
                            (poemContainer.contains(range.startContainer) &&
                                poemContainer.contains(range.endContainer)));

                    if (isInsidePoem) {
                        const lines = selectedText
                            .split("\n")
                            .map((l) => l.trim())
                            .filter((l) => l.length > 0);

                        if (lines.length > 0) {
                            setActiveVerses(lines.slice(0, 8)); // limiter à 8 vers pour une lisibilité parfaite
                            setIsCustomSelection(true);
                            setIsOpen(true);
                            return;
                        }
                    }
                }
            }

            // 3. Repli automatique : première strophe emblématique
            setActiveVerses(getDefaultVerses());
            setIsCustomSelection(false);
            setIsOpen(true);
        },
        [getDefaultVerses]
    );

    const closeShare = useCallback(() => {
        setIsOpen(false);
    }, []);

    const getShareUrl = useCallback(() => {
        if (typeof window === "undefined") return "";
        const origin = window.location.origin;
        return `${origin}/poem/${poem.slug}?utm_source=share_card&utm_medium=social`;
    }, [poem.slug]);

    return (
        <PoemShareContext.Provider
            value={{
                isOpen,
                activeVerses,
                isCustomSelection,
                poem,
                openShare,
                closeShare,
                getShareUrl,
            }}
        >
            {children}
        </PoemShareContext.Provider>
    );
}

export function usePoemShare() {
    return useContext(PoemShareContext);
}
