import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { StoreConfig } from '../models/store-config.model';
import { environment } from '../../../environments/environment';

const DEFAULT_STORE_CONFIG: StoreConfig = {
  topBanners: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      link: '/catalog',
      title: 'Nueva Colección Moutii 2026 — Descubrir Siluetas',
      isActive: true,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop',
      link: '/catalog?category=Vestidos',
      title: 'Vestidos & Enterizos en Lino Natural',
      isActive: true,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop',
      link: '/catalog?onSale=true',
      title: 'Prendas con Descuento Especial de Temporada',
      isActive: true,
    },
  ],
  collections: [
    {
      title: 'Bolsos',
      slug: 'bolsos',
      imageUrl:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=900&auto=format&fit=crop',
      description:
        'Piezas estructuradas, clutches y carteras de diseño artesanal y siluetas atemporales.',
      category: 'Bolsos',
      searchQuery: 'bolso',
      isActive: true,
    },
    {
      title: 'Corazón Latino',
      slug: 'corazon-latino',
      imageUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop',
      description:
        'Nuestra edición insignia inspirada en la calidez, texturas orgánicas y siluetas del trópico.',
      category: '',
      searchQuery: 'latino',
      isActive: true,
    },
    {
      title: 'Sastrería & Blazers',
      slug: 'sastreria',
      imageUrl:
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=900&auto=format&fit=crop',
      description:
        'Blazers oversize, chalecos estructurados y pantalones de corte pulido para él y para ella.',
      category: 'Chaquetas & Blazers',
      searchQuery: '',
      isActive: true,
    },
    {
      title: 'Lino Atemporal',
      slug: 'lino-atemporal',
      imageUrl:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=900&auto=format&fit=crop',
      description:
        'Prendas nobles en 100% lino orgánico: siluetas holgadas, transpirables y versátiles.',
      category: 'Vestidos',
      searchQuery: 'lino',
      isActive: true,
    },
  ],
  announcementBar: {
    text: '✨ Envíos gratis por compras superiores a $150.000 COP | 15% OFF en tu primera compra con el código MOUTII15',
    isEnabled: true,
    discountCode: 'MOUTII15',
  },
  hero: {
    title: 'MOUTII',
    subtitle: 'By Daniela Mejía',
    description:
      'Elegancia atemporal en siluetas limpias, confección artesanal y texturas nobles.',
    buttonText: 'Descubrir Colección',
    buttonLink: '/catalog',
    imageUrl: '/images/products/mouti-item-12.jpg',
    badgeText: 'Nueva Colección 2026',
  },
  brandStory: {
    title: 'La Esencia de Moutii',
    text:
      'Moutii surge de una visión donde la moda trasciende las tendencias efímeras para convertirse en una expresión de calma, sofisticación y texturas nobles. Cada diseño honra la armonía de siluetas contemporáneas, acabados artesanales y prendas versátiles para el día a día.',
    quote:
      '"Vestir con autenticidad es abrazar la serenidad, la elegancia y la belleza de lo esencial."',
    quoteAuthor: 'Daniela Mejía - Diseñadora & Fundadora',
    imageUrl: '/images/products/mouti-item-6.jpg',
  },
  promoBanner: {
    title: 'Especial de Temporada',
    subtitle:
      'Hasta 25% de descuento en piezas seleccionadas de la colección.',
    discountPercent: 25,
    buttonText: 'Comprar Ofertas',
    buttonLink: '/catalog',
    imageUrl: '/images/products/mouti-item-5.jpg',
    isEnabled: true,
  },
  contact: {
    email: 'contacto@mouti.com',
    phone: '+57 (300) 123-4567',
    instagram: 'https://www.instagram.com/moutii_/',
    address: 'Bogotá & Medellín, Colombia',
    schedule: 'Lunes a Sábado: 10:00 AM - 7:00 PM',
  },
  bankTransfer: {
    bankName: 'Bancolombia',
    accountType: 'Ahorros',
    accountNumber: '300-123456-78',
    accountHolder: 'Daniela Mejía — MOUTII',
    holderId: 'CC 1.020.304.506',
    nequiPhone: '300 123 4567',
    daviplataPhone: '300 123 4567',
    llaveNumber: '300 123 4567',
    llaveType: 'Número Celular',
    instructions:
      'Transfiere desde la app de cualquier banco usando tu Llave o a nuestra cuenta Bancolombia / Nequi, y adjunta el comprobante al confirmar por WhatsApp.',
    isEnabled: true,
  },
};

@Injectable({
  providedIn: 'root',
})
export class StoreConfigService {
  private apiUrl = `${environment.apiUrl}/store-config`;

  config = signal<StoreConfig>(DEFAULT_STORE_CONFIG);

  constructor(private http: HttpClient) {
    this.loadConfig().subscribe();
  }

  loadConfig(): Observable<StoreConfig | null> {
    return this.http.get<StoreConfig>(this.apiUrl).pipe(
      tap((cfg) => {
        if (cfg) {
          this.config.set(cfg);
        }
      }),
      catchError((err) => {
        console.warn('Aviso: Utilizando configuración local de Moutii mientras conecta la API:', err?.message);
        return of(null);
      }),
    );
  }

  updateConfig(data: Partial<StoreConfig>): Observable<StoreConfig> {
    return this.http.put<StoreConfig>(this.apiUrl, data).pipe(
      tap((cfg) => this.config.set(cfg)),
    );
  }
}
