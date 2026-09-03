import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Check, Sparkles, Plus, Minus } from 'lucide-react';
import { PANTRY_CATEGORIES, UNITS, type PantryCategory } from '../../db';
import { addPantryItem } from '../../hooks/useDatabase';
import { recognizeFoodFromImage, type RecognizedFood } from '../../utils/foodRecognition';

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 720 } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable, falling back to file upload', err);
      setIsCameraActive(false);
    }
  };

  // Stop Camera
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
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  // Capture frame from video
  const handleCapture = async () => {
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

      // Analyze image
      const recognized = await recognizeFoodFromImage(video);
      setTimeout(() => {
        setResult(recognized);
        setAnalyzing(false);
      }, 600);
    } else {
      setAnalyzing(false);
    }
  };

  // Handle file upload from gallery
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        }, 600);
      };
    };
    reader.readAsDataURL(file);
  };

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
      // Reset for next scan
      setCapturedImage(null);
      setResult(null);
      setSavedSuccess(false);
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
                Apunta la cámara al producto para registrarlo
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
          
          {/* Camera Viewfinder / Preview */}
          <div className="relative w-full aspect-square bg-black rounded-apple-lg overflow-hidden border border-black/10 dark:border-white/10 shadow-apple-lg flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Foto capturada" className="w-full h-full object-cover" />
            ) : isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6">
                <Camera className="w-12 h-12 text-apple-gray-2 mx-auto mb-2" />
                <p className="text-xs text-apple-gray-2">Cámara no disponible o permiso no concedido</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-2 bg-white/20 text-white rounded-full text-xs font-semibold hover:bg-white/30 transition-colors"
                >
                  Subir foto de la galería
                </button>
              </div>
            )}

            {/* Scanning Laser Line Overlay */}
            {analyzing && (
              <div className="absolute inset-0 bg-apple-blue/10 backdrop-blur-[1px] flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-apple-blue to-transparent animate-pulse shadow-lg" />
                <div className="mt-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-apple-blue animate-spin" />
                  <span>Reconociendo alimento...</span>
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

            {/* Camera Controls Overlay (when active) */}
            {!capturedImage && isCameraActive && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="w-9 h-9 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  title="Cambiar cámara"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Capture / Upload */}
          {!result && !analyzing && (
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                title="Seleccionar de la galería"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={!isCameraActive}
                className="w-16 h-16 rounded-full bg-apple-blue text-white flex items-center justify-center shadow-apple-lg active:scale-95 transition-transform disabled:opacity-40"
                title="Tomar Foto"
              >
                <div className="w-13 h-13 rounded-full border-2 border-white flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <div className="w-12 h-12" />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Recognition Result Card */}
          {result && (
            <div className="apple-card p-4 space-y-3 animate-scale-in border border-apple-green/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{PANTRY_CATEGORIES[result.category].emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{result.name}</h3>
                    <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                      Categoría: <span className="font-medium text-apple-blue">{PANTRY_CATEGORIES[result.category].label}</span> · {result.confidence}% coincidencia
                    </p>
                  </div>
                </div>
                <span className="apple-badge stock-high">✓ Reconocido</span>
              </div>

              {/* Quantity and Unit Adjustment */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100 dark:border-white/5">
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

              {/* Save or Retake Action */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    setResult(null);
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
