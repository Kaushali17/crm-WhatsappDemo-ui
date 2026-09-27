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
