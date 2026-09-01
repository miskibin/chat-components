"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function ResizableExample() {
  return (
    <div className="h-[260px] w-full overflow-hidden rounded-lg border bg-background">
      <ResizablePanelGroup id="resizable-example" orientation="horizontal">
        <ResizablePanel id="conversation" defaultSize="62%" minSize="30%">
          <div className="flex h-full flex-col justify-between p-3">
            <p className="text-[13px] text-foreground">Conversation</p>
            <p className="text-[12px] text-muted-foreground">
              Drag the divider, or focus it and press the arrow keys.
            </p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="details" defaultSize="38%" minSize="20%" maxSize="60%">
          <div className="flex h-full flex-col justify-between p-3">
            <p className="text-[13px] text-foreground">Details</p>
            <p className="text-[12px] text-muted-foreground">
              Double-click the divider to reset both panels.
            </p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
