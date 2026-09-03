import React, { useState, useEffect } from 'react';
import { ShoppingCart, Apple, Dumbbell, Heart, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { getShoppingRecommendations, type ShoppingRecommendation } from '../utils/recommendations';
import { nutritionTips, wellnessTips, hydrationTips } from '../data/tips';
import { exercises as exerciseData } from '../data/exercises';
import WaterTracker from '../components/tips/WaterTracker';

const TABS = [
  { key: 'compras', label: 'Compras', icon: ShoppingCart },
  { key: 'nutricion', label: 'Nutrición', icon: Apple },
  { key: 'ejercicio', label: 'Ejercicio', icon: Dumbbell },
  { key: 'bienestar', label: 'Bienestar', icon: Heart },
];

const Tips: React.FC = () => {
  const [activeTab, setActiveTab] = useState('compras');
  const [recommendations, setRecommendations] = useState<ShoppingRecommendation[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [exerciseFilter, setExerciseFilter] = useState<string>('todos');

  useEffect(() => {
    getShoppingRecommendations().then(setRecommendations);
  }, []);

  const filteredExercises = exerciseFilter === 'todos'
    ? exerciseData
    : exerciseData.filter(e => e.category === exerciseFilter);

  return (
    <div className="px-5 pt-2 pb-4 animate-fade-in">
      {/* Header */}
      <h1 className="apple-large-title mb-4">Tips y Consejos</h1>

      {/* Tab Selector */}
      <div className="flex bg-apple-gray-6 rounded-apple-sm p-1 mb-5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-gray-900 shadow-apple'
                  : 'text-apple-gray-1'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shopping Recommendations */}
      {activeTab === 'compras' && (
        <div className="space-y-3">
          <p className="text-sm text-apple-gray-1 mb-3">
            Basado en tu despensa actual, te recomendamos comprar:
          </p>
          {recommendations.map((rec, i) => (
            <div key={i} className="apple-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{rec.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{rec.label}</h3>
                    <span className={`apple-badge ${
                      rec.status === 'bueno' ? 'stock-high' :
                      rec.status === 'bajo' ? 'stock-medium' : 'stock-low'
                    }`}>
                      {rec.status === 'bueno' ? '✓ Bien' :
                       rec.status === 'bajo' ? '⚠ Bajo' : '✗ Vacío'}
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray-1 mt-0.5">{rec.message}</p>
                </div>
              </div>
              {rec.suggestedItems.length > 0 && rec.status !== 'bueno' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-apple-gray-1 mb-2">Sugerencias:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.suggestedItems.map((item, j) => (
                      <span key={j} className="px-3 py-1 bg-apple-blue/8 text-apple-blue text-xs font-medium rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nutrition Tips */}
      {activeTab === 'nutricion' && (
        <div className="space-y-3">
          <WaterTracker />
          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">Tips de Nutrición</h2>
          {nutritionTips.map(tip => (
            <div key={tip.id} className="apple-card p-4 flex gap-3">
              <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
                <p className="text-sm text-apple-gray-1 mt-1">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Tips */}
      {activeTab === 'ejercicio' && (
        <div>
          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar -mx-5 px-5 mb-3">
            {['todos', 'cardio', 'fuerza', 'flexibilidad', 'hiit'].map(cat => (
              <button
                key={cat}
                onClick={() => setExerciseFilter(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  exerciseFilter === cat
                    ? 'bg-apple-orange text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat === 'todos' ? '🏋️ Todos' :
                 cat === 'cardio' ? '🏃 Cardio' :
                 cat === 'fuerza' ? '💪 Fuerza' :
                 cat === 'flexibilidad' ? '🧘 Flexibilidad' : '⚡ HIIT'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="apple-card overflow-hidden">
                <button
                  onClick={() => setExpandedExercise(
                    expandedExercise === exercise.id ? null : exercise.id
                  )}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">{exercise.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{exercise.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-apple-gray-1">{exercise.duration} min</span>
                      <span className={`apple-badge ${
                        exercise.level === 'principiante' ? 'stock-high' :
                        exercise.level === 'intermedio' ? 'stock-medium' : 'stock-low'
                      }`}>
                        {exercise.level}
                      </span>
                      <span className="text-xs text-apple-orange font-medium">
                        🔥 {exercise.caloriesBurned} kcal
                      </span>
                    </div>
                  </div>
                  {expandedExercise === exercise.id ? (
                    <ChevronUp className="w-5 h-5 text-apple-gray-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-apple-gray-2" />
                  )}
                </button>
                {expandedExercise === exercise.id && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <p className="text-sm text-apple-gray-1 mb-3">{exercise.description}</p>
                    <div className="space-y-2">
                      {exercise.steps.map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="w-6 h-6 bg-apple-orange/10 text-apple-orange rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <p className="text-sm text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wellness Tips */}
      {activeTab === 'bienestar' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-apple-purple/10 to-apple-pink/10 rounded-apple-lg p-5 mb-4">
            <h2 className="font-bold text-gray-900 mb-1">💆 Bienestar Integral</h2>
            <p className="text-sm text-gray-600">
              La salud no es solo alimentación. Cuida tu cuerpo, mente y espíritu.
            </p>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">Consejos de Bienestar</h3>
          {wellnessTips.map(tip => (
            <div key={tip.id} className="apple-card p-4 flex gap-3">
              <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
                <p className="text-sm text-apple-gray-1 mt-1">{tip.description}</p>
              </div>
            </div>
          ))}

          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">Hidratación</h3>
          {hydrationTips.map(tip => (
            <div key={tip.id} className="apple-card p-4 flex gap-3">
              <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
                <p className="text-sm text-apple-gray-1 mt-1">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tips;
