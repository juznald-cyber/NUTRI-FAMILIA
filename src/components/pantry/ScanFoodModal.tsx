import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Check, Sparkles, Plus, Minus, Search, RefreshCw } from 'lucide-react';
import { PANTRY_CATEGORIES, UNITS, type PantryCategory } from '../../db';
import { addPantryItem } from '../../hooks/useDatabase';
import { recognizeFoodFromImage, findFoodByName, type RecognizedFood } from '../../utils/foodRecognition';
import { foods, type FoodItem } from '../../data/foods';

interface ScanFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

export default function ScanFoodModal({ isOpen, onClose, onItemAdded }: ScanFoodModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<RecognizedFood | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize live video stream
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = newStream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', 'true');
        video.onloadedmetadata = () => {
          video.play().catch(e => console.log('Video play error', e));
        };
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Live camera stream not supported or permission denied. Native capture available.', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setResult(null);
      setSavedSuccess(false);
      setSearchQuery('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  // Capture frame from video stream
  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    setAnalyzing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);

      const recognized = await recognizeFoodFromImage(video);
      setTimeout(() => {
        setResult(recognized);
        setAnalyzing(false);
      }, 500);
    } else {
      setAnalyzing(false);
    }
  };

  // Process photo selected from camera or gallery
  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
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
        }, 500);
      };
    };
    reader.readAsDataURL(file);
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
      if (!isCameraActive) startCamera();
    }, 1200);
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  if (!isOpen) return null;

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
          
          {/* Camera Viewfinder / Preview Frame */}
          <div className="relative w-full aspect-square bg-black rounded-apple-lg overflow-hidden border border-black/10 dark:border-white/10 shadow-apple-lg flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Foto capturada" className="w-full h-full object-cover animate-fade-in" />
            ) : isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-apple-green">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Cámara lista</p>
                  <p className="text-xs text-gray-400 mt-0.5">Toca el botón abajo para abrir la cámara de tu dispositivo</p>
                </div>
              </div>
            )}

            {/* Scanning Laser Line Overlay */}
            {analyzing && (
              <div className="absolute inset-0 bg-apple-blue/15 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-apple-blue to-transparent animate-pulse shadow-lg" />
                <div className="mt-4 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-apple-green animate-spin" />
                  <span>Analizando alimento y macros...</span>
                </div>
              </div>
            )}

            {/* Camera Viewfinder Frame Marks */}
            {!capturedImage && isCameraActive && (
              <div className="absolute inset-6 border-2 border-white/40 rounded-apple pointer-events-none">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
              </div>
            )}

            {/* Camera Switch button (when active) */}
            {!capturedImage && isCameraActive && (
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="w-9 h-9 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  title="Girar cámara"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Hidden File Inputs for Native Camera & Gallery */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoFile}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoFile}
          />

          {/* Action Buttons: Shutter / Native Camera / Gallery */}
          {!result && !analyzing && (
            <div className="flex items-center justify-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-apple-sm text-xs font-semibold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95"
              >
                <ImageIcon className="w-4 h-4 text-apple-blue" />
                <span>Galería</span>
              </button>

              {/* Shutter Button (Live or Native) */}
              <button
                type="button"
                onClick={() => {
                  if (isCameraActive) {
                    handleCaptureFrame();
                  } else {
                    cameraInputRef.current?.click();
                  }
                }}
                className="px-5 py-3 bg-apple-green text-white rounded-apple-sm text-xs font-semibold flex items-center gap-2 shadow-apple hover:bg-green-600 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>{isCameraActive ? 'Capturar Foto' : 'Abrir Cámara'}</span>
              </button>
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
                    placeholder="O busca otro alimento en el catálogo..."
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
                  onClick={() => {
                    setCapturedImage(null);
                    setResult(null);
                    setSearchQuery('');
                  }}
                  className="flex-1 py-3 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-apple-sm text-xs font-semibold transition-colors"
                >
                  Tomar otra
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
