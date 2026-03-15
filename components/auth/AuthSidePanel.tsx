import React from "react";
import OdeLogoStatic from "@/components/ui/OdeLogoStatic";
import { BookOpenText, UsersThree, Sparkle } from "@phosphor-icons/react/dist/ssr";

interface AuthSidePanelProps {
    variant?: "login" | "signup";
}

const features = [
    {
        icon: BookOpenText,
        title: "Bibliothèque infinie",
        desc: "Des milliers de poèmes, de l'Antiquité à nos jours.",
    },
    {
        icon: UsersThree,
        title: "Communauté vivante",
        desc: "Partagez vos lectures et découvrez celles des autres.",
    },
    {
        icon: Sparkle,
        title: "Découvertes personnalisées",
        desc: "Des recommandations affinées par vos goûts.",
    },
];

export default function AuthSidePanel({ variant = "login" }: AuthSidePanelProps) {
    return (
        <div className="hidden md:flex flex-col justify-center items-center h-full px-12 lg:px-16 bg-paper relative overflow-hidden">
            {/* Decorative soft glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/[0.04] blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-sm w-full space-y-10">
                {/* Logo */}
                <div className="w-[140px] text-charcoal">
                    <OdeLogoStatic width="100%" height="auto" />
                </div>

                {/* Citation */}
                <blockquote className="border-l-2 border-accent/30 pl-5">
                    <p className="font-serif italic text-lg text-charcoal/80 leading-relaxed">
                        {variant === "login"
                            ? "La poésie, c'est le plus joli surnom qu'on donne à la vie."
                            : "Chaque poème est une clé qui ouvre une porte sur l'infini."}
                    </p>
                    <footer className="mt-3 text-sm text-warm-gray">
                        {variant === "login" ? "— Jacques Prévert" : "— Lamartine"}
                    </footer>
                </blockquote>

                {/* Features */}
                <div className="space-y-5 pt-2">
                    {features.map((f) => (
                        <div key={f.title} className="flex items-start gap-3.5">
                            <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                                <f.icon size={18} weight="duotone" className="text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-charcoal">{f.title}</p>
                                <p className="text-xs text-warm-gray leading-relaxed mt-0.5">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
