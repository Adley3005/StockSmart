import React, { useState, useEffect } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { ProductCategory } from '../../types';
import { formatUnitPlural } from '../../utils/helpers';

interface StockCountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockCountModal: React.FC<StockCountModalProps> = ({ isOpen, onClose }) => {
  const { products, adjustStockCount } = useBodega();

  const categories: ProductCategory[] = ['Abarrotes', 'Lácteos', 'Bebidas', 'Snacks', 'Limpieza'];

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [isReviewStep, setIsReviewStep] = useState<boolean>(false);

  // Store user-entered counts only for touched/modified items
  const [touchedCounts, setTouchedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setCurrentCategoryIndex(0);
      setIsReviewStep(false);
      setTouchedCounts({});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategory = categories[currentCategoryIndex];
  const categoryProducts = products.filter(p => p.category === currentCategory);

  const handleCountChange = (productId: string, val: number) => {
    setTouchedCounts(prev => ({
      ...prev,
      [productId]: Math.max(0, val)
    }));
  };

  const differences = Object.entries(touchedCounts)
    .map(([productId, physicalCount]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      const countNum = Number(physicalCount);
      const diff = countNum - product.stock;
      return {
        product,
        systemStock: product.stock,
        physicalCount: countNum,
        diff
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null && item.diff !== 0);

  const handleNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    } else {
      setIsReviewStep(true);
    }
  };

  const handlePrevCategory = () => {
    if (isReviewStep) {
      setIsReviewStep(false);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  const handleConfirmAdjust = () => {
    const adjustments = Object.entries(touchedCounts)
      .map(([productId, physicalCount]) => ({ productId, physicalCount }))
      .filter(adj => {
        const prod = products.find(p => p.id === adj.productId);
        return prod && prod.stock !== adj.physicalCount;
      });

    adjustStockCount(adjustments);
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
              [CONTAR STOCK FÍSICO GUIADO]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">
              {isReviewStep ? 'Paso final: Resumen de diferencias' : `Paso ${currentCategoryIndex + 1} de 5: Pasillo de ${currentCategory}`}
            </p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200" aria-label="Cerrar">
            [X]
          </button>
        </div>

        {/* Step Progress Dots Wireframe */}
        <div className="py-1 flex items-center justify-between gap-1 text-xs">
          {categories.map((cat, idx) => (
            <div
              key={cat}
              className={`flex-1 text-center py-1 font-bold text-[10px] truncate border ${
                !isReviewStep && currentCategoryIndex === idx
                  ? 'border-2 border-black bg-neutral-900 text-white'
                  : idx < currentCategoryIndex || isReviewStep
                  ? 'border border-neutral-600 bg-neutral-200 text-neutral-900'
                  : 'border border-neutral-300 bg-white text-neutral-500 font-normal'
              }`}
            >
              {cat}
            </div>
          ))}
          <div
            className={`flex-1 text-center py-1 font-bold text-[10px] truncate border ${
              isReviewStep 
                ? 'border-2 border-black bg-neutral-900 text-white' 
                : 'border border-neutral-300 bg-white text-neutral-500 font-normal'
            }`}
          >
            Resumen
          </div>
        </div>

        {/* Modal Body */}
        <div className="my-1 overflow-y-auto flex-1 space-y-2 pr-1">
          {!isReviewStep ? (
            <div className="space-y-1.5">
              <div className="bg-neutral-100 p-2.5 border border-neutral-400 text-xs">
                <p className="font-bold text-neutral-900">
                  Pasillo activo: {currentCategory} ({categoryProducts.length} productos)
                </p>
                <p className="text-[10px] text-neutral-600 mt-0.5">
                  Modifica solo si la cantidad física en góndola difiere del sistema.
                </p>
              </div>

              {categoryProducts.map((p) => {
                const isTouched = touchedCounts[p.id] !== undefined;
                const currentPhysical = isTouched ? touchedCounts[p.id] : p.stock;
                const diff = currentPhysical - p.stock;

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 border flex items-center justify-between gap-2 ${
                      isTouched ? 'border-2 border-black bg-neutral-100' : 'border border-neutral-400 bg-white'
                    }`}
                  >
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-neutral-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-neutral-600 font-normal">
                        Sistema: <strong className="font-bold">{formatUnitPlural(p.stock, p.unit)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCountChange(p.id, currentPhysical - 1)}
                          className="w-8 h-8 border border-black bg-white hover:bg-neutral-200 font-bold text-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentPhysical}
                          onChange={(e) => handleCountChange(p.id, parseInt(e.target.value) || 0)}
                          className="w-14 h-8 text-center font-bold text-xs border border-black"
                        />
                        <button
                          type="button"
                          onClick={() => handleCountChange(p.id, currentPhysical + 1)}
                          className="w-8 h-8 border border-black bg-white hover:bg-neutral-200 font-bold text-sm"
                        >
                          +
                        </button>
                      </div>

                      {diff !== 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 border border-black bg-neutral-200">
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Review Differences Step */
            <div className="space-y-2">
              <div className="bg-neutral-900 text-white p-3 border border-black space-y-1">
                <p className="text-xs font-bold text-white uppercase">
                  [RESUMEN DE AJUSTES FÍSICOS]
                </p>
                <p className="text-[11px] text-neutral-300 font-normal">
                  {differences.length === 0
                    ? 'No modificaste ningún producto; tu inventario coincide con el sistema.'
                    : `Se ajustarán ${differences.length} productos con discrepancias físicas.`}
                </p>
              </div>

              {differences.length > 0 ? (
                <div className="space-y-1.5">
                  {differences.map(({ product, systemStock, physicalCount, diff }) => (
                    <div
                      key={product.id}
                      className="p-2.5 bg-white border border-neutral-400 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-neutral-900">{product.name}</p>
                        <p className="text-neutral-600 text-[10px]">
                          Sistema: {systemStock} → Conteo real: {physicalCount} {product.unit}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 border border-black bg-neutral-200 font-bold text-[10px]">
                        {diff > 0 ? `[+${diff} SOBRANTE]` : `[${diff} FALTANTE]`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-neutral-900 bg-neutral-100 border border-neutral-400">
                  <p className="font-bold text-xs">[SIN DIFERENCIAS DETECTADAS]</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">No se alterará ninguna venta ni stock del día.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-black flex items-center justify-between gap-2">
          <button
            onClick={handlePrevCategory}
            disabled={currentCategoryIndex === 0 && !isReviewStep}
            className="py-2 px-3 border border-black bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs disabled:opacity-40"
          >
            [&lt; Atrás]
          </button>

          {!isReviewStep ? (
            <button
              onClick={handleNextCategory}
              className="py-2 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
            >
              <span>{currentCategoryIndex === categories.length - 1 ? '[Revisar Diferencias &gt;]' : '[Siguiente Pasillo &gt;]'}</span>
            </button>
          ) : (
            <button
              onClick={handleConfirmAdjust}
              className="py-2 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
            >
              [CONFIRMAR AJUSTES DE STOCK]
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
