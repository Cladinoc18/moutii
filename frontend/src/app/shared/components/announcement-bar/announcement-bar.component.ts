import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreConfigService } from '../../../core/services/store-config.service';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-bar.component.html',
  styleUrl: './announcement-bar.component.scss',
})
export class AnnouncementBarComponent {
  configService = inject(StoreConfigService);
}
