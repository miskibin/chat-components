"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Sparkles, Bot } from "lucide-react";
import { ChatInput } from "@/components/chat-input";
import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";
import {
  GenerationStatus,
  GenerationStage,
} from "@/components/generation-status";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
}

export default function ChatExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStage, setGenerationStage] =
    useState<GenerationStage>("idle");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const userMessage: Message = {
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
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `[${models.find(m => m.value === selectedModel)?.label}] Response to: "${content}"`,
            sender: "assistant",
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
      const stoppedMessage: Message = {
        id: Date.now().toString(),
        content: "Generation stopped by user",
        sender: "assistant",
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
        const regeneratedMessage: Message = {
          id: Date.now().toString(),
          content: `Regenerated response to: ${userMessage.content}`,
          sender: "assistant",
        };

        setMessages((prev) => [...prev, regeneratedMessage]);
        setIsLoading(false);
        timeoutRef.current = null;
      }, 2000);
    }
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
                Ask me anything...
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                content={message.content}
                sender={message.sender}
                onEdit={
                  message.sender === "user"
                    ? (content) => handleEditMessage(message.id, content)
                    : undefined
                }
                onDelete={
                  message.sender === "user"
                    ? () => handleDeleteMessage(message.id)
                    : undefined
                }
                onRegenerate={
                  message.sender === "assistant"
                    ? () => handleRegenerateMessage(message.id)
                    : undefined
                }
                onReaction={
                  message.sender === "assistant"
                    ? (reaction) =>
                        console.log(`${reaction} reaction to ${message.id}`)
                    : undefined
                }
              />
            ))
          )}

          {isLoading && <GenerationStatus stage={generationStage} />}
        </div>

        {/* Chat input */}
        <div className="p-4">
          <ChatInput
            onSend={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isLoading={isLoading}
            placeholder="Ask about anything"
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
