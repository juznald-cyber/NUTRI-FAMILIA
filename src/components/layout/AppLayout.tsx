import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import ThemeToggle from '../ui/ThemeToggle';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-apple-bg dark:bg-black font-sans transition-colors duration-200">
      <div className="max-w-lg mx-auto min-h-screen relative pb-24">
        {/* Top Header bar with Theme Toggle */}
        <header className="px-5 pt-4 pb-1 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍏</span>
            <span className="text-xs font-bold tracking-tight text-gray-500 dark:text-gray-400 uppercase">
              NutriFamilia
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="pt-2">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
