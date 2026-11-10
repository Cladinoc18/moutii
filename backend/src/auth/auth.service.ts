import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { MailService } from './mail.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private createAuthResponse(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
      },
    };
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Record<string, unknown> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const userObj = user.toObject() as Record<string, unknown>;
      delete userObj['password'];
      return userObj;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.isVerified === false) {
      // Reenviar código automáticamente si ya pasó el cooldown de 60 segundos
      const now = Date.now();
      const lastSent = user.lastCodeSentAt ? new Date(user.lastCodeSentAt).getTime() : 0;
      if (now - lastSent >= 60000) {
        const newCode = this.generateCode();
        user.verificationCode = newCode;
        user.verificationExpires = new Date(now + 15 * 60 * 1000);
        user.lastCodeSentAt = new Date(now);
        await user.save();
        await this.mailService.sendVerificationCode(user.email, newCode, user.name);
      }

      throw new UnauthorizedException({
        message: 'Tu cuenta no ha sido verificada. Te enviamos un código a tu correo.',
        requiresVerification: true,
        email: user.email,
      });
    }

    return this.createAuthResponse(user);
  }

  async register(registerDto: RegisterDto) {
    const code = this.generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    const now = new Date();

    const user = await this.usersService.create({
      ...registerDto,
      role: 'customer',
      isVerified: false,
      verificationCode: code,
      verificationExpires: expires,
      lastCodeSentAt: now,
    });

    await this.mailService.sendVerificationCode(user.email, code, user.name);

    return {
      requiresVerification: true,
      email: user.email,
      message: 'Código de confirmación enviado a tu correo electrónico',
    };
  }

  async verifyCode(verifyEmailDto: VerifyEmailDto) {
    const email = verifyEmailDto.email.toLowerCase().trim();
    const code = verifyEmailDto.code.trim();

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isVerified) {
      return this.createAuthResponse(user);
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException('El código de verificación es incorrecto');
    }

    if (user.verificationExpires && new Date(user.verificationExpires).getTime() < Date.now()) {
      throw new BadRequestException('El código ha expirado. Solicita un nuevo código.');
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    return this.createAuthResponse(user);
  }

  async resendCode(resendCodeDto: ResendCodeDto) {
    const email = resendCodeDto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isVerified) {
      throw new BadRequestException('Esta cuenta ya se encuentra verificada. Puedes iniciar sesión.');
    }

    const now = Date.now();
    const lastSent = user.lastCodeSentAt ? new Date(user.lastCodeSentAt).getTime() : 0;
    const cooldownMs = 60000;
    if (now - lastSent < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - (now - lastSent)) / 1000);
      throw new BadRequestException(`Por favor espera ${waitSec} segundos antes de solicitar otro código.`);
    }

    const code = this.generateCode();
    user.verificationCode = code;
    user.verificationExpires = new Date(now + 15 * 60 * 1000);
    user.lastCodeSentAt = new Date(now);
    await user.save();

    await this.mailService.sendVerificationCode(user.email, code, user.name);

    return {
      message: 'Nuevo código enviado exitosamente a tu correo.',
    };
  }
}
