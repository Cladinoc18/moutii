import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private cartService = inject(CartService);

  activeImageIndex = 0;
  isHovered = false;
  addedFeedback = signal(false);

  get currentImage(): string {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images[this.activeImageIndex] || this.product.images[0];
    }
    return 'logo.png';
  }

  get secondaryImage(): string | null {
    if (this.product?.images && this.product.images.length > 1 && this.activeImageIndex === 0) {
      return this.product.images[1];
    }
    return null;
  }

  nextImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.product?.images && this.product.images.length > 1) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.product.images.length;
    }
  }

  prevImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.product?.images && this.product.images.length > 1) {
      this.activeImageIndex =
        (this.activeImageIndex - 1 + this.product.images.length) % this.product.images.length;
    }
  }

  quickAdd(size?: string, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    const chosenSize = size || this.product.sizes?.[0] || 'M';
    const color = this.product.colors?.[0]?.name || 'Estándar';
    this.cartService.addToCart(this.product, chosenSize, color, 1);

    this.addedFeedback.set(true);
    setTimeout(() => {
      this.addedFeedback.set(false);
    }, 1800);
  }
}
