import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: userData.email?.toLowerCase(),
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password!, salt);

    if (existing) {
      if (existing.isVerified) {
        throw new ConflictException(
          'El correo electrónico ya se encuentra registrado',
        );
      }
      // Si el usuario existe pero no completó su verificación, actualizamos sus credenciales y código
      existing.name = userData.name || existing.name;
      existing.phone = userData.phone !== undefined ? userData.phone : existing.phone;
      existing.password = hashedPassword;
      existing.verificationCode = userData.verificationCode;
      existing.verificationExpires = userData.verificationExpires;
      existing.lastCodeSentAt = userData.lastCodeSentAt;
      existing.isVerified = userData.isVerified ?? false;
      return existing.save();
    }

    const user = new this.userModel({
      ...userData,
      email: userData.email?.toLowerCase(),
      password: hashedPassword,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async countAdmins(): Promise<number> {
    return this.userModel.countDocuments({ role: 'admin' }).exec();
  }
}
