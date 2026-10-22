import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { CouponService } from './coupon.service';
import { CouponValidationResponse } from '../models/coupon.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private couponService = inject(CouponService);

  items = signal<CartItem[]>(this.loadCart());
  isOpen = signal<boolean>(false);
  couponCode = signal<string>('');
  discountPercent = signal<number>(0);
  couponDescription = signal<string>('');

  totalQuantity = computed(() => {
    return this.items().reduce((acc, item) => acc + item.quantity, 0);
  });

  subtotal = computed(() => {
    return this.items().reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  });

  discountAmount = computed(() => {
    if (this.discountPercent() <= 0) return 0;
    return Math.round((this.subtotal() * this.discountPercent()) / 100);
  });

  total = computed(() => {
    const finalAmount = this.subtotal() - this.discountAmount();
    return Math.max(0, finalAmount);
  });

  constructor() {
    // Persist cart items on changes
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mouti_cart', JSON.stringify(this.items()));
      }
    });
  }

  private loadCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('mouti_cart');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  addToCart(product: Product, size: string, color: string, quantity = 1) {
    const unitPrice =
      product.discountPrice && product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    const cartItemId = `${product._id}_${size}_${color}`;

    this.items.update((currentItems) => {
      const existingIndex = currentItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...currentItems,
          {
            id: cartItemId,
            product,
            size,
            color,
            quantity,
            unitPrice,
          },
        ];
      }
    });

    this.openCart();
  }

  updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.items.update((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
  }

  removeItem(itemId: string) {
    this.items.update((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }

  clearCart() {
    this.items.set([]);
    this.discountPercent.set(0);
    this.couponCode.set('');
    this.couponDescription.set('');
  }

  openCart() {
    this.isOpen.set(true);
  }

  closeCart() {
    this.isOpen.set(false);
  }

  toggleCart() {
    this.isOpen.update((v) => !v);
  }

  applyCoupon(code: string): Observable<CouponValidationResponse> {
    const clean = code.trim().toUpperCase();
    return this.couponService.validateCoupon(clean, this.subtotal()).pipe(
      tap((res) => {
        if (res.valid) {
          this.couponCode.set(res.code || clean);
          this.discountPercent.set(res.discountPercent || 0);
          this.couponDescription.set(res.description || '');
        }
      }),
    );
  }

  removeCoupon() {
    this.couponCode.set('');
    this.discountPercent.set(0);
    this.couponDescription.set('');
  }
}

