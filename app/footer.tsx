// 3. ChatFooter.tsx
import { ChatInput } from "@/components/chat-input";
import { Globe, Sparkles, Bot } from "lucide-react";
import { useState } from "react";

interface ChatFooterProps {
  onSendMessage: (content: string) => void;
  onStopGeneration: () => void;
  isLoading: boolean;
}

export function ChatFooter({
  onSendMessage,
  onStopGeneration,
  isLoading,
}: ChatFooterProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  // List of AI models
  const models = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5", label: "GPT-3.5" },
    { value: "claude-3", label: "Claude 3" },
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "llama-3", label: "Llama 3" },
  ];

  return (
    <div className="p-4">
      <ChatInput
        onSend={onSendMessage}
        onStopGeneration={onStopGeneration}
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
  );
}
