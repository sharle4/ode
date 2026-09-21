"use client";

import React from "react";

interface PoemCardPreviewProps {
    title: string;
    authorName: string;
    verses: string[];
    collectionTitle?: string;
    publicationYear?: number | null;
}

export default function PoemCardPreview({
    title,
    authorName,
    verses,
    collectionTitle,
    publicationYear,
}: PoemCardPreviewProps) {
    const cleanVerses = verses.filter((v) => v.trim().length > 0);
    const lineCount = cleanVerses.length || 1;

    // Échelle typographique adaptative calibrée pour s'inscrire dans le carré 1:1
    const getVersesClass = () => {
        if (lineCount <= 2) return "text-sm sm:text-base leading-relaxed";
        if (lineCount <= 4) return "text-xs sm:text-sm leading-relaxed";
        if (lineCount <= 6) return "text-[11px] sm:text-xs leading-normal";
        return "text-[10px] sm:text-[11px] leading-tight";
    };

    return (
        <div className="relative w-[320px] sm:w-[370px] aspect-square mx-auto rounded-xl shadow-2xl overflow-hidden select-none bg-[#FFFCF2] text-[#1A1A1A] p-3 sm:p-4 flex flex-col justify-between border border-[#1A1A1A]/12">
            {/* Texture radiale subtile */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.7) 0%, rgba(238, 233, 218, 0.35) 100%)",
                }}
            />

            {/* Double bordure éditoriale style Pléiade / Gallimard */}
            <div className="absolute inset-2 sm:inset-2.5 border border-[#1A1A1A]/20 pointer-events-none rounded-[4px]" />
            <div className="absolute inset-3 sm:inset-3.5 border border-[#1A1A1A]/10 pointer-events-none rounded-[2px]" />

            {/* Contenu intérieur */}
            <div className="relative z-10 h-full flex flex-col justify-between py-2 sm:py-2.5 px-3 sm:px-4 text-center">
                {/* 1. En-tête : Losange carmin & mention */}
                <div className="flex flex-col items-center shrink-0">
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#B85450] mb-1" />
                    <span className="text-[8px] sm:text-[9px] font-sans font-medium tracking-[0.22em] text-[#8A817C] uppercase">
                        Ode &bull; Anthologie Poétique
                    </span>
                    <span className="font-serif italic font-bold text-2xl sm:text-3xl text-[#B85450] leading-none mt-0.5 select-none">
                        &laquo;
                    </span>
                </div>

                {/* 2. Vers du poème */}
                <div className="flex-1 flex flex-col items-center justify-center my-1 px-1 overflow-hidden">
                    <div className={`font-serif italic text-[#1A1A1A] text-center space-y-0.5 sm:space-y-1 ${getVersesClass()}`}>
                        {cleanVerses.map((verse, idx) => (
                            <p key={idx} className="tracking-normal">
                                {verse}
                            </p>
                        ))}
                    </div>
                </div>

                {/* 3. Séparateur & Métadonnées poétiques */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                    {/* Filet décoratif avec losange */}
                    <div className="flex items-center justify-center gap-2 w-full max-w-[120px] mb-1.5 opacity-60">
                        <div className="h-px flex-1 bg-[#1A1A1A]/30" />
                        <div className="w-1 h-1 rotate-45 bg-[#B85450]" />
                        <div className="h-px flex-1 bg-[#1A1A1A]/30" />
                    </div>

                    {/* Titre */}
                    <h3 className="font-serif font-semibold text-xs sm:text-sm text-[#1A1A1A] line-clamp-1 tracking-tight">
                        {title}
                    </h3>

                    {/* Auteur */}
                    <p className="font-serif italic text-[11px] sm:text-xs text-[#8A817C] mt-0.5">
                        {authorName}
                    </p>

                    {/* Recueil & Année */}
                    {(collectionTitle || publicationYear) && (
                        <p className="font-serif text-[9px] sm:text-[10px] text-[#8A817C]/90 mt-0.5 line-clamp-1">
                            {[collectionTitle ? `« ${collectionTitle} »` : null, publicationYear ? `${publicationYear}` : null]
                                .filter(Boolean)
                                .join(" • ")}
                        </p>
                    )}

                    {/* Signature ode. */}
                    <div className="mt-1.5 flex items-center justify-center font-serif text-[11px] sm:text-xs font-bold tracking-wider text-[#1A1A1A]">
                        ode<span className="text-[#B85450]">.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
