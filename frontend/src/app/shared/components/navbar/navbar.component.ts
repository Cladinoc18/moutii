import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { DepartmentService } from '../../../core/services/department.service';
import { StoreConfigService } from '../../../core/services/store-config.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  departmentService = inject(DepartmentService);
  storeConfigService = inject(StoreConfigService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  mobileCollectionsOpen = signal(false);
  collectionsDropdownOpen = signal(false);
  searchOpen = signal(false);
  searchQuery = '';
  currentUrl = signal<string>(this.router.url);

  activeCollections = computed(() => {
    return (this.storeConfigService.config().collections || []).filter(
      (c) => c.isActive !== false,
    );
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  isSaleActive(): boolean {
    const url = this.currentUrl();
    const [path, queryString] = url.split('?');
    if (path !== '/catalog') return false;
    const params = new URLSearchParams(queryString || '');
    return params.get('onSale') === 'true';
  }

  isColeccionActive(): boolean {
    const [path] = this.currentUrl().split('?');
    return path === '/catalog' && !this.isSaleActive();
  }

  isColeccionesActive(): boolean {
    const [path] = this.currentUrl().split('?');
    return path.startsWith('/collections');
  }

  private closeMenuTimeout: any = null;

  openCollectionsDropdown() {
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
      this.closeMenuTimeout = null;
    }
    this.collectionsDropdownOpen.set(true);
  }

  closeCollectionsDropdown(immediate = false) {
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
      this.closeMenuTimeout = null;
    }
    if (immediate) {
      this.collectionsDropdownOpen.set(false);
      return;
    }
    this.closeMenuTimeout = setTimeout(() => {
      this.collectionsDropdownOpen.set(false);
    }, 280);
  }

  toggleCollectionsDropdown() {
    this.collectionsDropdownOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
    this.mobileCollectionsOpen.set(false);
  }

  isDeptActive(dept: 'Mujer' | 'Hombre'): boolean {
    const url = this.currentUrl();
    const [path, queryString] = url.split('?');
    if (path !== '/catalog' && !path.startsWith('/product/')) {
      return false;
    }
    const params = new URLSearchParams(queryString || '');
    const gender = params.get('gender');
    if (gender) {
      return gender === dept;
    }
    return false;
  }

  selectDept(dept: 'Mujer' | 'Hombre') {
    this.departmentService.setDepartment(dept, true);
    this.mobileMenuOpen.set(false);
  }

  toggleSearch() {
    this.searchOpen.update((v) => !v);
  }

  executeSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/catalog'], {
        queryParams: {
          search: this.searchQuery.trim(),
        },
      });
      this.searchOpen.set(false);
      this.searchQuery = '';
    }
  }
}
