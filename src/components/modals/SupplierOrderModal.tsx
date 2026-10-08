import React, { useState, useEffect, useMemo } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { calculateSuggestedOrderQty, formatLongDate, formatUnitPlural } from '../../utils/helpers';

interface SupplierOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierOrderModal: React.FC<SupplierOrderModalProps> = ({ isOpen, onClose }) => {
  const { products, showToast } = useBodega();

  // Supplier items computed on the fly
  const liveOrderItems = useMemo(() => {
    return products
      .filter((p) => p.stock < p.minStock)
      .map((p) => ({
        product: p,
        suggestedQty: calculateSuggestedOrderQty(p)
      }))
      .sort((a, b) => a.product.stock - b.product.stock);
  }, [products]);

  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [supplierPhone, setSupplierPhone] = useState<string>('987112233');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, number> = {};
      liveOrderItems.forEach(item => {
        initial[item.product.id] = item.suggestedQty;
      });
      setOrderQuantities(initial);
      setCopied(false);
    }
  }, [isOpen, liveOrderItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQtyChange = (productId: string, delta: number) => {
    setOrderQuantities(prev => {
      const current = prev[productId] !== undefined ? prev[productId] : 1;
      return {
        ...prev,
        [productId]: Math.max(0, current + delta)
      };
    });
  };

  const generateWhatsAppMessage = () => {
    let msg = `*PEDIDO PARA PROVEEDOR - MINIMARKET DON PEPE*\n`;
    msg += `Fecha: ${formatLongDate()}\n`;
    msg += `Por favor cotizar y programar despacho de los siguientes productos:\n\n`;

    let itemCounter = 1;
    liveOrderItems.forEach((item) => {
      const qty = orderQuantities[item.product.id] ?? item.suggestedQty;
      if (qty > 0) {
        msg += `${itemCounter}. *${item.product.name}*\n`;
        msg += `   • Pedir: *${formatUnitPlural(qty, item.product.unit)}*\n`;
        msg += `   • Stock actual en bodega: ${formatUnitPlural(item.product.stock, item.product.unit)}\n\n`;
        itemCounter++;
      }
    });

    msg += `Atentamente, Don Pepe (Minimarket Don Pepe). ¡Muchas gracias!`;
    return msg;
  };

  const handleCopy = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    showToast('¡Texto copiado para el proveedor!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const cleanPhone = supplierPhone.replace(/\D/g, '');
    const phoneParam = cleanPhone ? `51${cleanPhone.slice(-9)}` : '';
    const url = phoneParam 
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border-2 border-black max-w-xl w-full p-4 flex flex-col max-h-[92vh] space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              [ARMAR PEDIDO AL PROVEEDOR]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">
              {liveOrderItems.length} productos agotados o por debajo del mínimo
            </p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200" aria-label="Cerrar">
            [X]
          </button>
        </div>

        {/* Supplier Phone Input */}
        <div className="pt-1 pb-1 flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-neutral-800">
            Teléfono proveedor:
          </span>
          <div className="relative w-40">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-600 font-bold text-[11px]">+51</span>
            <input
              type="tel"
              value={supplierPhone}
              onChange={(e) => setSupplierPhone(e.target.value)}
              placeholder="987654321"
              className="w-full pl-8 pr-2 py-1 text-xs font-bold border border-black outline-none bg-white"
            />
          </div>
        </div>

        {/* List of items to order */}
        <div className="my-1 overflow-y-auto flex-1 space-y-2 pr-1">
          {liveOrderItems.length === 0 ? (
            <div className="py-8 text-center text-neutral-600 space-y-1 border border-neutral-400 p-4">
              <p className="text-xs font-bold text-neutral-900">[SIN PRODUCTOS PENDIENTES]</p>
              <p className="text-[11px] font-normal">Todo el inventario supera los niveles mínimos de seguridad.</p>
            </div>
          ) : (
            liveOrderItems.map(({ product, suggestedQty }) => {
              const currentQty = orderQuantities[product.id] ?? suggestedQty;
              const isAgotado = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className="p-2.5 border border-neutral-400 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">
                        {product.name}
                      </span>
                      <span className="border border-black bg-neutral-200 text-black text-[9px] font-bold px-1">
                        {isAgotado ? '[AGOTADO: 0]' : '[STOCK BAJO]'}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Stock: <strong className="font-bold text-neutral-900">{formatUnitPlural(product.stock, product.unit)}</strong> (Mínimo: {product.minStock})
                    </p>
                  </div>

                  {/* Quantity editor */}
                  <div className="flex items-center gap-1.5 bg-neutral-100 px-2 py-1 border border-black self-end sm:self-auto text-xs">
                    <span className="text-[10px] font-bold text-neutral-700">Pedir:</span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product.id, -1)}
                      className="w-6 h-6 border border-black bg-white hover:bg-neutral-200 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-neutral-900">
                      {currentQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(product.id, 1)}
                      className="w-6 h-6 border border-black bg-white hover:bg-neutral-200 font-bold text-xs"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-neutral-600 font-normal">{product.unit}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom actions */}
        <div className="pt-2 border-t border-black flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleOpenWhatsApp}
            disabled={liveOrderItems.length === 0}
            className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black disabled:opacity-50"
          >
            [ENVIAR POR WHATSAPP]
          </button>

          <button
            onClick={handleCopy}
            disabled={liveOrderItems.length === 0}
            className="py-2 px-3 bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs border border-black disabled:opacity-50"
          >
            <span>{copied ? '[¡Copiado!]' : '[Copiar texto]'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-3 border border-black bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs"
          >
            [Cerrar]
          </button>
        </div>

      </div>
    </div>
  );
};
