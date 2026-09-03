import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check, Sparkles } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallPwaModal({ isOpen, onClose }: InstallPwaModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content max-w-md mx-auto">
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-apple-sm bg-gradient-to-tr from-apple-green to-apple-blue flex items-center justify-center text-white shadow-apple">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Instalar NutriFamilia
              </h2>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                Úsala como una aplicación nativa en tu teléfono
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
          
          {/* App Icon Banner */}
          <div className="apple-glass rounded-apple-lg p-4 flex items-center gap-4">
            <img src="favicon.svg" alt="NutriFamilia Logo" className="w-16 h-16 rounded-apple shadow-apple-lg" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">NutriFamilia App</h3>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">Planificador de Salud y Comidas</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-apple-green font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Acceso rápido 24/7 · Sin internet</span>
              </div>
            </div>
          </div>

          {isStandalone ? (
            <div className="p-4 bg-apple-green/10 border border-apple-green/20 rounded-apple-sm text-center">
              <Check className="w-8 h-8 text-apple-green mx-auto mb-1" />
              <p className="font-bold text-sm text-gray-900 dark:text-white">¡Ya está instalada!</p>
              <p className="text-xs text-apple-gray-1 dark:text-gray-300 mt-0.5">Estás usando NutriFamilia en modo aplicación.</p>
            </div>
          ) : isIOS ? (
            /* iOS Instructions */
            <div className="space-y-3">
              <p className="text-xs font-semibold text-apple-gray-1 dark:text-gray-400 uppercase">
                Instrucciones para iPhone / iPad:
              </p>

              <div className="apple-card p-3.5 space-y-3 text-xs text-gray-700 dark:text-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <p>Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 bg-gray-100 dark:bg-white/10 rounded text-[11px] font-medium text-apple-blue">
                      <Share className="w-3 h-3" />
                      <span>Compartir</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <p>Desliza hacia abajo en el menú y selecciona <strong>"Agregar a Inicio"</strong>.</p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 bg-gray-100 dark:bg-white/10 rounded text-[11px] font-medium text-apple-green">
                      <PlusSquare className="w-3 h-3" />
                      <span>Agregar a Inicio</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-apple-green/15 text-apple-green flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <p>Presiona <strong>"Agregar"</strong> en la esquina superior derecha.</p>
                    <p className="text-[11px] text-apple-gray-1 dark:text-gray-400 mt-0.5">¡El icono oficial de NutriFamilia aparecerá en tu pantalla principal!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Chrome Instructions */
            <div className="space-y-3">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-apple-green to-apple-teal text-white rounded-apple-sm text-sm font-bold flex items-center justify-center gap-2 shadow-apple active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Aplicación en el Teléfono</span>
                </button>
              ) : (
                <div className="apple-card p-3.5 space-y-2.5 text-xs text-gray-700 dark:text-gray-200">
                  <p className="font-semibold text-gray-900 dark:text-white">Para instalar en Android / Chrome:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-apple-gray-1 dark:text-gray-300">
                    <li>Toca los tres puntos <strong>(⋮)</strong> en la esquina superior derecha del navegador.</li>
                    <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
                    <li>Confirma para tener la app en tu inicio.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-apple-gray-1 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
