import React from 'react';
import { useBodega } from '../../context/BodegaContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'settings' | 'plans';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialTab = 'settings' }) => {
  const { shift, cashier, toggleShift } = useBodega();
  const [activeSubTab, setActiveSubTab] = React.useState<'settings' | 'plans'>(initialTab);

  React.useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-white border-2 border-black max-w-lg w-full p-4 space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              {activeSubTab === 'plans' ? '[PLANES Y SUSCRIPCIÓN]' : '[AJUSTES DEL NEGOCIO]'}
            </h3>
            <p className="text-[10px] text-neutral-600 font-normal">Minimarket Don Pepe · Lima, Perú</p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200">
            [X]
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border border-black p-0.5 text-xs font-bold bg-neutral-100">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex-1 py-1 border ${
              activeSubTab === 'settings' ? 'border-black bg-neutral-900 text-white' : 'border-transparent text-neutral-800'
            }`}
          >
            [Ajustes de Bodega]
          </button>
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`flex-1 py-1 border ${
              activeSubTab === 'plans' ? 'border-black bg-neutral-900 text-white' : 'border-transparent text-neutral-800'
            }`}
          >
            [Planes & Suscripción]
          </button>
        </div>

        {activeSubTab === 'settings' ? (
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-neutral-100 border border-neutral-400 space-y-0.5">
              <span className="font-bold text-neutral-600 uppercase text-[10px]">[NEGOCIO]</span>
              <p className="font-bold text-neutral-900">Minimarket Don Pepe</p>
              <p className="text-neutral-600 text-[11px]">RUC: 10452389101 · Los Olivos, Lima</p>
            </div>

            <div className="p-2.5 bg-neutral-100 border border-neutral-400 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900">Turno y Cajero Actual</p>
                <p className="text-neutral-600 text-[11px]">Atiende: <strong>{cashier}</strong> (Turno {shift})</p>
              </div>

              <button
                onClick={toggleShift}
                className="px-3 py-1 bg-neutral-900 text-white font-bold text-xs border border-black"
              >
                [Alternar Turno]
              </button>
            </div>

            <div className="p-2.5 bg-neutral-100 border border-black text-neutral-900 space-y-0.5">
              <p className="font-bold text-xs">[ALMACENAMIENTO LOCAL OFFLINE-FIRST]</p>
              <p className="text-neutral-700 text-[11px] font-normal">
                Tu información se almacena localmente en memoria. Permite seguir operando ventas sin interrupciones de conectividad.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {/* Bodega Pro active Wireframe */}
            <div className="p-3 border-2 border-black bg-neutral-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="border border-black bg-black text-white text-[10px] font-bold px-1.5 py-0.5">
                  [PLAN PRO ACTIVO]
                </span>
                <span className="font-bold text-xs text-neutral-900">S/ 39 / mes</span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Bodega Pro (Ilimitado)</h4>
              <ul className="space-y-0.5 text-neutral-800 text-[11px] font-normal">
                <li>• Cuaderno de fiados con avisos por WhatsApp</li>
                <li>• Modo sin internet para caídas de señal</li>
                <li>• Alertas automáticas de vencimiento a 7 días</li>
                <li>• Soporte en español para bodegueros</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-black flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-neutral-900 text-white font-bold text-xs border border-black"
          >
            [Listo]
          </button>
        </div>

      </div>
    </div>
  );
};
