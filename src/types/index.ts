// DTO types mirroring the .NET Web API contract exactly. Keep in sync with the backend.

// Authorization role returned by the backend. The backend is the source of truth; the frontend
// never derives Admin status from a hard-coded salesperson id.
export type SalesUserRole = "Admin" | "Salesperson" | string;

export type SalesUserDto = {
  id: string;
  name: string;
  email: string;
  // Role drives Admin vs Salesperson UI. Optional so older backend responses keep working.
  role?: SalesUserRole;
  // Optional business-number info, only present if the backend chooses to include it.
  whatsAppBusinessNumberId?: string;
  whatsAppDisplayPhoneNumber?: string;
  whatsAppBusinessNumberActive?: boolean;
};

// A WhatsApp Business number owned by a salesperson. The frontend never receives
// Meta secrets (access token, app secret, client/webhook secret). phoneNumberId is a
// non-secret identifier exposed read-only by the backend and is never sent on message send.
export type WhatsAppBusinessNumberDto = {
  id: string;
  salesUserId?: string;
  salesUserName?: string;
  displayPhoneNumber: string;
  phoneNumberId?: string;
  isActive: boolean;
};

// Response of GET /api/whatsapp/numbers — the WhatsApp Business numbers available to the CRM.
// The frontend never receives Meta secrets; phoneNumberId is a non-secret identifier only.
export type WhatsAppBusinessNumber = {
  id: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  assignedUserId: string | null;
  isActive: boolean;
};

export type CustomerDto = {
  id: string;
  name: string;
  whatsAppNumber: string;
  assignedUserId?: string;
  assignedUserName?: string;
  createdAt: string;
};

export type ConversationStatus = "Open" | "Closed" | string;

export type ConversationDto = {
  id: string;
  customerId: string;
  customerName?: string;
  customerWhatsAppNumber?: string;
  // Salesperson handling the conversation (existing fields).
  assignedUserId?: string;
  assignedUserName?: string;
  // The business identity the conversation is tied to (new multi-number support).
  whatsAppBusinessNumberId?: string;
  whatsAppDisplayPhoneNumber?: string;
  status: ConversationStatus;
  createdAt: string;
  lastMessageAt: string;
  // Optional list-preview fields, only present if the backend returns them.
  lastMessage?: string;
  unreadCount?: number;
};

export type MessageDirection = "Incoming" | "Outgoing";
export type MessageType = "Text" | "Image" | "Document";

export type ChatMessageDto = {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  messageType: MessageType;
  messageText?: string;
  mediaUrl?: string;
  whatsAppMessageId?: string;
  createdAt: string;
};

export type CreateSalesUserRequest = {
  name: string;
  email: string;
};

export type CreateCustomerRequest = {
  name: string;
  whatsAppNumber: string;
  assignedUserId?: string;
};

export type UpdateCustomerRequest = CreateCustomerRequest;

export type SendWhatsAppMessageRequest = {
  // Backend prefers conversationId to resolve the sender's business number; phoneNumber is
  // kept for backward compatibility. The frontend never chooses the Meta PhoneNumberId.
  conversationId?: string;
  // The conversation's WhatsApp Business number. Sent so a message always goes through the
  // owning salesperson's number — e.g. an Admin replying in another salesperson's conversation
  // uses that conversation's number, never the Admin's. The frontend never sends Meta secrets.
  whatsAppBusinessNumberId?: string;
  phoneNumber: string;
  message?: string;
  messageType: MessageType;
  mediaUrl?: string;
};

export type CreateWhatsAppBusinessNumberRequest = {
  salesUserId: string;
  displayPhoneNumber: string;
  phoneNumberId?: string;
  isActive: boolean;
};

export type UpdateWhatsAppBusinessNumberRequest = CreateWhatsAppBusinessNumberRequest;

export type WebhookIncomingMessageRequest = {
  phoneNumber: string;
  message?: string;
  messageType: MessageType;
  mediaUrl?: string;
  whatsappMessageId?: string;
  customerName?: string;
};

export type WhatsAppActionResponse = {
  success: boolean;
  message: string;
  conversation?: ConversationDto;
  chatMessage?: ChatMessageDto;
};

export type MediaUploadResponse = {
  mediaUrl: string;
  messageType: MessageType;
  fileName: string;
  contentType: string;
};

// ---- Business-initiated conversations via approved WhatsApp message templates ----

// One resolved parameter value sent to the backend (Meta expects typed params; text-only here).
export type TemplateParameter = {
  type: "text";
  text: string;
};

// A component of an approved template exactly as returned by GET /api/whatsapp/templates
// (Meta-style: uppercase `type`, and {{n}} placeholders live inside `text`).
export type WhatsAppTemplateComponent = {
  type: string;
  text?: string;
  format?: string;
};

export type WhatsAppTemplateStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED"
  | string;

// A WhatsApp message template as returned by the backend. The backend is the ONLY source of
// templates; the frontend never hard-codes names/languages and never talks to Meta directly.
export type WhatsAppTemplateDto = {
  name: string;
  languageCode: string;
  status: WhatsAppTemplateStatus;
  category?: string;
  components: WhatsAppTemplateComponent[];
};

// Exact request contract for POST /api/whatsapp/send-template-to-customer. The frontend sends the
// customer id (not a raw Meta phone number) plus the chosen template and resolved parameters; the
// backend resolves the business number and calls Meta. No Meta secrets are ever sent from here.
export type SendTemplateRequest = {
  customerId: string;
  conversationId?: string | null;
  whatsAppBusinessNumberId?: string | null;
  // The chosen salesperson; the backend maps this to their WhatsApp Business number and decides
  // which Meta PhoneNumberId to send from. The frontend never chooses the PhoneNumberId.
  salesUserId?: string | null;
  templateName: string;
  languageCode: string;
  parameters: TemplateParameter[];
};

// Response mirrors the shared WhatsApp action response (success + created conversation/message).
export type SendTemplateResponse = WhatsAppActionResponse;

