import Dexie, { type Table } from 'dexie';

// ============================================
// Types
// ============================================

export interface PantryItem {
  id?: number;
  name: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate?: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
}

export type PantryCategory =
  | 'vegetales'
  | 'frutas'
  | 'proteinas'
  | 'granos'
  | 'lacteos'
  | 'aceites'
  | 'condimentos'
  | 'enlatados'
  | 'congelados'
  | 'bebidas'
  | 'otros';

export interface Recipe {
  id?: number;
  name: string;
  emoji: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  category: string;
  ingredients: RecipeIngredient[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  difficulty: 'fácil' | 'media' | 'difícil';
  instructions: string[];
  tags: string[];
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface MealPlanEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeId?: number;
  customMealName?: string;
  customMealCalories?: number;
  customMealProtein?: number;
  customMealCarbs?: number;
  customMealFat?: number;
  isCompleted: boolean;
}

export interface FamilyMember {
  id?: number;
  name: string;
  emoji: string;
  birthDate?: string;
  age: number;
  gender?: 'male' | 'female';
  weightKg?: number;
  heightCm?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  calorieGoal: number;
  restrictions: string[];
}

export interface WaterLog {
  id?: number;
  date: string;
  glasses: number;
  goal: number;
}

// ============================================
// Database
// ============================================

export class NutriFamiliaDB extends Dexie {
  pantryItems!: Table<PantryItem, number>;
  recipes!: Table<Recipe, number>;
  mealPlans!: Table<MealPlanEntry, number>;
  familyMembers!: Table<FamilyMember, number>;
  waterLogs!: Table<WaterLog, number>;

  constructor() {
    super('NutriFamiliaDB');
    this.version(1).stores({
      pantryItems: '++id, name, category, purchaseDate',
      recipes: '++id, name, mealType, category',
      mealPlans: '++id, date, mealType, [date+mealType]',
      familyMembers: '++id, name',
      waterLogs: '++id, date',
    });
  }
}

export const db = new NutriFamiliaDB();

// ============================================
// Category Metadata
// ============================================

export const PANTRY_CATEGORIES: Record<PantryCategory, { label: string; emoji: string }> = {
  vegetales: { label: 'Vegetales', emoji: '🥬' },
  frutas: { label: 'Frutas', emoji: '🍎' },
  proteinas: { label: 'Proteínas', emoji: '🥩' },
  granos: { label: 'Granos y Cereales', emoji: '🌾' },
  lacteos: { label: 'Lácteos', emoji: '🥛' },
  aceites: { label: 'Aceites y Grasas', emoji: '🫒' },
  condimentos: { label: 'Condimentos', emoji: '🧂' },
  enlatados: { label: 'Enlatados', emoji: '🥫' },
  congelados: { label: 'Congelados', emoji: '🧊' },
  bebidas: { label: 'Bebidas', emoji: '🥤' },
  otros: { label: 'Otros', emoji: '📦' },
};

export const UNITS = [
  'unidades', 'kg', 'g', 'lb', 'oz',
  'litros', 'ml', 'tazas', 'cucharadas',
  'cucharaditas', 'paquetes', 'latas', 'bolsas',
];
