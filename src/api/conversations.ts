import { apiClient } from "./client";
import type { ChatMessageDto, ConversationDto } from "../types";

export const conversationsApi = {
  getAll: async (salesUserId?: string): Promise<ConversationDto[]> => {
    // Admin passes no salesUserId (all conversations); a salesperson (or an Admin filtering by
    // salesperson) passes an id. The backend authorizes and returns the appropriate set.
    const { data } = await apiClient.get<ConversationDto[]>("/api/conversations", {
      params: salesUserId ? { salesUserId } : undefined,
    });
    return data;
  },

  getById: async (id: string): Promise<ConversationDto> => {
    const { data } = await apiClient.get<ConversationDto>(`/api/conversations/${id}`);
    return data;
  },

  getByCustomerId: async (customerId: string): Promise<ConversationDto[]> => {
    const { data } = await apiClient.get<ConversationDto[]>(`/api/conversations/customer/${customerId}`);
    return data;
  },

  assign: async (conversationId: string, salesUserId: string): Promise<ConversationDto> => {
    const { data } = await apiClient.put<ConversationDto>(
      `/api/conversations/${conversationId}/assign/${salesUserId}`
    );
    return data;
  },

  close: async (conversationId: string): Promise<ConversationDto> => {
    const { data } = await apiClient.put<ConversationDto>(`/api/conversations/${conversationId}/close`);
    return data;
  },

  getMessages: async (conversationId: string): Promise<ChatMessageDto[]> => {
    const { data } = await apiClient.get<ChatMessageDto[]>(`/api/conversations/${conversationId}/messages`);
    return data;
  },
};
