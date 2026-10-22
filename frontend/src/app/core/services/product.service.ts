import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductFilter } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private uploadsUrl = `${environment.apiUrl}/uploads`;

  constructor(private http: HttpClient) {}

  getProducts(filter?: ProductFilter): Observable<Product[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.category && filter.category !== 'all') {
        params = params.set('category', filter.category);
      }
      if (filter.gender && filter.gender !== 'all') {
        params = params.set('gender', filter.gender);
      }
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.featured !== undefined) {
        params = params.set('featured', String(filter.featured));
      }
      if (filter.onSale !== undefined) {
        params = params.set('onSale', String(filter.onSale));
      }
      if (filter.minPrice !== undefined) {
        params = params.set('minPrice', String(filter.minPrice));
      }
      if (filter.maxPrice !== undefined) {
        params = params.set('maxPrice', String(filter.maxPrice));
      }
      if (filter.sort) {
        params = params.set('sort', filter.sort);
      }
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getCategories(gender?: string): Observable<string[]> {
    let params = new HttpParams();
    if (gender && gender !== 'all') {
      params = params.set('gender', gender);
    }
    return this.http.get<string[]>(`${this.apiUrl}/categories`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }

  // Admin Methods
  getAdminProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/admin/all`);
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }

  updateProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; filename: string }>(
      `${this.uploadsUrl}/single`,
      formData,
    );
  }

  uploadImages(files: FileList | File[]): Observable<Array<{ url: string; filename: string }>> {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    return this.http.post<Array<{ url: string; filename: string }>>(
      `${this.uploadsUrl}/multiple`,
      formData,
    );
  }
}

