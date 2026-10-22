import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { DepartmentService, Department } from '../../core/services/department.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

export type CatalogGender = 'all' | 'Mujer' | 'Hombre';

const FALLBACK_CATEGORIES = [
  'Vestidos',
  'Chaquetas & Blazers',
  'Pantalones',
  'Tops & Blusas',
  'Faldas',
  'Chalecos',
  'Accesorios',
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<Product[]>([]);
  categories = signal<string[]>(FALLBACK_CATEGORIES);
  totalCount = signal<number>(0);
  loading = signal<boolean>(true);

  selectedGender = signal<CatalogGender>('all');
  selectedCategory = signal<string>('all');
  onlyOnSale = signal<boolean>(false);
  currentSort = 'newest';
  searchQuery = '';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const g = params['gender'];
      const isOnSale = params['onSale'] === 'true' || params['onSale'] === true;
      this.onlyOnSale.set(isOnSale);

      if (g === 'Hombre' || g === 'Mujer') {
        this.selectedGender.set(g);
        this.departmentService.activeDepartment.set(g);
      } else {
        this.selectedGender.set('all');
      }

      if (params['category']) {
        this.selectedCategory.set(params['category']);
      } else {
        this.selectedCategory.set('all');
      }

      if (params['search']) {
        this.searchQuery = params['search'];
      } else {
        this.searchQuery = '';
      }

      this.loadCategories(this.selectedGender());
      this.applyFilters();
    });
  }

  loadCategories(gender: CatalogGender) {
    this.productService.getCategories(gender === 'all' ? undefined : gender).subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          this.categories.set(cats);
          if (this.selectedCategory() !== 'all' && !cats.includes(this.selectedCategory())) {
            this.selectedCategory.set('all');
          }
        }
      },
      error: () => {},
    });
  }

  setGender(g: CatalogGender) {
    this.selectedGender.set(g);
    if (g === 'Mujer' || g === 'Hombre') {
      this.departmentService.activeDepartment.set(g);
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        gender: g === 'all' ? null : g,
      },
      queryParamsHandling: 'merge',
    });
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
    this.applyFilters();
  }

  toggleOnSale() {
    const nextVal = !this.onlyOnSale();
    this.onlyOnSale.set(nextVal);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        onSale: nextVal ? true : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters() {
    this.selectedCategory.set('all');
    this.searchQuery = '';
    this.currentSort = 'newest';
    if (this.selectedGender() !== 'all') {
      this.setGender('all');
    } else {
      this.applyFilters();
    }
  }

  applyFilters() {
    this.loading.set(true);

    const filter: any = {
      sort: this.currentSort,
    };

    if (this.selectedGender() !== 'all') {
      filter.gender = this.selectedGender();
    }
    if (this.selectedCategory() !== 'all') {
      filter.category = this.selectedCategory();
    }
    if (this.onlyOnSale()) {
      filter.onSale = true;
    }
    if (this.searchQuery) {
      filter.search = this.searchQuery;
    }

    this.productService.getProducts(filter).subscribe({
      next: (data) => {
        this.products.set(data);
        if (this.selectedCategory() === 'all' && !this.onlyOnSale() && !this.searchQuery) {
          this.totalCount.set(data.length);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
