"use client";

import React from "react";
import { motion } from "framer-motion";

interface CollectionCardProps {
    collection: {
        title: string;
        year: number;
        poemCount: number;
        coverColor: string;
    };
    index: number;
}

export default function CollectionCard({ collection, index }: CollectionCardProps) {
    return (
        <motion.div
            className="flex flex-col group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
            }}
        >
            <div
                className={`relative w-full aspect-[2/3] rounded-r-lg rounded-l-sm shadow-md group-hover:shadow-xl transition-all duration-300 md:group-hover:-translate-y-2 overflow-hidden bg-gradient-to-br ${collection.coverColor}`}
            >
                {/* Effet reliure du livre */}
                <div className="absolute left-0 top-0 bottom-0 w-3 lg:w-4 bg-black/20 z-10 
                                border-r border-white/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]">
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 border-t border-white/10 bg-black/10 backdrop-blur-sm z-20">
                    <p className="font-serif text-white drop-shadow-md leading-tight text-lg sm:text-xl line-clamp-2">
                        {collection.title}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-baseline px-1">
                <span className="text-sm font-sans text-warm-gray">{collection.year}</span>
                <span className="text-xs uppercase tracking-widest text-warm-gray/60">{collection.poemCount} poèmes</span>
            </div>
        </motion.div>
    );
}
