import React, { useState, useEffect } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product } from '../../types';
import { formatDateShort, getExpiryDetails, formatUnitPlural } from '../../utils/helpers';

interface ReceiveStockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMermaForProduct?: (product: Product) => void;
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({ 
  product, 
  isOpen, 
  onClose,
  onOpenMermaForProduct
}) => {
  const { receiveStock } = useBodega();

  const [quantity, setQuantity] = useState<number>(12);
  const [newExpiryDate, setNewExpiryDate] = useState<string>('');

  useEffect(() => {
    if (product) {
      setQuantity(product.minStock > 0 ? product.minStock : 12);
      setNewExpiryDate(product.expiryDate || '');
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

  const expiryInfo = getExpiryDetails(product);
  const isCurrentlyExpired = expiryInfo.status === 'Vencido';

  const handleConfirm = () => {
    if (!newExpiryDate) {
      alert('Por favor ingrese la fecha de vencimiento que figura en el empaque del nuevo lote.');
      return;
    }
    if (quantity > 0) {
      receiveStock(product.id, quantity, newExpiryDate);
      onClose();
    }
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
              [RECIBIR MERCADERÍA / REPONER]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">Ingreso de nuevo lote del proveedor</p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200" aria-label="Cerrar">
            [X]
          </button>
        </div>

        {/* Warning if current stock is expired */}
        {isCurrentlyExpired && (
          <div className="bg-neutral-100 border-2 border-black p-2.5 text-xs text-neutral-900 space-y-1">
            <span className="font-bold">[ALERTA: {product.stock} {product.unit}s VENCIDAS EN GÓNDOLA]</span>
            <p className="text-[11px] text-neutral-700 leading-snug">
              El nuevo lote no anula los productos vencidos. Recuerda retirarlos de venta registrando una merma.
            </p>
            {onOpenMermaForProduct && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenMermaForProduct(product); }}
                className="text-[11px] font-bold underline"
              >
                [Dar de baja producto vencido ahora]
              </button>
            )}
          </div>
        )}

        {/* Product details */}
        <div className="bg-neutral-100 p-2.5 border border-neutral-400 text-xs space-y-1">
          <p className="font-bold text-neutral-900">{product.name}</p>
          <div className="flex justify-between text-neutral-700 font-normal">
            <span>Stock actual: <strong className="font-bold text-neutral-900">{formatUnitPlural(product.stock, product.unit)}</strong></span>
            <span>Mínimo: {product.minStock} {product.unit}</span>
          </div>
        </div>

        {/* Quantity to add */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-800">
            Cantidad de {product.unit}s recibidas:
          </label>
          <div className="flex items-center justify-center gap-3 py-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 border border-black bg-white hover:bg-neutral-200 font-bold text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 h-10 text-center font-bold text-lg border-2 border-black outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 border border-black bg-white hover:bg-neutral-200 font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* New expiry date */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-neutral-800">
              Fecha de vencimiento en empaque:
            </label>
            <span className="text-[10px] text-black font-bold">[Requerido]</span>
          </div>
          <input
            type="date"
            required
            value={newExpiryDate}
            onChange={(e) => setNewExpiryDate(e.target.value)}
            className="w-full p-2 bg-white text-xs font-bold border border-black outline-none text-center"
          />
          {newExpiryDate && (
            <p className="text-[10px] text-neutral-600 font-normal">
              Vence el: <strong>{formatDateShort(newExpiryDate)}</strong>
            </p>
          )}
        </div>

        {/* Resulting stock preview */}
        <div className="p-2 bg-neutral-100 border border-neutral-400 text-xs text-neutral-900 flex justify-between font-bold items-center">
          <span>Nuevo stock resultante:</span>
          <span className="text-sm font-bold">
            {product.stock + quantity} {product.unit}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleConfirm}
            className="py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
          >
            [Confirmar Ingreso]
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
