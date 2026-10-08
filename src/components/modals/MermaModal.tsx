import React, { useState, useEffect } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product } from '../../types';
import { formatUnitPlural } from '../../utils/helpers';

interface MermaModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MermaModal: React.FC<MermaModalProps> = ({ product, isOpen, onClose }) => {
  const { reportMerma } = useBodega();
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Vencido en góndola');

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setReason('Vencido en góndola');
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

  const handleConfirm = () => {
    if (quantity > 0) {
      reportMerma(product.id, quantity, reason);
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
              [REPORTAR MERMA / BAJA]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">Descuenta del stock por daño o vencimiento</p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200" aria-label="Cerrar">
            [X]
          </button>
        </div>

        {/* Product details */}
        <div className="bg-neutral-100 p-2.5 border border-neutral-400 text-xs">
          <p className="font-bold text-neutral-900">{product.name}</p>
          <p className="text-neutral-700 mt-0.5">
            Stock actual: <strong className="font-bold">{formatUnitPlural(product.stock, product.unit)}</strong>
          </p>
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-800">
            Cantidad de {product.unit}s a dar de baja:
          </label>
          <input
            type="number"
            min="1"
            max={Math.max(1, product.stock)}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 text-center font-bold text-base border-2 border-black outline-none bg-white"
          />
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-800">
            Motivo de la merma:
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 text-xs font-bold bg-white border border-black outline-none"
          >
            <option value="Vencido en góndola">Vencido en góndola</option>
            <option value="Empaque roto o derrame">Empaque roto o derrame</option>
            <option value="Lata abollada / golpeada">Lata abollada / golpeada</option>
            <option value="Consumo del bodeguero">Consumo del bodeguero</option>
            <option value="Devolución a proveedor rechazada">Devolución a proveedor rechazada</option>
          </select>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleConfirm}
            className="py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
          >
            [Confirmar Baja]
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
