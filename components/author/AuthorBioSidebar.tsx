"use client";

import React, { useState } from "react";
import {
    CalendarBlank,
    MapPin,
    Sparkle,
    Quotes,
    CaretDown,
    CaretUp,
    GlobeSimple,
    Translate
} from "@phosphor-icons/react";
import AuthorLikeButton from "./AuthorLikeButton";
import ShareButton from "@/components/ui/ShareButton";

export interface AuthorBioSidebarProps {
    author: {
        id: string;
        name: string;
        slug: string;
        biography?: string | null;
        date_of_birth?: string | null;
        date_of_death?: string | null;
        birth_place?: string | null;
        death_place?: string | null;
        birth_place_detailed?: string | null;
        death_place_detailed?: string | null;
        nationality?: string | null;
        language?: string | null;
        native_name?: string | null;
        movement?: string[] | null;
        influenced_by?: string[] | null;
        signature_url?: string | null;
        image_url?: string | null;
        likes_count?: number;
        poems_count?: number;
        collections_count?: number;
    };
    isLiked?: boolean;
}

function formatDateFr(dateStr?: string | null): string | null {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const d = new Date(Date.UTC(year, month, day));
            return new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
            }).format(d);
        }
    }
    const match = dateStr.match(/\d{4}/);
    return match ? match[0] : dateStr;
}

function calculateAge(birthStr?: string | null, deathStr?: string | null): number | null {
    if (!birthStr || !deathStr) return null;
    const bMatch = birthStr.match(/(\d{4})/);
    const dMatch = deathStr.match(/(\d{4})/);
    if (bMatch && dMatch) {
        const age = parseInt(dMatch[1], 10) - parseInt(bMatch[1], 10);
        return age > 0 && age < 130 ? age : null;
    }
    return null;
}

function getCentury(dateStr?: string | null): string | null {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{4})/);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const century = Math.ceil(year / 100);
    const romanNumerals: Record<number, string> = {
        15: "XVe siècle",
        16: "XVIe siècle",
        17: "XVIIe siècle",
        18: "XVIIIe siècle",
        19: "XIXe siècle",
        20: "XXe siècle",
        21: "XXIe siècle",
    };
    return romanNumerals[century] || `${century}e siècle`;
}

function generateFallbackBio(author: AuthorBioSidebarProps["author"]): string {
    const century = getCentury(author.date_of_birth);
    const movementStr = author.movement && author.movement.length > 0 ? author.movement.join(", ") : "";
    const parts: string[] = [];

    const centuryStr = century ? ` du ${century}` : "";
    parts.push(`${author.name} est une voix emblématique de la poésie${centuryStr}.`);

    if (movementStr) {
        parts.push(`Rattaché au courant ${movementStr}, son regard singulier et la cadence de ses vers continuent d'illuminer l'héritage poétique.`);
    } else {
        parts.push(`Par la finesse de son verbe et la sensibilité de son inspiration, son œuvre traverse le temps pour toucher chaque lecteur.`);
    }

    if (author.influenced_by && author.influenced_by.length > 0) {
        const topInfluences = author.influenced_by.slice(0, 3).join(", ");
        parts.push(`Inspiré notamment par ${topInfluences}, son écriture dialogue avec les grands esprits littéraires de son époque.`);
    }

    return parts.join(" ");
}

export default function AuthorBioSidebar({ author, isLiked = false }: AuthorBioSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formattedBirth = formatDateFr(author.date_of_birth);
    const formattedDeath = formatDateFr(author.date_of_death);
    const ageAtDeath = calculateAge(author.date_of_birth, author.date_of_death);

    const bioText = (author.biography && author.biography.trim().length > 0)
        ? author.biography
        : generateFallbackBio(author);

    const isLongBio = bioText.length > 420;
    const displayBio = isLongBio && !isExpanded
        ? bioText.slice(0, 380) + "…"
        : bioText;

    const hasMilestones = Boolean(formattedBirth || formattedDeath || author.birth_place || author.death_place);
    const hasMovements = Boolean(author.movement && author.movement.length > 0);
    const hasInfluences = Boolean(author.influenced_by && author.influenced_by.length > 0);
    const hasOrigin = Boolean(author.nationality || author.language || (author.native_name && author.native_name !== author.name));

    return (
        <aside className="lg:sticky lg:top-28 flex flex-col gap-6 w-full">
            {/* Carte Principale Biographie & Identité */}
            <div className="bg-paper dark:bg-zinc-900 border border-soft-border rounded-3xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
                
                {/* 1. Barre d'Actions : Like & Partage */}
                <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-soft-border">
                    <div className="flex items-center gap-2">
                        <AuthorLikeButton
                            authorId={author.id}
                            slug={author.slug}
                            initialIsLiked={isLiked}
                            initialLikesCount={author.likes_count || 0}
                            showCount={true}
                            variant="default"
                        />
                    </div>
                    <ShareButton
                        variant="default"
                        ariaLabel={`Partager la page de ${author.name}`}
                    />
                </div>

                {/* 2. Mouvements littéraires & Badges d'identité */}
                {(hasMovements || hasOrigin) && (
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                        {hasMovements && author.movement!.map((m, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[11px] font-sans font-medium px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 capitalize tracking-wide"
                            >
                                <Sparkle size={12} weight="fill" />
                                {m}
                            </span>
                        ))}

                        {author.nationality && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-sans text-warm-gray px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-soft-border">
                                <GlobeSimple size={12} />
                                {author.nationality}
                            </span>
                        )}

                        {author.language && author.language.toLowerCase() !== "français" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-sans text-warm-gray px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-soft-border capitalize">
                                <Translate size={12} />
                                {author.language}
                            </span>
                        )}
                    </div>
                )}

                {/* 3. Section Biographie */}
                {bioText && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-serif text-lg md:text-xl text-charcoal dark:text-cream font-medium">
                                Biographie
                            </h2>
                            {author.native_name && author.native_name !== author.name && (
                                <span className="text-[11px] font-mono text-warm-gray italic">
                                    né {author.native_name}
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <p className="font-serif text-charcoal/85 dark:text-cream/85 text-sm md:text-[15px] leading-relaxed drop-cap text-justify">
                                {displayBio}
                            </p>

                            {isLongBio && (
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-sans font-medium text-accent hover:underline focus:outline-none transition-colors"
                                >
                                    {isExpanded ? (
                                        <>
                                            Réduire la biographie
                                            <CaretUp size={12} weight="bold" />
                                        </>
                                    ) : (
                                        <>
                                            Lire la suite
                                            <CaretDown size={12} weight="bold" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. Repères Chronologiques & Géographiques */}
                {hasMilestones && (
                    <div className="pt-5 border-t border-soft-border flex flex-col gap-3.5 mb-5">
                        <h3 className="font-serif text-xs uppercase tracking-widest text-warm-gray font-medium">
                            Repères biographiques
                        </h3>

                        <div className="flex flex-col gap-2.5 text-xs text-charcoal/90 dark:text-cream/90 font-sans">
                            {(formattedBirth || author.birth_place) && (
                                <div className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-warm-gray flex-shrink-0 mt-0.5">
                                        <CalendarBlank size={12} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            Naissance {formattedBirth ? `le ${formattedBirth}` : ""}
                                        </span>
                                        {author.birth_place && (
                                            <span className="text-warm-gray text-[11px] flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} />
                                                {author.birth_place}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(formattedDeath || author.death_place) && (
                                <div className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-warm-gray flex-shrink-0 mt-0.5">
                                        <CalendarBlank size={12} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            Décès {formattedDeath ? `le ${formattedDeath}` : ""}
                                            {ageAtDeath ? ` (à ${ageAtDeath} ans)` : ""}
                                        </span>
                                        {author.death_place && (
                                            <span className="text-warm-gray text-[11px] flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} />
                                                {author.death_place}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 5. Influences Littéraires */}
                {hasInfluences && (
                    <div className="pt-5 border-t border-soft-border flex flex-col gap-2.5 mb-5">
                        <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-warm-gray font-medium">
                            <Quotes size={14} className="text-accent" />
                            <span>Influencé par</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {author.influenced_by!.map((influencer, idx) => (
                                <span
                                    key={idx}
                                    className="font-serif italic text-xs px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-soft-border text-charcoal/80 dark:text-cream/80"
                                >
                                    {influencer}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Chiffres Clés de l'Œuvre */}
                <div className="pt-5 border-t border-soft-border grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-soft-border">
                        <span className="font-serif text-lg sm:text-xl text-charcoal dark:text-cream font-medium">
                            {author.poems_count || 0}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-warm-gray font-sans mt-0.5">
                            Poèmes
                        </span>
                    </div>

                    <div className="flex flex-col p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-soft-border">
                        <span className="font-serif text-lg sm:text-xl text-charcoal dark:text-cream font-medium">
                            {author.collections_count || 0}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-warm-gray font-sans mt-0.5">
                            Recueils
                        </span>
                    </div>

                    <div className="flex flex-col p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-soft-border">
                        <span className="font-serif text-lg sm:text-xl text-accent font-medium">
                            {author.likes_count || 0}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-warm-gray font-sans mt-0.5">
                            Favoris
                        </span>
                    </div>
                </div>

                {/* 7. Signature Littéraire d'époque */}
                {author.signature_url && (
                    <div className="pt-5 mt-5 border-t border-soft-border flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase tracking-widest text-warm-gray/70 font-sans mb-2">
                            Signature autographe
                        </span>
                        <div className="h-12 w-auto flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity">
                            <img
                                src={author.signature_url}
                                alt={`Signature de ${author.name}`}
                                className="max-h-12 max-w-[180px] object-contain dark:invert"
                                loading="lazy"
                            />
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
