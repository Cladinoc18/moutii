import { Component, inject, OnInit, signal } from '@angular/core';
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
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<'login' | 'register'>('login');
  loading = signal<boolean>(false);
  errorMessage = '';

  loginEmail = '';
  loginPassword = '';

  registerData = {
    name: '',
    email: '',
    phone: '',
    password: '',
  };

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

  onLogin() {
    this.errorMessage = '';
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
          this.errorMessage =
            err?.error?.message || 'Credenciales inválidas. Revisa tu correo y contraseña.';
        },
      });
  }

  onRegister() {
    this.errorMessage = '';
    this.loading.set(true);

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage =
          err?.error?.message || 'Error al crear la cuenta. Por favor verifica los datos.';
      },
    });
  }
}
