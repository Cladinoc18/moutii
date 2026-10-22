import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { Product, ProductFilter } from '../../core/models/product.model';
import { CollectionConfig } from '../../core/models/store-config.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

export type CollectionGender = 'all' | 'Mujer' | 'Hombre';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  storeConfigService = inject(StoreConfigService);

  slug = signal<string | null>(null);
  currentCollection = signal<CollectionConfig | null>(null);
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);

  selectedGender = signal<CollectionGender>('all');
  currentSort = 'newest';

  allActiveCollections = computed(() => {
    return (this.storeConfigService.config().collections || []).filter(
      (c) => c.isActive !== false,
    );
  });

  siblingCollections = computed(() => {
    const currentSlug = this.slug();
    return this.allActiveCollections().filter(
      (c) => c.slug.toLowerCase() !== currentSlug?.toLowerCase(),
    );
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const s = params.get('slug');
      this.slug.set(s);
      this.selectedGender.set('all');

      if (s) {
        this.resolveAndLoadCollection(s);
      } else {
        // Viewing directory of all collections
        this.currentCollection.set(null);
        this.loading.set(false);
      }
    });
  }

  private resolveAndLoadCollection(slug: string) {
    this.loading.set(true);

    const collections = this.storeConfigService.config().collections || [];
    let col = collections.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() && c.isActive !== false,
    );

    if (!col) {
      // In case store config hasn't finished loading yet, subscribe to it
      this.storeConfigService.loadConfig().subscribe((cfg) => {
        const refreshedCols = cfg?.collections || [];
        col = refreshedCols.find(
          (c) => c.slug.toLowerCase() === slug.toLowerCase() && c.isActive !== false,
        );
        this.setupCollection(col, slug);
      });
    } else {
      this.setupCollection(col, slug);
    }
  }

  private setupCollection(col: CollectionConfig | undefined, slug: string) {
    if (col) {
      this.currentCollection.set(col);
    } else {
      // Fallback virtual collection using slug title
      const formattedTitle = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      this.currentCollection.set({
        title: formattedTitle,
        slug: slug,
        imageUrl:
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
        description: `Selección curada para la colección ${formattedTitle}`,
        category: '',
        searchQuery: slug.replace(/-/g, ' '),
        isActive: true,
      });
    }

    this.fetchProducts();
  }

  setGender(gender: CollectionGender) {
    this.selectedGender.set(gender);
    this.fetchProducts();
  }

  onSortChange() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading.set(true);
    const col = this.currentCollection();

    const filter: ProductFilter = {
      sort: this.currentSort,
    };

    if (this.selectedGender() !== 'all') {
      filter.gender = this.selectedGender();
    }

    if (col?.category && col.category.trim() !== '') {
      filter.category = col.category.trim();
    }

    if (col?.searchQuery && col.searchQuery.trim() !== '') {
      filter.search = col.searchQuery.trim();
    } else if (!col?.category || col.category.trim() === '') {
      // If neither category nor search is explicitly configured, search by slug / title
      filter.search = (col?.slug || '').replace(/-/g, ' ');
    }

    this.productService.getProducts(filter).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }
}
