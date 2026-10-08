export type StockStatus = 'Agotado' | 'Bajo' | 'OK';
export type ExpiryStatus = 'Vencido' | 'Por vencer' | 'Vigente';

export type UnitOfMeasure = 'bolsa' | 'lata' | 'botella' | 'kg' | 'paquete';

export type ProductCategory = 'Abarrotes' | 'Lácteos' | 'Bebidas' | 'Snacks' | 'Limpieza';

export interface Lot {
  id: string;
  quantity: number;
  expiryDate: string; // YYYY-MM-DD
  receivedAt: string; // YYYY-MM-DD
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // S/
  cost: number; // S/ costo proveedor
  stock: number;
  minStock: number;
  unit: UnitOfMeasure;
  expiryDate: string; // YYYY-MM-DD (fecha del lote más próximo a vencer)
  barcode: string;
  isTopSeller?: boolean; // Para grilla de 8 más vendidos
  lots?: Lot[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'Efectivo' | 'Yape' | 'Plin' | 'Fiado';

export interface SaleTransaction {
  id: string;
  ticketNumber: string;
  timestamp: string; // ISO string
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid?: number;
  change?: number;
  customerName?: string;
  customerId?: string;
  synced: boolean;
  status: 'COMPLETED' | 'ANULADO';
  deducted: Record<string, number>; // Cantidad real descontada por producto
}

export interface CustomerMovement {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for fiado sale, negative for abono
  ticketNumber?: string;
  method?: string;
}

export interface CustomerFiado {
  id: string;
  name: string;
  reference: string; // e.g. "Esquina Mz A Lote 12"
  phone: string; // e.g. "987654321"
  balance: number; // saldo actual
  creditLimit: number; // tope de crédito
  lastPaymentDaysAgo?: number; // derivado o histórico
  movements: CustomerMovement[];
}

export interface StockAdjustmentRecord {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  previousStock: number;
  physicalCount: number;
  difference: number;
}

export type ActiveTab = 'hoy' | 'vender' | 'productos' | 'fiados';

export type ProductFilter = 'todos' | 'agotados' | 'bajos' | 'vencidos' | 'por_vencer';

export interface SystemStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  shiftName: string;
  cashierName: string;
  currentDateFormatted: string;
}
