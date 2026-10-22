import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBarComponent } from './shared/components/announcement-bar/announcement-bar.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AnnouncementBarComponent,
    NavbarComponent,
    FooterComponent,
    CartDrawerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
