"use client";

import * as React from "react";
import { ChevronDown, PlusCircle, Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend: (message: string) => void;
  onStopGeneration?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  tools?: {
    icon: React.ReactNode;
    label: string;
    id: string;
    type?: "toggle" | "dropdown";
    options?: { value: string; label: string }[];
    value?: string;
    onChange?: (value: string) => void;
  }[];
}

export const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      className,
      onSend,
      onStopGeneration,
      isLoading = false,
      placeholder = "Message...",
      tools = [],
      ...props
    },
    ref
  ) => {
    const [input, setInput] = React.useState("");
    const [activeTools, setActiveTools] = React.useState<string[]>([]);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const toolbarRef = React.useRef<HTMLDivElement>(null);

    // Handle merged refs
    const mergedRef = React.useMemo(
      () => (node: HTMLTextAreaElement | null) => {
        if (node) {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          textareaRef.current = node;
        }
      },
      [ref]
    );

    // Handle sending message
    const handleSendMessage = React.useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSend(input.trim());
        setInput("");
      },
      [input, isLoading, onSend]
    );

    // Toggle tool selection
    const toggleTool = React.useCallback((id: string) => {
      setActiveTools((prev) =>
        prev.includes(id) ? prev.filter((tool) => tool !== id) : [...prev, id]
      );
    }, []);

    // Adjust textarea padding based on toolbar height
    React.useEffect(() => {
      const adjustPadding = () => {
        if (textareaRef.current && toolbarRef.current) {
          textareaRef.current.style.paddingBottom = `${
            toolbarRef.current.offsetHeight + 8
          }px`;
        }
      };

      adjustPadding();

      // Observe toolbar size changes
      const resizeObserver = new ResizeObserver(adjustPadding);
      if (toolbarRef.current) resizeObserver.observe(toolbarRef.current);

      return () => resizeObserver.disconnect();
    }, [activeTools.length]);

    // Auto-resize textarea
    React.useEffect(() => {
      if (!textareaRef.current) return;

      const scrollTop = textareaRef.current.scrollTop;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
      textareaRef.current.scrollTop = scrollTop;
    }, [input]);

    return (
      <div className={cn("relative w-full max-w-[800px] mx-auto", className)}>
        <form onSubmit={handleSendMessage} className="relative">
          <div className="relative bg-background border rounded-lg overflow-hidden shadow-sm">
            <textarea
              ref={mergedRef}
              placeholder={placeholder}
              className="w-full border-none pt-3 !pb-0 px-4 placeholder:text-muted-foreground focus-visible:ring-0 focus:outline-none resize-none mb-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
              disabled={isLoading}
              {...props}
            />

            <div
              ref={toolbarRef}
              className="absolute bottom-0 left-0 right-0 flex border-none items-center px-2 py-1 pb-2 border-t"
            >
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground flex-shrink-0 p-0"
                >
                  <PlusCircle size={14} />
                  <span className="sr-only">Add attachment</span>
                </Button>

                {tools.map((tool) => (
                  <React.Fragment key={tool.id}>
                    {tool.type === "dropdown" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={isLoading}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs font-normal gap-1 px-2"
                          >
                            {tool.icon}
                            <span className="hidden sm:inline">
                              {tool.options?.find(
                                (opt) => opt.value === tool.value
                              )?.label || tool.label}
                            </span>
                            <ChevronDown size={12} className="opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {tool.options?.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              className={cn(
                                "text-xs cursor-pointer",
                                tool.value === option.value &&
                                  "bg-muted font-medium"
                              )}
                              onClick={() => {
                                tool.onChange?.(option.value);
                              }}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Toggle
                        pressed={activeTools.includes(tool.id)}
                        onPressedChange={() => toggleTool(tool.id)}
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-7 rounded-md px-2 flex items-center gap-1 text-xs  me-2",
                          activeTools.includes(tool.id)
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {tool.icon}
                        <span className="hidden sm:inline">{tool.label}</span>
                      </Toggle>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="ml-auto">
                {isLoading ? (
                  <Button
                    type="button"
                    onClick={onStopGeneration}
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 p-0 h-7 w-7"
                  >
                    <Square size={14} className="fill-destructive" />
                    <span className="sr-only">Stop generation</span>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    disabled={!input.trim()}
                    className={cn(
                      "h-7 w-7 rounded-full flex-shrink-0 p-0",
                      input.trim()
                        ? "text-primary hover:text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Send size={14} />
                    <span className="sr-only">Send message</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
