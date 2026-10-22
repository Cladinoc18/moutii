import { Product } from './product.model';

export interface CartItem {
  id: string; // unique cart item id (product._id + size + color)
  product: Product;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
}

