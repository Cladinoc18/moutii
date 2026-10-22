import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, Observable } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient) {
    if (this.token()) {
      this.fetchProfile().subscribe();
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('mouti_token');
  }

  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('mouti_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('mouti_token', res.access_token);
        localStorage.setItem('mouti_user', JSON.stringify(res.user));
        this.token.set(res.access_token);
        this.currentUser.set(res.user);
      }),
    );
  }

  register(userData: { name: string; email: string; password: string; phone?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        localStorage.setItem('mouti_token', res.access_token);
        localStorage.setItem('mouti_user', JSON.stringify(res.user));
        this.token.set(res.access_token);
        this.currentUser.set(res.user);
      }),
    );
  }

  fetchProfile(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        localStorage.setItem('mouti_user', JSON.stringify(user));
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout() {
    localStorage.removeItem('mouti_token');
    localStorage.removeItem('mouti_user');
    this.token.set(null);
    this.currentUser.set(null);
  }
}

