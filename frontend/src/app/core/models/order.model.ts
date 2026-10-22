export interface OrderItemPayload {
  productId: string;
  title: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

export interface OrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: OrderItemPayload[];
  subtotal: number;
  discount?: number;
  discountCode?: string;
  total: number;
  paymentMethod?: string;
}

export interface Order extends OrderPayload {
  _id: string;
  orderNumber: string;
  status:
    | 'Pendiente de Pago'
    | 'Pago Verificado'
    | 'Pendiente'
    | 'En Preparación'
    | 'Enviado'
    | 'Entregado'
    | 'Cancelado';
  createdAt: string;
}

