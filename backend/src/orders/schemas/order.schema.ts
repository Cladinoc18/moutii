import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class OrderItem {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ default: 'M' })
  size?: string;

  @Prop({ default: '' })
  color?: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ default: '' })
  image?: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber!: string;

  @Prop({ required: true })
  customerName!: string;

  @Prop({ required: true })
  customerEmail!: string;

  @Prop({ required: true })
  customerPhone!: string;

  @Prop({ required: true })
  shippingAddress!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItem[];

  @Prop({ required: true })
  subtotal!: number;

  @Prop({ default: 0 })
  discount?: number;

  @Prop({ default: '' })
  discountCode?: string;

  @Prop({ required: true })
  total!: number;

  @Prop({
    default: 'Pendiente de Pago',
    enum: [
      'Pendiente de Pago',
      'Pago Verificado',
      'Pendiente',
      'En Preparación',
      'Enviado',
      'Entregado',
      'Cancelado',
    ],
  })
  status!: string;

  @Prop({ default: 'Contra Entrega' })
  paymentMethod!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
