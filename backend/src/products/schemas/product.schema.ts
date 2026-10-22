import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class ProductColor {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  hex!: string;
}

export const ProductColorSchema = SchemaFactory.createForClass(ProductColor);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ type: Number, default: null })
  discountPrice?: number | null;

  @Prop({ default: 0 })
  discountPercent?: number;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({
    type: String,
    enum: ['Mujer', 'Hombre', 'Unisex'],
    default: 'Mujer',
  })
  gender!: 'Mujer' | 'Hombre' | 'Unisex';

  @Prop({ type: [String], default: ['S', 'M', 'L'] })
  sizes?: string[];

  @Prop({ type: [ProductColorSchema], default: [] })
  colors?: ProductColor[];

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ required: true, default: 10, min: 0 })
  stock!: number;

  @Prop({ default: false })
  isFeatured?: boolean;

  @Prop({ default: true })
  isActive?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
