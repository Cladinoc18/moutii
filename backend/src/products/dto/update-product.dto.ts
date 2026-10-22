import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductColorDto } from './create-product.dto';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPrice?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPercent?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Mujer', 'Hombre', 'Unisex'])
  gender?: 'Mujer' | 'Hombre' | 'Unisex';

  @IsArray()
  @IsOptional()
  sizes?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  colors?: ProductColorDto[];

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
