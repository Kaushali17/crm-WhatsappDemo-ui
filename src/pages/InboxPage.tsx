import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MessageThread } from "../components/inbox/MessageThread";
import { Composer } from "../components/inbox/Composer";
import { NewConversationModal } from "../components/inbox/NewConversationModal";
import { EmptyState } from "../components/common/EmptyState";
import { useConversation, useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useCurrentUser } from "../auth/currentUser";
import { queryKeys } from "../hooks/queryKeys";

export function InboxPage() {
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get("conversationId") ?? undefined;
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const queryClient = useQueryClient();

  // A salesperson is scoped to their own id; an Admin sees all (undefined scope).
  const { conversationScopeUserId } = useCurrentUser();
  const conversationsQuery = useConversations(conversationScopeUserId);
  // Preselect a conversation passed via ?conversationId (e.g. after sending a template),
  // then fall back to the newest conversation so a chat is always open.
  const effectiveSelectedId = selectedId ?? conversationIdParam ?? conversationsQuery.data?.[0]?.id;
  const selectedConversationQuery = useConversation(effectiveSelectedId);
  const messagesQuery = useMessages(effectiveSelectedId);

  // After a template starts a conversation, select/open it and refresh the list.
  const handleConversationCreated = (conversationId: string | undefined) => {
    setNewConversationOpen(false);
    if (conversationId) {
      setSelectedId(conversationId);
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    }
  };

  const conversation = selectedConversationQuery.data;

  return (
    <div className="flex h-full w-full">
      {!effectiveSelectedId || !conversation ? (
        <div className="flex flex-1 items-center justify-center bg-whatsapp-panel">
          <EmptyState
            title="No conversation to show"
            description="There is no open conversation yet."
          />
        </div>
      ) : (
        <div className="flex min-w-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col bg-whatsapp-panel">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {conversation.customerName || conversation.customerWhatsAppNumber}
                </h2>
                <p className="text-xs text-gray-500">{conversation.customerWhatsAppNumber}</p>
              </div>
            </div>
            <MessageThread
              messages={messagesQuery.data}
              isLoading={messagesQuery.isLoading}
              isError={messagesQuery.isError}
            />
            <Composer
              key={conversation.id}
              conversationId={conversation.id}
              phoneNumber={conversation.customerWhatsAppNumber}
              whatsAppBusinessNumberId={conversation.whatsAppBusinessNumberId}
              disabled={conversation.status.toLowerCase() === "closed"}
            />
          </div>
        </div>
      )}

      {newConversationOpen && (
        <NewConversationModal
          open={newConversationOpen}
          onClose={() => setNewConversationOpen(false)}
          onCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
