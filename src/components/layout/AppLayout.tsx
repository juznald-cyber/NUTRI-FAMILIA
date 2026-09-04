import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Download, Sparkles, ChefHat } from 'lucide-react';
import BottomNav from './BottomNav';
import ThemeToggle from '../ui/ThemeToggle';
import InstallPwaModal from '../ui/InstallPwaModal';
import GeminiConfigModal from '../ai/GeminiConfigModal';
import NutriChefModal from '../ai/NutriChefModal';

export default function AppLayout() {
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isChefOpen, setIsChefOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const handleInstall = () => setIsInstallOpen(true);
    const handleChef = () => setIsChefOpen(true);
    const handleConfig = () => setIsConfigOpen(true);

    window.addEventListener('open-install-pwa', handleInstall);
    window.addEventListener('open-nutrichef', handleChef);
    window.addEventListener('open-gemini-config', handleConfig);

    return () => {
      window.removeEventListener('open-install-pwa', handleInstall);
      window.removeEventListener('open-nutrichef', handleChef);
      window.removeEventListener('open-gemini-config', handleConfig);
    };
  }, []);

  return (
    <div className="min-h-screen bg-apple-bg dark:bg-black font-sans transition-colors duration-200">
      <div className="max-w-lg mx-auto min-h-screen relative pb-24">
        
        {/* Top Header bar with Logo, Install, NutriChef AI & Theme Toggle */}
        <header className="px-5 pt-4 pb-1 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="favicon.svg" alt="Logo" className="w-6 h-6 rounded-apple-sm shadow-sm" />
            <span className="text-xs font-bold tracking-tight text-gray-800 dark:text-gray-200 uppercase">
              NutriFamilia
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* NutriChef AI Assistant Button */}
            <button
              type="button"
              onClick={() => setIsChefOpen(true)}
              className="px-2.5 py-1.5 bg-gradient-to-r from-apple-orange/15 to-apple-pink/15 hover:from-apple-orange/25 hover:to-apple-pink/25 text-apple-orange dark:text-orange-300 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm border border-apple-orange/20"
              title="Pregúntale a NutriChef AI"
            >
              <ChefHat className="w-3.5 h-3.5 text-apple-orange" />
              <span>NutriChef IA</span>
            </button>

            {/* Install PWA Button */}
            <button
              type="button"
              onClick={() => setIsInstallOpen(true)}
              className="px-2.5 py-1.5 bg-apple-green/10 hover:bg-apple-green/20 text-apple-green dark:bg-apple-green/20 dark:hover:bg-apple-green/30 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Instalar App en tu Teléfono"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>

            <ThemeToggle />
          </div>
        </header>

        <main className="pt-2">
          <Outlet />
        </main>
      </div>

      <BottomNav />

      {/* Floating NutriChef Quick Button */}
      <button
        type="button"
        onClick={() => setIsChefOpen(true)}
        className="fixed right-4 bottom-20 z-30 p-3 bg-gradient-to-r from-apple-orange to-apple-pink text-white rounded-full shadow-apple hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        title="Abrir Asistente NutriChef AI"
      >
        <Sparkles className="w-5 h-5 animate-spin text-yellow-200" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">NutriChef IA</span>
      </button>

      {/* Modals */}
      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      <NutriChefModal
        isOpen={isChefOpen}
        onClose={() => setIsChefOpen(false)}
        onOpenConfig={() => {
          setIsChefOpen(false);
          setIsConfigOpen(true);
        }}
      />

      <GeminiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
}
