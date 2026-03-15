"use client";

import React, { useState, useTransition, useOptimistic, useRef, startTransition, useEffect } from "react";
import { useActionState } from "react";
import {
    User, PencilSimple, Camera, Lock, Palette, Star, BookOpen, Check, Eye, EyeSlash
} from "@phosphor-icons/react";
import { updateProfile, updatePassword, updateFavorites, searchContent } from "@/app/actions/settings";
import SortableList, { SortableItem } from "@/components/admin/SortableList";
import SearchSelect, { SearchResult } from "@/components/admin/SearchSelect";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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

export interface SettingsData {
    username: string;
    description: string;
    annotationColor: string;
    avatarUrl: string | null;
    topAuthors: SearchResult[];
    topPoems: SearchResult[];
    isOAuth: boolean;
}

export default function SettingsForm({ initialData }: { initialData: SettingsData }) {
    const router = useRouter();
    const supabase = createClient();
    
    // --- Profile Section ---
    const [username, setUsername] = useState(initialData.username || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [highlightColor, setHighlightColor] = useState(initialData.annotationColor || "#B85450");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when initialData changes (e.g. after a server action mutation and a router.refresh)
    useEffect(() => {
        setUsername(initialData.username || "");
        setDescription(initialData.description || "");
        setHighlightColor(initialData.annotationColor || "#B85450");
        setAvatarUrl(initialData.avatarUrl || null);
    }, [initialData.username, initialData.description, initialData.annotationColor, initialData.avatarUrl]);

    const [profileState, profileAction, isProfilePending] = useActionState(async (prevState: any, formData: FormData) => {
        const res = await updateProfile({
            username: formData.get("username") as string,
            description: formData.get("description") as string,
            annotationColor: highlightColor,
            avatarUrl: formData.get("avatarUrl") as string || null,
        });

        if (res?.serverError) return { error: res.serverError };
        if (res?.validationErrors) return { error: "Erreur de validation des champs." };
        router.refresh();
        return { success: true };
    }, null);

    const [colorState, colorAction, isColorPending] = useActionState(async (prevState: any, formData: FormData) => {
        const res = await updateProfile({
            username: username,
            description: description,
            annotationColor: formData.get("annotationColor") as string,
            avatarUrl: avatarUrl,
        });

        if (res?.serverError) return { error: res.serverError };
        if (res?.validationErrors) return { error: "Erreur lors de la sauvegarde." };
        router.refresh();
        return { success: true };
    }, null);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${initialData.username}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert("Erreur lors de l'upload de l'image.");
        } finally {
            setIsUploading(false);
        }
    };

    // --- Favorites Section ---
    const [topAuthors, setTopAuthors] = useState<SearchResult[]>(initialData.topAuthors || []);
    const [topPoems, setTopPoems] = useState<SearchResult[]>(initialData.topPoems || []);

    useEffect(() => {
        setTopAuthors(initialData.topAuthors || []);
        setTopPoems(initialData.topPoems || []);
    }, [initialData.topAuthors, initialData.topPoems]);

    const [optimisticAuthors, addOptimisticAuthor] = useOptimistic(
        topAuthors,
        (state, newAuthors: SearchResult[]) => newAuthors
    );
    const [optimisticPoems, addOptimisticPoem] = useOptimistic(
        topPoems,
        (state, newPoems: SearchResult[]) => newPoems
    );

    const [favoritesState, favoritesAction, isFavoritesPending] = useActionState(async (prevState: any) => {
        const res = await updateFavorites({
            topAuthors: topAuthors.map(a => a.id),
            topPoems: topPoems.map(p => p.id),
        });

        if (res?.serverError) return { error: res.serverError };
        if (res?.validationErrors) return { error: "Erreur de validation." };
        
        return { success: true };
    }, null);

    const handleAddFavorite = (type: 'author' | 'poem', item: SearchResult) => {
        if (type === 'author') {
            if (topAuthors.length >= 3) return alert("Maximum 3 auteurs.");
            if (topAuthors.find(a => a.id === item.id)) return;
            const newAuthors = [...topAuthors, item];
            setTopAuthors(newAuthors);
            startTransition(() => {
                addOptimisticAuthor(newAuthors);
            });
        } else {
            if (topPoems.length >= 3) return alert("Maximum 3 poèmes.");
            if (topPoems.find(p => p.id === item.id)) return;
            const newPoems = [...topPoems, item];
            setTopPoems(newPoems);
            startTransition(() => {
                addOptimisticPoem(newPoems);
            });
        }
    };

    const handleSearchContent = async (query: string, type: 'author' | 'poem') => {
        const res = await searchContent({ query, type });
        if (res?.data) {
            return res.data;
        }
        return [];
    };

    // --- Password Section ---
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    
    const [passwordState, passwordAction, isPasswordPending] = useActionState(async (prevState: any, formData: FormData) => {
        const current = formData.get("currentPassword") as string;
        const pass1 = formData.get("newPassword") as string;
        const pass2 = formData.get("confirmPassword") as string;

        if (pass1 !== pass2) {
            return { error: "Les mots de passe ne correspondent pas." };
        }

        const res = await updatePassword({ currentPassword: current, newPassword: pass1 });
        if (res?.serverError) return { error: res.serverError };
        if (res?.validationErrors) return { error: "Vérifiez vos champs." };
        
        return { success: true };
    }, null);

    return (
        <div className="space-y-0">
            {/* ─── Profile Section ─── */}
            <form action={profileAction} className="py-10 border-b border-soft-border">
                <div className="flex items-center gap-3 mb-8">
                    <User size={20} className="text-accent" />
                    <h2 className="font-serif text-xl text-charcoal">Profil</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    {/* Avatar */}
                    <div className="md:col-span-3 flex flex-col items-center gap-4">
                        <div className="relative group overflow-hidden rounded-full w-28 h-28 bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-3xl font-serif shadow-lg">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                            ) : (
                                username.charAt(0).toUpperCase()
                            )}
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white disabled:cursor-not-allowed"
                            >
                                <Camera size={24} className={isUploading ? "animate-pulse" : ""} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-xs text-accent hover:text-charcoal transition-colors font-medium disabled:opacity-50"
                        >
                            {isUploading ? "Enregistrement..." : "Changer la photo"}
                        </button>
                    </div>

                    {/* Fields */}
                    <div className="md:col-span-9 space-y-6">
                        <input type="hidden" name="avatarUrl" value={avatarUrl || ""} />

                        <div>
                            <label className="block text-xs text-warm-gray uppercase tracking-wider mb-2 font-medium">
                                Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    pattern="^[a-zA-Z0-9_]+$"
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
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                maxLength={200}
                                className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray/50 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all resize-none"
                                placeholder="Décrivez-vous en quelques mots…"
                            />
                            <p className="text-right text-xs text-warm-gray/50 mt-1">
                                {description.length}/200
                            </p>
                        </div>

                        {profileState?.error && (
                            <p className="text-sm text-red-500 mt-2">{profileState.error}</p>
                        )}
                        {profileState?.success && (
                            <p className="text-sm text-accent mt-2 flex items-center gap-1"><Check size={14}/> Profil mis à jour</p>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isProfilePending}
                                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isProfilePending ? "Enregistrement..." : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* ─── Highlight Color ─── */}
            <form action={colorAction} className="py-10 border-b border-soft-border">
                {/* We re-use profileAction since color is part of profile */}
                <input type="hidden" name="username" value={username} />
                <input type="hidden" name="description" value={description} />
                <input type="hidden" name="avatarUrl" value={avatarUrl || ""} />
                
                <div className="flex items-center gap-3 mb-8">
                    <Palette size={20} className="text-accent" />
                    <h2 className="font-serif text-xl text-charcoal">
                        Couleur de surlignage
                    </h2>
                </div>
                <p className="text-sm text-warm-gray mb-6 max-w-lg">
                    Choisissez la couleur qui apparaîtra pour vos sélections de texte,
                    vos annotations et vos favoris. Ce réglage est sauvegardé avec votre profil en cliquant ci-dessous.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                    {HIGHLIGHT_COLORS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => setHighlightColor(color.value)}
                            className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                                highlightColor === color.value
                                    ? "border-charcoal ring-2 ring-charcoal/10 scale-110"
                                    : "border-soft-border"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                    <input type="hidden" name="annotationColor" value={highlightColor} />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isColorPending}
                        className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isColorPending ? "Enregistrement..." : "Enregistrer la couleur"}
                    </button>
                </div>
            </form>

            {/* ─── Top 3 ─── */}
            <form action={favoritesAction} className="py-10 border-b border-soft-border">
                <div className="flex items-center gap-3 mb-8">
                    <Star size={20} className="text-accent" />
                    <h2 className="font-serif text-xl text-charcoal">
                        Vos favoris (Top 3)
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Top Authors */}
                    <div className="bg-paper p-6 rounded-2xl border border-soft-border">
                        <h3 className="text-sm text-charcoal font-serif mb-4 flex items-center justify-between">
                            Auteurs favoris
                            <span className="text-xs text-warm-gray font-sans">{optimisticAuthors.length}/3</span>
                        </h3>
                        <div className="mb-4">
                            <SortableList
                                items={optimisticAuthors}
                                emptyMessage="Aucun auteur sélectionné"
                                onReorder={(items) => {
                                    setTopAuthors(items);
                                    startTransition(() => {
                                        addOptimisticAuthor(items);
                                    });
                                }}
                                onRemove={(id) => {
                                    const newItems = topAuthors.filter(a => a.id !== id);
                                    setTopAuthors(newItems);
                                    startTransition(() => {
                                        addOptimisticAuthor(newItems);
                                    });
                                }}
                            />
                        </div>
                        {optimisticAuthors.length < 3 && (
                            <SearchSelect
                                placeholder="Rechercher un auteur…"
                                excludeIds={optimisticAuthors.map(a => a.id)}
                                onSearch={(q) => handleSearchContent(q, 'author')}
                                onSelect={(item) => handleAddFavorite('author', item)}
                            />
                        )}
                    </div>

                    {/* Top Poems */}
                    <div className="bg-paper p-6 rounded-2xl border border-soft-border">
                        <h3 className="text-sm text-charcoal font-serif mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <BookOpen size={16} className="text-accent" />
                                Poèmes favoris
                            </span>
                            <span className="text-xs text-warm-gray font-sans">{optimisticPoems.length}/3</span>
                        </h3>
                        <div className="mb-4">
                            <SortableList
                                items={optimisticPoems}
                                emptyMessage="Aucun poème sélectionné"
                                onReorder={(items) => {
                                    setTopPoems(items);
                                    startTransition(() => {
                                        addOptimisticPoem(items);
                                    });
                                }}
                                onRemove={(id) => {
                                    const newItems = topPoems.filter(p => p.id !== id);
                                    setTopPoems(newItems);
                                    startTransition(() => {
                                        addOptimisticPoem(newItems);
                                    });
                                }}
                            />
                        </div>
                        {optimisticPoems.length < 3 && (
                            <SearchSelect
                                placeholder="Rechercher un poème…"
                                excludeIds={optimisticPoems.map(p => p.id)}
                                onSearch={(q) => handleSearchContent(q, 'poem')}
                                onSelect={(item) => handleAddFavorite('poem', item)}
                            />
                        )}
                    </div>
                </div>

                {favoritesState?.error && (
                    <p className="text-sm text-red-500 mt-4 text-right">{favoritesState.error}</p>
                )}
                {favoritesState?.success && (
                    <p className="text-sm text-accent mt-4 text-right flex items-center justify-end gap-1"><Check size={14}/> Favoris mis à jour</p>
                )}

                <div className="flex justify-end mt-8">
                    <button
                        type="submit"
                        disabled={isFavoritesPending}
                        className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isFavoritesPending ? "Enregistrement..." : "Enregistrer les favoris"}
                    </button>
                </div>
            </form>

            {/* ─── Password (Hidden if OAuth) ─── */}
            {!initialData.isOAuth && (
                <form action={passwordAction} className="py-10">
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
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    required
                                    className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 pr-12 text-sm text-charcoal outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                                >
                                    {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-warm-gray uppercase tracking-wider mb-2 font-medium">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    required
                                    minLength={6}
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
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                minLength={6}
                                className="w-full rounded-xl border border-soft-border bg-paper px-4 py-3 text-sm text-charcoal outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {passwordState?.error && (
                            <p className="text-sm text-red-500 mt-2">{passwordState.error}</p>
                        )}
                        {passwordState?.success && (
                            <p className="text-sm text-accent mt-2 flex items-center gap-1"><Check size={14}/> Mot de passe mis à jour</p>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isPasswordPending}
                                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-charcoal/90 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isPasswordPending ? "Chargement..." : "Modifier le mot de passe"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
