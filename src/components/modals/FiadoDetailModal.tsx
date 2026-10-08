import React, { useState, useEffect } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { CustomerFiado } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface FiadoDetailModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAbono: (customer: CustomerFiado) => void;
  onOpenWhatsApp: (customer: CustomerFiado) => void;
}

export const FiadoDetailModal: React.FC<FiadoDetailModalProps> = ({
  customerId,
  isOpen,
  onClose,
  onOpenAbono,
  onOpenWhatsApp
}) => {
  const { customers, updateCreditLimit } = useBodega();
  
  const customer = customers.find(c => c.id === customerId);

  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState<number>(100);

  useEffect(() => {
    if (customer) {
      setNewLimit(customer.creditLimit);
      setIsEditingLimit(false);
    }
  }, [customer?.id, customer?.creditLimit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const handleSaveLimit = () => {
    updateCreditLimit(customer.id, newLimit);
    setIsEditingLimit(false);
  };

  const isOverLimit = customer.balance > customer.creditLimit;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border-2 border-black max-w-lg w-full p-4 flex flex-col max-h-[92vh] space-y-3">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="border border-black px-1.5 py-0.5 bg-neutral-200 text-black text-xs font-bold">
                [VECINO]
              </span>
              <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                {customer.name}
              </h3>
            </div>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              Ref: {customer.reference} · Tel: {customer.phone}
            </p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200" aria-label="Cerrar">
            [X]
          </button>
        </div>

        {/* Balance Card & Credit Limit editor */}
        <div className="bg-neutral-100 p-3 border border-neutral-400 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-bold text-neutral-700 uppercase">
                Saldo Actual en Libreta
              </span>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">
                {formatCurrency(customer.balance)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-neutral-700 uppercase">
                Tope Acordado
              </span>
              {!isEditingLimit ? (
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className="text-sm font-bold text-neutral-900">
                    {formatCurrency(customer.creditLimit)}
                  </span>
                  <button
                    onClick={() => { setNewLimit(customer.creditLimit); setIsEditingLimit(true); }}
                    className="px-1.5 py-0.5 border border-black bg-white hover:bg-neutral-200 text-[10px] font-bold"
                    title="Editar tope"
                  >
                    [Editar]
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(parseFloat(e.target.value) || 0)}
                    className="w-20 p-1 text-xs font-bold border border-black bg-white"
                  />
                  <button
                    onClick={handleSaveLimit}
                    className="px-2 py-1 bg-neutral-900 text-white text-xs font-bold border border-black"
                  >
                    [OK]
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick status notice */}
          {isOverLimit ? (
            <div className="p-2 bg-neutral-200 border border-black text-neutral-900 text-xs font-bold">
              [ALERTA: Superó su tope por {formatCurrency(customer.balance - customer.creditLimit)}. Sugerido no fiar hasta abono.]
            </div>
          ) : (
            <div className="flex justify-between text-xs text-neutral-700 font-normal">
              <span>Crédito disponible antes del tope:</span>
              <strong className="font-bold text-neutral-900">
                {formatCurrency(customer.creditLimit - customer.balance)}
              </strong>
            </div>
          )}
        </div>

        {/* Movements History Ledger */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 my-1">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-300">
            <h4 className="text-xs font-bold text-neutral-900 uppercase">
              [HISTORIAL DE MOVIMIENTOS] ({customer.movements.length})
            </h4>
          </div>

          <div className="divide-y divide-neutral-200 text-xs">
            {customer.movements.map((mov) => {
              const isAbono = mov.amount < 0;
              return (
                <div key={mov.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 border border-black bg-neutral-200 text-neutral-900 font-bold flex items-center justify-center shrink-0 text-xs">
                      {isAbono ? '[-]' : '[+]'}
                    </span>
                    <div>
                      <p className="font-bold text-neutral-900 leading-tight">
                        {mov.description}
                      </p>
                      <p className="text-[10px] text-neutral-600 font-normal">
                        {mov.date} {mov.ticketNumber ? `· ${mov.ticketNumber}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-xs text-neutral-900">
                    {isAbono ? `- ${formatCurrency(Math.abs(mov.amount))}` : `+ ${formatCurrency(mov.amount)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-black grid grid-cols-2 gap-2">
          <button
            onClick={() => { onClose(); onOpenAbono(customer); }}
            className="py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
          >
            [+ Registrar Abono]
          </button>

          <button
            onClick={() => { onClose(); onOpenWhatsApp(customer); }}
            className="py-2 bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs border border-black"
          >
            [Enviar WhatsApp]
          </button>
        </div>

      </div>
    </div>
  );
};
