
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';

interface ImageAnalyzerProps {
  onClose: () => void;
  onResult: (data: any) => void;
  language: Language;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onClose, onResult, language }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
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
      const data = await geminiService.analyzeReceipt(base64);
      setResult(data);
    } catch (err) {
      alert("Failed to analyze image.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary-500" />
            <h2 className="font-bold">Smart Receipt Scanner</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
            >
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mb-4">
                <Upload size={32} />
              </div>
              <p className="font-medium text-slate-600 dark:text-slate-300">Click to upload a receipt</p>
              <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                {!result && (
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {!result ? (
                <button 
                  onClick={startAnalysis}
                  disabled={analyzing}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  {analyzing ? 'Analyzing with Gemini...' : 'Analyze Document'}
                </button>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 mb-4 text-emerald-600">
                    <CheckCircle2 size={20} />
                    <span className="font-bold">Analysis Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Amount</p>
                      <p className="text-lg font-bold">${result.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Date</p>
                      <p className="text-lg font-bold">{result.date}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Description</p>
                    <p className="font-medium">{result.description}</p>
                  </div>
                  <button 
                    onClick={() => onResult(result)}
                    className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    Use Data
                  </button>
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
