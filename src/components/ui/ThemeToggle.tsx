import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm border border-black/5 dark:border-white/10"
      aria-label="Cambiar tema"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 animate-scale-in" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 animate-scale-in" />
      )}
    </button>
  );
}
