import { useRef, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { TextInput } from "../common/FormControls";
import { useSendWhatsAppMessage, useUploadMedia } from "../../hooks/useWhatsapp";
import { getApiErrorMessage, resolveMediaUrl } from "../../api/client";
import type { CustomerDto, MediaUploadResponse } from "../../types";

type SendMessageModalProps = {
  open: boolean;
  customer: CustomerDto;
  onClose: () => void;
  // Called after a successful send; receives the conversation id (created/updated by the
  // backend) so the caller can open the conversation in the inbox.
  onSent: (conversationId: string | undefined) => void;
};

// The parent only mounts this while `open` is true, so state resets naturally per open.
// Reuses the same send/upload flow as the inbox Composer (no second messaging system).
export function SendMessageModal({ open, customer, onClose, onSent }: SendMessageModalProps) {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<MediaUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useSendWhatsAppMessage();
  const uploadMedia = useUploadMedia();

  const hasWhatsAppNumber = Boolean(customer.whatsAppNumber?.trim());

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    setAttachment(null);
    clearFileInput();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMedia.mutate(file, {
      onSuccess: (data) => setAttachment(data),
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
        clearFileInput();
      },
    });
  };

  const handleSend = () => {
    if (!hasWhatsAppNumber) {
      toast.error("Customer does not have a WhatsApp number.");
      return;
    }
    if (!attachment && !message.trim()) {
      toast.error("Type a message or attach a file.");
      return;
    }

    sendMessage.mutate(
      {
        // No conversationId yet — the backend creates/updates the conversation for this
        // customer's WhatsApp number. The frontend never picks the Meta PhoneNumberId.
        phoneNumber: customer.whatsAppNumber,
        messageType: attachment ? attachment.messageType : "Text",
        mediaUrl: attachment?.mediaUrl,
        message: message.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          if (data.success === false) {
            toast.error(data.message || "Unable to send WhatsApp message.");
            return;
          }
          toast.success("Message sent");
          onSent(data.conversation?.id);
        },
        // Keep the entered data on error; the button re-enables automatically.
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const isSending = sendMessage.isPending;

  return (
    <Modal open={open} title="Send WhatsApp Message" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <p className="font-medium text-gray-900">{customer.name}</p>
          <p className="text-gray-600">
            WhatsApp:{" "}
            {customer.whatsAppNumber ? (
              customer.whatsAppNumber
            ) : (
              <span className="text-red-500">Not set</span>
            )}
          </p>
        </div>

        {!hasWhatsAppNumber && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            This customer has no WhatsApp number. Add one before sending a message.
          </p>
        )}

        {attachment && (
          <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            {attachment.messageType === "Image" ? (
              <img
                src={resolveMediaUrl(attachment.mediaUrl)}
                alt={attachment.fileName}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <span aria-hidden="true" className="text-2xl">
                📄
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{attachment.fileName}</p>
              <p className="text-xs text-gray-500">{attachment.messageType}</p>
            </div>
            <button
              type="button"
              onClick={removeAttachment}
              className="shrink-0 text-gray-400 hover:text-red-500"
              aria-label="Remove attachment"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMedia.isPending || !hasWhatsAppNumber}
            className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-lg leading-none text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            aria-label="Attach image or document"
            title="Attach image or document"
          >
            {uploadMedia.isPending ? "…" : "📎"}
          </button>
          <TextInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={attachment ? "Add a caption (optional)" : "Type a message"}
            className="min-w-0 flex-1"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || uploadMedia.isPending || !hasWhatsAppNumber}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
