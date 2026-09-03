import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Droplets, TrendingUp, ShoppingCart, Sparkles } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getDailyNutrition } from '../utils/mealPlanner';
import { getNutritionBalanceScore } from '../utils/recommendations';
import { useWaterLog, setWaterLog } from '../hooks/useDatabase';

const Home: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDisplay = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [balanceScore, setBalanceScore] = useState(0);
  const waterLog = useWaterLog(today);

  const todayMeals = useLiveQuery(
    () => db.mealPlans.where('date').equals(today).toArray(),
    [today]
  );

  const recipes = useLiveQuery(() => db.recipes.toArray());

  const pantryCount = useLiveQuery(() => db.pantryItems.count());

  useEffect(() => {
    getDailyNutrition(today).then(setNutrition);
    getNutritionBalanceScore().then(result => setBalanceScore(result.score));
  }, [today, todayMeals]);

  const calorieGoal = 2000;
  const calorieProgress = Math.min((nutrition.calories / calorieGoal) * 100, 100);

  const getMealName = (mealType: string) => {
    const meal = todayMeals?.find(m => m.mealType === mealType);
    if (!meal) return null;
    if (meal.customMealName) return meal.customMealName;
    if (meal.recipeId) {
      const recipe = recipes?.find(r => r.id === meal.recipeId);
      return recipe?.name || 'Cargando...';
    }
    return null;
  };

  const getMealEmoji = (mealType: string) => {
    const meal = todayMeals?.find(m => m.mealType === mealType);
    if (meal?.recipeId) {
      const recipe = recipes?.find(r => r.id === meal.recipeId);
      return recipe?.emoji || '🍽️';
    }
    return '🍽️';
  };

  const getMealCalories = (mealType: string) => {
    const meal = todayMeals?.find(m => m.mealType === mealType);
    if (!meal) return 0;
    if (meal.customMealCalories) return meal.customMealCalories;
    if (meal.recipeId) {
      const recipe = recipes?.find(r => r.id === meal.recipeId);
      return recipe?.calories || 0;
    }
    return 0;
  };

  const tips = [
    { emoji: '🥗', text: 'Incluye al menos 5 porciones de frutas y verduras al día.' },
    { emoji: '💧', text: 'Bebe al menos 8 vasos de agua al día para mantenerte hidratado.' },
    { emoji: '🏃', text: '30 minutos de actividad física diaria mejora tu salud general.' },
    { emoji: '😴', text: 'Dormir 7-9 horas es esencial para la recuperación del cuerpo.' },
    { emoji: '🥑', text: 'Las grasas saludables son esenciales. Incluye aguacate, nueces y aceite de oliva.' },
  ];

  const randomTip = tips[Math.floor(new Date().getDate() % tips.length)];

  return (
    <div className="px-5 pt-2 pb-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <p className="apple-overline capitalize">{todayDisplay}</p>
        <h1 className="apple-large-title mt-1">¡Hola! 👋</h1>
      </div>

      {/* Calorie Ring Card */}
      <div className="apple-glass rounded-apple-lg p-5">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#F2F2F7"
                strokeWidth="10"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#FF2D55"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - calorieProgress / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-gray-900">{nutrition.calories}</span>
              <span className="text-[10px] text-apple-gray-1">kcal</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Resumen del Día</h3>
            <p className="text-sm text-apple-gray-1 mt-0.5">{nutrition.calories} de {calorieGoal} kcal</p>
            <div className="mt-3 space-y-1.5">
              <MacroBar label="Proteína" value={nutrition.protein} max={75} color="bg-apple-green" />
              <MacroBar label="Carbos" value={nutrition.carbs} max={250} color="bg-apple-orange" />
              <MacroBar label="Grasas" value={nutrition.fat} max={65} color="bg-apple-purple" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Menu */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Menú de Hoy</h2>
        <div className="space-y-2.5">
          <MealRow
            emoji={getMealEmoji('breakfast')}
            label="Desayuno"
            name={getMealName('breakfast')}
            calories={getMealCalories('breakfast')}
            time="🌅"
          />
          <MealRow
            emoji={getMealEmoji('lunch')}
            label="Almuerzo"
            name={getMealName('lunch')}
            calories={getMealCalories('lunch')}
            time="☀️"
          />
          <MealRow
            emoji={getMealEmoji('dinner')}
            label="Cena"
            name={getMealName('dinner')}
            calories={getMealCalories('dinner')}
            time="🌙"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="apple-card p-4 text-center">
          <Droplets className="w-6 h-6 text-apple-blue mx-auto mb-1" />
          <p className="text-lg font-bold">{waterLog?.glasses || 0}/8</p>
          <p className="text-xs text-apple-gray-1">Vasos</p>
        </div>
        <div className="apple-card p-4 text-center">
          <ShoppingCart className="w-6 h-6 text-apple-green mx-auto mb-1" />
          <p className="text-lg font-bold">{pantryCount || 0}</p>
          <p className="text-xs text-apple-gray-1">Despensa</p>
        </div>
        <div className="apple-card p-4 text-center">
          <TrendingUp className="w-6 h-6 text-apple-orange mx-auto mb-1" />
          <p className="text-lg font-bold">{balanceScore}%</p>
          <p className="text-xs text-apple-gray-1">Balance</p>
        </div>
      </div>

      {/* Tip of the Day */}
      <div className="bg-gradient-to-r from-apple-blue/10 to-apple-teal/10 rounded-apple-lg p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-apple-blue flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Tip del Día</h3>
            <p className="text-sm text-gray-600 mt-1">
              {randomTip.emoji} {randomTip.text}
            </p>
          </div>
        </div>
      </div>

      {/* Water Quick Tracker */}
      <div className="apple-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Hidratación</h3>
          <span className="text-sm text-apple-blue font-medium">
            {waterLog?.glasses || 0} de 8 vasos
          </span>
        </div>
        <div className="flex gap-2 justify-between">
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              onClick={() => setWaterLog(today, i + 1)}
              className={`w-8 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                i < (waterLog?.glasses || 0)
                  ? 'bg-apple-blue/15 text-apple-blue'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              <Droplets className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sub-components

const MacroBar: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
}> = ({ label, value, max, color }) => {
  const progress = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-apple-gray-1 w-14">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 w-8 text-right">{value}g</span>
    </div>
  );
};

const MealRow: React.FC<{
  emoji: string;
  label: string;
  name: string | null;
  calories: number;
  time: string;
}> = ({ emoji, label, name, calories, time }) => (
  <div className="apple-card p-4 flex items-center gap-3">
    <span className="text-2xl">{emoji}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-apple-gray-1 font-medium">{time} {label}</p>
      {name ? (
        <p className="font-medium text-gray-900 truncate">{name}</p>
      ) : (
        <p className="text-sm text-apple-gray-2 italic">Sin planificar</p>
      )}
    </div>
    {calories > 0 && (
      <span className="text-sm font-medium text-apple-gray-1">{calories} kcal</span>
    )}
  </div>
);

export default Home;
