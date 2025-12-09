import { Product, Order, Category, OrderStatus } from '../types';

const PRODUCTS_KEY = 'rj_ds_products';
const ORDERS_KEY = 'rj_ds_orders';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Coxinha de Frango',
    description: 'A clássica coxinha com massa de batata e recheio cremoso de frango.',
    price: 6.50,
    category: Category.SALGADOS,
    imageUrl: 'https://images.unsplash.com/photo-1576158189445-5606e902b79a?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  },
  {
    id: '2',
    name: 'Brigadeiro Gourmet',
    description: 'Brigadeiro feito com chocolate belga e granulado especial.',
    price: 4.00,
    category: Category.DOCES,
    imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  },
  {
    id: '3',
    name: 'Combo Festa (50un)',
    description: 'Mix de 25 coxinhas e 25 bolinhas de queijo.',
    price: 89.90,
    category: Category.COMBOS,
    imageUrl: 'https://images.unsplash.com/photo-1541795792062-39425861b7d8?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  },
  {
    id: '4',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante gelado para acompanhar.',
    price: 12.00,
    category: Category.BEBIDAS,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  },
   {
    id: '5',
    name: 'Empada de Camarão',
    description: 'Massa podre que derrete na boca com recheio farto.',
    price: 7.50,
    category: Category.SALGADOS,
    imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=600',
    isAvailable: true
  }
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const createOrder = (order: Order): void => {
  const orders = getOrders();
  // Add to beginning of list
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index >= 0) {
    orders[index].status = status;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};