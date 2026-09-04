/**
 * Nutrition & Demographic Calculations
 * - Exact age from birthdate
 * - Mifflin-St Jeor TDEE calorie calculation
 */

export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { label: string; factor: number; desc: string }> = {
  sedentary: { label: 'Sedentario', factor: 1.2, desc: 'Poco o ningún ejercicio' },
  light: { label: 'Ligero', factor: 1.375, desc: 'Ejercicio 1-3 días/semana' },
  moderate: { label: 'Moderado', factor: 1.55, desc: 'Ejercicio 3-5 días/semana' },
  active: { label: 'Activo', factor: 1.725, desc: 'Ejercicio 6-7 días/semana' },
  very_active: { label: 'Muy activo', factor: 1.9, desc: 'Entrenamiento intenso / trabajo físico' },
};

export interface CalorieCalcParams {
  age: number;
  gender: 'male' | 'female';
  weightKg?: number;
  heightCm?: number;
  activityLevel?: ActivityLevel;
}

export function calculateEstimatedCalories({
  age,
  gender,
  weightKg,
  heightCm,
  activityLevel = 'moderate',
}: CalorieCalcParams): number {
  const factor = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.55;

  // If weight and height provided, use Mifflin-St Jeor equation
  if (weightKg && weightKg > 0 && heightCm && heightCm > 0) {
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    // Return rounded TDEE
    return Math.max(800, Math.round(bmr * factor));
  }

  // Fallback WHO standard estimates based on age & gender
  if (age <= 3) return 1000;
  if (age <= 8) return 1300;
  if (age <= 13) return gender === 'male' ? 1900 : 1700;
  if (age <= 18) return gender === 'male' ? 2400 : 2000;
  if (age <= 50) return gender === 'male' ? 2200 : 1800;
  return gender === 'male' ? 2000 : 1600;
}
