import toast from "react-hot-toast";
import { useAssignConversation, useCloseConversation } from "../../hooks/useConversations";
import { useSalesUsers } from "../../hooks/useSalesUsers";
import { getApiErrorMessage } from "../../api/client";
import { StatusBadge } from "../common/StatusBadge";
import { Button } from "../common/Button";
import { SelectInput } from "../common/FormControls";
import { Spinner } from "../common/Spinner";
import { formatDate } from "../../utils/date";
import type { ConversationDto } from "../../types";

type ConversationDetailsPanelProps = {
  conversation: ConversationDto;
};

export function ConversationDetailsPanel({ conversation }: ConversationDetailsPanelProps) {
  const { data: salesUsers, isLoading: loadingSalesUsers } = useSalesUsers();
  const assignConversation = useAssignConversation();
  const closeConversation = useCloseConversation();

  const isClosed = conversation.status.toLowerCase() === "closed";

  const handleAssign = (salesUserId: string) => {
    if (!salesUserId) return;
    assignConversation.mutate(
      { conversationId: conversation.id, salesUserId },
      {
        onSuccess: () => toast.success("Conversation assigned"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleClose = () => {
    closeConversation.mutate(conversation.id, {
      onSuccess: () => toast.success("Conversation closed"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <div className="flex h-full w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white px-4 py-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Customer</h3>
        <p className="mt-1 text-base font-medium text-gray-900">
          {conversation.customerName || "Unknown customer"}
        </p>
        <p className="text-sm text-gray-500">{conversation.customerWhatsAppNumber}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          WhatsApp Business Number
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          {conversation.whatsAppDisplayPhoneNumber || "Not linked to a business number"}
        </p>
        {conversation.assignedUserName && (
          <p className="text-xs text-gray-500">Handled by {conversation.assignedUserName}</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Status</h3>
        <div className="mt-1">
          <StatusBadge status={conversation.status} />
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-400">Assigned to</h3>
        {loadingSalesUsers ? (
          <Spinner size="sm" />
        ) : (
          <SelectInput
            value={conversation.assignedUserId ?? ""}
            onChange={(e) => handleAssign(e.target.value)}
            disabled={assignConversation.isPending}
          >
            <option value="" disabled>
              Select sales user
            </option>
            {salesUsers?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </SelectInput>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Conversation started</h3>
        <p className="mt-1 text-sm text-gray-700">{formatDate(conversation.createdAt)}</p>
      </div>

      <div className="mt-auto pt-2">
        <Button
          type="button"
          variant="danger"
          className="w-full"
          onClick={handleClose}
          disabled={isClosed || closeConversation.isPending}
        >
          {isClosed ? "Conversation closed" : closeConversation.isPending ? "Closing..." : "Close conversation"}
        </Button>
      </div>
    </div>
  );
}
