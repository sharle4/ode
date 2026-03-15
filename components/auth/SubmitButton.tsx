"use client";

import { useFormStatus } from "react-dom";
import { SpinnerGap } from "@phosphor-icons/react";

interface SubmitButtonProps {
    children: React.ReactNode;
    className?: string;
}

export default function SubmitButton({ children, className = "" }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`relative inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${className}`}
        >
            {pending && (
                <SpinnerGap size={18} weight="bold" className="animate-spin" />
            )}
            {children}
        </button>
    );
}
