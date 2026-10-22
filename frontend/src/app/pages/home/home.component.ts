import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: '1',
    title: 'Vestido Lino Espresso Daniels',
    slug: 'vestido-lino-espresso-daniels',
    description:
      'Confeccionado en 100% lino orgánico con caída fluida y escote sutil.',
    price: 189000,
    discountPrice: 151200,
    discountPercent: 20,
    category: 'Vestidos',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Café Espresso', hex: '#4A3528' }],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop',
    ],
    stock: 15,
    isFeatured: true,
    isActive: true,
  },
  {
    _id: '2',
    title: 'Blazer Oversize Noir Atemporal',
    slug: 'blazer-oversize-noir-atemporal',
    description:
      'Confección sastre impecable en mezcla de lana fría negra.',
    price: 245000,
    discountPrice: 208250,
    discountPercent: 15,
    category: 'Chaquetas & Blazers',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Negro Puro', hex: '#1C1917' }],
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=900&auto=format&fit=crop',
    ],
    stock: 12,
    isFeatured: true,
    isActive: true,
  },
  {
    _id: '3',
    title: 'Pantalón Palazzo Arena Beige',
    slug: 'pantalon-palazzo-arena-beige',
    description:
      'Pantalón de tiro alto con pinzas frontales y bota ancha fluida.',
    price: 165000,
    discountPrice: null,
    discountPercent: 0,
    category: 'Pantalones',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Beige Arena', hex: '#EFE9DF' }],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop',
    ],
    stock: 18,
    isFeatured: true,
    isActive: true,
  },
  {
    _id: '4',
    title: 'Top Minimalista Lino & Seda Crema',
    slug: 'top-minimalista-lino-seda-crema',
    description:
      'Top sin mangas de líneas puras elaborado en mezcla noble de lino y seda.',
    price: 95000,
    discountPrice: 76000,
    discountPercent: 20,
    category: 'Tops & Blusas',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Crema Suave', hex: '#FAF8F5' }],
    images: [
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=900&auto=format&fit=crop',
    ],
    stock: 25,
    isFeatured: true,
    isActive: true,
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  configService = inject(StoreConfigService);

  @ViewChild('productsTrack') productsTrack?: ElementRef<HTMLDivElement>;

  featuredProducts = signal<Product[]>(FALLBACK_PRODUCTS);

  // Top Banner Carousel State
  currentBannerIndex = signal(0);
  private autoPlayTimer: any = null;
  private isPaused = false;

  activeBanners = computed(() => {
    const banners = this.configService.config().topBanners || [];
    return banners.filter((b) => b.isActive !== false);
  });

  ngOnInit() {
    this.startAutoPlay();

    this.productService.getProducts({ featured: true }).subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          this.featuredProducts.set(prods);
        } else {
          this.productService.getProducts().subscribe({
            next: (all) => {
              if (all && all.length > 0) {
                this.featuredProducts.set(all.slice(0, 12));
              }
            },
            error: () => {},
          });
        }
      },
      error: () => {
        this.productService.getProducts().subscribe({
          next: (all) => {
            if (all && all.length > 0) {
              this.featuredProducts.set(all.slice(0, 12));
            }
          },
          error: () => {},
        });
      },
    });
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      if (!this.isPaused && this.activeBanners().length > 1) {
        this.nextBanner();
      }
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  pauseCarousel() {
    this.isPaused = true;
  }

  resumeCarousel() {
    this.isPaused = false;
  }

  nextBanner() {
    const count = this.activeBanners().length;
    if (count <= 1) return;
    this.currentBannerIndex.update((curr) => (curr + 1) % count);
  }

  prevBanner() {
    const count = this.activeBanners().length;
    if (count <= 1) return;
    this.currentBannerIndex.update((curr) => (curr - 1 + count) % count);
  }

  goToBanner(index: number) {
    this.currentBannerIndex.set(index);
  }

  scrollProducts(direction: 'left' | 'right') {
    if (!this.productsTrack?.nativeElement) return;
    const track = this.productsTrack.nativeElement;
    const scrollAmount = Math.max(280, track.clientWidth * 0.75);
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  isExternalLink(link?: string): boolean {
    if (!link) return false;
    return link.startsWith('http://') || link.startsWith('https://');
  }
}

