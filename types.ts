export enum Category {
  SALGADOS = 'Salgados',
  DOCES = 'Doces',
  COMBOS = 'Combos',
  BEBIDAS = 'Bebidas'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  NOVO = 'Novo',
  PREPARANDO = 'Preparando',
  SAIU_ENTREGA = 'Saiu para Entrega',
  PRONTO_RETIRADA = 'Pronto para Retirada',
  CONCLUIDO = 'Concluído',
  CANCELADO = 'Cancelado'
}

export enum PaymentMethod {
  PIX = 'PIX',
  DINHEIRO = 'Dinheiro',
  CARTAO_ENTREGA = 'Cartão na Entrega'
}

export enum DeliveryMethod {
  DELIVERY = 'Entrega',
  PICKUP = 'Retirada'
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  number: string;
  neighborhood: string;
  complement?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string; // ISO string
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}