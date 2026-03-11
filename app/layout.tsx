import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SyncPreferences } from "@/components/sync-preferences";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ode -- La plus grande communauté de poésie",
  description:
    "Explorez la plus grande base de données de poèmes au monde. Notez, découvrez et discutez de poèmes de toutes les époques avec une communauté de lecteurs passionnés.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user preferences server-side strictly for multi-device synchronization
  // This does not break SSG for public unauthenticated pages because the
  // layout relies on client-side localStorage scripts for the initial paint.
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  let typography = "serif";
  let theme = "system";
  let fontSize = "medium";

  // If user is logged in, fetch their DB preferences
  if (user) {
    const { data: profile } = await (await supabase)
      .from("users")
      .select("typography_preference, theme_preference, font_size")
      .eq("id", user.id)
      .single();

    if (profile) {
      typography = profile.typography_preference || "serif";
      theme = profile.theme_preference || "system";
      fontSize = profile.font_size || "medium";
    }
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Zero-FOUC script: Reads localStorage unconditionally before first paint */}
        <script
          dangerouslySetInnerHTML={{
             __html: `
              try {
                var localTypo = localStorage.getItem("ode_typography");
                var localFontSize = localStorage.getItem("ode_font_size");
                if (localTypo) document.documentElement.setAttribute("data-typography", localTypo);
                if (localFontSize) document.documentElement.setAttribute("data-font-size", localFontSize);
              } catch (e) { console.warn("localStorage accessing blocked"); }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          {/* Invisible component syncing SSOT to LocalStorage for multi-device */}
          {user && (
            <SyncPreferences
              typography={typography}
              theme={theme}
              fontSize={fontSize}
            />
          )}

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
