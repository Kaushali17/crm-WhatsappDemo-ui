import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useSendWhatsAppMessage, useUploadMedia } from "../../hooks/useWhatsapp";
import { getApiErrorMessage, resolveMediaUrl } from "../../api/client";
import { Button } from "../common/Button";
import { TextInput } from "../common/FormControls";
import type { MediaUploadResponse } from "../../types";

type ComposerProps = {
  conversationId: string;
  phoneNumber: string | undefined;
  disabled?: boolean;
};

// Keyed by conversation.id in the parent, so this remounts (and its state resets) per conversation.
export function Composer({ conversationId, phoneNumber, disabled }: ComposerProps) {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<MediaUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useSendWhatsAppMessage();
  const uploadMedia = useUploadMedia();

  if (disabled) {
    return (
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
        This conversation is closed. Reopen it by assigning a sales user to continue messaging.
      </div>
    );
  }

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setMessage("");
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!phoneNumber) {
      toast.error("This conversation has no customer WhatsApp number.");
      return;
    }
    if (!attachment && !message.trim()) {
      toast.error("Type a message or attach a file.");
      return;
    }

    sendMessage.mutate(
      {
        // Backend resolves the sender's business number from the conversation; phoneNumber
        // is sent for backward compatibility. The frontend never picks the Meta PhoneNumberId.
        conversationId,
        phoneNumber,
        messageType: attachment ? attachment.messageType : "Text",
        mediaUrl: attachment?.mediaUrl,
        message: message.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Message sent");
            resetForm();
          } else {
            toast.error(data.message || "Failed to send message.");
          }
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  };

  const isSending = sendMessage.isPending;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <form onSubmit={handleSubmit} className="space-y-2">
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
              onClick={resetForm}
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
            disabled={uploadMedia.isPending}
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
          <Button type="submit" disabled={isSending || uploadMedia.isPending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
