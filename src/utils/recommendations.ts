import { db, type PantryCategory, PANTRY_CATEGORIES } from '../db';

/**
 * Motor de recomendaciones de NutriFamilia.
 * Analiza la despensa y sugiere compras para mejorar el balance nutricional.
 */

export interface ShoppingRecommendation {
  category: PantryCategory;
  emoji: string;
  label: string;
  status: 'bueno' | 'bajo' | 'vacío';
  currentCount: number;
  suggestedItems: string[];
  message: string;
}

// Alimentos sugeridos por categoría
const SUGGESTED_ITEMS: Record<PantryCategory, string[]> = {
  vegetales: [
    'Brócoli', 'Espinaca', 'Zanahoria', 'Tomate', 'Cebolla',
    'Pimiento', 'Lechuga', 'Pepino', 'Calabacín', 'Apio',
    'Chayote', 'Ejotes', 'Elote', 'Nopales', 'Aguacate',
  ],
  frutas: [
    'Manzana', 'Plátano', 'Naranja', 'Fresas', 'Arándanos',
    'Piña', 'Mango', 'Papaya', 'Sandía', 'Uvas',
    'Limón', 'Mandarina', 'Guayaba', 'Kiwi', 'Pera',
  ],
  proteinas: [
    'Pechuga de pollo', 'Carne molida de res', 'Salmón',
    'Atún', 'Huevos', 'Lomo de cerdo', 'Camarones',
    'Tofu', 'Pavo', 'Tilapia', 'Frijoles negros', 'Lentejas',
  ],
  granos: [
    'Arroz integral', 'Arroz blanco', 'Avena', 'Quinoa',
    'Pan integral', 'Pasta integral', 'Tortillas de maíz',
    'Frijoles', 'Lentejas', 'Garbanzos', 'Harina de trigo',
  ],
  lacteos: [
    'Leche descremada', 'Yogurt natural', 'Queso fresco',
    'Queso panela', 'Crema', 'Mantequilla', 'Queso oaxaca',
  ],
  aceites: [
    'Aceite de oliva', 'Aceite de coco', 'Aceite de aguacate',
    'Mantequilla de maní', 'Almendras', 'Nueces', 'Semillas de chía',
  ],
  condimentos: [
    'Sal', 'Pimienta', 'Ajo en polvo', 'Comino', 'Orégano',
    'Chile en polvo', 'Canela', 'Salsa de soya', 'Vinagre',
  ],
  enlatados: [
    'Frijoles enlatados', 'Atún en lata', 'Tomate triturado',
    'Maíz enlatado', 'Chipotle en adobo', 'Salsa de tomate',
  ],
  congelados: [
    'Verduras mixtas', 'Frutos del bosque', 'Edamame',
    'Brócoli congelado', 'Mezcla para stir-fry',
  ],
  bebidas: [
    'Agua', 'Leche vegetal', 'Té verde', 'Café',
    'Jugo natural', 'Agua de coco',
  ],
  otros: [
    'Miel de abeja', 'Chocolate oscuro', 'Proteína en polvo',
    'Semillas de girasol', 'Coco rallado',
  ],
};

// Mínimos recomendados por categoría
const MIN_ITEMS_PER_CATEGORY: Partial<Record<PantryCategory, number>> = {
  vegetales: 5,
  frutas: 3,
  proteinas: 3,
  granos: 3,
  lacteos: 2,
  aceites: 2,
  condimentos: 4,
};

/**
 * Analiza la despensa y genera recomendaciones de compra.
 */
export async function getShoppingRecommendations(): Promise<ShoppingRecommendation[]> {
  const pantryItems = await db.pantryItems.toArray();
  const recommendations: ShoppingRecommendation[] = [];

  // Agrupar items por categoría
  const itemsByCategory = new Map<PantryCategory, number>();
  const existingNames = new Set<string>();

  for (const item of pantryItems) {
    const count = itemsByCategory.get(item.category) || 0;
    itemsByCategory.set(item.category, count + 1);
    existingNames.add(item.name.toLowerCase());
  }

  // Evaluar cada categoría
  const priorityCategories: PantryCategory[] = [
    'vegetales', 'frutas', 'proteinas', 'granos', 'lacteos', 'aceites',
  ];

  for (const category of priorityCategories) {
    const currentCount = itemsByCategory.get(category) || 0;
    const minRequired = MIN_ITEMS_PER_CATEGORY[category] || 2;
    const meta = PANTRY_CATEGORIES[category];

    // Filtrar sugerencias que no están ya en la despensa
    const suggestedItems = (SUGGESTED_ITEMS[category] || []).filter(
      item => !existingNames.has(item.toLowerCase())
    ).slice(0, 5);

    let status: 'bueno' | 'bajo' | 'vacío';
    let message: string;

    if (currentCount === 0) {
      status = 'vacío';
      message = `No tienes ${meta.label.toLowerCase()} en tu despensa. ¡Es importante incluirlos para una alimentación balanceada!`;
    } else if (currentCount < minRequired) {
      status = 'bajo';
      message = `Tienes solo ${currentCount} ${meta.label.toLowerCase()}. Te recomendamos tener al menos ${minRequired} variedad.`;
    } else {
      status = 'bueno';
      message = `¡Bien! Tienes buena variedad de ${meta.label.toLowerCase()}.`;
    }

    recommendations.push({
      category,
      emoji: meta.emoji,
      label: meta.label,
      status,
      currentCount,
      suggestedItems,
      message,
    });
  }

  // Ordenar: vacío primero, luego bajo, luego bueno
  const statusOrder = { 'vacío': 0, 'bajo': 1, 'bueno': 2 };
  recommendations.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return recommendations;
}

/**
 * Genera una lista de compras sugerida basada en las deficiencias.
 */
export async function getSuggestedShoppingList(): Promise<{ category: string; items: string[] }[]> {
  const recommendations = await getShoppingRecommendations();
  return recommendations
    .filter(r => r.status !== 'bueno')
    .map(r => ({
      category: `${r.emoji} ${r.label}`,
      items: r.suggestedItems,
    }));
}

/**
 * Calcula un puntaje de balance nutricional (0-100).
 */
export async function getNutritionBalanceScore(): Promise<{
  score: number;
  details: { category: string; status: string; emoji: string }[];
}> {
  const recommendations = await getShoppingRecommendations();
  const total = recommendations.length;
  const good = recommendations.filter(r => r.status === 'bueno').length;
  const low = recommendations.filter(r => r.status === 'bajo').length;

  const score = Math.round(((good * 1 + low * 0.5) / total) * 100);

  return {
    score,
    details: recommendations.map(r => ({
      category: r.label,
      status: r.status,
      emoji: r.emoji,
    })),
  };
}
