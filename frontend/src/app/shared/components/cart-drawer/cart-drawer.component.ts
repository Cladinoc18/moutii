import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  private router = inject(Router);

  couponInput = '';
  couponMessage = '';
  couponSuccess = false;
  isApplyingCoupon = false;

  applyCoupon() {
    if (!this.couponInput.trim()) {
      this.couponSuccess = false;
      this.couponMessage = 'Ingresa un código de descuento';
      return;
    }
    this.isApplyingCoupon = true;
    this.couponMessage = '';

    this.cartService.applyCoupon(this.couponInput).subscribe({
      next: (res) => {
        this.isApplyingCoupon = false;
        this.couponSuccess = res.valid;
        this.couponMessage = res.message;
        if (res.valid) {
          this.couponInput = '';
        }
      },
      error: (err) => {
        this.isApplyingCoupon = false;
        this.couponSuccess = false;
        this.couponMessage = err?.error?.message || 'Error al validar el cupón';
      },
    });
  }

  removeCoupon() {
    this.cartService.removeCoupon();
    this.couponMessage = '';
    this.couponSuccess = false;
  }

  goToCatalog() {
    this.cartService.closeCart();
    this.router.navigate(['/catalog']);
  }

  proceedToCheckout() {
    this.cartService.closeCart();
    this.router.navigate(['/checkout']);
  }
}
