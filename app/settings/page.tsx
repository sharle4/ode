import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SettingsForm from "@/components/settings/SettingsForm";
import FadeIn from "@/components/ui/FadeIn";
import { Metadata } from "next";
import { Gear } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
    title: "Paramètres - ode",
    description:
        "Gérez votre profil, vos préférences et la sécurité de votre compte ode.",
};

export default function SettingsPage() {
    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <FadeIn delay={0.1}>
                        <div className="mb-12 md:mb-16">
                            <div className="flex items-center gap-3 mb-3">
                                <Gear size={24} className="text-accent" />
                                <h1 className="font-serif text-3xl md:text-4xl text-charcoal tracking-tight">
                                    Paramètres
                                </h1>
                            </div>
                            <p className="text-sm text-warm-gray max-w-lg">
                                Personnalisez votre profil, choisissez vos
                                préférences et gérez la sécurité de votre
                                compte.
                            </p>
                        </div>
                    </FadeIn>

                    {/* Settings Sections */}
                    <FadeIn delay={0.3}>
                        <SettingsForm />
                    </FadeIn>
                </div>
            </main>

            <Footer />
        </div>
    );
}
