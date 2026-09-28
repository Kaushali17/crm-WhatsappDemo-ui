import { apiClient } from "./client";
import type {
  CreateWhatsAppBusinessNumberRequest,
  UpdateWhatsAppBusinessNumberRequest,
  WhatsAppBusinessNumber,
  WhatsAppBusinessNumberDto,
} from "../types";

const BASE = "/api/whatsapp-business-numbers";

export const whatsappBusinessNumbersApi = {
  getAll: async (): Promise<WhatsAppBusinessNumberDto[]> => {
    const { data } = await apiClient.get<WhatsAppBusinessNumberDto[]>(BASE);
    return data;
  },

  // GET /api/whatsapp/numbers — the numbers the CRM can use (supports multiple later).
  getWhatsAppNumbers: async (): Promise<WhatsAppBusinessNumber[]> => {
    const { data } = await apiClient.get<WhatsAppBusinessNumber[]>("/api/whatsapp/numbers");
    return data;
  },

  create: async (payload: CreateWhatsAppBusinessNumberRequest): Promise<WhatsAppBusinessNumberDto> => {
    const { data } = await apiClient.post<WhatsAppBusinessNumberDto>(BASE, payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateWhatsAppBusinessNumberRequest
  ): Promise<WhatsAppBusinessNumberDto> => {
    const { data } = await apiClient.put<WhatsAppBusinessNumberDto>(`${BASE}/${id}`, payload);
    return data;
  },
};
