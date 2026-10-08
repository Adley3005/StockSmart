import React, { useState, useMemo } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { CustomerFiado } from '../../types';
import { formatCurrency, maskPhone } from '../../utils/helpers';

interface FiadosViewProps {
  onOpenAbonoModal: (customer: CustomerFiado) => void;
  onOpenWhatsAppReminder: (customer: CustomerFiado) => void;
  onOpenCustomerDetail: (customer: CustomerFiado) => void;
  onOpenNewCustomerModal: () => void;
}

export const FiadosView: React.FC<FiadosViewProps> = ({
  onOpenAbonoModal,
  onOpenWhatsAppReminder,
  onOpenCustomerDetail,
  onOpenNewCustomerModal
}) => {
  const { customers, fiadosSummary } = useBodega();

  // Search input
  const [searchQuery, setSearchQuery] = useState('');

  // Unmasked phone toggles
  const [unmaskedPhones, setUnmaskedPhones] = useState<Record<string, boolean>>({});

  const togglePhoneMask = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    setUnmaskedPhones(prev => ({ ...prev, [customerId]: !prev[customerId] }));
  };

  // Default ordering: highest risk first (% of credit limit or over limit)
  const sortedCustomers = useMemo(() => {
    return [...customers]
      .filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.reference.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const ratioA = a.balance / Math.max(1, a.creditLimit);
        const ratioB = b.balance / Math.max(1, b.creditLimit);
        return ratioB - ratioA;
      });
  }, [customers, searchQuery]);

  return (
    <div className="space-y-4 pb-12 select-none">
      
      {/* 1. RESUMEN DEL CUADERNO WIREFRAME */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Total Fiado por Cobrar */}
        <div className="bg-neutral-900 text-white p-4 border border-black flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide">
              Total Fiado por Cobrar
            </span>
            <p className="text-2xl font-bold text-white mt-1">
              {formatCurrency(fiadosSummary.totalDebt)}
            </p>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2 font-normal">
            Dinero pendiente de cobro vecinal
          </p>
        </div>

        {/* Vecinos con Deuda */}
        <div className="bg-white border border-neutral-400 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
              Vecinos con Saldo
            </span>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {fiadosSummary.debtorCount} {fiadosSummary.debtorCount === 1 ? 'vecino' : 'vecinos'}
            </p>
          </div>
          <p className="text-[10px] text-neutral-600 mt-2 font-normal">
            Libretas con compras pendientes
          </p>
        </div>

        {/* Vecinos que superan su tope */}
        <div className="bg-neutral-100 border-2 border-black p-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-wide">
              [ALERTA] Superan su Tope
            </span>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {fiadosSummary.overLimitCount} {fiadosSummary.overLimitCount === 1 ? 'vecino' : 'vecinos'}
            </p>
          </div>
          <p className="text-[10px] text-neutral-800 font-bold mt-2">
            No fiar más hasta registrar abonos
          </p>
        </div>

      </div>

      {/* 2. BARRA DE ACCIÓN Y BUSCADOR WIREFRAME */}
      <div className="bg-white p-3 border border-neutral-400 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="[Buscar por nombre de vecino o referencia]..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white text-xs font-normal border border-black outline-none"
          />
        </div>

        {/* Anotar nuevo vecino */}
        <button
          onClick={onOpenNewCustomerModal}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
        >
          <span>[+ Anotar nuevo vecino en cuaderno]</span>
        </button>

      </div>

      {/* 3. LISTA DE TARJETAS POR VECINO WIREFRAME */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs text-neutral-600 font-normal">
          <span>Orden: mayor porcentaje de saldo respecto al tope de crédito</span>
          <span>{sortedCustomers.length} vecinos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedCustomers.map((customer) => {
            const isOverLimit = customer.balance > customer.creditLimit;
            const usagePercent = Math.min(100, Math.round((customer.balance / Math.max(1, customer.creditLimit)) * 100));
            const isPhoneRevealed = unmaskedPhones[customer.id] || false;

            return (
              <div
                key={customer.id}
                onClick={() => onOpenCustomerDetail(customer)}
                className={`bg-white p-4 border transition-none cursor-pointer flex flex-col justify-between space-y-3 ${
                  isOverLimit
                    ? 'border-2 border-black bg-neutral-100'
                    : 'border border-neutral-400 hover:border-black'
                }`}
              >
                
                {/* Header: Nombre y referencia */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                          {customer.name}
                        </h3>
                        {isOverLimit && (
                          <span className="border border-black bg-neutral-300 text-black text-[9px] font-bold px-1">
                            [TOPE EXCEDIDO]
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 font-normal mt-0.5">
                        Ref: {customer.reference}
                      </p>
                    </div>

                    {/* Teléfono Enmascarado */}
                    <div 
                      onClick={(e) => togglePhoneMask(e, customer.id)}
                      className="px-2 py-0.5 border border-black bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-bold transition-none shrink-0"
                      title="Ver / ocultar teléfono"
                    >
                      <span>{isPhoneRevealed ? customer.phone : maskPhone(customer.phone)}</span>
                      <span className="ml-1 text-[10px]">[{isPhoneRevealed ? 'Ocultar' : 'Ver'}]</span>
                    </div>
                  </div>
                </div>

                {/* Saldo y Barra de uso de tope */}
                <div className="space-y-1.5 bg-neutral-50 p-2.5 border border-neutral-300">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-neutral-700">
                      Saldo adeudado:
                    </span>
                    <span className="text-lg font-bold text-neutral-900">
                      {formatCurrency(customer.balance)}
                    </span>
                  </div>

                  {/* Barra de progreso de uso del tope Wireframe */}
                  <div className="space-y-1">
                    <div className="w-full bg-neutral-200 border border-neutral-400 h-2">
                      <div
                        className="h-full bg-neutral-800"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-600 font-normal">
                        Tope: <strong className="font-bold">{formatCurrency(customer.creditLimit)}</strong>
                      </span>
                      <span className="font-bold text-neutral-900">
                        {usagePercent}% usado {isOverLimit && '— [ALERTA: SUPERÓ TOPE]'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Días desde último abono */}
                <div className="flex items-center justify-between text-xs text-neutral-700 font-normal px-0.5">
                  <span>
                    {customer.lastPaymentDaysAgo === 0
                      ? 'Abonó hoy'
                      : `Último abono hace ${customer.lastPaymentDaysAgo} días`}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenCustomerDetail(customer); }}
                    className="font-bold text-neutral-900 underline"
                  >
                    [Ver libreta ({customer.movements.length})]
                  </button>
                </div>

                {/* Acciones principales de la tarjeta */}
                <div className="pt-2 border-t border-neutral-300 flex flex-col sm:flex-row items-center gap-2">
                  
                  {/* Registrar abono */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenAbonoModal(customer); }}
                    className="w-full sm:flex-1 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-black"
                  >
                    [+ Registrar abono]
                  </button>

                  {/* Recordatorio por WhatsApp */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenWhatsAppReminder(customer); }}
                    className="w-full sm:flex-1 py-1.5 bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs border border-black"
                  >
                    [Mensaje WhatsApp]
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
