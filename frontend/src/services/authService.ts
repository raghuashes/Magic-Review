import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(
    email: string,
    password: string,
    businessName?: string,
    posterUrl?: string,
    googleReviewUrl?: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      email,
      password,
      businessName,
      posterUrl,
      googleReviewUrl,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
};
