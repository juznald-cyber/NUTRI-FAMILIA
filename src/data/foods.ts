import { PantryCategory } from '../db';

export interface FoodItem {
  name: string;
  category: PantryCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

const rawVegetales: [string, number, number, number, number][] = [
  ['Espinaca', 23, 2.9, 3.6, 0.4], ['Brócoli', 34, 2.8, 6.6, 0.4], ['Zanahoria', 41, 0.9, 9.6, 0.2],
  ['Tomate', 18, 0.9, 3.9, 0.2], ['Cebolla', 40, 1.1, 9.3, 0.1], ['Ajo', 149, 6.4, 33, 0.5],
  ['Lechuga', 15, 1.4, 2.9, 0.2], ['Pepino', 15, 0.7, 3.6, 0.1], ['Pimiento Rojo', 26, 1, 6, 0.3],
  ['Pimiento Verde', 20, 0.9, 4.6, 0.2], ['Apio', 16, 0.7, 3, 0.2], ['Calabacín', 17, 1.2, 3.1, 0.3],
  ['Champiñones', 22, 3.1, 3.3, 0.3], ['Berenjena', 25, 1, 5.9, 0.2], ['Coliflor', 25, 1.9, 5, 0.3],
  ['Espárragos', 20, 2.2, 3.9, 0.1], ['Remolacha', 43, 1.6, 9.6, 0.2], ['Calabaza', 26, 1, 6.5, 0.1],
  ['Rábano', 16, 0.7, 3.4, 0.1], ['Repollo', 25, 1.3, 5.8, 0.1], ['Acelga', 19, 1.8, 3.7, 0.2],
  ['Alcachofa', 47, 3.3, 10.5, 0.2], ['Cebollín', 30, 3.3, 4.3, 0.7], ['Puerro', 61, 1.5, 14.2, 0.3],
  ['Camote', 86, 1.6, 20.1, 0.1], ['Papa', 77, 2, 17.5, 0.1], ['Nabo', 28, 0.9, 6.4, 0.1]
];

const rawFrutas: [string, number, number, number, number][] = [
  ['Manzana', 52, 0.3, 13.8, 0.2], ['Plátano', 89, 1.1, 22.8, 0.3], ['Naranja', 47, 0.9, 11.8, 0.1],
  ['Fresa', 32, 0.7, 7.7, 0.3], ['Uva', 69, 0.7, 18.1, 0.2], ['Sandía', 30, 0.6, 7.6, 0.2],
  ['Melón', 34, 0.8, 8.2, 0.2], ['Piña', 50, 0.5, 13.1, 0.1], ['Mango', 60, 0.8, 15, 0.4],
  ['Papaya', 43, 0.5, 10.8, 0.3], ['Kiwi', 61, 1.1, 14.7, 0.5], ['Pera', 57, 0.4, 15.2, 0.1],
  ['Durazno', 39, 0.9, 9.5, 0.3], ['Ciruela', 46, 0.7, 11.4, 0.3], ['Cereza', 50, 1, 12.2, 0.3],
  ['Arándano', 57, 0.7, 14.5, 0.3], ['Frambuesa', 52, 1.2, 11.9, 0.7], ['Mora', 43, 1.4, 9.6, 0.5],
  ['Limón', 29, 1.1, 9.3, 0.3], ['Mandarina', 53, 0.8, 13.3, 0.3], ['Aguacate', 160, 2, 8.5, 14.7],
  ['Coco', 354, 3.3, 15.2, 33.5], ['Granada', 83, 1.7, 18.7, 1.2], ['Guayaba', 68, 2.6, 14.3, 1],
  ['Higo', 74, 0.8, 19.2, 0.3], ['Maracuyá', 97, 2.2, 23.4, 0.7]
];

const rawProteinas: [string, number, number, number, number][] = [
  ['Pechuga de Pollo', 165, 31, 0, 3.6], ['Carne de Res Magra', 250, 26, 0, 15], ['Lomo de Cerdo', 143, 26, 0, 3.5],
  ['Salmón', 208, 20, 0, 13], ['Atún Fresco', 132, 28, 0, 1], ['Huevo Entero', 155, 13, 1.1, 11],
  ['Pavo', 189, 29, 0, 7], ['Camarón', 99, 24, 0.2, 0.3], ['Tofu Firme', 144, 15.8, 2.8, 8.7],
  ['Lentejas (cocidas)', 116, 9, 20, 0.4], ['Garbanzos (cocidos)', 164, 8.9, 27.4, 2.6], ['Frijoles Negros', 132, 8.9, 23.7, 0.5],
  ['Tempeh', 193, 19, 9, 11], ['Edamame', 121, 11.9, 8.9, 5.2], ['Bacalao', 82, 18, 0, 0.7],
  ['Merluza', 78, 17, 0, 1], ['Sardinas Frescas', 208, 25, 0, 11], ['Cordero', 294, 25, 0, 21],
  ['Claras de Huevo', 52, 11, 0.7, 0.2], ['Carne Molida (90% magra)', 176, 20, 0, 10], ['Tilapia', 96, 20, 0, 1.7],
  ['Trucha', 148, 20.8, 0, 6.6], ['Pulpo', 82, 14.9, 2.2, 1], ['Calamar', 92, 15.6, 3.1, 1.4],
  ['Seitan', 370, 75, 14, 1.9], ['Frijol Pinto', 143, 9, 26, 0.7], ['Lentejas Rojas', 116, 9, 20, 0.4]
];

const rawGranos: [string, number, number, number, number][] = [
  ['Arroz Blanco (cocido)', 130, 2.7, 28, 0.3], ['Arroz Integral (cocido)', 111, 2.6, 23, 0.9], ['Avena (seca)', 389, 16.9, 66.3, 6.9],
  ['Quinoa (cocida)', 120, 4.4, 21.3, 1.9], ['Pan Integral', 247, 13, 41, 4.2], ['Pan Blanco', 265, 9, 49, 3.2],
  ['Pasta de Trigo (cocida)', 158, 5.8, 31, 0.9], ['Tortilla de Maíz', 218, 5.7, 46.5, 2.8], ['Tortilla de Harina', 297, 8, 49, 8],
  ['Amaranto', 371, 13.6, 65.2, 7], ['Cebada', 354, 12.5, 73.5, 2.3], ['Centeno', 338, 10.3, 75.9, 1.6],
  ['Mijo', 378, 11, 72.8, 4.2], ['Cuscús (cocido)', 112, 3.8, 23.2, 0.2], ['Trigo Sarraceno', 343, 13.3, 71.5, 3.4],
  ['Galletas de Arroz', 387, 8.2, 81.6, 2.8], ['Granola', 471, 10, 64, 20], ['Harina de Trigo', 364, 10, 76, 1],
  ['Harina de Maíz', 362, 8.1, 76.9, 3.6], ['Salvado de Avena', 246, 17, 66, 7], ['Fideos de Arroz', 364, 3, 80, 0.6]
];

const rawLacteos: [string, number, number, number, number][] = [
  ['Leche Entera', 61, 3.2, 4.8, 3.3], ['Leche Descremada', 35, 3.4, 5, 0.1], ['Yogur Natural', 61, 3.5, 4.7, 3.3],
  ['Yogur Griego', 97, 9, 4, 5], ['Queso Cheddar', 402, 25, 1.3, 33], ['Queso Panela', 299, 14, 2.8, 24],
  ['Queso Mozzarella', 300, 22, 2.2, 22], ['Mantequilla', 717, 0.9, 0.1, 81], ['Crema de Leche', 340, 2.8, 2.7, 36],
  ['Queso Ricotta', 174, 11, 3, 13], ['Queso Parmesano', 431, 38, 4.1, 29], ['Kéfir', 65, 3.3, 4, 3.5],
  ['Queso Gouda', 356, 25, 2.2, 27], ['Leche de Almendras', 15, 0.4, 0.3, 1.2], ['Leche de Soya', 33, 3.3, 1.8, 1.8],
  ['Leche de Avena', 47, 0.3, 8.1, 1.4], ['Queso Cottage', 98, 11, 3.4, 4.3], ['Queso Brie', 334, 21, 0.5, 28],
  ['Queso Crema', 342, 5.9, 4.1, 34], ['Leche Sin Lactosa', 42, 3.4, 5, 1.5]
];

const rawAceites: [string, number, number, number, number][] = [
  ['Aceite de Oliva', 884, 0, 0, 100], ['Aceite de Girasol', 884, 0, 0, 100], ['Aceite de Coco', 862, 0, 0, 100],
  ['Aceite de Canola', 884, 0, 0, 100], ['Mantequilla de Maní', 588, 25, 20, 50], ['Almendras', 579, 21, 22, 50],
  ['Nueces', 654, 15, 14, 65], ['Semillas de Chía', 486, 17, 42, 31], ['Semillas de Lino', 534, 18, 29, 42],
  ['Semillas de Girasol', 584, 21, 20, 51], ['Aceite de Aguacate', 884, 0, 0, 100], ['Aceite de Ajonjolí', 884, 0, 0, 100],
  ['Margarina', 717, 0, 1, 80], ['Aceitunas Negras', 115, 0.8, 6.3, 10.7], ['Aceitunas Verdes', 145, 1, 3.8, 15.3],
  ['Pistachos', 562, 20, 28, 45], ['Cacahuates', 567, 26, 16, 49], ['Avellanas', 628, 15, 17, 61],
  ['Anacardos (Castañas)', 553, 18, 30, 44], ['Semillas de Calabaza', 559, 30, 10, 49]
];

const rawCondimentos: [string, number, number, number, number][] = [
  ['Sal', 0, 0, 0, 0], ['Pimienta Negra', 251, 10, 64, 3.3], ['Orégano', 265, 9, 68, 4.3],
  ['Albahaca', 23, 3.1, 2.6, 0.6], ['Comino', 375, 18, 44, 22], ['Pimentón', 282, 14, 54, 13],
  ['Canela', 247, 4, 80, 1.2], ['Curry', 325, 14, 56, 14], ['Cúrcuma', 312, 10, 67, 10],
  ['Jengibre Fresco', 80, 1.8, 18, 0.8], ['Mostaza', 60, 4.4, 5.8, 3.3], ['Ketchup', 112, 1, 27, 0.1],
  ['Mayonesa', 680, 1, 0.6, 75], ['Salsa de Soya', 53, 8, 4.9, 0.1], ['Vinagre de Manzana', 21, 0, 0.9, 0],
  ['Cilantro', 23, 2.1, 3.7, 0.5], ['Perejil', 36, 3, 6.3, 0.8], ['Romero', 131, 3.3, 20.7, 5.9],
  ['Ajo en Polvo', 331, 17, 73, 0.7], ['Salsa Picante', 11, 0.9, 1.8, 0.4]
];

const rawEnlatados: [string, number, number, number, number][] = [
  ['Atún en Lata (Agua)', 86, 19, 0, 1], ['Sardinas en Lata', 208, 25, 0, 11], ['Frijoles en Lata', 130, 8, 24, 0.5],
  ['Garbanzos en Lata', 139, 8, 22, 2.5], ['Lentejas en Lata', 105, 8, 18, 0.4], ['Maíz Dulce en Lata', 67, 2, 14, 1],
  ['Guisantes en Lata', 69, 4, 12, 0.5], ['Salsa de Tomate', 32, 1.6, 7, 0.2], ['Champiñones en Lata', 20, 2, 3, 0.2],
  ['Melocotón en Almíbar', 73, 0.4, 19, 0.1], ['Piña en Lata', 50, 0.4, 13, 0.1], ['Leche Evaporada', 134, 7, 10, 7.5],
  ['Leche Condensada', 321, 8, 54, 8], ['Caldo de Pollo', 30, 2, 3, 1], ['Corazones de Alcachofa', 47, 3, 10, 0],
  ['Chícharos y Zanahorias', 60, 3, 11, 0.5]
];

const rawCongelados: [string, number, number, number, number][] = [
  ['Mix de Verduras', 65, 3, 13, 0.3], ['Espinaca Congelada', 29, 3, 4, 0.3], ['Brócoli Congelado', 31, 3, 5, 0.3],
  ['Frutos Rojos Cong.', 45, 1, 11, 0.4], ['Papas Fritas Cong.', 312, 3.4, 41, 15], ['Nuggets de Pollo', 296, 15, 17, 19],
  ['Pizza Congelada', 266, 11, 33, 10], ['Helado de Vainilla', 207, 3.5, 24, 11], ['Hamburguesa Cong.', 250, 26, 0, 15],
  ['Edamame Congelado', 121, 12, 9, 5]
];

const buildFood = (list: [string, number, number, number, number][], cat: PantryCategory): FoodItem[] => {
  return list.map(item => ({
    name: item[0],
    category: cat,
    caloriesPer100g: item[1],
    proteinPer100g: item[2],
    carbsPer100g: item[3],
    fatPer100g: item[4],
  }));
};

export const foods: FoodItem[] = [
  ...buildFood(rawVegetales, 'vegetales'),
  ...buildFood(rawFrutas, 'frutas'),
  ...buildFood(rawProteinas, 'proteinas'),
  ...buildFood(rawGranos, 'granos'),
  ...buildFood(rawLacteos, 'lacteos'),
  ...buildFood(rawAceites, 'aceites'),
  ...buildFood(rawCondimentos, 'condimentos'),
  ...buildFood(rawEnlatados, 'enlatados'),
  ...buildFood(rawCongelados, 'congelados'),
];
