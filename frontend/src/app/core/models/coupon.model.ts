export interface Coupon {
  _id?: string;
  code: string;
  discountPercent: number;
  description?: string;
  isActive: boolean;
  minPurchase: number;
  expiresAt?: string | null;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponDto {
  code: string;
  discountPercent: number;
  description?: string;
  isActive?: boolean;
  minPurchase?: number;
  expiresAt?: string | null;
}

export interface UpdateCouponDto {
  code?: string;
  discountPercent?: number;
  description?: string;
  isActive?: boolean;
  minPurchase?: number;
  expiresAt?: string | null;
}

export interface CouponValidationResponse {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  discountAmount?: number;
  description?: string;
  message: string;
}
