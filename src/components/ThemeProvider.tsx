"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  effectiveTheme: 'light' | 'dark'; // Le thème réellement appliqué
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateEffectiveTheme = () => {
      let newEffectiveTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        newEffectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newEffectiveTheme = theme as 'light' | 'dark';
      }
      
      setEffectiveTheme(newEffectiveTheme);
      
      // Pour Tailwind v4, on utilise data-theme au lieu de classe
      const htmlElement = document.documentElement;
      
      if (theme === 'system') {
        // Supprime l'attribut pour laisser Tailwind utiliser prefers-color-scheme
        htmlElement.removeAttribute('data-theme');
      } else {
        // Force le thème spécifique
        htmlElement.setAttribute('data-theme', newEffectiveTheme);
      }
      
      localStorage.setItem('theme', theme);
      console.log(`Thème: ${theme}, Effectif: ${newEffectiveTheme}`);
    };

    updateEffectiveTheme();

    // Écoute les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateEffectiveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      // Cycle: system -> light -> dark -> system
      if (prevTheme === 'system') return 'light';
      if (prevTheme === 'light') return 'dark';
      return 'system';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}