"use client";

import React from "react";
import { motion } from "framer-motion";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    y?: number;
    className?: string;
    as?: React.ElementType;
}

export default function FadeIn({ children, delay = 0, duration = 0.6, y = 20, className = "" }: FadeInProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}
