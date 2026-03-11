"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function SyncPreferences() {
  useEffect(() => {
    const syncWithDB = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data: profile } = await supabase
          .from("users")
          .select("typography_preference, theme_preference, font_size")
          .eq("id", user.id)
          .single();

        if (profile) {
          const typography = profile.typography_preference || "serif";
          const theme = profile.theme_preference || "system";
          const fontSize = profile.font_size || "medium";

          const localTypography = localStorage.getItem("ode_typography");
          const localTheme = localStorage.getItem("ode_theme");
          const localFontSize = localStorage.getItem("ode_font_size");

          // Sync Typography
          if (localTypography !== typography) {
            localStorage.setItem("ode_typography", typography);
            document.documentElement.setAttribute("data-typography", typography);
          }

          // Sync Theme
          if (theme !== "system") {
            const currentNextTheme = localStorage.getItem("theme");
            if (currentNextTheme !== theme) {
                localStorage.setItem("theme", theme);
                if(theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                }
            }
          }

          // Sync Font Size
          if (localFontSize !== fontSize) {
            localStorage.setItem("ode_font_size", fontSize);
            document.documentElement.setAttribute("data-font-size", fontSize);
          }
        }
      } catch (e) {
        console.warn("Could not sync preferences to localStorage:", e);
      }
    };

    syncWithDB();
  }, []);

  return null;
}
