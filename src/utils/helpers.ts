import { Product, StockStatus, ExpiryStatus, CustomerFiado } from '../types';

/**
 * Fecha única del sistema basada en zona horaria peruana
 */
export function getTodayISO(): string {
  // ISO format YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLongDate(date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const str = date.toLocaleDateString('es-PE', options);
  // Capitalize first letter
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getDaysDifference(targetDate: string, baseDate: string = getTodayISO()): number {
  if (!targetDate) return 999;
  const [tY, tM, tD] = targetDate.split('-').map(Number);
  const [bY, bM, bD] = baseDate.split('-').map(Number);
  
  const target = new Date(tY, tM - 1, tD);
  const base = new Date(bY, bM - 1, bD);
  
  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getStockStatus(product: Product): StockStatus {
  if (product.stock === 0) return 'Agotado';
  if (product.stock < product.minStock) return 'Bajo';
  return 'OK';
}

export interface ExpiryDetails {
  status: ExpiryStatus;
  daysDiff: number;
  label: string;
  hasExpiredUnits?: boolean;
}

/**
 * Obtiene la fecha de vencimiento más crítica/próxima del producto (o de sus lotes)
 */
export function getProductEarliestExpiry(product: Product): string {
  if (product.lots && product.lots.length > 0) {
    const activeLots = product.lots.filter(l => l.quantity > 0);
    if (activeLots.length > 0) {
      const sorted = [...activeLots].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
      return sorted[0].expiryDate;
    }
  }
  return product.expiryDate;
}

export function getExpiryDetails(product: Product): ExpiryDetails {
  const criticalDate = getProductEarliestExpiry(product);
  const daysDiff = getDaysDifference(criticalDate, getTodayISO());

  if (daysDiff < 0) {
    const absDays = Math.abs(daysDiff);
    return {
      status: 'Vencido',
      daysDiff,
      label: absDays === 1 ? 'Vencido ayer' : `Vencido hace ${absDays} días`,
      hasExpiredUnits: true
    };
  }

  if (daysDiff === 0) {
    return {
      status: 'Por vencer',
      daysDiff,
      label: 'Vence hoy'
    };
  }

  if (daysDiff <= 7) {
    return {
      status: 'Por vencer',
      daysDiff,
      label: daysDiff === 1 ? 'Vence mañana' : `Vence en ${daysDiff} días`
    };
  }

  return {
    status: 'Vigente',
    daysDiff,
    label: `Vence el ${formatDateShort(criticalDate)}`
  };
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  const monthIdx = parseInt(m, 10) - 1;
  return `${d} ${months[monthIdx]} ${y}`;
}

export function formatCurrency(amount: number): string {
  return `S/ ${(amount || 0).toFixed(2)}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '';
  const start = phone.slice(0, 3);
  const end = phone.slice(-3);
  return `${start}-•••-${end}`;
}

/**
 * Diccionario de pluralización de unidades de bodega (para evitar "kgs")
 */
export function getUnitPluralName(unit: string): string {
  const plurals: Record<string, string> = {
    bolsa: 'bolsas',
    lata: 'latas',
    botella: 'botellas',
    kg: 'kg', // En español no se usa "kgs"
    paquete: 'paquetes'
  };
  return plurals[unit] || unit + 's';
}

export function formatUnitPlural(count: number, unit: string): string {
  if (count === 1) return `${count} ${unit}`;
  return `${count} ${getUnitPluralName(unit)}`;
}

/**
 * Sugiere cantidad a reponer:
 * Reúne agotados y bajos, sugiere cantidades (mínimo − actual + margen)
 */
export function calculateSuggestedOrderQty(product: Product): number {
  if (product.stock >= product.minStock) return 0;
  const deficit = product.minStock - product.stock;
  // Margen de seguridad: 50% del stock mínimo (redondeado hacia arriba)
  const margin = Math.max(2, Math.ceil(product.minStock * 0.5));
  return deficit + margin;
}

/**
 * Calcula días desde el último abono a partir de sus movimientos
 */
export function getCustomerLastPaymentDays(customer: CustomerFiado): number {
  if (!customer.movements || customer.movements.length === 0) return 0;
  // Buscar movimiento de abono más reciente (monto < 0)
  const abonos = customer.movements.filter(m => m.amount < 0);
  if (abonos.length === 0) return customer.lastPaymentDaysAgo ?? 15;
  const latestAbono = abonos[0]; // están ordenados del más reciente al más antiguo
  const daysDiff = getDaysDifference(latestAbono.date, getTodayISO());
  return Math.max(0, Math.abs(daysDiff));
}
