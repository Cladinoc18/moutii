import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductColorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  hex!: string;

  @IsString()
  @IsOptional()
  _id?: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPrice?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPercent?: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

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
