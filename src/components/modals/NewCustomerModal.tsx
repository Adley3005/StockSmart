import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer } = useBodega();

  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addCustomer(
        name.trim(),
        reference.trim() || 'Vecino de la zona',
        phone.trim() || '999000111',
        creditLimit || 100
      );
      setName('');
      setReference('');
      setPhone('');
      setCreditLimit(100);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white border-2 border-black max-w-sm w-full p-4 space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              [ANOTAR VECINO EN CUADERNO]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">Abrir cuenta de fiado con tope</p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200">
            [X]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="block font-bold text-neutral-800 mb-0.5">
              Nombre o apodo del vecino:
            </label>
            <input
              type="text"
              placeholder="Ej. Sra. Juana de la esquina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 font-bold border border-black outline-none bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-800 mb-0.5">
              Referencia de casa / barrio:
            </label>
            <input
              type="text"
              placeholder="Ej. Frente a la posta médica, Mz C"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full p-2 border border-black outline-none bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-800 mb-0.5">
              Celular (para recordatorios WhatsApp):
            </label>
            <input
              type="tel"
              placeholder="Ej. 987654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-black outline-none bg-white font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-800 mb-0.5">
              Tope máximo sugerido de fiado (S/):
            </label>
            <input
              type="number"
              step="10"
              value={creditLimit}
              onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
              className="w-full p-2 font-bold text-center border border-black outline-none bg-white font-mono"
            />
            <p className="text-[10px] text-neutral-600 mt-0.5">
              Si supera este monto, el sistema emitirá una etiqueta [ALERTA: TOPE EXCEDIDO].
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="submit"
              className="py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
            >
              [Guardar en Libreta]
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 border border-black bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs"
            >
              [Cancelar]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
