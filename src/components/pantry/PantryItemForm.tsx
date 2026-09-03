import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PANTRY_CATEGORIES, UNITS, type PantryCategory, type PantryItem } from '../../db';
import { addPantryItem, updatePantryItem } from '../../hooks/useDatabase';

interface PantryItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: PantryItem;
}

const categoryKeys = Object.keys(PANTRY_CATEGORIES) as PantryCategory[];

export default function PantryItemForm({ isOpen, onClose, editItem }: PantryItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PantryCategory>('vegetales');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(UNITS[0]);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      setQuantity(editItem.quantity);
      setUnit(editItem.unit);
      setPurchaseDate(editItem.purchaseDate);
    } else {
      setName('');
      setCategory('vegetales');
      setQuantity(1);
      setUnit(UNITS[0]);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
    }
  }, [editItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const itemData = {
      name: name.trim(),
      category,
      quantity,
      unit,
      purchaseDate,
    };

    if (editItem && editItem.id) {
      await updatePantryItem(editItem.id, itemData);
    } else {
      await addPantryItem(itemData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content">
        <div className="sheet-handle" />

        <div className="px-5 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {editItem ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
          <div>
            <label className="apple-section-title">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="apple-input"
              placeholder="Ej. Manzanas"
            />
          </div>

          <div>
            <label className="apple-section-title">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PantryCategory)}
              className="apple-input"
            >
              {categoryKeys.map(key => (
                <option key={key} value={key}>
                  {PANTRY_CATEGORIES[key].emoji} {PANTRY_CATEGORIES[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="apple-section-title">Cantidad</label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="apple-input"
              />
            </div>
            <div>
              <label className="apple-section-title">Unidad</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="apple-input"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="apple-section-title">Fecha de Compra</label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="apple-input"
            />
          </div>

          <button type="submit" className="apple-btn-primary w-full mt-4">
            {editItem ? 'Guardar Cambios' : 'Agregar Producto'}
          </button>
        </form>
      </div>
    </>
  );
}
