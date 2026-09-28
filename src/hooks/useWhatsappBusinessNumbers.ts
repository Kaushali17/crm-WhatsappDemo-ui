import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { whatsappBusinessNumbersApi } from "../api/whatsappBusinessNumbers";
import { queryKeys } from "./queryKeys";
import type {
  CreateWhatsAppBusinessNumberRequest,
  UpdateWhatsAppBusinessNumberRequest,
} from "../types";

export function useWhatsAppBusinessNumbers() {
  return useQuery({
    queryKey: queryKeys.whatsAppBusinessNumbers,
    queryFn: whatsappBusinessNumbersApi.getAll,
  });
}

// Active/assignable WhatsApp Business numbers from GET /api/whatsapp/numbers. React Query
// dedupes concurrent calls sharing this key, so mounting the selector never double-fetches.
export function useWhatsAppNumbers() {
  return useQuery({
    queryKey: queryKeys.whatsAppNumbers,
    queryFn: whatsappBusinessNumbersApi.getWhatsAppNumbers,
  });
}

export function useCreateWhatsAppBusinessNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWhatsAppBusinessNumberRequest) =>
      whatsappBusinessNumbersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsAppBusinessNumbers });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesUsers });
    },
  });
}

export function useUpdateWhatsAppBusinessNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWhatsAppBusinessNumberRequest }) =>
      whatsappBusinessNumbersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsAppBusinessNumbers });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesUsers });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}
