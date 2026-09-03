import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wand2, RefreshCw, ChevronLeft, ChevronRight, Check, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MealPlanEntry, type Recipe } from '../db';
import { generateAndSaveDailyPlan, generateAndSaveWeeklyPlan, regenerateSingleMeal, getDailyNutrition } from '../utils/mealPlanner';
import { exportWeeklyPlanToPDF, exportWeeklyPlanToExcel } from '../utils/exportUtils';
import EditMealSheet from '../components/meal-plan/EditMealSheet';

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
  const [showExportMenu, setShowExportMenu] = useState(false);
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

  const allWeekMeals = useLiveQuery(
    () => db.mealPlans.where('date').anyOf(weekDatesStr).toArray(),
    [weekDatesStr.join(',')]
  );

  const recipes = useLiveQuery(() => db.recipes.toArray());

  useEffect(() => {
    getDailyNutrition(selectedDateStr).then(setNutrition);
  }, [selectedDateStr, dayMeals]);

  const handleExportPDF = () => {
    if (!allWeekMeals || !recipes) return;
    exportWeeklyPlanToPDF({
      days: weekDays,
      meals: allWeekMeals,
      recipes: recipes
    });
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    if (!allWeekMeals || !recipes) return;
    exportWeeklyPlanToExcel({
      days: weekDays,
      meals: allWeekMeals,
      recipes: recipes
    });
    setShowExportMenu(false);
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

  const calorieGoal = 2000;

  return (
    <div className="px-5 pt-2 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="apple-large-title">Plan Semanal</h1>
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-apple-sm text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95"
              title="Descargar Menú Semanal"
            >
              <Download className="w-4 h-4 text-apple-blue" />
              <span>Exportar</span>
            </button>

            {/* Export Dropdown Menu */}
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowExportMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-apple-sm shadow-apple-lg border border-gray-100 py-1.5 z-30 animate-scale-in">
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-800 hover:bg-apple-blue/10 hover:text-apple-blue flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-apple-red" />
                    <span>Descargar en PDF</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-800 hover:bg-apple-blue/10 hover:text-apple-blue flex items-center gap-2.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-apple-green" />
                    <span>Descargar en Excel (.xlsx)</span>
                  </button>
                </div>
              </>
            )}
          </div>

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
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-apple-gray-1" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {format(currentWeekStart, "d MMM", { locale: es })} — {format(addDays(currentWeekStart, 6), "d MMM yyyy", { locale: es })}
          </span>
          <button
            onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
                    ? 'bg-apple-blue/10 text-apple-blue'
                    : 'text-gray-600 hover:bg-gray-50'
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
          <h3 className="font-semibold text-gray-900 text-sm">Nutrición del Día</h3>
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
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {entry && (
                    <>
                      <button
                        onClick={() => handleToggleComplete(entry)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          entry.isCompleted
                            ? 'bg-apple-green text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate(key)}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
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
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-apple-sm hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">{recipe?.emoji || '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${entry?.isCompleted ? 'line-through text-apple-gray-2' : 'text-gray-900'}`}>
                        {mealName}
                      </p>
                      {recipe && (
                        <p className="text-xs text-apple-gray-1 mt-0.5 truncate">
                          {recipe.ingredients.slice(0, 3).map(i => i.name).join(', ')}
                          {recipe.ingredients.length > 3 && '...'}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-apple-gray-1">{mealCalories}</p>
                      <p className="text-[10px] text-apple-gray-2">kcal</p>
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setEditSheet({ isOpen: true, mealType: key })}
                  className="w-full p-4 border-2 border-dashed border-gray-200 rounded-apple-sm text-apple-gray-2 text-sm font-medium hover:border-apple-blue hover:text-apple-blue transition-colors"
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
    </div>
  );
};

const NutriBar: React.FC<{ label: string; value: number; unit: string; color: string }> = ({
  label, value, unit, color,
}) => (
  <div className="text-center">
    <p className="text-lg font-bold text-gray-900">{value}<span className="text-xs font-normal text-apple-gray-1">{unit}</span></p>
    <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
    <p className="text-[10px] text-apple-gray-1 mt-1">{label}</p>
  </div>
);

export default MealPlan;
