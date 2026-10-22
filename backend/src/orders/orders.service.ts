import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly couponsService: CouponsService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MOU-${y}${m}-${random}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const orderNumber = this.generateOrderNumber();
    const order = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      status: 'Pendiente de Pago',
    });
    const saved = await order.save();

    if (createOrderDto.discountCode) {
      await this.couponsService.recordUsage(createOrderDto.discountCode);
    }

    return saved;
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return order;
  }

  async updateStatus(id: string, status: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return order;
  }

  async count(): Promise<number> {
    return this.orderModel.countDocuments().exec();
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderDocument> {
    const cleanNumber = orderNumber.trim();
    const order = await this.orderModel
      .findOne({
        orderNumber: { $regex: new RegExp(`^${cleanNumber}$`, 'i') },
      })
      .exec();
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return order;
  }

  async findByNumbers(orderNumbers: string[]): Promise<OrderDocument[]> {
    if (!orderNumbers || orderNumbers.length === 0) return [];
    const cleanList = orderNumbers.map((n) => n.trim().toUpperCase());
    return this.orderModel
      .find({
        orderNumber: { $in: cleanList },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByEmail(email: string): Promise<OrderDocument[]> {
    if (!email || !email.trim()) return [];
    return this.orderModel
      .find({
        customerEmail: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
