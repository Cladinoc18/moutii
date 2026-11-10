import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<'login' | 'register' | 'verify'>('login');
  loading = signal<boolean>(false);
  errorMessage = '';
  infoMessage = '';

  loginEmail = '';
  loginPassword = '';

  registerData = {
    name: '',
    email: '',
    phone: '',
    password: '',
  };

  verifyEmail = '';
  verifyCode = '';
  resendCooldown = signal<number>(0);
  private cooldownInterval: any = null;

  private returnUrl = '/';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
      if (params['error'] === 'unauthorized') {
        this.errorMessage = 'Acceso restringido. Por favor inicia sesión como Administrador.';
      }
    });
  }

  ngOnDestroy() {
    this.clearCooldownTimer();
  }

  private startCooldown(seconds = 60) {
    this.clearCooldownTimer();
    this.resendCooldown.set(seconds);
    this.cooldownInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        this.clearCooldownTimer();
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  private clearCooldownTimer() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
      this.cooldownInterval = null;
    }
  }

  switchTab(tab: 'login' | 'register') {
    this.errorMessage = '';
    this.infoMessage = '';
    this.activeTab.set(tab);
  }

  onLogin() {
    this.errorMessage = '';
    this.infoMessage = '';
    this.loading.set(true);

    this.authService
      .login({ email: this.loginEmail, password: this.loginPassword })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error: (err) => {
          this.loading.set(false);
          if (err?.error?.requiresVerification) {
            this.verifyEmail = err.error.email || this.loginEmail;
            this.verifyCode = '';
            this.infoMessage =
              err.error.message ||
              'Tu cuenta no está verificada. Te hemos enviado un código a tu correo.';
            this.activeTab.set('verify');
            this.startCooldown(60);
            return;
          }
          this.errorMessage =
            err?.error?.message || 'Credenciales inválidas. Revisa tu correo y contraseña.';
        },
      });
  }

  onRegister() {
    this.errorMessage = '';
    this.infoMessage = '';
    this.loading.set(true);

    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.verifyEmail = res.email || this.registerData.email;
        this.verifyCode = '';
        this.infoMessage = `Hemos enviado un código de confirmación de 6 dígitos a ${this.verifyEmail}. Ingrésalo para activar tu cuenta.`;
        this.activeTab.set('verify');
        this.startCooldown(60);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage =
          err?.error?.message || 'Error al crear la cuenta. Por favor verifica los datos.';
      },
    });
  }

  onVerifyCode() {
    if (!this.verifyCode || this.verifyCode.trim().length !== 6) {
      this.errorMessage = 'Ingresa el código de 6 dígitos que enviamos a tu correo.';
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    this.loading.set(true);

    this.authService
      .verifyCode({ email: this.verifyEmail, code: this.verifyCode.trim() })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage =
            err?.error?.message || 'Código incorrecto o expirado. Por favor verifica e intenta de nuevo.';
        },
      });
  }

  onResendCode() {
    if (this.resendCooldown() > 0 || this.loading()) return;

    this.errorMessage = '';
    this.infoMessage = '';
    this.loading.set(true);

    this.authService.resendCode(this.verifyEmail).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.infoMessage = res.message || 'Nuevo código enviado exitosamente a tu correo.';
        this.startCooldown(60);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage =
          err?.error?.message || 'No fue posible reenviar el código. Intenta de nuevo más tarde.';
      },
    });
  }
}
