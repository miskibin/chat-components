"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export interface MessageProps {
  content: string;
  sender: "user" | "assistant";
  onEdit?: (content: string) => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onReaction?: (reaction: "like" | "dislike") => void;
  className?: string;
}

export function Message({
  content,
  sender,
  onEdit,
  onDelete,
  onRegenerate,
  onReaction,
  className,
}: MessageProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onEdit && editedContent !== content) {
      onEdit(editedContent);
    }
  };

  const handleReaction = (type: "like" | "dislike") => {
    setReaction(reaction === type ? null : type);
    onReaction?.(type);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col",
        sender === "user" ? "items-end" : "items-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg",
          sender === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-transparent"
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
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Cancel"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSaveEdit}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Save"
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div
              className={cn(
                "prose prose-sm max-w-none text-base", // Increased font size
                sender === "user" ? "prose-invert" : "prose-neutral"
              )}
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Message Actions - Always visible */}
      <div
        className={cn(
          "transition-opacity mt-1",
          sender === "user" ? "flex justify-end" : "flex justify-start"
        )}
      >
        <div className="flex items-center gap-2">
          {sender === "user" ? (
            <>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copy message"
              >
                {isCopied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <button
                onClick={handleEdit}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Edit message"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Delete message"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copy message"
              >
                {isCopied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <button
                onClick={onRegenerate}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Regenerate response"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => handleReaction("like")}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors p-1",
                  reaction === "like" && "text-green-500"
                )}
                title="Like response"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => handleReaction("dislike")}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors p-1",
                  reaction === "dislike" && "text-red-500"
                )}
                title="Dislike response"
              >
                <ThumbsDown size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
