import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
import { useBodega } from '../../context/BodegaContext';
import { formatCurrency } from '../../utils/helpers';

interface AbonoModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AbonoModal: React.FC<AbonoModalProps> = ({ customerId, isOpen, onClose }) => {
  const { customers, registerAbono } = useBodega();
  const customer = customers.find(c => c.id === customerId);

  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod>('Efectivo');
  const [vueltoNotice, setVueltoNotice] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setMethod('Efectivo');
      setVueltoNotice(null);
    }
  }, [isOpen, customerId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const numAmount = parseFloat(amount) || 0;
  const changeDue = Math.max(0, numAmount - customer.balance);
  const remaining = Math.max(0, customer.balance - numAmount);

  const handleConfirm = () => {
    if (numAmount > 0) {
      const result = registerAbono(customer.id, numAmount, method);
      if (result.changeDue > 0) {
        setVueltoNotice(result.changeDue);
      } else {
        onClose();
      }
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toFixed(2));
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
              [REGISTRAR ABONO DE FIADO]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">Pago a cuenta en el cuaderno de crédito</p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200" aria-label="Cerrar">
            [X]
          </button>
        </div>

        {/* Customer & current debt */}
        <div className="bg-neutral-100 p-2.5 border border-neutral-400 text-xs space-y-1">
          <p className="font-bold text-neutral-900">{customer.name}</p>
          <div className="flex justify-between items-baseline">
            <span className="text-neutral-600">Saldo actual en libreta:</span>
            <span className="text-sm font-bold text-neutral-900">{formatCurrency(customer.balance)}</span>
          </div>
        </div>

        {/* Notice if change is due */}
        {vueltoNotice !== null ? (
          <div className="p-3 bg-neutral-100 border-2 border-black text-center space-y-2">
            <p className="text-xs font-bold text-neutral-900">[¡DEUDA CANCELADA TOTALMENTE!]</p>
            <p className="text-xs text-neutral-700">Vuelto a entregar al vecino:</p>
            <p className="text-xl font-bold text-neutral-900">{formatCurrency(vueltoNotice)}</p>
            <button
              onClick={onClose}
              className="w-full py-2 bg-neutral-900 text-white font-bold text-xs border border-black"
            >
              [Cerrar y continuar]
            </button>
          </div>
        ) : (
          <>
            {/* Amount Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-neutral-800">
                Monto que entrega el vecino (S/):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-neutral-600">S/</span>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0.00"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-center font-bold text-base border-2 border-black outline-none"
                />
              </div>

              {/* Quick buttons */}
              <div className="grid grid-cols-4 gap-1 pt-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(10)}
                  className="py-1 border border-neutral-400 bg-white hover:bg-neutral-200"
                >
                  S/ 10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(20)}
                  className="py-1 border border-neutral-400 bg-white hover:bg-neutral-200"
                >
                  S/ 20
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(50)}
                  className="py-1 border border-neutral-400 bg-white hover:bg-neutral-200"
                >
                  S/ 50
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(customer.balance)}
                  className="py-1 border-2 border-black bg-neutral-200 hover:bg-neutral-300 text-black font-bold"
                  title="Pagar la deuda total"
                >
                  [Total]
                </button>
              </div>
            </div>

            {/* Method */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-neutral-800">
                Medio de pago:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Efectivo', label: 'Efectivo' },
                  { id: 'Yape', label: 'Yape' },
                  { id: 'Plin', label: 'Plin' }
                ].map((m) => {
                  const isSel = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as PaymentMethod)}
                      className={`py-1.5 text-xs font-bold border ${
                        isSel ? 'border-2 border-black bg-neutral-900 text-white' : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <span>[{m.label}]</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Change or remaining summary */}
            <div className="p-2 bg-neutral-100 border border-neutral-400 text-xs flex justify-between font-bold text-neutral-800 items-baseline">
              {changeDue > 0 ? (
                <>
                  <span>Vuelto a devolver:</span>
                  <span className="text-sm font-bold">{formatCurrency(changeDue)}</span>
                </>
              ) : (
                <>
                  <span>Nuevo saldo tras abono:</span>
                  <span className="text-xs font-bold">{formatCurrency(remaining)}</span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleConfirm}
                disabled={numAmount <= 0}
                className="py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs border border-black"
              >
                [Confirmar Abono]
              </button>
              <button
                onClick={onClose}
                className="py-2 border border-black bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs"
              >
                [Cancelar]
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
