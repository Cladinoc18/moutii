import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  storeConfigService = inject(StoreConfigService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  isRefreshing = signal(false);
  searchInput = '';
  searchError = signal('');
  lastUpdated = signal<Date>(new Date());

  private autoPollTimer: any = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const paramNumber = params['number'] || params['orderNumber'];
      if (paramNumber) {
        this.searchInput = paramNumber;
        this.trackSingleOrder(paramNumber);
      } else {
        this.loadCustomerOrders();
      }
    });

    // Auto-poll every 12 seconds so admin updates reflect in real time without manual reload
    this.autoPollTimer = setInterval(() => {
      this.refreshQuietly();
    }, 12000);
  }

  ngOnDestroy() {
    if (this.autoPollTimer) {
      clearInterval(this.autoPollTimer);
      this.autoPollTimer = null;
    }
  }

  loadCustomerOrders() {
    this.isLoading.set(true);
    this.searchError.set('');

    const localNumbers = this.orderService.getLocalOrderNumbers();
    const userEmail = this.authService.currentUser()?.email;

    if (localNumbers.length > 0) {
      this.orderService.getOrdersByNumbers(localNumbers).subscribe({
        next: (ords) => {
          if (userEmail) {
            // Also fetch by user email and merge
            this.orderService.getOrdersByEmail(userEmail).subscribe({
              next: (emailOrds) => {
                const map = new Map<string, Order>();
                [...ords, ...emailOrds].forEach((o) => map.set(o.orderNumber, o));
                const merged = Array.from(map.values()).sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                );
                this.orders.set(merged);
                this.isLoading.set(false);
                this.lastUpdated.set(new Date());
              },
              error: () => {
                this.orders.set(ords);
                this.isLoading.set(false);
                this.lastUpdated.set(new Date());
              },
            });
          } else {
            this.orders.set(ords);
            this.isLoading.set(false);
            this.lastUpdated.set(new Date());
          }
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else if (userEmail) {
      this.orderService.getOrdersByEmail(userEmail).subscribe({
        next: (ords) => {
          this.orders.set(ords);
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      this.orders.set([]);
      this.isLoading.set(false);
    }
  }

  searchOrder() {
    const query = this.searchInput.trim();
    if (!query) {
      this.loadCustomerOrders();
      return;
    }

    this.isLoading.set(true);
    this.searchError.set('');

    if (query.includes('@')) {
      // Search by email
      this.orderService.getOrdersByEmail(query).subscribe({
        next: (ords) => {
          this.isLoading.set(false);
          if (ords && ords.length > 0) {
            this.orders.set(ords);
            this.lastUpdated.set(new Date());
            ords.forEach((o) => this.orderService.saveLocalOrderNumber(o.orderNumber));
          } else {
            this.searchError.set(`No se encontraron pedidos asociados al correo "${query}".`);
            this.orders.set([]);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.searchError.set('Error al consultar pedidos. Intenta nuevamente.');
        },
      });
    } else {
      // Search by order number
      this.trackSingleOrder(query);
    }
  }

  private trackSingleOrder(orderNum: string) {
    this.isLoading.set(true);
    this.searchError.set('');

    this.orderService.trackOrder(orderNum).subscribe({
      next: (order) => {
        this.isLoading.set(false);
        if (order) {
          this.orderService.saveLocalOrderNumber(order.orderNumber);
          // Put this order at top of list
          const existing = this.orders().filter((o) => o.orderNumber !== order.orderNumber);
          this.orders.set([order, ...existing]);
          this.lastUpdated.set(new Date());
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.searchError.set(
          `No encontramos ningún pedido con el número "${orderNum}". Verifica el código (ej: MOU-...) o rastrea con tu correo.`,
        );
      },
    });
  }

  refreshOrders() {
    this.isRefreshing.set(true);
    const current = this.orders();
    if (current.length === 0) {
      this.loadCustomerOrders();
      setTimeout(() => this.isRefreshing.set(false), 600);
      return;
    }

    const numbers = current.map((o) => o.orderNumber);
    this.orderService.getOrdersByNumbers(numbers).subscribe({
      next: (updated) => {
        if (updated && updated.length > 0) {
          const map = new Map<string, Order>();
          updated.forEach((o) => map.set(o.orderNumber, o));
          const refreshed = current.map((o) => map.get(o.orderNumber) || o);
          this.orders.set(refreshed);
          this.lastUpdated.set(new Date());
        }
        setTimeout(() => this.isRefreshing.set(false), 500);
      },
      error: () => {
        setTimeout(() => this.isRefreshing.set(false), 500);
      },
    });
  }

  private refreshQuietly() {
    const current = this.orders();
    if (current.length === 0) return;

    const numbers = current.map((o) => o.orderNumber);
    this.orderService.getOrdersByNumbers(numbers).subscribe({
      next: (updated) => {
        if (updated && updated.length > 0) {
          const map = new Map<string, Order>();
          updated.forEach((o) => map.set(o.orderNumber, o));
          const refreshed = current.map((o) => map.get(o.orderNumber) || o);
          this.orders.set(refreshed);
          this.lastUpdated.set(new Date());
        }
      },
      error: () => {},
    });
  }

  getOrderStep(status: string): number {
    switch (status) {
      case 'Pendiente de Pago':
      case 'Pendiente':
        return 1;
      case 'Pago Verificado':
        return 2;
      case 'En Preparación':
        return 3;
      case 'Enviado':
        return 4;
      case 'Entregado':
        return 5;
      case 'Cancelado':
        return -1;
      default:
        return 1;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pendiente de Pago':
        return 'badge-payment-pending';
      case 'Pago Verificado':
        return 'badge-payment-verified';
      case 'Pendiente':
        return 'badge-pending';
      case 'En Preparación':
        return 'badge-processing';
      case 'Enviado':
        return 'badge-shipped';
      case 'Entregado':
        return 'badge-delivered';
      case 'Cancelado':
        return 'badge-cancelled';
      default:
        return 'badge-default';
    }
  }

  getStatusDescription(status: string): string {
    switch (status) {
      case 'Pendiente de Pago':
        return 'Esperando comprobante de transferencia bancaria para validación.';
      case 'Pago Verificado':
        return 'Tu pago ha sido confirmado con éxito. El pedido ingresa a empaque.';
      case 'Pendiente':
        return 'Pedido recibido. En proceso de confirmación inicial.';
      case 'En Preparación':
        return 'Tus prendas están siendo confeccionadas / empacadas con cuidado artesanal.';
      case 'Enviado':
        return 'Tu paquete va en camino hacia tu dirección de entrega.';
      case 'Entregado':
        return '¡Pedido entregado con éxito! Esperamos que disfrutes tus prendas Moutii.';
      case 'Cancelado':
        return 'Este pedido ha sido cancelado. Comunícate con nosotros para cualquier duda.';
      default:
        return 'Estado actualizado por el equipo de Moutii.';
    }
  }

  getWhatsAppSupportUrl(order: Order): string {
    const rawPhone = this.storeConfigService.config().contact?.phone || '3001234567';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '57' + cleanPhone;
    } else if (cleanPhone.length === 0) {
      cleanPhone = '573001234567';
    }

    const message =
      `Hola Daniela / Moutii, tengo una consulta sobre mi orden *#${order.orderNumber}* a nombre de *${order.customerName}* (Estado actual: ${order.status}).`;
    return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  }
}
