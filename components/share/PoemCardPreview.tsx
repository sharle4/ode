"use client";

import React from "react";
import OdeLogoStatic from "@/components/ui/OdeLogoStatic";

interface PoemCardPreviewProps {
    title: string;
    authorName: string;
    verses: string[];
    collectionTitle?: string;
    publicationYear?: number | null;
}

/**
 * Nettoie et formate élégamment le recueil et l'année sans répétition ni guillemets superflus
 */
function formatCollectionAndYear(
    collectionTitle?: string,
    publicationYear?: number | null
): string | null {
    if (!collectionTitle && !publicationYear) return null;

    let cleanCollection = collectionTitle?.trim();
    if (cleanCollection) {
        cleanCollection = cleanCollection.replace(/^[«"'\s]+|[»"'\s]+$/g, "");
        if (publicationYear) {
            cleanCollection = cleanCollection.replace(
                new RegExp(`\\s*\\(${publicationYear}\\)$`),
                ""
            );
        }
    }

    const parts: string[] = [];
    if (cleanCollection) parts.push(cleanCollection);
    if (publicationYear) parts.push(String(publicationYear));

    return parts.join("  •  ");
}

export default function PoemCardPreview({
    title,
    authorName,
    verses,
    collectionTitle,
    publicationYear,
    cardRef,
}: PoemCardPreviewProps & { cardRef?: React.Ref<HTMLDivElement> }) {
    const cleanVerses = verses.filter((v) => v.trim().length > 0);
    const lineCount = cleanVerses.length || 1;

    // Échelle typographique adaptative
    const getVersesClass = () => {
        if (lineCount <= 2) return "text-[14.5px] sm:text-[16.5px] leading-relaxed sm:leading-[1.9]";
        if (lineCount <= 4) return "text-[12px] sm:text-[13.5px] leading-relaxed sm:leading-[1.8]";
        if (lineCount <= 6) return "text-[10.5px] sm:text-[12px] leading-normal sm:leading-relaxed";
        return "text-[9.5px] sm:text-[10.5px] leading-normal";
    };

    const details = formatCollectionAndYear(collectionTitle, publicationYear);

    return (
        <div
            id="poem-card-preview"
            ref={cardRef}
            className="relative w-[320px] sm:w-[370px] aspect-square mx-auto rounded-xl shadow-2xl overflow-hidden select-none bg-[#FFFCF2] text-[#1A1A1A] p-4 sm:p-5 flex flex-col justify-between border border-[#1A1A1A]/10"
        >
            {/* Texture radiale papier vélin */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.65) 0%, rgba(238, 233, 218, 0.3) 100%)",
                }}
            />

            {/* Double filet Gallimard : filet extérieur carmin discret + filet intérieur anthracite */}
            <div className="absolute inset-2.5 sm:inset-3 border border-[#B85450]/40 pointer-events-none rounded-[3px]" />
            <div className="absolute inset-3.5 sm:inset-4 border border-[#1A1A1A]/16 pointer-events-none rounded-[2px]" />

            {/* Contenu intérieur */}
            <div className="relative z-10 h-full flex flex-col justify-between py-2 sm:py-2.5 px-2 sm:px-3 text-center">
                {/* ── 1. EN-TÊTE : Logo officiel agrandi et plus gras ── */}
                <div className="flex flex-col items-center shrink-0 pt-0.5 sm:pt-1">
                    <div className="w-[88px] sm:w-[102px] text-[#1A1A1A]">
                        <OdeLogoStatic width="100%" height="auto" strokeWidth={4.4} />
                    </div>
                </div>

                {/* ── 2. VERS DU POÈME avec guillemets carmin fonctionnels ── */}
                <div className="flex-1 flex flex-col items-center justify-center my-1 px-1 overflow-hidden">
                    <div
                        className={`font-serif italic text-[#1A1A1A] text-center w-full max-w-[94%] space-y-1 sm:space-y-1.5 ${getVersesClass()}`}
                    >
                        {cleanVerses.map((verse, idx) => {
                            const isFirst = idx === 0;
                            const isLast = idx === cleanVerses.length - 1;

                            return (
                                <p key={idx} className="tracking-normal text-balance">
                                    {isFirst && (
                                        <span className="text-[#B85450] not-italic mr-1 font-serif font-bold text-[1.1em] select-none">
                                            «&nbsp;
                                        </span>
                                    )}
                                    {verse}
                                    {isLast && (
                                        <span className="text-[#B85450] not-italic ml-1 font-serif font-bold text-[1.1em] select-none">
                                            &nbsp;»
                                        </span>
                                    )}
                                </p>
                            );
                        })}
                    </div>
                </div>

                {/* ── 3. BAS DE CARTE (COLOPHON) ── */}
                <div className="flex flex-col items-center shrink-0 pb-1">
                    {/* Filet avec point rouge carmin central */}
                    <div className="flex items-center justify-center gap-2 w-14 mb-1.5 opacity-60">
                        <div className="h-px flex-1 bg-[#1A1A1A]/25" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#B85450]" />
                        <div className="h-px flex-1 bg-[#1A1A1A]/25" />
                    </div>

                    {/* Titre */}
                    <h3 className="font-serif font-semibold text-[12.5px] sm:text-[14px] text-[#1A1A1A] line-clamp-1 tracking-tight">
                        {title}
                    </h3>

                    {/* Auteur */}
                    <p className="font-serif italic text-[10.5px] sm:text-[11.5px] text-[#8A817C] mt-0.5">
                        {authorName}
                    </p>

                    {/* Recueil & Année */}
                    {details && (
                        <p className="font-serif text-[8.5px] sm:text-[9.5px] text-[#8A817C]/80 mt-0.5 line-clamp-1">
                            {details}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}



