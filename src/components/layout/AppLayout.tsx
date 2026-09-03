import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Download } from 'lucide-react';
import BottomNav from './BottomNav';
import ThemeToggle from '../ui/ThemeToggle';
import InstallPwaModal from '../ui/InstallPwaModal';

export default function AppLayout() {
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsInstallOpen(true);
    window.addEventListener('open-install-pwa', handleOpen);
    return () => window.removeEventListener('open-install-pwa', handleOpen);
  }, []);

  return (
    <div className="min-h-screen bg-apple-bg dark:bg-black font-sans transition-colors duration-200">
      <div className="max-w-lg mx-auto min-h-screen relative pb-24">
        
        {/* Top Header bar with Logo, Install & Theme Toggle */}
        <header className="px-5 pt-4 pb-1 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="favicon.svg" alt="Logo" className="w-6 h-6 rounded-apple-sm shadow-sm" />
            <span className="text-xs font-bold tracking-tight text-gray-800 dark:text-gray-200 uppercase">
              NutriFamilia
            </span>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Install PWA Modal */}
      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
}
