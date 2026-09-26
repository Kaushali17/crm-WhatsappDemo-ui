import { formatTime } from "../../utils/date";
import { getMediaDownloadUrl, resolveMediaUrl } from "../../api/client";
import type { ChatMessageDto } from "../../types";

type MessageBubbleProps = {
  message: ChatMessageDto;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === "Outgoing";

  return (
    <div className={`flex w-full ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[65%] rounded-lg px-3 py-2 shadow-sm ${
          isOutgoing ? "bg-whatsapp-bubbleOut" : "bg-whatsapp-bubbleIn"
        }`}
      >
        <MessageContent message={message} />
        <div className="mt-1 text-right text-[11px] text-gray-400">{formatTime(message.createdAt)}</div>
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: ChatMessageDto }) {
  if (message.messageType === "Image" && message.mediaUrl) {
    const src = resolveMediaUrl(message.mediaUrl);
    return (
      <div className="space-y-1">
        <a href={src} target="_blank" rel="noopener noreferrer">
          <img
            src={src}
            alt={message.messageText || "Image message"}
            className="max-h-64 w-full rounded-md object-cover"
          />
        </a>
        {message.messageText && <p className="text-sm text-gray-800">{message.messageText}</p>}
      </div>
    );
  }

  if (message.messageType === "Document" && message.mediaUrl) {
    return (
      <a
        href={getMediaDownloadUrl(message.mediaUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50"
      >
        <span aria-hidden="true" className="text-xl">
          📄
        </span>
        <span className="truncate text-sm font-medium text-whatsapp-teal">
          {message.messageText || "Download document"}
        </span>
      </a>
    );
  }

  return <p className="whitespace-pre-wrap break-words text-sm text-gray-800">{message.messageText}</p>;
}
