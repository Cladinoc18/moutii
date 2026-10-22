export interface AnnouncementBarConfig {
  text: string;
  isEnabled: boolean;
  discountCode: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  badgeText: string;
}

export interface BrandStoryConfig {
  title: string;
  text: string;
  quote: string;
  quoteAuthor: string;
  imageUrl: string;
}

export interface PromoBannerConfig {
  title: string;
  subtitle: string;
  discountPercent: number;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  isEnabled: boolean;
}

export interface ContactConfig {
  email: string;
  phone: string;
  instagram: string;
  address: string;
  schedule: string;
}

export interface BankTransferConfig {
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  holderId: string;
  nequiPhone: string;
  daviplataPhone: string;
  llaveNumber: string;
  llaveType: string;
  instructions: string;
  isEnabled: boolean;
}

export interface TopBannerConfig {
  imageUrl: string;
  link: string;
  title?: string;
  isActive?: boolean;
}

export interface CollectionConfig {
  title: string;
  slug: string;
  imageUrl: string;
  description?: string;
  category?: string;
  searchQuery?: string;
  isActive?: boolean;
}

export interface StoreConfig {
  _id?: string;
  topBanners?: TopBannerConfig[];
  collections?: CollectionConfig[];
  announcementBar: AnnouncementBarConfig;
  hero: HeroConfig;
  brandStory: BrandStoryConfig;
  promoBanner: PromoBannerConfig;
  contact: ContactConfig;
  bankTransfer?: BankTransferConfig;
}

