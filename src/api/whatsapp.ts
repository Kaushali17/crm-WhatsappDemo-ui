import { apiClient } from "./client";
import type {
  MediaUploadResponse,
  SendTemplateRequest,
  SendTemplateResponse,
  SendWhatsAppMessageRequest,
  WebhookIncomingMessageRequest,
  WhatsAppActionResponse,
  WhatsAppTemplateDto,
} from "../types";

export const whatsappApi = {
  send: async (payload: SendWhatsAppMessageRequest): Promise<WhatsAppActionResponse> => {
    const { data } = await apiClient.post<WhatsAppActionResponse>("/api/whatsapp/send", payload);
    return data;
  },

  // Starts a business-initiated conversation using an approved WhatsApp template. React never
  // calls Meta directly — only our .NET backend, which holds the Meta credentials.
  sendTemplate: async (payload: SendTemplateRequest): Promise<SendTemplateResponse> => {
    const { data } = await apiClient.post<SendTemplateResponse>(
      "/api/whatsapp/send-template-to-customer",
      payload
    );
    return data;
  },

  // The ONLY source of WhatsApp templates. Returns real templates from the backend (name,
  // languageCode, status, category, components); the frontend filters to APPROVED and never
  // hard-codes template data or Meta secrets.
  getTemplates: async (): Promise<WhatsAppTemplateDto[]> => {
    const { data } = await apiClient.get<WhatsAppTemplateDto[]>("/api/whatsapp/templates");
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
