"use client";

import React, { useState, useEffect, Suspense } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  X,
  List,
  Moon,
  Sun,
} from "@phosphor-icons/react";
import OdeLogoStatic from "@/components/ui/OdeLogoStatic";
import NavbarSearch from "./NavbarSearch";
import ProfileDropdown from "./ProfileDropdown";
import { useTheme } from "next-themes";

const navLinks = [
  { label: "Explorer", icon: Compass, href: "/explore" },
];

const Navbar = React.memo(function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });
  };

  useEffect(() => {
    setMounted(true);
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled
          ? "bg-cream/70 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
          }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="flex-shrink-0 w-[72px] md:w-[88px] text-charcoal" aria-label="ode homepage">
            <OdeLogoStatic width="100%" height="auto" />
          </a>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Suspense fallback={
              <div className="relative w-full">
                <div className="w-full rounded-full bg-paper/50 border border-soft-border animate-pulse h-[46px]"></div>
              </div>
            }>
              <NavbarSearch variant="desktop" />
            </Suspense>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-charcoal/80 transition-colors duration-200 hover:bg-charcoal/5 hover:text-charcoal"
              >
                <link.icon size={18} weight="regular" />
                {link.label}
              </a>
            ))}

            {mounted && (
              <motion.button
                onClick={handleThemeToggle}
                className="ml-1 p-2 rounded-full text-charcoal/80 hover:bg-charcoal/5 hover:text-charcoal transition-colors relative flex items-center justify-center w-9 h-9"
                aria-label="Toggle theme"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {resolvedTheme === "dark" ? (
                    <motion.div
                      key="dark"
                      initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute"
                    >
                      <Sun size={18} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="light"
                      initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute"
                    >
                      <Moon size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            <ProfileDropdown />
          </div>

          <motion.button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-charcoal"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X size={22} weight="regular" />
            ) : (
              <List size={22} weight="regular" />
            )}
          </motion.button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-zinc-950/95 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          >
            <div className="flex flex-col items-start justify-center h-full px-8 pb-20 pt-24">
              <div className="w-full mb-8">
                <Suspense fallback={
                  <div className="relative w-full h-[46px] rounded-full bg-zinc-900 animate-pulse"></div>
                }>
                  <NavbarSearch variant="mobile" />
                </Suspense>
              </div>

              <nav className="flex flex-col gap-2 w-full">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-4 rounded-2xl px-4 py-4 text-white transition-colors hover:bg-white/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: i * 0.08,
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon size={24} weight="regular" />
                    <span className="text-lg">{link.label}</span>
                  </motion.a>
                ))}
              </nav>

              <motion.div
                className="mt-12 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-sm font-medium">
                  V
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Profil</p>
                  <p className="text-xs text-zinc-400">Voir votre bibliothèque</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default Navbar;
