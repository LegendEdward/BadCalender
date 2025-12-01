import React, { useEffect } from 'react';
import { Settings2, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onToggle }) => {
  // Sync the Android status bar color / browser theme color with the app theme
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      // Colors match tailwind config: ark-bg (#0f172a) and toon-bg (#fff7ed)
      const color = currentTheme === 'arknights' ? '#0f172a' : '#fff7ed';
      metaThemeColor.setAttribute('content', color);
    }
  }, [currentTheme]);

  return (
    <button
      onClick={onToggle}
      className={`
        relative overflow-hidden transition-all duration-300 flex items-center gap-2 px-4 py-2 text-sm font-bold
        ${currentTheme === 'arknights' 
          ? 'bg-ark-surface border border-ark-primary text-ark-primary clip-angled hover:bg-ark-primary/10' 
          : 'bg-white rounded-full shadow-lg border-2 border-toon-primary text-toon-primary hover:scale-105'}
      `}
    >
      {currentTheme === 'arknights' ? (
        <>
          <Settings2 size={16} />
          <span>SYS.THEME</span>
        </>
      ) : (
        <>
          <Sparkles size={16} />
          <span>Style</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;