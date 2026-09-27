import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ConversationList } from "../components/inbox/ConversationList";
import { MessageThread } from "../components/inbox/MessageThread";
import { Composer } from "../components/inbox/Composer";
import { ConversationDetailsPanel } from "../components/inbox/ConversationDetailsPanel";
import { EmptyState } from "../components/common/EmptyState";
import { useConversation, useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { queryKeys } from "../hooks/queryKeys";
import type { ConversationDto } from "../types";

export function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const conversationsQuery = useConversations();
  // Fall back to the newest conversation until the user picks one explicitly.
  const effectiveSelectedId = selectedId ?? conversationsQuery.data?.[0]?.id;
  const selectedConversationQuery = useConversation(effectiveSelectedId);
  const messagesQuery = useMessages(effectiveSelectedId);

  const handleSelect = (conversation: ConversationDto) => {
    setSelectedId(conversation.id);
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    if (effectiveSelectedId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(effectiveSelectedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(effectiveSelectedId) });
    }
  };

  const conversation = selectedConversationQuery.data;

  return (
    <div className="flex h-full w-full">
      <div className="w-80 shrink-0">
        <ConversationList
          conversations={conversationsQuery.data}
          isLoading={conversationsQuery.isLoading}
          isError={conversationsQuery.isError}
          selectedId={effectiveSelectedId}
          onSelect={handleSelect}
          onRefresh={handleRefreshAll}
          isRefreshing={conversationsQuery.isFetching}
        />
      </div>

      {!effectiveSelectedId || !conversation ? (
        <div className="flex flex-1 items-center justify-center bg-whatsapp-panel">
          <EmptyState
            title="Select a conversation"
            description="Choose a conversation from the list to view the message thread."
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
                {(conversation.assignedUserName || conversation.whatsAppDisplayPhoneNumber) && (
                  <p className="mt-1 text-xs text-gray-500">
                    {conversation.assignedUserName && (
                      <span>
                        Handled by: <span className="font-medium text-gray-700">{conversation.assignedUserName}</span>
                      </span>
                    )}
                    {conversation.assignedUserName && conversation.whatsAppDisplayPhoneNumber && (
                      <span className="mx-1 text-gray-300">·</span>
                    )}
                    {conversation.whatsAppDisplayPhoneNumber && (
                      <span>
                        WhatsApp:{" "}
                        <span className="font-medium text-gray-700">{conversation.whatsAppDisplayPhoneNumber}</span>
                      </span>
                    )}
                  </p>
                )}
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
              disabled={conversation.status.toLowerCase() === "closed"}
            />
          </div>
          <ConversationDetailsPanel conversation={conversation} />
        </div>
      )}
    </div>
  );
}
