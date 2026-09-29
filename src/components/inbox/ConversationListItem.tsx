import { formatDateTime } from "../../utils/date";
import { StatusBadge } from "../common/StatusBadge";
import type { ConversationDto } from "../../types";

type ConversationListItemProps = {
  conversation: ConversationDto;
  selected: boolean;
  onClick: () => void;
};

export function ConversationListItem({ conversation, selected, onClick }: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-1 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
        selected ? "bg-whatsapp-panel" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium text-gray-900">
          {conversation.customerName || conversation.customerWhatsAppNumber || "Unknown customer"}
        </span>
        <span className="shrink-0 text-xs text-gray-400">{formatDateTime(conversation.lastMessageAt)}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-gray-500">
          {conversation.assignedUserName ? `Sales: ${conversation.assignedUserName}` : "Unassigned"}
        </span>
        <div className="flex items-center gap-1.5">
          {typeof conversation.unreadCount === "number" && conversation.unreadCount > 0 && (
            <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-whatsapp-teal px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {conversation.unreadCount}
            </span>
          )}
          <StatusBadge status={conversation.status} />
        </div>
      </div>
      {conversation.lastMessage && (
        <span className="truncate text-xs text-gray-500">{conversation.lastMessage}</span>
      )}
      {conversation.whatsAppDisplayPhoneNumber && (
        <span className="truncate text-xs text-gray-400">
          WhatsApp: {conversation.whatsAppDisplayPhoneNumber}
        </span>
      )}
    </button>
  );
}
