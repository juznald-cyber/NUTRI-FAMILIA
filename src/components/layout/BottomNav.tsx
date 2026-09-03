import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, CalendarDays, Lightbulb, Users } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/pantry', icon: ShoppingCart, label: 'Despensa' },
  { to: '/meal-plan', icon: CalendarDays, label: 'Plan' },
  { to: '/tips', icon: Lightbulb, label: 'Tips' },
  { to: '/family', icon: Users, label: 'Familia' },
];

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border-t border-apple-gray-5 dark:border-white/10 z-40 transition-colors duration-200">
      <div className="max-w-lg mx-auto flex justify-between items-center px-4 pt-2 pb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-12 space-y-0.5 transition-colors ${
                  isActive 
                    ? 'text-apple-blue' 
                    : 'text-apple-gray-2 dark:text-gray-400 hover:text-apple-gray-1 dark:hover:text-gray-200'
                }`
              }
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
