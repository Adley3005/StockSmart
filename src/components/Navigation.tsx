import React from 'react';
import { useBodega } from '../context/BodegaContext';
import { ActiveTab } from '../types';

interface NavigationProps {
  onOpenSupplierModal: () => void;
  onOpenStockCount?: () => void;
  onOpenDesignTokens: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenSupplierModal,
  onOpenStockCount,
  onOpenDesignTokens
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    cartItemsCount, 
    stockCounts, 
    expiryCounts,
    fiadosSummary,
    currentDateFormatted
  } = useBodega();

  // Urgent inventory alerts count (Agotados + Vencidos)
  const urgentInventoryCount = stockCounts.agotados + expiryCounts.vencidos;

  const tabs: { id: ActiveTab; label: string; shortLabel: string; symbol: string; badge?: number | string; subtitle: string }[] = [
    {
      id: 'hoy',
      label: 'HOY',
      shortLabel: 'Hoy',
      symbol: '[HOY]',
      subtitle: 'Dashboard y Alertas'
    },
    {
      id: 'vender',
      label: 'VENDER',
      shortLabel: 'Vender',
      symbol: '[VENDER]',
      subtitle: 'Mostrador y Cobro',
      badge: cartItemsCount > 0 ? `(${cartItemsCount})` : undefined
    },
    {
      id: 'productos',
      label: 'PRODUCTOS',
      shortLabel: 'Stock',
      symbol: '[STOCK]',
      subtitle: 'Inventario y Mermas',
      badge: urgentInventoryCount > 0 ? `[ALERTA: ${urgentInventoryCount}]` : undefined
    },
    {
      id: 'fiados',
      label: 'FIADOS',
      shortLabel: 'Fiados',
      symbol: '[FIADOS]',
      subtitle: 'Cuaderno de Créditos',
      badge: fiadosSummary.overLimitCount > 0 ? `[TOPE: ${fiadosSummary.overLimitCount}]` : undefined
    }
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION BAR (< MD)                           */}
      {/* Rectángulos simples con borde y texto                        */}
      {/* ============================================================ */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white text-neutral-900 border-t border-black z-40 px-1.5 py-1.5 flex justify-around items-stretch gap-1 select-none"
        aria-label="Navegación principal móvil"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 text-xs border ${
                isActive
                  ? 'border-2 border-black bg-neutral-900 text-white font-bold'
                  : 'border-neutral-400 bg-white text-neutral-800 font-normal hover:bg-neutral-100'
              }`}
            >
              <span className="text-[10px] font-bold">{tab.symbol}</span>
              <span className="text-[11px] leading-tight">
                {tab.shortLabel} {tab.badge && <span className="text-[9px] underline ml-0.5">{tab.badge}</span>}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR NAVIGATION (>= MD)                           */}
      {/* ============================================================ */}
      <aside 
        className="hidden md:flex flex-col w-64 lg:w-72 bg-neutral-50 border-r border-black text-neutral-900 fixed top-9 bottom-0 left-0 z-40 justify-between select-none overflow-y-auto"
        aria-label="Menú principal de escritorio"
      >
        <div className="p-3.5 space-y-5">
          
          {/* Logo & Store Header Wireframe */}
          <div 
            onClick={() => setActiveTab('hoy')}
            className="flex items-center gap-3 p-2.5 border border-black bg-white cursor-pointer hover:bg-neutral-100"
            role="button"
            tabIndex={0}
            title="Ir al inicio"
          >
            <div className="w-10 h-10 border border-black bg-neutral-200 flex items-center justify-center font-bold text-xs shrink-0">
              [■]
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-neutral-900">
                  StockSmart
                </span>
                <span className="border border-black bg-neutral-100 text-[9px] font-bold px-1">
                  PMV 1.0
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-800 truncate mt-0.5">
                Minimarket Don Pepe
              </p>
              <p className="text-[10px] text-neutral-600 truncate font-normal">
                Lima, Perú · {currentDateFormatted}
              </p>
            </div>
          </div>

          {/* Menú Principal Section */}
          <div className="space-y-1.5">
            <div className="px-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                SECCIONES (4)
              </span>
              <span className="text-[10px] font-bold text-neutral-800">
                [PROTOTIPO]
              </span>
            </div>

            <div className="space-y-1.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full min-h-[46px] px-3 py-2 flex items-center justify-between text-left border ${
                      isActive
                        ? 'border-2 border-black bg-neutral-900 text-white font-bold'
                        : 'border border-neutral-400 bg-white text-neutral-900 font-normal hover:bg-neutral-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold tracking-wide">
                        {tab.symbol} {tab.label}
                      </div>
                      <div className={`text-[10px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-neutral-300 font-normal' : 'text-neutral-600'
                      }`}>
                        {tab.subtitle}
                      </div>
                    </div>

                    {tab.badge !== undefined && (
                      <span 
                        className={`text-[10px] font-bold px-1.5 py-0.5 border shrink-0 ml-1 ${
                          isActive 
                            ? 'border-white bg-white text-black' 
                            : 'border-black bg-neutral-200 text-black'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Tools in Desktop Sidebar */}
          <div className="pt-3 border-t border-neutral-400 space-y-2">
            <div className="px-1">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                ACCIONES RÁPIDAS
              </span>
            </div>

            <button
              onClick={onOpenSupplierModal}
              className="w-full min-h-[40px] px-3 py-2 bg-white hover:bg-neutral-200 text-neutral-900 border border-black flex items-center justify-between text-xs font-bold"
            >
              <span>[+] Pedido al Proveedor</span>
              <span className="text-[9px] border border-black bg-neutral-200 px-1 font-bold">
                SUGERIDO
              </span>
            </button>

            {onOpenStockCount && (
              <button
                onClick={onOpenStockCount}
                className="w-full min-h-[40px] px-3 py-2 bg-white hover:bg-neutral-200 text-neutral-900 border border-neutral-600 flex items-center gap-2 text-xs font-normal"
              >
                <span>[✓] Contar Stock Físico</span>
              </button>
            )}

            <button
              onClick={onOpenDesignTokens}
              className="w-full min-h-[40px] px-3 py-2 bg-white hover:bg-neutral-200 text-neutral-800 border border-neutral-600 flex items-center gap-2 text-xs font-normal"
            >
              <span>[?] Especificaciones Wireframe</span>
            </button>
          </div>

        </div>

        {/* Footer info in Sidebar */}
        <div className="p-3 border-t border-neutral-400 bg-neutral-100 text-[10px] text-neutral-600">
          <p className="font-bold text-neutral-900">PROTOTIPO ACADÉMICO</p>
          <p>Design Thinking · PMV 1.0</p>
        </div>
      </aside>
    </>
  );
};
