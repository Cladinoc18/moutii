import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StoreConfig,
  StoreConfigDocument,
} from './schemas/store-config.schema';

@Injectable()
export class StoreConfigService {
  constructor(
    @InjectModel(StoreConfig.name)
    private storeConfigModel: Model<StoreConfigDocument>,
  ) {}

  async getConfig(): Promise<StoreConfigDocument> {
    let config = await this.storeConfigModel.findOne().exec();
    if (!config) {
      config = new this.storeConfigModel({});
      await config.save();
    } else {
      let needsSave = false;
      if (config.hero?.title === 'MOUTI') {
        config.hero.title = 'MOUTII';
        needsSave = true;
      }
      if (config.bankTransfer?.accountHolder === 'Daniela Mejía — MOUTI') {
        config.bankTransfer.accountHolder = 'Daniela Mejía — MOUTII';
        needsSave = true;
      }
      if (config.announcementBar?.discountCode === 'MOUTI15') {
        config.announcementBar.discountCode = 'MOUTII15';
        if (config.announcementBar.text) {
          config.announcementBar.text = config.announcementBar.text.replace(/MOUTI15/g, 'MOUTII15');
        }
        needsSave = true;
      }
      if (config.brandStory?.title === 'La Esencia de Mouti') {
        config.brandStory.title = 'La Esencia de Moutii';
        needsSave = true;
      }

      // Automatically purge any earth tone / tonos tierra references from stored config
      if (config.brandStory?.quote && /tierra/i.test(config.brandStory.quote)) {
        config.brandStory.quote = '"Vestir con autenticidad es abrazar la serenidad, la elegancia y la belleza de lo esencial."';
        needsSave = true;
      }
      if (config.brandStory?.text && /tierra/i.test(config.brandStory.text)) {
        config.brandStory.text =
          'Moutii surge de una visión donde la moda trasciende las tendencias efímeras para convertirse en una expresión de calma, sofisticación y texturas nobles. Cada diseño honra la armonía de siluetas contemporáneas, acabados artesanales y prendas versátiles para el día a día.';
        needsSave = true;
      }
      if (config.hero?.description && /tierra/i.test(config.hero.description)) {
        config.hero.description =
          'Elegancia atemporal en siluetas limpias, confección artesanal y texturas nobles.';
        needsSave = true;
      }
      if (config.promoBanner?.subtitle && /tierra/i.test(config.promoBanner.subtitle)) {
        config.promoBanner.subtitle =
          'Hasta 25% de descuento en piezas seleccionadas de la colección.';
        needsSave = true;
      }

      if (needsSave) {
        await config.save();
      }
    }

    if (!config.topBanners || config.topBanners.length === 0) {
      config.topBanners = [
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
      ];
      await config.save();
    }

    if (!config.collections || config.collections.length === 0) {
      config.collections = [
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
      ];
      await config.save();
    }

    return config;
  }

  async updateConfig(
    updateData: Partial<StoreConfig>,
  ): Promise<StoreConfigDocument> {
    let config = await this.storeConfigModel.findOne().exec();
    if (!config) {
      config = new this.storeConfigModel(updateData);
      return config.save();
    }

    Object.assign(config, updateData);
    return config.save();
  }
}
