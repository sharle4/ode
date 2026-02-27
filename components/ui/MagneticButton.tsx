"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  strength?: number;
}

const MagneticButton = React.memo(function MagneticButton({
  children,
  className = "",
  onClick,
  as = "button",
  href,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(useTransform(mouseX, (v) => v * strength), springConfig);
  const y = useSpring(useTransform(mouseY, (v) => v * strength), springConfig);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const Component = as === "a" ? motion.a : motion.button;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
      style={{ x, y }}
    >
      <Component
        className={className}
        onClick={onClick}
        href={as === "a" ? href : undefined}
        whileTap={{ scale: 0.97, y: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        {children}
      </Component>
    </motion.div>
  );
});

export default MagneticButton;
