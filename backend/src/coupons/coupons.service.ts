import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  discountAmount?: number;
  description?: string;
  message: string;
}

@Injectable()
export class CouponsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultCoupons();
  }

  private async seedDefaultCoupons() {
    try {
      const count = await this.couponModel.countDocuments().exec();
      if (count === 0) {
        this.logger.log('Sembrando códigos de descuento iniciales...');
        const defaults: CreateCouponDto[] = [
          {
            code: 'MOUTII15',
            discountPercent: 15,
            description: '15% de descuento en toda la tienda',
            minPurchase: 0,
            isActive: true,
          },
          {
            code: 'DANIELA20',
            discountPercent: 20,
            description: '20% de descuento especial Daniela Mejía',
            minPurchase: 100000,
            isActive: true,
          },
        ];

        for (const c of defaults) {
          await this.couponModel.create({
            ...c,
            code: c.code.toUpperCase().trim(),
          });
        }
        this.logger.log('✔ Códigos de descuento iniciales creados (MOUTII15, DANIELA20)');
      } else {
        // Ensure MOUTII15 exists if seeded previously with MOUTI15
        const mouti2 = await this.couponModel.findOne({ code: 'MOUTII15' }).exec();
        if (!mouti2) {
          await this.couponModel.create({
            code: 'MOUTII15',
            discountPercent: 15,
            description: '15% de descuento en toda la tienda',
            minPurchase: 0,
            isActive: true,
          });
          this.logger.log('✔ Código MOUTII15 añadido exitosamente');
        }
      }
    } catch (err) {
      const error = err as Error;
      this.logger.warn(`Error al inicializar cupones: ${error.message}`);
    }
  }

  async findAllAdmin(): Promise<CouponDocument[]> {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async findActive(): Promise<CouponDocument[]> {
    return this.couponModel.find({ isActive: true }).sort({ discountPercent: -1 }).exec();
  }

  async findById(id: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) {
      throw new NotFoundException('Código de descuento no encontrado');
    }
    return coupon;
  }

  async findByCode(code: string): Promise<CouponDocument | null> {
    const cleanCode = code.trim().toUpperCase();
    return this.couponModel.findOne({ code: cleanCode }).exec();
  }

  async create(createCouponDto: CreateCouponDto): Promise<CouponDocument> {
    const cleanCode = createCouponDto.code.trim().toUpperCase();

    const existing = await this.couponModel.findOne({ code: cleanCode }).exec();
    if (existing) {
      throw new BadRequestException(`El código de descuento "${cleanCode}" ya existe`);
    }

    const created = new this.couponModel({
      ...createCouponDto,
      code: cleanCode,
      expiresAt: createCouponDto.expiresAt ? new Date(createCouponDto.expiresAt) : null,
    });
    return created.save();
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<CouponDocument> {
    const existing = await this.findById(id);

    if (updateCouponDto.code) {
      const cleanCode = updateCouponDto.code.trim().toUpperCase();
      if (cleanCode !== existing.code) {
        const duplicate = await this.couponModel.findOne({ code: cleanCode, _id: { $ne: id } }).exec();
        if (duplicate) {
          throw new BadRequestException(`El código "${cleanCode}" ya está en uso`);
        }
        updateCouponDto.code = cleanCode;
      }
    }

    const payload: any = { ...updateCouponDto };
    if (updateCouponDto.expiresAt) {
      payload.expiresAt = new Date(updateCouponDto.expiresAt);
    }

    const updated = await this.couponModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Código de descuento no encontrado');
    }
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const coupon = await this.findById(id);
    await this.couponModel.findByIdAndDelete(id).exec();
    return { message: `Código "${coupon.code}" eliminado exitosamente` };
  }

  async validateCoupon(code: string, subtotal = 0): Promise<CouponValidationResult> {
    if (!code || !code.trim()) {
      return {
        valid: false,
        message: 'Por favor ingresa un código de descuento',
      };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await this.couponModel.findOne({ code: cleanCode }).exec();

    if (!coupon) {
      return {
        valid: false,
        message: `El código "${cleanCode}" no es válido`,
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        message: `El código "${cleanCode}" ya no se encuentra activo`,
      };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return {
        valid: false,
        message: `El código "${cleanCode}" ha expirado`,
      };
    }

    if (coupon.minPurchase > 0 && subtotal > 0 && subtotal < coupon.minPurchase) {
      const formattedMin = Math.round(coupon.minPurchase).toLocaleString('es-CO');
      return {
        valid: false,
        message: `El código "${cleanCode}" requiere una compra mínima de $${formattedMin} COP`,
      };
    }

    const discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);

    return {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      description: coupon.description,
      message: `¡Código ${coupon.code} aplicado! (${coupon.discountPercent}% de descuento)`,
    };
  }

  async recordUsage(code: string): Promise<void> {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    await this.couponModel.updateOne(
      { code: cleanCode },
      { $inc: { usageCount: 1 } },
    ).exec();
  }
}
