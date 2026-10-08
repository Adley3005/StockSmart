import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { 
  Product, 
  CustomerFiado, 
  CartItem, 
  SaleTransaction, 
  PaymentMethod, 
  ActiveTab, 
  StockAdjustmentRecord,
  Lot
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, createSeedSales } from '../data/mockData';
import { 
  getStockStatus, 
  getExpiryDetails, 
  calculateSuggestedOrderQty, 
  getTodayISO, 
  formatLongDate,
  getProductEarliestExpiry
} from '../utils/helpers';

interface BodegaContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Products & Inventory
  products: Product[];
  stockCounts: { agotados: number; bajos: number; ok: number; total: number };
  expiryCounts: { vencidos: number; porVencer: number; vigente: number; total: number };
  createProduct: (productData: Omit<Product, 'id'>) => void;
  receiveStock: (productId: string, quantityToAdd: number, newExpiryDate: string) => void;
  adjustStockCount: (adjustments: { productId: string; physicalCount: number }[]) => void;
  reportMerma: (productId: string, quantity: number, reason: string) => void;
  editProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  stockAdjustments: StockAdjustmentRecord[];
  
  // Quick navigation filter trigger from Dashboard to Products
  inventoryFilterInitial: 'todos' | 'agotados' | 'bajos' | 'vencidos' | 'por_vencer';
  setInventoryFilterInitial: (filter: 'todos' | 'agotados' | 'bajos' | 'vencidos' | 'por_vencer') => void;

  // POS & Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemsCount: number;

  // Sales Processing & History
  sales: SaleTransaction[];
  processSale: (paymentMethod: PaymentMethod, amountPaid?: number, customerId?: string) => Promise<{ success: boolean; ticketNumber: string }>;
  undoLastSale: () => void;
  canUndoSale: boolean;
  undoTimeRemaining: number;
  lastSaleSummary: { ticketNumber: string; total: number; paymentMethod: PaymentMethod; isUndo: boolean } | null;

  // Shift & Sales Analytics (Derived from `sales`)
  salesTodayTotal: number;
  ticketsTodayCount: number;
  salesByMethod: Record<PaymentMethod, number>;
  comparisonLastWeekPercent: number; // e.g. 14.5
  topProducts: { product: Product; unitsSold: number; totalSalesSol: number }[];
  
  // Fiados
  customers: CustomerFiado[];
  fiadosSummary: { totalDebt: number; debtorCount: number; overLimitCount: number };
  registerAbono: (customerId: string, amount: number, method: PaymentMethod) => { changeDue: number };
  addCustomer: (name: string, reference: string, phone: string, creditLimit: number) => void;
  updateCreditLimit: (customerId: string, newLimit: number) => void;

  // System, Offline & Backup
  isOnline: boolean;
  toggleOnline: () => void;
  isSimulatedOffline: boolean;
  pendingSyncCount: number;
  syncOfflineData: () => void;
  shift: string;
  cashier: string;
  toggleShift: () => void;
  currentDateFormatted: string;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonString: string) => boolean;
  resetToDemoData: () => void;

  // Supplier Order WhatsApp helper
  supplierOrderItems: { product: Product; suggestedQty: number }[];

  // Non-blocking Toast Alerts
  toastAlert: { id: string; message: string; type: 'info' | 'warning' | 'success' | 'danger' } | null;
  showToast: (message: string, type?: 'info' | 'warning' | 'success' | 'danger') => void;
  clearToast: () => void;
}

const STORAGE_KEY = 'stocksmart_app_data_v2';

const BodegaContext = createContext<BodegaContextType | undefined>(undefined);

export const BodegaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('hoy');
  const [inventoryFilterInitial, setInventoryFilterInitial] = useState<'todos' | 'agotados' | 'bajos' | 'vencidos' | 'por_vencer'>('todos');

  // Load Initial State from localStorage with safe fallback
  const savedData = useMemo(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    return null;
  }, []);

  const [products, setProducts] = useState<Product[]>(() => savedData?.products || INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<CustomerFiado[]>(() => savedData?.customers || INITIAL_CUSTOMERS);
  const [sales, setSales] = useState<SaleTransaction[]>(() => savedData?.sales || createSeedSales());
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustmentRecord[]>(() => savedData?.stockAdjustments || []);
  const [ticketCounter, setTicketCounter] = useState<number>(() => savedData?.ticketCounter || 100);

  // Cart (session only)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Undo Sale State
  const [lastCompletedSale, setLastCompletedSale] = useState<SaleTransaction | null>(null);
  const [undoTimeRemaining, setUndoTimeRemaining] = useState<number>(0);
  const [lastSaleSummary, setLastSaleSummary] = useState<{ ticketNumber: string; total: number; paymentMethod: PaymentMethod; isUndo: boolean } | null>(null);

  // Offline Simulator & Real Network Status
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => savedData?.isSimulatedOffline || false);
  const [pendingSyncSales, setPendingSyncSales] = useState<SaleTransaction[]>(() => savedData?.pendingSyncSales || []);

  const isOnline = isBrowserOnline && !isSimulatedOffline;

  // Shift & Cashier
  const [shift, setShift] = useState<string>(() => savedData?.shift || 'Mañana');
  const [cashier, setCashier] = useState<string>(() => savedData?.cashier || 'Don Pepe');

  // Toasts
  const [toastAlert, setToastAlert] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'success' | 'danger' } | null>(null);

  // Auto-Persist to LocalStorage
  useEffect(() => {
    try {
      const dataToSave = {
        products,
        customers,
        sales,
        stockAdjustments,
        ticketCounter,
        isSimulatedOffline,
        pendingSyncSales,
        shift,
        cashier
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [products, customers, sales, stockAdjustments, ticketCounter, isSimulatedOffline, pendingSyncSales, shift, cashier]);

  // Real Network Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      showToast('Conexión a internet restaurada.', 'success');
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
      showToast('Se cortó la conexión a internet. Modo sin internet activado.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Single Source of Truth: Stock Counts
  const stockCounts = useMemo(() => {
    let agotados = 0;
    let bajos = 0;
    let ok = 0;

    products.forEach((p) => {
      const status = getStockStatus(p);
      if (status === 'Agotado') agotados++;
      else if (status === 'Bajo') bajos++;
      else ok++;
    });

    return {
      agotados,
      bajos,
      ok,
      total: products.length
    };
  }, [products]);

  // Single Source of Truth: Expiry Counts
  const expiryCounts = useMemo(() => {
    let vencidos = 0;
    let porVencer = 0;
    let vigente = 0;

    products.forEach((p) => {
      const details = getExpiryDetails(p);
      if (details.status === 'Vencido') vencidos++;
      else if (details.status === 'Por vencer') porVencer++;
      else vigente++;
    });

    return {
      vencidos,
      porVencer,
      vigente,
      total: products.length
    };
  }, [products]);

  // Single Source of Truth: Fiados Summary
  const fiadosSummary = useMemo(() => {
    let totalDebt = 0;
    let debtorCount = 0;
    let overLimitCount = 0;

    customers.forEach((c) => {
      if (c.balance > 0) {
        debtorCount++;
        totalDebt += c.balance;
      }
      if (c.balance > c.creditLimit) {
        overLimitCount++;
      }
    });

    return {
      totalDebt,
      debtorCount,
      overLimitCount
    };
  }, [customers]);

  // Cart Totals
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Supplier Order: gathering agotados + bajos with suggested quantities
  const supplierOrderItems = useMemo(() => {
    return products
      .filter((p) => p.stock < p.minStock)
      .map((p) => ({
        product: p,
        suggestedQty: calculateSuggestedOrderQty(p)
      }))
      .sort((a, b) => a.product.stock - b.product.stock); // Agotados first
  }, [products]);

  // FASE 2.1: Shift & Sales Analytics DERIVED EXCLUSIVELY FROM `sales`
  const activeTodaySales = useMemo(() => {
    const todayISO = getTodayISO();
    return sales.filter((s) => s.status === 'COMPLETED' && s.timestamp.startsWith(todayISO));
  }, [sales]);

  const salesTodayTotal = useMemo(() => {
    return activeTodaySales.reduce((sum, s) => sum + s.total, 0);
  }, [activeTodaySales]);

  const ticketsTodayCount = useMemo(() => {
    return activeTodaySales.length;
  }, [activeTodaySales]);

  const salesByMethod = useMemo(() => {
    const breakdown: Record<PaymentMethod, number> = {
      Efectivo: 0,
      Yape: 0,
      Plin: 0,
      Fiado: 0
    };
    activeTodaySales.forEach((s) => {
      breakdown[s.paymentMethod] = (breakdown[s.paymentMethod] || 0) + s.total;
    });
    return breakdown;
  }, [activeTodaySales]);

  // Top 5 Products derived organically from active sales items
  const topProducts = useMemo(() => {
    const itemMap = new Map<string, { product: Product; unitsSold: number; totalSalesSol: number }>();

    activeTodaySales.forEach((s) => {
      s.items.forEach((ci) => {
        const prod = ci.product;
        const current = itemMap.get(prod.id) || {
          product: prod,
          unitsSold: 0,
          totalSalesSol: 0
        };
        current.unitsSold += ci.quantity;
        current.totalSalesSol += ci.quantity * prod.price;
        itemMap.set(prod.id, current);
      });
    });

    const list = Array.from(itemMap.values());
    list.sort((a, b) => b.unitsSold - a.unitsSold);
    return list.slice(0, 5);
  }, [activeTodaySales]);

  // Undo Timer countdown
  useEffect(() => {
    if (undoTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setUndoTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setLastCompletedSale(null);
    }
  }, [undoTimeRemaining]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => {
        setToastAlert(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  const showToast = useCallback((message: string, type: 'info' | 'warning' | 'success' | 'danger' = 'info') => {
    setToastAlert({
      id: Date.now().toString(),
      message,
      type
    });
  }, []);

  const clearToast = useCallback(() => setToastAlert(null), []);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    const stockStatus = getStockStatus(product);
    const expiry = getExpiryDetails(product);

    if (expiry.status === 'Vencido') {
      showToast(`¡Cuidado! "${product.name}" está marcado como VENCIDO. Se recomienda no venderlo.`, 'danger');
    } else if (stockStatus === 'Agotado') {
      showToast(`Aviso: "${product.name}" tiene 0 unidades en sistema.`, 'warning');
    } else if (stockStatus === 'Bajo') {
      showToast(`Aviso: Quedan solo ${product.stock} ${product.unit}s de "${product.name}".`, 'info');
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // FASE 1.4: PROCESS SALE - Exact deduction & Real deducted tracking
  const processSale = async (
    paymentMethod: PaymentMethod, 
    amountPaid?: number, 
    customerId?: string
  ): Promise<{ success: boolean; ticketNumber: string }> => {
    if (cart.length === 0) return { success: false, ticketNumber: '' };

    const newTicketNum = ticketCounter + 1;
    setTicketCounter(newTicketNum);
    const ticketNumber = `TK-${newTicketNum.toString().padStart(4, '0')}`;
    const total = cartTotal;

    // Track exact units deducted per product
    const deductedMap: Record<string, number> = {};

    // 1. Deduct stock using FEFO (First Expired, First Out) if lots exist
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((ci) => ci.product.id === prod.id);
        if (!cartItem) return prod;

        // Exact units to deduct from available stock
        const realDeducted = Math.min(prod.stock, cartItem.quantity);
        deductedMap[prod.id] = realDeducted;
        const newStock = Math.max(0, prod.stock - realDeducted);

        // Deduct from lots if present
        let updatedLots = prod.lots ? [...prod.lots] : [];
        if (updatedLots.length > 0) {
          // Sort lots: earliest expiry first
          updatedLots.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
          let remainingToDeduct = realDeducted;

          updatedLots = updatedLots.map((lot) => {
            if (remainingToDeduct <= 0) return lot;
            const take = Math.min(lot.quantity, remainingToDeduct);
            remainingToDeduct -= take;
            return { ...lot, quantity: lot.quantity - take };
          }).filter(lot => lot.quantity > 0);
        }

        const newExpiryDate = getProductEarliestExpiry({
          ...prod,
          stock: newStock,
          lots: updatedLots
        });

        return {
          ...prod,
          stock: newStock,
          lots: updatedLots,
          expiryDate: newExpiryDate
        };
      })
    );

    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      ticketNumber,
      timestamp: new Date().toISOString(),
      items: [...cart],
      total,
      paymentMethod,
      amountPaid: amountPaid ?? total,
      change: amountPaid && amountPaid > total ? amountPaid - total : 0,
      customerId,
      synced: isOnline,
      status: 'COMPLETED',
      deducted: deductedMap
    };

    // 2. Add to sales history
    setSales((prev) => [newSale, ...prev]);

    // 3. If Fiado, update customer balance and ledger
    if (paymentMethod === 'Fiado' && customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customerId) {
            const newBalance = c.balance + total;
            const itemsSummary = cart.map((i) => `${i.quantity} ${i.product.name}`).join(', ');
            return {
              ...c,
              balance: newBalance,
              movements: [
                {
                  id: `mov-${Date.now()}`,
                  date: getTodayISO(),
                  description: `Compra fiada (${itemsSummary})`,
                  amount: total,
                  ticketNumber
                },
                ...c.movements
              ]
            };
          }
          return c;
        })
      );
    }

    // 4. Offline sync tracker
    if (!isOnline) {
      setPendingSyncSales((prev) => [...prev, newSale]);
      showToast(`Venta guardada sin internet (${ticketNumber}). Se sincronizará al volver la señal.`, 'warning');
    } else {
      showToast(`¡Venta cobrada con éxito! (${ticketNumber} · ${paymentMethod})`, 'success');
    }

    // 5. Setup 5-second Undo state
    setLastCompletedSale(newSale);
    setUndoTimeRemaining(5);
    setLastSaleSummary({
      ticketNumber,
      total,
      paymentMethod,
      isUndo: false
    });

    // 6. Clear cart
    clearCart();

    return { success: true, ticketNumber };
  };

  // FASE 1.4: UNDO LAST SALE - Returns ONLY what was actually deducted
  const undoLastSale = () => {
    if (!lastCompletedSale) return;

    // 1. Restore exact deducted stock
    setProducts((prev) =>
      prev.map((prod) => {
        const unitsToRestore = lastCompletedSale.deducted?.[prod.id] ?? 0;
        if (unitsToRestore <= 0) return prod;

        const newStock = prod.stock + unitsToRestore;
        let updatedLots = prod.lots ? [...prod.lots] : [];

        // Put back into lot or current expiry
        if (updatedLots.length > 0) {
          updatedLots[0] = {
            ...updatedLots[0],
            quantity: updatedLots[0].quantity + unitsToRestore
          };
        } else {
          updatedLots = [
            {
              id: `${prod.id}-restored-${Date.now()}`,
              quantity: newStock,
              expiryDate: prod.expiryDate,
              receivedAt: getTodayISO()
            }
          ];
        }

        return {
          ...prod,
          stock: newStock,
          lots: updatedLots
        };
      })
    );

    // 2. Mark the transaction as ANULADO in sales history (no duplicate ticket re-use)
    setSales((prev) =>
      prev.map((s) => (s.id === lastCompletedSale.id ? { ...s, status: 'ANULADO' } : s))
    );

    // 3. If fiado, reverse customer balance & movements
    if (lastCompletedSale.paymentMethod === 'Fiado' && lastCompletedSale.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === lastCompletedSale.customerId) {
            return {
              ...c,
              balance: Math.max(0, c.balance - lastCompletedSale.total),
              movements: c.movements.filter((m) => m.ticketNumber !== lastCompletedSale.ticketNumber)
            };
          }
          return c;
        })
      );
    }

    // 4. Remove from pending sync if it was there
    setPendingSyncSales((prev) => prev.filter((s) => s.id !== lastCompletedSale.id));

    const undoneTicket = lastCompletedSale.ticketNumber;
    setLastCompletedSale(null);
    setUndoTimeRemaining(0);
    setLastSaleSummary({
      ticketNumber: undoneTicket,
      total: lastCompletedSale.total,
      paymentMethod: lastCompletedSale.paymentMethod,
      isUndo: true
    });

    showToast(`Venta ${undoneTicket} anulada correctamente. Stock restituido sin duplicados.`, 'info');
  };

  // FASE 1.5: RECEIVE STOCK - Adds as new lot, retains expired lot visibility
  const receiveStock = (productId: string, quantityToAdd: number, newExpiryDate: string) => {
    if (!newExpiryDate) {
      showToast('Error: Debe ingresar una fecha de vencimiento válida para el nuevo lote.', 'danger');
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;

        const newLot: Lot = {
          id: `lot-${Date.now()}`,
          quantity: quantityToAdd,
          expiryDate: newExpiryDate,
          receivedAt: getTodayISO()
        };

        const existingLots = p.lots || [
          { id: `${p.id}-init`, quantity: p.stock, expiryDate: p.expiryDate, receivedAt: '2026-09-01' }
        ];

        const updatedLots = [...existingLots, newLot];
        const newStock = p.stock + quantityToAdd;
        // Earliest expiry date across all active lots
        const earliestExpiry = getProductEarliestExpiry({ ...p, lots: updatedLots });

        return {
          ...p,
          stock: newStock,
          lots: updatedLots,
          expiryDate: earliestExpiry
        };
      })
    );

    showToast(`Ingreso registrado: +${quantityToAdd} unidades añadidas con lote ${newExpiryDate}.`, 'success');
  };

  // FASE 1.3: ADJUST STOCK COUNT - Only updates touched items and records trace log
  const adjustStockCount = (adjustments: { productId: string; physicalCount: number }[]) => {
    if (adjustments.length === 0) return;

    const newRecords: StockAdjustmentRecord[] = [];

    setProducts((prev) =>
      prev.map((p) => {
        const adj = adjustments.find((a) => a.productId === p.id);
        if (adj === undefined) return p;

        const diff = adj.physicalCount - p.stock;
        newRecords.push({
          id: `adj-${Date.now()}-${p.id}`,
          timestamp: new Date().toISOString(),
          productId: p.id,
          productName: p.name,
          previousStock: p.stock,
          physicalCount: adj.physicalCount,
          difference: diff
        });

        // Adjust lots proportionally or in primary lot
        let updatedLots = p.lots ? [...p.lots] : [];
        if (updatedLots.length > 0) {
          updatedLots[0] = {
            ...updatedLots[0],
            quantity: Math.max(0, adj.physicalCount)
          };
        }

        return {
          ...p,
          stock: Math.max(0, adj.physicalCount),
          lots: updatedLots
        };
      })
    );

    setStockAdjustments((prev) => [...newRecords, ...prev]);
    showToast(`Inventario físico ajustado con éxito (${adjustments.length} productos actualizados).`, 'success');
  };

  // Report Merma - removes from expired lots first
  const reportMerma = (productId: string, quantity: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;

        const newStock = Math.max(0, p.stock - quantity);
        let updatedLots = p.lots ? [...p.lots] : [];

        if (updatedLots.length > 0) {
          // Remove from expired or earliest lot first
          let rem = quantity;
          updatedLots = updatedLots.map(l => {
            if (rem <= 0) return l;
            const take = Math.min(l.quantity, rem);
            rem -= take;
            return { ...l, quantity: l.quantity - take };
          }).filter(l => l.quantity > 0);
        }

        const newExpiryDate = getProductEarliestExpiry({ ...p, stock: newStock, lots: updatedLots });

        return {
          ...p,
          stock: newStock,
          lots: updatedLots,
          expiryDate: newExpiryDate
        };
      })
    );

    showToast(`Merma registrada: -${quantity} unidades retiradas (${reason}).`, 'warning');
  };

  // Create new product in catalog (Fase 4.3)
  const createProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      lots: [
        {
          id: `lot-new-${Date.now()}`,
          quantity: productData.stock,
          expiryDate: productData.expiryDate,
          receivedAt: getTodayISO()
        }
      ]
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Producto "${newProduct.name}" agregado al catálogo con éxito.`, 'success');
  };

  // Edit Product
  const editProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    showToast('Producto actualizado correctamente.', 'success');
  };

  // Delete Product
  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Producto eliminado del catálogo.', 'info');
  };

  // FASE 4.4: Register Abono - handles exact balance & surplus without loss
  const registerAbono = (customerId: string, amount: number, method: PaymentMethod): { changeDue: number } => {
    let changeDue = 0;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customerId) return c;

        if (amount > c.balance) {
          changeDue = amount - c.balance;
        }

        const newBal = Math.max(0, c.balance - amount);
        const description = changeDue > 0
          ? `Abono (${method}) - Cancelación total (Vuelto: S/ ${changeDue.toFixed(2)})`
          : `Abono recibido (${method})`;

        return {
          ...c,
          balance: newBal,
          lastPaymentDaysAgo: 0,
          movements: [
            {
              id: `mov-${Date.now()}`,
              date: getTodayISO(),
              description,
              amount: -Math.min(amount, c.balance),
              method
            },
            ...c.movements
          ]
        };
      })
    );

    showToast(`Abono de S/ ${amount.toFixed(2)} registrado correctamente.`, 'success');
    return { changeDue };
  };

  // Add Customer
  const addCustomer = (name: string, reference: string, phone: string, creditLimit: number) => {
    const newCustomer: CustomerFiado = {
      id: `cust-${Date.now()}`,
      name,
      reference,
      phone,
      balance: 0,
      creditLimit,
      lastPaymentDaysAgo: 0,
      movements: [
        {
          id: `mov-${Date.now()}`,
          date: getTodayISO(),
          description: 'Apertura de libreta de fiados en la bodega',
          amount: 0
        }
      ]
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Vecino(a) "${name}" registrado(a) en el cuaderno.`, 'success');
  };

  // Update Credit Limit
  const updateCreditLimit = (customerId: string, newLimit: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, creditLimit: newLimit } : c))
    );
    showToast('Tope de fiado actualizado.', 'info');
  };

  // Offline Simulation Toggle (Safe without updater side-effects)
  const toggleOnline = () => {
    setIsSimulatedOffline((prev) => {
      const nextSimulated = !prev;
      if (nextSimulated) {
        showToast('Modo de prueba sin internet activado.', 'warning');
      } else {
        showToast('Modo en línea restaurado.', 'success');
      }
      return nextSimulated;
    });
  };

  const syncOfflineData = () => {
    if (pendingSyncSales.length > 0) {
      showToast(`Sincronizadas ${pendingSyncSales.length} ventas locales con el servidor.`, 'success');
      setPendingSyncSales([]);
    }
  };

  const toggleShift = () => {
    setShift((prev) => (prev === 'Mañana' ? 'Tarde' : 'Mañana'));
    setCashier((prev) => (prev === 'Don Pepe' ? 'Doña Mary' : 'Don Pepe'));
    showToast(`Cambiado a Turno ${shift === 'Mañana' ? 'Tarde' : 'Mañana'} (${cashier === 'Don Pepe' ? 'Doña Mary' : 'Don Pepe'}).`, 'info');
  };

  // Backup & Restore
  const exportBackupJSON = (): string => {
    const backup = {
      version: '2.4',
      exportedAt: new Date().toISOString(),
      products,
      customers,
      sales,
      stockAdjustments,
      ticketCounter
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.products) && Array.isArray(data.customers)) {
        setProducts(data.products);
        setCustomers(data.customers);
        if (Array.isArray(data.sales)) setSales(data.sales);
        if (Array.isArray(data.stockAdjustments)) setStockAdjustments(data.stockAdjustments);
        if (data.ticketCounter) setTicketCounter(data.ticketCounter);
        showToast('Copia de seguridad restaurada con éxito.', 'success');
        return true;
      }
    } catch (e) {
      console.error(e);
      showToast('Error: archivo de respaldo no válido.', 'danger');
    }
    return false;
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(createSeedSales());
    setStockAdjustments([]);
    setTicketCounter(100);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Datos reiniciados a los valores de demostración de bodega.', 'info');
  };

  return (
    <BodegaContext.Provider
      value={{
        activeTab,
        setActiveTab,
        products,
        stockCounts,
        expiryCounts,
        createProduct,
        receiveStock,
        adjustStockCount,
        reportMerma,
        editProduct,
        deleteProduct,
        stockAdjustments,
        inventoryFilterInitial,
        setInventoryFilterInitial,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemsCount,
        sales,
        processSale,
        undoLastSale,
        canUndoSale: undoTimeRemaining > 0,
        undoTimeRemaining,
        lastSaleSummary,
        salesTodayTotal,
        ticketsTodayCount,
        salesByMethod,
        comparisonLastWeekPercent: 14.5,
        topProducts,
        customers,
        fiadosSummary,
        registerAbono,
        addCustomer,
        updateCreditLimit,
        isOnline,
        toggleOnline,
        isSimulatedOffline,
        pendingSyncCount: pendingSyncSales.length,
        syncOfflineData,
        shift,
        cashier,
        toggleShift,
        currentDateFormatted: formatLongDate(),
        exportBackupJSON,
        importBackupJSON,
        resetToDemoData,
        supplierOrderItems,
        toastAlert,
        showToast,
        clearToast
      }}
    >
      {children}
    </BodegaContext.Provider>
  );
};

export const useBodega = () => {
  const context = useContext(BodegaContext);
  if (!context) {
    throw new Error('useBodega must be used within a BodegaProvider');
  }
  return context;
};
