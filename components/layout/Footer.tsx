import React from "react";
import OdeLogo from "@/components/ui/OdeLogo";

const footerColumns = [
  {
    title: "À propos",
    links: [
      { label: "Notre Histoire", href: "#" },
      { label: "Comment ça marche", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Presse", href: "#" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { label: "Poèmes Populaires", href: "#" },
      { label: "Discussions", href: "#" },
      { label: "Sélections", href: "#" },
      { label: "Contributeurs", href: "#" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Confidentialité", href: "#" },
      { label: "Conditions d'utilisation", href: "#" },
      { label: "Droits d'auteur", href: "#" },
      { label: "Accessibilité", href: "#" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Newsletter", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Mastodon", href: "#" },
      { label: "Flux RSS", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-soft-border/60 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-medium uppercase tracking-widest text-warm-gray mb-5">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-charcoal/60 transition-colors duration-200 hover:text-charcoal"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 md:mt-24 flex flex-col items-center gap-6 border-t border-soft-border/60 pt-10">
          <div className="w-16 opacity-40">
            <OdeLogo width="100%" height="auto" />
          </div>
          <p className="text-xs text-warm-gray text-center max-w-[40ch]">
            La poésie appartient à tous. Rejoignez la plus grande communauté de lecteurs au monde.
          </p>
          <p className="text-[11px] text-warm-gray/50 font-mono">
            2026 ode. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
