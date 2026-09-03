import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-apple-bg font-sans">
      <div className="max-w-lg mx-auto min-h-screen relative pb-24">
        <main className="pt-12">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
