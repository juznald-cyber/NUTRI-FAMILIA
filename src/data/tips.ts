export interface Tip {
  id: number;
  title: string;
  description: string;
  emoji: string;
  category: string;
}

export const nutritionTips: Tip[] = [
  { id: 1, title: "Come más fibra", description: "La fibra te mantiene lleno y ayuda a la digestión. Encuéntrala en frutas, verduras y granos enteros.", emoji: "🌾", category: "nutrición" },
  { id: 2, title: "Controla las porciones", description: "Usa platos más pequeños para engañar a tu cerebro y sentirte satisfecho con menos cantidad.", emoji: "🍽️", category: "nutrición" },
  { id: 3, title: "Desayuna proteínas", description: "Un desayuno alto en proteínas reduce los antojos durante el resto del día.", emoji: "🥚", category: "nutrición" },
  { id: 4, title: "Cuidado con el azúcar", description: "Revisa las etiquetas, el azúcar añadido se esconde en muchos productos procesados.", emoji: "🚫", category: "nutrición" },
  { id: 5, title: "Grasas saludables", description: "Incluye aguacate, aceite de oliva y nueces en tu dieta para mejorar la salud de tu corazón.", emoji: "🥑", category: "nutrición" },
  { id: 6, title: "Mastica despacio", description: "Tu cerebro necesita alrededor de 20 minutos para darse cuenta de que estás lleno.", emoji: "⏳", category: "nutrición" },
  { id: 7, title: "Verduras en cada comida", description: "Intenta llenar siempre la mitad de tu plato con vegetales de distintos colores.", emoji: "🥗", category: "nutrición" },
  { id: 8, title: "Carbohidratos complejos", description: "Prefiere avena, quinua o arroz integral sobre las harinas blancas refinadas.", emoji: "🍞", category: "nutrición" },
  { id: 9, title: "Planifica tus comidas", description: "Prepara tu menú semanal (meal prep) para evitar malas decisiones de último minuto.", emoji: "📅", category: "nutrición" },
  { id: 10, title: "Snacks inteligentes", description: "Ten a mano frutas o almendras en lugar de galletas o papas fritas.", emoji: "🍎", category: "nutrición" },
  { id: 11, title: "Evita las frituras", description: "Hornea, hierve o asa tus alimentos en la freidora de aire en lugar de freírlos en aceite.", emoji: "🔥", category: "nutrición" },
  { id: 12, title: "Lee las etiquetas", description: "Conoce lo que realmente estás comiendo ignorando la parte frontal y leyendo los ingredientes.", emoji: "🏷️", category: "nutrición" },
  { id: 13, title: "Cena ligero", description: "Una cena pesada y muy tarde puede afectar negativamente tu sueño y tu digestión.", emoji: "🌙", category: "nutrición" },
  { id: 14, title: "Colores en tu plato", description: "Más colores significan más vitaminas, minerales y antioxidantes.", emoji: "🌈", category: "nutrición" },
  { id: 15, title: "Modera la sal", description: "Usa hierbas y especias para dar sabor en lugar de abusar del sodio.", emoji: "🧂", category: "nutrición" }
];

export const wellnessTips: Tip[] = [
  { id: 16, title: "Duerme de 7 a 8 horas", description: "El descanso de calidad es crucial para la recuperación muscular y mental.", emoji: "😴", category: "bienestar" },
  { id: 17, title: "Medita o respira", description: "5 minutos de respiración profunda al día reducen drásticamente los niveles de estrés.", emoji: "🧘", category: "bienestar" },
  { id: 18, title: "Desconéctate de las pantallas", description: "Evita usar tu celular o ver TV al menos 1 hora antes de irte a dormir.", emoji: "📱", category: "bienestar" },
  { id: 19, title: "Toma el sol", description: "15 minutos de sol al día son esenciales para sintetizar la vitamina D.", emoji: "☀️", category: "bienestar" },
  { id: 20, title: "Estírate seguido", description: "Si trabajas sentado, levántate de tu silla cada hora y muévete unos minutos.", emoji: "🤸", category: "bienestar" },
  { id: 21, title: "Ríe más", description: "La risa reduce el cortisol y mejora tu estado de ánimo general.", emoji: "😂", category: "bienestar" },
  { id: 22, title: "Tiempo en la naturaleza", description: "Pasear por un parque o bosque mejora la salud mental y oxigena el cerebro.", emoji: "🌳", category: "bienestar" },
  { id: 23, title: "Practica la gratitud", description: "Escribe 3 cosas por las que estás agradecido cada mañana o noche.", emoji: "🙏", category: "bienestar" },
  { id: 24, title: "Socializa en persona", description: "Mantén conexiones fuertes con amigos y familiares, es clave para la longevidad.", emoji: "👥", category: "bienestar" },
  { id: 25, title: "Busca un pasatiempo", description: "Haz algo que disfrutes solo por diversión y no por obligación o productividad.", emoji: "🎨", category: "bienestar" }
];

export const hydrationTips: Tip[] = [
  { id: 26, title: "Toma agua al despertar", description: "Rehidrata tu cuerpo con un buen vaso de agua justo tras salir de la cama.", emoji: "🚰", category: "hidratación" },
  { id: 27, title: "Lleva tu botella", description: "Tener un termo de agua a la vista te recordará beber constantemente.", emoji: "🍼", category: "hidratación" },
  { id: 28, title: "Infusiona tu agua", description: "Añade limón, pepino o menta si te cuesta trabajo tomar agua natural sola.", emoji: "🍋", category: "hidratación" },
  { id: 29, title: "Agua antes de comer", description: "Beber un vaso de agua 30 minutos antes de las comidas ayuda a la digestión y saciedad.", emoji: "💧", category: "hidratación" },
  { id: 30, title: "Cuidado con el café y alcohol", description: "Son bebidas diuréticas; compénsalas tomando agua adicional.", emoji: "☕", category: "hidratación" },
  { id: 31, title: "Come tus líquidos", description: "Alimentos como la sandía, pepino y fresas están compuestos en su mayoría por agua.", emoji: "🍉", category: "hidratación" },
  { id: 32, title: "Sustituye refrescos", description: "Cambia las sodas azucaradas por agua con gas natural.", emoji: "🥤", category: "hidratación" },
  { id: 33, title: "Monitorea el color", description: "Tu orina debe ser de color amarillo muy claro o casi transparente.", emoji: "👀", category: "hidratación" }
];
