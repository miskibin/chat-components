"use client";

import { useState, useRef, useEffect } from "react";
import {
  Globe,
  Sparkles,
  Bot,
  ExternalLink,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Trash2,
  Info,
} from "lucide-react";
import { ChatInput } from "@/components/chat-input";
import { Message, PatternHandler } from "@/components/message";
import { Button } from "@/components/ui/button";
import {
  GenerationStatus,
  GenerationStage,
} from "@/components/generation-status";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

// Example sources for citations
const sources = {
  "1": {
    title: "Artificial Intelligence Basics",
    url: "https://example.com/ai-basics",
    author: "John Smith",
    date: "2023-05-10",
  },
  "2": {
    title: "Machine Learning Fundamentals",
    url: "https://example.com/ml-fundamentals",
    author: "Sarah Johnson",
    date: "2022-11-22",
  },
  "3": {
    title: "Deep Learning Applications",
    url: "https://example.com/deep-learning",
    author: "Michael Chen",
    date: "2024-01-15",
  },
};

// Citation reference component to handle [number] patterns
const CitationReference: React.FC<{
  match: RegExpExecArray;
  children: React.ReactNode;
}> = ({ match, children }) => {
  // Extract the citation number from the match
  const citationNumber = match[1];
  const source = sources[citationNumber as keyof typeof sources];

  if (!source) {
    return <span>{children}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer text-blue-500 font-medium">
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-medium">{source.title}</h3>
          <p className="text-sm text-muted-foreground">
            By {source.author} • {source.date}
          </p>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-500 hover:underline"
          >
            View source <ExternalLink size={12} className="ml-1" />
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function ChatExample() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStage, setGenerationStage] =
    useState<GenerationStage>("idle");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [metadataVisible, setMetadataVisible] = useState<
    Record<string, boolean>
  >({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define pattern handlers
  const patternHandlers: PatternHandler[] = [
    {
      // Match citation references like [1], [2], etc.
      pattern: /\[(\d+)\]/g,
      component: CitationReference,
    },
  ];

  // List of AI models
  const models = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5", label: "GPT-3.5" },
    { value: "claude-3", label: "Claude 3" },
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "llama-3", label: "Llama 3" },
  ];

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: MessageData = {
      id: Date.now().toString(),
      content,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate different generation stages
    setGenerationStage("thinking");

    timeoutRef.current = setTimeout(() => {
      setGenerationStage("searching");

      timeoutRef.current = setTimeout(() => {
        setGenerationStage("responding");

        timeoutRef.current = setTimeout(() => {
          // Generate response with example citations if the query is related to AI
          let responseContent = "";

          if (
            content.toLowerCase().includes("ai") ||
            content.toLowerCase().includes("artificial intelligence")
          ) {
            responseContent = `Artificial Intelligence (AI) is a field of computer science focused on creating systems capable of performing tasks that typically require human intelligence [1]. These include learning, reasoning, problem-solving, perception, and language understanding.
            
Machine learning, a subset of AI, uses algorithms to enable systems to learn from data [2]. Recent advancements in deep learning have significantly improved AI capabilities in areas like image recognition and natural language processing [3].`;
          } else {
            responseContent = `[${
              models.find((m) => m.value === selectedModel)?.label
            }] Response to: "${content}"`;
          }

          const assistantMessage: MessageData = {
            id: (Date.now() + 1).toString(),
            content: responseContent,
            sender: "assistant",
            metadata: {
              model: selectedModel,
              responseTime: 4.5,
              tokens: 256,
            },
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          setGenerationStage("idle");
          timeoutRef.current = null;
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleStopGeneration = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;

      // Add a "generation stopped" message
      const stoppedMessage: MessageData = {
        id: Date.now().toString(),
        content: "Generation stopped by user",
        sender: "assistant",
        metadata: {
          model: selectedModel,
          responseTime: 0,
          tokens: 0,
        },
      };

      setMessages((prev) => [...prev, stoppedMessage]);
      setIsLoading(false);
      setGenerationStage("idle");
    }
  };

  const handleEditMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    );
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const handleRegenerateMessage = (id: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    if (messageIndex < 0) return;

    // Find the previous user message
    let userMessageIndex = messageIndex - 1;
    while (
      userMessageIndex >= 0 &&
      messages[userMessageIndex].sender !== "user"
    ) {
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      const userMessage = messages[userMessageIndex];
      setIsLoading(true);

      // Remove the current assistant message
      setMessages((prev) => prev.filter((msg) => msg.id !== id));

      // Simulate new response
      timeoutRef.current = setTimeout(() => {
        const regeneratedMessage: MessageData = {
          id: Date.now().toString(),
          content: `Regenerated response to: "${userMessage.content}"`,
          sender: "assistant",
          metadata: {
            model: selectedModel,
            responseTime: 2.1,
            tokens: 180,
          },
        };

        setMessages((prev) => [...prev, regeneratedMessage]);
        setIsLoading(false);
        timeoutRef.current = null;
      }, 2000);
    }
  };

  // Utility functions for message actions
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const toggleMetadata = (id: string) => {
    setMetadataVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="p-4 flex justify-between items-center border-b bg-gray-100">
        <h1 className="text-lg font-semibold">Chat Example</h1>
        <div className="flex gap-2">
          <Button asChild>
            <a
              href="https://github.com/miskibin/chat-input"
              target="_blank"
              rel="noopener noreferrer"
            >
              Repository
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://github.com/miskibin/chat-input/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </Button>
        </div>
      </div>
      <div className="container mx-auto min-h-[80vh] flex flex-col">
        {/* Messages area */}
        <div className="h-4/5 flex-1 overflow-y-auto p-4 space-y-8">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-base">
                Ask me anything about AI to see citation references in action...
              </p>
            </div>
          ) : (
            messages.map((message) => {
              // Dynamically create action buttons based on message type
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
                        icon: <Copy size={14} />,
                        onClick: () => handleCopy(message.content),
                        title: "Copy message",
                        position: "inside" as const,
                      },
                      {
                        id: "regenerate",
                        icon: <RefreshCw size={14} />,
                        onClick: () => handleRegenerateMessage(message.id),
                        title: "Regenerate response",
                        position: "inside" as const,
                      },
                      {
                        id: "like",
                        icon: <ThumbsUp size={14} />,
                        onClick: () =>
                          console.log(`Liked message ${message.id}`),
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
                        icon: <Copy size={16} />,
                        onClick: () => handleCopy(message.content),
                        title: "Copy message",
                        position: "outside" as const,
                      },
                      {
                        id: "delete",
                        icon: <Trash2 size={16} />,
                        onClick: () => handleDeleteMessage(message.id),
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
                    onEdit={(content) => handleEditMessage(message.id, content)}
                    contentClassName={
                      message.sender === "assistant"
                        ? "bg-muted rounded-lg"
                        : ""
                    }
                    patternHandlers={
                      message.sender === "assistant"
                        ? patternHandlers
                        : undefined
                    }
                  />

                  {/* Metadata display if toggled */}
                  {message.sender === "assistant" &&
                    message.metadata &&
                    metadataVisible[message.id] && (
                      <div className="ml-4 mt-1 p-2 bg-muted rounded-md text-xs">
                        <h4 className="font-medium mb-1">Message Info</h4>
                        <ul>
                          {Object.entries(message.metadata).map(
                            ([key, value]) => (
                              <li key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}:
                                </span>
                                <span className="font-medium">
                                  {String(value)}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              );
            })
          )}

          {isLoading && <GenerationStatus stage={generationStage} />}
        </div>

        {/* Chat input */}
        <div className="p-4">
          <ChatInput
            onSend={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isLoading={isLoading}
            placeholder="Ask about AI to see citation handling"
            tools={[
              {
                id: "search",
                label: "Search",
                icon: <Globe size={14} className="mr-1" />,
              },
              {
                id: "think",
                label: "Think",
                icon: <Sparkles size={14} className="mr-1" />,
              },
              {
                id: "model",
                label: "Model",
                icon: <Bot size={14} className="mr-1" />,
                type: "dropdown",
                options: models,
                value: selectedModel,
                onChange: setSelectedModel,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
