import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wand2, RefreshCw, ChevronLeft, ChevronRight, Check, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MealPlanEntry, type Recipe } from '../db';
import { generateAndSaveDailyPlan, generateAndSaveWeeklyPlan, regenerateSingleMeal, getDailyNutrition } from '../utils/mealPlanner';
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

  useEffect(() => {
    getDailyNutrition(selectedDateStr).then(setNutrition);
  }, [selectedDateStr, dayMeals]);

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

  const calorieGoal = 2000;

  return (
    <div className="px-5 pt-2 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="apple-large-title">Plan Semanal</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-apple-sm text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Exportar Plan en PDF o Excel por fechas"
          >
            <Download className="w-4 h-4 text-apple-blue" />
            <span>Exportar</span>
          </button>

          <button
            onClick={handleGenerateWeek}
            disabled={isGenerating}
            className="apple-btn-primary text-sm py-2 px-4"
          >
            <Wand2 className="w-4 h-4 mr-1.5" />
            {isGenerating ? 'Generando...' : 'Generar'}
          </button>
        </div>
      </div>

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

      {/* Generate Day Button */}
      {(!dayMeals || dayMeals.length === 0) && (
        <button
          onClick={handleGenerateDay}
          disabled={isGenerating}
          className="w-full apple-btn bg-gradient-to-r from-apple-green to-apple-teal text-white mb-5 shadow-apple"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Generar Menú para {format(selectedDate, "EEEE d", { locale: es })}
        </button>
      )}

      {/* Meals */}
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
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate(key)}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
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
