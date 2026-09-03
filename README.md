# 🍏 NutriFamilia

App de salud y alimentación familiar con diseño Apple-style. Organiza tu despensa, planifica menús automáticamente, y mejora la nutrición de tu familia.

## ✨ Características

- 🛒 **Gestión de Despensa** — Registra todos tus alimentos por categoría
- 📋 **Plan Semanal Automático** — Genera menús basados en tu despensa
- ✏️ **Edición Manual** — Modifica cualquier comida del plan
- 💡 **Recomendaciones** — Sugiere qué comprar para mejor balance nutricional
- 🏃 **Tips de Ejercicio** — Rutinas por nivel con pasos detallados
- 👨‍👩‍👧‍👦 **Perfiles Familiares** — Restricciones alimenticias por persona
- 💧 **Tracker de Agua** — Registra tu hidratación diaria
- 📱 **Diseño Apple** — Glassmorphism, animaciones suaves, responsive

## 🚀 Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build
```

## 🛠 Stack Tecnológico

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** con design tokens Apple HIG
- **Dexie.js** (IndexedDB) — datos se guardan localmente
- **Lucide React** — iconos estilo SF Symbols
- **date-fns** — manejo de fechas

## 📁 Estructura

```
src/
├── pages/          # 5 páginas principales
├── components/     # 17 componentes React
├── data/           # Recetas, alimentos, tips, ejercicios
├── utils/          # Motor de planificación y recomendaciones
├── hooks/          # Hooks reactivos de base de datos
└── db/             # Schema IndexedDB
```

## 📄 Licencia

MIT
