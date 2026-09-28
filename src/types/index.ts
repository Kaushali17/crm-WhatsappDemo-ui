// DTO types mirroring the .NET Web API contract exactly. Keep in sync with the backend.

export type SalesUserDto = {
  id: string;
  name: string;
  email: string;
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
  templateName: string;
  languageCode: string;
  parameters: TemplateParameter[];
};

// Response mirrors the shared WhatsApp action response (success + created conversation/message).
export type SendTemplateResponse = WhatsAppActionResponse;

