import React from "react";

interface StatBlockProps {
    value: number | string;
    label: string;
}

export default function StatBlock({ value, label }: StatBlockProps) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-serif text-charcoal leading-none mb-1">
                {value}
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-warm-gray font-medium">
                {label}
            </span>
        </div>
    );
}
