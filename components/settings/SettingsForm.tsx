"use client";

import React, { useState } from "react";
import {
    User,
    PencilSimple,
    Camera,
    Lock,
    Palette,
    Star,
    BookOpen,
    Check,
    Eye,
    EyeSlash,
} from "@phosphor-icons/react";

const HIGHLIGHT_COLORS = [
    { name: "Rouge classique", value: "#B85450" },
    { name: "Bleu nuit", value: "#3B5998" },
    { name: "Vert forêt", value: "#4A7C59" },
    { name: "Or ancien", value: "#B8860B" },
    { name: "Violet impérial", value: "#6B4C9A" },
    { name: "Rose poudré", value: "#C08081" },
    { name: "Bleu glacier", value: "#6BA3BE" },
    { name: "Terre cuite", value: "#CC7351" },
];

export default function SettingsForm() {
    // Form states
    const [username, setUsername] = useState("CharlesReader");
    const [bio, setBio] = useState("Amoureux de poésie depuis 2026");
    const [highlightColor, setHighlightColor] = useState("#B85450");
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saved, setSaved] = useState<string | null>(null);

    // Mock top 3
    const [topAuthors, setTopAuthors] = useState([
        "Charles Baudelaire",
        "Arthur Rimbaud",
        "Paul Verlaine",
    ]);
    const [topPoems, setTopPoems] = useState([
        "L'Albatros",
        "Le Bateau ivre",
        "Chanson d'automne",
    ]);

    function handleSave(section: string) {
        setSaved(section);
        setTimeout(() => setSaved(null), 2000);
    }

    return (
        <div className="space-y-0">
            {/* ─── Profile Section ─── */}
            <section className="py-10 border-b border-soft-border">
                <div className="flex items-center gap-3 mb-8">
                    <User size={20} className="text-accent" />
                    <h2 className="font-serif text-xl text-charcoal">Profil</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    {/* Avatar */}
                    <div className="md:col-span-3 flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-3xl font-serif shadow-lg">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <button className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Camera size={24} />
                            </button>
                        </div>
                        <button className="text-xs text-accent hover:text-charcoal transition-colors font-medium">
                            Changer la photo
                        </button>
                    </div>

                    {/* Fields */}
                    <div className="md:col-span-9 space-y-6">
                        <div>
                            <label className="block text-xs text-warm-gray uppercase tracking-wider mb-2 font-medium">
                                Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray/50 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                                />
                                <PencilSimple
                                    size={14}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-warm-gray uppercase tracking-wider mb-2 font-medium">
                                Description
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                maxLength={200}
                                className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray/50 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all resize-none"
                                placeholder="Décrivez-vous en quelques mots…"
                            />
                            <p className="text-right text-xs text-warm-gray/50 mt-1">
                                {bio.length}/200
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave("profile")}
                                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98]"
                            >
                                {saved === "profile" ? (
                                    <>
                                        <Check size={14} weight="bold" /> Enregistré
                                    </>
                                ) : (
                                    "Enregistrer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Highlight Color ─── */}
            <section className="py-10 border-b border-soft-border">
                <div className="flex items-center gap-3 mb-8">
                    <Palette size={20} className="text-accent" />
                    <h2 className="font-serif text-xl text-charcoal">
                        Couleur de surlignage
                    </h2>
                </div>
                <p className="text-sm text-warm-gray mb-6 max-w-lg">
                    Choisissez la couleur qui apparaîtra pour vos sélections de texte,
                    vos annotations et vos favoris.
                </p>
                <div className="flex flex-wrap gap-3">
                    {HIGHLIGHT_COLORS.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => {
                                setHighlightColor(color.value);
                                handleSave("color");
                            }}
                            className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${highlightColor === color.value
                                    ? "border-charcoal ring-2 ring-charcoal/10 scale-110"
                                    : "border-soft-border"
                                }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
                {saved === "color" && (
                    <p className="mt-3 text-xs text-accent flex items-center gap-1">
                        <Check size={12} weight="bold" /> Couleur mises à jour
                    </p>
                )}
            </section>

            {/* ─── Top 3 ─── */}
            <section className="py-10 border-b border-soft-border">
                <div className="flex items-center gap-3 mb-8">
                    <Star size={20} className="text-accent" />
                    <h2 className="font-serif text-xl text-charcoal">
                        Vos favoris (Top 3)
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Top Authors */}
                    <div>
                        <h3 className="text-xs text-warm-gray uppercase tracking-wider mb-4 font-medium">
                            Auteurs favoris
                        </h3>
                        <div className="space-y-3">
                            {topAuthors.map((author, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => {
                                            const copy = [...topAuthors];
                                            copy[i] = e.target.value;
                                            setTopAuthors(copy);
                                        }}
                                        className="flex-1 rounded-lg border border-soft-border bg-paper px-3 py-2 text-sm text-charcoal placeholder:text-warm-gray/50 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                                        placeholder={`Auteur #${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Poems */}
                    <div>
                        <h3 className="text-xs text-warm-gray uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
                            <BookOpen size={14} className="text-warm-gray/60" />
                            Poèmes favoris
                        </h3>
                        <div className="space-y-3">
                            {topPoems.map((poem, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={poem}
                                        onChange={(e) => {
                                            const copy = [...topPoems];
                                            copy[i] = e.target.value;
                                            setTopPoems(copy);
                                        }}
                                        className="flex-1 rounded-lg border border-soft-border bg-paper px-3 py-2 text-sm text-charcoal placeholder:text-warm-gray/50 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                                        placeholder={`Poème #${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={() => handleSave("top3")}
                        className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98]"
                    >
                        {saved === "top3" ? (
                            <>
                                <Check size={14} weight="bold" /> Enregistré
                            </>
                        ) : (
                            "Enregistrer les favoris"
                        )}
                    </button>
                </div>
            </section>

            {/* ─── Password ─── */}
            <section className="py-10">
                <div className="flex items-center gap-3 mb-8">
                    <Lock size={20} className="text-accent" />
                    <h2 className="font-serif text-xl text-charcoal">
                        Mot de passe
                    </h2>
                </div>

                <div className="max-w-md space-y-5">
                    <div>
                        <label className="block text-xs text-warm-gray uppercase tracking-wider mb-2 font-medium">
                            Mot de passe actuel
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 pr-12 text-sm text-charcoal outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                            >
                                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-warm-gray uppercase tracking-wider mb-2 font-medium">
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 text-sm text-charcoal outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-warm-gray uppercase tracking-wider mb-2 font-medium">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 text-sm text-charcoal outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                            placeholder="••••••••"
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="mt-2 text-xs text-red-500">
                                Les mots de passe ne correspondent pas.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={() => handleSave("password")}
                            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {saved === "password" ? (
                                <>
                                    <Check size={14} weight="bold" /> Mis à jour
                                </>
                            ) : (
                                "Modifier le mot de passe"
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
