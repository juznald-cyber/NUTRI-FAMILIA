import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wand2, RefreshCw, ChevronLeft, ChevronRight, Check, Download, Sparkles, AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MealPlanEntry, type Recipe } from '../db';
import { generateAndSaveDailyPlan, generateAndSaveWeeklyPlan, regenerateSingleMeal, getDailyNutrition } from '../utils/mealPlanner';
import { generateAIMealPlan, hasGeminiApiKey } from '../services/geminiService';
import { addRecipe, addMealPlanEntry, updateMealPlanEntry } from '../hooks/useDatabase';
import EditMealSheet from '../components/meal-plan/EditMealSheet';
import ExportRangeModal from '../components/meal-plan/ExportRangeModal';

const MEAL_TYPES = [
  { key: 'breakfast' as const, label: 'Desayuno', emoji: '🌅' },
  { key: 'lunch' as const, label: 'Almuerzo', emoji: '☀️' },
  { key: 'dinner' as const, label: 'Cena', emoji: '🌙' },
];

const MealPlan: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<'standard' | 'ai'>('ai');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editSheet, setEditSheet] = useState<{
    isOpen: boolean;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    entry?: MealPlanEntry;
  }>({ isOpen: false, mealType: 'breakfast' });

  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const weekDatesStr = weekDays.map(d => format(d, 'yyyy-MM-dd'));

  const dayMeals = useLiveQuery(
    () => db.mealPlans.where('date').equals(selectedDateStr).toArray(),
    [selectedDateStr]
  );

  const recipes = useLiveQuery(() => db.recipes.toArray());
  const pantryItems = useLiveQuery(() => db.pantryItems.toArray()) || [];
  const familyMembers = useLiveQuery(() => db.familyMembers.toArray()) || [];

  useEffect(() => {
    getDailyNutrition(selectedDateStr).then(setNutrition);
  }, [selectedDateStr, dayMeals]);

  // AI Meal Plan Generation with Gemini
  const handleGenerateWithAI = async (scope: 'day' | 'week') => {
    if (!hasGeminiApiKey()) {
      window.dispatchEvent(new CustomEvent('open-gemini-config'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAiSuccessMessage(null);

    const targetDates = scope === 'week' ? weekDatesStr : [selectedDateStr];

    try {
      const result = await generateAIMealPlan({
        dates: targetDates,
        pantryItems,
        familyMembers,
      });

      // 1. Save newly generated recipes
      const createdRecipeMap = new Map<string, number>();
      for (const rec of result.recipes) {
        const id = await addRecipe(rec);
        createdRecipeMap.set(rec.name.toLowerCase().trim(), id);
      }

      // 2. Clear and set meal plan entries
      for (const mp of result.mealPlans) {
        const matchedId = createdRecipeMap.get(mp.recipeName.toLowerCase().trim());
        const existing = await db.mealPlans.where({ date: mp.date, mealType: mp.mealType }).first();

        if (existing && existing.id) {
          await updateMealPlanEntry(existing.id, {
            recipeId: matchedId,
            customMealName: undefined,
            customMealCalories: undefined,
          });
        } else {
          await addMealPlanEntry({
            date: mp.date,
            mealType: mp.mealType,
            recipeId: matchedId,
            isCompleted: false,
          });
        }
      }

      setAiSuccessMessage(`✨ ¡Menú ${scope === 'week' ? 'semanal' : 'del día'} generado exitosamente con IA!`);
      setTimeout(() => setAiSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('AI generation error:', err);
      setError('Error al generar con IA. Verifica tu API Key de Gemini o usa la generación estándar.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWeek = async () => {
    setIsGenerating(true);
    try {
      await generateAndSaveWeeklyPlan(weekDatesStr);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDay = async () => {
    setIsGenerating(true);
    try {
      await generateAndSaveDailyPlan(selectedDateStr);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    await regenerateSingleMeal(selectedDateStr, mealType);
  };

  const handleToggleComplete = async (entry: MealPlanEntry) => {
    if (entry.id) {
      await db.mealPlans.update(entry.id, { isCompleted: !entry.isCompleted });
    }
  };

  const getRecipeForMeal = (mealType: string): Recipe | undefined => {
    const entry = dayMeals?.find(m => m.mealType === mealType);
    if (entry?.recipeId) {
      return recipes?.find(r => r.id === entry.recipeId);
    }
    return undefined;
  };

  const getEntryForMeal = (mealType: string): MealPlanEntry | undefined => {
    return dayMeals?.find(m => m.mealType === mealType);
  };

  const calorieGoal = familyMembers.length > 0
    ? Math.round(familyMembers.reduce((sum, m) => sum + m.calorieGoal, 0) / familyMembers.length)
    : 2000;

  return (
    <div className="px-5 pt-2 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="apple-large-title">Plan Semanal</h1>
          <p className="text-xs text-apple-gray-1 dark:text-gray-400">
            Menú equilibrado para toda tu familia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-apple-sm text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Exportar Plan en PDF o Excel por fechas"
          >
            <Download className="w-4 h-4 text-apple-blue" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Generate AI Week Button */}
          <button
            onClick={() => handleGenerateWithAI('week')}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-gradient-to-r from-apple-orange to-apple-pink text-white rounded-apple-sm text-xs font-bold flex items-center gap-1.5 shadow-apple active:scale-95 transition-all disabled:opacity-50"
            title="Generar menú semanal variado con Gemini IA"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Creando con IA...' : 'Semana IA'}</span>
          </button>
        </div>
      </div>

      {/* AI Success or Error Banners */}
      {aiSuccessMessage && (
        <div className="mb-4 p-3 bg-gradient-to-r from-apple-green/15 to-apple-teal/15 border border-apple-green/30 rounded-apple-sm text-apple-green text-xs font-semibold animate-scale-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{aiSuccessMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-apple-red/20 rounded-apple-sm text-apple-red text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-gemini-config'))}
            className="text-xs underline font-bold"
          >
            Configurar Clave
          </button>
        </div>
      )}

      {/* Week Selector */}
      <div className="apple-card p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentWeekStart(prev => addDays(prev, -7))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-apple-gray-1" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {format(currentWeekStart, "d MMM", { locale: es })} — {format(addDays(currentWeekStart, 6), "d MMM yyyy", { locale: es })}
          </span>
          <button
            onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-apple-gray-1" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-2 rounded-apple-sm transition-all ${
                  isSelected
                    ? 'bg-apple-blue text-white shadow-apple'
                    : isToday
                    ? 'bg-apple-blue/10 text-apple-blue dark:bg-apple-blue/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-[10px] font-medium uppercase">
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Nutrition Summary */}
      <div className="apple-glass rounded-apple p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Nutrición del Día</h3>
          <span className="text-sm font-medium text-apple-pink">
            {nutrition.calories} / {calorieGoal} kcal
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <NutriBar label="Proteína" value={nutrition.protein} unit="g" color="bg-apple-green" />
          <NutriBar label="Carbos" value={nutrition.carbs} unit="g" color="bg-apple-orange" />
          <NutriBar label="Grasas" value={nutrition.fat} unit="g" color="bg-apple-purple" />
        </div>
      </div>

      {/* Action Buttons for Day Generation */}
      {(!dayMeals || dayMeals.length === 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => handleGenerateWithAI('day')}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-gradient-to-r from-apple-orange to-apple-pink text-white rounded-apple-sm text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-apple active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Creando...' : `Generar Día con IA (Gemini)`}</span>
          </button>

          <button
            onClick={handleGenerateDay}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 rounded-apple-sm text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Wand2 className="w-4 h-4 text-apple-green" />
            <span>Generación Rápida</span>
          </button>
        </div>
      )}

      {/* Meals List */}
      <div className="space-y-3">
        {MEAL_TYPES.map(({ key, label, emoji }) => {
          const entry = getEntryForMeal(key);
          const recipe = getRecipeForMeal(key);
          const mealName = entry?.customMealName || recipe?.name;
          const mealCalories = entry?.customMealCalories || recipe?.calories || 0;

          return (
            <div key={key} className="apple-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {entry && (
                    <>
                      <button
                        onClick={() => handleToggleComplete(entry)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          entry.isCompleted
                            ? 'bg-apple-green text-white'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                        }`}
                        title={entry.isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate(key)}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        title="Cambiar por otra receta"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {mealName ? (
                <button
                  onClick={() => setEditSheet({ isOpen: true, mealType: key, entry })}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-apple-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <span className="text-2xl">{recipe?.emoji || '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${entry?.isCompleted ? 'line-through text-apple-gray-2' : 'text-gray-900 dark:text-white'}`}>
                        {mealName}
                      </p>
                      {recipe && (
                        <p className="text-xs text-apple-gray-1 dark:text-gray-400 mt-0.5 truncate">
                          {recipe.ingredients.slice(0, 3).map(i => i.name).join(', ')}
                          {recipe.ingredients.length > 3 && '...'}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-apple-gray-1 dark:text-gray-300">{mealCalories}</p>
                      <p className="text-[10px] text-apple-gray-2">kcal</p>
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setEditSheet({ isOpen: true, mealType: key })}
                  className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-apple-sm text-apple-gray-2 dark:text-gray-400 text-sm font-medium hover:border-apple-blue hover:text-apple-blue transition-colors"
                >
                  + Agregar {label.toLowerCase()}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Sheet */}
      <EditMealSheet
        isOpen={editSheet.isOpen}
        onClose={() => setEditSheet({ isOpen: false, mealType: 'breakfast' })}
        date={selectedDateStr}
        mealType={editSheet.mealType}
        existingEntry={editSheet.entry}
      />

      {/* Export Range Modal */}
      <ExportRangeModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentDate={selectedDate}
        recipes={recipes || []}
      />
    </div>
  );
};

const NutriBar: React.FC<{ label: string; value: number; unit: string; color: string }> = ({
  label, value, unit, color,
}) => (
  <div className="text-center">
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}<span className="text-xs font-normal text-apple-gray-1 dark:text-gray-400">{unit}</span></p>
    <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
    <p className="text-[10px] text-apple-gray-1 dark:text-gray-400 mt-1">{label}</p>
  </div>
);

export default MealPlan;
