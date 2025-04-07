// 2. MessageList.tsx
import { Message, PatternHandler } from "@/components/message";
import {
  GenerationStatus,
  GenerationStage,
} from "@/components/generation-status";
import {
  Info,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MessageData {
  id: string;
  content: string;
  sender: "user" | "assistant";
  metadata?: {
    model?: string;
    responseTime?: number;
    tokens?: number;
  };
}

interface MessageListProps {
  messages: MessageData[];
  isLoading: boolean;
  generationStage: GenerationStage;
  patternHandlers: PatternHandler[];
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onRegenerateMessage: (id: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  generationStage,
  patternHandlers,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage,
}: MessageListProps) {
  const [metadataVisible, setMetadataVisible] = useState<
    Record<string, boolean>
  >({});
  const [copying, setCopying] = useState<string | null>(null);

  const toggleMetadata = (id: string) => {
    setMetadataVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopying(id);

    toast.success("Copied to clipboard", {
      description: "Message content has been copied to your clipboard.",
      duration: 2000,
    });

    setTimeout(() => {
      setCopying(null);
    }, 1000);
  };

  return (
    <div className="h-4/5 flex-1 overflow-y-auto p-4 space-y-8">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full"></div>
      ) : (
        messages.map((message) => {
          const actionButtons =
            message.sender === "assistant"
              ? [
                  {
                    id: "info",
                    icon: <Info size={14} />,
                    onClick: () => toggleMetadata(message.id),
                    title: "View message info",
                    position: "inside" as const,
                    className: metadataVisible[message.id]
                      ? "text-blue-500"
                      : "",
                  },
                  {
                    id: "copy",
                    icon: (
                      <Copy
                        size={14}
                        className={
                          copying === message.id ? "text-green-500" : ""
                        }
                      />
                    ),
                    onClick: () => handleCopy(message.id, message.content),
                    title: "Copy message",
                    position: "inside" as const,
                  },
                  {
                    id: "regenerate",
                    icon: <RefreshCw size={14} />,
                    onClick: () => onRegenerateMessage(message.id),
                    title: "Regenerate response",
                    position: "inside" as const,
                  },
                  {
                    id: "like",
                    icon: <ThumbsUp size={14} />,
                    onClick: () => console.log(`Liked message ${message.id}`),
                    title: "Like response",
                    position: "inside" as const,
                  },
                  {
                    id: "dislike",
                    icon: <ThumbsDown size={14} />,
                    onClick: () =>
                      console.log(`Disliked message ${message.id}`),
                    title: "Dislike response",
                    position: "inside" as const,
                  },
                ]
              : [
                  {
                    id: "copy",
                    icon: (
                      <Copy
                        size={16}
                        className={
                          copying === message.id ? "text-green-500" : ""
                        }
                      />
                    ),
                    onClick: () => handleCopy(message.id, message.content),
                    title: "Copy message",
                    position: "outside" as const,
                  },
                  {
                    id: "delete",
                    icon: <Trash2 size={16} />,
                    onClick: () => onDeleteMessage(message.id),
                    title: "Delete message",
                    position: "outside" as const,
                    className: "hover:text-destructive",
                  },
                ];

          return (
            <div key={message.id} className="w-full">
              <Message
                content={message.content}
                sender={message.sender}
                actionButtons={actionButtons}
                editable={message.sender === "user"}
                onEdit={(content) => onEditMessage(message.id, content)}
                patternHandlers={
                  message.sender === "assistant" ? patternHandlers : undefined
                }
              />

              {/* Metadata display if toggled */}
              {message.sender === "assistant" &&
                message.metadata &&
                metadataVisible[message.id] && (
                  <div className="ml-10 mt-1 p-3 bg-muted/80 rounded-md text-sm border border-border shadow-sm max-w-[70%]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Message Info</h4>
                      <button
                        onClick={() => toggleMetadata(message.id)}
                        className="text-muted-foreground hover:text-foreground text-xs"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(message.metadata).map(([key, value]) => (
                        <div key={key} className="contents">
                          <div className="text-muted-foreground capitalize text-xs">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </div>
                          <div className="font-medium text-xs">
                            {String(value)}
                            {key === "responseTime" && "s"}
                            {key === "tokens" && " tokens"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          );
        })
      )}

      {isLoading && <GenerationStatus stage={generationStage} />}
    </div>
  );
}
