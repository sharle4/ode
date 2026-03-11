"use client";

import { useEffect } from "react";

interface SyncPreferencesProps {
  typography: string;
  theme: string;
  fontSize: string;
}

export function SyncPreferences({
  typography,
  theme,
  fontSize,
}: SyncPreferencesProps) {
  useEffect(() => {
    try {
      const localTypography = localStorage.getItem("ode_typography");
      const localTheme = localStorage.getItem("ode_theme");
      const localFontSize = localStorage.getItem("ode_font_size");

      let updated = false;

      // Sync and Mutate Typography
      if (localTypography !== typography && typography) {
        localStorage.setItem("ode_typography", typography);
        document.documentElement.setAttribute("data-typography", typography);
        updated = true;
      }

      // Sync and Mutate Theme (respecting next-themes if possible, or forcing data-theme)
      // next-themes uses standard localStorage 'theme' key, so we sync with that too
      if (theme && theme !== "system") {
         const currentNextTheme = localStorage.getItem("theme");
         if(currentNextTheme !== theme) {
             localStorage.setItem("theme", theme);
             // next-themes normally uses class 'dark' or 'light'
             if(theme === 'dark') {
                 document.documentElement.classList.add('dark');
                 document.documentElement.classList.remove('light');
             } else {
                 document.documentElement.classList.add('light');
                 document.documentElement.classList.remove('dark');
             }
         }
      }

      // Sync and Mutate Font Size
      if (localFontSize !== fontSize && fontSize) {
        localStorage.setItem("ode_font_size", fontSize);
        document.documentElement.setAttribute("data-font-size", fontSize);
        updated = true;
      }
      
    } catch (e) {
      // Browsers with strict privacy settings might throw on localStorage access
      console.warn("Could not sync preferences to localStorage:", e);
    }
  }, [typography, theme, fontSize]);

  return null; // This is a silent, renderless component
}
