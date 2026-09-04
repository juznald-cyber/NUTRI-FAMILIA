import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PantryItem, type MealPlanEntry, type FamilyMember, type WaterLog, type PantryCategory } from '../db';
import { 
  generateSyncId,
  pushFamilyMemberToCloud, 
  removeFamilyMemberFromCloud, 
  pushPantryItemToCloud, 
  removePantryItemFromCloud, 
  pushMealPlanToCloud, 
  removeMealPlanFromCloud, 
  pushWaterLogToCloud 
} from '../lib/syncService';

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
  const syncId = item.syncId || generateSyncId('pnt');
  const fullItem = { ...item, syncId };
  const id = await db.pantryItems.add(fullItem);
  await pushPantryItemToCloud({ ...fullItem, id });
  return id;
}

export async function updatePantryItem(id: number, changes: Partial<PantryItem>) {
  await db.pantryItems.update(id, changes);
  const updated = await db.pantryItems.get(id);
  if (updated) {
    if (!updated.syncId) {
      updated.syncId = generateSyncId('pnt');
      await db.pantryItems.update(id, { syncId: updated.syncId });
    }
    await pushPantryItemToCloud(updated);
  }
}

export async function deletePantryItem(id: number) {
  const item = await db.pantryItems.get(id);
  await db.pantryItems.delete(id);
  if (item?.syncId) {
    await removePantryItemFromCloud(item.syncId);
  }
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
  const syncId = entry.syncId || `${entry.date}_${entry.mealType}`;
  const fullEntry = { ...entry, syncId };
  const id = await db.mealPlans.add(fullEntry);
  await pushMealPlanToCloud({ ...fullEntry, id });
  return id;
}

export async function updateMealPlanEntry(id: number, changes: Partial<MealPlanEntry>) {
  await db.mealPlans.update(id, changes);
  const updated = await db.mealPlans.get(id);
  if (updated) {
    if (!updated.syncId) {
      updated.syncId = `${updated.date}_${updated.mealType}`;
      await db.mealPlans.update(id, { syncId: updated.syncId });
    }
    await pushMealPlanToCloud(updated);
  }
}

export async function deleteMealPlanEntry(id: number) {
  const item = await db.mealPlans.get(id);
  await db.mealPlans.delete(id);
  if (item?.syncId) {
    await removeMealPlanFromCloud(item.syncId);
  }
}

export async function clearMealPlanForDate(date: string) {
  const entries = await db.mealPlans.where('date').equals(date).toArray();
  await db.mealPlans.where('date').equals(date).delete();
  for (const entry of entries) {
    if (entry.syncId) {
      await removeMealPlanFromCloud(entry.syncId);
    }
  }
}

export async function clearMealPlanForWeek(dates: string[]) {
  const entries = await db.mealPlans.where('date').anyOf(dates).toArray();
  await db.mealPlans.where('date').anyOf(dates).delete();
  for (const entry of entries) {
    if (entry.syncId) {
      await removeMealPlanFromCloud(entry.syncId);
    }
  }
}

// ============================================
// Family Hooks
// ============================================

export function useFamilyMembers() {
  return useLiveQuery(() => db.familyMembers.toArray());
}

export async function addFamilyMember(member: Omit<FamilyMember, 'id'>) {
  const syncId = member.syncId || generateSyncId('fam');
  const fullMember = { ...member, syncId };
  const id = await db.familyMembers.add(fullMember);
  await pushFamilyMemberToCloud({ ...fullMember, id });
  return id;
}

export async function updateFamilyMember(id: number, changes: Partial<FamilyMember>) {
  await db.familyMembers.update(id, changes);
  const updated = await db.familyMembers.get(id);
  if (updated) {
    if (!updated.syncId) {
      updated.syncId = generateSyncId('fam');
      await db.familyMembers.update(id, { syncId: updated.syncId });
    }
    await pushFamilyMemberToCloud(updated);
  }
}

export async function deleteFamilyMember(id: number) {
  const item = await db.familyMembers.get(id);
  await db.familyMembers.delete(id);
  if (item?.syncId) {
    await removeFamilyMemberFromCloud(item.syncId);
  }
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
    await db.waterLogs.update(existing.id!, { glasses, goal });
    await pushWaterLogToCloud({ ...existing, glasses, goal });
    return existing.id!;
  }
  const id = await db.waterLogs.add({ date, glasses, goal });
  await pushWaterLogToCloud({ date, glasses, goal, id });
  return id;
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
