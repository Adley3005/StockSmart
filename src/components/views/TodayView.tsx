import React, { useState } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product } from '../../types';
import { formatCurrency, getExpiryDetails, getStockStatus, formatUnitPlural } from '../../utils/helpers';

interface TodayViewProps {
  onOpenSupplierOrder: () => void;
  onOpenRetireModal: (product: Product) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  onOpenSupplierOrder,
  onOpenRetireModal
}) => {
  const { 
    products, 
    stockCounts, 
    customers,
    salesTodayTotal, 
    ticketsTodayCount, 
    topProducts,
    currentDateFormatted,
    setActiveTab,
    setInventoryFilterInitial
  } = useBodega();

  // Top 5 ranking sort metric: 'units' or 'soles'
  const [topSortCriterion, setTopSortCriterion] = useState<'units' | 'soles'>('units');
  // Limit visible alert cards to max 3
  const [showAllAlerts, setShowAllAlerts] = useState<boolean>(false);

  // Specific product lists for actionable cards
  const expiredProducts = products.filter(p => getExpiryDetails(p).status === 'Vencido');
  const outOfStockProducts = products.filter(p => getStockStatus(p) === 'Agotado');
  const lowStockProducts = products.filter(p => getStockStatus(p) === 'Bajo');
  const expiringSoonProducts = products.filter(p => getExpiryDetails(p).status === 'Por vencer');
  const overLimitCustomers = customers.filter(c => c.balance > c.creditLimit);

  // Check if there are any pending actions today
  const hasPendingActions = 
    expiredProducts.length > 0 || 
    outOfStockProducts.length > 0 || 
    lowStockProducts.length > 0 || 
    expiringSoonProducts.length > 0 || 
    overLimitCustomers.length > 0;

  // Max value for Top 5 proportional bars
  const maxUnits = Math.max(...topProducts.map(tp => tp.unitsSold), 1);
  const maxSoles = Math.max(...topProducts.map(tp => tp.totalSalesSol), 1);

  const sortedTopProducts = [...topProducts].sort((a, b) => {
    return topSortCriterion === 'units'
      ? b.unitsSold - a.unitsSold
      : b.totalSalesSol - a.totalSalesSol;
  });

  const handleFilterToProducts = (filter: 'agotados' | 'bajos' | 'vencidos' | 'por_vencer') => {
    setInventoryFilterInitial(filter);
    setActiveTab('productos');
  };

  // Compile active alert cards in wireframe grayscale style
  const alertCards: { id: string; element: React.ReactNode }[] = [];

  if (expiredProducts.length > 0) {
    alertCards.push({
      id: 'vencidos',
      element: (
        <div key="vencidos" className="bg-white border-2 border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border border-black bg-neutral-200 flex items-center justify-center font-bold text-xs shrink-0">
              [!]
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {expiredProducts.length} {expiredProducts.length === 1 ? 'producto vencido' : 'productos vencidos'}
                </span>
                <span className="border border-black bg-neutral-300 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5">
                  [ALERTA: VENCIDO]
                </span>
              </div>
              <p className="text-xs text-neutral-700 mt-0.5">
                Ejemplos: {expiredProducts.slice(0, 3).map(p => p.name).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenRetireModal(expiredProducts[0])}
            className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800"
          >
            [Retirar de venta]
          </button>
        </div>
      )
    });
  }

  if (outOfStockProducts.length > 0) {
    alertCards.push({
      id: 'agotados',
      element: (
        <div key="agotados" className="bg-white border-2 border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border border-black bg-neutral-200 flex items-center justify-center font-bold text-xs shrink-0">
              [0]
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {outOfStockProducts.length} {outOfStockProducts.length === 1 ? 'producto agotado' : 'productos agotados'} (0 existencias)
                </span>
                <span className="border border-black bg-neutral-300 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5">
                  [ALERTA: AGOTADO]
                </span>
              </div>
              <p className="text-xs text-neutral-700 mt-0.5">
                Ejemplos: {outOfStockProducts.slice(0, 3).map(p => p.name).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSupplierOrder}
            className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800"
          >
            [+ Armar pedido]
          </button>
        </div>
      )
    });
  }

  if (lowStockProducts.length > 0) {
    alertCards.push({
      id: 'bajos',
      element: (
        <div key="bajos" className="bg-white border border-neutral-700 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border border-neutral-700 bg-neutral-100 flex items-center justify-center font-bold text-xs shrink-0">
              [&lt;]
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {lowStockProducts.length} {lowStockProducts.length === 1 ? 'producto con stock bajo' : 'productos con stock bajo'} (&lt; mínimo)
                </span>
                <span className="border border-neutral-700 bg-neutral-200 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5">
                  [ESTADO: BAJO]
                </span>
              </div>
              <p className="text-xs text-neutral-700 mt-0.5">
                Ejemplos: {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSupplierOrder}
            className="w-full sm:w-auto px-4 py-2 border border-black bg-white hover:bg-neutral-200 text-black font-bold text-xs"
          >
            [+ Armar pedido]
          </button>
        </div>
      )
    });
  }

  if (expiringSoonProducts.length > 0) {
    alertCards.push({
      id: 'por_vencer',
      element: (
        <div key="por_vencer" className="bg-white border border-neutral-700 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border border-neutral-700 bg-neutral-100 flex items-center justify-center font-bold text-xs shrink-0">
              [T]
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {expiringSoonProducts.length} {expiringSoonProducts.length === 1 ? 'producto por vencer' : 'productos por vencer'} (≤ 7 días)
                </span>
                <span className="border border-neutral-700 bg-neutral-200 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5">
                  [AVISO: POR VENCER]
                </span>
              </div>
              <p className="text-xs text-neutral-700 mt-0.5">
                Ejemplos: {expiringSoonProducts.slice(0, 3).map(p => p.name).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleFilterToProducts('por_vencer')}
            className="w-full sm:w-auto px-4 py-2 border border-black bg-white hover:bg-neutral-200 text-black font-bold text-xs"
          >
            [Revisar lotes]
          </button>
        </div>
      )
    });
  }

  if (overLimitCustomers.length > 0) {
    alertCards.push({
      id: 'sobre_tope',
      element: (
        <div key="sobre_tope" className="bg-white border-2 border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 border border-black bg-neutral-200 flex items-center justify-center font-bold text-xs shrink-0">
              [$]
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {overLimitCustomers.length} {overLimitCustomers.length === 1 ? 'vecino superó su tope' : 'vecinos superaron su tope'} de crédito
                </span>
                <span className="border border-black bg-neutral-300 text-neutral-900 text-[10px] font-bold px-1.5 py-0.5">
                  [ALERTA: TOPE EXCEDIDO]
                </span>
              </div>
              <p className="text-xs text-neutral-700 mt-0.5">
                Ejemplos: {overLimitCustomers.map(c => `${c.name} (${formatCurrency(c.balance)})`).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('fiados')}
            className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800"
          >
            [Cobrar / Recordar]
          </button>
        </div>
      )
    });
  }

  // Principle 2: Max 3 visible at a time unless expanded
  const visibleCards = showAllAlerts ? alertCards : alertCards.slice(0, 3);

  return (
    <div className="space-y-4 pb-6">
      
      {/* 1. WELCOME & ACTION BANNER */}
      <div className="bg-white border border-neutral-400 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="border border-black bg-neutral-200 text-black text-xs px-2 py-0.5 font-bold">
              [TURNO EN CURSO]
            </span>
            <span className="text-xs text-neutral-600 font-normal">
              {currentDateFormatted}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 mt-1">
            ACCIONES PARA HOY EN LA BODEGA
          </h1>
          <p className="text-xs text-neutral-600 font-normal">
            Prioridades automáticas para que Don Pepe no pierda ventas ni mercadería.
          </p>
        </div>

        {/* Big Action Button: Armar Pedido al Proveedor */}
        <button
          onClick={onOpenSupplierOrder}
          className="w-full md:w-auto px-5 py-2.5 border-2 border-black bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800"
        >
          [+] Armar pedido al proveedor ({stockCounts.agotados + stockCounts.bajos} ítems)
        </button>
      </div>

      {/* 2. BLOQUE SUPERIOR: "PARA HACER HOY" */}
      <section className="space-y-2.5" aria-labelledby="todo-heading">
        <div className="flex items-center justify-between px-1">
          <h2 id="todo-heading" className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <span>Acciones Prioritarias del Día</span>
            <span className="border border-black bg-neutral-200 text-black text-[10px] px-1.5 py-0.2 font-bold">
              {alertCards.length}
            </span>
          </h2>

          {alertCards.length > 3 && (
            <button
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="text-xs font-bold text-black border border-neutral-700 bg-white hover:bg-neutral-100 px-2 py-0.5"
            >
              {showAllAlerts ? '[Ver solo 3]' : `[Ver todas (${alertCards.length})]`}
            </button>
          )}
        </div>

        {/* Positive Empty State if no pending issues */}
        {!hasPendingActions ? (
          <div className="bg-white border border-neutral-400 p-6 text-center text-neutral-900 space-y-1">
            <div className="text-xs font-bold border border-black inline-block px-2 py-0.5 bg-neutral-200">[ESTADO: OK]</div>
            <h3 className="text-sm font-bold">¡Todo en orden, Don Pepe!</h3>
            <p className="text-xs text-neutral-600">
              No tienes productos vencidos, quiebres de stock ni fiados fuera de límite en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleCards.map(card => card.element)}
          </div>
        )}
      </section>

      {/* 3. BLOQUE INFERIOR: "CÓMO VA EL TURNO" */}
      <section className="bg-white border border-neutral-400 p-4 sm:p-5 space-y-4" aria-labelledby="shift-stats-heading">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-neutral-300">
          <div>
            <h2 id="shift-stats-heading" className="text-sm sm:text-base font-bold text-neutral-900">
              [RESUMEN] Cómo va el turno
            </h2>
            <p className="text-xs text-neutral-600 font-normal">Métricas acumuladas del registro de ventas</p>
          </div>

          <button
            onClick={() => setActiveTab('vender')}
            className="self-start sm:self-auto text-xs font-bold text-neutral-900 border border-black bg-white hover:bg-neutral-200 px-3 py-1.5"
          >
            [Ir al mostrador a cobrar]
          </button>
        </div>

        {/* Quick KPI Numbers Wireframe */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Soles Totales */}
          <div className="bg-neutral-900 text-white p-3.5 border border-black">
            <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide">
              Vendido Hoy (Total)
            </span>
            <p className="text-2xl font-bold text-white mt-1">
              {formatCurrency(salesTodayTotal)}
            </p>
            <p className="text-[10px] text-neutral-400 mt-1 font-normal">
              Suma exacta de tickets cobrados
            </p>
          </div>

          {/* Número de Tickets */}
          <div className="bg-white border border-neutral-400 p-3.5">
            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
              Tickets del Turno
            </span>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {ticketsTodayCount}
            </p>
            <p className="text-[10px] text-neutral-600 mt-1 font-normal">
              Ticket promedio: {formatCurrency(ticketsTodayCount > 0 ? salesTodayTotal / ticketsTodayCount : 0)}
            </p>
          </div>

          {/* Ritmo y estado */}
          <div className="bg-neutral-100 border border-neutral-400 p-3.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
                Estado del Cuadre
              </span>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                [OK: 100%]
              </p>
            </div>
            <p className="text-[10px] text-neutral-600 mt-1 font-normal">
              {ticketsTodayCount > 0 ? 'Cada sol proviene de una venta registrada' : 'Esperando primera venta del turno'}
            </p>
          </div>

        </div>

        {/* Top 5 Products con Toggle */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              [RANKING] Top Productos Más Vendidos Hoy
            </h3>

            {/* Selector de Criterio: Unidades o Soles */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTopSortCriterion('units')}
                className={`px-2.5 py-1 text-xs border ${
                  topSortCriterion === 'units'
                    ? 'border-2 border-black bg-neutral-900 text-white font-bold'
                    : 'border-neutral-400 bg-white text-neutral-800 font-normal hover:bg-neutral-100'
                }`}
              >
                Por Unidades
              </button>
              <button
                onClick={() => setTopSortCriterion('soles')}
                className={`px-2.5 py-1 text-xs border ${
                  topSortCriterion === 'soles'
                    ? 'border-2 border-black bg-neutral-900 text-white font-bold'
                    : 'border-neutral-400 bg-white text-neutral-800 font-normal hover:bg-neutral-100'
                }`}
              >
                Por Soles (S/)
              </button>
            </div>
          </div>

          {sortedTopProducts.length === 0 ? (
            <div className="py-4 text-center text-neutral-500 text-xs">
              Aún no se han cobrado ventas en este turno.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedTopProducts.map((item, idx) => {
                const currentVal = topSortCriterion === 'units' ? item.unitsSold : item.totalSalesSol;
                const maxVal = topSortCriterion === 'units' ? maxUnits : maxSoles;
                const percent = Math.min(100, Math.round((currentVal / maxVal) * 100));

                return (
                  <div key={item.product.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 border border-black bg-neutral-200 text-neutral-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-neutral-900 truncate font-bold">
                          {item.product.name}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        {topSortCriterion === 'units' ? (
                          <span className="text-neutral-900 font-bold">
                            {formatUnitPlural(item.unitsSold, item.product.unit)}
                          </span>
                        ) : (
                          <span className="text-neutral-900 font-bold">
                            {formatCurrency(item.totalSalesSol)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Proportional Bar Wireframe */}
                    <div className="w-full bg-neutral-200 border border-neutral-400 h-2">
                      <div 
                        className="h-full bg-neutral-800"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </section>

    </div>
  );
};
