import React from "react";
import OdeLogo from "@/components/ui/OdeLogo";

export default function Footer() {
  return (
    <footer className="border-t border-soft-border/60 bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 flex flex-col items-center gap-4 text-center">
        <div className="w-16 opacity-40 hover:opacity-70 transition-opacity">
          <OdeLogo width="100%" height="auto" />
        </div>
        <p className="text-xs text-warm-gray max-w-[42ch] leading-relaxed">
          La poésie appartient à tous. Rejoignez la plus grande communauté de lecteurs au monde.
        </p>
        <p className="text-[11px] text-warm-gray/60 font-mono">
          © 2026 ode. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
