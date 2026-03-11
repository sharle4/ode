import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";

interface StepCategoriesProps {
  categories: any[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function StepCategories({ categories, selected, onChange }: StepCategoriesProps) {
  const toggleCategory = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      if (selected.length < 5) {
        onChange([...selected, id]);
      }
    }
  };

  const isMaxReached = selected.length >= 5;

  return (
    <div className="w-full flex flex-col pt-12">
      <FadeIn>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">
            Qu'aimez-vous lire ?
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Sélectionnez 1 à 5 thèmes pour commencer à personnaliser votre recueil infini.
          </p>
          <div className="mt-6 flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selected.length === 5 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
              {selected.length} / 5 sélectionnés
            </span>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((category, index) => {
          const isSelected = selected.includes(category.id);
          const isDisabled = isMaxReached && !isSelected;

          return (
            <FadeIn key={category.id} delay={index * 0.03} className="h-full">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                disabled={isDisabled}
                className={`w-full group relative aspect-square sm:aspect-auto sm:h-32 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 transform outline-none
                  ${isSelected
                    ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black scale-[0.98] shadow-inner"
                    : "border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  }
                  ${isDisabled ? "opacity-40 cursor-not-allowed saturate-0" : "cursor-pointer active:scale-95"}
                `}
              >
                {/* Check icon overlay */}
                <div 
                   className={`absolute top-3 right-3 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                >
                   <Check weight="bold" className="w-5 h-5" />
                </div>
                
                <span className={`font-medium text-center leading-tight sm:text-lg ${isSelected ? 'font-semibold' : ''}`}>
                  {category.name}
                </span>
                {/* Optional: if you have emojis or icons for categories in the DB, render them here */}
                {category.emoji && (
                  <span className="text-2xl mt-2 block">{category.emoji}</span>
                )}
              </button>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
