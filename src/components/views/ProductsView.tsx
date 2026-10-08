import React, { useState, useMemo, useEffect } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product, ProductFilter, StockStatus } from '../../types';
import { formatCurrency, getStockStatus, getExpiryDetails, formatDateShort } from '../../utils/helpers';

interface ProductsViewProps {
  onOpenReceiveStock: (product: Product) => void;
  onOpenStockCount: () => void;
  onOpenMermaModal: (product: Product) => void;
  onOpenEditModal: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenReceiveStock,
  onOpenStockCount,
  onOpenMermaModal,
  onOpenEditModal
}) => {
  const { 
    products, 
    stockCounts, 
    expiryCounts, 
    deleteProduct,
    inventoryFilterInitial,
    setInventoryFilterInitial
  } = useBodega();

  // Active filter chip
  const [filter, setFilter] = useState<ProductFilter>(inventoryFilterInitial || 'todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting in desktop table
  const [sortField, setSortField] = useState<'name' | 'stock' | 'expiry' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Active ⋮ menu open for product
  const [activeMenuProductId, setActiveMenuProductId] = useState<string | null>(null);

  // Sync initial filter if changed from dashboard
  useEffect(() => {
    if (inventoryFilterInitial) {
      setFilter(inventoryFilterInitial);
    }
  }, [inventoryFilterInitial]);

  // Handle sort toggle
  const handleSort = (field: 'name' | 'stock' | 'expiry' | 'price') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const stockStatus = getStockStatus(p);
      const expiryStatus = getExpiryDetails(p).status;

      if (filter === 'agotados') return stockStatus === 'Agotado';
      if (filter === 'bajos') return stockStatus === 'Bajo';
      if (filter === 'vencidos') return expiryStatus === 'Vencido';
      if (filter === 'por_vencer') return expiryStatus === 'Por vencer';
      return true;
    }).sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'stock') return (a.stock - b.stock) * dir;
      if (sortField === 'price') return (a.price - b.price) * dir;
      if (sortField === 'expiry') return a.expiryDate.localeCompare(b.expiryDate) * dir;
      return 0;
    });
  }, [products, filter, searchQuery, sortField, sortDirection]);

  // Stock status badge component wireframe
  const renderStockBadge = (stockStatus: StockStatus) => {
    if (stockStatus === 'Agotado') {
      return (
        <span className="inline-block border-2 border-black bg-neutral-300 text-black text-[10px] font-bold px-2 py-0.5">
          [ALERTA: AGOTADO]
        </span>
      );
    }
    if (stockStatus === 'Bajo') {
      return (
        <span className="inline-block border border-neutral-700 bg-neutral-200 text-black text-[10px] font-bold px-2 py-0.5">
          [ESTADO: BAJO]
        </span>
      );
    }
    return (
      <span className="inline-block border border-neutral-600 bg-neutral-100 text-black text-[10px] font-bold px-2 py-0.5">
        [ESTADO: OK]
      </span>
    );
  };

  // Expiry status badge component wireframe
  const renderExpiryBadge = (p: Product) => {
    const details = getExpiryDetails(p);

    if (details.status === 'Vencido') {
      return (
        <span className="inline-block border-2 border-black bg-neutral-300 text-black text-[10px] font-bold px-1.5 py-0.5">
          [VENCIDO: {details.label.toUpperCase()}]
        </span>
      );
    }
    if (details.status === 'Por vencer') {
      return (
        <span className="inline-block border border-neutral-700 bg-neutral-200 text-black text-[10px] font-bold px-1.5 py-0.5">
          [POR VENCER: {details.label.toUpperCase()}]
        </span>
      );
    }
    return (
      <span className="text-xs text-neutral-600 font-normal">
        Lote: {formatDateShort(p.expiryDate)}
      </span>
    );
  };

  return (
    <div className="space-y-3.5 pb-12 select-none">
      
      {/* 1. TOP CONTROLS & "CONTAR STOCK" WIREFRAME */}
      <div className="bg-white p-3.5 border border-neutral-400 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="[Filtrar por nombre, categoría o código]..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white text-xs font-normal border border-black outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-black px-1"
            >
              [X]
            </button>
          )}
        </div>

        {/* Action: Flujo Guiado "Contar stock" */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStockCount}
            className="w-full md:w-auto px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
          >
            [✓ Contar Stock Físico]
          </button>
        </div>

      </div>

      {/* 2. CHIP FILTERS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        
        {/* Todos */}
        <button
          onClick={() => { setFilter('todos'); setInventoryFilterInitial('todos'); }}
          className={`px-3 py-1.5 font-bold whitespace-nowrap border ${
            filter === 'todos'
              ? 'border-2 border-black bg-neutral-900 text-white'
              : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <span>Todos ({stockCounts.total})</span>
        </button>

        {/* Agotados */}
        <button
          onClick={() => { setFilter('agotados'); setInventoryFilterInitial('agotados'); }}
          className={`px-3 py-1.5 font-bold whitespace-nowrap border ${
            filter === 'agotados'
              ? 'border-2 border-black bg-neutral-900 text-white'
              : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <span>[AGOTADOS: {stockCounts.agotados}]</span>
        </button>

        {/* Bajos */}
        <button
          onClick={() => { setFilter('bajos'); setInventoryFilterInitial('bajos'); }}
          className={`px-3 py-1.5 font-bold whitespace-nowrap border ${
            filter === 'bajos'
              ? 'border-2 border-black bg-neutral-900 text-white'
              : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <span>[BAJOS: {stockCounts.bajos}]</span>
        </button>

        {/* Vencidos */}
        <button
          onClick={() => { setFilter('vencidos'); setInventoryFilterInitial('vencidos'); }}
          className={`px-3 py-1.5 font-bold whitespace-nowrap border ${
            filter === 'vencidos'
              ? 'border-2 border-black bg-neutral-900 text-white'
              : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <span>[VENCIDOS: {expiryCounts.vencidos}]</span>
        </button>

        {/* Por vencer */}
        <button
          onClick={() => { setFilter('por_vencer'); setInventoryFilterInitial('por_vencer'); }}
          className={`px-3 py-1.5 font-bold whitespace-nowrap border ${
            filter === 'por_vencer'
              ? 'border-2 border-black bg-neutral-900 text-white'
              : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <span>[POR VENCER: {expiryCounts.porVencer}]</span>
        </button>

      </div>

      {/* 3. MOBILE: TARJETAS TÁCTILES */}
      <div className="md:hidden space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-6 text-center text-neutral-600 space-y-1 border border-neutral-400">
            <p className="text-xs font-bold text-neutral-900">No hay productos en esta categoría</p>
            <p className="text-xs">Prueba seleccionando otro filtro o limpiando la búsqueda.</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const stockStatus = getStockStatus(prod);
            const stockRatio = Math.min(100, Math.round((prod.stock / Math.max(1, prod.minStock)) * 100));

            return (
              <div
                key={prod.id}
                className="bg-white p-3 border border-neutral-400 space-y-2.5 relative"
              >
                {/* Product Name & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                      {prod.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-600 font-normal">
                      <span>{prod.category}</span>
                      <span>•</span>
                      <span>Unidad: {prod.unit}</span>
                    </div>
                  </div>

                  {/* Menu ⋮ */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuProductId(activeMenuProductId === prod.id ? null : prod.id)}
                      className="px-2 py-0.5 border border-black bg-neutral-100 text-xs font-bold"
                      aria-label="Más acciones"
                    >
                      [...]
                    </button>

                    {activeMenuProductId === prod.id && (
                      <div 
                        className="absolute right-0 mt-1 w-40 bg-white border-2 border-black py-1 z-30 text-xs divide-y divide-neutral-200"
                        onClick={() => setActiveMenuProductId(null)}
                      >
                        <button
                          onClick={() => onOpenEditModal(prod)}
                          className="w-full text-left px-3 py-1.5 hover:bg-neutral-200 font-normal text-neutral-900"
                        >
                          [Editar producto]
                        </button>
                        <button
                          onClick={() => onOpenMermaModal(prod)}
                          className="w-full text-left px-3 py-1.5 hover:bg-neutral-200 font-normal text-neutral-900"
                        >
                          [Reportar merma]
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que deseas eliminar "${prod.name}" del catálogo?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-neutral-200 font-bold text-black"
                        >
                          [Eliminar]
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock actual / mínimo */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700 font-normal">
                      Stock: <strong className="text-neutral-900 font-bold">{prod.stock}</strong> / mín. {prod.minStock} {prod.unit}s
                    </span>
                    <span className="text-neutral-900 font-bold">
                      {formatCurrency(prod.price)}
                    </span>
                  </div>

                  <div className="w-full bg-neutral-200 border border-neutral-400 h-2">
                    <div
                      className="h-full bg-neutral-800"
                      style={{ width: `${stockRatio}%` }}
                    />
                  </div>
                </div>

                {/* Chips de estado */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {renderStockBadge(stockStatus)}
                  {renderExpiryBadge(prod)}
                </div>

                {/* Acción Principal */}
                <div className="pt-1.5 border-t border-neutral-200">
                  <button
                    onClick={() => onOpenReceiveStock(prod)}
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
                  >
                    [+ Recibir mercadería / Reponer]
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. DESKTOP: TABLA ORDENABLE WIREFRAME */}
      <div className="hidden md:block bg-white border border-neutral-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-neutral-900 font-bold uppercase tracking-wider text-[11px]">
                
                {/* Producto */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-neutral-200 border-r border-neutral-300"
                >
                  <span>Producto & Unidad [^v]</span>
                </th>

                {/* Categoría */}
                <th className="py-2.5 px-3 border-r border-neutral-300">Categoría</th>

                {/* Stock actual / mín */}
                <th 
                  onClick={() => handleSort('stock')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-neutral-200 text-center border-r border-neutral-300"
                >
                  <span>Stock / Mín. [^v]</span>
                </th>

                {/* Eje Stock */}
                <th className="py-2.5 px-3 text-center border-r border-neutral-300">Estado de Stock</th>

                {/* Eje Vencimiento */}
                <th 
                  onClick={() => handleSort('expiry')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-neutral-200 border-r border-neutral-300"
                >
                  <span>Vencimiento [^v]</span>
                </th>

                {/* Precio */}
                <th 
                  onClick={() => handleSort('price')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-neutral-200 text-right border-r border-neutral-300"
                >
                  <span>Precio [^v]</span>
                </th>

                {/* Acciones */}
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200">
              {filteredProducts.map((prod) => {
                const stockStatus = getStockStatus(prod);

                return (
                  <tr key={prod.id} className="hover:bg-neutral-100">
                    
                    {/* Producto */}
                    <td className="py-2.5 px-3 border-r border-neutral-200">
                      <div className="font-bold text-neutral-900">{prod.name}</div>
                      <div className="text-[10px] text-neutral-600 font-normal">
                        SKU: {prod.barcode} · Unidad: {prod.unit}
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-2.5 px-3 border-r border-neutral-200">
                      <span className="text-xs text-neutral-800 font-normal">
                        {prod.category}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-2.5 px-3 text-center border-r border-neutral-200">
                      <span className="font-bold text-neutral-900">
                        {prod.stock}
                      </span>
                      <span className="text-neutral-600 text-xs font-normal"> / {prod.minStock} {prod.unit}s</span>
                    </td>

                    {/* Chip de Stock */}
                    <td className="py-2.5 px-3 text-center border-r border-neutral-200">
                      {renderStockBadge(stockStatus)}
                    </td>

                    {/* Chip de Vencimiento */}
                    <td className="py-2.5 px-3 border-r border-neutral-200">
                      {renderExpiryBadge(prod)}
                    </td>

                    {/* Precio */}
                    <td className="py-2.5 px-3 text-right font-bold text-neutral-900 border-r border-neutral-200">
                      {formatCurrency(prod.price)}
                    </td>

                    {/* Acciones */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenReceiveStock(prod)}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs border border-black"
                          title="Recibir mercadería"
                        >
                          [Recibir]
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuProductId(activeMenuProductId === prod.id ? null : prod.id)}
                            className="px-1.5 py-1 border border-neutral-600 bg-white hover:bg-neutral-200 text-xs font-bold"
                          >
                            [...]
                          </button>

                          {activeMenuProductId === prod.id && (
                            <div 
                              className="absolute right-0 mt-1 w-36 bg-white border-2 border-black py-1 z-30 text-xs text-left divide-y divide-neutral-200"
                              onClick={() => setActiveMenuProductId(null)}
                            >
                              <button
                                onClick={() => onOpenEditModal(prod)}
                                className="w-full text-left px-2.5 py-1 hover:bg-neutral-100 font-normal text-neutral-900"
                              >
                                [Editar]
                              </button>
                              <button
                                onClick={() => onOpenMermaModal(prod)}
                                className="w-full text-left px-2.5 py-1 hover:bg-neutral-100 font-normal text-neutral-900"
                              >
                                [Reportar merma]
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar "${prod.name}"?`)) {
                                    deleteProduct(prod.id);
                                  }
                                }}
                                className="w-full text-left px-2.5 py-1 hover:bg-neutral-100 font-bold text-black"
                              >
                                [Eliminar]
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
