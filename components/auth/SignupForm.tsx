"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { Eye, EyeSlash, Check } from "@phosphor-icons/react";
import { signupAction } from "@/app/auth/actions";

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    const { execute, result, isExecuting } = useAction(signupAction);

    const error = result?.data?.failure || result?.serverError;
    const success = result?.data?.success;
    const validationErrors = result?.validationErrors;

    // Password strength checks
    const hasMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="space-y-2 mb-8">
                <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-charcoal">
                    Créer un compte
                </h1>
                <p className="text-warm-gray text-sm">
                    Rejoignez la communauté francophone de la poésie
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    execute({
                        email: fd.get("email") as string,
                        password: fd.get("password") as string,
                        username: fd.get("username") as string,
                    });
                }}
                className="space-y-5"
            >
                {/* Username */}
                <div className="space-y-1.5">
                    <label htmlFor="signup-username" className="text-sm font-medium text-charcoal">
                        Nom d&apos;utilisateur
                    </label>
                    <input
                        id="signup-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="cbaudelaire"
                        required
                        minLength={3}
                        disabled={isExecuting}
                        className="w-full px-4 py-3 bg-paper border border-soft-border rounded-xl text-charcoal placeholder-warm-gray/50 outline-none transition-all duration-200 focus:ring-2 focus:ring-accent/40 focus:border-transparent disabled:opacity-50"
                    />
                    {validationErrors?.username && (
                        <p className="text-xs text-accent mt-1">{validationErrors.username._errors?.[0]}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label htmlFor="signup-email" className="text-sm font-medium text-charcoal">
                        Email
                    </label>
                    <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="baudelaire@spleen.fr"
                        required
                        disabled={isExecuting}
                        className="w-full px-4 py-3 bg-paper border border-soft-border rounded-xl text-charcoal placeholder-warm-gray/50 outline-none transition-all duration-200 focus:ring-2 focus:ring-accent/40 focus:border-transparent disabled:opacity-50"
                    />
                    {validationErrors?.email && (
                        <p className="text-xs text-accent mt-1">{validationErrors.email._errors?.[0]}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="text-sm font-medium text-charcoal">
                        Mot de passe
                    </label>
                    <div className="relative">
                        <input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            minLength={6}
                            required
                            disabled={isExecuting}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-paper border border-soft-border rounded-xl text-charcoal outline-none transition-all duration-200 focus:ring-2 focus:ring-accent/40 focus:border-transparent disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            aria-pressed={showPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warm-gray hover:text-charcoal transition-colors"
                        >
                            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {validationErrors?.password && (
                        <p className="text-xs text-accent mt-1">{validationErrors.password._errors?.[0]}</p>
                    )}

                    {/* Password strength indicator */}
                    {password.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-2.5">
                            <PasswordCheck met={hasMinLength} label="6 caractères minimum" />
                            <PasswordCheck met={hasUppercase} label="Une majuscule" />
                            <PasswordCheck met={hasNumber} label="Un chiffre" />
                        </div>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-sm text-accent bg-accent/[0.08] px-4 py-3 rounded-xl border border-accent/20">
                        {error}
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-500/[0.08] px-4 py-3 rounded-xl border border-emerald-500/20">
                        {success}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isExecuting}
                    className="w-full py-3.5 px-6 bg-charcoal text-cream font-medium rounded-full text-sm transition-all duration-200 hover:bg-charcoal/90 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                >
                    {isExecuting && (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                        </svg>
                    )}
                    Créer mon compte
                </button>
            </form>

            {/* Separator */}
            <div className="flex items-center gap-4 my-8">
                <hr className="flex-1 border-soft-border" />
                <span className="text-xs text-warm-gray uppercase tracking-widest">ou</span>
                <hr className="flex-1 border-soft-border" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-warm-gray">
                Déjà un compte ?{" "}
                <Link href="/login" className="text-accent hover:text-accent-light font-medium transition-colors">
                    Se connecter
                </Link>
            </p>
        </div>
    );
}

function PasswordCheck({ met, label }: { met: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors duration-200 ${met ? "bg-emerald-500" : "bg-soft-border"}`}>
                {met && <Check size={9} weight="bold" className="text-white" />}
            </div>
            <span className={`text-xs transition-colors duration-200 ${met ? "text-charcoal" : "text-warm-gray"}`}>
                {label}
            </span>
        </div>
    );
}
