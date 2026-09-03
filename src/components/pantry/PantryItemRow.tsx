import React from 'react';
import { PantryItem, PANTRY_CATEGORIES } from '../../db';
import { deletePantryItem } from '../../hooks/useDatabase';
import { Trash2 } from 'lucide-react';

interface PantryItemRowProps {
  item: PantryItem;
  onEdit?: (item: PantryItem) => void;
}

const categoryEmojis: Record<string, string> = {
  'Frutas y Verduras': '🍎',
  'Proteínas': '🥩',
  'Lácteos': '🥛',
  'Granos': '🍚',
  'Snacks': '🍪',
  'Bebidas': '🥤',
  'Otros': '🛒'
};

export default function PantryItemRow({ item, onEdit }: PantryItemRowProps) {

  const getStockColor = () => {
    if (item.quantity > 3) return 'bg-apple-green/20 text-apple-green';
    if (item.quantity >= 1) return 'bg-apple-orange/20 text-apple-orange';
    return 'bg-apple-red/20 text-apple-red';
  };

  const getStockText = () => {
    if (item.quantity > 3) return 'Buen estado';
    if (item.quantity >= 1) return 'Poco';
    return 'Agotado';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.id) deletePantryItem(item.id);
  };

  return (
    <div 
      className="apple-card flex items-center justify-between p-4 cursor-pointer hover:bg-apple-gray-1 transition-colors"
      onClick={() => onEdit && onEdit(item)}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{categoryEmojis[item.category] || '🛒'}</span>
        <div>
          <h4 className="font-semibold text-apple-gray-6">{item.name}</h4>
          <p className="text-sm text-apple-gray-4">{item.quantity} {item.unit}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-apple-sm ${getStockColor()}`}>
          {getStockText()}
        </span>
        <button 
          onClick={handleDelete}
          className="p-2 text-apple-gray-3 hover:text-apple-red hover:bg-apple-red/10 rounded-full transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
