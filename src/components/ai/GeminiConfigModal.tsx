import React, { useState, useEffect } from 'react';
import { Sparkles, Key, ExternalLink, X, Check, ShieldCheck } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, hasGeminiApiKey } from '../../services/geminiService';

interface GeminiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function GeminiConfigModal({ isOpen, onClose, onSaved }: GeminiConfigModalProps) {
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKey.trim());
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content max-w-md mx-auto">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-apple-blue to-apple-teal text-white flex items-center justify-center shadow-apple">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Inteligencia Artificial Gemini
              </h2>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                Potencia tu app con Google Gemini AI
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

        <form onSubmit={handleSave} className="px-5 pb-8 space-y-4">
          
          {/* Info Banner */}
          <div className="p-3.5 bg-apple-blue/10 dark:bg-apple-blue/20 rounded-apple-sm border border-apple-blue/20 text-xs text-gray-800 dark:text-gray-200 space-y-2">
            <p className="font-semibold text-apple-blue flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              ¿Cómo obtener tu clave gratuita de Google?
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
              <li>Entra a <strong>Google AI Studio</strong>.</li>
              <li>Haz clic en <strong>"Get API Key"</strong> (Crear clave de API).</li>
              <li>Pega la clave aquí abajo y listo.</li>
            </ol>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-apple-blue hover:underline mt-1"
            >
              <span>Abrir Google AI Studio (Gratis)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Key Input */}
          <div>
            <label className="apple-section-title">Tu Clave de API de Gemini (API Key)</label>
            <div className="relative">
              <Key className="w-4 h-4 text-apple-gray-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                required
                className="apple-input pl-10 text-xs sm:text-sm font-mono"
              />
            </div>
            <p className="text-[10px] text-apple-gray-1 dark:text-gray-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-apple-green" />
              Tu clave se almacena de forma segura en tu navegador.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-apple-blue to-apple-teal text-white rounded-apple-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-apple active:scale-95 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Clave Guardada Correctamente!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{hasGeminiApiKey() ? 'Actualizar Clave de IA' : 'Activar Inteligencia Artificial'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
