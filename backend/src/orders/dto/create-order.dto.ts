import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  quantity!: number;

  @IsString()
  @IsOptional()
  image?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  customerName!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  customerEmail!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  customerPhone!: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección de entrega es requerida' })
  shippingAddress!: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  city!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsNumber()
  subtotal!: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  discountCode?: string;

  @IsNumber()
  total!: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
