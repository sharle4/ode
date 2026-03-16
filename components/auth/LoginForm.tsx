"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { loginAction } from "@/app/auth/actions";

interface LoginFormProps {
    redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { execute, result, isExecuting } = useAction(loginAction);

    const error = result?.data?.failure || result?.serverError;
    const validationErrors = result?.validationErrors;

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="space-y-2 mb-8">
                <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-charcoal">
                    Bon retour
                </h1>
                <p className="text-warm-gray text-sm">
                    Connectez-vous pour retrouver votre bibliothèque
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    execute({
                        email: fd.get("email") as string,
                        password: fd.get("password") as string,
                        redirectTo: fd.get("redirectTo") ? String(fd.get("redirectTo")) : undefined,
                    });
                }}
                className="space-y-5"
            >
                {/* Hidden redirect field */}
                {redirectTo && (
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                )}

                {/* Email */}
                <div className="space-y-1.5">
                    <label htmlFor="login-email" className="text-sm font-medium text-charcoal">
                        Email
                    </label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="username"
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
                    <label htmlFor="login-password" className="text-sm font-medium text-charcoal">
                        Mot de passe
                    </label>
                    <div className="relative">
                        <input
                            id="login-password"
                            name="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            minLength={6}
                            required
                            disabled={isExecuting}
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
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-sm text-accent bg-accent/[0.08] px-4 py-3 rounded-xl border border-accent/20">
                        {error}
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
                    Se connecter
                </button>
            </form>

            {/* Separator */}
            <div className="flex items-center gap-4 my-8">
                <hr className="flex-1 border-soft-border" />
                <span className="text-xs text-warm-gray uppercase tracking-widest">ou</span>
                <hr className="flex-1 border-soft-border" />
            </div>

            {/* Signup link */}
            <p className="text-center text-sm text-warm-gray">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-accent hover:text-accent-light font-medium transition-colors">
                    Créer un compte
                </Link>
            </p>
        </div>
    );
}
