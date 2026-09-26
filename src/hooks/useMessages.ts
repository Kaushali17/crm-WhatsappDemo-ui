import { useQuery } from "@tanstack/react-query";
import { conversationsApi } from "../api/conversations";
import { queryKeys } from "./queryKeys";
import { POLL_INTERVAL_MS } from "./useConversations";

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId ?? ""),
    queryFn: () => conversationsApi.getMessages(conversationId as string),
    enabled: Boolean(conversationId),
    refetchInterval: POLL_INTERVAL_MS,
  });
}
