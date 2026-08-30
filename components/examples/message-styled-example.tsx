import { Message } from "@/components/ui/message"

/**
 * Two ways in: `contentClassName` for the bubble itself, and `data-slot` /
 * `data-*` selectors from an ancestor for everything the component renders.
 */
export function MessageStyledExample() {
  return (
    <div className="w-full max-w-2xl [&_[data-slot=message-tool-call][data-status=error]]:text-destructive">
      <Message
        sender="user"
        content="Ship the release build."
        contentClassName="bg-primary/10 text-foreground"
      />
      <Message
        sender="assistant"
        content="The release script exited before publishing — the tool row below is tinted by a `data-status` selector."
        contentClassName="rounded-lg border bg-card px-4 py-3"
        tools={[
          {
            id: "shell-1",
            name: "shell",
            status: "error",
            input: '{ "command": "npm run release" }',
            output: "npm ERR! missing script: release",
          },
        ]}
      />
    </div>
  )
}
