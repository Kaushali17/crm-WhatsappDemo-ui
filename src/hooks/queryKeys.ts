/** Centralized React Query cache keys to keep invalidation consistent across hooks. */
export const queryKeys = {
  salesUsers: ["salesUsers"] as const,
  whatsAppBusinessNumbers: ["whatsAppBusinessNumbers"] as const,
  customers: ["customers"] as const,
  customer: (id: string) => ["customers", id] as const,
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversations", id] as const,
  conversationsByCustomer: (customerId: string) => ["conversations", "customer", customerId] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
};
