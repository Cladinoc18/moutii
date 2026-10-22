export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  gender?: 'Mujer' | 'Hombre' | 'Ambos';
  isActive: boolean;
  order?: number;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  gender?: 'Mujer' | 'Hombre' | 'Ambos';
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  gender?: 'Mujer' | 'Hombre' | 'Ambos';
  isActive?: boolean;
}

