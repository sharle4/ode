import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import FadeIn from "@/components/ui/FadeIn";
import Image from "next/image";

interface StepAuthorsProps {
  authors: any[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function StepAuthors({ authors, selected, onChange }: StepAuthorsProps) {
  const toggleAuthor = (id: string) => {
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
            Quelles sont vos plumes favorites ?
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Nous utiliserons ces auteurs pour façonner vos recommandations. (Maximum 5)
          </p>
          <div className="mt-6 flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selected.length === 5 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
              {selected.length} / 5 sélectionnés
            </span>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {authors.map((author, index) => {
          const isSelected = selected.includes(author.id);
          const isDisabled = isMaxReached && !isSelected;

          return (
            <FadeIn key={author.id} delay={index * 0.02} className="h-full">
              <button
                type="button"
                onClick={() => toggleAuthor(author.id)}
                disabled={isDisabled}
                className={`w-full group relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 transform outline-none
                  ${isSelected
                    ? "bg-zinc-100 dark:bg-zinc-800 scale-[0.98] shadow-inner ring-2 ring-black dark:ring-white"
                    : "bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:scale-105"
                  }
                  ${isDisabled ? "opacity-30 cursor-not-allowed saturate-0" : "cursor-pointer active:scale-95"}
                `}
              >
                <div className="relative w-24 h-24 mb-4">
                  {author.image_url ? (
                    <Image
                      src={author.image_url}
                      alt={author.name}
                      fill
                      className="object-cover rounded-full shadow-md"
                      sizes="(max-width: 768px) 96px, 96px"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-playfair font-medium text-zinc-500">
                        {author.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Selected Overlay Checkmark */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                       <Check weight="bold" className="text-white w-8 h-8" />
                    </div>
                  )}
                </div>
                
                <span className={`font-medium text-center text-sm leading-tight sm:text-base ${isSelected ? 'text-black dark:text-white font-semibold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {author.name}
                </span>
                
              </button>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
