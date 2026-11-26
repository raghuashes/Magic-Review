export type Role = 'BUSINESS_OWNER' | 'ADMIN';

export type LanguageStyle = 'ENGLISH' | 'TELUGU_ENGLISH_MIX' | 'HINGLISH';

export type ReviewTone = 'FRIENDLY' | 'PROFESSIONAL' | 'ENTHUSIASTIC' | 'SHORT';

export const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Cafe / Coffee Shop',
  'Bakery / Sweets',
  'Hotel / Resort',
  'Jewellery Store',
  'Clothing / Fashion Store',
  'Footwear Store',
  'Supermarket / Grocery Store',
  'Electronics Store',
  'Mobile / Computer Store',
  'Salon / Beauty Parlour',
  'Spa / Wellness Centre',
  'Gym / Fitness Centre',
  'Healthcare / Clinic',
  'Dental Clinic',
  'Education / Coaching Centre',
  'Automobile / Car Service',
  'Travel / Tourism',
  'Real Estate',
  'Home Decor / Furniture',
  'Photography / Events',
  'E-commerce / Online Store',
  'Professional Services',
  'Other / Custom Business',
] as const;

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number];

export type EventType =
  | 'PAGE_VIEW'
  | 'DRAFT_GENERATED'
  | 'GOOGLE_LINK_CLICKED'
  | 'WHATSAPP_CLICKED'
  | 'INSTAGRAM_CLICKED'
  | 'FACEBOOK_CLICKED'
  | 'WEBSITE_CLICKED';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  specialties?: string;
  targetCustomers?: string;
  logoUrl?: string;
  posterUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  googleReviewUrl: string;
  active: boolean;
  qrCodeUrl: string;
  publicUrl: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  businessEmail?: string;
  businessCategory?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRequest {
  name: string;
  slug?: string;
  description?: string;
  specialties?: string;
  targetCustomers?: string;
  logoUrl?: string;
  posterUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  googleReviewUrl: string;
  active?: boolean;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  businessEmail?: string;
  businessCategory?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  active?: boolean;
  displayOrder?: number;
}

export type AttributeSource = 'DEFAULT' | 'AI_SUGGESTED' | 'MERCHANT_CREATED';

export interface Attribute {
  id: string;
  storeId: string;
  label: string;
  active: boolean;
  displayOrder: number;
  source?: AttributeSource;
  createdAt: string;
  updatedAt?: string;
}

export interface AttributeRequest {
  label: string;
  active?: boolean;
  displayOrder?: number;
  source?: AttributeSource;
}

export interface SuggestAttributesResponse {
  category: string;
  storeName: string;
  suggestedAttributes: string[];
}

export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  description?: string;
  specialties?: string;
  targetCustomers?: string;
  logoUrl?: string;
  posterUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  googleReviewUrl: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  businessEmail?: string;
  businessCategory?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  categories: Category[];
  attributes: Attribute[];
}

export interface GenerateReviewRequest {
  category: string;
  attributes: string[];
  customerNote?: string;
  languageStyle: LanguageStyle;
  previousReviews?: string[];
  starRating?: number;
  tone?: ReviewTone;
}

export interface GenerateReviewResponse {
  reviewText: string;
  languageStyle: LanguageStyle;
  mode: 'ai' | 'demo';
  generatedAt: string;
}

export interface AnalyticsResponse {
  storeId: string;
  storeName: string;
  pageViews: number;
  draftsGenerated: number;
  googleClicks: number;
  whatsappClicks: number;
  instagramClicks: number;
  facebookClicks: number;
  websiteClicks: number;
  generationRate: number;
  clickThroughRate: number;
  filterRange?: string;
  campaignBreakdown?: Record<string, number>;
}

export interface AdminStats {
  totalMerchants: number;
  totalStores: number;
  totalPageViews: number;
  totalDraftsGenerated: number;
  totalGoogleClicks: number;
  overallConversionRate: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  storeCount: number;
  createdAt: string;
}

export interface AdminStore {
  id: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  slug: string;
  posterUrl?: string;
  googleReviewUrl: string;
  active: boolean;
  pageViews: number;
  draftsGenerated: number;
  googleClicks: number;
  createdAt: string;
}
