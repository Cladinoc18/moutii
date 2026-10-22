import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, default: 'customer', enum: ['admin', 'customer'] })
  role!: string;

  @Prop({ default: '' })
  phone?: string;

  @Prop({ default: '' })
  address?: string;

  @Prop({ default: '' })
  city?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
