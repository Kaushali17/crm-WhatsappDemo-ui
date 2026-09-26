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
          {conversation.assignedUserName ? `Assigned: ${conversation.assignedUserName}` : "Unassigned"}
        </span>
        <StatusBadge status={conversation.status} />
      </div>
    </button>
  );
}
