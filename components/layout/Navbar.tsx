"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  Compass,
  ListBullets,
  PencilLine,
  X,
  List,
  Moon,
  Sun,
} from "@phosphor-icons/react";
import OdeLogo from "@/components/ui/OdeLogo";
import { useTheme } from "next-themes";

const navLinks = [
  { label: "Explorer", icon: Compass, href: "#explore" },
  { label: "Mes Listes", icon: ListBullets, href: "#lists" },
  { label: "Ajouter", icon: PencilLine, href: "#log" },
];

const Navbar = React.memo(function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
          ? "bg-cream/70 backdrop-blur-xl border-b border-soft-border/60 shadow-sm"
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
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-4 md:px-8 py-4">
          <a href="/" className="flex-shrink-0 w-[72px] md:w-[88px]" aria-label="ode homepage">
            <OdeLogo width="100%" height="auto" />
          </a>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div
              className={`relative w-full transition-all duration-300 ${searchFocused ? "scale-[1.02]" : "scale-100"
                }`}
            >
              <MagnifyingGlass
                size={16}
                weight="regular"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray"
              />
              <input
                type="text"
                placeholder="Rechercher un poème, un auteur ou une émotion..."
                className="w-full rounded-full bg-paper/50 border border-soft-border shadow-[inset_0_1px_0_rgba(26,26,26,0.02)] backdrop-blur-sm py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-warm-gray/60 outline-none transition-all duration-300 focus:bg-paper focus:border-soft-border focus:shadow-[0_0_0_3px_rgba(26,26,26,0.05)]"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
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
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="ml-1 p-2 rounded-full text-charcoal/80 hover:bg-charcoal/5 hover:text-charcoal transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <div className="ml-3 h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-xs font-medium cursor-pointer">
              V
            </div>
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
                <div className="relative w-full">
                  <MagnifyingGlass
                    size={16}
                    weight="regular"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray/60"
                  />
                  <input
                    type="text"
                    placeholder="Rechercher des poèmes, auteurs..."
                    className="w-full rounded-full bg-zinc-900 border border-zinc-800 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50"
                  />
                </div>
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
