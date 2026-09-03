import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Check, Sparkles, Plus, Minus, Search, RotateCcw } from 'lucide-react';
import { PANTRY_CATEGORIES, UNITS, type PantryCategory } from '../../db';
import { addPantryItem } from '../../hooks/useDatabase';
import { recognizeFoodFromImage, type RecognizedFood } from '../../utils/foodRecognition';
import { foods, type FoodItem } from '../../data/foods';

interface ScanFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

export default function ScanFoodModal({ isOpen, onClose, onItemAdded }: ScanFoodModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<RecognizedFood | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process photo selected from native camera or gallery
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);

      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        const recognized = await recognizeFoodFromImage(img);
        setTimeout(() => {
          setResult(recognized);
          setAnalyzing(false);
        }, 600);
      };
    };
    reader.readAsDataURL(file);

    // Reset input so user can choose the same file again if needed
    e.target.value = '';
  };

  // Switch to a candidate suggestion
  const handleSelectCandidate = (candidate: FoodItem) => {
    if (!result) return;
    setResult({
      ...result,
      name: candidate.name,
      category: candidate.category,
      caloriesPer100g: candidate.caloriesPer100g,
      proteinPer100g: candidate.proteinPer100g,
      carbsPer100g: candidate.carbsPer100g,
      fatPer100g: candidate.fatPer100g
    });
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  // Search filtered foods
  const searchResults = searchQuery.trim().length > 1
    ? foods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())).slice(0, 5)
    : [];

  // Save detected item to Pantry database
  const handleSaveToPantry = async () => {
    if (!result) return;

    await addPantryItem({
      name: result.name,
      category: result.category,
      quantity: result.quantity,
      unit: result.unit,
      purchaseDate: new Date().toISOString().split('T')[0],
      caloriesPer100g: result.caloriesPer100g,
      proteinPer100g: result.proteinPer100g,
      carbsPer100g: result.carbsPer100g,
      fatPer100g: result.fatPer100g
    });

    setSavedSuccess(true);
    if (onItemAdded) onItemAdded();

    setTimeout(() => {
      setCapturedImage(null);
      setResult(null);
      setSavedSuccess(false);
      setSearchQuery('');
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
    setAnalyzing(false);
    setSearchQuery('');
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content max-w-lg mx-auto">
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-apple-green/15 text-apple-green flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Escanear Alimento con Foto
              </h2>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                Toma o sube una foto para identificar el alimento
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

        <div className="px-5 pb-8 space-y-4">
          
          {/* Hidden File Inputs for Native Camera & Gallery */}
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
                  <h3 className="font-bold text-base">Tomar Foto con la Cámara</h3>
                  <p className="text-xs text-white/85 mt-0.5">Abre la cámara de tu teléfono o laptop para capturar el producto</p>
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
                  <p className="text-xs text-apple-gray-1 dark:text-gray-400 mt-0.5">Elige una foto guardada en tu dispositivo</p>
                </div>
              </button>
            </div>
          )}

          {/* Image Preview & Scanning Box */}
          {capturedImage && (
            <div className="relative w-full aspect-square bg-black rounded-apple-lg overflow-hidden border border-black/10 dark:border-white/10 shadow-apple-lg flex items-center justify-center">
              <img src={capturedImage} alt="Foto capturada" className="w-full h-full object-cover animate-fade-in" />

              {/* Scanning Laser Beam Overlay */}
              {analyzing && (
                <div className="absolute inset-0 bg-apple-blue/15 backdrop-blur-[2px] flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-apple-blue to-transparent animate-pulse shadow-lg" />
                  <div className="mt-4 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-apple-green animate-spin" />
                    <span>Analizando alimento y macros...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recognition Result Card */}
          {result && (
            <div className="apple-card p-4 space-y-3 animate-scale-in border border-apple-green/30">
              
              {/* Primary Match */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{PANTRY_CATEGORIES[result.category]?.emoji || '🍎'}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{result.name}</h3>
                    <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                      Categoría: <span className="font-semibold text-apple-blue">{PANTRY_CATEGORIES[result.category]?.label || 'General'}</span>
                    </p>
                  </div>
                </div>
                <span className="apple-badge stock-high">✓ Identificado</span>
              </div>

              {/* Alternative Candidates / Quick Pickers */}
              {result.suggestedCandidates && result.suggestedCandidates.length > 1 && (
                <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                  <p className="text-[11px] font-semibold text-apple-gray-1 dark:text-gray-400 uppercase mb-1.5">
                    ¿Es alguno de estos productos?
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedCandidates.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectCandidate(c)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          result.name === c.name
                            ? 'bg-apple-blue text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                        }`}
                      >
                        {PANTRY_CATEGORIES[c.category]?.emoji} {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Instant Search Bar if they want to adjust the food */}
              <div className="relative pt-1">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-apple-gray-2 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    placeholder="O escribe el nombre si deseas cambiarlo..."
                    className="apple-input pl-8 py-1.5 text-xs w-full"
                  />
                </div>

                {showSearchSuggestions && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-apple-sm shadow-apple-lg z-30 divide-y divide-gray-100 dark:divide-white/5">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCandidate(item)}
                        className="w-full p-2.5 text-left text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-apple-blue/10 flex items-center justify-between"
                      >
                        <span>{PANTRY_CATEGORIES[item.category]?.emoji} {item.name}</span>
                        <span className="text-[10px] text-apple-gray-1">{PANTRY_CATEGORIES[item.category]?.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity and Unit Adjustment */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
                <div>
                  <label className="text-[11px] font-semibold text-apple-gray-1 dark:text-gray-400 uppercase">Cantidad</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setResult(prev => prev ? { ...prev, quantity: Math.max(0.5, prev.quantity - 0.5) } : null)}
                      className="w-7 h-7 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm text-gray-900 dark:text-white w-8 text-center">{result.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setResult(prev => prev ? { ...prev, quantity: prev.quantity + 0.5 } : null)}
                      className="w-7 h-7 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-apple-gray-1 dark:text-gray-400 uppercase">Unidad</label>
                  <select
                    value={result.unit}
                    onChange={(e) => setResult(prev => prev ? { ...prev, unit: e.target.value } : null)}
                    className="apple-input mt-1 py-1.5 text-xs"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save or Retake Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-apple-sm text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Otra foto</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToPantry}
                  disabled={savedSuccess}
                  className="flex-[2] py-3 px-4 bg-apple-green text-white hover:bg-green-600 rounded-apple-sm text-xs font-semibold flex items-center justify-center gap-1.5 shadow-apple active:scale-95 transition-all"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Agregado a la Despensa!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Registrar en Despensa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
