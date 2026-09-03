import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: string;
}

export function GlassCard({ children, className = '', onClick, padding = 'p-4' }: GlassCardProps) {
  return (
    <div 
      className={`apple-glass rounded-apple shadow-apple ${padding} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
