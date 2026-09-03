import { db, type Recipe, type MealPlanEntry, type PantryItem } from '../db';

/**
 * Motor de planificación de menús de NutriFamilia.
 * Genera menús diarios balanceados basados en la despensa disponible.
 */

// ============================================
// Tipos internos
// ============================================

interface DailyPlan {
  breakfast: MealSuggestion;
  lunch: MealSuggestion;
  dinner: MealSuggestion;
}

interface MealSuggestion {
  recipeId: number;
  recipeName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ============================================
// Funciones principales
// ============================================

/**
 * Genera un plan semanal completo basado en la despensa.
 */
export async function generateWeeklyPlan(
  dates: string[],
  restrictions: string[] = []
): Promise<Map<string, DailyPlan>> {
  const recipes = await db.recipes.toArray();
  const pantryItems = await db.pantryItems.toArray();
  const weekPlan = new Map<string, DailyPlan>();
  const usedRecipeIds = new Set<number>();

  for (const date of dates) {
    const dailyPlan = generateDailyPlan(recipes, pantryItems, usedRecipeIds, restrictions);
    weekPlan.set(date, dailyPlan);
  }

  return weekPlan;
}

/**
 * Genera un plan para un solo día.
 */
function generateDailyPlan(
  recipes: Recipe[],
  pantryItems: PantryItem[],
  usedRecipeIds: Set<number>,
  restrictions: string[]
): DailyPlan {
  const pantryNames = new Set(pantryItems.map(p => p.name.toLowerCase()));

  const breakfast = selectMeal(recipes, 'breakfast', pantryNames, usedRecipeIds, restrictions);
  const lunch = selectMeal(recipes, 'lunch', pantryNames, usedRecipeIds, restrictions);
  const dinner = selectMeal(recipes, 'dinner', pantryNames, usedRecipeIds, restrictions);

  return { breakfast, lunch, dinner };
}

/**
 * Selecciona la mejor receta para un tipo de comida.
 */
function selectMeal(
  recipes: Recipe[],
  mealType: 'breakfast' | 'lunch' | 'dinner',
  pantryNames: Set<string>,
  usedRecipeIds: Set<number>,
  restrictions: string[]
): MealSuggestion {
  // Filtrar por tipo de comida
  let candidates = recipes.filter(r => r.mealType === mealType);

  // Filtrar por restricciones alimenticias
  if (restrictions.length > 0) {
    candidates = candidates.filter(r => {
      return !restrictions.some(restriction => {
        const rLower = restriction.toLowerCase();
        if (rLower === 'vegetariano') {
          return r.tags?.some(t => ['carne', 'pollo', 'res', 'cerdo', 'pescado'].includes(t.toLowerCase()));
        }
        if (rLower === 'sin gluten') {
          return r.tags?.some(t => ['gluten', 'trigo', 'harina'].includes(t.toLowerCase()));
        }
        if (rLower === 'sin lactosa' || rLower === 'sin lácteos') {
          return r.tags?.some(t => ['lácteo', 'leche', 'queso', 'yogurt'].includes(t.toLowerCase()));
        }
        return false;
      });
    });
  }

  // Scoring: priorizar recetas con ingredientes disponibles en despensa
  const scored = candidates.map(recipe => {
    const ingredientNames = recipe.ingredients.map(i => i.name.toLowerCase());
    const matchCount = ingredientNames.filter(name =>
      Array.from(pantryNames).some(pn => pn.includes(name) || name.includes(pn))
    ).length;
    const matchRatio = ingredientNames.length > 0 ? matchCount / ingredientNames.length : 0;
    const isUsed = usedRecipeIds.has(recipe.id!) ? -0.5 : 0;

    return {
      recipe,
      score: matchRatio + isUsed + Math.random() * 0.3, // Add randomness for variety
    };
  });

  // Ordenar por score y seleccionar la mejor
  scored.sort((a, b) => b.score - a.score);

  const selected = scored.length > 0 ? scored[0].recipe : candidates[0] || recipes[0];

  if (selected?.id) {
    usedRecipeIds.add(selected.id);
  }

  return {
    recipeId: selected?.id || 0,
    recipeName: selected?.name || 'Sin receta disponible',
    calories: selected?.calories || 0,
    protein: selected?.protein || 0,
    carbs: selected?.carbs || 0,
    fat: selected?.fat || 0,
  };
}

/**
 * Genera un plan para un día específico y lo guarda en la base de datos.
 */
export async function generateAndSaveDailyPlan(
  date: string,
  restrictions: string[] = []
): Promise<void> {
  const recipes = await db.recipes.toArray();
  const pantryItems = await db.pantryItems.toArray();

  // Limpiar plan existente para esa fecha
  await db.mealPlans.where('date').equals(date).delete();

  const usedRecipeIds = new Set<number>();
  const plan = generateDailyPlan(recipes, pantryItems, usedRecipeIds, restrictions);

  const entries: Omit<MealPlanEntry, 'id'>[] = [
    {
      date,
      mealType: 'breakfast',
      recipeId: plan.breakfast.recipeId,
      isCompleted: false,
    },
    {
      date,
      mealType: 'lunch',
      recipeId: plan.lunch.recipeId,
      isCompleted: false,
    },
    {
      date,
      mealType: 'dinner',
      recipeId: plan.dinner.recipeId,
      isCompleted: false,
    },
  ];

  await db.mealPlans.bulkAdd(entries);
}

/**
 * Genera y guarda plan para toda la semana.
 */
export async function generateAndSaveWeeklyPlan(
  dates: string[],
  restrictions: string[] = []
): Promise<void> {
  // Limpiar planes existentes
  await db.mealPlans.where('date').anyOf(dates).delete();

  const weekPlan = await generateWeeklyPlan(dates, restrictions);

  const entries: Omit<MealPlanEntry, 'id'>[] = [];

  for (const [date, plan] of weekPlan) {
    entries.push(
      { date, mealType: 'breakfast', recipeId: plan.breakfast.recipeId, isCompleted: false },
      { date, mealType: 'lunch', recipeId: plan.lunch.recipeId, isCompleted: false },
      { date, mealType: 'dinner', recipeId: plan.dinner.recipeId, isCompleted: false }
    );
  }

  await db.mealPlans.bulkAdd(entries);
}

/**
 * Regenera solo una comida específica de un día.
 */
export async function regenerateSingleMeal(
  date: string,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  restrictions: string[] = []
): Promise<void> {
  const recipes = await db.recipes.toArray();
  const pantryItems = await db.pantryItems.toArray();
  const pantryNames = new Set(pantryItems.map(p => p.name.toLowerCase()));

  // Obtener recetas ya usadas en este día
  const existingMeals = await db.mealPlans.where('date').equals(date).toArray();
  const usedRecipeIds = new Set(existingMeals.map(m => m.recipeId).filter(Boolean) as number[]);

  const suggestion = selectMeal(recipes, mealType, pantryNames, usedRecipeIds, restrictions);

  // Eliminar la comida existente
  const existing = existingMeals.find(m => m.mealType === mealType);
  if (existing?.id) {
    await db.mealPlans.delete(existing.id);
  }

  // Agregar la nueva
  await db.mealPlans.add({
    date,
    mealType,
    recipeId: suggestion.recipeId,
    isCompleted: false,
  });
}

/**
 * Calcula los macros totales del día.
 */
export async function getDailyNutrition(date: string): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  const meals = await db.mealPlans.where('date').equals(date).toArray();
  let calories = 0, protein = 0, carbs = 0, fat = 0;

  for (const meal of meals) {
    if (meal.recipeId) {
      const recipe = await db.recipes.get(meal.recipeId);
      if (recipe) {
        calories += recipe.calories;
        protein += recipe.protein;
        carbs += recipe.carbs;
        fat += recipe.fat;
      }
    } else if (meal.customMealCalories) {
      calories += meal.customMealCalories;
      protein += meal.customMealProtein || 0;
      carbs += meal.customMealCarbs || 0;
      fat += meal.customMealFat || 0;
    }
  }

  return { calories, protein, carbs, fat };
}
