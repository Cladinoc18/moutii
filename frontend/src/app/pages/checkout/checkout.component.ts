import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  cartService = inject(CartService);
  storeConfigService = inject(StoreConfigService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  formData = {
    customerName: this.authService.currentUser()?.name || '',
    customerEmail: this.authService.currentUser()?.email || '',
    customerPhone: this.authService.currentUser()?.phone || '',
    shippingAddress: this.authService.currentUser()?.address || '',
    city: this.authService.currentUser()?.city || '',
    notes: '',
  };

  paymentMethod = 'Transferencia Bancaria';
  isSubmitting = signal(false);
  orderSuccess = signal(false);
  createdOrder = signal<Order | null>(null);
  whatsappUrl = signal<string>('');
  copiedKey = signal<string | null>(null);
  errorMessage = '';

  cleanNumber(val?: string): string {
    return (val || '').replace(/[^0-9a-zA-Z]/g, '');
  }

  copyToClipboard(text: string, key: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedKey.set(key);
        setTimeout(() => {
          if (this.copiedKey() === key) {
            this.copiedKey.set(null);
          }
        }, 2500);
      });
    }
  }

  getWhatsAppUrl(order: Order): string {
    const rawPhone = this.storeConfigService.config().contact?.phone || '3001234567';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '57' + cleanPhone;
    } else if (cleanPhone.length === 0) {
      cleanPhone = '573001234567';
    }

    const itemsText = (order.items || [])
      .map(
        (it) =>
          `- ${it.quantity}x ${it.title} (Talla: ${it.size || 'M'}${it.color ? ', Color: ' + it.color : ''}) - $${Math.round(it.price * it.quantity).toLocaleString('es-CO')} COP`,
      )
      .join('\n');

    const couponLine =
      order.discount && order.discount > 0
        ? `🏷 *Cupón Aplicado:* ${order.discountCode ? order.discountCode + ' ' : ''}(-$${Math.round(order.discount).toLocaleString('es-CO')} COP)\n`
        : '';

    const notesLine = order.notes ? `📝 *Notas de Entrega:* ${order.notes}\n` : '';
    const isTransfer = (order.paymentMethod || '').includes('Transferencia');

    const message =
      `*MOUTII - CONFIRMACIÓN DE PEDIDO*\n\n` +
      `📋 *Número de Orden:* #${order.orderNumber}\n` +
      `👤 *Cliente:* ${order.customerName}\n` +
      `📱 *Teléfono:* ${order.customerPhone}\n` +
      `📍 *Ciudad:* ${order.city}\n` +
      `🏠 *Dirección:* ${order.shippingAddress}\n` +
      `💳 *Método de Pago:* ${order.paymentMethod}\n\n` +
      `📦 *Prendas Solicitadas:*\n${itemsText}\n\n` +
      couponLine +
      `🚚 *Costo de Envío:* Gratis\n` +
      `💰 *Total a ${isTransfer ? 'Transferir' : 'Pagar'}:* *$${Math.round(order.total).toLocaleString('es-CO')} COP*\n\n` +
      notesLine +
      (isTransfer
        ? `📸 *Adjunto el comprobante de mi transferencia bancaria para verificar el pago y proceder con el despacho.*\n\n`
        : `📦 *Quedo a la espera de la confirmación de despacho para pago contra entrega.*\n\n`) +
      `Muchas gracias.`;

    return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  }

  submitOrder() {
    this.errorMessage = '';

    if (
      !this.formData.customerName ||
      !this.formData.customerEmail ||
      !this.formData.customerPhone ||
      !this.formData.shippingAddress ||
      !this.formData.city
    ) {
      this.errorMessage = 'Por favor completa todos los campos requeridos (*).';
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      customerName: this.formData.customerName,
      customerEmail: this.formData.customerEmail,
      customerPhone: this.formData.customerPhone,
      shippingAddress: this.formData.shippingAddress,
      city: this.formData.city,
      notes: this.formData.notes,
      items: this.cartService.items().map((it) => ({
        productId: it.product._id,
        title: it.product.title,
        price: it.unitPrice,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        image: it.product.images?.[0] || '',
      })),
      subtotal: this.cartService.subtotal(),
      discount: this.cartService.discountAmount(),
      discountCode: this.cartService.couponCode() || undefined,
      total: this.cartService.total(),
      paymentMethod: this.paymentMethod,
    };

    this.orderService.createOrder(payload).subscribe({
      next: (order) => {
        const url = this.getWhatsAppUrl(order);
        this.whatsappUrl.set(url);
        this.createdOrder.set(order);
        this.orderService.saveLocalOrderNumber(order.orderNumber);
        this.orderSuccess.set(true);
        this.cartService.clearCart();
        this.isSubmitting.set(false);

        if (typeof window !== 'undefined') {
          window.open(url, '_blank');
        }
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'Ocurrió un error al procesar tu pedido. Intenta nuevamente.';
        this.isSubmitting.set(false);
      },
    });
  }
}
