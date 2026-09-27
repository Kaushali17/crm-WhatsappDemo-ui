import { useMemo, useState } from "react";
import type { ConversationDto } from "../../types";
import { ConversationListItem } from "./ConversationListItem";
import { Spinner } from "../common/Spinner";
import { EmptyState } from "../common/EmptyState";
import { Button } from "../common/Button";
import { SelectInput } from "../common/FormControls";
import { useSalesUsers } from "../../hooks/useSalesUsers";

type ConversationListProps = {
  conversations: ConversationDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedId: string | undefined;
  onSelect: (conversation: ConversationDto) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function ConversationList({
  conversations,
  isLoading,
  isError,
  selectedId,
  onSelect,
  onRefresh,
  isRefreshing,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  // Salesperson filter. No auth in this app yet, so the user picks which salesperson's
  // conversations to view. Reuses assignedUserId; no hard-coded salesperson IDs.
  const [salesUserFilter, setSalesUserFilter] = useState("");
  const { data: salesUsers } = useSalesUsers();

  const sorted = useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [conversations]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sorted.filter((c) => {
      if (salesUserFilter && c.assignedUserId !== salesUserFilter) return false;
      if (!term) return true;
      return [c.customerName, c.customerWhatsAppNumber, c.whatsAppDisplayPhoneNumber].some((value) =>
        value?.toLowerCase().includes(term)
      );
    });
  }, [sorted, search, salesUserFilter]);

  return (
    <div className="flex h-full w-full flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">Conversations</h2>
        <Button
          type="button"
          variant="ghost"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="!px-2 !py-1 text-xs"
          title="Refresh conversations"
        >
          {isRefreshing ? <Spinner size="sm" /> : "⟳"} Refresh
        </Button>
      </div>
      <div className="space-y-2 border-b border-gray-200 px-3 py-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or number..."
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-whatsapp-teal/40"
        />
        <SelectInput
          value={salesUserFilter}
          onChange={(e) => setSalesUserFilter(e.target.value)}
          className="!py-1.5 text-sm"
          aria-label="Filter by salesperson"
        >
          <option value="">All salespeople</option>
          {salesUsers?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        )}
        {isError && !isLoading && (
          <EmptyState title="Failed to load conversations" description="Try refreshing the list." />
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            title="No conversations found"
            description={search ? "Try a different search term." : "Incoming messages will appear here."}
          />
        )}
        {!isLoading &&
          !isError &&
          filtered.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              selected={conversation.id === selectedId}
              onClick={() => onSelect(conversation)}
            />
          ))}
      </div>
    </div>
  );
}
