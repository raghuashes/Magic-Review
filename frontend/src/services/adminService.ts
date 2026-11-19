import api from './api';
import { AdminStats, AdminUser, AdminStore } from '../types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/api/admin/stats');
    return response.data;
  },

  async getUsers(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>('/api/admin/users');
    return response.data;
  },

  async getStores(): Promise<AdminStore[]> {
    const response = await api.get<AdminStore[]>('/api/admin/stores');
    return response.data;
  },

  async toggleStoreStatus(storeId: string): Promise<AdminStore> {
    const response = await api.put<AdminStore>(`/api/admin/stores/${storeId}/toggle-status`);
    return response.data;
  },

  async deleteStore(storeId: string): Promise<void> {
    await api.delete(`/api/admin/stores/${storeId}`);
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/api/admin/users/${userId}`);
  },
};
