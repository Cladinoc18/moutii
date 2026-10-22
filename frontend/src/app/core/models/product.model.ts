export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  discountPercent?: number;
  category: string;
  gender?: 'Mujer' | 'Hombre' | 'Unisex';
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  category?: string;
  gender?: string;
  search?: string;
  featured?: boolean;
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

