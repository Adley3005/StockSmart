import React, { useState, useMemo } from 'react';
import { useBodega } from '../../context/BodegaContext';
import { Product, PaymentMethod } from '../../types';
import { formatCurrency, getStockStatus } from '../../utils/helpers';

interface SellViewProps {
  onOpenScanner: () => void;
}

export const SellView: React.FC<SellViewProps> = ({ onOpenScanner }) => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartItemsCount,
    processSale,
    undoLastSale,
    canUndoSale,
    undoTimeRemaining,
    lastSaleSummary,
    customers
  } = useBodega();

  // Search and category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Bottom sheet / Drawer open state for Mobile
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  // Quantity modal for custom quantity
  const [quantityModalProduct, setQuantityModalProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);

  // Top 8 fast seller products
  const top8Products = useMemo(() => {
    return products.filter((p) => p.isTopSeller).slice(0, 8);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      const matchesCategory =
        selectedCategory === 'todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: products.length,
      Bebidas: 0,
      Lácteos: 0,
      Abarrotes: 0,
      Snacks: 0,
      Limpieza: 0
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  const categoryChips = [
    { id: 'todos', label: 'Todos', symbol: '[*]', count: categoryCounts.todos },
    { id: 'Bebidas', label: 'Bebidas', symbol: '[B]', count: categoryCounts.Bebidas },
    { id: 'Lácteos', label: 'Lácteos', symbol: '[L]', count: categoryCounts.Lácteos },
    { id: 'Abarrotes', label: 'Abarrotes', symbol: '[A]', count: categoryCounts.Abarrotes },
    { id: 'Snacks', label: 'Snacks & Galletas', symbol: '[S]', count: categoryCounts.Snacks },
    { id: 'Limpieza', label: 'Limpieza', symbol: '[Z]', count: categoryCounts.Limpieza }
  ];

  // Cash change calculation
  const cashGivenNumber = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashGivenNumber - cartTotal);
  const isExactOrSufficientCash = paymentMethod === 'Efectivo' ? cashGivenNumber >= cartTotal : true;

  // Selected customer for Fiado details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const remainingCreditBeforeSale = selectedCustomer ? selectedCustomer.creditLimit - selectedCustomer.balance : 0;
  const willExceedLimit = selectedCustomer ? (selectedCustomer.balance + cartTotal) > selectedCustomer.creditLimit : false;

  // Handler for fast add
  const handleCardClick = (product: Product) => {
    addToCart(product, 1);
  };

  const handleOpenQuantitySelector = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const existing = cart.find(ci => ci.product.id === product.id);
    setModalQty(existing ? existing.quantity : 1);
    setQuantityModalProduct(product);
  };

  const handleConfirmCustomQty = () => {
    if (quantityModalProduct) {
      if (modalQty <= 0) {
        removeFromCart(quantityModalProduct.id);
      } else {
        const existing = cart.find(ci => ci.product.id === quantityModalProduct.id);
        if (existing) {
          updateCartQuantity(quantityModalProduct.id, modalQty);
        } else {
          addToCart(quantityModalProduct, modalQty);
        }
      }
      setQuantityModalProduct(null);
    }
  };

  const handleAddCash = (amount: number) => {
    setCashGiven(amount.toString());
  };

  const handleProcessSale = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    try {
      const finalPaid = paymentMethod === 'Efectivo' ? (cashGivenNumber || cartTotal) : cartTotal;
      await processSale(paymentMethod, finalPaid, paymentMethod === 'Fiado' ? selectedCustomerId : undefined);
      setIsCheckoutDrawerOpen(false);
      setCashGiven('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStockTag = (status: string) => {
    if (status === 'Agotado') return '[AGOTADO]';
    if (status === 'Bajo') return '[BAJO]';
    return '[OK]';
  };

  return (
    <div className="relative pb-28 md:pb-6">
      
      {/* 5-SECOND UNDO BANNER WIREFRAME */}
      {canUndoSale && lastSaleSummary && !lastSaleSummary.isUndo && (
        <div className="mb-4 bg-white border-2 border-black p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="border border-black bg-neutral-200 px-1.5 py-0.5 font-bold text-xs">[REGISTRADO]</span>
            <div>
              <p className="text-xs font-bold text-black">
                Venta registrada ({lastSaleSummary.ticketNumber} · {formatCurrency(lastSaleSummary.total)})
              </p>
              <p className="text-[11px] text-neutral-600 font-normal">
                Cobrado con {lastSaleSummary.paymentMethod}. Tienes {undoTimeRemaining}s para deshacer.
              </p>
            </div>
          </div>

          <button
            onClick={undoLastSale}
            className="px-3 py-1.5 border border-black bg-neutral-200 hover:bg-neutral-300 text-black font-bold text-xs"
          >
            [Deshacer ({undoTimeRemaining}s)]
          </button>
        </div>
      )}

      {/* Main Grid: Products on Left, Cart on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        
        {/* LEFT SECTION: SEARCH, FAST SELLERS & PRODUCT CATALOG */}
        <div className="md:col-span-7 xl:col-span-8 space-y-3.5">
          
          {/* Top Search Bar & Scanner Button */}
          <div className="bg-white p-3 border border-neutral-400 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="[Buscar por nombre o código de barras]..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-xs font-normal border border-black outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-black px-1"
                    title="Limpiar"
                  >
                    [X]
                  </button>
                )}
              </div>

              {/* Barcode Scanner Button Wireframe */}
              <button
                onClick={onOpenScanner}
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold border border-black shrink-0"
                title="Escanear con cámara"
              >
                [||| Escanear]
              </button>
            </div>

            {/* Búsqueda por Categoría (Chips Wireframe) */}
            <div className="pt-2 border-t border-neutral-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">
                  Categorías:
                </span>
                {selectedCategory !== 'todos' && (
                  <button
                    onClick={() => setSelectedCategory('todos')}
                    className="text-[11px] text-neutral-800 font-bold underline"
                  >
                    [Ver todas ({products.length})]
                  </button>
                )}
              </div>

              {/* Chips de Categorías */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {categoryChips.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap border ${
                        isSelected
                          ? 'border-2 border-black bg-neutral-900 text-white'
                          : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{cat.symbol} {cat.label} ({cat.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Banner de Categoría Activa */}
          {selectedCategory !== 'todos' && (
            <div className="bg-neutral-100 border border-black p-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-black">Góndola activa: {selectedCategory}</span>
                <span className="text-neutral-600 font-normal ml-2">({filteredProducts.length} productos)</span>
              </div>
              <button
                onClick={() => setSelectedCategory('todos')}
                className="px-2 py-0.5 border border-black bg-white font-bold text-[11px]"
              >
                [Ver todas]
              </button>
            </div>
          )}

          {/* Grilla de Más Vendidos (Mostrador Rápido) */}
          {selectedCategory === 'todos' && !searchQuery && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  [MÁS VENDIDOS] Acceso Rápido
                </span>
                <span className="text-[10px] text-neutral-600 font-normal">1 toque = +1 al ticket</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {top8Products.map((prod) => {
                  const stockStatus = getStockStatus(prod);
                  const inCartQty = cart.find((ci) => ci.product.id === prod.id)?.quantity || 0;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleCardClick(prod)}
                      className={`bg-white p-2.5 border transition-none cursor-pointer flex flex-col justify-between select-none ${
                        inCartQty > 0
                          ? 'border-2 border-black bg-neutral-100'
                          : 'border border-neutral-400 hover:border-black'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-neutral-900 leading-tight">
                            {prod.name}
                          </span>
                          <span className="text-[9px] font-bold border border-neutral-600 px-1 bg-neutral-100 shrink-0">
                            {getStockTag(stockStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200">
                        <span className="text-xs font-bold text-neutral-900">
                          {formatCurrency(prod.price)}
                        </span>

                        <div className="flex items-center gap-1">
                          {inCartQty > 0 && (
                            <span className="border border-black bg-black text-white text-[10px] font-bold px-1.5">
                              {inCartQty}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleOpenQuantitySelector(e, prod)}
                            className="px-1.5 py-0.5 border border-black bg-white hover:bg-neutral-200 text-xs font-bold"
                            title="Cantidad manual"
                          >
                            [+]
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grilla Completa de Catálogo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                {selectedCategory === 'todos' ? 'Catálogo General' : `Productos en ${selectedCategory}`} ({filteredProducts.length})
              </span>
              <span className="text-[10px] text-neutral-600 font-normal">
                Estados: [OK] · [BAJO] · [AGOTADO]
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white p-6 text-center text-neutral-600 space-y-1 border border-neutral-400">
                <p className="text-xs font-bold text-neutral-900">No se encontraron productos</p>
                <button
                  onClick={() => { setSelectedCategory('todos'); setSearchQuery(''); }}
                  className="mt-1 px-3 py-1 border border-black bg-neutral-100 text-xs font-bold"
                >
                  [Restablecer filtros]
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredProducts.map((prod) => {
                  const stockStatus = getStockStatus(prod);
                  const inCartQty = cart.find((ci) => ci.product.id === prod.id)?.quantity || 0;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleCardClick(prod)}
                      className={`bg-white p-2.5 border cursor-pointer flex flex-col justify-between select-none ${
                        inCartQty > 0
                          ? 'border-2 border-black bg-neutral-100'
                          : 'border border-neutral-400 hover:border-black'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-neutral-900 leading-tight">
                            {prod.name}
                          </span>
                          <span className="text-[9px] font-bold border border-neutral-600 px-1 bg-neutral-100 shrink-0">
                            {getStockTag(stockStatus)}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-600 font-normal mt-0.5">
                          {prod.stock} {prod.unit}s disp.
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200">
                        <span className="text-xs font-bold text-neutral-900">
                          {formatCurrency(prod.price)}
                        </span>

                        <div className="flex items-center gap-1">
                          {inCartQty > 0 && (
                            <span className="border border-black bg-black text-white text-[10px] font-bold px-1.5">
                              {inCartQty}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleOpenQuantitySelector(e, prod)}
                            className="px-1.5 py-0.5 border border-black bg-white hover:bg-neutral-200 text-xs font-bold"
                            title="Cambiar cantidad"
                          >
                            [+]
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT SECTION: CART & CHECKOUT PANEL (DESKTOP) */}
        <div className="hidden md:block md:col-span-5 xl:col-span-4 sticky top-14">
          <div className="bg-white border-2 border-black p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-black">
              <div>
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  [TICKET] Cobro de Mostrador
                </h2>
                <p className="text-[10px] text-neutral-600 font-normal">
                  {cartItemsCount} {cartItemsCount === 1 ? 'producto' : 'productos'} agregados
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-900 font-bold border border-black px-2 py-0.5 hover:bg-neutral-200"
                >
                  [Vaciar]
                </button>
              )}
            </div>

            {/* Cart Items List Wireframe */}
            <div className="max-h-[35vh] overflow-y-auto space-y-1.5 pr-1 divide-y divide-neutral-200">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 space-y-1">
                  <p className="text-xs font-bold">[TICKET VACÍO]</p>
                  <p className="text-[11px] font-normal">Toca un producto de la izquierda para sumar al ticket</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="pt-1.5 flex items-center justify-between gap-2">
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-neutral-600 font-normal">
                        {formatCurrency(item.product.price)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 border border-black bg-white hover:bg-neutral-200 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item.product, 1)}
                        className="w-6 h-6 border border-black bg-white hover:bg-neutral-200 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-16 text-right shrink-0 text-xs font-bold text-neutral-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total and Checkout Form */}
            {renderCheckoutForm(
              paymentMethod,
              setPaymentMethod,
              cartTotal,
              cashGiven,
              setCashGiven,
              handleAddCash,
              changeDue,
              selectedCustomerId,
              setSelectedCustomerId,
              customers,
              selectedCustomer,
              remainingCreditBeforeSale,
              willExceedLimit,
              isExactOrSufficientCash,
              handleProcessSale,
              isProcessing,
              cart.length === 0
            )}
          </div>
        </div>

      </div>

      {/* MOBILE FIXED BOTTOM CART BAR */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 p-2 z-30">
        <button
          onClick={() => setIsCheckoutDrawerOpen(true)}
          disabled={cart.length === 0}
          className={`w-full min-h-[48px] px-4 py-2 border-2 border-black flex items-center justify-between font-bold text-xs ${
            cart.length > 0
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
          }`}
        >
          <span>[TICKET: {cartItemsCount} PROD.]</span>
          <span className="text-sm font-bold">{formatCurrency(cartTotal)}</span>
          <span>[COBRAR &gt;]</span>
        </button>
      </div>

      {/* MOBILE CHECKOUT SHEET WIREFRAME */}
      {isCheckoutDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white border-t-2 border-black max-h-[88vh] overflow-y-auto p-4 space-y-3">
            
            <div className="flex items-center justify-between pb-2 border-b border-black">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">[DETALLE DEL COBRO]</h3>
                <p className="text-xs text-neutral-600 font-normal">{cartItemsCount} productos seleccionados</p>
              </div>
              <button
                onClick={() => setIsCheckoutDrawerOpen(false)}
                className="px-2 py-1 border border-black bg-white font-bold text-xs"
              >
                [Cerrar X]
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-neutral-200">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-1 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 truncate">
                    <p className="font-bold text-neutral-900 truncate">{item.product.name}</p>
                    <p className="text-neutral-600 font-normal">{formatCurrency(item.product.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-5 h-5 border border-black flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.product, 1)}
                      className="w-5 h-5 border border-black flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-14 text-right font-bold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment form */}
            {renderCheckoutForm(
              paymentMethod,
              setPaymentMethod,
              cartTotal,
              cashGiven,
              setCashGiven,
              handleAddCash,
              changeDue,
              selectedCustomerId,
              setSelectedCustomerId,
              customers,
              selectedCustomer,
              remainingCreditBeforeSale,
              willExceedLimit,
              isExactOrSufficientCash,
              handleProcessSale,
              isProcessing,
              cart.length === 0
            )}

          </div>
        </div>
      )}

      {/* MODAL: CANTIDAD RÁPIDA WIREFRAME */}
      {quantityModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-xs w-full p-4 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase">
                [CANTIDAD A VENDER]
              </h4>
              <p className="text-xs text-neutral-700 mt-0.5 truncate font-bold">
                {quantityModalProduct.name}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
              <button
                onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                className="w-10 h-10 border border-black bg-white hover:bg-neutral-200 text-black font-bold text-base"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={modalQty}
                onChange={(e) => setModalQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 h-10 text-center font-bold text-base border-2 border-black outline-none"
              />
              <button
                onClick={() => setModalQty(modalQty + 1)}
                className="w-10 h-10 border border-black bg-white hover:bg-neutral-200 text-black font-bold text-base"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleConfirmCustomQty}
                className="w-full py-2 border-2 border-black bg-neutral-900 text-white font-bold text-xs"
              >
                [Confirmar]
              </button>
              <button
                onClick={() => setQuantityModalProduct(null)}
                className="w-full py-2 border border-black bg-white text-black font-bold text-xs"
              >
                [Cancelar]
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * Subcomponent to render payment method selection, cash change calculator and fiado customer chooser
 */
function renderCheckoutForm(
  paymentMethod: PaymentMethod,
  setPaymentMethod: (m: PaymentMethod) => void,
  cartTotal: number,
  cashGiven: string,
  setCashGiven: (v: string) => void,
  handleAddCash: (a: number) => void,
  changeDue: number,
  selectedCustomerId: string,
  setSelectedCustomerId: (id: string) => void,
  customers: any[],
  selectedCustomer: any,
  remainingCreditBeforeSale: number,
  willExceedLimit: boolean,
  isExactOrSufficientCash: boolean,
  handleProcessSale: () => void,
  isProcessing: boolean,
  isCartEmpty: boolean
) {
  return (
    <div className="space-y-3 pt-2.5 border-t border-neutral-300 text-xs">
      
      {/* Total display */}
      <div className="flex items-baseline justify-between bg-neutral-100 p-2 border border-neutral-400">
        <span className="text-xs font-bold text-neutral-700 uppercase">
          Total a Cobrar:
        </span>
        <span className="text-xl font-bold text-neutral-900">
          {formatCurrency(cartTotal)}
        </span>
      </div>

      {/* Payment Method Rectangular Buttons */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-neutral-800 uppercase">
          Forma de Pago:
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'Efectivo', label: '[1. Efectivo]' },
            { id: 'Yape', label: '[2. Yape]' },
            { id: 'Plin', label: '[3. Plin]' },
            { id: 'Fiado', label: '[4. Fiado]' }
          ].map((pm) => {
            const isSelected = paymentMethod === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                className={`p-2 text-xs font-bold border ${
                  isSelected
                    ? 'border-2 border-black bg-neutral-900 text-white'
                    : 'border border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {pm.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* EFECTIVO: Calculadora de Vuelto */}
      {paymentMethod === 'Efectivo' && (
        <div className="bg-neutral-50 p-2.5 border border-neutral-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800">
              Pagó con (S/):
            </span>
            <input
              type="number"
              step="0.5"
              placeholder={cartTotal.toFixed(2)}
              value={cashGiven}
              onChange={(e) => setCashGiven(e.target.value)}
              className="w-28 px-2 py-1 bg-white text-xs font-bold text-right border border-black outline-none"
            />
          </div>

          {/* Denominaciones rápidas */}
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-600 font-normal">
              Billetes rápidos:
            </span>
            <div className="grid grid-cols-4 gap-1 text-xs font-bold">
              {[10, 20, 50, 100].map((billete) => (
                <button
                  key={billete}
                  type="button"
                  onClick={() => handleAddCash(billete)}
                  className="py-1 bg-white border border-neutral-400 hover:bg-neutral-200 text-neutral-900"
                >
                  S/ {billete}
                </button>
              ))}
            </div>
          </div>

          {/* Vuelto display */}
          <div className="pt-1 border-t border-neutral-300 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800">
              Vuelto a entregar:
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {formatCurrency(changeDue)}
            </span>
          </div>
        </div>
      )}

      {/* FIADO: Selección de Vecino */}
      {paymentMethod === 'Fiado' && (
        <div className="bg-neutral-100 p-2.5 border-2 border-black space-y-2">
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Vecino para el fiado:
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-1.5 bg-white text-xs font-bold border border-black outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · Saldo: {formatCurrency(c.balance)} (Tope: {formatCurrency(c.creditLimit)})
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="text-[11px] space-y-1 text-neutral-800 pt-1 border-t border-neutral-300">
              <div className="flex justify-between">
                <span>Saldo pendiente:</span>
                <span className="font-bold">{formatCurrency(selectedCustomer.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tope acordado:</span>
                <span className="font-bold">{formatCurrency(selectedCustomer.creditLimit)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Disponible:</span>
                <span>{formatCurrency(Math.max(0, remainingCreditBeforeSale))}</span>
              </div>

              {willExceedLimit && (
                <div className="mt-1 p-1.5 bg-neutral-200 border border-black text-black font-bold text-[10px]">
                  [ALERTA: Esta compra superará el tope de {formatCurrency(selectedCustomer.creditLimit)}]
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botón principal de Confirmar Cobro */}
      <button
        onClick={handleProcessSale}
        disabled={isCartEmpty || isProcessing || !isExactOrSufficientCash}
        className={`w-full py-2.5 border-2 border-black font-bold text-xs uppercase tracking-wider ${
          isCartEmpty || !isExactOrSufficientCash
            ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
            : 'bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer'
        }`}
      >
        <span>
          {isProcessing 
            ? '[REGISTRANDO...]' 
            : paymentMethod === 'Fiado' 
            ? `[ANOTAR FIADO ${formatCurrency(cartTotal)}]` 
            : `[CONFIRMAR COBRO: ${formatCurrency(cartTotal)} (${paymentMethod.toUpperCase()})]`}
        </span>
      </button>

      {/* Mensaje de efectivo insuficiente */}
      {!isExactOrSufficientCash && paymentMethod === 'Efectivo' && (
        <p className="text-[10px] font-bold text-black border border-black bg-neutral-200 p-1 text-center">
          [ALERTA: El pago debe ser mayor o igual a {formatCurrency(cartTotal)}]
        </p>
      )}

    </div>
  );
}
