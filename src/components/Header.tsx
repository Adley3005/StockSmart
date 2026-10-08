import React, { useState } from 'react';
import { useBodega } from '../context/BodegaContext';

interface HeaderProps {
  onOpenDesignTokens: () => void;
  onOpenSettings: () => void;
  onOpenPlans: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDesignTokens,
  onOpenSettings,
  onOpenPlans
}) => {
  const { 
    isOnline, 
    toggleOnline, 
    pendingSyncCount, 
    syncOfflineData, 
    shift, 
    toggleShift, 
    currentDateFormatted,
    activeTab,
    setActiveTab
  } = useBodega();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeTabTitles: Record<string, { title: string; subtitle: string }> = {
    hoy: { title: 'HOY (DASHBOARD)', subtitle: 'Acciones prioritarias y resumen de ventas' },
    vender: { title: 'VENDER (MOSTRADOR)', subtitle: 'Cobro rápido, lector de códigos y fiados' },
    productos: { title: 'PRODUCTOS Y STOCK', subtitle: 'Catálogo completo, alertas de quiebre y mermas' },
    fiados: { title: 'CUADERNO DE FIADOS', subtitle: 'Límites de crédito vecinal y registro de abonos' }
  };

  const currentViewInfo = activeTabTitles[activeTab] || activeTabTitles.hoy;

  return (
    <header className="bg-white text-neutral-900 sticky top-9 z-30 border-b border-black md:pl-64 lg:pl-72 w-full">
      {/* Top Wireframe Banner if Offline */}
      {!isOnline && (
        <div className="bg-neutral-300 text-neutral-900 border-b border-black px-4 py-1 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2 w-full">
            <span className="border border-black px-1 bg-white text-[10px]">[OFFLINE]</span>
            <span className="truncate">
              <strong>Modo Sin Internet:</strong> Ventas guardadas localmente.
            </span>
            <span className="ml-auto bg-neutral-900 text-white text-[10px] px-2 py-0.5 border border-black shrink-0 font-bold">
              {pendingSyncCount} PENDIENTES
            </span>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="w-full px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Mobile: Bodega Branding (< MD) */}
        <div 
          onClick={() => setActiveTab('hoy')} 
          className="md:hidden flex items-center gap-2 cursor-pointer select-none"
          role="button"
          tabIndex={0}
        >
          <div className="w-8 h-8 border border-black bg-neutral-200 flex items-center justify-center text-xs font-bold">
            [■]
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-neutral-900">
                StockSmart
              </span>
              <span className="border border-black bg-neutral-100 text-[10px] font-bold px-1">
                [BODEGA]
              </span>
            </div>
            <div className="text-[11px] text-neutral-600 font-normal">
              Don Pepe · {currentDateFormatted}
            </div>
          </div>
        </div>

        {/* Desktop: Active Module Context (>= MD) */}
        <div className="hidden md:flex items-center gap-3 select-none">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-neutral-900">
                {currentViewInfo.title}
              </h1>
              <span className="border border-neutral-700 bg-neutral-200 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5 uppercase">
                [ACTIVO]
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-normal">
              {currentViewInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2">
          
          {/* Connection Toggle (En línea / Sin internet) */}
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border border-black select-none ${
              isOnline ? 'bg-white hover:bg-neutral-200 text-neutral-900' : 'bg-neutral-300 text-neutral-900'
            }`}
            title="Toca para alternar modo online / sin internet"
          >
            <span>{isOnline ? '[ESTADO: ONLINE]' : '[ESTADO: OFFLINE]'}</span>
            {pendingSyncCount > 0 && isOnline && (
              <span 
                onClick={(e) => { e.stopPropagation(); syncOfflineData(); }}
                className="bg-black text-white px-1 text-[10px] font-bold ml-1"
                title="Sincronizar ahora"
              >
                [SYNC: {pendingSyncCount}]
              </span>
            )}
          </button>

          {/* Shift Button */}
          <button
            onClick={toggleShift}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-normal bg-white hover:bg-neutral-200 text-neutral-900 border border-neutral-700"
            title="Cambiar turno de atención"
          >
            <span>[TURNO: {shift.toUpperCase()}]</span>
          </button>

          {/* Avatar Dropdown for Account, Plans, Settings & Tokens */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-neutral-200 border border-black text-xs font-bold"
              aria-label="Menú de Don Pepe"
            >
              <span className="w-5 h-5 border border-black bg-neutral-200 flex items-center justify-center text-[10px] font-bold">
                DP
              </span>
              <span className="hidden sm:inline">Don Pepe</span>
              <span className="text-[10px]">[v]</span>
            </button>

            {/* Dropdown Menu Wireframe */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-1 w-56 bg-white border-2 border-black py-1 z-50 text-xs text-neutral-900 divide-y divide-neutral-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="px-3 py-2 bg-neutral-100">
                  <p className="font-bold text-neutral-900">Don Pepe</p>
                  <p className="text-neutral-600 text-[11px]">Dueño · Turno {shift}</p>
                  <p className="text-neutral-800 text-[10px] font-bold mt-0.5">[PLAN BODEGA PRO]</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={onOpenPlans}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-200 flex items-center gap-2 font-normal text-neutral-900"
                  >
                    <span>[+] Planes y Suscripción</span>
                  </button>

                  <button
                    onClick={onOpenDesignTokens}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-200 flex items-center gap-2 font-normal text-neutral-900"
                  >
                    <span>[#] Guía de Tokens & Wireframes</span>
                  </button>

                  <button
                    onClick={onOpenSettings}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-200 flex items-center gap-2 font-normal text-neutral-900"
                  >
                    <span>[*] Ajustes de la Bodega</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={toggleShift}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-200 flex items-center gap-2 text-neutral-700 font-normal"
                  >
                    <span>[&gt;] Cambiar a Turno {shift === 'Mañana' ? 'Tarde' : 'Mañana'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
