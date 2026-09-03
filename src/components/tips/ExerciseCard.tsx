import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  duration: number; // minutes
  level: 'principiante' | 'intermedio' | 'avanzado';
  caloriesBurned: number;
  steps: string[];
}

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelColor = () => {
    switch (exercise.level) {
      case 'principiante': return 'bg-apple-green/20 text-apple-green';
      case 'intermedio': return 'bg-apple-orange/20 text-apple-orange';
      case 'avanzado': return 'bg-apple-red/20 text-apple-red';
      default: return 'bg-apple-gray-2 text-apple-gray-5';
    }
  };

  return (
    <div className="apple-card overflow-hidden transition-all duration-300">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-apple-gray-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl bg-apple-gray-1 p-2 rounded-apple-lg">{exercise.emoji}</span>
          <div>
            <h4 className="font-semibold text-apple-gray-6 text-lg">{exercise.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getLevelColor()}`}>
                {exercise.level}
              </span>
              <span className="text-xs text-apple-gray-4">⏱ {exercise.duration} min</span>
              <span className="text-xs text-apple-gray-4">🔥 {exercise.caloriesBurned} kcal</span>
            </div>
          </div>
        </div>
        <button className="text-apple-gray-4">
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-apple-gray-2/50 mt-2 bg-apple-gray-1/30">
          <h5 className="font-medium text-apple-gray-6 mb-2 mt-2">Instrucciones:</h5>
          <ol className="list-decimal list-inside space-y-2">
            {exercise.steps.map((step, index) => (
              <li key={index} className="text-sm text-apple-gray-5 leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
