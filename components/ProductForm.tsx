
import React, { useState } from 'react';
import { X, Save, Package, Tag, DollarSign, Archive, MapPin } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  onClose: () => void;
  onSubmit: (p: Omit<Product, 'id'>) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: 'PRD-' + Math.floor(Math.random() * 10000),
    category: '',
    brand: '',
    cost: '',
    price: '',
    stockMin: '10',
    stockActual: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cost || !formData.price) return;

    onSubmit({
      name: formData.name,
      sku: formData.sku,
      category: formData.category || 'General',
      brand: formData.brand,
      cost: parseFloat(formData.cost),
      price: parseFloat(formData.price),
      stockActual: parseInt(formData.stockActual),
      stockMin: parseInt(formData.stockMin),
      stockMax: 100,
      reorderPoint: parseInt(formData.stockMin) + 5,
      active: true,
      alertOnLowStock: true
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary-500/5">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary-600/20 text-primary-500">
                <Package size={20} />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight italic neon-glow">Nuevo Producto</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-auto scrollbar-thin">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Nombre del Producto *</label>
                 <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500 transition-all"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Código / SKU</label>
                 <input 
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-slate-400 outline-none focus:border-primary-500 transition-all"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Categoría</label>
                 <input 
                  type="text"
                  placeholder="Ej: Calzado, Electrónica..."
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500 transition-all"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Marca</label>
                 <input 
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500 transition-all"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Costo de Compra ($)</label>
                 <input 
                  required
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-white outline-none focus:border-primary-500 transition-all"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Precio de Venta ($)</label>
                 <input 
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-emerald-400 outline-none focus:border-primary-500 transition-all"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Stock Inicial</label>
                 <input 
                  type="number"
                  value={formData.stockActual}
                  onChange={(e) => setFormData({...formData, stockActual: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-white outline-none focus:border-primary-500 transition-all"
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Stock Mínimo (Alerta)</label>
                 <input 
                  type="number"
                  value={formData.stockMin}
                  onChange={(e) => setFormData({...formData, stockMin: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-amber-500 outline-none focus:border-primary-500 transition-all"
                 />
              </div>
           </div>
        </form>

        <div className="p-6 border-t border-white/5 flex gap-4 bg-black/20">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-500 font-bold text-[10px] uppercase hover:bg-white/5 transition-all">Cancelar</button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            className="flex-[2] py-4 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase shadow-xl shadow-primary-600/30 hover:bg-primary-500 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} /> Guardar Producto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
