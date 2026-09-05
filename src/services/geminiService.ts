import { GoogleGenAI } from '@google/genai';
import { db, type Recipe, type PantryItem, type FamilyMember, type MealPlanEntry } from '../db';
import { addRecipe } from '../hooks/useDatabase';

import { doc, setDoc } from 'firebase/firestore';
import { auth, dbFirestore } from '../lib/firebase';
import { getActiveUserId } from '../lib/syncService';

export const GEMINI_STORAGE_KEY = 'nutrifamilia_gemini_api_key';

export function getGeminiApiKey(): string {
  const customKey = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (customKey && customKey.trim()) {
    return customKey.replace(/["'\s]/g, '').trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  return envKey ? envKey.replace(/["'\s]/g, '').trim() : '';
}

export function setGeminiApiKey(key: string) {
  const trimmed = key ? key.replace(/["'\s]/g, '').trim() : '';
  if (trimmed) {
    localStorage.setItem(GEMINI_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent('gemini-key-updated', { detail: trimmed }));

  // Push to user cloud profile in Firestore
  const userId = getActiveUserId();
  if (userId && userId !== 'guest_user') {
    try {
      const settingsRef = doc(dbFirestore, `users/${userId}/settings/config`);
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
  return Boolean(key && key.length >= 20);
}

function getAIClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No se ha configurado una clave de API de Gemini. Por favor ingresa tu API Key en la configuración.');
  }
  return new GoogleGenAI({ apiKey });
}

const VALID_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.5-flash'];

async function generateWithFallback(options: {
  contents: string | any[];
  responseMimeType?: string;
  temperature?: number;
}): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No se ha configurado una clave de API de Gemini. Por favor ingresa tu API Key en la configuración.');
  }

  let lastErr: any = null;
  const parts = typeof options.contents === 'string'
    ? [{ text: options.contents }]
    : options.contents;

  for (const model of VALID_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: [
          {
            parts: parts
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
        }
      };
      if (options.responseMimeType) {
        payload.generationConfig.responseMimeType = options.responseMimeType;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data?.error?.message || `HTTP ${res.status}`;
        console.warn(`Gemini model ${model} error:`, errorMsg);
        
        // Critical errors that won't be fixed by switching models (API key invalid, blocked, permission denied, etc.)
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          throw new Error(`Problema con la API Key (HTTP ${res.status}): ${errorMsg}. Verifica tu clave de Gemini en Configuración.`);
        }

        lastErr = new Error(`Error de Gemini (${res.status}): ${errorMsg}`);
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      if (err.message?.includes('Problema con la API Key') || err.message?.includes('clave de API de Gemini no es válida')) {
        throw err; // Stop falling back for auth/key errors
      }
      lastErr = err;
      console.warn(`Model ${model} failed, trying next fallback:`, err);
    }
  }

  throw lastErr || new Error('No se pudo conectar con el servicio de IA de Gemini.');
}

export interface ScannedReceiptProduct {
  name: string;
  category: import('../db').PantryCategory;
  quantity: number;
  unit: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
}

/**
 * Scans a supermarket/grocery receipt, invoice or ticket image and extracts all food items.
 */
export async function scanReceiptAndExtractProducts(
  base64DataUrl: string
): Promise<ScannedReceiptProduct[]> {
  // Extract mime type and raw base64 data
  let mimeType = 'image/jpeg';
  let base64Data = base64DataUrl;

  const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    base64Data = match[2];
  }

  const prompt = `Eres un asistente inteligente de visión artificial y nutrición para NutriFamilia.
Tu tarea es examinar con alta precisión la imagen de esta factura, boleta, ticket de compra o recibo de supermercado.

INSTRUCCIONES CLAVE:
1. Extrae TODOS y cada uno de los alimentos, ingredientes y productos comestibles que aparezcan en la factura.
2. Limpia y normaliza el nombre de cada alimento para que sea legible y humano (ej. si el ticket dice "POLLO PECH DESH 1KG", nómbralo "Pechuga de Pollo Deshuesada"; si dice "LECH ENTERA COLUN 1L", nómbralo "Leche Entera").
3. Clasifica cada producto en una de estas categorías EXACTAS:
   - "vegetales"
   - "frutas"
   - "proteinas"
   - "granos"
   - "lacteos"
   - "aceites"
   - "condimentos"
   - "enlatados"
   - "congelados"
   - "bebidas"
   - "otros"
4. Determina la cantidad numérica y la unidad ('unidades', 'kg', 'g', 'litros', 'paquetes', 'latas', 'bolsas'). Si no se indica cantidad explícita, asume 1.
5. Asigna valores estimados aproximados de macronutrientes por 100g (caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g).
6. IMPORTANTE: Ignora por completo artículos NO comestibles (como bolsas plásticas, detergente, jabón, papel higiénico, servilletas, pilas, etc.), así como encabezados de tienda, RUT, impuestos, totales, cambio, etc.

Responde ÚNICAMENTE con un JSON con la siguiente estructura:
{
  "products": [
    {
      "name": "Nombre limpio del producto",
      "category": "vegetales" | "frutas" | "proteinas" | "granos" | "lacteos" | "aceites" | "condimentos" | "enlatados" | "congelados" | "bebidas" | "otros",
      "quantity": 1,
      "unit": "unidades" | "kg" | "g" | "litros" | "paquetes" | "latas" | "bolsas",
      "caloriesPer100g": 120,
      "proteinPer100g": 20,
      "carbsPer100g": 0,
      "fatPer100g": 3
    }
  ]
}`;

  const parts = [
    { text: prompt },
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    }
  ];

  const responseText = await generateWithFallback({
    contents: parts,
    responseMimeType: 'application/json',
    temperature: 0.1
  });

  try {
    const parsed = JSON.parse(responseText || '{}');
    if (Array.isArray(parsed.products)) {
      return parsed.products;
    }
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse receipt JSON from Gemini:', err, responseText);
    throw new Error('No se pudo estructurar la lista de productos de la boleta. Intenta con una foto más nítida o iluminada.');
  }
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

  const text = await generateWithFallback({
    contents: prompt,
    responseMimeType: 'application/json',
    temperature: 0.7,
  });

  const parsed: AIGeneratedPlanResponse = JSON.parse(text || '{}');
  return parsed;
}

/**
 * Generates fresh nutrition, wellness, and hydration tips with Gemini AI
 */
export async function generateAITips(familyMembers: FamilyMember[]) {
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

  const text = await generateWithFallback({
    contents: prompt,
    responseMimeType: 'application/json',
    temperature: 0.8,
  });

  return JSON.parse(text || '{}');
}

/**
 * Generates fresh customized exercises with Gemini AI
 */
export async function generateAIExercises(familyMembers: FamilyMember[]) {
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

  const text = await generateWithFallback({
    contents: prompt,
    responseMimeType: 'application/json',
    temperature: 0.7,
  });

  return JSON.parse(text || '{}');
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
  const pantrySummary = pantryItems.slice(0, 15).map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ');
  const familySummary = familyMembers.map(m => `${m.name} (${m.age} años, meta: ${m.calorieGoal} kcal${m.restrictions.length > 0 ? `, restricciones: ${m.restrictions.join(', ')}` : ''})`).join('; ');

  const systemPrompt = `Eres "NutriChef AI", el asistente inteligente y cálido de la aplicación NutriFamilia.
Tu rol es ayudar a las familias a comer sano, dar ideas rápidas de recetas con lo que tienen en la despensa y resolver dudas de salud o nutrición.
- Despensa actual: ${pantrySummary || 'Despensa básica'}
- Familia: ${familySummary || 'Familia general'}

Sé conciso, estructurado con emojis y listas claras, y muy motivador. Responde en español.`;

  const fullPrompt = `${systemPrompt}\n\nPregunta del usuario: ${question}`;

  const reply = await generateWithFallback({
    contents: fullPrompt,
    temperature: 0.7,
  });

  return reply || 'No pude procesar la respuesta en este momento. Por favor intenta de nuevo.';
}
