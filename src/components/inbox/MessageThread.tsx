import { useEffect, useRef } from "react";
import type { ChatMessageDto } from "../../types";
import { MessageBubble } from "./MessageBubble";
import { Spinner } from "../common/Spinner";
import { EmptyState } from "../common/EmptyState";

type MessageThreadProps = {
  messages: ChatMessageDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
};

export function MessageThread({ messages, isLoading, isError }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Failed to load messages" description="Try refreshing the conversation." />;
  }

  if (!messages || messages.length === 0) {
    return <EmptyState title="No messages yet" description="Send a message to start the conversation." />;
  }

  return (
    <div className="scroll-thin flex-1 space-y-2 overflow-y-auto px-6 py-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
