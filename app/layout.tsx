import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SyncPreferences } from "@/components/sync-preferences";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import NextTopLoader from "nextjs-toploader";

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
  title: "ode",
  description:
    "Explorez la plus grande base de données de poèmes au monde. Notez, découvrez et discutez de poèmes de toutes les époques avec une communauté de lecteurs passionnés.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <NextTopLoader
          color="#B85450"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2.5}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px rgba(184, 84, 80, 0.5), 0 0 5px rgba(184, 84, 80, 0.3)"
          zIndex={99999}
        />
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
            {/* Invisible component syncing SSOT to LocalStorage for multi-device */}
            <SyncPreferences />

            {children}
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
