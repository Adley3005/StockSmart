import React from 'react';

interface DesignTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignTokensModal: React.FC<DesignTokensModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-white border-2 border-black max-w-2xl w-full p-4 sm:p-5 flex flex-col max-h-[92vh] space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 uppercase">
              [ESPECIFICACIONES DE DISEÑO — PROTOTIPO DE BAJA FIDELIDAD]
            </h2>
            <p className="text-[10px] text-neutral-600 font-normal">
              Entregable académico de Design Thinking · StockSmart PMV 1.0
            </p>
          </div>

          <button onClick={onClose} className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200">
            [X]
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="my-1 overflow-y-auto flex-1 space-y-3.5 pr-1 text-xs">
          
          {/* SECTION 1: PALETA EN ESCALA DE GRISES */}
          <div className="space-y-1.5 border border-neutral-400 p-3 bg-neutral-50">
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              1. Paleta Monocromática (Sin Colores de Semáforo)
            </h3>
            <p className="text-neutral-700 text-[11px]">
              Se eliminaron intencionalmente los verdes, rojos y amarillos para evitar sesgos de percepción visual durante las entrevistas de validación con bodegueros.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
              <div className="p-2 border border-black bg-white">
                <span className="font-bold text-[10px]">Blanco</span>
                <p className="text-[9px] text-neutral-600">Fondo tarjetas</p>
              </div>
              <div className="p-2 border border-black bg-neutral-100">
                <span className="font-bold text-[10px]">Gris Claro</span>
                <p className="text-[9px] text-neutral-600">Contenedores</p>
              </div>
              <div className="p-2 border border-black bg-neutral-300">
                <span className="font-bold text-[10px]">Gris Medio</span>
                <p className="text-[9px] text-neutral-600">Etiquetas [Alerta]</p>
              </div>
              <div className="p-2 border border-black bg-neutral-700 text-white">
                <span className="font-bold text-[10px]">Gris Oscuro</span>
                <p className="text-[9px] text-neutral-300">Barras métricas</p>
              </div>
              <div className="p-2 border border-black bg-black text-white">
                <span className="font-bold text-[10px]">Negro Puro</span>
                <p className="text-[9px] text-neutral-300">Botones primarios</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: ETIQUETAS DE TEXTO EXPLICITAS */}
          <div className="space-y-1.5 border border-neutral-400 p-3 bg-neutral-50">
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              2. Texturas y Etiquetas de Texto para Estados
            </h3>
            <p className="text-neutral-700 text-[11px]">
              En lugar de círculos de color, el estado se comunica mediante texto explícito entre corchetes:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2 border border-neutral-600 bg-white space-y-0.5">
                <span className="border border-neutral-600 px-1 text-[10px] font-bold">[ESTADO: OK]</span>
                <p className="text-[10px] text-neutral-600">Stock suficiente / crédito al día</p>
              </div>
              <div className="p-2 border border-neutral-800 bg-neutral-100 space-y-0.5">
                <span className="border border-neutral-800 px-1 text-[10px] font-bold">[ESTADO: BAJO]</span>
                <p className="text-[10px] text-neutral-600">Stock menor al mínimo / por vencer</p>
              </div>
              <div className="p-2 border-2 border-black bg-neutral-200 space-y-0.5">
                <span className="border border-black px-1 text-[10px] font-bold">[ALERTA: CRÍTICO]</span>
                <p className="text-[10px] text-neutral-600">Agotado (0) / vencido / tope superado</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: COMPONENTES RECTANGULARES */}
          <div className="space-y-1.5 border border-neutral-400 p-3 bg-neutral-50">
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              3. Bordes Simples de 1px y Botones Rectangulares
            </h3>
            <p className="text-neutral-700 text-[11px]">
              Se eliminaron sombras, degradados, bordes redondeados y transiciones. Cada botón y contenedor se presenta como un rectángulo limpio con contorno definido de 1px a 2px.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button className="px-3 py-1.5 border-2 border-black bg-neutral-900 text-white font-bold text-xs">
                [Botón Primario]
              </button>
              <button className="px-3 py-1.5 border border-black bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs">
                [Botón Secundario]
              </button>
              <button className="px-2 py-1 border border-neutral-600 bg-neutral-100 text-neutral-800 text-xs">
                [Chip de Filtro]
              </button>
            </div>
          </div>

          {/* SECTION 4: TIPOGRAFÍA */}
          <div className="space-y-1.5 border border-neutral-400 p-3 bg-neutral-50">
            <h3 className="text-xs font-bold text-neutral-900 uppercase">
              4. Tipografía Sans-Serif Estándar
            </h3>
            <p className="text-neutral-700 text-[11px]">
              Fuente sans-serif nativa del sistema operativo con solo dos variaciones de peso: <strong>Normal (400)</strong> y <strong>Negrita (700)</strong>.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-black flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-5 bg-neutral-900 text-white font-bold text-xs border border-black"
          >
            [Cerrar]
          </button>
        </div>

      </div>
    </div>
  );
};
