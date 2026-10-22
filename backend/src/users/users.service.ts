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
    if (existing) {
      throw new ConflictException(
        'El correo electrónico ya se encuentra registrado',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password!, salt);

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

  async countAdmins(): Promise<number> {
    return this.userModel.countDocuments({ role: 'admin' }).exec();
  }
}
