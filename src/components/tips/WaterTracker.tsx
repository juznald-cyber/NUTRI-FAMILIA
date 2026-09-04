import React, { useState, useEffect } from 'react';
import { Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { useWaterLog, setWaterLog } from '../../hooks/useDatabase';

export default function WaterTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const waterLog = useWaterLog(today);
  const glasses = waterLog?.glasses || 0;
  const goal = 8;

  const handleTap = async (index: number) => {
    // If tapping the same glass that's currently filled, unfill it
    const newGlasses = index + 1 === glasses ? index : index + 1;
    await setWaterLog(today, newGlasses, goal);
  };

  return (
    <div className="apple-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-apple-blue" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Hidratación</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-apple-blue font-medium">
            {glasses} de {goal} vasos
          </span>
          {glasses > 0 && (
            <button
              type="button"
              onClick={() => setWaterLog(today, 0, goal)}
              className="text-xs text-apple-gray-1 dark:text-gray-400 hover:text-apple-red dark:hover:text-apple-red transition-colors px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10"
              title="Reiniciar a 0 vasos"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-between">
        {Array.from({ length: goal }, (_, i) => {
          const isFilled = i < glasses;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleTap(i)}
              className={`flex-1 h-12 rounded-apple-sm flex items-center justify-center transition-all duration-300 active:scale-95 ${
                isFilled
                  ? 'bg-apple-blue/20 text-apple-blue dark:bg-apple-blue/30 ring-1 ring-apple-blue/50 scale-105'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-300 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
              title={isFilled ? `Desmarcar hasta vaso ${i}` : `Marcar ${i + 1} vasos`}
            >
              <Droplets className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-apple-blue rounded-full transition-all duration-500"
          style={{ width: `${(glasses / goal) * 100}%` }}
        />
      </div>

      {glasses >= goal && (
        <p className="text-center text-apple-green text-sm font-medium mt-2">
          🎉 ¡Meta de hidratación alcanzada!
        </p>
      )}
    </div>
  );
}
