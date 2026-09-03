import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PantryItem, type MealPlanEntry, type FamilyMember, type WaterLog, type PantryCategory } from '../db';

// ============================================
// Pantry Hooks
// ============================================

export function usePantryItems(category?: PantryCategory) {
  return useLiveQuery(
    () => {
      if (category) {
        return db.pantryItems.where('category').equals(category).toArray();
      }
      return db.pantryItems.toArray();
    },
    [category]
  );
}

export async function addPantryItem(item: Omit<PantryItem, 'id'>) {
  return db.pantryItems.add(item);
}

export async function updatePantryItem(id: number, changes: Partial<PantryItem>) {
  return db.pantryItems.update(id, changes);
}

export async function deletePantryItem(id: number) {
  return db.pantryItems.delete(id);
}

// ============================================
// Meal Plan Hooks
// ============================================

export function useMealPlan(date: string) {
  return useLiveQuery(
    () => db.mealPlans.where('date').equals(date).toArray(),
    [date]
  );
}

export function useWeekMealPlan(dates: string[]) {
  return useLiveQuery(
    () => db.mealPlans.where('date').anyOf(dates).toArray(),
    [dates.join(',')]
  );
}

export async function addMealPlanEntry(entry: Omit<MealPlanEntry, 'id'>) {
  return db.mealPlans.add(entry);
}

export async function updateMealPlanEntry(id: number, changes: Partial<MealPlanEntry>) {
  return db.mealPlans.update(id, changes);
}

export async function deleteMealPlanEntry(id: number) {
  return db.mealPlans.delete(id);
}

export async function clearMealPlanForDate(date: string) {
  return db.mealPlans.where('date').equals(date).delete();
}

export async function clearMealPlanForWeek(dates: string[]) {
  return db.mealPlans.where('date').anyOf(dates).delete();
}

// ============================================
// Family Hooks
// ============================================

export function useFamilyMembers() {
  return useLiveQuery(() => db.familyMembers.toArray());
}

export async function addFamilyMember(member: Omit<FamilyMember, 'id'>) {
  return db.familyMembers.add(member);
}

export async function updateFamilyMember(id: number, changes: Partial<FamilyMember>) {
  return db.familyMembers.update(id, changes);
}

export async function deleteFamilyMember(id: number) {
  return db.familyMembers.delete(id);
}

// ============================================
// Water Log Hooks
// ============================================

export function useWaterLog(date: string) {
  return useLiveQuery(
    () => db.waterLogs.where('date').equals(date).first(),
    [date]
  );
}

export async function setWaterLog(date: string, glasses: number, goal: number = 8) {
  const existing = await db.waterLogs.where('date').equals(date).first();
  if (existing) {
    return db.waterLogs.update(existing.id!, { glasses, goal });
  }
  return db.waterLogs.add({ date, glasses, goal });
}

// ============================================
// Recipe Hooks
// ============================================

export function useRecipes() {
  return useLiveQuery(() => db.recipes.toArray());
}

export async function addRecipe(recipe: Omit<import('../db').Recipe, 'id'>) {
  return db.recipes.add(recipe);
}

export async function seedRecipes(recipes: Omit<import('../db').Recipe, 'id'>[]) {
  const count = await db.recipes.count();
  if (count === 0) {
    return db.recipes.bulkAdd(recipes);
  }
}
