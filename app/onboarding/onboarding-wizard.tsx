"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { submitOnboarding } from "@/app/actions/onboarding";
import { Check, ArrowRight, ArrowLeft } from "@phosphor-icons/react";

// Components for steps (to be implemented)
import StepCategories from "./step-categories";
import StepAuthors from "./step-authors";
import StepReader from "./step-reader";

interface OnboardingWizardProps {
  initialCategories: any[];
  initialAuthors: any[];
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? "10%" : "-10%",
      opacity: 0,
      scale: 0.98,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? "10%" : "-10%",
      opacity: 0,
      scale: 0.98,
    };
  },
};

export default function OnboardingWizard({
  initialCategories,
  initialAuthors,
}: OnboardingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse step from URL
  const stepParam = searchParams.get("step") || "categories";
  const stepIndex = useMemo(() => {
    if (stepParam === "authors") return 1;
    if (stepParam === "reader") return 2;
    return 0; // "categories"
  }, [stepParam]);

  const previousStep = useRef(stepIndex);
  const direction = stepIndex > previousStep.current ? 1 : -1;

  useEffect(() => {
    previousStep.current = stepIndex;
  }, [stepIndex]);

  // Handle Browser Native Back/Forward effortlessly with Next.js url state
  // (No popstate listener needed, searchParams is reactive)

  // Shared State across steps
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [typography, setTypography] = useState<"serif" | "sans">("serif");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("system");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large" | "xlarge">("medium");

  // Flow Navigation logic (Shallow routing without triggering server requests)
  const goToStep = (newStep: string) => {
    router.push(`?step=${newStep}`, { scroll: false }); 
  };

  const handleNext = () => {
    if (stepIndex === 0) goToStep("authors");
    else if (stepIndex === 1) goToStep("reader");
  };

  const handleBack = () => {
    if (stepIndex === 1) goToStep("categories");
    else if (stepIndex === 2) goToStep("authors");
  };

  const handleSkip = () => {
    submit({ action: "skip" });
  };

  const handleSubmit = () => {
    submit({ action: "submit" });
  };

  const submit = (overridePayload?: any) => {
    startTransition(async () => {
      // Try to prepare the user experience for the exit by prefetching Home earlier
      // but double check it here.

      const payload = {
        action: "submit",
        categories: selectedCategories,
        authors: selectedAuthors,
        typography,
        theme,
        fontSize,
        ...(overridePayload || {}),
      };

      try {
        const result = await submitOnboarding(payload);
        if (result?.data?.success) {
           router.replace("/");
        } else {
           console.error("Action returned an error", result?.serverError || result?.validationErrors);
           alert("Une erreur est survenue.");
        }
      } catch (err) {
        console.error("Network crash:", err);
        alert("Problème réseau. Vos données sont préservées, réessayez.");
      }
    });
  };

  // Pre-fetch step conditions
  useEffect(() => {
    if (stepIndex === 2) {
      router.prefetch("/");
    }
  }, [stepIndex, router]);

  const canProceed = () => {
    if (stepIndex === 0) return selectedCategories.length > 0;
    if (stepIndex === 1) return selectedAuthors.length > 0;
    return true; // Step 2 (reader) always allows processing
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col overflow-hidden">
        {/* TOP NAVBAR (Skip Button) */}
        <header className="absolute top-0 w-full p-6 sm:p-8 flex justify-end z-20">
             <button
                type="button"
                onClick={handleSkip}
                disabled={isPending}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                aria-label="Ignorer l'onboarding"
             >
                Ignorer
             </button>
        </header>

        {/* MAIN BODY AND ANIMATIONS */}
        <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-24 px-4 sm:px-6">

             <AnimatePresence mode="wait" initial={false} custom={direction}>
                 <motion.div
                    key={stepIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="w-full max-w-5xl mx-auto"
                 >
                     {stepIndex === 0 && (
                        <StepCategories 
                           categories={initialCategories} 
                           selected={selectedCategories} 
                           onChange={setSelectedCategories} 
                        />
                     )}
                     {stepIndex === 1 && (
                        <StepAuthors 
                           authors={initialAuthors} 
                           selected={selectedAuthors} 
                           onChange={setSelectedAuthors} 
                        />
                     )}
                     {stepIndex === 2 && (
                        <StepReader 
                           typography={typography} setTypography={setTypography}
                           theme={theme} setTheme={setTheme}
                           fontSize={fontSize} setFontSize={setFontSize}
                        />
                     )}
                 </motion.div>
             </AnimatePresence>

        </div>

        {/* BOTTOM NAVIGATION FOOTER */}
        <footer className="fixed bottom-0 w-full bg-cream/90 dark:bg-zinc-950/90 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 p-4 z-20">
             <div className="max-w-5xl mx-auto flex items-center justify-between">
                 
                 <div className="flex-1">
                     {stepIndex > 0 && (
                         <button 
                             onClick={handleBack} 
                             disabled={isPending}
                             className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-2"
                         >
                             <ArrowLeft weight="bold" />
                             <span>Précédent</span>
                         </button>
                     )}
                 </div>

                 <div className="flex-1 flex justify-center gap-1.5">
                    {/* Dots indicator */}
                    {[0,1,2].map((idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${stepIndex === idx ? 'w-6 bg-black dark:bg-white' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'}`} />
                    ))}
                 </div>

                 <div className="flex-1 flex justify-end">
                     {stepIndex < 2 ? (
                         <button
                             onClick={handleNext}
                             disabled={!canProceed() || isPending}
                             className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full font-medium disabled:opacity-50 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                         >
                             <span>Suivant</span>
                             <ArrowRight weight="bold" />
                         </button>
                     ) : (
                         <button
                             onClick={handleSubmit}
                             disabled={isPending}
                             className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
                         >
                             <span>{isPending ? "Sauvegarde..." : "Terminer"}</span>
                             {!isPending && <Check weight="bold" />}
                         </button>
                     )}
                 </div>

             </div>
        </footer>
    </div>
  );
}
