import React from 'react';

interface SegmentedControlProps {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
  className?: string;
}

export function SegmentedControl({ options, selected, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div className={`flex relative bg-apple-gray-6 p-1 rounded-apple-sm ${className}`}>
      <div
        className="absolute top-1 bottom-1 bg-white rounded shadow-sm transition-all duration-300 ease-in-out"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(100 / options.length) * selected}% + 2px)`,
        }}
      />
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          className={`relative flex-1 py-1.5 text-sm font-medium text-center z-10 transition-colors duration-300 ${
            selected === index ? 'text-black' : 'text-apple-gray-2 hover:text-apple-gray-1'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
