import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationsApi } from "../api/conversations";
import { queryKeys } from "./queryKeys";

/** Polling interval for manual "real-time" refresh since the backend has no SignalR yet. */
export const POLL_INTERVAL_MS = 5000;

export function useConversations(salesUserId?: string) {
  return useQuery({
    queryKey: queryKeys.conversationsList(salesUserId),
    queryFn: () => conversationsApi.getAll(salesUserId),
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.conversation(id ?? ""),
    queryFn: () => conversationsApi.getById(id as string),
    enabled: Boolean(id),
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useAssignConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, salesUserId }: { conversationId: string; salesUserId: string }) =>
      conversationsApi.assign(conversationId, salesUserId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(variables.conversationId) });
    },
  });
}

export function useCloseConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationsApi.close(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(conversationId) });
    },
  });
}
