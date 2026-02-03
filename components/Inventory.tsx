
import React, { useState, useMemo } from 'react';
import { AppState, Product, StockMovement, MovementType } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  BarChart3, 
  AlertTriangle, 
  LayoutGrid, 
  List,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Warehouse
} from 'lucide-react';
import ProductForm from './ProductForm';
import StockAdjustmentForm from './StockAdjustmentForm';

interface InventoryProps {
  state: AppState;
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onAddMovement: (m: Omit<StockMovement, 'id'>) => void;
}

const Inventory: React.FC<InventoryProps> = ({ state, onAddProduct, onUpdateProduct, onAddMovement }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'movements' | 'analysis'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isAdjustmentFormOpen, setIsAdjustmentFormOpen] = useState(false);

  const stats = useMemo(() => {
    const totalVal = state.products.reduce((sum, p) => sum + (p.stockActual * p.cost), 0);
    const lowStock = state.products.filter(p => p.active && p.stockActual > 0 && p.stockActual <= p.stockMin);
    const outOfStock = state.products.filter(p => p.active && p.stockActual === 0);
    const activeProducts = state.products.filter(p => p.active);

    return {
      total: state.products.length,
      value: totalVal,
      low: lowStock.length,
      out: outOfStock.length,
      active: activeProducts.length
    };
  }, [state.products]);

  const filteredProducts = useMemo(() => {
    return state.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        // Show low stock first if searching
        const aLow = a.stockActual <= a.stockMin ? 1 : 0;
        const bLow = b.stockActual <= b.stockMin ? 1 : 0;
        return bLow - aLow;
    });
  }, [state.products, searchTerm]);

  const selectedProduct = useMemo(() => 
    state.products.find(p => p.id === selectedProductId), 
    [state.products, selectedProductId]
  );

  const productMovements = useMemo(() => 
    state.stockMovements
      .filter(m => m.productId === selectedProductId)
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()),
    [state.stockMovements, selectedProductId]
  );

  const renderProductList = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
           <input 
            type="text" 
            placeholder="Buscar por nombre, código o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all shadow-xl"
           />
        </div>
        <div className="flex gap-2">
           <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl border transition-all ${viewMode === 'grid' ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-white'}`}><LayoutGrid size={18} /></button>
           <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl border transition-all ${viewMode === 'list' ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-white'}`}><List size={18} /></button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-5">Código</th>
                <th className="p-5">Producto</th>
                <th className="p-5">Categoría</th>
                <th className="p-5 text-right">Stock</th>
                <th className="p-5 text-right">Costo</th>
                <th className="p-5 text-right">Precio</th>
                <th className="p-5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map(p => {
                const status = p.stockActual === 0 ? 'out' : (p.stockActual <= p.stockMin ? 'low' : 'ok');
                return (
                  <tr key={p.id} onClick={() => setSelectedProductId(p.id)} className="group hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <td className="p-5 font-bold text-slate-500 text-xs">{p.sku}</td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-200 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{p.name}</span>
                        {p.brand && <span className="text-[9px] text-slate-500 font-bold uppercase">{p.brand}</span>}
                      </div>
                    </td>
                    <td className="p-5"><span className="text-[10px] font-black uppercase text-slate-400 bg-white/5 px-2 py-1 rounded-lg">{p.category}</span></td>
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${status === 'out' ? 'text-rose-500' : status === 'low' ? 'text-amber-500' : 'text-slate-300'}`}>
                          {p.stockActual}
                        </span>
                        <span className="text-[8px] text-slate-600 uppercase font-black">Min: {p.stockMin}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right font-bold text-slate-400 text-xs">${p.cost.toLocaleString()}</td>
                    <td className="p-5 text-right font-black text-slate-100 text-sm">${p.price.toLocaleString()}</td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentcolor] ${status === 'out' ? 'bg-rose-500 text-rose-500' : status === 'low' ? 'bg-amber-500 text-amber-500 animate-pulse' : 'bg-emerald-500 text-emerald-500'}`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={7} className="p-20 text-center text-slate-600 font-black uppercase text-xs tracking-widest">No se encontraron productos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => {
             const status = p.stockActual === 0 ? 'out' : (p.stockActual <= p.stockMin ? 'low' : 'ok');
             return (
               <div key={p.id} onClick={() => setSelectedProductId(p.id)} className="glass p-6 rounded-[2rem] border border-white/5 hover:border-primary-500/30 transition-all cursor-pointer group shadow-xl hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-slate-500 group-hover:text-primary-500 transition-colors">
                      <Package size={24} />
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${status === 'out' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : status === 'low' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      {status === 'out' ? 'Agotado' : status === 'low' ? 'Stock Bajo' : 'Stock OK'}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight mb-1">{p.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">{p.sku} • {p.category}</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase">Stock Actual</p>
                      <p className={`text-xl font-black ${status === 'ok' ? 'text-white' : 'text-amber-500'}`}>{p.stockActual}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase">Precio</p>
                      <p className="text-xl font-black text-emerald-400">${p.price.toLocaleString()}</p>
                    </div>
                  </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="p-4 md:p-6 space-y-8 animate-in slide-in-from-right duration-300 pb-20">
        <button onClick={() => setSelectedProductId(null)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
          <ChevronRight size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Volver al Inventario</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-8">
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center text-center">
                 <div className="w-32 h-32 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                    <Package size={64} />
                 </div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic neon-glow">{selectedProduct.name}</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedProduct.sku}</p>
                 
                 <div className="w-full mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                    <div className="text-left space-y-1">
                       <p className="text-[9px] font-black text-slate-600 uppercase">Costo Unitario</p>
                       <p className="text-lg font-black text-white">${selectedProduct.cost.toLocaleString()}</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[9px] font-black text-slate-600 uppercase">Precio Venta</p>
                       <p className="text-lg font-black text-emerald-400">${selectedProduct.price.toLocaleString()}</p>
                    </div>
                 </div>

                 <button 
                  onClick={() => setIsAdjustmentFormOpen(true)}
                  className="w-full mt-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase transition-all shadow-xl shadow-primary-600/30"
                 >
                   Ajustar Stock
                 </button>
              </div>

              <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Warehouse size={14} /> Ubicación y Logística
                 </h3>
                 <div className="space-y-4">
                    <DetailRow label="Categoría" value={selectedProduct.category} />
                    <DetailRow label="Marca" value={selectedProduct.brand || 'No asig.'} />
                    <DetailRow label="Stock Mínimo" value={selectedProduct.stockMin.toString()} />
                    <DetailRow label="Ubicación" value={`${selectedProduct.location?.warehouse || '-'} Est: ${selectedProduct.location?.shelf || '-'} Fila: ${selectedProduct.location?.row || '-'}`} />
                 </div>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="glass p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valorización en Stock</p>
                    <p className="text-3xl font-black text-white">${(selectedProduct.stockActual * selectedProduct.cost).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">Calculado: Stock ({selectedProduct.stockActual}) x Costo (${selectedProduct.cost})</p>
                 </div>
                 <div className="glass p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado del Stock</p>
                    <div className="flex items-center gap-3 mt-1">
                       <span className={`text-3xl font-black ${selectedProduct.stockActual <= selectedProduct.stockMin ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedProduct.stockActual} unidades</span>
                       <div className={`w-3 h-3 rounded-full ${selectedProduct.stockActual <= selectedProduct.stockMin ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                 </div>
              </div>

              <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Historial de Movimientos</h3>
                    <History size={16} className="text-slate-600" />
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-500">
                             <th className="p-5">Fecha / Hora</th>
                             <th className="p-5">Tipo</th>
                             <th className="p-5 text-right">Entrada</th>
                             <th className="p-5 text-right">Salida</th>
                             <th className="p-5 text-right">Stock Final</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {productMovements.map(m => (
                             <tr key={m.id} className="hover:bg-white/[0.02]">
                                <td className="p-5">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-300">{m.date}</span>
                                      <span className="text-[9px] text-slate-600 font-black">{m.time}</span>
                                   </div>
                                </td>
                                <td className="p-5">
                                   <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${m.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-500' : m.type === 'sale' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                      {m.type === 'purchase' ? 'Compra' : m.type === 'sale' ? 'Venta' : m.type === 'adjustment' ? 'Ajuste' : m.type}
                                   </span>
                                </td>
                                <td className="p-5 text-right font-black text-emerald-400 text-sm">{m.qtyIn > 0 ? `+${m.qtyIn}` : '-'}</td>
                                <td className="p-5 text-right font-black text-rose-400 text-sm">{m.qtyOut > 0 ? `-${m.qtyOut}` : '-'}</td>
                                <td className="p-5 text-right font-black text-slate-200 text-sm">{m.resultingStock}</td>
                             </tr>
                          ))}
                          {productMovements.length === 0 && (
                             <tr><td colSpan={5} className="p-10 text-center text-[10px] font-black uppercase text-slate-600 tracking-widest">Sin movimientos recientes</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      {selectedProduct ? renderProductDetail() : (
        <>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">Inventario / Stock</h1>
              <p className="text-slate-500 text-sm font-medium">Control físico y valorizado de productos.</p>
            </div>
            <button 
              onClick={() => setIsProductFormOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-primary-600/30 active:scale-95"
            >
              <Plus size={16} /> Agregar Producto
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InvKpi title="Productos Totales" value={stats.active} info={`${stats.total} en catálogo`} color="blue" />
            <InvKpi title="Valor de Inventario" value={stats.value} info="Valor total al costo" color="emerald" isPrice />
            <InvKpi title="Stock Bajo" value={stats.low} info="Items en alerta" color="amber" isAlert={stats.low > 0} />
            <InvKpi title="Sin Stock" value={stats.out} info="Items agotados" color="rose" isAlert={stats.out > 0} />
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 max-w-sm">
             <button onClick={() => setActiveTab('products')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'products' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500'}`}><Package size={14} /> Productos</button>
             <button onClick={() => setActiveTab('movements')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'movements' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500'}`}><History size={14} /> Movimientos</button>
             <button onClick={() => setActiveTab('analysis')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'analysis' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500'}`}><BarChart3 size={14} /> Análisis</button>
          </div>

          {activeTab === 'products' && renderProductList()}
          {activeTab === 'movements' && (
             <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Listado Maestro de Movimientos</h2>
                   <History size={16} className="text-slate-600" />
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <th className="p-5">Fecha / Hora</th>
                            <th className="p-5">Producto</th>
                            <th className="p-5">Tipo</th>
                            <th className="p-5 text-right">Entrada</th>
                            <th className="p-5 text-right">Salida</th>
                            <th className="p-5 text-right">Stock Result.</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {state.stockMovements.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 50).map(m => {
                            const p = state.products.find(x => x.id === m.productId);
                            return (
                               <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-5 text-xs font-bold text-slate-400">{m.date} <span className="text-[10px] opacity-50 ml-1">{m.time}</span></td>
                                  <td className="p-5">
                                     <p className="text-xs font-black text-white uppercase">{p?.name || 'Desconocido'}</p>
                                     <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">{p?.sku}</p>
                                  </td>
                                  <td className="p-5">
                                     <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${m.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-500' : m.type === 'sale' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {m.type}
                                     </span>
                                  </td>
                                  <td className="p-5 text-right font-black text-emerald-400">+{m.qtyIn}</td>
                                  <td className="p-5 text-right font-black text-rose-400">-{m.qtyOut}</td>
                                  <td className="p-5 text-right font-black text-slate-200">{m.resultingStock}</td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
          {activeTab === 'analysis' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95">
                <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
                   <div className="p-6 bg-primary-600/10 rounded-full text-primary-500 animate-pulse">
                      <TrendingUp size={48} />
                   </div>
                   <h3 className="text-xl font-black text-white uppercase italic">Análisis de Rotación</h3>
                   <p className="text-slate-500 text-xs">Próximamente: Gráficos de rotación de stock y productos con mayor movimiento para optimizar tus compras.</p>
                </div>
                <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-center items-center text-center space-y-4">
                   <div className="p-6 bg-emerald-600/10 rounded-full text-emerald-500">
                      <Warehouse size={48} />
                   </div>
                   <h3 className="text-xl font-black text-white uppercase italic">Valorización por Almacén</h3>
                   <p className="text-slate-500 text-xs">Muestra la distribución del valor de tu inventario en diferentes depósitos o sucursales de tu empresa.</p>
                </div>
             </div>
          )}
        </>
      )}

      {isProductFormOpen && (
        <ProductForm 
          onClose={() => setIsProductFormOpen(false)}
          onSubmit={(p) => { onAddProduct(p); setIsProductFormOpen(false); }}
        />
      )}

      {isAdjustmentFormOpen && selectedProduct && (
         <StockAdjustmentForm 
            product={selectedProduct}
            onClose={() => setIsAdjustmentFormOpen(false)}
            onSubmit={(m) => { onAddMovement(m); setIsAdjustmentFormOpen(false); }}
         />
      )}
    </div>
  );
};

const InvKpi = ({ title, value, info, color, isAlert, isPrice }: any) => (
  <div className={`glass p-6 rounded-[2rem] border ${isAlert ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5'} transition-all hover:scale-[1.02] shadow-xl`}>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
    <p className={`text-2xl font-black ${isAlert ? 'text-rose-500 neon-glow' : 'text-white'}`}>{isPrice ? `$${value.toLocaleString()}` : value}</p>
    <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 flex items-center gap-1">
      <div className={`w-1 h-1 rounded-full bg-${color}-500`} /> {info}
    </p>
  </div>
);

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between border-b border-white/5 pb-2">
     <span className="text-[9px] font-black text-slate-500 uppercase">{label}</span>
     <span className="text-[11px] font-bold text-slate-200 text-right">{value}</span>
  </div>
);

export default Inventory;
