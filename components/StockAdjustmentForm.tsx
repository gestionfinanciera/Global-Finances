
import React, { useState } from 'react';
import { X, Save, TrendingUp, TrendingDown, ArrowRight, AlertCircle } from 'lucide-react';
import { Product, StockMovement, MovementType } from '../types';

interface StockAdjustmentFormProps {
  product: Product;
  onClose: () => void;
  onSubmit: (m: Omit<StockMovement, 'id'>) => void;
}

const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ product, onClose, onSubmit }) => {
  const [type, setType] = useState<MovementType>('adjustment');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Inventario Físico');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(qty);
    if (isNaN(amount) || amount === 0) return;

    const isInput = type === 'purchase' || (type === 'adjustment' && amount > 0);
    const absQty = Math.abs(amount);
    
    const qtyIn = isInput ? absQty : 0;
    const qtyOut = !isInput ? absQty : 0;
    const nextStock = product.stockActual + qtyIn - qtyOut;

    if (nextStock < 0) {
      alert("El stock no puede ser negativo.");
      return;
    }

    const now = new Date();
    onSubmit({
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId: product.id,
      type: type,
      qtyIn,
      qtyOut,
      resultingStock: nextStock,
      unitCost: product.cost,
      reason: reason
    });
  };

  const nextStockPreview = product.stockActual + (type === 'purchase' ? parseInt(qty || '0') : (type === 'sale' ? -parseInt(qty || '0') : parseInt(qty || '0')));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary-500/5">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-600/20 text-primary-500">
                 <TrendingUp size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight italic neon-glow">Ajustar Stock</h2>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{product.name}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {(['purchase', 'sale', 'adjustment'] as MovementType[]).map(t => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${type === t ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  {t === 'purchase' ? 'Compra' : t === 'sale' ? 'Venta' : 'Ajuste'}
                </button>
              ))}
           </div>

           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Cantidad del Movimiento</label>
              <input 
                required
                type="number"
                placeholder="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-2xl font-black text-white outline-none focus:border-primary-500 transition-all"
              />
              <p className="text-[9px] text-slate-500 italic mt-1">* Para ajustes, usa números negativos para retirar stock.</p>
           </div>

           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Motivo / Referencia</label>
              <input 
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500 transition-all"
              />
           </div>

           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between shadow-inner">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-slate-600 uppercase">Stock Actual</p>
                 <p className="text-xl font-black text-slate-400">{product.stockActual}</p>
              </div>
              <ArrowRight className="text-primary-600" />
              <div className="space-y-1 text-right">
                 <p className="text-[9px] font-black text-slate-600 uppercase">Stock Resultante</p>
                 <p className={`text-xl font-black ${isNaN(nextStockPreview) ? 'text-slate-400' : (nextStockPreview <= product.stockMin ? 'text-amber-500' : 'text-emerald-400')}`}>
                   {isNaN(nextStockPreview) ? product.stockActual : nextStockPreview}
                 </p>
              </div>
           </div>

           <button 
             type="submit"
             className="w-full py-4 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase shadow-xl shadow-primary-600/30 hover:bg-primary-500 transition-all flex items-center justify-center gap-2"
           >
             <Save size={16} /> Confirmar Movimiento
           </button>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentForm;
