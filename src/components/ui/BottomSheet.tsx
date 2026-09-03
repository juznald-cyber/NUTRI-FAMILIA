import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="sheet-overlay absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="sheet-content relative bg-apple-bg w-full max-w-lg mx-auto rounded-t-apple-lg shadow-apple-lg animate-slide-up flex flex-col max-h-[90vh]">
        <div className="flex justify-center pt-3 pb-2 w-full touch-none" onClick={onClose}>
          <div className="sheet-handle w-12 h-1.5 bg-apple-gray-4 rounded-full" />
        </div>
        
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-apple-gray-5">
            <h2 className="text-lg font-semibold text-apple-gray-1">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full bg-apple-gray-6 text-apple-gray-2 hover:bg-apple-gray-5">
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
