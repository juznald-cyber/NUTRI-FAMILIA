import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MealPlanEntry, Recipe } from '../db';

interface WeeklyPlanData {
  days: Date[];
  meals: MealPlanEntry[];
  recipes: Recipe[];
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena'
};

export const exportWeeklyPlanToPDF = ({ days, meals, recipes }: WeeklyPlanData) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startDateStr = format(days[0], "d 'de' MMMM", { locale: es });
  const endDateStr = format(days[days.length - 1], "d 'de' MMMM, yyyy", { locale: es });

  // Header Title
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('🍏 NutriFamilia — Plan Semanal de Alimentación', 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Semana del ${startDateStr} al ${endDateStr}`, 14, 25);

  // Table Data Preparation
  const tableHead = [['Día', 'Comida', 'Menú / Receta', 'Calorías (kcal)', 'Proteína (g)', 'Carbos (g)', 'Grasas (g)', 'Ingredientes']];
  const tableBody: any[][] = [];

  days.forEach((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayName = format(day, "EEEE d 'de' MMM", { locale: es }).toUpperCase();
    const dayMeals = meals.filter(m => m.date === dayStr);

    ['breakfast', 'lunch', 'dinner'].forEach((mealType, index) => {
      const entry = dayMeals.find(m => m.mealType === mealType);
      const recipe = entry?.recipeId ? recipes.find(r => r.id === entry.recipeId) : undefined;
      
      const mealName = entry?.customMealName || recipe?.name || 'Sin planificar';
      const cals = entry?.customMealCalories || recipe?.calories || 0;
      const prot = entry?.customMealProtein || recipe?.protein || 0;
      const carbs = entry?.customMealCarbs || recipe?.carbs || 0;
      const fat = entry?.customMealFat || recipe?.fat || 0;
      
      const ingredients = recipe?.ingredients?.map(i => `${i.name} (${i.amount} ${i.unit})`).join(', ') || '-';

      tableBody.push([
        index === 0 ? dayName : '',
        MEAL_LABELS[mealType],
        mealName,
        cals > 0 ? cals.toString() : '-',
        prot > 0 ? prot.toString() : '-',
        carbs > 0 ? carbs.toString() : '-',
        fat > 0 ? fat.toString() : '-',
        ingredients
      ]);
    });
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 32,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 122, 255], // Apple Blue
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { fontStyle: 'bold', cellWidth: 25 },
      2: { cellWidth: 50 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 20 },
      7: { cellWidth: 75, fontSize: 8 }
    },
    styles: {
      cellPadding: 2.5,
      overflow: 'linebreak'
    }
  });

  // Footer Note
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generado por NutriFamilia · Tu salud y nutrición balanceada en familia', 14, pageHeight - 8);

  // Save PDF
  doc.save(`NutriFamilia_Menu_${format(days[0], 'yyyy-MM-dd')}.pdf`);
};

export const exportWeeklyPlanToExcel = ({ days, meals, recipes }: WeeklyPlanData) => {
  const rows: any[] = [];

  days.forEach((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayName = format(day, "EEEE d 'de' MMMM", { locale: es });
    const dayMeals = meals.filter(m => m.date === dayStr);

    ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
      const entry = dayMeals.find(m => m.mealType === mealType);
      const recipe = entry?.recipeId ? recipes.find(r => r.id === entry.recipeId) : undefined;
      
      const mealName = entry?.customMealName || recipe?.name || 'Sin planificar';
      const cals = entry?.customMealCalories || recipe?.calories || 0;
      const prot = entry?.customMealProtein || recipe?.protein || 0;
      const carbs = entry?.customMealCarbs || recipe?.carbs || 0;
      const fat = entry?.customMealFat || recipe?.fat || 0;
      const ingredients = recipe?.ingredients?.map(i => `${i.name} (${i.amount} ${i.unit})`).join(', ') || '';

      rows.push({
        'Fecha': dayStr,
        'Día': dayName.charAt(0).toUpperCase() + dayName.slice(1),
        'Momento': MEAL_LABELS[mealType],
        'Comida / Receta': mealName,
        'Calorías (kcal)': cals,
        'Proteína (g)': prot,
        'Carbohidratos (g)': carbs,
        'Grasas (g)': fat,
        'Ingredientes': ingredients,
        'Completada': entry?.isCompleted ? 'Sí' : 'No'
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set columns width for better readability
  worksheet['!cols'] = [
    { wch: 12 }, // Fecha
    { wch: 20 }, // Día
    { wch: 14 }, // Momento
    { wch: 30 }, // Comida / Receta
    { wch: 15 }, // Calorías
    { wch: 14 }, // Proteína
    { wch: 18 }, // Carbohidratos
    { wch: 12 }, // Grasas
    { wch: 45 }, // Ingredientes
    { wch: 12 }  // Completada
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Menú Semanal');

  // Export file
  XLSX.writeFile(workbook, `NutriFamilia_Menu_${format(days[0], 'yyyy-MM-dd')}.xlsx`);
};
