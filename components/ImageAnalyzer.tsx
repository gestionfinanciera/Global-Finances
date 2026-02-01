
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, CheckCircle2, ListFilter, FileText } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';

interface ImageAnalyzerProps {
  onClose: () => void;
  onResult: (data: any | any[]) => void;
  language: Language;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onClose, onResult, language }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mode, setMode] = useState<'receipt' | 'ledger'>('ledger');
  const [results, setResults] = useState<any | any[]>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    const base64 = image.split(',')[1];
    try {
      if (mode === 'ledger') {
        const data = await geminiService.analyzeLedger(base64);
        setResults(data);
      } else {
        const data = await geminiService.analyzeReceipt(base64);
        setResults(data);
      }
    } catch (err) {
      alert(language === 'es' ? "Error al analizar la imagen." : "Failed to analyze image.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl my-auto border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary-500" />
            <h2 className="font-bold">{language === 'es' ? 'Escáner Inteligente' : 'Smart Scanner'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!results && (
             <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl">
                <button 
                    onClick={() => setMode('ledger')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'ledger' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500'}`}
                >
                    <ListFilter size={16} />
                    {language === 'es' ? 'Libro Diario' : 'Journal Ledger'}
                </button>
                <button 
                    onClick={() => setMode('receipt')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'receipt' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500'}`}
                >
                    <FileText size={16} />
                    {language === 'es' ? 'Factura Única' : 'Single Receipt'}
                </button>
             </div>
          )}

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <p className="font-bold text-slate-600 dark:text-slate-300">{language === 'es' ? 'Click para subir imagen' : 'Click to upload image'}</p>
              <p className="text-xs text-slate-400 mt-1">{language === 'es' ? 'Saca una foto a tu Libro Diario' : 'Take a photo of your Journal Ledger'}</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="space-y-4">
              {!results && (
                <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <img src={image} className="w-full h-full object-contain bg-slate-100 dark:bg-slate-900" alt="Preview" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-xl hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {!results ? (
                <button 
                  onClick={startAnalysis}
                  disabled={analyzing}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-primary-600/20"
                >
                  {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {analyzing ? (language === 'es' ? 'Analizando con Gemini...' : 'Analyzing with Gemini...') : (language === 'es' ? 'Analizar Libro Diario' : 'Analyze Journal Ledger')}
                </button>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle2 size={20} />
                    <span className="font-bold">{language === 'es' ? 'Análisis Completo' : 'Analysis Complete'}</span>
                    <span className="text-xs ml-auto opacity-70">Detectados: {Array.isArray(results) ? results.length : 1}</span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {Array.isArray(results) ? (
                      results.map((entry, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-black uppercase text-primary-500">{entry.date}</span>
                             <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                          </div>
                          <p className="text-sm font-bold mb-3">{entry.description}</p>
                          <div className="space-y-1">
                            {entry.debitParts.map((p: any, j: number) => (
                                <div key={j} className="flex justify-between text-[10px] text-emerald-600 font-bold">
                                    <span>Dr: {p.accountId}</span>
                                    <span>${p.amount.toFixed(2)}</span>
                                </div>
                            ))}
                            {entry.creditParts.map((p: any, j: number) => (
                                <div key={j} className="flex justify-between text-[10px] text-rose-500 font-bold pl-4">
                                    <span>Cr: {p.accountId}</span>
                                    <span>${p.amount.toFixed(2)}</span>
                                </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 block">FECHA</span>
                                <span className="text-sm font-bold">{results.date}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 block text-right">MONTO</span>
                                <span className="text-sm font-bold block text-right">${results.amount?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 block">DETALLE</span>
                            <span className="text-sm font-medium">{results.description}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                        onClick={() => setResults(null)}
                        className="flex-1 py-3 px-4 rounded-2xl border dark:border-slate-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        {language === 'es' ? 'Volver' : 'Back'}
                    </button>
                    <button 
                        onClick={() => onResult(results)}
                        className="flex-[2] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm"
                    >
                        {language === 'es' ? 'Importar al Diario' : 'Import to Journal'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
