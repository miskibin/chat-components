import { Message } from "@/components/ui/message"

/**
 * Every turn carries `data-sender`, so one selector on an ancestor restyles
 * user bubbles without touching assistant answers.
 */
export function MessageSenderExample() {
  return (
    <div className="w-full max-w-2xl [&_[data-sender=user]_[data-slot=message-content]]:rounded-br-sm [&_[data-sender=user]_[data-slot=message-content]]:bg-primary [&_[data-sender=user]_[data-slot=message-content]]:text-primary-foreground">
      <Message sender="user" content="Why does the registry build fail?" />
      <Message
        sender="assistant"
        content="`registry.json` lists a file that no longer exists — the build resolves paths eagerly, so a stale entry is fatal."
      />
    </div>
  )
}
