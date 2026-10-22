import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
  CouponValidationResponse,
} from '../models/coupon.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coupons`;

  validateCoupon(code: string, subtotal: number = 0): Observable<CouponValidationResponse> {
    return this.http.post<CouponValidationResponse>(`${this.apiUrl}/validate`, {
      code,
      subtotal,
    });
  }

  getActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/active`);
  }

  getAllAdminCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/admin/all`);
  }

  getCouponById(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/${id}`);
  }

  createCoupon(data: CreateCouponDto): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, data);
  }

  updateCoupon(id: string, data: UpdateCouponDto): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, data);
  }

  deleteCoupon(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
