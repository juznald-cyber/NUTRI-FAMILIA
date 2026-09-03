import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3 } from 'lucide-react';
import { usePantryItems, deletePantryItem } from '../hooks/useDatabase';
import { PANTRY_CATEGORIES, type PantryCategory, type PantryItem } from '../db';
import PantryItemForm from '../components/pantry/PantryItemForm';

const ALL_CATEGORIES = Object.keys(PANTRY_CATEGORIES) as PantryCategory[];

const Pantry: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PantryCategory | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | undefined>(undefined);

  const pantryItems = usePantryItems(selectedCategory);

  const filteredItems = pantryItems?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockClass = (quantity: number) => {
    if (quantity <= 0) return 'stock-low';
    if (quantity <= 3) return 'stock-medium';
    return 'stock-high';
  };

  const getStockLabel = (quantity: number) => {
    if (quantity <= 0) return 'Agotado';
    if (quantity <= 3) return 'Bajo';
    return 'OK';
  };

  const handleEdit = (item: PantryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deletePantryItem(id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  // Count items per category
  const allItems = usePantryItems();
  const categoryCounts = new Map<string, number>();
  allItems?.forEach(item => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  });

  return (
    <div className="px-5 pt-2 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="apple-large-title">Despensa</h1>
          <p className="text-sm text-apple-gray-1 mt-0.5">
            {allItems?.length || 0} productos en total
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="w-10 h-10 bg-apple-blue rounded-full flex items-center justify-center shadow-apple active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la despensa..."
          className="apple-input pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar -mx-5 px-5">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === undefined
              ? 'bg-apple-blue text-white shadow-apple'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Todos
        </button>
        {ALL_CATEGORIES.map(cat => {
          const meta = PANTRY_CATEGORIES[cat];
          const count = categoryCounts.get(cat) || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-apple-blue text-white shadow-apple'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {meta.emoji} {meta.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="space-y-2 mt-2">
        {filteredItems && filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const catMeta = PANTRY_CATEGORIES[item.category];
            return (
              <div
                key={item.id}
                className="apple-card p-4 flex items-center gap-3 animate-fade-in"
              >
                <span className="text-2xl">{catMeta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-apple-gray-1">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <span className={`apple-badge ${getStockClass(item.quantity)}`}>
                  {getStockLabel(item.quantity)}
                </span>
                <button
                  onClick={() => handleEdit(item)}
                  className="w-8 h-8 flex items-center justify-center text-apple-gray-2 hover:text-apple-blue transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => item.id && handleDelete(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-apple-gray-2 hover:text-apple-red transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <span className="text-5xl mb-4">🛒</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Despensa vacía</h3>
            <p className="text-sm text-apple-gray-1 mb-4">
              Agrega los productos que compraste para el mes
            </p>
            <button
              onClick={handleAdd}
              className="apple-btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </button>
          </div>
        )}
      </div>

      {/* Form Sheet */}
      <PantryItemForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editItem={editingItem}
      />
    </div>
  );
};

export default Pantry;
