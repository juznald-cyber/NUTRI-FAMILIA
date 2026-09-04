import { GoogleGenAI } from '@google/genai';
import { db, type Recipe, type PantryItem, type FamilyMember, type MealPlanEntry } from '../db';
import { addRecipe } from '../hooks/useDatabase';

import { doc, setDoc } from 'firebase/firestore';
import { auth, dbFirestore } from '../lib/firebase';

export const GEMINI_STORAGE_KEY = 'nutrifamilia_gemini_api_key';

export function getGeminiApiKey(): string {
  const customKey = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

export function setGeminiApiKey(key: string) {
  const trimmed = key ? key.trim() : '';
  if (trimmed) {
    localStorage.setItem(GEMINI_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent('gemini-key-updated', { detail: trimmed }));

  // Push to user cloud profile in Firestore
  const user = auth.currentUser;
  if (user && user.uid && user.uid !== 'guest_user') {
    try {
      const settingsRef = doc(dbFirestore, `users/${user.uid}/settings/config`);
      setDoc(settingsRef, { geminiApiKey: trimmed }, { merge: true }).catch(err => {
        console.error('Failed to sync API key to cloud:', err);
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export function hasGeminiApiKey(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 10);
}

function getAIClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No se ha configurado una clave de API de Gemini. Por favor ingresa tu API Key en la configuración.');
  }
  return new GoogleGenAI({ apiKey });
}

export interface AIGeneratedPlanResponse {
  recipes: Omit<Recipe, 'id'>[];
  mealPlans: {
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    recipeName: string;
  }[];
}

/**
 * Generates an intelligent, diverse weekly/daily meal plan using Gemini AI
 */
export async function generateAIMealPlan({
  dates,
  pantryItems,
  familyMembers,
}: {
  dates: string[];
  pantryItems: PantryItem[];
  familyMembers: FamilyMember[];
}): Promise<AIGeneratedPlanResponse> {
  const ai = getAIClient();

  const pantryList = pantryItems.length > 0
    ? pantryItems.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ')
    : 'Despensa estándar balanceada (pollo, vegetales variados, arroz, frutas, huevos, legumbres, avena)';

  const familyList = familyMembers.length > 0
    ? familyMembers.map(m => 
        `- ${m.name} (${m.age} años, ${m.gender === 'female' ? 'Mujer' : 'Hombre'}, meta: ${m.calorieGoal} kcal/día${
          m.restrictions && m.restrictions.length > 0 ? `, Restricciones: ${m.restrictions.join(', ')}` : ''
        })`
      ).join('\n')
    : '- Familia general (meta promedio 2000 kcal/día, sin restricciones)';

  const prompt = `Eres un chef profesional y nutricionista clínico de élite para la aplicación NutriFamilia.
Tu objetivo es diseñar un menú semanal o diario variado, delicioso y nutricionalmente balanceado para las siguientes fechas: ${dates.join(', ')}.

INFORMACIÓN DE LA FAMILIA:
${familyList}

PRODUCTOS DISPONIBLES EN LA DESPENSA:
${pantryList}

REGLAS ESTRICTAS:
1. Respetar 100% las restricciones alimenticias indicadas (ej. sin gluten, sin lactosa, diabético, bajo en sodio, etc.).
2. Priorizar el uso de los ingredientes disponibles en la despensa, complementando con ingredientes frescos y saludables.
3. No repetir recetas en el mismo día ni días consecutivos; ofrecer variedad gastronómica (desayuno, almuerzo y cena para cada fecha).
4. Asignar calorías y macros (proteína, carbohidratos, grasas en gramos) realistas a cada receta.
5. Asignar un emoji gastronómico representativo a cada plato.
6. Responder ÚNICAMENTE con un JSON válido con la siguiente estructura:

{
  "recipes": [
    {
      "name": "Nombre descriptivo de la receta",
      "emoji": "🥗",
      "mealType": "breakfast" | "lunch" | "dinner",
      "category": "vegetales" | "proteinas" | "granos" | "otros",
      "calories": 450,
      "protein": 30,
      "carbs": 45,
      "fat": 15,
      "prepTime": 20,
      "difficulty": "fácil" | "media" | "difícil",
      "ingredients": [
        { "name": "Ingrediente", "amount": 100, "unit": "g" }
      ],
      "instructions": [
        "Paso 1...",
        "Paso 2..."
      ],
      "tags": ["Saludable", "Alto en proteína"]
    }
  ],
  "mealPlans": [
    {
      "date": "YYYY-MM-DD",
      "mealType": "breakfast" | "lunch" | "dinner",
      "recipeName": "Nombre exacto de una de las recetas creadas"
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const text = response.text || '{}';
  const parsed: AIGeneratedPlanResponse = JSON.parse(text);
  return parsed;
}

/**
 * Generates fresh nutrition, wellness, and hydration tips with Gemini AI
 */
export async function generateAITips(familyMembers: FamilyMember[]) {
  const ai = getAIClient();

  const restrictions = Array.from(new Set(familyMembers.flatMap(m => m.restrictions || []))).join(', ');
  const prompt = `Como nutricionista de NutriFamilia, genera 6 consejos prácticos, modernos y motivadores para hoy.
Perfil familiar: ${familyMembers.length} integrantes. Restricciones: ${restrictions || 'Ninguna'}.
Devuelve un JSON con el formato:
{
  "nutritionTips": [
    { "id": 1, "title": "Título corto", "description": "Explicación práctica en 1 o 2 oraciones", "emoji": "🥑" }
  ],
  "wellnessTips": [
    { "id": 1, "title": "Título corto", "description": "Consejo de sueño, estrés o digestión", "emoji": "💆" }
  ],
  "hydrationTips": [
    { "id": 1, "title": "Título corto", "description": "Tip sobre agua y electrolitos", "emoji": "💧" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.8,
    },
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Generates fresh customized exercises with Gemini AI
 */
export async function generateAIExercises(familyMembers: FamilyMember[]) {
  const ai = getAIClient();

  const prompt = `Como entrenador personal y especialista en actividad física familiar, genera 6 ejercicios variados (cardio, fuerza, flexibilidad, hiit) para hacer en casa o parque.
Devuelve un JSON con el formato:
{
  "exercises": [
    {
      "id": 1,
      "name": "Nombre del ejercicio",
      "category": "cardio" | "fuerza" | "flexibilidad" | "hiit",
      "emoji": "🏃",
      "duration": 15,
      "caloriesBurned": 120,
      "level": "principiante" | "intermedio" | "avanzado",
      "description": "Breve beneficio",
      "steps": ["Paso 1", "Paso 2", "Paso 3"]
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Interactive NutriChef AI Assistant (Chat / Q&A)
 */
export async function askNutriChef({
  question,
  pantryItems,
  familyMembers,
}: {
  question: string;
  pantryItems: PantryItem[];
  familyMembers: FamilyMember[];
}): Promise<string> {
  const ai = getAIClient();

  const pantrySummary = pantryItems.slice(0, 15).map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ');
  const familySummary = familyMembers.map(m => `${m.name} (${m.age} años, meta: ${m.calorieGoal} kcal${m.restrictions.length > 0 ? `, restricciones: ${m.restrictions.join(', ')}` : ''})`).join('; ');

  const systemPrompt = `Eres "NutriChef AI", el asistente inteligente y cálido de la aplicación NutriFamilia.
Tu rol es ayudar a las familias a comer sano, dar ideas rápidas de recetas con lo que tienen en la despensa y resolver dudas de salud o nutrición.
- Despensa actual: ${pantrySummary || 'Despensa básica'}
- Familia: ${familySummary || 'Familia general'}

Sé conciso, estructurado con emojis y listas claras, y muy motivador. Responde en español.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nPregunta del usuario: ${question}` }] }
    ],
  });

  return response.text || 'No pude procesar la respuesta en este momento. Por favor intenta de nuevo.';
}
