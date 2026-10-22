import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El porcentaje debe ser numérico' })
  @Min(1, { message: 'El descuento mínimo es 1%' })
  @Max(100, { message: 'El descuento máximo es 100%' })
  discountPercent?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
