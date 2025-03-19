"use client";

import { useState, useRef } from "react";
import { Globe, Sparkles } from "lucide-react";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
}

export default function ChatExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate assistant response
    timeoutRef.current = setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a response to: "${content}"`,
        sender: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      timeoutRef.current = null;
    }, 3000); // Longer timeout to demonstrate stop functionality
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
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-md">
      {/* Navbar */}
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

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Ask me anything...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-muted">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat input - Added max-w-3xl and centered */}
      <div className="p-4 flex justify-center">
        <div className="w-full max-w-3xl">
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
            ]}
          />
        </div>
      </div>
    </div>
  );
}
