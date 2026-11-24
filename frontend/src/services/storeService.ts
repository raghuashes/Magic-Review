import api from './api';
import {
  Store,
  StoreRequest,
  Category,
  CategoryRequest,
  Attribute,
  AttributeRequest,
  AnalyticsResponse,
} from '../types';

export const storeService = {
  // Stores
  async listStores(): Promise<Store[]> {
    const response = await api.get<Store[]>('/api/stores');
    return response.data;
  },

  async getStore(id: string): Promise<Store> {
    const response = await api.get<Store>(`/api/stores/${id}`);
    return response.data;
  },

  async createStore(data: StoreRequest): Promise<Store> {
    const response = await api.post<Store>('/api/stores', data);
    return response.data;
  },

  async updateStore(id: string, data: StoreRequest): Promise<Store> {
    const response = await api.put<Store>(`/api/stores/${id}`, data);
    return response.data;
  },

  async deleteStore(id: string): Promise<void> {
    await api.delete(`/api/stores/${id}`);
  },

  async getStoreQrBase64(id: string, size = 350): Promise<{ storeId: string; targetUrl: string; qrCodeDataUri: string }> {
    const response = await api.get(`/api/stores/${id}/qr`, {
      params: { size, format: 'base64' },
    });
    return response.data;
  },

  // Categories
  async listCategories(storeId: string): Promise<Category[]> {
    const response = await api.get<Category[]>(`/api/stores/${storeId}/categories`);
    return response.data;
  },

  async createCategory(storeId: string, data: CategoryRequest): Promise<Category> {
    const response = await api.post<Category>(`/api/stores/${storeId}/categories`, data);
    return response.data;
  },

  async updateCategory(storeId: string, categoryId: string, data: CategoryRequest): Promise<Category> {
    const response = await api.put<Category>(`/api/stores/${storeId}/categories/${categoryId}`, data);
    return response.data;
  },

  async deleteCategory(storeId: string, categoryId: string): Promise<void> {
    await api.delete(`/api/stores/${storeId}/categories/${categoryId}`);
  },

  // Attributes
  async listAttributes(storeId: string): Promise<Attribute[]> {
    const response = await api.get<Attribute[]>(`/api/stores/${storeId}/attributes`);
    return response.data;
  },

  async createAttribute(storeId: string, data: AttributeRequest): Promise<Attribute> {
    const response = await api.post<Attribute>(`/api/stores/${storeId}/attributes`, data);
    return response.data;
  },

  async updateAttribute(storeId: string, attributeId: string, data: AttributeRequest): Promise<Attribute> {
    const response = await api.put<Attribute>(`/api/stores/${storeId}/attributes/${attributeId}`, data);
    return response.data;
  },

  async deleteAttribute(storeId: string, attributeId: string): Promise<void> {
    await api.delete(`/api/stores/${storeId}/attributes/${attributeId}`);
  },

  // Analytics
  async getStoreAnalytics(storeId: string, range = 'all', from?: string, to?: string): Promise<AnalyticsResponse> {
    const response = await api.get<AnalyticsResponse>(`/api/stores/${storeId}/analytics`, {
      params: { range, from, to }
    });
    return response.data;
  },
};
