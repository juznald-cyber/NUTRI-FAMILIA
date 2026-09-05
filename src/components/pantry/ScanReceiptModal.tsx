import React, { useState, useRef } from 'react';
import { 
  ReceiptText, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  RotateCcw, 
  AlertCircle, 
  Key, 
  CheckSquare, 
  Square, 
  PackagePlus,
  Info
} from 'lucide-react';
import { PANTRY_CATEGORIES, UNITS, type PantryCategory } from '../../db';
import { bulkAddPantryItems } from '../../hooks/useDatabase';
import { 
  scanReceiptAndExtractProducts, 
  hasGeminiApiKey, 
  type ScannedReceiptProduct 
} from '../../services/geminiService';
import GeminiConfigModal from '../ai/GeminiConfigModal';

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsAdded?: () => void;
}

interface EditableReceiptItem extends ScannedReceiptProduct {
  id: string;
  selected: boolean;
}

export default function ScanReceiptModal({ isOpen, onClose, onItemsAdded }: ScanReceiptModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [items, setItems] = useState<EditableReceiptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Manual extra item state
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [newManualName, setNewManualName] = useState('');
  const [newManualCategory, setNewManualCategory] = useState<PantryCategory>('vegetales');
  const [newManualQty, setNewManualQty] = useState(1);
  const [newManualUnit, setNewManualUnit] = useState('unidades');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process photo selected from camera or gallery
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setAnalyzing(true);
    setItems([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);

      if (!hasGeminiApiKey()) {
        setAnalyzing(false);
        setError('Necesitas configurar tu clave de API de Gemini para que la IA pueda leer la boleta.');
        return;
      }

      try {
        const extracted = await scanReceiptAndExtractProducts(dataUrl);

        if (!extracted || extracted.length === 0) {
          setError('No se encontraron alimentos en la boleta. Intenta con una foto más clara o agrega productos manualmente.');
        } else {
          const mapped: EditableReceiptItem[] = extracted.map((item, idx) => ({
            ...item,
            id: `receipt_item_${Date.now()}_${idx}`,
            selected: true,
            quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
            unit: item.unit || 'unidades'
          }));
          setItems(mapped);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al procesar la imagen de la boleta. Verifica tu conexión y tu API Key de Gemini.');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const handleSelectAll = (select: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, selected: select })));
  };

  // Update item field
  const handleUpdateItem = (id: string, updates: Partial<EditableReceiptItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Add manual product to the scanned list
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualName.trim()) return;

    const newItem: EditableReceiptItem = {
      id: `manual_item_${Date.now()}`,
      name: newManualName.trim(),
      category: newManualCategory,
      quantity: Number(newManualQty) > 0 ? Number(newManualQty) : 1,
      unit: newManualUnit,
      selected: true
    };

    setItems(prev => [newItem, ...prev]);
    setNewManualName('');
    setNewManualQty(1);
    setShowManualAdd(false);
  };

  // Save selected items to pantry
  const handleSaveToPantry = async () => {
    const selectedItems = items.filter(item => item.selected && item.name.trim().length > 0);
    if (selectedItems.length === 0) return;

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const pantryRecords = selectedItems.map(item => ({
        name: item.name.trim(),
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        purchaseDate: today,
        caloriesPer100g: item.caloriesPer100g,
        proteinPer100g: item.proteinPer100g,
        carbsPer100g: item.carbsPer100g,
        fatPer100g: item.fatPer100g
      }));

      await bulkAddPantryItems(pantryRecords);

      setSavedSuccess(true);
      if (onItemsAdded) onItemsAdded();

      setTimeout(() => {
        handleReset();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al guardar los productos en la despensa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setItems([]);
    setAnalyzing(false);
    setError(null);
    setSavedSuccess(false);
    setShowManualAdd(false);
  };

  const selectedCount = items.filter(i => i.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content max-w-xl mx-auto max-h-[92vh] flex flex-col">
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-apple-green/15 text-apple-green flex items-center justify-center">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Escanear Boleta o Factura
              </h2>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                Extrae todos los productos de tu ticket de compra con IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Hidden Inputs for Camera and Gallery */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {/* Gemini API Key Warning / Setup Banner */}
          {!hasGeminiApiKey() && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-apple-sm flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Configura tu <strong>API Key de Gemini</strong> para habilitar el escáner con IA.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors flex-shrink-0 text-xs shadow-sm"
              >
                Configurar Clave
              </button>
            </div>
          )}

          {/* Initial State: Choose Camera or Gallery */}
          {!capturedImage && !analyzing && (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full p-5 bg-gradient-to-r from-apple-green to-apple-teal text-white rounded-apple-lg flex items-center gap-4 shadow-apple hover:opacity-95 active:scale-98 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-base">Tomar Foto a la Boleta</h3>
                  <p className="text-xs text-white/85 mt-0.5">Abre la cámara para enfocar la factura o ticket de compras</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/15 rounded-apple-lg flex items-center gap-4 transition-all active:scale-98 border border-black/5 dark:border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Seleccionar de la Galería</h3>
                  <p className="text-xs text-apple-gray-1 dark:text-gray-400 mt-0.5">Elige una foto de factura guardada en tu dispositivo</p>
                </div>
              </button>

              <div className="p-3 bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 rounded-apple-sm text-xs text-apple-gray-1 dark:text-gray-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-apple-blue flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Consejo:</strong> Para una mejor lectura, asegúrate de que el ticket esté estirado, bien iluminado y que los nombres de los productos sean legibles.
                </p>
              </div>
            </div>
          )}

          {/* Analyzing / Scanning laser animation */}
          {analyzing && capturedImage && (
            <div className="space-y-4">
              <div className="relative w-full h-56 bg-black rounded-apple-lg overflow-hidden border border-black/10 dark:border-white/10 shadow-apple-lg flex items-center justify-center">
                <img src={capturedImage} alt="Boleta" className="w-full h-full object-contain opacity-60" />
                
                {/* Laser line animation */}
                <div className="absolute inset-0 bg-apple-blue/15 flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-apple-green to-transparent animate-pulse shadow-lg" />
                  <div className="mt-4 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-2 border border-white/20">
                    <Sparkles className="w-4 h-4 text-apple-green animate-spin" />
                    <span>Leyendo boleta y detectando productos con IA...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30 rounded-apple-sm text-apple-red text-xs font-medium flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold underline flex-shrink-0"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Extracted Items Result View */}
          {items.length > 0 && !analyzing && (
            <div className="space-y-3 animate-fade-in">
              
              {/* Toolbar & Controls */}
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-apple-sm border border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(!allSelected)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-apple-blue transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-apple-blue" />
                    ) : (
                      <Square className="w-4 h-4 text-apple-gray-2" />
                    )}
                    <span>{allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}</span>
                  </button>
                  <span className="text-xs text-apple-gray-1 dark:text-gray-400">
                    ({selectedCount} de {items.length} marcados)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowManualAdd(!showManualAdd)}
                    className="px-2.5 py-1 bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue dark:bg-apple-blue/20 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <PackagePlus className="w-3.5 h-3.5" />
                    <span>Añadir ítem</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2.5 py-1 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Otra foto</span>
                  </button>
                </div>
              </div>

              {/* Manual Add Form Row */}
              {showManualAdd && (
                <form onSubmit={handleAddManualItem} className="p-3 bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/20 rounded-apple-sm space-y-2 animate-fade-in">
                  <div className="font-semibold text-xs text-apple-blue">Agregar producto extra manualmente:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del producto (ej. Tomates)"
                      value={newManualName}
                      onChange={e => setNewManualName(e.target.value)}
                      required
                      className="apple-input py-1.5 text-xs"
                    />
                    <select
                      value={newManualCategory}
                      onChange={e => setNewManualCategory(e.target.value as PantryCategory)}
                      className="apple-input py-1.5 text-xs"
                    >
                      {Object.entries(PANTRY_CATEGORIES).map(([catKey, cat]) => (
                        <option key={catKey} value={catKey}>{cat.emoji} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="Cant."
                      value={newManualQty}
                      onChange={e => setNewManualQty(Number(e.target.value))}
                      className="apple-input py-1.5 text-xs w-20"
                    />
                    <select
                      value={newManualUnit}
                      onChange={e => setNewManualUnit(e.target.value)}
                      className="apple-input py-1.5 text-xs flex-1"
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-apple-blue text-white rounded-apple-sm text-xs font-semibold shadow-sm hover:opacity-90"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualAdd(false)}
                      className="px-2 py-1.5 text-xs text-apple-gray-1 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-apple-sm border transition-all ${
                      item.selected
                        ? 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 shadow-sm'
                        : 'bg-gray-50/70 dark:bg-white/5 border-gray-100 dark:border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.id)}
                        className="mt-1 flex-shrink-0 text-apple-blue"
                      >
                        {item.selected ? (
                          <CheckSquare className="w-4 h-4 text-apple-blue" />
                        ) : (
                          <Square className="w-4 h-4 text-apple-gray-2" />
                        )}
                      </button>

                      {/* Main Product Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateItem(item.id, { name: e.target.value })}
                          className="w-full text-xs font-bold text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-white/20 focus:border-apple-blue focus:outline-none py-0.5"
                          placeholder="Nombre del producto"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Selector */}
                          <select
                            value={item.category}
                            onChange={e => handleUpdateItem(item.id, { category: e.target.value as PantryCategory })}
                            className="text-[11px] font-medium bg-gray-100 dark:bg-white/10 border-0 rounded-full px-2 py-0.5 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-apple-blue"
                          >
                            {Object.entries(PANTRY_CATEGORIES).map(([catKey, cat]) => (
                              <option key={catKey} value={catKey}>{cat.emoji} {cat.label}</option>
                            ))}
                          </select>

                          {/* Quantity +/- */}
                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-full px-2 py-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: Math.max(0.5, item.quantity - 0.5) })}
                              className="text-apple-gray-1 hover:text-apple-blue p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[11px] font-bold text-gray-900 dark:text-white px-1">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 0.5 })}
                              className="text-apple-gray-1 hover:text-apple-blue p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Unit Selector */}
                          <select
                            value={item.unit}
                            onChange={e => handleUpdateItem(item.id, { unit: e.target.value })}
                            className="text-[11px] bg-gray-100 dark:bg-white/10 border-0 rounded-full px-2 py-0.5 text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-apple-blue"
                          >
                            {UNITS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Delete Item */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-apple-gray-2 hover:text-apple-red transition-colors"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button: Save all selected to Pantry */}
              <button
                type="button"
                disabled={isSaving || savedSuccess || selectedCount === 0}
                onClick={handleSaveToPantry}
                className="w-full py-3.5 px-4 bg-apple-green text-white hover:bg-green-600 rounded-apple-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-apple active:scale-95 transition-all disabled:opacity-50 mt-2"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡{selectedCount} productos guardados en la Despensa!</span>
                  </>
                ) : (
                  <>
                    <ReceiptText className="w-4 h-4" />
                    <span>
                      {isSaving 
                        ? 'Guardando productos...' 
                        : `Guardar ${selectedCount} ${selectedCount === 1 ? 'producto' : 'productos'} en la Despensa`
                      }
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Gemini API Key Configuration Sheet */}
      <GeminiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
}
