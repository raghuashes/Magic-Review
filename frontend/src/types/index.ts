export type Role = 'BUSINESS_OWNER' | 'ADMIN';

export type LanguageStyle = 'ENGLISH' | 'TELUGU_ENGLISH_MIX' | 'HINGLISH';

export type EventType = 'PAGE_VIEW' | 'DRAFT_GENERATED' | 'GOOGLE_LINK_CLICKED';

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
  logoUrl?: string;
  posterUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  googleReviewUrl: string;
  active: boolean;
  qrCodeUrl: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRequest {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  posterUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  googleReviewUrl: string;
  active?: boolean;
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

export interface Attribute {
  id: string;
  storeId: string;
  label: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface AttributeRequest {
  label: string;
  active?: boolean;
  displayOrder?: number;
}

export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  posterUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  googleReviewUrl: string;
  categories: Category[];
  attributes: Attribute[];
}

export interface GenerateReviewRequest {
  category: string;
  attributes: string[];
  customerNote?: string;
  languageStyle: LanguageStyle;
  previousReviews?: string[];
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
  generationRate: number;
  clickThroughRate: number;
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
