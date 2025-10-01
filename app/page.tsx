// ChatExample.tsx - Main Component with Think Tag Demo
"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChatHeader } from "./header";
import { MessageList } from "./message-list";
import { ChatFooter } from "./footer";

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

type GenerationStage = "idle" | "thinking" | "searching" | "responding";

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
const CitationReference = ({
  match,
  children,
}: {
  match: RegExpMatchArray;
  children: React.ReactNode;
}) => {
  const citationNumber = match[1] as keyof typeof sources;
  const source = sources[citationNumber];

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
            View source <span className="ml-1">↗</span>
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
  const [selectedModel] = useState("gpt-4");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define pattern handlers
  const patternHandlers = [
    {
      pattern: /\[(\d+)\]/g,
      render: (match: RegExpMatchArray) => (
        <CitationReference match={match}>{match[0]}</CitationReference>
      ),
    },
  ];

  const handleSendMessage = (content: string) => {
    const userMessage: MessageData = {
      id: Date.now().toString(),
      content,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setGenerationStage("thinking");

    timeoutRef.current = setTimeout(() => {
      setGenerationStage("searching");

      timeoutRef.current = setTimeout(() => {
        setGenerationStage("responding");

        timeoutRef.current = setTimeout(() => {
          let responseContent = "";

          // Generate response with thinking tags for AI-related queries
          if (
            content.toLowerCase().includes("ai") ||
            content.toLowerCase().includes("artificial intelligence") ||
            content.toLowerCase().includes("machine learning")
          ) {
            responseContent = `<think>
Let me break down this question about AI systematically:

1. **Understanding the query**: The user is asking about artificial intelligence and its applications
2. **Key areas to cover**: 
   - Definition and core concepts
   - Machine learning as a subset
   - Recent developments
3. **Sources to reference**: I should cite relevant sources [1], [2], and [3]
4. **Structure**: Start with a clear definition, then expand into ML and recent advances
</think>

Artificial Intelligence (AI) is a field of computer science focused on creating systems capable of performing tasks that typically require human intelligence [1]. These include learning, reasoning, problem-solving, perception, and language understanding.

Machine learning, a subset of AI, uses algorithms to enable systems to learn from data [2]. This approach allows computers to improve their performance on tasks through experience, without being explicitly programmed for every scenario.

Recent advancements in deep learning have significantly improved AI capabilities in areas like:
- **Image recognition**: Identifying objects, faces, and scenes in photos
- **Natural language processing**: Understanding and generating human language
- **Decision making**: Making complex decisions based on large datasets

These developments [3] have enabled AI to be applied across industries, from healthcare diagnostics to autonomous vehicles.`;
          } else if (
            content.toLowerCase().includes("think") ||
            content.toLowerCase().includes("reasoning")
          ) {
            responseContent = `<think>
The user is asking about thinking or reasoning. Let me demonstrate the thinking process:

**Step 1**: Identify what they want to know
**Step 2**: Consider different aspects of reasoning
**Step 3**: Provide a comprehensive answer
**Step 4**: Make it clear and actionable
</think>

Great question! When AI systems use extended thinking or reasoning, they break down complex problems into smaller steps. This approach, similar to human problem-solving, involves:

1. **Analyzing the problem** - Understanding what's being asked
2. **Breaking it down** - Dividing complex questions into manageable parts
3. **Evaluating options** - Considering different approaches
4. **Synthesizing** - Combining insights into a coherent answer

This multi-step reasoning process often leads to more accurate and thoughtful responses, especially for complex or nuanced questions.`;
          } else {
            responseContent = `<think>
Processing user query: "${content}"
- Query type: General question
- Approach: Provide helpful, concise response
- Model: ${selectedModel}
</think>

[${
              selectedModel === "gpt-4"
                ? "GPT-4"
                : selectedModel === "gpt-3.5"
                ? "GPT-3.5"
                : selectedModel === "claude-3"
                ? "Claude 3"
                : selectedModel === "gemini-pro"
                ? "Gemini Pro"
                : "Llama 3"
            }] I understand your question: "${content}"

Let me help you with that. Could you provide more details about what specific aspect you'd like to know more about?`;
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

    let userMessageIndex = messageIndex - 1;
    while (
      userMessageIndex >= 0 &&
      messages[userMessageIndex].sender !== "user"
    ) {
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      const userMessage = messages[userMessageIndex];
      setMessages((prev) => prev.filter((msg) => msg.id !== id));

      setIsLoading(true);
      setGenerationStage("thinking");

      timeoutRef.current = setTimeout(() => {
        setGenerationStage("searching");

        timeoutRef.current = setTimeout(() => {
          setGenerationStage("responding");

          timeoutRef.current = setTimeout(() => {
            let responseContent = "";

            if (
              userMessage.content.toLowerCase().includes("ai") ||
              userMessage.content
                .toLowerCase()
                .includes("artificial intelligence")
            ) {
              responseContent = `<think>
Regenerating response with different approach:
- Focus on practical applications
- Include more specific examples
- Reference different aspects than before
</think>

Artificial Intelligence is transforming industries across the globe [1]. 

It uses computational models to perform tasks that typically require human cognition [2]. Recent advances have enabled AI systems to demonstrate remarkable capabilities in language understanding and generation [3].

Some key applications include:
- Healthcare: Diagnostic assistance and drug discovery
- Finance: Fraud detection and algorithmic trading
- Transportation: Self-driving vehicles and route optimization`;
            } else {
              responseContent = `<think>
Regenerating with fresh perspective:
- Original query: "${userMessage.content}"
- New angle: More detailed explanation
- Include examples
</think>

[Regenerated with ${
                selectedModel === "gpt-4"
                  ? "GPT-4"
                  : selectedModel === "gpt-3.5"
                  ? "GPT-3.5"
                  : selectedModel === "claude-3"
                  ? "Claude 3"
                  : selectedModel === "gemini-pro"
                  ? "Gemini Pro"
                  : "Llama 3"
              }] Here's a different perspective on: "${userMessage.content}"

I've thought through this from a different angle and can provide additional insights...`;
            }

            const regeneratedMessage: MessageData = {
              id: Date.now().toString(),
              content: responseContent,
              sender: "assistant",
              metadata: {
                model: selectedModel,
                responseTime: 3.2,
                tokens: 215,
              },
            };

            setMessages((prev) => [...prev, regeneratedMessage]);
            setIsLoading(false);
            setGenerationStage("idle");
            timeoutRef.current = null;

            toast.success("Response regenerated", {
              description: "A new response has been generated.",
              duration: 3000,
            });
          }, 1500);
        }, 1500);
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ChatHeader />
      <div className="container mx-auto min-h-[80vh] flex flex-col flex-1">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          generationStage={generationStage}
          patternHandlers={patternHandlers}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onRegenerateMessage={handleRegenerateMessage}
        />
        <ChatFooter
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
