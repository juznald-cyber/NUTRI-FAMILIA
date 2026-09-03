import React from 'react';

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieGoal?: number;
}

export default function NutritionSummary({ calories, protein, carbs, fat, calorieGoal = 2000 }: NutritionSummaryProps) {
  const getPercent = (value: number, goal: number) => Math.min(100, Math.round((value / goal) * 100));

  // Estimaciones aproximadas de macros basadas en la meta calórica
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4); // 30% proteínas
  const carbsGoal = Math.round((calorieGoal * 0.4) / 4); // 40% carbohidratos
  const fatGoal = Math.round((calorieGoal * 0.3) / 9); // 30% grasas

  return (
    <div className="apple-card p-5 space-y-4">
      <h3 className="apple-section-title">Resumen Nutricional</h3>
      
      <div className="space-y-3">
        {/* Calorías */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-apple-gray-6">Calorías</span>
            <span className="text-apple-gray-4">{calories} / {calorieGoal} kcal</span>
          </div>
          <div className="h-2.5 bg-apple-gray-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-apple-red transition-all duration-500"
              style={{ width: `${getPercent(calories, calorieGoal)}%` }}
            />
          </div>
        </div>

        {/* Proteína */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-apple-gray-6">Proteína</span>
            <span className="text-apple-gray-4">{protein}g / {proteinGoal}g</span>
          </div>
          <div className="h-2.5 bg-apple-gray-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-apple-green transition-all duration-500"
              style={{ width: `${getPercent(protein, proteinGoal)}%` }}
            />
          </div>
        </div>

        {/* Carbohidratos */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-apple-gray-6">Carbohidratos</span>
            <span className="text-apple-gray-4">{carbs}g / {carbsGoal}g</span>
          </div>
          <div className="h-2.5 bg-apple-gray-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-apple-orange transition-all duration-500"
              style={{ width: `${getPercent(carbs, carbsGoal)}%` }}
            />
          </div>
        </div>

        {/* Grasas */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-apple-gray-6">Grasas</span>
            <span className="text-apple-gray-4">{fat}g / {fatGoal}g</span>
          </div>
          <div className="h-2.5 bg-apple-gray-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-apple-purple transition-all duration-500"
              style={{ width: `${getPercent(fat, fatGoal)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
