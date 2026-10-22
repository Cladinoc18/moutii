import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderPayload } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(payload: OrderPayload): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, payload);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  trackOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/track/${encodeURIComponent(orderNumber.trim())}`);
  }

  getOrdersByNumbers(orderNumbers: string[]): Observable<Order[]> {
    return this.http.post<Order[]>(`${this.apiUrl}/by-numbers`, { orderNumbers });
  }

  getOrdersByEmail(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/by-email/${encodeURIComponent(email.trim())}`);
  }

  saveLocalOrderNumber(orderNumber: string) {
    if (!orderNumber || typeof window === 'undefined') return;
    try {
      const existing = this.getLocalOrderNumbers();
      if (!existing.includes(orderNumber.trim())) {
        existing.unshift(orderNumber.trim());
        localStorage.setItem('moutii_saved_orders', JSON.stringify(existing.slice(0, 50)));
      }
    } catch {}
  }

  getLocalOrderNumbers(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('moutii_saved_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

