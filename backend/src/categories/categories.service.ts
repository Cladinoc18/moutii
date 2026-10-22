import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface CategoryWithCount {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  gender: 'Mujer' | 'Hombre' | 'Ambos';
  isActive: boolean;
  order: number;
  productCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class CategoriesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedDefaultCategories();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async seedDefaultCategories(): Promise<void> {
    const count = await this.categoryModel.countDocuments().exec();
    if (count === 0) {
      this.logger.log('Sembrando categorías iniciales de MOUTII con géneros...');
      const defaultCategories: Array<{
        name: string;
        description: string;
        order: number;
        gender: 'Mujer' | 'Hombre' | 'Ambos';
      }> = [
        { name: 'Vestidos', description: 'Vestidos en lino orgánico y cortes fluidos', order: 1, gender: 'Mujer' },
        { name: 'Faldas', description: 'Faldas midi y plisadas de caída vaporosa', order: 2, gender: 'Mujer' },
        { name: 'Tops & Blusas', description: 'Prendas superiores minimalistas en lino y seda', order: 3, gender: 'Mujer' },
        { name: 'Chaquetas & Blazers', description: 'Sastrería atemporal, lanas frías y blazers oversize', order: 4, gender: 'Ambos' },
        { name: 'Pantalones', description: 'Pantalones palazzo y de corte recto atemporales', order: 5, gender: 'Ambos' },
        { name: 'Chalecos', description: 'Chalecos sastre ajustables en café latte y tonos neutros', order: 6, gender: 'Ambos' },
        { name: 'Accesorios', description: 'Bolsos y complementos estructurados en cuero vegano', order: 7, gender: 'Ambos' },
        { name: 'Camisas & Polos', description: 'Camisas clásicas de lino y polos de diseño contemporáneo', order: 8, gender: 'Hombre' },
      ];

      for (const cat of defaultCategories) {
        await this.categoryModel.create({
          ...cat,
          slug: this.generateSlug(cat.name),
          isActive: true,
        });
      }
      this.logger.log(`✔ ${defaultCategories.length} categorías iniciales creadas con género`);
    } else {
      // Ensure existing categories have gender assigned if null
      await this.categoryModel.updateMany(
        { gender: { $exists: false } },
        { $set: { gender: 'Ambos' } },
      );
      await this.categoryModel.updateOne(
        { name: 'Vestidos', gender: 'Ambos' },
        { $set: { gender: 'Mujer' } },
      );
      await this.categoryModel.updateOne(
        { name: 'Faldas', gender: 'Ambos' },
        { $set: { gender: 'Mujer' } },
      );
      await this.categoryModel.updateOne(
        { name: 'Tops & Blusas', gender: 'Ambos' },
        { $set: { gender: 'Mujer' } },
      );
      // Clean up any existing descriptions with earth tones in database
      await this.categoryModel.updateOne(
        { name: 'Pantalones', description: /tierra/i },
        { $set: { description: 'Pantalones palazzo y de corte recto atemporales' } },
      );
      await this.categoryModel.updateOne(
        { name: 'Camisas & Polos', description: /tierra/i },
        { $set: { description: 'Camisas clásicas de lino y polos de diseño contemporáneo' } },
      );
      const camisasExists = await this.categoryModel.findOne({ name: 'Camisas & Polos' });
      if (!camisasExists) {
        await this.categoryModel.create({
          name: 'Camisas & Polos',
          slug: 'camisas-polos',
          description: 'Camisas clásicas de lino y polos de diseño contemporáneo',
          gender: 'Hombre',
          order: 8,
          isActive: true,
        });
      }
    }
  }

  async findAll(gender?: string): Promise<CategoryDocument[]> {
    const filter: Record<string, any> = { isActive: true };

    if (gender === 'Mujer') {
      filter.gender = { $in: ['Mujer', 'Ambos'] };
    } else if (gender === 'Hombre') {
      filter.gender = { $in: ['Hombre', 'Ambos'] };
    }

    return this.categoryModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .exec();
  }

  async findAllAdmin(gender?: string): Promise<CategoryWithCount[]> {
    const filter: Record<string, any> = {};
    if (gender && gender !== 'all') {
      filter.gender = gender;
    }

    const categories = await this.categoryModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .exec();

    const counts = await this.productModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => countMap.set(c._id, c.count));

    return categories.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      gender: cat.gender || 'Ambos',
      isActive: cat.isActive,
      order: cat.order,
      productCount: countMap.get(cat.name) || 0,
      createdAt: (cat as any).createdAt,
      updatedAt: (cat as any).updatedAt,
    }));
  }

  async findOne(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const trimmedName = createCategoryDto.name.trim();

    // Check if category name exists (case-insensitive)
    const existing = await this.categoryModel
      .findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } })
      .exec();

    if (existing) {
      throw new BadRequestException(`Ya existe una categoría con el nombre "${trimmedName}"`);
    }

    const slug = this.generateSlug(trimmedName);

    const highestOrder = await this.categoryModel
      .findOne()
      .sort({ order: -1 })
      .select('order')
      .exec();
    const nextOrder = (highestOrder?.order ?? 0) + 1;

    const created = new this.categoryModel({
      name: trimmedName,
      slug,
      description: createCategoryDto.description?.trim() || '',
      gender: createCategoryDto.gender || 'Ambos',
      isActive: true,
      order: nextOrder,
    });

    return created.save();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    const category = await this.findOne(id);
    const oldName = category.name;

    const updates: Partial<Category> = {};

    if (updateCategoryDto.gender) {
      updates.gender = updateCategoryDto.gender;
    }

    if (updateCategoryDto.name) {
      const trimmedName = updateCategoryDto.name.trim();
      if (trimmedName.toLowerCase() !== oldName.toLowerCase()) {
        const existing = await this.categoryModel
          .findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
            _id: { $ne: id },
          })
          .exec();

        if (existing) {
          throw new BadRequestException(`Ya existe otra categoría con el nombre "${trimmedName}"`);
        }
      }

      updates.name = trimmedName;
      updates.slug = this.generateSlug(trimmedName);
    }

    if (updateCategoryDto.description !== undefined) {
      updates.description = updateCategoryDto.description.trim();
    }

    if (updateCategoryDto.isActive !== undefined) {
      updates.isActive = updateCategoryDto.isActive;
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // If category name changed, update existing products with old category name
    if (updates.name && updates.name !== oldName) {
      await this.productModel.updateMany(
        { category: oldName },
        { $set: { category: updates.name } },
      );
      this.logger.log(`Prendas actualizadas con el nuevo nombre de categoría: ${updates.name}`);
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);

    // Check if products exist in this category
    const productCount = await this.productModel.countDocuments({
      category: category.name,
    }).exec();

    if (productCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría "${category.name}" porque contiene ${productCount} prenda(s) asociada(s). Reasigna o elimina las prendas antes de borrar la categoría.`,
      );
    }

    await this.categoryModel.findByIdAndDelete(id).exec();
    return { message: `Categoría "${category.name}" eliminada correctamente` };
  }
}
