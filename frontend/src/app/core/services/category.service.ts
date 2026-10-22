import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  getCategories(gender?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (gender && gender !== 'all') {
      params = params.set('gender', gender);
    }
    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  getAdminCategories(gender?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (gender && gender !== 'all') {
      params = params.set('gender', gender);
    }
    return this.http.get<Category[]>(`${this.apiUrl}/admin/all`, { params });
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, data);
  }

  updateCategory(id: string, data: UpdateCategoryDto): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
