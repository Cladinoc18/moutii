import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog/catalog.component').then((m) => m.CatalogComponent),
  },
  {
    path: 'collections',
    loadComponent: () =>
      import('./pages/collections/collections.component').then(
        (m) => m.CollectionsComponent,
      ),
  },
  {
    path: 'collections/:slug',
    loadComponent: () =>
      import('./pages/collections/collections.component').then(
        (m) => m.CollectionsComponent,
      ),
  },
  {
    path: 'product/:slugOrId',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'my-orders',
    redirectTo: 'orders',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
