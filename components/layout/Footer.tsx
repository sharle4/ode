import React from "react";
import OdeLogo from "@/components/ui/OdeLogo";

const footerColumns = [
  {
    title: "About",
    links: [
      { label: "Our Story", href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Trending Poems", href: "#" },
      { label: "Discussion", href: "#" },
      { label: "Curated Lists", href: "#" },
      { label: "Contributors", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Copyright", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Newsletter", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Mastodon", href: "#" },
      { label: "RSS Feed", href: "#" },
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

        <div className="mt-16 md:mt-24 flex flex-col items-center gap-6 border-t border-soft-border/40 pt-10">
          <div className="w-16 opacity-40">
            <OdeLogo width="100%" height="auto" />
          </div>
          <p className="text-xs text-warm-gray/50 text-center max-w-[40ch]">
            Poetry belongs to everyone. Read it in the language it was born in.
          </p>
          <p className="text-[11px] text-warm-gray/30 font-mono">
            2026 ode. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
