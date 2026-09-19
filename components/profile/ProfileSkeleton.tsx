import React from "react";
import OdeLogoStatic from "@/components/ui/OdeLogoStatic";
import Footer from "@/components/layout/Footer";

export default function ProfileSkeleton() {
    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col" aria-busy="true" aria-label="Chargement du profil...">
            {/* Header / Navbar Placeholder */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-cream/80 backdrop-blur-xl border-b border-soft-border/40 shadow-xs">
                <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex-shrink-0 w-[90px] md:w-[110px] text-charcoal opacity-90">
                        <OdeLogoStatic width="100%" height="auto" />
                    </div>
                    <div className="hidden md:flex flex-1 max-w-lg mx-6 h-9 rounded-full bg-paper/70 border border-soft-border/50 skeleton-shimmer" />
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-soft-border/70 skeleton-shimmer" />
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    {/* Header Profil */}
                    <header className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-16">
                        {/* Avatar Skeleton */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full skeleton-shimmer flex-shrink-0 shadow-lg border border-soft-border/40" />

                        {/* Infos & Stats */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
                            {/* Pseudo Skeleton */}
                            <div className="h-9 md:h-10 w-44 sm:w-56 rounded-lg skeleton-shimmer mb-3" />

                            {/* Bio / Inscription Skeleton */}
                            <div className="h-4 w-52 sm:w-72 rounded-md skeleton-shimmer mb-6" />

                            {/* Stats Bar Skeletons */}
                            <div className="flex flex-wrap items-center gap-6 md:gap-8 w-full justify-center md:justify-start">
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    <div className="h-6 w-8 rounded skeleton-shimmer" />
                                    <div className="h-3 w-16 rounded skeleton-shimmer" />
                                </div>
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    <div className="h-6 w-7 rounded skeleton-shimmer" />
                                    <div className="h-3 w-10 rounded skeleton-shimmer" />
                                </div>
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    <div className="h-6 w-7 rounded skeleton-shimmer" />
                                    <div className="h-3 w-12 rounded skeleton-shimmer" />
                                </div>
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    <div className="h-6 w-7 rounded skeleton-shimmer" />
                                    <div className="h-3 w-10 rounded skeleton-shimmer" />
                                </div>
                                <div className="hidden md:block w-px h-8 bg-soft-border" />
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    <div className="h-6 w-8 rounded skeleton-shimmer" />
                                    <div className="h-3 w-14 rounded skeleton-shimmer" />
                                </div>
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    <div className="h-6 w-8 rounded skeleton-shimmer" />
                                    <div className="h-3 w-20 rounded skeleton-shimmer" />
                                </div>
                            </div>
                        </div>

                        {/* Bouton d'action Skeleton */}
                        <div className="mt-4 md:mt-0">
                            <div className="h-9 w-36 rounded-full border border-soft-border/70 skeleton-shimmer" />
                        </div>
                    </header>

                    {/* Onglets Skeleton avec indicateur sur Profil */}
                    <div className="w-full">
                        <div
                            role="tablist"
                            className="flex items-center justify-start gap-8 border-b border-soft-border mb-12 overflow-x-auto hide-scrollbar"
                        >
                            <div className="relative pb-4 text-sm font-medium text-charcoal">
                                Profil
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                            </div>
                            <div className="pb-4 text-sm font-medium text-warm-gray/60">Poèmes</div>
                            <div className="pb-4 text-sm font-medium text-warm-gray/60">Journal</div>
                            <div className="pb-4 text-sm font-medium text-warm-gray/60">Critiques</div>
                            <div className="pb-4 text-sm font-medium text-warm-gray/60">Listes</div>
                            <div className="pb-4 text-sm font-medium text-warm-gray/60">Likes</div>
                            <div className="pb-4 text-sm font-medium text-warm-gray/60">Réseau</div>
                        </div>

                        {/* Contenu onglet "Profil" Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                            {/* Colonne Principale Gauche (8 cols) */}
                            <div className="md:col-span-8 flex flex-col gap-16">
                                {/* SECTION: Top 3 Poèmes */}
                                <section>
                                    <div className="flex items-center justify-between mb-6 border-b border-soft-border pb-2">
                                        <h2 className="font-serif text-xl text-charcoal">Poèmes Favoris (Top 3)</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="flex flex-col bg-paper/60 border border-soft-border rounded-xl p-4 overflow-hidden"
                                            >
                                                <div className="aspect-[3/4] w-full rounded-lg skeleton-shimmer mb-4" />
                                                <div className="h-5 w-3/4 rounded skeleton-shimmer mb-2" />
                                                <div className="h-3.5 w-1/2 rounded skeleton-shimmer" />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* SECTION: Critiques Récentes */}
                                <section>
                                    <div className="flex items-center justify-between mb-6 border-b border-soft-border pb-2">
                                        <h2 className="font-serif text-xl text-charcoal">Critiques Récentes</h2>
                                    </div>
                                    <div className="flex flex-col gap-6">
                                        {[0, 1].map((i) => (
                                            <article key={i} className="p-6 bg-paper/60 border border-soft-border rounded-xl">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-2">
                                                        <div className="h-5 w-44 rounded skeleton-shimmer" />
                                                        <div className="h-3 w-28 rounded skeleton-shimmer" />
                                                    </div>
                                                    <div className="h-4 w-20 rounded skeleton-shimmer" />
                                                </div>
                                                <div className="space-y-2 mt-4">
                                                    <div className="h-3.5 w-full rounded skeleton-shimmer" />
                                                    <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Colonne Sidebar Droite (4 cols) */}
                            <div className="md:col-span-4 flex flex-col gap-14">
                                {/* SECTION: Auteurs Favoris */}
                                <section>
                                    <h2 className="font-serif text-lg text-charcoal mb-4 border-b border-soft-border pb-2">
                                        Auteurs Favoris
                                    </h2>
                                    <div className="flex flex-wrap gap-4">
                                        {[0, 1, 2, 3].map((i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 rounded-full skeleton-shimmer" />
                                                <div className="h-3 w-14 rounded skeleton-shimmer" />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* SECTION: Répartition des Notes */}
                                <section>
                                    <h2 className="font-serif text-lg text-charcoal mb-6 border-b border-soft-border pb-2">
                                        Répartition des Notes
                                    </h2>
                                    <div className="flex flex-col gap-3">
                                        {[5, 4, 3, 2, 1].map((star) => (
                                            <div key={star} className="flex items-center gap-3">
                                                <span className="w-4 text-xs text-warm-gray font-medium">{star}</span>
                                                <div className="w-2.5 h-2.5 rounded-full skeleton-shimmer" />
                                                <div className="flex-grow h-3 bg-soft-border/70 rounded-sm skeleton-shimmer" />
                                                <div className="w-6 h-3 rounded skeleton-shimmer" />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* SECTION: Badges */}
                                <section>
                                    <h2 className="font-serif text-lg text-charcoal mb-4 border-b border-soft-border pb-2">
                                        Badges
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className="h-7 w-24 rounded-full border border-soft-border/70 skeleton-shimmer" />
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
