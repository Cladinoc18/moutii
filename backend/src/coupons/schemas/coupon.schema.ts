import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, min: 1, max: 100 })
  discountPercent: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  minPurchase: number;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ default: 0 })
  usageCount: number;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
