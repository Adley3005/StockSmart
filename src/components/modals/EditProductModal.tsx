import React, { useState, useEffect } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product } from '../../types';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, isOpen, onClose }) => {
  const { editProduct } = useBodega();

  const [price, setPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [expiryDate, setExpiryDate] = useState<string>('');

  useEffect(() => {
    if (product) {
      setPrice(product.price);
      setCost(product.cost);
      setMinStock(product.minStock);
      setExpiryDate(product.expiryDate || '');
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleSave = () => {
    editProduct(product.id, {
      price,
      cost,
      minStock,
      expiryDate
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border-2 border-black max-w-sm w-full p-4 space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              [EDITAR PRODUCTO]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">Ajustar precio, costo y mínimos</p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200" aria-label="Cerrar">
            [X]
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block font-bold text-neutral-800 mb-0.5">Producto:</label>
            <p className="font-bold text-neutral-900 bg-neutral-100 p-2 border border-neutral-400">
              {product.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-neutral-800 mb-0.5">Precio Venta (S/):</label>
              <input
                type="number"
                step="0.10"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2 font-bold border border-black outline-none bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-800 mb-0.5">Costo Proveedor (S/):</label>
              <input
                type="number"
                step="0.10"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full p-2 font-bold border border-black outline-none bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-neutral-800 mb-0.5">Stock Mínimo ({product.unit}s):</label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 1)}
                className="w-full p-2 font-bold border border-black outline-none bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-800 mb-0.5">Fecha Vencimiento:</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-1.5 text-xs font-bold border border-black outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSave}
            className="py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
          >
            [Guardar Cambios]
          </button>
          <button
            onClick={onClose}
            className="py-2 border border-black bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs"
          >
            [Cancelar]
          </button>
        </div>

      </div>
    </div>
  );
};
