import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { StoreConfigService } from '../store-config/store-config.service';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly storeConfigService: StoreConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedStoreConfig();
    await this.seedProducts();
  }

  private async seedAdmin() {
    try {
      const adminCount = await this.usersService.countAdmins();
      if (adminCount === 0) {
        this.logger.log('Inicializando usuario Administrador por defecto...');
        await this.usersService.create({
          name: 'Daniela Mejía',
          email: 'admin@mouti.com',
          password: 'Admin123!',
          role: 'admin',
          phone: '+57 (300) 123-4567',
          city: 'Bogotá',
          address: 'Carrera 11 # 85-32',
        });
        this.logger.log('✔ Administrador creado: admin@mouti.com / Admin123!');
      }
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Error al inicializar admin: ${err.message}`);
    }
  }

  private async seedStoreConfig() {
    try {
      await this.storeConfigService.getConfig();
      this.logger.log('✔ Configuración de tienda inicial verificada');
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Error al inicializar configuración: ${err.message}`);
    }
  }

  private async seedProducts() {
    try {
      this.logger.log('Verificando catálogo inicial de prendas mouti con secciones...');

        const sampleProducts: CreateProductDto[] = [
          {
            title: 'Vestido Lino Espresso Daniels',
            slug: 'vestido-lino-espresso-daniels',
            description:
              'Confeccionado en 100% lino orgánico con caída fluida y escote sutil. Su tonalidad café espresso resalta la silueta femenina con una elegancia serena y natural.',
            price: 189000,
            discountPrice: 151200,
            discountPercent: 20,
            category: 'Vestidos',
            sizes: ['XS', 'S', 'M', 'L'],
            colors: [
              { name: 'Café Espresso', hex: '#4A3528' },
              { name: 'Beige Arena', hex: '#E5D9C8' },
            ],
            images: [
              '/images/products/mouti-item-1.jpg',
              '/images/products/mouti-item-2.jpg',
            ],
            stock: 15,
            isFeatured: true,
            isActive: true,
            gender: 'Mujer',
          },
          {
            title: 'Blazer Oversize Noir Atemporal',
            slug: 'blazer-oversize-noir-atemporal',
            description:
              'Una prenda arquitectónica esencial en cualquier fondo de armario. Confección sastre impecable en mezcla de lana fría negra con solapa clásica y botones carey café.',
            price: 245000,
            discountPrice: 208250,
            discountPercent: 15,
            category: 'Chaquetas & Blazers',
            sizes: ['S', 'M', 'L'],
            colors: [
              { name: 'Negro Puro', hex: '#1C1917' },
              { name: 'Café Chocolate', hex: '#3B291D' },
            ],
            images: [
              '/images/products/mouti-item-3.jpg',
              '/images/products/mouti-item-4.jpg',
            ],
            stock: 12,
            isFeatured: true,
            isActive: true,
            gender: 'Mujer',
          },
          {
            title: 'Pantalón Palazzo Arena Beige',
            slug: 'pantalon-palazzo-arena-beige',
            description:
              'Pantalón de tiro alto con pinzas frontales y bota ancha fluida en tono beige arena. Combina comodidad absoluta con el refinamiento de la sastrería moderna.',
            price: 165000,
            discountPrice: null,
            discountPercent: 0,
            category: 'Pantalones',
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: [
              { name: 'Beige Arena', hex: '#EFE9DF' },
              { name: 'Negro Intenso', hex: '#1C1917' },
            ],
            images: [
              '/images/products/mouti-item-5.jpg',
              '/images/products/mouti-item-6.jpg',
            ],
            stock: 18,
            isFeatured: true,
            isActive: true,
            gender: 'Mujer',
          },
          {
            title: 'Top Minimalista Lino & Seda Crema',
            slug: 'top-minimalista-lino-seda-crema',
            description:
              'Top sin mangas de líneas puras elaborado en mezcla noble de lino y seda con acabado suave al tacto. Ideal para estilismos superpuestos monocromáticos.',
            price: 95000,
            discountPrice: 76000,
            discountPercent: 20,
            category: 'Tops & Blusas',
            sizes: ['S', 'M', 'L'],
            colors: [
              { name: 'Crema Suave', hex: '#FAF8F5' },
              { name: 'Café Moca', hex: '#8C6D58' },
            ],
            images: [
              '/images/products/mouti-item-7.jpg',
            ],
            stock: 25,
            isFeatured: false,
            isActive: true,
            gender: 'Mujer',
          },
          {
            title: 'Trench Coat Moca Daniels Edition',
            slug: 'trench-coat-moca-daniels-edition',
            description:
              'Abrigo icónico con cinturón anudable, solapas amplias y forro interior satinado en tono beige contrastante. Repelente a la llovizna con corte impecable.',
            price: 320000,
            discountPrice: 240000,
            discountPercent: 25,
            category: 'Chaquetas & Blazers',
            sizes: ['S', 'M', 'L'],
            colors: [
              { name: 'Café Moca Daniels', hex: '#7A5C43' },
              { name: 'Negro', hex: '#1C1917' },
            ],
            images: [
              '/images/products/mouti-item-8.jpg',
              '/images/products/mouti-item-9.jpg',
            ],
            stock: 8,
            isFeatured: true,
            isActive: true,
            gender: 'Mujer',
          },
          {
            title: 'Falda Midi Plisada Crema & Lino',
            slug: 'falda-midi-plisada-crema-lino',
            description:
              'Falda midi con pretina elástica posterior y movimiento ligero y vaporoso. Aporta una silueta fluida perfecta para llevar de día o de noche.',
            price: 145000,
            discountPrice: null,
            discountPercent: 0,
            category: 'Faldas',
            sizes: ['XS', 'S', 'M', 'L'],
            colors: [
              { name: 'Crema Beige', hex: '#F3EFEA' },
              { name: 'Café Chocolate', hex: '#4A3528' },
            ],
            images: [
              '/images/products/mouti-item-10.jpg',
            ],
            stock: 14,
            isFeatured: false,
            isActive: true,
            gender: 'Mujer',
          },
          {
            title: 'Chaleco Sastre Café Latte',
            slug: 'chaleco-sastre-cafe-latte',
            description:
              'Chaleco sastre en tono café latte con espalda ajustable y botones forrados. Puede lucirse como top único o sobre camisas holgadas.',
            price: 135000,
            discountPrice: 121500,
            discountPercent: 10,
            category: 'Chalecos',
            sizes: ['S', 'M', 'L'],
            colors: [
              { name: 'Café Latte', hex: '#A97B6D' },
              { name: 'Negro Profundo', hex: '#1C1917' },
            ],
            images: [
              '/images/products/mouti-item-11.jpg',
            ],
            stock: 10,
            isFeatured: true,
            isActive: true,
            gender: 'Mujer',
          },
          {
            title: 'Bolso Tote Estructurado Noir',
            slug: 'bolso-tote-estructurado-noir',
            description:
              'Bolso tote elaborado en cuero vegano de alta resistencia con detalles en herrajes tono oro viejo y amplio espacio interior con estuche organizador desmontable.',
            price: 210000,
            discountPrice: null,
            discountPercent: 0,
            category: 'Accesorios',
            sizes: ['Única'],
            colors: [
              { name: 'Negro Noir', hex: '#121212' },
              { name: 'Café Caramelo', hex: '#634832' },
            ],
            images: [
              '/images/products/mouti-item-12.jpg',
            ],
            stock: 20,
            isFeatured: false,
            isActive: true,
            gender: 'Unisex',
          },
          {
            title: 'Camisa Clásica Lino Daniels Hombre',
            slug: 'camisa-clasica-lino-daniels-hombre',
            description:
              'Camisa masculina de corte contemporáneo en 100% lino lavado suave. Cuello francés relajado y puños ajustables en tono arena beige.',
            price: 175000,
            discountPrice: 140000,
            discountPercent: 20,
            category: 'Camisas & Polos',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [
              { name: 'Beige Arena', hex: '#E5D9C8' },
              { name: 'Café Espresso', hex: '#4A3528' },
            ],
            images: [
              '/images/products/mouti-item-3.jpg',
            ],
            stock: 16,
            isFeatured: true,
            isActive: true,
            gender: 'Hombre',
          },
          {
            title: 'Pantalón Sastre Lino Hombre Espresso',
            slug: 'pantalon-sastre-lino-hombre-espresso',
            description:
              'Pantalón sastre masculino con pretina limpia y confección en mezcla noble de lino y algodón. Tono café espresso de alta versatilidad.',
            price: 195000,
            discountPrice: null,
            discountPercent: 0,
            category: 'Pantalones',
            sizes: ['30', '32', '34', '36'],
            colors: [
              { name: 'Café Espresso', hex: '#4A3528' },
              { name: 'Negro', hex: '#1C1917' },
            ],
            images: [
              '/images/products/mouti-item-5.jpg',
            ],
            stock: 14,
            isFeatured: true,
            isActive: true,
            gender: 'Hombre',
          },
        ];

        for (const item of sampleProducts) {
          try {
            const existing = await this.productsService.findBySlug(item.slug!);
            if (existing && (!existing.gender || existing.gender !== item.gender)) {
              await this.productsService.update(existing._id.toString(), { gender: item.gender });
            }
          } catch {
            await this.productsService.create(item);
          }
        }

        this.logger.log(
          `✔ Catálogo de prendas verificado y sincronizado con géneros/secciones`,
        );
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Error al sembrar productos: ${err.message}`);
    }
  }
}
