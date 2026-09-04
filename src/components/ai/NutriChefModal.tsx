import React, { useState, useEffect } from 'react';
import { ChefHat, Send, Sparkles, X, Bot, User, RefreshCw, Key } from 'lucide-react';
import { usePantryItems, useFamilyMembers } from '../../hooks/useDatabase';
import { askNutriChef, hasGeminiApiKey } from '../../services/geminiService';

interface NutriChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConfig: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  '¿Qué puedo cocinar con lo que tengo en mi despensa?',
  'Dame una cena ligera y rápida para hoy',
  '¿Cómo sustituyo el azúcar en mis postres?',
  'Ideas de snacks saludables para los niños',
];

export default function NutriChefModal({ isOpen, onClose, onOpenConfig }: NutriChefModalProps) {
  const pantryItems = usePantryItems() || [];
  const familyMembers = useFamilyMembers() || [];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy **NutriChef AI**, tu asistente nutricional. Puedo sugerirte recetas usando lo que tienes en tu despensa, adaptar platos para tu familia o resolver dudas de alimentación. ¿En qué te ayudo hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyReady, setApiKeyReady] = useState(() => hasGeminiApiKey());

  useEffect(() => {
    setApiKeyReady(hasGeminiApiKey());
    const handleKeyUpdated = () => setApiKeyReady(hasGeminiApiKey());
    window.addEventListener('gemini-key-updated', handleKeyUpdated);
    return () => window.removeEventListener('gemini-key-updated', handleKeyUpdated);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (!hasGeminiApiKey()) {
      onOpenConfig();
      return;
    }

    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askNutriChef({
        question: query,
        pantryItems,
        familyMembers,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      console.error('NutriChef error details:', err);
      let errorMsg = '⚠️ Ocurrió un error al contactar a la IA.';
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('400') || msg.includes('403')) {
        errorMsg = '⚠️ La clave de API de Gemini parece no ser válida o estar mal copiada. Por favor toca el ícono de la llave 🔑 arriba y vuelve a pegarla desde Google AI Studio.';
      } else if (msg.includes('quota') || msg.includes('429') || msg.includes('rate limit')) {
        errorMsg = '⚠️ Límite de consultas gratuitas de Google alcanzado temporalmente. Espera 1 minuto y vuelve a preguntar.';
      } else if (err?.message) {
        errorMsg = `⚠️ Error al consultar a Gemini (${err.message.substring(0, 120)}). Verifica tu conexión o clave en configuración.`;
      }
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: errorMsg 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content max-w-lg mx-auto flex flex-col h-[85vh]">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-apple-orange to-apple-pink text-white flex items-center justify-center shadow-apple">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  NutriChef AI
                </h2>
                <span className="text-[10px] bg-apple-orange/15 text-apple-orange px-2 py-0.5 rounded-full font-bold">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                Tu chef y asesor de nutrición personal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenConfig}
              className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              title="Configurar Clave de Gemini"
            >
              <Key className="w-3.5 h-3.5 text-apple-blue" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!apiKeyReady && (
            <div className="p-3 bg-apple-orange/10 border border-apple-orange/20 rounded-apple-sm text-xs flex items-center justify-between">
              <div className="text-gray-800 dark:text-gray-200">
                <p className="font-semibold text-apple-orange">Clave de IA requerida</p>
                <p className="text-[11px]">Ingresa tu clave gratuita de Google AI Studio para chatear con NutriChef.</p>
              </div>
              <button
                type="button"
                onClick={onOpenConfig}
                className="px-3 py-1.5 bg-apple-orange text-white text-xs font-bold rounded-full shadow-sm"
              >
                Configurar
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-apple-blue text-white'
                  : 'bg-gradient-to-tr from-apple-orange to-apple-pink text-white'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-apple-blue text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white rounded-tl-none border border-black/5 dark:border-white/5 whitespace-pre-line'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-apple-gray-1 dark:text-gray-400 p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-apple-orange" />
              <span>NutriChef está pensando la mejor respuesta...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 pb-2 flex gap-1.5 overflow-x-auto hide-scrollbar">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 px-3 py-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-[11px] font-medium rounded-full transition-colors border border-black/5 dark:border-white/5"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1C1C1E]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pregúntale a NutriChef (ej. ¿Qué cocino hoy?)..."
              className="apple-input flex-1 py-2.5 text-xs sm:text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-gradient-to-r from-apple-orange to-apple-pink text-white rounded-apple-sm flex items-center justify-center shadow-apple disabled:opacity-50 active:scale-95 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
