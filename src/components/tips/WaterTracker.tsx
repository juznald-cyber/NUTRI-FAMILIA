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
          <h3 className="font-semibold text-gray-900">Hidratación</h3>
        </div>
        <span className="text-sm text-apple-blue font-medium">
          {glasses} de {goal} vasos
        </span>
      </div>

      <div className="flex gap-2 justify-between">
        {Array.from({ length: goal }, (_, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            className={`flex-1 h-12 rounded-apple-sm flex items-center justify-center transition-all duration-300 ${
              i < glasses
                ? 'bg-apple-blue/15 text-apple-blue scale-105'
                : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
            }`}
          >
            <Droplets className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
