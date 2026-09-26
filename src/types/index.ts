// DTO types mirroring the .NET Web API contract exactly. Keep in sync with the backend.

export type SalesUserDto = {
  id: string;
  name: string;
  email: string;
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
  assignedUserId?: string;
  assignedUserName?: string;
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
  phoneNumber: string;
  message?: string;
  messageType: MessageType;
  mediaUrl?: string;
};

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

