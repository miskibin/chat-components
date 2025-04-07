"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { PencilIcon, Save, Undo } from "lucide-react";

// Define the pattern handler type
export interface PatternHandler {
  pattern: RegExp;
  component: React.ComponentType<{
    match: RegExpExecArray;
    children: React.ReactNode;
  }>;
}

// Define a generic action button interface
export interface ActionButton {
  id: string;
  icon: React.ReactNode;
  onClick: () => void;
  title?: string;
  className?: string;
  position?: "inside" | "outside"; // Whether button should appear inside or outside the message
}

export interface MessageProps {
  content: string;
  sender: "user" | "assistant";
  actionButtons?: ActionButton[]; // Custom action buttons
  editable?: boolean; // Whether this message can be edited
  onEdit?: (content: string) => void;
  patternHandlers?: PatternHandler[];
  className?: string;
  contentClassName?: string; // Additional className for the content container
}

export function Message({
  content,
  sender,
  actionButtons = [],
  editable = false,
  onEdit,
  patternHandlers = [],
  className,
  contentClassName,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onEdit && editedContent !== content) {
      onEdit(editedContent);
    }
  };

  // Handle keyboard events for the edit textarea
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedContent(content);
    }
  };

  // Function to process content with pattern handlers
  const processContent = (text: string): React.ReactElement | null => {
    if (!text || patternHandlers.length === 0) {
      return null;
    }

    const segments: Array<React.ReactNode> = [];
    let lastIndex = 0;

    for (const { pattern, component: Component } of patternHandlers) {
      // Reset the lastIndex to ensure we find all matches
      pattern.lastIndex = 0;

      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          segments.push(text.substring(lastIndex, match.index));
        }

        // Add the processed match
        segments.push(
          <Component key={`pattern-${match.index}`} match={match}>
            {match[0]}
          </Component>
        );

        lastIndex = pattern.lastIndex;
      }
    }

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push(text.substring(lastIndex));
    }

    // If no matches were found, return null so we use the standard rendering
    if (segments.length === 0) {
      return null;
    }

    return <>{segments}</>;
  };

  // Filter buttons by position
  const insideButtons = actionButtons.filter(
    (btn) => btn.position !== "outside"
  );
  const outsideButtons = actionButtons.filter(
    (btn) => btn.position === "outside"
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col w-full",
        sender === "user" ? "items-end" : "items-start",
        className
      )}
    >
      <div className="relative">
        {/* Message content */}
        <div
          className={cn(
            "max-w-[90vw] sm:max-w-[70vw]",
            sender === "user"
              ? "bg-primary text-primary-foreground rounded-lg"
              : "",
            contentClassName
          )}
        >
          {isEditing ? (
            <div className="p-3">
              <textarea
                className={cn(
                  "w-full p-2 rounded-md border resize-none focus:outline-none focus:ring-1 focus:ring-primary",
                  sender === "user"
                    ? "bg-primary/90 text-primary-foreground border-primary-foreground/20"
                    : "bg-muted text-foreground border-input"
                )}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(content);
                  }}
                  className="text-white transition-colors"
                  title="Cancel"
                >
                  <Undo height={18} />
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="text-white"
                  title="Save"
                >
                  <Save height={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div
                className={cn(
                  "prose prose-sm max-w-none text-base",
                  sender === "user"
                    ? "prose-invert prose-p:text-primary-foreground"
                    : "prose-neutral dark:prose-invert"
                )}
              >
                {patternHandlers.length > 0 ? (
                  React.createElement(
                    ReactMarkdown,
                    {
                      components: {
                        p: ({ children }) => {
                          const processedContent = processContent(
                            String(children)
                          );
                          return processedContent ? (
                            <p>{processedContent}</p>
                          ) : (
                            <p>{children}</p>
                          );
                        },
                      },
                    },
                    content
                  )
                ) : (
                  <ReactMarkdown>{content}</ReactMarkdown>
                )}
              </div>
            </div>
          )}

          {/* Inside action buttons */}
          {!isEditing && insideButtons.length > 0 && (
            <div className="px-3 py-1 flex justify-start">
              <div className="flex items-center gap-2">
                {insideButtons.map((button) => (
                  <button
                    key={button.id}
                    onClick={button.onClick}
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors p-1",
                      button.className
                    )}
                    title={button.title}
                  >
                    {button.icon}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Outside action buttons - only visible on hover, positioned in row next to message */}
        {!isEditing && outsideButtons.length > 0 && (
          <div className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-row gap-1 -translate-x-full pr-2 h-full items-center">
            {outsideButtons.map((button) => (
              <button
                key={button.id}
                onClick={button.onClick}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted",
                  button.className
                )}
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
            {/* Edit button if message is editable */}
            {editable && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
                title="Edit message"
              >
                <PencilIcon size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
