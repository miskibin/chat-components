"use client";

import { Globe, MessageSquare, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export type GenerationStage = "thinking" | "searching" | "responding" | "idle";

interface GenerationStatusProps {
  stage: GenerationStage;
  className?: string;
}

export function GenerationStatus({ stage, className }: GenerationStatusProps) {
  const [dots, setDots] = useState("");

  // Animated dots for the status message
  useEffect(() => {
    if (stage === "idle") return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [stage]);

  if (stage === "idle") return null;

  return (
    <div className={cn("flex justify-start", className)}>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted max-w-[80%]">
        {stage === "thinking" && (
          <>
            <Brain size={16} className="text-purple-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Thinking{dots}
            </span>
          </>
        )}

        {stage === "searching" && (
          <>
            <Globe size={16} className="text-blue-500 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Searching{dots}
            </span>
          </>
        )}

        {stage === "responding" && (
          <>
            <MessageSquare
              size={16}
              className="text-green-500 animate-bounce"
            />
            <span className="text-sm text-muted-foreground">
              Responding{dots}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
