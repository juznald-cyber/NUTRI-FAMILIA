import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, X, Check, AlertCircle, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PANTRY_CATEGORIES, UNITS, type PantryCategory, type PantryItem } from '../../db';
import { addPantryItem } from '../../hooks/useDatabase';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsImported?: () => void;
}

interface ParsedRow {
  name: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
  purchaseDate: string;
}

export default function ImportExcelModal({ isOpen, onClose, onItemsImported }: ImportExcelModalProps) {
  const [parsedItems, setParsedItems] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleRows = [
      {
        'Nombre': 'Pechuga de Pollo',
        'Categoría': 'Proteínas',
        'Cantidad': 2,
        'Unidad': 'kg',
        'Fecha de Compra': new Date().toISOString().split('T')[0]
      },
      {
        'Nombre': 'Manzanas Rojas',
        'Categoría': 'Frutas',
        'Cantidad': 6,
        'Unidad': 'unidades',
        'Fecha de Compra': new Date().toISOString().split('T')[0]
      },
      {
        'Nombre': 'Espinaca Fresca',
        'Categoría': 'Vegetales',
        'Cantidad': 1,
        'Unidad': 'paquetes',
        'Fecha de Compra': new Date().toISOString().split('T')[0]
      },
      {
        'Nombre': 'Arroz Integral',
        'Categoría': 'Granos y Cereales',
        'Cantidad': 1,
        'Unidad': 'kg',
        'Fecha de Compra': new Date().toISOString().split('T')[0]
      },
      {
        'Nombre': 'Leche Deslactosada',
        'Categoría': 'Lácteos',
        'Cantidad': 2,
        'Unidad': 'litros',
        'Fecha de Compra': new Date().toISOString().split('T')[0]
      },
      {
        'Nombre': 'Aceite de Oliva Extra Virgen',
        'Categoría': 'Aceites y Grasas',
        'Cantidad': 1,
        'Unidad': 'litros',
        'Fecha de Compra': new Date().toISOString().split('T')[0]
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Despensa');
    XLSX.writeFile(workbook, 'Plantilla_Despensa_NutriFamilia.xlsx');
  };

  // Map category string from Excel to internal PantryCategory
  const normalizeCategory = (input: any): PantryCategory => {
    if (!input) return 'otros';
    const str = String(input).toLowerCase().trim();

    if (str.includes('veg') || str.includes('verdura') || str.includes('hortaliza')) return 'vegetales';
    if (str.includes('frut')) return 'frutas';
    if (str.includes('prot') || str.includes('carn') || str.includes('poll') || str.includes('pescad') || str.includes('huev')) return 'proteinas';
    if (str.includes('gran') || str.includes('cereal') || str.includes('arroz') || str.includes('pasta') || str.includes('aven')) return 'granos';
    if (str.includes('lact') || str.includes('lech') || str.includes('ques') || str.includes('yogur')) return 'lacteos';
    if (str.includes('aceit') || str.includes('gras')) return 'aceites';
    if (str.includes('condim') || str.includes('especi') || str.includes('sal')) return 'condimentos';
    if (str.includes('enlat')) return 'enlatados';
    if (str.includes('congel')) return 'congelados';
    if (str.includes('bebid') || str.includes('jug')) return 'bebidas';

    return 'otros';
  };

  // Handle Excel/CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
          setError('El archivo Excel está vacío.');
          return;
        }

        const formatted: ParsedRow[] = jsonData.map((row: any) => {
          // Flexible column header matching
          const name = row['Nombre'] || row['nombre'] || row['Producto'] || row['producto'] || row['Item'] || Object.values(row)[0] || 'Producto sin nombre';
          const catRaw = row['Categoría'] || row['Categoria'] || row['categoria'] || row['categoría'] || row['Tipo'] || '';
          const qtyRaw = row['Cantidad'] || row['cantidad'] || row['Cant'] || 1;
          const unitRaw = row['Unidad'] || row['unidad'] || 'unidades';
          const dateRaw = row['Fecha de Compra'] || row['Fecha'] || row['fecha'] || new Date().toISOString().split('T')[0];

          return {
            name: String(name).trim(),
            category: normalizeCategory(catRaw),
            quantity: Number(qtyRaw) > 0 ? Number(qtyRaw) : 1,
            unit: String(unitRaw).trim(),
            purchaseDate: String(dateRaw).trim()
          };
        }).filter(item => item.name.length > 0);

        setParsedItems(formatted);
      } catch (err) {
        console.error(err);
        setError('Error al leer el archivo Excel. Asegúrate de que tenga un formato válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Batch insert all parsed items
  const handleImportAll = async () => {
    if (parsedItems.length === 0) return;
    setIsProcessing(true);

    try {
      for (const item of parsedItems) {
        await addPantryItem(item);
      }
      setImportSuccess(true);
      if (onItemsImported) onItemsImported();

      setTimeout(() => {
        onClose();
        setParsedItems([]);
        setFileName(null);
        setImportSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Error al guardar algunos productos en la base de datos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
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
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Carga Masiva con Excel
              </h2>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400">
                Importa tu lista de compras mensual en segundos
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
          
          {/* Download Template helper banner */}
          <div className="p-3.5 bg-apple-blue/10 dark:bg-apple-blue/20 rounded-apple-sm border border-apple-blue/20 flex items-center justify-between">
            <div className="text-xs text-gray-800 dark:text-gray-200">
              <p className="font-semibold text-apple-blue">¿No tienes la plantilla?</p>
              <p className="text-[11px] text-apple-gray-1 dark:text-gray-300">Descarga el formato de ejemplo con columnas listas</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-apple-blue text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Plantilla .xlsx</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {parsedItems.length === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-apple-blue dark:hover:border-apple-blue rounded-apple-lg p-8 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-white/5"
            >
              <Upload className="w-10 h-10 text-apple-blue mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Haz clic para seleccionar tu archivo Excel
              </p>
              <p className="text-xs text-apple-gray-1 dark:text-gray-400 mt-1">
                Soporta archivos .xlsx, .xls y .csv
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/30 rounded-apple-sm text-apple-red text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Items Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-apple-gray-1 dark:text-gray-400 uppercase">
                  {parsedItems.length} productos detectados en {fileName}
                </span>
                <button
                  type="button"
                  onClick={() => { setParsedItems([]); setFileName(null); }}
                  className="text-xs text-apple-red hover:underline font-medium"
                >
                  Cambiar archivo
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-apple-sm border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
                {parsedItems.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-[#1C1C1E]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{PANTRY_CATEGORIES[item.category].emoji}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-[11px] text-apple-gray-1 dark:text-gray-400">
                          {PANTRY_CATEGORIES[item.category].label} · {item.quantity} {item.unit}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-apple-gray-2 hover:text-apple-red transition-colors"
                      title="Quitar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Import All Button */}
              <button
                type="button"
                disabled={isProcessing || importSuccess}
                onClick={handleImportAll}
                className="w-full py-3.5 px-4 bg-apple-green text-white hover:bg-green-600 rounded-apple-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-apple active:scale-95 transition-all disabled:opacity-50"
              >
                {importSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡{parsedItems.length} productos importados con éxito!</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isProcessing ? 'Importando...' : `Importar ${parsedItems.length} productos a la Despensa`}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
