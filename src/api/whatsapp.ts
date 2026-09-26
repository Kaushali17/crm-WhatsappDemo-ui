import { apiClient } from "./client";
import type {
  MediaUploadResponse,
  SendWhatsAppMessageRequest,
  WebhookIncomingMessageRequest,
  WhatsAppActionResponse,
} from "../types";

export const whatsappApi = {
  send: async (payload: SendWhatsAppMessageRequest): Promise<WhatsAppActionResponse> => {
    const { data } = await apiClient.post<WhatsAppActionResponse>("/api/whatsapp/send", payload);
    return data;
  },

  uploadMedia: async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<MediaUploadResponse>("/api/whatsapp/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  simulateWebhook: async (payload: WebhookIncomingMessageRequest): Promise<WhatsAppActionResponse> => {
    const { data } = await apiClient.post<WhatsAppActionResponse>("/api/whatsapp/webhook", payload);
    return data;
  },
};
