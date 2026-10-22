import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreConfigDocument = StoreConfig & Document;

@Schema()
export class AnnouncementBar {
  @Prop({
    default:
      '✨ Envíos gratis por compras superiores a $150.000 COP | 15% OFF en tu primera compra con el código MOUTII15',
  })
  text!: string;

  @Prop({ default: true })
  isEnabled!: boolean;

  @Prop({ default: 'MOUTII15' })
  discountCode!: string;
}
export const AnnouncementBarSchema =
  SchemaFactory.createForClass(AnnouncementBar);

@Schema()
export class HeroConfig {
  @Prop({ default: 'MOUTII' })
  title!: string;

  @Prop({ default: 'By Daniela Mejía' })
  subtitle!: string;

  @Prop({
    default:
      'Elegancia atemporal en siluetas limpias, confección artesanal y texturas nobles.',
  })
  description!: string;

  @Prop({ default: 'Descubrir Colección' })
  buttonText!: string;

  @Prop({ default: '/catalog' })
  buttonLink!: string;

  @Prop({
    default: '/images/products/mouti-item-12.jpg',
  })
  imageUrl!: string;

  @Prop({ default: 'Nueva Colección 2026' })
  badgeText!: string;
}
export const HeroConfigSchema = SchemaFactory.createForClass(HeroConfig);

@Schema()
export class BrandStoryConfig {
  @Prop({ default: 'La Esencia de Moutii' })
  title!: string;

  @Prop({
    default:
      'Moutii surge de una visión donde la moda trasciende las tendencias efímeras para convertirse en una expresión de calma, sofisticación y texturas nobles. Cada diseño honra la armonía de siluetas contemporáneas, acabados artesanales y prendas versátiles para el día a día.',
  })
  text!: string;

  @Prop({
    default:
      '"Vestir con autenticidad es abrazar la serenidad, la elegancia y la belleza de lo esencial."',
  })
  quote!: string;

  @Prop({ default: 'Daniela Mejía - Diseñadora & Fundadora' })
  quoteAuthor!: string;

  @Prop({
    default: '/images/products/mouti-item-6.jpg',
  })
  imageUrl!: string;
}
export const BrandStoryConfigSchema =
  SchemaFactory.createForClass(BrandStoryConfig);

@Schema()
export class PromoBannerConfig {
  @Prop({ default: 'Especial de Temporada' })
  title!: string;

  @Prop({
    default:
      'Hasta 25% de descuento en piezas seleccionadas de la colección.',
  })
  subtitle!: string;

  @Prop({ default: 25 })
  discountPercent!: number;

  @Prop({ default: 'Comprar Ofertas' })
  buttonText!: string;

  @Prop({ default: '/catalog?onSale=true' })
  buttonLink!: string;

  @Prop({
    default: '/images/products/mouti-item-5.jpg',
  })
  imageUrl!: string;

  @Prop({ default: true })
  isEnabled!: boolean;
}
export const PromoBannerConfigSchema =
  SchemaFactory.createForClass(PromoBannerConfig);

@Schema()
export class ContactConfig {
  @Prop({ default: 'contacto@mouti.com' })
  email!: string;

  @Prop({ default: '+57 (300) 123-4567' })
  phone!: string;

  @Prop({ default: 'https://www.instagram.com/moutii_/' })
  instagram!: string;

  @Prop({ default: 'Bogotá & Medellín, Colombia' })
  address!: string;

  @Prop({ default: 'Lunes a Sábado: 10:00 AM - 7:00 PM' })
  schedule!: string;
}
export const ContactConfigSchema = SchemaFactory.createForClass(ContactConfig);

@Schema()
export class BankTransferConfig {
  @Prop({ default: 'Bancolombia' })
  bankName!: string;

  @Prop({ default: 'Ahorros' })
  accountType!: string;

  @Prop({ default: '300-123456-78' })
  accountNumber!: string;

  @Prop({ default: 'Daniela Mejía — MOUTII' })
  accountHolder!: string;

  @Prop({ default: 'CC 1.020.304.506' })
  holderId!: string;

  @Prop({ default: '300 123 4567' })
  nequiPhone!: string;

  @Prop({ default: '300 123 4567' })
  daviplataPhone!: string;

  @Prop({ default: '300 123 4567' })
  llaveNumber!: string;

  @Prop({ default: 'Número Celular' })
  llaveType!: string;

  @Prop({
    default:
      'Transfiere desde la app de cualquier banco usando tu Llave o a nuestra cuenta Bancolombia / Nequi, y adjunta el comprobante al confirmar por WhatsApp.',
  })
  instructions!: string;

  @Prop({ default: true })
  isEnabled!: boolean;
}
export const BankTransferConfigSchema =
  SchemaFactory.createForClass(BankTransferConfig);

@Schema()
export class TopBannerConfig {
  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ default: '/catalog' })
  link!: string;

  @Prop({ default: '' })
  title!: string;

  @Prop({ default: true })
  isActive!: boolean;
}
export const TopBannerConfigSchema =
  SchemaFactory.createForClass(TopBannerConfig);

@Schema()
export class CollectionConfig {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  slug!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: '' })
  category!: string;

  @Prop({ default: '' })
  searchQuery!: string;

  @Prop({ default: true })
  isActive!: boolean;
}
export const CollectionConfigSchema =
  SchemaFactory.createForClass(CollectionConfig);

@Schema({ timestamps: true })
export class StoreConfig {
  @Prop({ type: [TopBannerConfigSchema], default: [] })
  topBanners!: TopBannerConfig[];

  @Prop({ type: [CollectionConfigSchema], default: [] })
  collections!: CollectionConfig[];

  @Prop({ type: AnnouncementBarSchema, default: () => ({}) })
  announcementBar!: AnnouncementBar;

  @Prop({ type: HeroConfigSchema, default: () => ({}) })
  hero!: HeroConfig;

  @Prop({ type: BrandStoryConfigSchema, default: () => ({}) })
  brandStory!: BrandStoryConfig;

  @Prop({ type: PromoBannerConfigSchema, default: () => ({}) })
  promoBanner!: PromoBannerConfig;

  @Prop({ type: ContactConfigSchema, default: () => ({}) })
  contact!: ContactConfig;

  @Prop({ type: BankTransferConfigSchema, default: () => ({}) })
  bankTransfer!: BankTransferConfig;
}

export const StoreConfigSchema = SchemaFactory.createForClass(StoreConfig);

