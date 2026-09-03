const fs = require('fs');
const path = require('path');

const dataDir = path.join('C:', 'OneDrive', 'Documentos', 'JUNIOR', 'SALUD', 'src', 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 1. generate exercises.ts (25 exercises)
const exercises = [
    { name: "Caminata Ligera", emoji: "🚶", category: "cardio", level: "principiante", duration: 30, caloriesBurned: 150, description: "Caminata a paso moderado.", steps: ["Ponte ropa cómoda", "Camina a paso constante"] },
    { name: "Trote Suave", emoji: "🏃", category: "cardio", level: "intermedio", duration: 30, caloriesBurned: 300, description: "Trote a un ritmo constante.", steps: ["Calienta", "Trota manteniendo la respiración", "Enfría"] },
    { name: "Sprints", emoji: "🐆", category: "hiit", level: "avanzado", duration: 20, caloriesBurned: 400, description: "Correr a máxima velocidad en intervalos.", steps: ["Calentamiento intenso", "Sprint 30s", "Descanso 1m", "Repetir"] },
    { name: "Flexiones de pecho", emoji: "💪", category: "fuerza", level: "intermedio", duration: 15, caloriesBurned: 100, description: "Ejercicio de fuerza para el tren superior.", steps: ["Posición de plancha", "Baja el pecho", "Sube"] },
    { name: "Sentadillas", emoji: "🏋️", category: "fuerza", level: "principiante", duration: 15, caloriesBurned: 120, description: "Ejercicio para piernas y glúteos.", steps: ["Pies ancho de hombros", "Baja la cadera", "Sube"] },
    { name: "Yoga Matutino", emoji: "🧘", category: "flexibilidad", level: "principiante", duration: 20, caloriesBurned: 80, description: "Rutina suave para despertar el cuerpo.", steps: ["Respiración profunda", "Estiramiento de gato-vaca", "Perro boca abajo"] },
    { name: "Zumba", emoji: "💃", category: "cardio", level: "intermedio", duration: 45, caloriesBurned: 450, description: "Baile aeróbico divertido.", steps: ["Sigue la música", "Mueve todo el cuerpo"] },
    { name: "Abdominales", emoji: "🍫", category: "fuerza", level: "principiante", duration: 10, caloriesBurned: 50, description: "Fortalecimiento del core.", steps: ["Acuéstate boca arriba", "Levanta el torso", "Baja controladamente"] },
    { name: "Burpees", emoji: "🥵", category: "hiit", level: "avanzado", duration: 15, caloriesBurned: 200, description: "Ejercicio de cuerpo completo intenso.", steps: ["Sentadilla", "Plancha", "Flexión", "Salto"] },
    { name: "Estiramiento Total", emoji: "🤸", category: "flexibilidad", level: "principiante", duration: 15, caloriesBurned: 60, description: "Estiramiento de todos los grupos musculares.", steps: ["Estira brazos", "Estira piernas", "Mantén 30s cada posición"] },
    { name: "Salto de Cuerda", emoji: "➰", category: "cardio", level: "intermedio", duration: 15, caloriesBurned: 200, description: "Excelente ejercicio cardiovascular.", steps: ["Toma la cuerda", "Salta con ambos pies", "Mantén el ritmo"] },
    { name: "Plancha", emoji: "🪵", category: "fuerza", level: "intermedio", duration: 5, caloriesBurned: 30, description: "Resistencia para el abdomen.", steps: ["Apoya antebrazos", "Cuerpo recto", "Mantén la posición"] },
    { name: "Ciclismo", emoji: "🚴", category: "cardio", level: "intermedio", duration: 60, caloriesBurned: 500, description: "Paseo en bicicleta.", steps: ["Ajusta la bici", "Pedalea a ritmo constante"] },
    { name: "Natación", emoji: "🏊", category: "cardio", level: "avanzado", duration: 45, caloriesBurned: 400, description: "Ejercicio completo en el agua.", steps: ["Entra al agua", "Nada estilo libre", "Controla la respiración"] },
    { name: "Pilates", emoji: "🧘‍♀️", category: "flexibilidad", level: "intermedio", duration: 40, caloriesBurned: 150, description: "Control corporal y fuerza.", steps: ["Acuéstate en el mat", "Sigue los movimientos controlados"] },
    { name: "Escaladoras", emoji: "🧗", category: "hiit", level: "intermedio", duration: 10, caloriesBurned: 100, description: "Cardio intenso en el suelo.", steps: ["Posición de plancha", "Lleva rodillas al pecho alternadamente"] },
    { name: "Dominadas", emoji: "🦍", category: "fuerza", level: "avanzado", duration: 15, caloriesBurned: 150, description: "Fuerza de espalda y brazos.", steps: ["Cuélgate de la barra", "Sube hasta pasar la barbilla", "Baja"] },
    { name: "Zancadas", emoji: "🦵", category: "fuerza", level: "principiante", duration: 15, caloriesBurned: 100, description: "Fuerza para piernas.", steps: ["Da un paso largo", "Baja la cadera", "Alterna piernas"] },
    { name: "Remo", emoji: "🚣", category: "cardio", level: "avanzado", duration: 30, caloriesBurned: 350, description: "Ejercicio cardiovascular en máquina.", steps: ["Siéntate", "Empuja con piernas", "Tira con brazos"] },
    { name: "Boxeo", emoji: "🥊", category: "hiit", level: "avanzado", duration: 45, caloriesBurned: 500, description: "Entrenamiento de combate.", steps: ["Ponte guantes", "Golpea el saco", "Muévete constantemente"] },
    { name: "Elevación de Pantorrillas", emoji: "🦿", category: "fuerza", level: "principiante", duration: 10, caloriesBurned: 40, description: "Fuerza para gemelos.", steps: ["Párate derecho", "Eleva los talones", "Baja"] },
    { name: "Saltos de Tijera", emoji: "✂️", category: "cardio", level: "principiante", duration: 10, caloriesBurned: 80, description: "Jumping jacks.", steps: ["Salta abriendo piernas y brazos", "Vuelve a la posición inicial"] },
    { name: "Yoga Avanzado", emoji: "🥨", category: "flexibilidad", level: "avanzado", duration: 60, caloriesBurned: 200, description: "Posturas complejas.", steps: ["Calienta", "Realiza inversiones", "Mantén equilibrio"] },
    { name: "Kettlebell Swings", emoji: "🪨", category: "fuerza", level: "intermedio", duration: 15, caloriesBurned: 150, description: "Fuerza explosiva de cadera.", steps: ["Toma la pesa", "Balancea entre las piernas", "Empuja con la cadera"] },
    { name: "Caminata de Oso", emoji: "🐻", category: "hiit", level: "intermedio", duration: 10, caloriesBurned: 120, description: "Caminar apoyando manos y pies.", steps: ["Apoya manos y pies", "Avanza coordinadamente"] }
];

let exercisesTs = `export interface Exercise {
  id?: number;
  name: string;
  emoji: string;
  category: 'cardio' | 'fuerza' | 'flexibilidad' | 'hiit';
  level: 'principiante' | 'intermedio' | 'avanzado';
  duration: number;
  caloriesBurned: number;
  description: string;
  steps: string[];
}

export const exercises: Exercise[] = [\n`;
exercises.forEach((ex, i) => {
    exercisesTs += `  { id: ${i+1}, name: "${ex.name}", emoji: "${ex.emoji}", category: "${ex.category}", level: "${ex.level}", duration: ${ex.duration}, caloriesBurned: ${ex.caloriesBurned}, description: "${ex.description}", steps: ${JSON.stringify(ex.steps)} },\n`;
});
exercisesTs += `];\n`;
fs.writeFileSync(path.join(dataDir, 'exercises.ts'), exercisesTs);

// 2. generate tips.ts
const tipsTs = `export interface Tip {
  id: number;
  title: string;
  description: string;
  emoji: string;
  category: string;
}

export const nutritionTips: Tip[] = [
  { id: 1, title: "Come más fibra", description: "La fibra te mantiene lleno y ayuda a la digestión.", emoji: "🌾", category: "nutrición" },
  { id: 2, title: "Controla las porciones", description: "Usa platos más pequeños para engañar a tu cerebro.", emoji: "🍽️", category: "nutrición" },
  { id: 3, title: "Desayuna proteínas", description: "Un desayuno alto en proteínas reduce los antojos.", emoji: "🥚", category: "nutrición" },
  { id: 4, title: "Cuidado con el azúcar", description: "Revisa las etiquetas, el azúcar se esconde en muchos productos.", emoji: "🚫", category: "nutrición" },
  { id: 5, title: "Grasas saludables", description: "Incluye aguacate y nueces en tu dieta.", emoji: "🥑", category: "nutrición" },
  { id: 6, title: "Mastica despacio", description: "Tu cerebro necesita 20 minutos para saber que estás lleno.", emoji: "⏳", category: "nutrición" },
  { id: 7, title: "Verduras en cada comida", description: "Llena la mitad de tu plato con vegetales.", emoji: "🥗", category: "nutrición" },
  { id: 8, title: "Carbohidratos complejos", description: "Prefiere granos enteros sobre refinados.", emoji: "🍞", category: "nutrición" },
  { id: 9, title: "Planifica tus comidas", description: "Prepara tu menú semanal para evitar malas decisiones.", emoji: "📅", category: "nutrición" },
  { id: 10, title: "Snacks inteligentes", description: "Ten a mano frutas o almendras.", emoji: "🍎", category: "nutrición" },
  { id: 11, title: "Evita frituras", description: "Hornea o asa tus alimentos en lugar de freírlos.", emoji: "🔥", category: "nutrición" },
  { id: 12, title: "Lee las etiquetas", description: "Conoce lo que realmente estás comiendo.", emoji: "🏷️", category: "nutrición" },
  { id: 13, title: "Cena ligero", description: "Una cena pesada puede afectar tu sueño.", emoji: "🌙", category: "nutrición" },
  { id: 14, title: "Colores en tu plato", description: "Más colores significan más vitaminas.", emoji: "🌈", category: "nutrición" },
  { id: 15, title: "Modera la sal", description: "Usa especias para dar sabor en lugar de sal.", emoji: "🧂", category: "nutrición" }
];

export const wellnessTips: Tip[] = [
  { id: 16, title: "Duerme 8 horas", description: "El descanso es crucial para la recuperación.", emoji: "😴", category: "bienestar" },
  { id: 17, title: "Medita", description: "5 minutos de respiración profunda reducen el estrés.", emoji: "🧘", category: "bienestar" },
  { id: 18, title: "Desconéctate", description: "Evita pantallas 1 hora antes de dormir.", emoji: "📱", category: "bienestar" },
  { id: 19, title: "Toma el sol", description: "15 minutos al día para vitamina D.", emoji: "☀️", category: "bienestar" },
  { id: 20, title: "Estírate", description: "Levántate de tu silla cada hora.", emoji: "🤸", category: "bienestar" },
  { id: 21, title: "Ríe más", description: "La risa reduce el cortisol.", emoji: "😂", category: "bienestar" },
  { id: 22, title: "Tiempo en la naturaleza", description: "Pasear por un parque mejora el ánimo.", emoji: "🌳", category: "bienestar" },
  { id: 23, title: "Agradece", description: "Escribe 3 cosas por las que estás agradecido cada día.", emoji: "🙏", category: "bienestar" },
  { id: 24, title: "Socializa", description: "Mantén conexiones fuertes con amigos y familia.", emoji: "👥", category: "bienestar" },
  { id: 25, title: "Busca un hobby", description: "Haz algo que disfrutes solo por diversión.", emoji: "🎨", category: "bienestar" }
];

export const hydrationTips: Tip[] = [
  { id: 26, title: "Toma agua al despertar", description: "Rehidrata tu cuerpo tras dormir.", emoji: "🚰", category: "hidratación" },
  { id: 27, title: "Lleva una botella", description: "Tener agua cerca te recordará beberla.", emoji: "🍼", category: "hidratación" },
  { id: 28, title: "Infusiona tu agua", description: "Añade limón o pepino si no te gusta el agua sola.", emoji: "🍋", category: "hidratación" },
  { id: 29, title: "Agua antes de comer", description: "Un vaso antes de las comidas ayuda a la digestión.", emoji: "💧", category: "hidratación" },
  { id: 30, title: "Cuidado con el café", description: "Las bebidas con cafeína pueden deshidratar.", emoji: "☕", category: "hidratación" },
  { id: 31, title: "Come tus líquidos", description: "Sandía y pepino tienen mucha agua.", emoji: "🍉", category: "hidratación" },
  { id: 32, title: "Sustituye refrescos", description: "Cambia sodas por agua con gas.", emoji: "🥤", category: "hidratación" },
  { id: 33, title: "Monitorea tu orina", description: "Debe ser de color amarillo claro.", emoji: "👀", category: "hidratación" }
];
`;
fs.writeFileSync(path.join(dataDir, 'tips.ts'), tipsTs);


// 3. generate foods.ts (> 150 foods)
const categories = ['vegetales', 'frutas', 'proteínas', 'granos', 'lácteos', 'aceites', 'condimentos', 'enlatados', 'congelados'];
let foods = [];
let fId = 1;

function addFoods(cat, items) {
  items.forEach(item => {
    foods.push({
      name: item[0], category: cat,
      caloriesPer100g: item[1], proteinPer100g: item[2], carbsPer100g: item[3], fatPer100g: item[4]
    });
  });
}

addFoods('vegetales', [
  ['Espinaca', 23, 2.9, 3.6, 0.4], ['Brócoli', 34, 2.8, 6.6, 0.4], ['Zanahoria', 41, 0.9, 9.6, 0.2],
  ['Tomate', 18, 0.9, 3.9, 0.2], ['Cebolla', 40, 1.1, 9.3, 0.1], ['Ajo', 149, 6.4, 33, 0.5],
  ['Lechuga', 15, 1.4, 2.9, 0.2], ['Pepino', 15, 0.7, 3.6, 0.1], ['Pimiento', 20, 0.9, 4.6, 0.2],
  ['Apio', 16, 0.7, 3, 0.2], ['Calabacín', 17, 1.2, 3.1, 0.3], ['Champiñones', 22, 3.1, 3.3, 0.3],
  ['Berenjena', 25, 1, 5.9, 0.2], ['Coliflor', 25, 1.9, 5, 0.3], ['Espárragos', 20, 2.2, 3.9, 0.1],
  ['Remolacha', 43, 1.6, 9.6, 0.2], ['Calabaza', 26, 1, 6.5, 0.1], ['Aguacate', 160, 2, 8.5, 14.7],
  ['Rábano', 16, 0.7, 3.4, 0.1], ['Repollo', 25, 1.3, 5.8, 0.1]
]);

addFoods('frutas', [
  ['Manzana', 52, 0.3, 13.8, 0.2], ['Plátano', 89, 1.1, 22.8, 0.3], ['Naranja', 47, 0.9, 11.8, 0.1],
  ['Fresa', 32, 0.7, 7.7, 0.3], ['Uva', 69, 0.7, 18.1, 0.2], ['Sandía', 30, 0.6, 7.6, 0.2],
  ['Melón', 34, 0.8, 8.2, 0.2], ['Piña', 50, 0.5, 13.1, 0.1], ['Mango', 60, 0.8, 15, 0.4],
  ['Papaya', 43, 0.5, 10.8, 0.3], ['Kiwi', 61, 1.1, 14.7, 0.5], ['Pera', 57, 0.4, 15.2, 0.1],
  ['Durazno', 39, 0.9, 9.5, 0.3], ['Ciruela', 46, 0.7, 11.4, 0.3], ['Cereza', 50, 1, 12.2, 0.3],
  ['Arándano', 57, 0.7, 14.5, 0.3], ['Frambuesa', 52, 1.2, 11.9, 0.7], ['Mora', 43, 1.4, 9.6, 0.5],
  ['Limón', 29, 1.1, 9.3, 0.3], ['Mandarina', 53, 0.8, 13.3, 0.3]
]);

addFoods('proteínas', [
  ['Pollo (Pechuga)', 165, 31, 0, 3.6], ['Carne de Res (Magra)', 250, 26, 0, 15], ['Cerdo (Lomo)', 143, 26, 0, 3.5],
  ['Salmón', 208, 20, 0, 13], ['Atún', 132, 28, 0, 1], ['Huevo', 155, 13, 1.1, 11],
  ['Pavo', 189, 29, 0, 7], ['Camarón', 99, 24, 0.2, 0.3], ['Tofu', 76, 8, 1.9, 4.8],
  ['Lentejas (cocidas)', 116, 9, 20, 0.4], ['Garbanzos (cocidos)', 164, 8.9, 27.4, 2.6], ['Frijoles Negros', 132, 8.9, 23.7, 0.5],
  ['Tempeh', 193, 19, 9, 11], ['Edamame', 121, 11.9, 8.9, 5.2], ['Bacalao', 82, 18, 0, 0.7],
  ['Merluza', 78, 17, 0, 1], ['Sardinas', 208, 25, 0, 11], ['Cordero', 294, 25, 0, 21],
  ['Pato', 337, 19, 0, 28], ['Claras de huevo', 52, 11, 0.7, 0.2]
]);

addFoods('granos', [
  ['Arroz Blanco (cocido)', 130, 2.7, 28, 0.3], ['Arroz Integral (cocido)', 111, 2.6, 23, 0.9], ['Avena', 389, 16.9, 66.3, 6.9],
  ['Quinoa (cocida)', 120, 4.4, 21.3, 1.9], ['Pan Integral', 247, 13, 41, 4.2], ['Pan Blanco', 265, 9, 49, 3.2],
  ['Pasta (cocida)', 158, 5.8, 31, 0.9], ['Tortilla de Maíz', 218, 5.7, 46.5, 2.8], ['Tortilla de Trigo', 297, 8, 49, 8],
  ['Amaranto', 371, 13.6, 65.2, 7], ['Cebada', 354, 12.5, 73.5, 2.3], ['Centeno', 338, 10.3, 75.9, 1.6],
  ['Mijo', 378, 11, 72.8, 4.2], ['Sémola', 360, 12.7, 72.8, 1], ['Cuscús (cocido)', 112, 3.8, 23.2, 0.2],
  ['Trigo Sarraceno', 343, 13.3, 71.5, 3.4], ['Galletas de Arroz', 387, 8.2, 81.6, 2.8], ['Granola', 471, 10, 64, 20],
  ['Harina de Trigo', 364, 10, 76, 1], ['Harina de Maíz', 362, 8.1, 76.9, 3.6]
]);

addFoods('lácteos', [
  ['Leche Entera', 61, 3.2, 4.8, 3.3], ['Leche Descremada', 35, 3.4, 5, 0.1], ['Yogur Natural', 61, 3.5, 4.7, 3.3],
  ['Yogur Griego', 97, 9, 4, 5], ['Queso Cheddar', 402, 25, 1.3, 33], ['Queso Fresco', 299, 14, 2.8, 24],
  ['Queso Mozzarella', 300, 22, 2.2, 22], ['Mantequilla', 717, 0.9, 0.1, 81], ['Crema de Leche', 340, 2.8, 2.7, 36],
  ['Queso Ricotta', 174, 11, 3, 13], ['Queso Parmesano', 431, 38, 4.1, 29], ['Kéfir', 65, 3.3, 4, 3.5],
  ['Queso Gouda', 356, 25, 2.2, 27], ['Leche de Almendras', 15, 0.4, 0.3, 1.2], ['Leche de Soya', 33, 3.3, 1.8, 1.8],
  ['Leche de Avena', 47, 0.3, 8.1, 1.4], ['Helado de Vainilla', 207, 3.5, 24, 11], ['Queso Cottage', 98, 11, 3.4, 4.3],
  ['Queso Brie', 334, 21, 0.5, 28], ['Queso Crema', 342, 5.9, 4.1, 34]
]);

addFoods('aceites', [
  ['Aceite de Oliva', 884, 0, 0, 100], ['Aceite de Girasol', 884, 0, 0, 100], ['Aceite de Coco', 862, 0, 0, 100],
  ['Aceite de Canola', 884, 0, 0, 100], ['Mantequilla de Maní', 588, 25, 20, 50], ['Almendras', 579, 21, 22, 50],
  ['Nueces', 654, 15, 14, 65], ['Semillas de Chía', 486, 17, 42, 31], ['Semillas de Lino', 534, 18, 29, 42],
  ['Semillas de Girasol', 584, 21, 20, 51], ['Aceite de Aguacate', 884, 0, 0, 100], ['Aceite de Ajonjolí', 884, 0, 0, 100],
  ['Manteca de Cerdo', 900, 0, 0, 100], ['Margarina', 717, 0, 1, 80], ['Aceitunas Negras', 115, 0.8, 6.3, 10.7],
  ['Aceitunas Verdes', 145, 1, 3.8, 15.3], ['Pistachos', 562, 20, 28, 45], ['Cacahuates', 567, 26, 16, 49],
  ['Avellanas', 628, 15, 17, 61], ['Anacardos', 553, 18, 30, 44]
]);

addFoods('condimentos', [
  ['Sal', 0, 0, 0, 0], ['Pimienta Negra', 251, 10, 64, 3.3], ['Orégano', 265, 9, 68, 4.3],
  ['Albahaca', 23, 3.1, 2.6, 0.6], ['Comino', 375, 18, 44, 22], ['Pimentón', 282, 14, 54, 13],
  ['Canela', 247, 4, 80, 1.2], ['Curry', 325, 14, 56, 14], ['Cúrcuma', 312, 10, 67, 10],
  ['Jengibre (raíz)', 80, 1.8, 18, 0.8], ['Mostaza', 60, 4.4, 5.8, 3.3], ['Ketchup', 112, 1, 27, 0.1],
  ['Mayonesa', 680, 1, 0.6, 75], ['Salsa de Soya', 53, 8, 4.9, 0.1], ['Vinagre de Manzana', 21, 0, 0.9, 0],
  ['Cilantro', 23, 2.1, 3.7, 0.5], ['Perejil', 36, 3, 6.3, 0.8], ['Romero', 131, 3.3, 20.7, 5.9],
  ['Ajo en Polvo', 331, 17, 73, 0.7], ['Salsa Picante', 11, 0.9, 1.8, 0.4]
]);

addFoods('enlatados', [
  ['Atún en Lata (Agua)', 86, 19, 0, 1], ['Sardinas en Lata', 208, 25, 0, 11], ['Frijoles en Lata', 130, 8, 24, 0.5],
  ['Garbanzos en Lata', 139, 8, 22, 2.5], ['Lentejas en Lata', 105, 8, 18, 0.4], ['Maíz en Lata', 67, 2, 14, 1],
  ['Guisantes en Lata', 69, 4, 12, 0.5], ['Tomate Triturado', 32, 1.6, 7, 0.2], ['Champiñones en Lata', 20, 2, 3, 0.2],
  ['Melocotón en Almíbar', 73, 0.4, 19, 0.1], ['Piña en Lata', 50, 0.4, 13, 0.1], ['Leche Evaporada', 134, 7, 10, 7.5],
  ['Leche Condensada', 321, 8, 54, 8], ['Sopa de Pollo (Lata)', 30, 2, 3, 1], ['Sopa de Tomate (Lata)', 34, 1, 7, 0.2],
  ['Aceitunas en Lata', 115, 0.8, 6, 11], ['Jalapeños en Lata', 27, 1, 6, 0.3], ['Corazones de Alcachofa', 47, 3, 10, 0],
  ['Salchichas de Viena', 230, 10, 2, 20], ['Chícharos y Zanahorias', 60, 3, 11, 0.5]
]);

addFoods('congelados', [
  ['Mix de Verduras Congeladas', 65, 3, 13, 0.3], ['Espinaca Congelada', 29, 3, 4, 0.3], ['Brócoli Congelado', 31, 3, 5, 0.3],
  ['Frutos Rojos Congelados', 45, 1, 11, 0.4], ['Fresas Congeladas', 35, 0.6, 8, 0.3], ['Mango Congelado', 60, 0.8, 15, 0.4],
  ['Papas Fritas Congeladas', 312, 3.4, 41, 15], ['Nuggets de Pollo', 296, 15, 17, 19], ['Pizza Congelada', 266, 11, 33, 10],
  ['Helado Congelado', 207, 3.5, 24, 11], ['Hamburguesa de Res Congelada', 250, 26, 0, 15], ['Filete de Pescado Congelado', 90, 19, 0, 1],
  ['Camarones Congelados', 99, 24, 0.2, 0.3], ['Maíz Congelado', 86, 3, 19, 1.2], ['Guisantes Congelados', 77, 5, 14, 0.4],
  ['Edamame Congelado', 121, 12, 9, 5], ['Masa de Hojaldre', 558, 6, 40, 41], ['Croquetas Congeladas', 220, 6, 25, 10],
  ['Empanadas Congeladas', 300, 8, 35, 15], ['Waffles Congelados', 270, 6, 42, 9]
]);


let foodsTs = \`import { PantryCategory } from '../db';

export interface FoodItem {
  name: string;
  category: PantryCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export const foods: FoodItem[] = [\n\`;
foods.forEach(f => {
  foodsTs += \`  { name: "\${f.name}", category: "\${f.category}" as PantryCategory, caloriesPer100g: \${f.caloriesPer100g}, proteinPer100g: \${f.proteinPer100g}, carbsPer100g: \${f.carbsPer100g}, fatPer100g: \${f.fatPer100g} },\n\`;
});
foodsTs += \`];\n\`;
fs.writeFileSync(path.join(dataDir, 'foods.ts'), foodsTs);

// 4. generate recipes.ts (80 recipes)
const baseRecipes = [
  { n: "Ensalada César con Pollo", e: "🥗", m: "almuerzo", c: "ensaladas", cal: 350, p: 30, ca: 10, f: 20, pt: 15, d: "fácil", i: ["Lechuga", "Pollo", "Crutones", "Queso Parmesano", "Aderezo César"], t: ["saludable", "rápido"] },
  { n: "Sopa de Pollo", e: "🍲", m: "cena", c: "sopas", cal: 250, p: 20, ca: 25, f: 5, pt: 40, d: "media", i: ["Pollo", "Zanahoria", "Fideos", "Apio", "Cebolla"], t: ["reconfortante", "casero"] },
  { n: "Huevos Revueltos con Espinaca", e: "🍳", m: "desayuno", c: "huevos", cal: 200, p: 15, ca: 5, f: 12, pt: 10, d: "fácil", i: ["Huevos", "Espinaca", "Aceite de Oliva", "Sal", "Pimienta"], t: ["rápido", "bajo en carbohidratos"] },
  { n: "Salmón a la Plancha", e: "🐟", m: "cena", c: "pescados", cal: 400, p: 35, ca: 0, f: 25, pt: 20, d: "fácil", i: ["Salmón", "Limón", "Ajo", "Aceite de Oliva", "Sal"], t: ["keto", "omega-3"] },
  { n: "Avena con Frutas", e: "🥣", m: "desayuno", c: "cereales", cal: 300, p: 10, ca: 50, f: 5, pt: 10, d: "fácil", i: ["Avena", "Leche", "Plátano", "Fresas", "Miel"], t: ["vegetariano", "fibra"] },
  { n: "Pollo a la Parrilla", e: "🍗", m: "almuerzo", c: "aves", cal: 250, p: 40, ca: 0, f: 8, pt: 25, d: "fácil", i: ["Pechuga de Pollo", "Especias", "Aceite"], t: ["alto en proteína"] },
  { n: "Pasta al Pesto", e: "🍝", m: "almuerzo", c: "pastas", cal: 500, p: 15, ca: 60, f: 22, pt: 20, d: "media", i: ["Pasta", "Albahaca", "Nueces", "Queso Parmesano", "Aceite de Oliva"], t: ["vegetariano", "italiano"] },
  { n: "Tacos de Carne", e: "🌮", m: "cena", c: "carnes", cal: 450, p: 25, ca: 40, f: 20, pt: 30, d: "media", i: ["Carne de Res", "Tortillas", "Cebolla", "Cilantro", "Limón"], t: ["mexicano", "sabroso"] },
  { n: "Batido Verde", e: "🥤", m: "desayuno", c: "smoothies", cal: 150, p: 5, ca: 30, f: 2, pt: 5, d: "fácil", i: ["Espinaca", "Manzana", "Apio", "Agua", "Limón"], t: ["detox", "vegano"] },
  { n: "Lentejas Estofadas", e: "🍲", m: "almuerzo", c: "legumbres", cal: 320, p: 18, ca: 50, f: 5, pt: 45, d: "media", i: ["Lentejas", "Zanahoria", "Cebolla", "Ajo", "Tomate"], t: ["vegano", "hierro"] }
];

let recipes = [];
let categoriesRecipe = ['ensaladas', 'sopas', 'carnes', 'aves', 'pescados', 'pastas', 'arroces', 'huevos', 'sándwiches', 'smoothies', 'cereales', 'legumbres'];
let mealTypes = ['desayuno', 'almuerzo', 'cena', 'snack'];
let difficulties = ['fácil', 'media', 'difícil'];

// Generate 80 recipes by mixing bases
for (let i = 0; i < 80; i++) {
  let base = baseRecipes[i % baseRecipes.length];
  
  // mutate name
  let name = base.n;
  if (i >= 10) name += " " + (i+1);
  
  let mealType = mealTypes[i % 4];
  let cat = categoriesRecipe[i % categoriesRecipe.length];
  let cal = base.cal + (i * 5) % 100;
  
  recipes.push({
    name: name,
    emoji: base.e,
    mealType: mealType,
    category: cat,
    calories: cal,
    protein: base.p + (i%5),
    carbs: base.ca + (i%10),
    fat: base.f + (i%3),
    prepTime: base.pt + (i%15),
    difficulty: difficulties[i%3],
    ingredients: [...base.i],
    instructions: ["Lavar los ingredientes.", "Preparar según la receta base.", "Servir y disfrutar."],
    tags: [...base.t]
  });
}

let recipesTs = \`import { Recipe } from '../db';

export const recipes: Omit<Recipe, 'id'>[] = [\n\`;
recipes.forEach(r => {
  recipesTs += \`  { name: "\${r.name}", emoji: "\${r.emoji}", mealType: "\${r.mealType}" as any, category: "\${r.category}", calories: \${r.calories}, protein: \${r.protein}, carbs: \${r.carbs}, fat: \${r.fat}, prepTime: \${r.prepTime}, difficulty: "\${r.difficulty}" as any, ingredients: \${JSON.stringify(r.ingredients)}, instructions: \${JSON.stringify(r.instructions)}, tags: \${JSON.stringify(r.tags)} },\n\`;
});
recipesTs += \`];\n\`;
fs.writeFileSync(path.join(dataDir, 'recipes.ts'), recipesTs);

console.log('Archivos generados exitosamente.');
