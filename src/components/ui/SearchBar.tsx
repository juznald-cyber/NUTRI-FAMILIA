import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3 text-apple-gray-2">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-apple-gray-6 text-apple-gray-1 placeholder-apple-gray-3 rounded-full py-2 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-apple-blue transition-shadow"
      />
    </div>
  );
}
