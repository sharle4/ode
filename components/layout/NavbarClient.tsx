"use client";

import React, { useState, useEffect, Suspense } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

let hasAnimated = false;

import { type UserProfile } from "./Navbar";

interface NavbarClientProps {
  userProfile: UserProfile;
  forceSolidBackground?: boolean;
}

const NavbarClient = React.memo(function NavbarClient({
  userProfile,
  forceSolidBackground = false,
}: NavbarClientProps) {
  const pathname = usePathname();
  const isAuthorPage = pathname ? pathname.startsWith("/author") : false;
  const isFirstMount = !hasAnimated;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    hasAnimated = true;

    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const isSolid = forceSolidBackground || isAuthorPage || scrolled;

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isSolid
          ? "bg-cream/80 backdrop-blur-xl border-b border-soft-border/40 shadow-xs"
          : "bg-transparent"
          }`}
        initial={isFirstMount ? { y: -80 } : false}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="flex-shrink-0 w-[90px] md:w-[110px] text-charcoal" aria-label="ode homepage">
            <OdeLogoStatic width="100%" height="auto" />
          </a>

          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <Suspense fallback={
              <div className="relative w-full">
                <div className="w-full rounded-full bg-paper/50 border border-soft-border animate-pulse h-[46px]"></div>
              </div>
            }>
              <NavbarSearch variant="desktop" />
            </Suspense>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <a
              href="/explore"
              className="p-2 rounded-full text-charcoal/80 hover:bg-charcoal/5 hover:text-charcoal transition-colors relative flex items-center justify-center w-9 h-9"
              aria-label="Explorer le catalogue"
              title="Explorer"
            >
              <Compass size={19} weight="regular" />
            </a>

            <button
                onClick={handleThemeToggle}
                className="p-2 rounded-full text-charcoal/80 hover:bg-charcoal/5 hover:text-charcoal transition-colors relative flex items-center justify-center w-9 h-9"
                aria-label="Changer de thème"
                title="Changer de thème"
            >
                {/* 
                  Using pure CSS (hidden/block) for the icons ensures no hydration mismatch
                  nor flashing when the page performs SSR and first paints.
                */}
                <Sun size={18} className="hidden dark:block" />
                <Moon size={18} className="block dark:hidden" />
            </button>

            <ProfileDropdown userProfile={userProfile} />
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
      </motion.header >

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
                  <NavbarSearch variant="mobile" onNavigate={() => setMobileMenuOpen(false)} />
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

              {userProfile ? (
                <motion.div
                  className="mt-12 flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="h-11 w-11 overflow-hidden relative rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-sm font-medium">
                    {userProfile.avatar_url ? (
                      <img src={userProfile.avatar_url} alt={userProfile.username} className="w-full h-full object-cover" />
                    ) : (
                      userProfile.username?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{userProfile.username || "Profil"}</p>
                    <p className="text-xs text-zinc-400">Voir votre bibliothèque</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="mt-12 flex flex-col gap-3 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-full border border-white/20 text-white px-6 py-3.5 text-sm font-medium transition-colors hover:bg-white/10"
                  >
                    Se connecter
                  </a>
                  <a
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-full bg-accent text-white px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent-light"
                  >
                    Créer un compte
                  </a>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.userProfile?.id === nextProps.userProfile?.id &&
    prevProps.userProfile?.username === nextProps.userProfile?.username &&
    prevProps.userProfile?.avatar_url === nextProps.userProfile?.avatar_url &&
    prevProps.userProfile?.email === nextProps.userProfile?.email &&
    prevProps.forceSolidBackground === nextProps.forceSolidBackground
  );
});

export default NavbarClient;
