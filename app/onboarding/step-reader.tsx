import { useEffect, useRef } from "react";
import FadeIn from "@/components/ui/FadeIn";
import { Moon, Sun, Monitor, TextT, TextAUnderline } from "@phosphor-icons/react";

interface StepReaderProps {
  typography: "serif" | "sans";
  setTypography: (val: "serif" | "sans") => void;
  theme: "dark" | "light" | "system";
  setTheme: (val: "dark" | "light" | "system") => void;
  fontSize: "small" | "medium" | "large" | "xlarge";
  setFontSize: (val: "small" | "medium" | "large" | "xlarge") => void;
}

export default function StepReader({
  typography, setTypography,
  theme, setTheme,
  fontSize, setFontSize
}: StepReaderProps) {

  // Live Preview DOM Mutation Engine
  // This executes independently of React's render cycle to give instantaneous 0ms feedback
  // matching exactly what our layout.tsx zero-FOUC script will do globally.
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    
    // Apply styling to the isolated preview container
    const el = previewRef.current;
    
    // Theme application (simulating the global html data-theme or class)
    el.className = `w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-xl transition-all duration-500 ease-out border ${
        theme === 'dark' ? 'bg-zinc-950 border-zinc-900 text-zinc-300' :
        theme === 'light' ? 'bg-white border-zinc-200 text-zinc-800' :
        // System fallback: In a real scenario we'd query matchMedia, here we'll assume dark for the preview if system
        'bg-zinc-900 border-zinc-800 text-zinc-300'
    }`;

    // Typography & Font Size mapping (matching global Tailwind rules we should add)
    // We use inline styles here for the absolute fastest preview without relying on tailwind compilation
    let fontFamily = typography === 'serif' ? 'var(--font-playfair), serif' : 'var(--font-geist-sans), sans-serif';
    let sizeClass = 'text-base';
    
    switch(fontSize) {
      case 'small': sizeClass = 'text-sm md:text-base'; break;
      case 'medium': sizeClass = 'text-lg md:text-xl'; break;
      case 'large': sizeClass = 'text-xl md:text-2xl'; break;
      case 'xlarge': sizeClass = 'text-2xl md:text-3xl'; break;
    }

    el.setAttribute('style', `font-family: ${fontFamily};`);
    
    // Update the poem text size
    const title = el.querySelector('h2');
    const body = el.querySelector('div');
    if (title && body) {
         title.className = `font-bold mb-6 ${sizeClass === 'text-sm md:text-base' ? 'text-2xl' : sizeClass === 'text-lg md:text-xl' ? 'text-3xl' : sizeClass === 'text-xl md:text-2xl' ? 'text-4xl' : 'text-5xl'}`;
         body.className = `leading-relaxed space-y-4 ${sizeClass}`;
    }

  }, [typography, theme, fontSize]);

  return (
    <div className="w-full flex flex-col pt-4 md:pt-12">
      <FadeIn>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">
            Votre expérience de lecture
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Ajustez l'interface pour un confort optimal. Vous pourrez toujours modifier ces réglages plus tard.
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start justify-center mt-4">
        
        {/* left controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
            <FadeIn delay={0.1}>
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Typographie</label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 relative">
                        <button
                            onClick={() => setTypography('serif')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${typography === 'serif' ? 'bg-white dark:bg-zinc-800 shadow text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                        >
                            <span style={{ fontFamily: 'var(--font-playfair), serif' }} className="text-lg">Classique</span>
                        </button>
                        <button
                            onClick={() => setTypography('sans')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${typography === 'sans' ? 'bg-white dark:bg-zinc-800 shadow text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                        >
                            <span style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>Moderne</span>
                        </button>
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.2}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Taille du texte</label>
                        <span className="text-xs text-zinc-400 capitalize">{fontSize}</span>
                    </div>
                    
                    <input 
                        type="range" 
                        min="75" max="150" step="25"
                        value={fontSize === 'small' ? 75 : fontSize === 'medium' ? 100 : fontSize === 'large' ? 125 : 150}
                        onChange={(e) => {
                            const val = e.target.value;
                            if(val === '75') setFontSize('small');
                            if(val === '100') setFontSize('medium');
                            if(val === '125') setFontSize('large');
                            if(val === '150') setFontSize('xlarge');
                        }}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                    />
                    <div className="flex justify-between px-1">
                        <TextT className="w-3 h-3 text-zinc-400" />
                        <TextT className="w-5 h-5 text-zinc-400" />
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.3}>
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Thème Visuel</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-800 text-black dark:text-white' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                        >
                            <Sun className="w-6 h-6" />
                            <span className="text-xs font-medium">Clair</span>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-800 text-black dark:text-white' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                        >
                            <Moon className="w-6 h-6" />
                            <span className="text-xs font-medium">Sombre</span>
                        </button>
                        <button
                            onClick={() => setTheme('system')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-800 text-black dark:text-white' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                        >
                            <Monitor className="w-6 h-6" />
                            <span className="text-xs font-medium">Auto</span>
                        </button>
                    </div>
                </div>
            </FadeIn>
        </div>

        {/* Right Preview */}
        <div className="w-full lg:w-2/3 perspective-1000">
             <FadeIn delay={0.4} className="h-full">
                 <div ref={previewRef}>
                     <h2>L'Albatros</h2>
                     <div>
                         <p>
                            Souvent, pour s'amuser, les hommes d'équipage<br/>
                            Prennent des albatros, vastes oiseaux des mers,<br/>
                            Qui suivent, indolents compagnons de voyage,<br/>
                            Le navire glissant sur les gouffres amers.
                         </p>
                         <p className="opacity-70 mt-4 text-sm font-sans italic">
                            — Charles Baudelaire
                         </p>
                     </div>
                 </div>
             </FadeIn>
        </div>

      </div>
    </div>
  );
}
