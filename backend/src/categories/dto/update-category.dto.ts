import { IsOptional, IsString, MaxLength, IsBoolean, IsIn } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsIn(['Mujer', 'Hombre', 'Ambos'], {
    message: 'El género debe ser Mujer, Hombre o Ambos',
  })
  gender?: 'Mujer' | 'Hombre' | 'Ambos';
}
