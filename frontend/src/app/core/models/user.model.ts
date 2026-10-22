export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: string;
  city?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

