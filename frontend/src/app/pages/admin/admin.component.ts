import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CouponService } from '../../core/services/coupon.service';
import { Product, ProductColor } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { StoreConfig, CollectionConfig } from '../../core/models/store-config.model';
import { Order } from '../../core/models/order.model';
import { Coupon } from '../../core/models/coupon.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  authService = inject(AuthService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private couponService = inject(CouponService);
  private storeConfigService = inject(StoreConfigService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  activeTab = signal<'products' | 'categories' | 'coupons' | 'store' | 'orders'>('products');
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  coupons = signal<Coupon[]>([]);
  orders = signal<Order[]>([]);
  config = signal<StoreConfig | null>(null);

  discountedCount = signal<number>(0);
  activeCouponsCount = computed(() => this.coupons().filter((c) => c.isActive).length);
  feedbackMessage = signal<string>('');
  feedbackError = signal<boolean>(false);

  // Coupon modal state
  showCouponModal = signal(false);
  editingCouponId = signal<string | null>(null);
  isSavingCoupon = signal(false);
  couponForm: {
    code: string;
    discountPercent: number;
    description: string;
    minPurchase: number;
    isActive: boolean;
  } = {
    code: '',
    discountPercent: 10,
    description: '',
    minPurchase: 0,
    isActive: true,
  };

  // Category modal state
  showCategoryModal = signal(false);
  editingCategoryId = signal<string | null>(null);
  isSavingCategory = signal(false);
  categoryForm: {
    name: string;
    description: string;
    gender: 'Mujer' | 'Hombre' | 'Ambos';
  } = {
    name: '',
    description: '',
    gender: 'Ambos',
  };

  // Product modal state
  showProductForm = signal(false);
  editingProductId = signal<string | null>(null);
  isSavingProduct = signal(false);

  productForm: Partial<Product> = {
    title: '',
    description: '',
    gender: 'Mujer',
    category: 'Vestidos',
    price: 0,
    discountPercent: 0,
    discountPrice: null,
    stock: 10,
    sizes: ['S', 'M', 'L'],
    images: [],
    isFeatured: false,
    isActive: true,
  };
  productFormSizesInput = 'S, M, L';
  productFormMainImage = '';
  productFormImages: string[] = [];
  productFormUrlInput = '';
  isUploadingImages = signal(false);

  // Product colors state
  productFormColors: ProductColor[] = [];
  newColorName = '';
  newColorHex = '#161413';
  colorPresets: ProductColor[] = [
    { name: 'Crudo Natural', hex: '#FAF8F5' },
    { name: 'Café Espresso', hex: '#38261A' },
    { name: 'Negro Carbón', hex: '#161413' },
    { name: 'Moca Latte', hex: '#A97B6D' },
    { name: 'Beige Arena', hex: '#D4C5B9' },
    { name: 'Blanco Puro', hex: '#FFFFFF' },
  ];

  // Store config form
  configForm: any = null;
  isSavingConfig = signal(false);
  isUploadingBanner = signal(false);
  isUploadingBrandStory = signal(false);
  newBanner = {
    imageUrl: '',
    link: '/catalog',
    title: '',
    isActive: true,
  };
  newCollection: CollectionConfig = {
    title: '',
    slug: '',
    imageUrl: '',
    description: '',
    category: '',
    searchQuery: '',
    isActive: true,
  };
  isUploadingCollection = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.productService.getAdminProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);
        const disc = prods.filter(
          (p) => (p.discountPercent && p.discountPercent > 0) || (p.discountPrice && p.discountPrice > 0),
        ).length;
        this.discountedCount.set(disc);
      },
    });

    this.storeConfigService.loadConfig().subscribe({
      next: (cfg) => {
        this.config.set(cfg);
        const cloned = JSON.parse(JSON.stringify(cfg));
        if (!cloned.bankTransfer) {
          cloned.bankTransfer = {
            bankName: 'Bancolombia',
            accountType: 'Ahorros',
            accountNumber: '',
            accountHolder: '',
            holderId: '',
            nequiPhone: '',
            daviplataPhone: '',
            llaveNumber: '',
            llaveType: 'Celular',
            instructions: '',
            isEnabled: true,
          };
        }
        if (!cloned.topBanners) {
          cloned.topBanners = [];
        }
        if (!cloned.collections) {
          cloned.collections = [];
        }
        this.configForm = cloned;
      },
    });

    this.orderService.getOrders().subscribe({
      next: (ords) => this.orders.set(ords),
    });

    this.loadCategories();
    this.loadCoupons();
  }

  showToast(msg: string, isError = false) {
    this.feedbackError.set(isError);
    this.feedbackMessage.set(msg);
    setTimeout(() => {
      this.feedbackMessage.set('');
    }, 4000);
  }

  // --- Category CRUD ---
  loadCategories() {
    this.categoryService.getAdminCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        if (!this.productForm.category && cats.length > 0) {
          this.productForm.category = cats[0].name;
        }
      },
      error: () => {
        this.categoryService.getCategories().subscribe({
          next: (cats) => this.categories.set(cats),
        });
      },
    });
  }

  openCreateCategoryModal() {
    this.editingCategoryId.set(null);
    this.categoryForm = { name: '', description: '', gender: 'Ambos' };
    this.showCategoryModal.set(true);
  }

  editCategory(cat: Category) {
    this.editingCategoryId.set(cat._id);
    this.categoryForm = {
      name: cat.name,
      description: cat.description || '',
      gender: cat.gender || 'Ambos',
    };
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
    this.editingCategoryId.set(null);
  }

  saveCategory() {
    if (!this.categoryForm.name || !this.categoryForm.name.trim()) {
      this.showToast('El nombre de la categoría es obligatorio', true);
      return;
    }

    this.isSavingCategory.set(true);
    const id = this.editingCategoryId();

    if (id) {
      this.categoryService.updateCategory(id, this.categoryForm).subscribe({
        next: () => {
          this.isSavingCategory.set(false);
          this.closeCategoryModal();
          this.loadCategories();
          this.loadData();
          this.showToast('Categoría actualizada correctamente');
        },
        error: (err) => {
          this.isSavingCategory.set(false);
          this.showToast(err?.error?.message || 'Error al actualizar la categoría', true);
        },
      });
    } else {
      this.categoryService.createCategory(this.categoryForm).subscribe({
        next: () => {
          this.isSavingCategory.set(false);
          this.closeCategoryModal();
          this.loadCategories();
          this.showToast('Categoría creada exitosamente');
        },
        error: (err) => {
          this.isSavingCategory.set(false);
          this.showToast(err?.error?.message || 'Error al crear la categoría', true);
        },
      });
    }
  }

  confirmDeleteCategory(cat: Category) {
    if (cat.productCount && cat.productCount > 0) {
      this.showToast(
        `No se puede eliminar "${cat.name}" porque contiene ${cat.productCount} prenda(s) asociada(s). Reasigna o elimina las prendas primero.`,
        true,
      );
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat.name}"?`)) {
      return;
    }

    this.categoryService.deleteCategory(cat._id).subscribe({
      next: (res) => {
        this.loadCategories();
        this.showToast(res?.message || 'Categoría eliminada correctamente');
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Error al eliminar la categoría', true);
      },
    });
  }

  // --- Coupon CRUD ---
  loadCoupons() {
    this.couponService.getAllAdminCoupons().subscribe({
      next: (data) => this.coupons.set(data),
      error: () => {
        this.couponService.getActiveCoupons().subscribe({
          next: (data) => this.coupons.set(data),
        });
      },
    });
  }

  openCreateCouponModal() {
    this.editingCouponId.set(null);
    this.couponForm = {
      code: '',
      discountPercent: 15,
      description: '',
      minPurchase: 0,
      isActive: true,
    };
    this.showCouponModal.set(true);
  }

  editCoupon(c: Coupon) {
    this.editingCouponId.set(c._id || null);
    this.couponForm = {
      code: c.code,
      discountPercent: c.discountPercent,
      description: c.description || '',
      minPurchase: c.minPurchase || 0,
      isActive: c.isActive,
    };
    this.showCouponModal.set(true);
  }

  closeCouponModal() {
    this.showCouponModal.set(false);
    this.editingCouponId.set(null);
  }

  saveCoupon() {
    const cleanCode = (this.couponForm.code || '').trim().toUpperCase();
    if (!cleanCode) {
      this.showToast('El código del cupón es obligatorio', true);
      return;
    }

    if (this.couponForm.discountPercent < 1 || this.couponForm.discountPercent > 100) {
      this.showToast('El porcentaje de descuento debe estar entre 1 y 100', true);
      return;
    }

    this.isSavingCoupon.set(true);
    const payload = {
      code: cleanCode,
      discountPercent: Number(this.couponForm.discountPercent),
      description: (this.couponForm.description || '').trim(),
      minPurchase: Number(this.couponForm.minPurchase) || 0,
      isActive: Boolean(this.couponForm.isActive),
    };

    const id = this.editingCouponId();
    if (id) {
      this.couponService.updateCoupon(id, payload).subscribe({
        next: () => {
          this.isSavingCoupon.set(false);
          this.closeCouponModal();
          this.loadCoupons();
          this.showToast('¡Cupón actualizado correctamente!');
        },
        error: (err) => {
          this.isSavingCoupon.set(false);
          this.showToast(err?.error?.message || 'Error al actualizar el cupón', true);
        },
      });
    } else {
      this.couponService.createCoupon(payload).subscribe({
        next: () => {
          this.isSavingCoupon.set(false);
          this.closeCouponModal();
          this.loadCoupons();
          this.showToast(`¡Cupón "${cleanCode}" creado exitosamente!`);
        },
        error: (err) => {
          this.isSavingCoupon.set(false);
          this.showToast(err?.error?.message || 'Error al crear el cupón', true);
        },
      });
    }
  }

  toggleCouponStatus(coupon: Coupon) {
    if (!coupon._id) return;
    const newStatus = !coupon.isActive;
    this.couponService.updateCoupon(coupon._id, { isActive: newStatus }).subscribe({
      next: () => {
        this.coupons.update((list) =>
          list.map((c) => (c._id === coupon._id ? { ...c, isActive: newStatus } : c)),
        );
        this.showToast(
          `Cupón "${coupon.code}" ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
        );
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Error al cambiar estado del cupón', true);
      },
    });
  }

  confirmDeleteCoupon(coupon: Coupon) {
    if (!coupon._id) return;
    if (!confirm(`¿Estás seguro de que deseas eliminar el cupón "${coupon.code}"?`)) {
      return;
    }

    this.couponService.deleteCoupon(coupon._id).subscribe({
      next: (res) => {
        this.loadCoupons();
        this.showToast(res?.message || `Cupón "${coupon.code}" eliminado`);
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Error al eliminar el cupón', true);
      },
    });
  }

  // --- Product CRUD ---
  availableCategoriesForProduct(): Category[] {
    const gender = this.productForm.gender || 'Mujer';
    if (gender === 'Mujer') {
      return this.categories().filter((c) => c.gender === 'Mujer' || c.gender === 'Ambos' || !c.gender);
    } else if (gender === 'Hombre') {
      return this.categories().filter((c) => c.gender === 'Hombre' || c.gender === 'Ambos' || !c.gender);
    } else {
      return this.categories();
    }
  }

  onProductGenderChange() {
    const valid = this.availableCategoriesForProduct();
    const currentValid = valid.some((c) => c.name === this.productForm.category);
    if (!currentValid && valid.length > 0) {
      this.productForm.category = valid[0].name;
    }
  }

  openCreateProductModal() {
    this.editingProductId.set(null);
    this.productForm = {
      title: '',
      description: '',
      gender: 'Mujer',
      category: '',
      price: 150000,
      discountPercent: 0,
      discountPrice: null,
      stock: 10,
      sizes: ['S', 'M', 'L'],
      images: [],
      isFeatured: false,
      isActive: true,
    };
    const valid = this.availableCategoriesForProduct();
    this.productForm.category = valid.length > 0 ? valid[0].name : (this.categories()[0]?.name || 'Vestidos');
    this.productFormSizesInput = 'S, M, L';
    this.productFormMainImage = '';
    this.productFormImages = [];
    this.productFormUrlInput = '';
    this.productFormColors = [];
    this.newColorName = '';
    this.newColorHex = '#161413';
    this.showProductForm.set(true);
  }

  editProduct(product: Product) {
    this.editingProductId.set(product._id);
    this.productForm = {
      ...product,
      gender: product.gender || 'Mujer',
    };
    this.productFormSizesInput = product.sizes?.join(', ') || 'S, M, L';
    this.productFormImages = product.images && product.images.length > 0 ? [...product.images] : [];
    this.productFormMainImage = this.productFormImages[0] || '';
    this.productFormUrlInput = '';
    this.productFormColors = product.colors && product.colors.length > 0
      ? product.colors.filter((c) => c && c.name && c.hex).map((c) => ({ name: c.name, hex: c.hex }))
      : [];
    this.newColorName = '';
    this.newColorHex = '#161413';
    this.showProductForm.set(true);
  }

  closeProductForm() {
    this.showProductForm.set(false);
  }

  calculateDiscountFromPercent() {
    if (this.productForm.price && this.productForm.discountPercent && this.productForm.discountPercent > 0) {
      this.productForm.discountPrice = Math.round(
        this.productForm.price * (1 - this.productForm.discountPercent / 100),
      );
    } else {
      this.productForm.discountPrice = null;
    }
  }

  calculatePercentFromPrice() {
    if (
      this.productForm.price &&
      this.productForm.discountPrice &&
      this.productForm.discountPrice < this.productForm.price
    ) {
      this.productForm.discountPercent = Math.round(
        ((this.productForm.price - this.productForm.discountPrice) / this.productForm.price) * 100,
      );
    }
  }

  onProductImageUpload(event: any) {
    const files: FileList | null = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploadingImages.set(true);

    if (files.length === 1) {
      this.productService.uploadImage(files[0]).subscribe({
        next: (res) => {
          const fullUrl = `${environment.uploadsUrl}${res.url}`;
          this.productFormImages.push(fullUrl);
          if (!this.productFormMainImage) {
            this.productFormMainImage = fullUrl;
          }
          this.isUploadingImages.set(false);
          this.showToast('Imagen subida a la galería');
          event.target.value = '';
        },
        error: () => {
          this.isUploadingImages.set(false);
          this.showToast('Error al subir la imagen', true);
        },
      });
    } else {
      this.productService.uploadImages(files).subscribe({
        next: (resList) => {
          resList.forEach((item) => {
            this.productFormImages.push(`${environment.uploadsUrl}${item.url}`);
          });
          if (!this.productFormMainImage && this.productFormImages.length > 0) {
            this.productFormMainImage = this.productFormImages[0];
          }
          this.isUploadingImages.set(false);
          this.showToast(`Se subieron ${resList.length} imágenes correctamente`);
          event.target.value = '';
        },
        error: () => {
          this.isUploadingImages.set(false);
          this.showToast('Error al subir las imágenes', true);
        },
      });
    }
  }

  addImageUrl() {
    const url = (this.productFormUrlInput || '').trim();
    if (!url) return;
    this.productFormImages.push(url);
    if (!this.productFormMainImage) {
      this.productFormMainImage = url;
    }
    this.productFormUrlInput = '';
    this.showToast('Imagen añadida a la galería');
  }

  removeProductImage(index: number) {
    this.productFormImages.splice(index, 1);
    this.productFormMainImage = this.productFormImages[0] || '';
  }

  setPrimaryImage(index: number) {
    if (index <= 0 || index >= this.productFormImages.length) return;
    const [img] = this.productFormImages.splice(index, 1);
    this.productFormImages.unshift(img);
    this.productFormMainImage = this.productFormImages[0];
    this.showToast('Imagen establecida como principal');
  }

  addColor() {
    const name = (this.newColorName || '').trim();
    if (!name) return;
    const hex = this.newColorHex || '#161413';
    if (!this.productFormColors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      this.productFormColors.push({ name, hex });
    }
    this.newColorName = '';
  }

  addPresetColor(preset: ProductColor) {
    if (!this.productFormColors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase())) {
      this.productFormColors.push({ ...preset });
    }
  }

  removeColor(index: number) {
    this.productFormColors.splice(index, 1);
  }

  saveProduct() {
    if (!this.productForm.title || !this.productForm.price || !this.productForm.description) {
      this.showToast('Por favor completa todos los campos requeridos (*)', true);
      return;
    }

    this.isSavingProduct.set(true);

    // Parse sizes
    const sizes = this.productFormSizesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const imagesToSave = this.productFormImages.length > 0
      ? this.productFormImages
      : (this.productFormMainImage ? [this.productFormMainImage] : (this.productForm.images || []));

    const colorsToSave = this.productFormColors
      .filter((c) => c && c.name && c.name.trim() && c.hex && c.hex.trim())
      .map((c) => ({ name: c.name.trim(), hex: c.hex.trim() }));

    const payload: Partial<Product> = {
      ...this.productForm,
      sizes,
      colors: colorsToSave,
      images: imagesToSave,
    };

    if (this.editingProductId()) {
      this.productService.updateProduct(this.editingProductId()!, payload).subscribe({
        next: () => {
          this.isSavingProduct.set(false);
          this.closeProductForm();
          this.loadData();
          this.showToast('Prenda actualizada correctamente');
        },
        error: (err) => {
          this.isSavingProduct.set(false);
          this.showToast(err?.error?.message || 'Error al actualizar prenda', true);
        },
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => {
          this.isSavingProduct.set(false);
          this.closeProductForm();
          this.loadData();
          this.showToast('Prenda creada y publicada exitosamente');
        },
        error: (err) => {
          this.isSavingProduct.set(false);
          this.showToast(err?.error?.message || 'Error al crear prenda', true);
        },
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta prenda del catálogo?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadData();
          this.showToast('Prenda eliminada');
        },
        error: () => {
          this.showToast('Error al eliminar prenda', true);
        },
      });
    }
  }

  // --- Store Config (Text, Banners, Discounts) ---
  onHeroImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.productService.uploadImage(file).subscribe({
      next: (res) => {
        this.configForm.hero.imageUrl = `${environment.uploadsUrl}${res.url}`;
        this.showToast('Imagen de Hero subida');
      },
      error: () => this.showToast('Error al subir imagen', true),
    });
  }

  onPromoImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.productService.uploadImage(file).subscribe({
      next: (res) => {
        this.configForm.promoBanner.imageUrl = `${environment.uploadsUrl}${res.url}`;
        this.showToast('Imagen de promo subida');
      },
      error: () => this.showToast('Error al subir imagen', true),
    });
  }

  onBrandStoryImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploadingBrandStory.set(true);
    this.productService.uploadImage(file).subscribe({
      next: (res) => {
        this.configForm.brandStory.imageUrl = `${environment.uploadsUrl}${res.url}`;
        this.isUploadingBrandStory.set(false);
        this.showToast('Fotografía del manifiesto subida con éxito');
      },
      error: () => {
        this.isUploadingBrandStory.set(false);
        this.showToast('Error al subir fotografía del manifiesto', true);
      },
    });
  }

  saveStoreConfig() {
    this.isSavingConfig.set(true);
    this.storeConfigService.updateConfig(this.configForm).subscribe({
      next: (updated) => {
        this.config.set(updated);
        const cloned = JSON.parse(JSON.stringify(updated));
        if (!cloned.bankTransfer) {
          cloned.bankTransfer = {
            bankName: 'Bancolombia',
            accountType: 'Ahorros',
            accountNumber: '',
            accountHolder: '',
            holderId: '',
            nequiPhone: '',
            daviplataPhone: '',
            llaveNumber: '',
            llaveType: 'Celular',
            instructions: '',
            isEnabled: true,
          };
        }
        if (!cloned.topBanners) {
          cloned.topBanners = [];
        }
        if (!cloned.collections) {
          cloned.collections = [];
        }
        this.configForm = cloned;
        this.isSavingConfig.set(false);
        this.showToast('¡Configuración de la tienda guardada y publicada!');
      },
      error: (err) => {
        this.isSavingConfig.set(false);
        this.showToast(err?.error?.message || 'Error al guardar configuración', true);
      },
    });
  }

  // --- Banner Carousel Actions ---
  onBannerImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploadingBanner.set(true);
    this.productService.uploadImage(file).subscribe({
      next: (res) => {
        this.newBanner.imageUrl = `${environment.uploadsUrl}${res.url}`;
        this.isUploadingBanner.set(false);
        this.showToast('Imagen del banner subida con éxito');
      },
      error: () => {
        this.isUploadingBanner.set(false);
        this.showToast('Error al subir imagen del banner', true);
      },
    });
  }

  addBanner() {
    if (!this.newBanner.imageUrl?.trim()) {
      this.showToast('Por favor sube una imagen o ingresa una URL para el banner', true);
      return;
    }
    if (!this.configForm.topBanners) {
      this.configForm.topBanners = [];
    }
    this.configForm.topBanners.push({
      imageUrl: this.newBanner.imageUrl.trim(),
      link: this.newBanner.link?.trim() || '/catalog',
      title: this.newBanner.title?.trim() || '',
      isActive: this.newBanner.isActive ?? true,
    });
    this.newBanner = {
      imageUrl: '',
      link: '/catalog',
      title: '',
      isActive: true,
    };
    this.showToast('Banner añadido a la lista. Haz clic en "Guardar Todos los Cambios" para publicarlo.');
  }

  removeBanner(index: number) {
    if (this.configForm?.topBanners) {
      this.configForm.topBanners.splice(index, 1);
      this.showToast('Banner eliminado de la lista');
    }
  }

  toggleBannerActive(index: number) {
    if (this.configForm?.topBanners?.[index]) {
      this.configForm.topBanners[index].isActive = !this.configForm.topBanners[index].isActive;
    }
  }

  moveBanner(index: number, direction: 'up' | 'down') {
    const banners = this.configForm?.topBanners;
    if (!banners) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const temp = banners[index];
    banners[index] = banners[targetIndex];
    banners[targetIndex] = temp;
  }

  // --- Collection Actions ---
  onCollectionTitleChange() {
    if (!this.newCollection.title) return;
    this.newCollection.slug = this.slugify(this.newCollection.title);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  onCollectionImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploadingCollection.set(true);
    this.productService.uploadImage(file).subscribe({
      next: (res) => {
        this.newCollection.imageUrl = `${environment.uploadsUrl}${res.url}`;
        this.isUploadingCollection.set(false);
        this.showToast('Imagen de la colección subida con éxito');
      },
      error: () => {
        this.isUploadingCollection.set(false);
        this.showToast('Error al subir imagen de la colección', true);
      },
    });
  }

  addCollection() {
    if (!this.newCollection.title?.trim()) {
      this.showToast('Ingresa el título de la colección', true);
      return;
    }
    if (!this.newCollection.imageUrl?.trim()) {
      this.showToast('Sube una imagen o ingresa una URL para la colección', true);
      return;
    }
    if (!this.newCollection.slug?.trim()) {
      this.newCollection.slug = this.slugify(this.newCollection.title);
    }
    if (!this.configForm.collections) {
      this.configForm.collections = [];
    }
    this.configForm.collections.push({
      title: this.newCollection.title.trim(),
      slug: this.slugify(this.newCollection.slug.trim()),
      imageUrl: this.newCollection.imageUrl.trim(),
      description: this.newCollection.description?.trim() || '',
      category: this.newCollection.category?.trim() || '',
      searchQuery: this.newCollection.searchQuery?.trim() || '',
      isActive: this.newCollection.isActive ?? true,
    });
    this.newCollection = {
      title: '',
      slug: '',
      imageUrl: '',
      description: '',
      category: '',
      searchQuery: '',
      isActive: true,
    };
    this.showToast('Colección añadida a la lista. Haz clic en "Guardar Todos los Cambios" para publicarla.');
  }

  removeCollection(index: number) {
    if (this.configForm?.collections) {
      this.configForm.collections.splice(index, 1);
      this.showToast('Colección eliminada de la lista');
    }
  }

  toggleCollectionActive(index: number) {
    if (this.configForm?.collections?.[index]) {
      this.configForm.collections[index].isActive = !this.configForm.collections[index].isActive;
    }
  }

  moveCollection(index: number, direction: 'up' | 'down') {
    const cols = this.configForm?.collections;
    if (!cols) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cols.length) return;
    const temp = cols[index];
    cols[index] = cols[targetIndex];
    cols[targetIndex] = temp;
  }

  // --- Orders Management ---
  updateOrderStatus(orderId: string, newStatus: string) {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.showToast(`Estado de la orden actualizado a: ${newStatus}`);
        this.loadData();
      },
      error: () => {
        this.showToast('Error al actualizar estado del pedido', true);
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

