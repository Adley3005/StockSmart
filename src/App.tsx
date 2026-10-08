import React, { useState } from 'react';
import { BodegaProvider, useBodega } from './context/BodegaContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TodayView } from './components/views/TodayView';
import { SellView } from './components/views/SellView';
import { ProductsView } from './components/views/ProductsView';
import { FiadosView } from './components/views/FiadosView';

// Modals
import { SupplierOrderModal } from './components/modals/SupplierOrderModal';
import { StockCountModal } from './components/modals/StockCountModal';
import { ReceiveStockModal } from './components/modals/ReceiveStockModal';
import { FiadoDetailModal } from './components/modals/FiadoDetailModal';
import { WhatsAppReminderModal } from './components/modals/WhatsAppReminderModal';
import { AbonoModal } from './components/modals/AbonoModal';
import { BarcodeScannerModal } from './components/modals/BarcodeScannerModal';
import { DesignTokensModal } from './components/modals/DesignTokensModal';
import { MermaModal } from './components/modals/MermaModal';
import { EditProductModal } from './components/modals/EditProductModal';
import { NewCustomerModal } from './components/modals/NewCustomerModal';
import { SettingsModal } from './components/modals/SettingsModal';

import { Product, CustomerFiado } from './types';

const BodegaApp: React.FC = () => {
  const { activeTab, toastAlert, clearToast } = useBodega();

  // Modals state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isStockCountModalOpen, setIsStockCountModalOpen] = useState(false);
  const [isDesignTokensModalOpen, setIsDesignTokensModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'plans'>('settings');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Item specific modals
  const [selectedProductForReceive, setSelectedProductForReceive] = useState<Product | null>(null);
  const [selectedProductForMerma, setSelectedProductForMerma] = useState<Product | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);

  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<CustomerFiado | null>(null);
  const [selectedCustomerForAbono, setSelectedCustomerForAbono] = useState<CustomerFiado | null>(null);
  const [selectedCustomerForWhatsApp, setSelectedCustomerForWhatsApp] = useState<CustomerFiado | null>(null);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-900 selection:bg-neutral-800 selection:text-white">
      
      {/* Banner Fijo Superior Solicitado: PROTOTIPO DE BAJA FIDELIDAD — StockSmart PMV 1.0 */}
      <aside 
        aria-label="Banner Prototipo" 
        className="w-full bg-neutral-900 text-neutral-100 text-xs sm:text-sm font-bold tracking-wider py-2 px-4 text-center border-b border-black sticky top-0 z-50 select-none uppercase"
      >
        PROTOTIPO DE BAJA FIDELIDAD — StockSmart PMV 1.0
      </aside>

      {/* Top Header */}
      <Header
        onOpenDesignTokens={() => setIsDesignTokensModalOpen(true)}
        onOpenSettings={() => { setSettingsInitialTab('settings'); setIsSettingsModalOpen(true); }}
        onOpenPlans={() => { setSettingsInitialTab('plans'); setIsSettingsModalOpen(true); }}
      />

      {/* Navigation Sidebar (Desktop anchored at left edge) + Bottom Nav (Mobile) */}
      <Navigation
        onOpenSupplierModal={() => setIsSupplierModalOpen(true)}
        onOpenStockCount={() => setIsStockCountModalOpen(true)}
        onOpenDesignTokens={() => setIsDesignTokensModalOpen(true)}
      />

      {/* Main Layout Container: Content occupies full remaining width next to left sidebar */}
      <div className="flex-1 flex flex-col w-full md:pl-64 lg:pl-72">
        
        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 pb-28 md:pb-12 w-full min-w-0">
          <div className="w-full max-w-[1600px] mx-auto">
            {activeTab === 'hoy' && (
              <TodayView
                onOpenSupplierOrder={() => setIsSupplierModalOpen(true)}
                onOpenRetireModal={(_product) => {
                  // Handled in TodayView
                }}
              />
            )}

            {activeTab === 'vender' && (
              <SellView
                onOpenScanner={() => setIsScannerModalOpen(true)}
              />
            )}

            {activeTab === 'productos' && (
              <ProductsView
                onOpenReceiveStock={(prod) => setSelectedProductForReceive(prod)}
                onOpenStockCount={() => setIsStockCountModalOpen(true)}
                onOpenMermaModal={(prod) => setSelectedProductForMerma(prod)}
                onOpenEditModal={(prod) => setSelectedProductForEdit(prod)}
              />
            )}

            {activeTab === 'fiados' && (
              <FiadosView
                onOpenAbonoModal={(cust) => setSelectedCustomerForAbono(cust)}
                onOpenWhatsAppReminder={(cust) => setSelectedCustomerForWhatsApp(cust)}
                onOpenCustomerDetail={(cust) => setSelectedCustomerForDetail(cust)}
                onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
              />
            )}
          </div>
        </main>

      </div>

      {/* Wireframe Floating Toast Alert */}
      {toastAlert && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50">
          <div className="p-3 bg-white border-2 border-black text-black flex items-center justify-between gap-2.5 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="border border-black px-1.5 py-0.5 bg-neutral-200 text-black font-bold text-[10px]">
                {toastAlert.type === 'success' ? '[OK]' : toastAlert.type === 'warning' ? '[AVISO]' : toastAlert.type === 'danger' ? '[ALERTA]' : '[INFO]'}
              </span>
              <span className="leading-snug">{toastAlert.message}</span>
            </div>

            <button 
              onClick={clearToast} 
              className="px-2 py-0.5 border border-black text-xs font-bold hover:bg-neutral-200"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <SupplierOrderModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
      />

      <StockCountModal
        isOpen={isStockCountModalOpen}
        onClose={() => setIsStockCountModalOpen(false)}
      />

      <DesignTokensModal
        isOpen={isDesignTokensModalOpen}
        onClose={() => setIsDesignTokensModalOpen(false)}
      />

      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
      />

      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />

      <ReceiveStockModal
        product={selectedProductForReceive}
        isOpen={!!selectedProductForReceive}
        onClose={() => setSelectedProductForReceive(null)}
      />

      <MermaModal
        product={selectedProductForMerma}
        isOpen={!!selectedProductForMerma}
        onClose={() => setSelectedProductForMerma(null)}
      />

      <EditProductModal
        product={selectedProductForEdit}
        isOpen={!!selectedProductForEdit}
        onClose={() => setSelectedProductForEdit(null)}
      />

      <FiadoDetailModal
        customer={selectedCustomerForDetail}
        isOpen={!!selectedCustomerForDetail}
        onClose={() => setSelectedCustomerForDetail(null)}
        onOpenAbono={(cust) => setSelectedCustomerForAbono(cust)}
        onOpenWhatsApp={(cust) => setSelectedCustomerForWhatsApp(cust)}
      />

      <AbonoModal
        customer={selectedCustomerForAbono}
        isOpen={!!selectedCustomerForAbono}
        onClose={() => setSelectedCustomerForAbono(null)}
      />

      <WhatsAppReminderModal
        customer={selectedCustomerForWhatsApp}
        isOpen={!!selectedCustomerForWhatsApp}
        onClose={() => setSelectedCustomerForWhatsApp(null)}
      />

    </div>
  );
};

export default function App() {
  return (
    <BodegaProvider>
      <BodegaApp />
    </BodegaProvider>
  );
}
