import React from 'react';
import { MealPlanEntry, Recipe } from '../../db';
import { Plus, Edit2, RefreshCw } from 'lucide-react';

interface MealCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  entry?: MealPlanEntry;
  recipe?: Recipe;
  onEdit: () => void;
  onRegenerate: () => void;
}

const mealEmojis = {
  breakfast: '🌅 Desayuno',
  lunch: '☀️ Almuerzo',
  dinner: '🌙 Cena'
};

export default function MealCard({ mealType, entry, recipe, onEdit, onRegenerate }: MealCardProps) {
  return (
    <div className="apple-glass rounded-apple p-4 shadow-apple-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-apple-gray-6 text-lg">
          {mealEmojis[mealType]}
        </h3>
        {entry && (
          <div className="flex gap-2">
            <button onClick={onRegenerate} className="p-1.5 text-apple-gray-4 hover:bg-apple-gray-1 rounded-full" aria-label="Regenerar">
              <RefreshCw size={16} />
            </button>
            <button onClick={onEdit} className="p-1.5 text-apple-gray-4 hover:bg-apple-gray-1 rounded-full" aria-label="Editar">
              <Edit2 size={16} />
            </button>
          </div>
        )}
      </div>

      {entry ? (
        <div className="space-y-2">
          <h4 className="font-medium text-apple-gray-6">{recipe?.name || entry.customMealName}</h4>
          <p className="text-sm text-apple-gray-4">
            🔥 {recipe?.calories || entry.customMealCalories || 0} kcal
          </p>
          <p className="text-xs text-apple-gray-4 truncate">
            {recipe?.ingredients?.map(i => i.name).join(', ') || 'Comida personalizada'}
          </p>
        </div>
      ) : (
        <button 
          onClick={onEdit}
          className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-apple-gray-2 rounded-apple-sm text-apple-gray-4 hover:bg-apple-gray-1 hover:border-apple-blue hover:text-apple-blue transition-colors"
        >
          <Plus size={24} className="mb-2" />
          <span className="text-sm font-medium">Agregar comida</span>
        </button>
      )}
    </div>
  );
}
