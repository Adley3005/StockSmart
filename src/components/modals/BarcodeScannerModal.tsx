import React, { useState, useEffect } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose }) => {
  const { products, addToCart, showToast } = useBodega();
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Auto simulate scan after 1.4s
  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setDetectedProduct(null);
      
      const targetProd = products.find(p => p.id === 'prod-23') || products[0];

      const timer = setTimeout(() => {
        setDetectedProduct(targetProd);
        setIsScanning(false);
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handleAddAndClose = () => {
    if (detectedProduct) {
      addToCart(detectedProduct, 1);
      showToast(`Escaneado: +1 ${detectedProduct.name} al ticket`, 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white border-2 border-black max-w-sm w-full p-4 text-neutral-900 text-center relative space-y-3">
        
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-xs font-bold border border-black px-1.5 py-0.5 hover:bg-neutral-200"
        >
          [X]
        </button>

        <div className="text-left pb-1 border-b border-black">
          <h3 className="text-xs font-bold text-neutral-900 uppercase">[SIMULADOR DE ESCÁNER DE BARRAS]</h3>
          <p className="text-[10px] text-neutral-600 font-normal">Cámara de mostrador / lector óptico</p>
        </div>

        {/* Viewfinder simulator Wireframe */}
        <div className="h-40 w-full bg-neutral-100 border-2 border-dashed border-black flex flex-col items-center justify-center p-3 space-y-2">
          {/* Barcode artwork */}
          <div className="font-mono text-xl tracking-widest text-black font-bold select-none">
            |||| | | ||| |||| |
          </div>

          <div className="text-xs font-bold text-neutral-900">
            {isScanning ? (
              <span>[ESCANEANDO CÓDIGO EAN-13...]</span>
            ) : detectedProduct ? (
              <span>[✓ CÓDIGO RECONOCIDO: {detectedProduct.barcode}]</span>
            ) : null}
          </div>
        </div>

        {/* Detected Product Result */}
        {detectedProduct && (
          <div className="bg-neutral-100 p-2.5 border border-black text-left space-y-1">
            <span className="text-[10px] font-bold text-neutral-800 uppercase">
              [PRODUCTO IDENTIFICADO]
            </span>
            <p className="text-xs font-bold text-neutral-900">{detectedProduct.name}</p>
            <div className="flex justify-between items-baseline pt-0.5">
              <span className="text-[11px] text-neutral-600">Stock: {detectedProduct.stock} {detectedProduct.unit}s</span>
              <span className="text-sm font-bold text-neutral-900">{formatCurrency(detectedProduct.price)}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-1.5 pt-1">
          {detectedProduct ? (
            <button
              onClick={handleAddAndClose}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
            >
              [+ AGREGAR AL TICKET Y CONTINUAR]
            </button>
          ) : (
            <p className="text-[11px] text-neutral-600 font-normal">
              Apuntando sensor óptico al producto...
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full py-1.5 border border-black bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs"
          >
            [Cerrar Escáner]
          </button>
        </div>

      </div>
    </div>
  );
};
