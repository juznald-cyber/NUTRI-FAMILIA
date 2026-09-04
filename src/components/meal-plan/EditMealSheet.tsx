import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MealPlanEntry } from '../../db';
import { addMealPlanEntry, updateMealPlanEntry, deleteMealPlanEntry } from '../../hooks/useDatabase';

interface EditMealSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  existingEntry?: MealPlanEntry;
}

const MEAL_LABELS = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
};

export default function EditMealSheet({ isOpen, onClose, date, mealType, existingEntry }: EditMealSheetProps) {
  const recipes = useLiveQuery(() => db.recipes.toArray());
  const [mode, setMode] = useState<'select' | 'custom'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);

  if (!isOpen) return null;

  const filteredRecipes = recipes?.filter(r => {
    const matchesMealType = r.mealType === mealType;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMealType && (searchQuery === '' || matchesSearch);
  }) || [];

  const handleSelectRecipe = async (recipeId: number) => {
    if (existingEntry?.id) {
      await updateMealPlanEntry(existingEntry.id, {
        recipeId,
        customMealName: undefined,
        customMealCalories: undefined,
        customMealProtein: undefined,
        customMealCarbs: undefined,
        customMealFat: undefined,
      });
    } else {
      await addMealPlanEntry({
        date,
        mealType,
        recipeId,
        isCompleted: false,
      });
    }
    onClose();
  };

  const handleSaveCustom = async () => {
    if (!name.trim()) return;

    if (existingEntry?.id) {
      await updateMealPlanEntry(existingEntry.id, {
        recipeId: undefined,
        customMealName: name,
        customMealCalories: calories,
        customMealProtein: protein,
        customMealCarbs: carbs,
        customMealFat: fat,
      });
    } else {
      await addMealPlanEntry({
        date,
        mealType,
        customMealName: name,
        customMealCalories: calories,
        customMealProtein: protein,
        customMealCarbs: carbs,
        customMealFat: fat,
        isCompleted: false,
      });
    }
    resetForm();
    onClose();
  };

  const handleDelete = async () => {
    if (existingEntry?.id) {
      await deleteMealPlanEntry(existingEntry.id);
    }
    onClose();
  };

  const resetForm = () => {
    setName('');
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setSearchQuery('');
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {existingEntry ? 'Editar' : 'Agregar'} {MEAL_LABELS[mealType]}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-5 mb-4">
          <div className="flex bg-apple-gray-6 dark:bg-white/10 rounded-apple-sm p-1">
            <button
              onClick={() => setMode('select')}
              className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-all ${
                mode === 'select'
                  ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-apple'
                  : 'text-apple-gray-1 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Seleccionar Receta
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-all ${
                mode === 'custom'
                  ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-apple'
                  : 'text-apple-gray-1 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Comida Personalizada
            </button>
          </div>
        </div>

        <div className="px-5 pb-8">
          {mode === 'select' ? (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar receta..."
                  className="apple-input pl-10"
                />
              </div>

              {/* Recipe List */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {filteredRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => recipe.id && handleSelectRecipe(recipe.id)}
                    className="w-full apple-card p-3.5 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/5"
                  >
                    <span className="text-2xl">{recipe.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{recipe.name}</p>
                      <p className="text-xs text-apple-gray-1 dark:text-gray-400 mt-0.5">
                        {recipe.calories} kcal · {recipe.prepTime} min · {recipe.difficulty}
                      </p>
                    </div>
                  </button>
                ))}
                {filteredRecipes.length === 0 && (
                  <p className="text-center text-apple-gray-2 dark:text-gray-400 py-8 text-sm">
                    No se encontraron recetas
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Custom Meal Form */}
              <div className="space-y-4">
                <div>
                  <label className="apple-section-title">Nombre de la comida</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Ensalada de pollo"
                    className="apple-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="apple-section-title">Calorías</label>
                    <input
                      type="number"
                      value={calories || ''}
                      onChange={e => setCalories(parseInt(e.target.value) || 0)}
                      placeholder="kcal"
                      className="apple-input"
                    />
                  </div>
                  <div>
                    <label className="apple-section-title">Proteína (g)</label>
                    <input
                      type="number"
                      value={protein || ''}
                      onChange={e => setProtein(parseInt(e.target.value) || 0)}
                      placeholder="g"
                      className="apple-input"
                    />
                  </div>
                  <div>
                    <label className="apple-section-title">Carbohidratos (g)</label>
                    <input
                      type="number"
                      value={carbs || ''}
                      onChange={e => setCarbs(parseInt(e.target.value) || 0)}
                      placeholder="g"
                      className="apple-input"
                    />
                  </div>
                  <div>
                    <label className="apple-section-title">Grasas (g)</label>
                    <input
                      type="number"
                      value={fat || ''}
                      onChange={e => setFat(parseInt(e.target.value) || 0)}
                      placeholder="g"
                      className="apple-input"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveCustom}
                  disabled={!name.trim()}
                  className="apple-btn-primary w-full disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </>
          )}

          {/* Delete Button */}
          {existingEntry && (
            <button
              onClick={handleDelete}
              className="w-full mt-4 py-3 text-apple-red text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 rounded-apple-sm transition-colors"
            >
              Eliminar esta comida
            </button>
          )}
        </div>
      </div>
    </>
  );
}
