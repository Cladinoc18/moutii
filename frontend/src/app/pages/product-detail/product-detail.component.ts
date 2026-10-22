import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);

  selectedImage = signal<string>('');
  currentImageIndex = signal<number>(0);
  selectedSize = signal<string>('M');
  selectedColor = signal<string>('');
  quantity = signal<number>(1);
  showSizeGuide = signal<boolean>(false);
  activeSizeGuideTab = signal<'tops' | 'bottoms' | 'howto'>('tops');

  openSizeGuide() {
    const cat = (this.product()?.category || '').toLowerCase();
    if (cat.includes('pantalon') || cat.includes('falda') || cat.includes('bermuda')) {
      this.activeSizeGuideTab.set('bottoms');
    } else {
      this.activeSizeGuideTab.set('tops');
    }
    this.showSizeGuide.set(true);
  }

  closeSizeGuide() {
    this.showSizeGuide.set(false);
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.showSizeGuide()) {
      this.closeSizeGuide();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slugOrId = params.get('slugOrId');
      if (slugOrId) {
        this.loadProduct(slugOrId);
      }
    });
  }

  loadProduct(slugOrId: string) {
    this.loading.set(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Try by slug, fallback to by ID
    this.productService.getProductBySlug(slugOrId).subscribe({
      next: (prod) => this.initProductData(prod),
      error: () => {
        this.productService.getProductById(slugOrId).subscribe({
          next: (prod) => this.initProductData(prod),
          error: () => this.loading.set(false),
        });
      },
    });
  }

  private initProductData(prod: Product) {
    this.product.set(prod);
    this.currentImageIndex.set(0);
    this.selectedImage.set(prod.images?.[0] || '');
    this.selectedSize.set(prod.sizes?.[0] || 'M');
    this.selectedColor.set(prod.colors?.find((c) => c && c.name)?.name || '');
    this.quantity.set(1);
    this.loading.set(false);

    // Load similar / related products:
    // First try the same category. If fewer than 4 items, supplement with other pieces of same gender or catalog!
    this.productService.getProducts({ category: prod.category }).subscribe({
      next: (sameCat) => {
        let list = (sameCat || []).filter((p) => p._id !== prod._id);
        if (list.length < 4) {
          this.productService
            .getProducts({ gender: prod.gender === 'Unisex' ? undefined : prod.gender })
            .subscribe({
              next: (otherProds) => {
                const remaining = (otherProds || []).filter(
                  (p) => p._id !== prod._id && !list.some((existing) => existing._id === p._id),
                );
                list = [...list, ...remaining].slice(0, 4);
                this.relatedProducts.set(list);
              },
              error: () => this.relatedProducts.set(list),
            });
        } else {
          this.relatedProducts.set(list.slice(0, 4));
        }
      },
      error: () => {
        this.productService.getProducts().subscribe((all) => {
          this.relatedProducts.set(
            (all || []).filter((p) => p._id !== prod._id).slice(0, 4),
          );
        });
      },
    });
  }

  selectImageByIndex(index: number) {
    const images = this.product()?.images || [];
    if (images.length === 0) return;
    const safeIndex = (index + images.length) % images.length;
    this.currentImageIndex.set(safeIndex);
    this.selectedImage.set(images[safeIndex]);
  }

  nextImage(event?: MouseEvent) {
    event?.stopPropagation();
    this.selectImageByIndex(this.currentImageIndex() + 1);
  }

  prevImage(event?: MouseEvent) {
    event?.stopPropagation();
    this.selectImageByIndex(this.currentImageIndex() - 1);
  }

  selectImage(img: string, idx: number) {
    this.currentImageIndex.set(idx);
    this.selectedImage.set(img);
  }

  currentUnitPrice(): number {
    const p = this.product();
    if (!p) return 0;
    return p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
  }

  incrementQty() {
    this.quantity.update((v) => v + 1);
  }

  decrementQty() {
    if (this.quantity() > 1) {
      this.quantity.update((v) => v - 1);
    }
  }

  addToCart() {
    const prod = this.product();
    if (!prod) return;
    this.cartService.addToCart(
      prod,
      this.selectedSize(),
      this.selectedColor(),
      this.quantity(),
    );
  }
}
