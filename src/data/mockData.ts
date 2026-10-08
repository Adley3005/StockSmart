import { Product, CustomerFiado, SaleTransaction } from '../types';
import { getTodayISO } from '../utils/helpers';

const TODAY = getTodayISO();

export const INITIAL_PRODUCTS: Product[] = [
  // --- ABARROTES (14) ---
  {
    id: 'prod-01',
    name: 'Arroz Costeño Extra 1kg',
    category: 'Abarrotes',
    price: 4.80,
    cost: 3.90,
    stock: 0, // Agotado
    minStock: 12,
    unit: 'bolsa',
    expiryDate: '2027-02-15',
    barcode: '775012300001',
    isTopSeller: true,
    lots: []
  },
  {
    id: 'prod-02',
    name: 'Azúcar Rubia Paramonga 1kg',
    category: 'Abarrotes',
    price: 4.20,
    cost: 3.40,
    stock: 4, // Bajo (min 10)
    minStock: 10,
    unit: 'bolsa',
    expiryDate: '2027-06-30',
    barcode: '775012300002',
    isTopSeller: true,
    lots: [
      { id: 'prod-02-l1', quantity: 4, expiryDate: '2027-06-30', receivedAt: '2026-09-15' }
    ]
  },
  {
    id: 'prod-03',
    name: 'Aceite Primor Clásico 1L',
    category: 'Abarrotes',
    price: 9.50,
    cost: 7.80,
    stock: 0, // Agotado
    minStock: 8,
    unit: 'botella',
    expiryDate: '2027-04-10',
    barcode: '775012300003',
    isTopSeller: true,
    lots: []
  },
  {
    id: 'prod-04',
    name: 'Fideos Don Vittorio Lavaggi 500g',
    category: 'Abarrotes',
    price: 3.40,
    cost: 2.70,
    stock: 2, // Bajo (min 10)
    minStock: 10,
    unit: 'bolsa',
    expiryDate: '2027-03-15',
    barcode: '775012300004',
    isTopSeller: true,
    lots: [
      { id: 'prod-04-l1', quantity: 2, expiryDate: '2027-03-15', receivedAt: '2026-09-10' }
    ]
  },
  {
    id: 'prod-05',
    name: 'Fideos Molitalia Canuto 500g',
    category: 'Abarrotes',
    price: 3.60,
    cost: 2.90,
    stock: 14,
    minStock: 8,
    unit: 'bolsa',
    expiryDate: '2027-05-10',
    barcode: '775012300005',
    lots: [
      { id: 'prod-05-l1', quantity: 14, expiryDate: '2027-05-10', receivedAt: '2026-09-12' }
    ]
  },
  {
    id: 'prod-06',
    name: 'Atún Primor Lomitos en Aceite 170g',
    category: 'Abarrotes',
    price: 5.80,
    cost: 4.60,
    stock: 20,
    minStock: 10,
    unit: 'lata',
    expiryDate: '2027-11-20',
    barcode: '775012300006',
    lots: [
      { id: 'prod-06-l1', quantity: 20, expiryDate: '2027-11-20', receivedAt: '2026-09-01' }
    ]
  },
  {
    id: 'prod-07',
    name: 'Gratinado Real Filete de Atún 170g',
    category: 'Abarrotes',
    price: 4.90,
    cost: 3.80,
    stock: 16,
    minStock: 8,
    unit: 'lata',
    expiryDate: '2027-09-12',
    barcode: '775012300007',
    lots: [
      { id: 'prod-07-l1', quantity: 16, expiryDate: '2027-09-12', receivedAt: '2026-08-20' }
    ]
  },
  {
    id: 'prod-08',
    name: 'Sal de Mesa Marina Emsal 1kg',
    category: 'Abarrotes',
    price: 1.80,
    cost: 1.20,
    stock: 25,
    minStock: 10,
    unit: 'bolsa',
    expiryDate: '2028-01-01',
    barcode: '775012300008',
    lots: [
      { id: 'prod-08-l1', quantity: 25, expiryDate: '2028-01-01', receivedAt: '2026-07-10' }
    ]
  },
  {
    id: 'prod-09',
    name: 'Avena 3 Ositos Clásica 300g',
    category: 'Abarrotes',
    price: 2.90,
    cost: 2.20,
    stock: 15,
    minStock: 8,
    unit: 'bolsa',
    expiryDate: '2027-03-01',
    barcode: '775012300009',
    lots: [
      { id: 'prod-09-l1', quantity: 15, expiryDate: '2027-03-01', receivedAt: '2026-08-15' }
    ]
  },
  {
    id: 'prod-10',
    name: 'Avena Quaker Tradicional 330g',
    category: 'Abarrotes',
    price: 3.50,
    cost: 2.70,
    stock: 12,
    minStock: 6,
    unit: 'bolsa',
    expiryDate: '2027-04-18',
    barcode: '775012300010',
    lots: [
      { id: 'prod-10-l1', quantity: 12, expiryDate: '2027-04-18', receivedAt: '2026-08-20' }
    ]
  },
  {
    id: 'prod-11',
    name: 'Lenteja Criolla Costeño 500g',
    category: 'Abarrotes',
    price: 4.50,
    cost: 3.50,
    stock: 10,
    minStock: 6,
    unit: 'bolsa',
    expiryDate: '2027-07-22',
    barcode: '775012300011',
    lots: [
      { id: 'prod-11-l1', quantity: 10, expiryDate: '2027-07-22', receivedAt: '2026-08-01' }
    ]
  },
  {
    id: 'prod-12',
    name: 'Salsa de Tomate Pomarola 150g',
    category: 'Abarrotes',
    price: 2.20,
    cost: 1.60,
    stock: 18,
    minStock: 10,
    unit: 'bolsa',
    expiryDate: '2027-02-28',
    barcode: '775012300012',
    lots: [
      { id: 'prod-12-l1', quantity: 18, expiryDate: '2027-02-28', receivedAt: '2026-08-10' }
    ]
  },
  {
    id: 'prod-13',
    name: 'Sillao Kikko 150ml',
    category: 'Abarrotes',
    price: 2.50,
    cost: 1.80,
    stock: 14,
    minStock: 6,
    unit: 'botella',
    expiryDate: '2027-10-15',
    barcode: '775012300013',
    lots: [
      { id: 'prod-13-l1', quantity: 14, expiryDate: '2027-10-15', receivedAt: '2026-09-01' }
    ]
  },
  {
    id: 'prod-14',
    name: 'Huevos Rosados de Granja 1kg',
    category: 'Abarrotes',
    price: 8.50,
    cost: 7.20,
    stock: 18,
    minStock: 8,
    unit: 'kg',
    expiryDate: '2026-10-28',
    barcode: '775012300014',
    isTopSeller: true,
    lots: [
      { id: 'prod-14-l1', quantity: 18, expiryDate: '2026-10-28', receivedAt: '2026-10-02' }
    ]
  },

  // --- LÁCTEOS (8) ---
  {
    id: 'prod-15',
    name: 'Leche Gloria Azul Entera 400g',
    category: 'Lácteos',
    price: 4.30,
    cost: 3.60,
    stock: 3, // Bajo (min 16)
    minStock: 16,
    unit: 'lata',
    expiryDate: '2027-05-20',
    barcode: '775012300015',
    isTopSeller: true,
    lots: [
      { id: 'prod-15-l1', quantity: 3, expiryDate: '2027-05-20', receivedAt: '2026-09-01' }
    ]
  },
  {
    id: 'prod-16',
    name: 'Leche Gloria Evaporada Roja 400g',
    category: 'Lácteos',
    price: 4.30,
    cost: 3.60,
    stock: 12,
    minStock: 8,
    unit: 'lata',
    expiryDate: '2027-06-15',
    barcode: '775012300016',
    lots: [
      { id: 'prod-16-l1', quantity: 12, expiryDate: '2027-06-15', receivedAt: '2026-09-05' }
    ]
  },
  {
    id: 'prod-17',
    name: 'Yogur Gloria Fresa 1L',
    category: 'Lácteos',
    price: 6.50,
    cost: 5.10,
    stock: 4, // OK de stock pero Vencido hace 18 días
    minStock: 3,
    unit: 'botella',
    expiryDate: '2026-09-20', // Vencido
    barcode: '775012300017',
    lots: [
      { id: 'prod-17-l1', quantity: 4, expiryDate: '2026-09-20', receivedAt: '2026-08-20' }
    ]
  },
  {
    id: 'prod-18',
    name: 'Leche Chocolatada Gloria 1L',
    category: 'Lácteos',
    price: 5.90,
    cost: 4.70,
    stock: 6, // OK de stock, Por vencer en 3 días
    minStock: 4,
    unit: 'botella',
    expiryDate: '2026-10-11',
    barcode: '775012300018',
    lots: [
      { id: 'prod-18-l1', quantity: 6, expiryDate: '2026-10-11', receivedAt: '2026-09-10' }
    ]
  },
  {
    id: 'prod-19',
    name: 'Margarina Dorina 225g',
    category: 'Lácteos',
    price: 3.20,
    cost: 2.50,
    stock: 1, // Bajo Y por vencer
    minStock: 4,
    unit: 'bolsa',
    expiryDate: '2026-10-13',
    barcode: '775012300019',
    lots: [
      { id: 'prod-19-l1', quantity: 1, expiryDate: '2026-10-13', receivedAt: '2026-08-20' }
    ]
  },
  {
    id: 'prod-20',
    name: 'Mantequilla Gloria con Sal 200g',
    category: 'Lácteos',
    price: 6.80,
    cost: 5.40,
    stock: 9,
    minStock: 4,
    unit: 'bolsa',
    expiryDate: '2026-11-30',
    barcode: '775012300020',
    lots: [
      { id: 'prod-20-l1', quantity: 9, expiryDate: '2026-11-30', receivedAt: '2026-09-12' }
    ]
  },
  {
    id: 'prod-21',
    name: 'Queso Fresco Pasteurizado 500g',
    category: 'Lácteos',
    price: 11.50,
    cost: 9.00,
    stock: 3, // OK stock, Por vencer en 2 días
    minStock: 2,
    unit: 'bolsa',
    expiryDate: '2026-10-10',
    barcode: '775012300021',
    lots: [
      { id: 'prod-21-l1', quantity: 3, expiryDate: '2026-10-10', receivedAt: '2026-10-01' }
    ]
  },
  {
    id: 'prod-22',
    name: 'Jamónada Especial San Fernando 250g',
    category: 'Lácteos',
    price: 4.80,
    cost: 3.80,
    stock: 5, // OK stock, Por vencer en 6 días
    minStock: 3,
    unit: 'paquete',
    expiryDate: '2026-10-14',
    barcode: '775012300022',
    lots: [
      { id: 'prod-22-l1', quantity: 5, expiryDate: '2026-10-14', receivedAt: '2026-09-25' }
    ]
  },

  // --- BEBIDAS (10) ---
  {
    id: 'prod-23',
    name: 'Gaseosa Inka Kola 500ml',
    category: 'Bebidas',
    price: 3.00,
    cost: 2.20,
    stock: 5, // Bajo (min 18)
    minStock: 18,
    unit: 'botella',
    expiryDate: '2026-12-20',
    barcode: '775012300023',
    isTopSeller: true,
    lots: [
      { id: 'prod-23-l1', quantity: 5, expiryDate: '2026-12-20', receivedAt: '2026-09-10' }
    ]
  },
  {
    id: 'prod-24',
    name: 'Gaseosa Coca Cola 500ml',
    category: 'Bebidas',
    price: 3.00,
    cost: 2.20,
    stock: 14,
    minStock: 12,
    unit: 'botella',
    expiryDate: '2026-12-24',
    barcode: '775012300024',
    lots: [
      { id: 'prod-24-l1', quantity: 14, expiryDate: '2026-12-24', receivedAt: '2026-09-15' }
    ]
  },
  {
    id: 'prod-25',
    name: 'Gaseosa Inka Kola 1.5L',
    category: 'Bebidas',
    price: 6.80,
    cost: 5.30,
    stock: 8,
    minStock: 6,
    unit: 'botella',
    expiryDate: '2027-01-15',
    barcode: '775012300025',
    lots: [
      { id: 'prod-25-l1', quantity: 8, expiryDate: '2027-01-15', receivedAt: '2026-09-18' }
    ]
  },
  {
    id: 'prod-26',
    name: 'Gaseosa Coca Cola 1.5L',
    category: 'Bebidas',
    price: 6.80,
    cost: 5.30,
    stock: 7,
    minStock: 6,
    unit: 'botella',
    expiryDate: '2027-01-20',
    barcode: '775012300026',
    lots: [
      { id: 'prod-26-l1', quantity: 7, expiryDate: '2027-01-20', receivedAt: '2026-09-18' }
    ]
  },
  {
    id: 'prod-27',
    name: 'Agua San Luis Sin Gas 625ml',
    category: 'Bebidas',
    price: 2.00,
    cost: 1.30,
    stock: 24,
    minStock: 12,
    unit: 'botella',
    expiryDate: '2027-06-10',
    barcode: '775012300027',
    lots: [
      { id: 'prod-27-l1', quantity: 24, expiryDate: '2027-06-10', receivedAt: '2026-09-20' }
    ]
  },
  {
    id: 'prod-28',
    name: 'Agua San Luis Con Gas 625ml',
    category: 'Bebidas',
    price: 2.00,
    cost: 1.30,
    stock: 15,
    minStock: 8,
    unit: 'botella',
    expiryDate: '2027-06-12',
    barcode: '775012300028',
    lots: [
      { id: 'prod-28-l1', quantity: 15, expiryDate: '2027-06-12', receivedAt: '2026-09-20' }
    ]
  },
  {
    id: 'prod-29',
    name: 'Agua Cielo 625ml',
    category: 'Bebidas',
    price: 1.50,
    cost: 0.90,
    stock: 20,
    minStock: 10,
    unit: 'botella',
    expiryDate: '2027-05-18',
    barcode: '775012300029',
    lots: [
      { id: 'prod-29-l1', quantity: 20, expiryDate: '2027-05-18', receivedAt: '2026-09-15' }
    ]
  },
  {
    id: 'prod-30',
    name: 'Cerveza Cristal Lata 355ml',
    category: 'Bebidas',
    price: 4.50,
    cost: 3.50,
    stock: 18,
    minStock: 12,
    unit: 'lata',
    expiryDate: '2027-03-30',
    barcode: '775012300030',
    lots: [
      { id: 'prod-30-l1', quantity: 18, expiryDate: '2027-03-30', receivedAt: '2026-09-01' }
    ]
  },
  {
    id: 'prod-31',
    name: 'Cerveza Pilsen Callao Lata 355ml',
    category: 'Bebidas',
    price: 4.80,
    cost: 3.70,
    stock: 16,
    minStock: 12,
    unit: 'lata',
    expiryDate: '2027-04-05',
    barcode: '775012300031',
    lots: [
      { id: 'prod-31-l1', quantity: 16, expiryDate: '2027-04-05', receivedAt: '2026-09-01' }
    ]
  },
  {
    id: 'prod-32',
    name: 'Rehidratante Sporade Mandarina 500ml',
    category: 'Bebidas',
    price: 2.50,
    cost: 1.80,
    stock: 12,
    minStock: 6,
    unit: 'botella',
    expiryDate: '2027-02-14',
    barcode: '775012300032',
    lots: [
      { id: 'prod-32-l1', quantity: 12, expiryDate: '2027-02-14', receivedAt: '2026-09-10' }
    ]
  },

  // --- SNACKS Y GOLOSINAS (10) ---
  {
    id: 'prod-33',
    name: 'Pan de Molde Bimbo Blanco 480g',
    category: 'Snacks',
    price: 6.90,
    cost: 5.50,
    stock: 2, // OK stock, Vencido hace 4 días
    minStock: 2,
    unit: 'bolsa',
    expiryDate: '2026-10-04', // Vencido
    barcode: '775012300033',
    lots: [
      { id: 'prod-33-l1', quantity: 2, expiryDate: '2026-10-04', receivedAt: '2026-09-25' }
    ]
  },
  {
    id: 'prod-34',
    name: 'Pan Francés Bolsa x 10 unids',
    category: 'Snacks',
    price: 3.00,
    cost: 2.20,
    stock: 15,
    minStock: 6,
    unit: 'bolsa',
    expiryDate: '2026-10-09',
    barcode: '775012300034',
    isTopSeller: true,
    lots: [
      { id: 'prod-34-l1', quantity: 15, expiryDate: '2026-10-09', receivedAt: '2026-10-08' }
    ]
  },
  {
    id: 'prod-35',
    name: 'Galletas Casino Menta 6 unids',
    category: 'Snacks',
    price: 1.20,
    cost: 0.85,
    stock: 22,
    minStock: 10,
    unit: 'paquete',
    expiryDate: '2027-04-12',
    barcode: '775012300035',
    lots: [
      { id: 'prod-35-l1', quantity: 22, expiryDate: '2027-04-12', receivedAt: '2026-09-01' }
    ]
  },
  {
    id: 'prod-36',
    name: 'Galletas Margarita Field 4 unids',
    category: 'Snacks',
    price: 1.00,
    cost: 0.70,
    stock: 30,
    minStock: 12,
    unit: 'paquete',
    expiryDate: '2027-05-01',
    barcode: '775012300036',
    lots: [
      { id: 'prod-36-l1', quantity: 30, expiryDate: '2027-05-01', receivedAt: '2026-09-05' }
    ]
  },
  {
    id: 'prod-37',
    name: 'Galletas Soda San Jorge 6 unids',
    category: 'Snacks',
    price: 1.00,
    cost: 0.70,
    stock: 25,
    minStock: 12,
    unit: 'paquete',
    expiryDate: '2027-06-15',
    barcode: '775012300037',
    lots: [
      { id: 'prod-37-l1', quantity: 25, expiryDate: '2027-06-15', receivedAt: '2026-09-10' }
    ]
  },
  {
    id: 'prod-38',
    name: 'Galletas Oreo Regular 108g',
    category: 'Snacks',
    price: 2.50,
    cost: 1.80,
    stock: 0, // Agotado
    minStock: 15,
    unit: 'paquete',
    expiryDate: '2026-12-01',
    barcode: '775012300038',
    lots: []
  },
  {
    id: 'prod-39',
    name: 'Chizitos Karinto Picante 45g',
    category: 'Snacks',
    price: 1.50,
    cost: 1.00,
    stock: 18,
    minStock: 10,
    unit: 'bolsa',
    expiryDate: '2027-01-20',
    barcode: '775012300039',
    lots: [
      { id: 'prod-39-l1', quantity: 18, expiryDate: '2027-01-20', receivedAt: '2026-09-15' }
    ]
  },
  {
    id: 'prod-40',
    name: 'Cuates Picantes 45g',
    category: 'Snacks',
    price: 1.20,
    cost: 0.80,
    stock: 16,
    minStock: 8,
    unit: 'bolsa',
    expiryDate: '2027-02-18',
    barcode: '775012300040',
    lots: [
      { id: 'prod-40-l1', quantity: 16, expiryDate: '2027-02-18', receivedAt: '2026-09-15' }
    ]
  },
  {
    id: 'prod-41',
    name: 'Chocolate Sublime Clásico 30g',
    category: 'Snacks',
    price: 2.00,
    cost: 1.40,
    stock: 20,
    minStock: 10,
    unit: 'paquete',
    expiryDate: '2027-04-20',
    barcode: '775012300041',
    lots: [
      { id: 'prod-41-l1', quantity: 20, expiryDate: '2027-04-20', receivedAt: '2026-09-12' }
    ]
  },
  {
    id: 'prod-42',
    name: 'Caramelos Sayón Limón Bolsa 100g',
    category: 'Snacks',
    price: 3.50,
    cost: 2.50,
    stock: 10,
    minStock: 5,
    unit: 'bolsa',
    expiryDate: '2027-08-10',
    barcode: '775012300042',
    lots: [
      { id: 'prod-42-l1', quantity: 10, expiryDate: '2027-08-10', receivedAt: '2026-09-01' }
    ]
  },

  // --- LIMPIEZA Y ASEO (6) ---
  {
    id: 'prod-43',
    name: 'Detergente Bolívar Floral 800g',
    category: 'Limpieza',
    price: 7.20,
    cost: 5.80,
    stock: 11,
    minStock: 6,
    unit: 'bolsa',
    expiryDate: '2028-02-01',
    barcode: '775012300043',
    lots: [
      { id: 'prod-43-l1', quantity: 11, expiryDate: '2028-02-01', receivedAt: '2026-08-01' }
    ]
  },
  {
    id: 'prod-44',
    name: 'Lavavajillas Ayudín Limón Pasta 350g',
    category: 'Limpieza',
    price: 3.60,
    cost: 2.80,
    stock: 14,
    minStock: 6,
    unit: 'lata',
    expiryDate: '2028-05-10',
    barcode: '775012300044',
    lots: [
      { id: 'prod-44-l1', quantity: 14, expiryDate: '2028-05-10', receivedAt: '2026-08-10' }
    ]
  },
  {
    id: 'prod-45',
    name: 'Lejía Sapolio Clásica 1L',
    category: 'Limpieza',
    price: 3.20,
    cost: 2.30,
    stock: 12,
    minStock: 6,
    unit: 'botella',
    expiryDate: '2028-04-15',
    barcode: '775012300045',
    lots: [
      { id: 'prod-45-l1', quantity: 12, expiryDate: '2028-04-15', receivedAt: '2026-08-15' }
    ]
  },
  {
    id: 'prod-46',
    name: 'Jabón Bolívar Rosado 180g',
    category: 'Limpieza',
    price: 2.80,
    cost: 2.00,
    stock: 15,
    minStock: 8,
    unit: 'paquete',
    expiryDate: '2028-06-01',
    barcode: '775012300046',
    lots: [
      { id: 'prod-46-l1', quantity: 15, expiryDate: '2028-06-01', receivedAt: '2026-08-15' }
    ]
  },
  {
    id: 'prod-47',
    name: 'Papel Higiénico Paracas Doble Hoja x 4',
    category: 'Limpieza',
    price: 5.50,
    cost: 4.20,
    stock: 16,
    minStock: 8,
    unit: 'paquete',
    expiryDate: '2029-01-01',
    barcode: '775012300047',
    lots: [
      { id: 'prod-47-l1', quantity: 16, expiryDate: '2029-01-01', receivedAt: '2026-09-01' }
    ]
  },
  {
    id: 'prod-48',
    name: 'Papel Toalla Nova Clásico x 2',
    category: 'Limpieza',
    price: 4.80,
    cost: 3.60,
    stock: 10,
    minStock: 5,
    unit: 'paquete',
    expiryDate: '2029-01-01',
    barcode: '775012300048',
    lots: [
      { id: 'prod-48-l1', quantity: 10, expiryDate: '2029-01-01', receivedAt: '2026-09-01' }
    ]
  }
];

export const INITIAL_CUSTOMERS: CustomerFiado[] = [
  {
    id: 'cust-1',
    name: 'Doña Carmen Rosa',
    reference: 'Frente al parque, casa azul',
    phone: '987654321',
    balance: 135.50,
    creditLimit: 100.00, // Supera tope (ROJO)
    lastPaymentDaysAgo: 12,
    movements: [
      { id: 'm-1', date: '2026-10-06', description: 'Compra mostrador (Aceite, Arroz, Leche)', amount: 35.50, ticketNumber: 'TK-0018' },
      { id: 'm-2', date: '2026-09-26', description: 'Abono en efectivo', amount: -20.00, method: 'Efectivo' },
      { id: 'm-3', date: '2026-09-24', description: 'Compra mostrador (Huevos, Gaseosa)', amount: 45.00, ticketNumber: 'TK-0012' },
      { id: 'm-4', date: '2026-09-18', description: 'Saldo anterior acumulado', amount: 75.00 }
    ]
  },
  {
    id: 'cust-4',
    name: "Javier 'El Mecánico'",
    reference: 'Taller Mz F Lote 3',
    phone: '976543210',
    balance: 125.00,
    creditLimit: 120.00, // Supera tope (ROJO)
    lastPaymentDaysAgo: 18,
    movements: [
      { id: 'm-8', date: '2026-10-01', description: 'Gaseosas y Cervezas fin de semana', amount: 55.00, ticketNumber: 'TK-0015' },
      { id: 'm-9', date: '2026-09-20', description: 'Abono Yape', amount: -30.00, method: 'Yape' },
      { id: 'm-10', date: '2026-09-15', description: 'Abarrotes semanales', amount: 100.00, ticketNumber: 'TK-0008' }
    ]
  },
  {
    id: 'cust-2',
    name: 'Don Lucho Mendoza',
    reference: 'Esquina Mz B Lote 8',
    phone: '991234567',
    balance: 88.00,
    creditLimit: 100.00, // 88% del tope (ÁMBAR)
    lastPaymentDaysAgo: 6,
    movements: [
      { id: 'm-5', date: '2026-10-02', description: 'Abono recibido (Yape)', amount: -30.00, method: 'Yape' },
      { id: 'm-6', date: '2026-09-29', description: 'Compra mostrador (Atún, Fideos)', amount: 28.00, ticketNumber: 'TK-0014' },
      { id: 'm-7', date: '2026-09-20', description: 'Saldo anterior', amount: 90.00 }
    ]
  },
  {
    id: 'cust-5',
    name: 'Profesora Betty',
    reference: 'Colegio inicial, 2do piso',
    phone: '998877665',
    balance: 62.00,
    creditLimit: 100.00, // 62% del tope (VERDE)
    lastPaymentDaysAgo: 4,
    movements: [
      { id: 'm-11', date: '2026-10-04', description: 'Abono recibido en efectivo', amount: -25.00, method: 'Efectivo' },
      { id: 'm-12', date: '2026-10-02', description: 'Galletas y Leches para refrigerio', amount: 37.00, ticketNumber: 'TK-0016' },
      { id: 'm-13', date: '2026-09-28', description: 'Abarrotes', amount: 50.00 }
    ]
  },
  {
    id: 'cust-3',
    name: 'Sra. Gladys Torres',
    reference: 'Pasaje Los Rosales 104',
    phone: '983456789',
    balance: 45.00,
    creditLimit: 120.00, // 37.5% del tope (VERDE)
    lastPaymentDaysAgo: 2,
    movements: [
      { id: 'm-14', date: '2026-10-06', description: 'Abono recibido (Plin)', amount: -40.00, method: 'Plin' },
      { id: 'm-15', date: '2026-10-05', description: 'Compra mostrador (Detergente, Arroz)', amount: 25.00, ticketNumber: 'TK-0017' },
      { id: 'm-16', date: '2026-09-25', description: 'Saldo inicial', amount: 60.00 }
    ]
  }
];

// Helper to seed initial sales so single source of truth is 100% consistent from start
export function createSeedSales(): SaleTransaction[] {
  const p15 = INITIAL_PRODUCTS.find(p => p.id === 'prod-15')!; // Leche Gloria 4.30
  const p34 = INITIAL_PRODUCTS.find(p => p.id === 'prod-34')!; // Pan Francés 3.00
  const p14 = INITIAL_PRODUCTS.find(p => p.id === 'prod-14')!; // Huevos 8.50
  const p23 = INITIAL_PRODUCTS.find(p => p.id === 'prod-23')!; // Inka Kola 3.00
  const p02 = INITIAL_PRODUCTS.find(p => p.id === 'prod-02')!; // Azúcar 4.20
  const p01 = INITIAL_PRODUCTS.find(p => p.id === 'prod-01')!; // Arroz 4.80

  return [
    {
      id: 'seed-sale-01',
      ticketNumber: 'TK-0001',
      timestamp: `${TODAY}T07:15:00.000Z`,
      items: [
        { product: p34, quantity: 2 }, // 6.00
        { product: p15, quantity: 1 }  // 4.30
      ],
      total: 10.30,
      paymentMethod: 'Efectivo',
      amountPaid: 10.30,
      change: 0,
      synced: true,
      status: 'COMPLETED',
      deducted: { 'prod-34': 2, 'prod-15': 1 }
    },
    {
      id: 'seed-sale-02',
      ticketNumber: 'TK-0002',
      timestamp: `${TODAY}T07:45:00.000Z`,
      items: [
        { product: p14, quantity: 1 }, // 8.50
        { product: p02, quantity: 2 }  // 8.40
      ],
      total: 16.90,
      paymentMethod: 'Yape',
      amountPaid: 16.90,
      change: 0,
      synced: true,
      status: 'COMPLETED',
      deducted: { 'prod-14': 1, 'prod-02': 2 }
    },
    {
      id: 'seed-sale-03',
      ticketNumber: 'TK-0003',
      timestamp: `${TODAY}T08:20:00.000Z`,
      items: [
        { product: p23, quantity: 2 }, // 6.00
        { product: p15, quantity: 2 }  // 8.60
      ],
      total: 14.60,
      paymentMethod: 'Efectivo',
      amountPaid: 20.00,
      change: 5.40,
      synced: true,
      status: 'COMPLETED',
      deducted: { 'prod-23': 2, 'prod-15': 2 }
    },
    {
      id: 'seed-sale-04',
      ticketNumber: 'TK-0004',
      timestamp: `${TODAY}T09:10:00.000Z`,
      items: [
        { product: p34, quantity: 3 }, // 9.00
        { product: p14, quantity: 1 }  // 8.50
      ],
      total: 17.50,
      paymentMethod: 'Plin',
      amountPaid: 17.50,
      change: 0,
      synced: true,
      status: 'COMPLETED',
      deducted: { 'prod-34': 3, 'prod-14': 1 }
    },
    {
      id: 'seed-sale-05',
      ticketNumber: 'TK-0005',
      timestamp: `${TODAY}T10:00:00.000Z`,
      items: [
        { product: p15, quantity: 3 }, // 12.90
        { product: p23, quantity: 1 }  // 3.00
      ],
      total: 15.90,
      paymentMethod: 'Efectivo',
      amountPaid: 50.00,
      change: 34.10,
      synced: true,
      status: 'COMPLETED',
      deducted: { 'prod-15': 3, 'prod-23': 1 }
    }
  ];
}
