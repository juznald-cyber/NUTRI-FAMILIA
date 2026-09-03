import React, { useState } from 'react';
import { X, Calendar, FileText, FileSpreadsheet, Check } from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { db, type Recipe } from '../../db';
import { exportWeeklyPlanToPDF, exportWeeklyPlanToExcel } from '../../utils/exportUtils';

interface ExportRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  recipes: Recipe[];
}

type RangeType = 'current-week' | 'next-week' | 'current-month' | 'custom';

export default function ExportRangeModal({ isOpen, onClose, currentDate, recipes }: ExportRangeModalProps) {
  const [rangeType, setRangeType] = useState<RangeType>('current-week');
  
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const nextWeekStart = addDays(currentWeekStart, 7);
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);

  const [customStart, setCustomStart] = useState(format(currentWeekStart, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(addDays(currentWeekStart, 6), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const calculateDays = (): Date[] => {
    switch (rangeType) {
      case 'current-week':
        return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      case 'next-week':
        return Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i));
      case 'current-month':
        return eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
      case 'custom': {
        const start = parseISO(customStart);
        const end = parseISO(customEnd);
        if (start > end) return [start];
        return eachDayOfInterval({ start, end });
      }
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      const days = calculateDays();
      const dateStrings = days.map(d => format(d, 'yyyy-MM-dd'));
      
      const meals = await db.mealPlans.where('date').anyOf(dateStrings).toArray();

      if (type === 'pdf') {
        exportWeeklyPlanToPDF({ days, meals, recipes });
      } else {
        exportWeeklyPlanToExcel({ days, meals, recipes });
      }
      onClose();
    } catch (e) {
      console.error('Error al exportar:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content max-w-lg mx-auto">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-apple-blue/15 text-apple-blue flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Exportar Menú Planificado
              </h2>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                Selecciona el rango de fechas que deseas descargar
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
          {/* Predefined Range Options */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setRangeType('current-week')}
              className={`w-full p-3.5 rounded-apple-sm flex items-center justify-between border transition-all ${
                rangeType === 'current-week'
                  ? 'border-apple-blue bg-apple-blue/10 text-apple-blue font-semibold'
                  : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="text-left">
                <p className="text-sm">Esta Semana</p>
                <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                  {format(currentWeekStart, "d MMM", { locale: es })} — {format(addDays(currentWeekStart, 6), "d MMM", { locale: es })} (7 días)
                </p>
              </div>
              {rangeType === 'current-week' && <Check className="w-4 h-4 text-apple-blue" />}
            </button>

            <button
              type="button"
              onClick={() => setRangeType('next-week')}
              className={`w-full p-3.5 rounded-apple-sm flex items-center justify-between border transition-all ${
                rangeType === 'next-week'
                  ? 'border-apple-blue bg-apple-blue/10 text-apple-blue font-semibold'
                  : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="text-left">
                <p className="text-sm">Próxima Semana</p>
                <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                  {format(nextWeekStart, "d MMM", { locale: es })} — {format(addDays(nextWeekStart, 6), "d MMM", { locale: es })} (7 días)
                </p>
              </div>
              {rangeType === 'next-week' && <Check className="w-4 h-4 text-apple-blue" />}
            </button>

            <button
              type="button"
              onClick={() => setRangeType('current-month')}
              className={`w-full p-3.5 rounded-apple-sm flex items-center justify-between border transition-all ${
                rangeType === 'current-month'
                  ? 'border-apple-blue bg-apple-blue/10 text-apple-blue font-semibold'
                  : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="text-left">
                <p className="text-sm">Mes Completo</p>
                <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                  {format(currentMonthStart, "MMMM yyyy", { locale: es })}
                </p>
              </div>
              {rangeType === 'current-month' && <Check className="w-4 h-4 text-apple-blue" />}
            </button>

            <button
              type="button"
              onClick={() => setRangeType('custom')}
              className={`w-full p-3.5 rounded-apple-sm flex items-center justify-between border transition-all ${
                rangeType === 'custom'
                  ? 'border-apple-blue bg-apple-blue/10 text-apple-blue font-semibold'
                  : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="text-left">
                <p className="text-sm">Rango Personalizado</p>
                <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                  Elige fecha exacta de inicio y fin
                </p>
              </div>
              {rangeType === 'custom' && <Check className="w-4 h-4 text-apple-blue" />}
            </button>
          </div>

          {/* Custom Date Pickers */}
          {rangeType === 'custom' && (
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-apple-sm border border-gray-200 dark:border-white/10 space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="apple-section-title">Desde</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="apple-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="apple-section-title">Hasta</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="apple-input w-full text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Download Action Buttons */}
          <div className="pt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('pdf')}
              className="py-3.5 px-4 bg-apple-red/10 hover:bg-apple-red/20 text-apple-red dark:bg-apple-red/20 dark:hover:bg-apple-red/30 rounded-apple-sm text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-apple-red" />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('excel')}
              className="py-3.5 px-4 bg-apple-green/10 hover:bg-apple-green/20 text-apple-green dark:bg-apple-green/20 dark:hover:bg-apple-green/30 rounded-apple-sm text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-apple-green" />
              <span>Descargar Excel</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
