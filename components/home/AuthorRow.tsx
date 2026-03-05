"use client";

import React, { useRef } from "react";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

interface Author {
    name: string;
    slug: string;
    img: string;
}

interface AuthorRowProps {
    title: string;
    subtitle?: string;
    authors: Author[];
}

const AuthorRow = React.memo(function AuthorRow({
    title,
    subtitle,
    authors,
}: AuthorRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    function scrollBy(direction: "left" | "right") {
        if (!scrollRef.current) return;
        const scrollAmount = direction === "left" ? -400 : 400;
        scrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
        });
    }

    return (
        <FadeIn className="py-8 md:py-12 bg-charcoal text-cream" y={40} duration={0.8} delay={0.2}>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8 md:mb-12">
                    <div>
                        <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-cream">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1.5 text-sm text-white/60">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scrollBy("left")}
                            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
                            aria-label="Scroll left"
                        >
                            <CaretLeft size={18} weight="bold" />
                        </button>
                        <button
                            onClick={() => scrollBy("right")}
                            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
                            aria-label="Scroll right"
                        >
                            <CaretRight size={18} weight="bold" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-6 md:gap-10 pb-8 pt-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory scroll-smooth"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {authors.map((author, index) => (
                            <Link
                                href={`/author/${author.slug}`}
                                key={author.slug}
                                className="flex-none w-[120px] sm:w-[140px] md:w-[160px] snap-center md:snap-start flex flex-col items-center group cursor-pointer"
                            >
                                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden mb-4 shadow-xl border-2 border-charcoal group-hover:border-accent group-hover:shadow-accent/20 transition-all duration-300 md:group-hover:-translate-y-2">
                                    <img
                                        src={author.img}
                                        alt={author.name}
                                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                    />
                                </div>
                                <span className="font-medium text-center text-sm md:text-base text-cream group-hover:text-accent transition-colors block text-balance">
                                    {author.name}
                                </span>
                            </Link>
                        ))}

                        <Link href="/explore" className="flex-none w-[120px] sm:w-[140px] md:w-[160px] snap-center md:snap-start flex flex-col items-center justify-center group cursor-pointer">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/50 mb-4 bg-white/5 group-hover:border-accent group-hover:text-accent transition-all duration-300">
                                <CaretRight size={32} weight="light" />
                            </div>
                            <span className="font-medium text-center text-sm md:text-base text-white/50 group-hover:text-accent transition-colors block">
                                Tous les auteurs
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
});

export default AuthorRow;
