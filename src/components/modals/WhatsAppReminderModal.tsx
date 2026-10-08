import React, { useState } from 'react';
import { CustomerFiado } from '../../types';
import { useBodega } from '../../context/BodegaContext';
import { formatCurrency } from '../../utils/helpers';

interface WhatsAppReminderModalProps {
  customer: CustomerFiado | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const { showToast } = useBodega();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !customer) return null;

  const reminderMessage = `Hola ${customer.name}, le saluda Don Pepe del Minimarket. Le comparto su saldo en el cuaderno de fiados al día de hoy: ${formatCurrency(customer.balance)}. Si puede pasar a dejar un abono cuando le sea posible, se lo agradeceré mucho. ¡Que tenga buen día!`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(reminderMessage);
    setCopied(true);
    showToast(`Mensaje copiado para el WhatsApp de ${customer.name}`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(reminderMessage);
    const url = `https://wa.me/51${customer.phone}?text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white border-2 border-black max-w-sm w-full p-4 space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              [AVISO DE SALDO POR WHATSAPP]
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">Tono cordial de confianza de barrio</p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200">
            [X]
          </button>
        </div>

        {/* Customer & Debt info */}
        <div className="bg-neutral-100 p-2.5 border border-neutral-400 text-xs flex justify-between items-center">
          <div>
            <p className="font-bold text-neutral-900">{customer.name}</p>
            <p className="text-[11px] text-neutral-600">Teléfono: +51 {customer.phone}</p>
          </div>
          <span className="text-sm font-bold text-neutral-900">
            {formatCurrency(customer.balance)}
          </span>
        </div>

        {/* Message preview box */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-800">
            Vista previa del mensaje:
          </label>
          <div className="bg-neutral-50 p-2.5 border border-black text-xs text-neutral-900 leading-relaxed font-sans">
            {reminderMessage}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={handleCopy}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
          >
            <span>{copied ? '[¡MENSAJE COPIADO!]' : '[COPIAR TEXTO PARA WHATSAPP]'}</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-2 bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs border border-black"
          >
            <span>[Abrir chat de WhatsApp]</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-1 text-neutral-700 font-bold text-xs hover:underline"
          >
            [Cancelar]
          </button>
        </div>

      </div>
    </div>
  );
};
