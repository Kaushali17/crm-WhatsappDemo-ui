import { useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappApi } from "../api/whatsapp";
import { queryKeys } from "./queryKeys";
import type { SendWhatsAppMessageRequest, WebhookIncomingMessageRequest } from "../types";

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
