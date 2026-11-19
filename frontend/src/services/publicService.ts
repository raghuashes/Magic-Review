import api from './api';
import {
  PublicStore,
  GenerateReviewRequest,
  GenerateReviewResponse,
  EventType,
} from '../types';

export const publicService = {
  async getPublicStore(slug: string): Promise<PublicStore> {
    const response = await api.get<PublicStore>(`/api/public/stores/${slug}`);
    return response.data;
  },

  async generateReview(slug: string, data: GenerateReviewRequest): Promise<GenerateReviewResponse> {
    const response = await api.post<GenerateReviewResponse>(`/api/public/stores/${slug}/generate-review`, data);
    return response.data;
  },

  async recordEvent(slug: string, eventType: EventType): Promise<void> {
    try {
      await api.post(`/api/public/stores/${slug}/events`, { eventType });
    } catch (err) {
      // Analytics recording should fail silently so customer flow is never blocked
      console.warn('Analytics event record failed', err);
    }
  },
};
