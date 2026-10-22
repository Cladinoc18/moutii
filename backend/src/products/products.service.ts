import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.productModel.updateMany(
      { gender: { $exists: false } },
      { $set: { gender: 'Mujer' } },
    );
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.floor(1000 + Math.random() * 9000)
    );
  }

  async findAll(query: {
    category?: string;
    gender?: string;
    search?: string;
    featured?: boolean | string;
    onSale?: boolean | string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<ProductDocument[]> {
    const filter: Record<string, any> = { isActive: true };

    if (query.category && query.category !== 'all') {
      filter.category = { $regex: new RegExp(`^${query.category}$`, 'i') };
    }

    if (query.gender && query.gender !== 'all') {
      if (query.gender === 'Mujer') {
        filter.gender = { $in: ['Mujer', 'Unisex'] };
      } else if (query.gender === 'Hombre') {
        filter.gender = { $in: ['Hombre', 'Unisex'] };
      } else {
        filter.gender = query.gender;
      }
    }

    const andClauses: any[] = [];

    if (query.search) {
      andClauses.push({
        $or: [
          { title: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } },
        ],
      });
    }

    if (query.featured === true || query.featured === 'true') {
      filter.isFeatured = true;
    }

    if (query.onSale === true || query.onSale === 'true') {
      andClauses.push({
        $or: [
          { discountPrice: { $gt: 0 } },
          { discountPercent: { $gt: 0 } },
        ],
      });
    }

    if (andClauses.length > 0) {
      filter.$and = andClauses;
    }

    if (query.minPrice || query.maxPrice) {
      const priceFilter: { $gte?: number; $lte?: number } = {};
      if (query.minPrice) priceFilter.$gte = Number(query.minPrice);
      if (query.maxPrice) priceFilter.$lte = Number(query.maxPrice);
      filter.price = priceFilter;
    }

    let sortOption: { [key: string]: SortOrder } = { createdAt: -1 };
    if (query.sort === 'price_asc') sortOption = { price: 1 };
    else if (query.sort === 'price_desc') sortOption = { price: -1 };
    else if (query.sort === 'name') sortOption = { title: 1 };

    return this.productModel.find(filter).sort(sortOption).exec();
  }

  async findAllAdmin(): Promise<ProductDocument[]> {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ slug }).exec();
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const slug =
      createProductDto.slug || this.generateSlug(createProductDto.title);

    let discountPrice = createProductDto.discountPrice;
    let discountPercent = createProductDto.discountPercent || 0;

    if (discountPercent > 0 && !discountPrice) {
      discountPrice = Math.round(
        createProductDto.price * (1 - discountPercent / 100),
      );
    } else if (
      discountPrice &&
      discountPrice < createProductDto.price &&
      !discountPercent
    ) {
      discountPercent = Math.round(
        ((createProductDto.price - discountPrice) / createProductDto.price) *
          100,
      );
    }

    const created = new this.productModel({
      ...createProductDto,
      slug,
      gender: createProductDto.gender || 'Mujer',
      discountPrice: discountPrice || null,
      discountPercent,
    });
    return created.save();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const existing = await this.findOne(id);

    const price = updateProductDto.price ?? existing.price;
    let discountPrice =
      updateProductDto.discountPrice !== undefined
        ? updateProductDto.discountPrice
        : existing.discountPrice;
    const discountPercent =
      updateProductDto.discountPercent !== undefined
        ? updateProductDto.discountPercent
        : existing.discountPercent;

    if (discountPercent && discountPercent > 0) {
      discountPrice = Math.round(price * (1 - discountPercent / 100));
    }

    const updated = await this.productModel
      .findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          discountPrice: discountPrice || null,
          discountPercent: discountPercent || 0,
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Producto no encontrado');
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Producto no encontrado');
    }
    return { message: 'Producto eliminado correctamente' };
  }

  async getCategories(gender?: string): Promise<string[]> {
    const filter: Record<string, any> = { isActive: true };
    if (gender === 'Mujer') {
      filter.gender = { $in: ['Mujer', 'Ambos'] };
    } else if (gender === 'Hombre') {
      filter.gender = { $in: ['Hombre', 'Ambos'] };
    }

    const categories = await this.categoryModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .exec();

    if (categories.length > 0) {
      return categories.map((c) => c.name);
    }

    return this.productModel.distinct('category', {
      isActive: true,
    });
  }

  async count(): Promise<number> {
    return this.productModel.countDocuments().exec();
  }
}
