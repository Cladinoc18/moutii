import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ default: '', trim: true })
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  order!: number;

  @Prop({
    type: String,
    enum: ['Mujer', 'Hombre', 'Ambos'],
    default: 'Ambos',
  })
  gender!: 'Mujer' | 'Hombre' | 'Ambos';
}

export const CategorySchema = SchemaFactory.createForClass(Category);
