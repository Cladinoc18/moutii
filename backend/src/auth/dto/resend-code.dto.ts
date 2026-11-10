import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendCodeDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;
}
