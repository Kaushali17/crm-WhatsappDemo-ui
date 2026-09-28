import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { whatsappApi } from "../api/whatsapp";
import { queryKeys } from "./queryKeys";
import type {
  SendTemplateRequest,
  SendWhatsAppMessageRequest,
  WebhookIncomingMessageRequest,
  WhatsAppTemplateDto,
} from "../types";

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendWhatsAppMessageRequest) => whatsappApi.send(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      if (data.conversation?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages(data.conversation.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversation(data.conversation.id) });
      }
    },
  });
}

// Approved templates come exclusively from the backend (GET /api/whatsapp/templates); the
// frontend never hard-codes template data. Filtering to APPROVED happens where they're consumed.
export function useWhatsAppTemplates() {
  return useQuery<WhatsAppTemplateDto[]>({
    queryKey: queryKeys.whatsAppTemplates,
    queryFn: whatsappApi.getTemplates,
  });
}

// Starts a new business-initiated conversation via an approved template. Invalidates the same
// caches as a normal send so the new conversation and its outgoing message appear immediately.
export function useSendTemplateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendTemplateRequest) => whatsappApi.sendTemplate(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      if (data.conversation?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages(data.conversation.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversation(data.conversation.id) });
      }
    },
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: (file: File) => whatsappApi.uploadMedia(file),
  });
}

export function useSimulateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WebhookIncomingMessageRequest) => whatsappApi.simulateWebhook(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      if (data.conversation?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages(data.conversation.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.conversation(data.conversation.id) });
      }
    },
  });
}
