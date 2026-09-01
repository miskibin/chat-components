import { MessageMarkdown } from "@/components/ui/message-markdown"

/** A 96×32 gradient, inlined the way an agent hands back a screenshot. */
const INLINE_PNG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAIAAABiouoDAAABS0lEQVR42u3QA1YEABQF0FaQbdu2m6Zpsm3btm1bS/toF62jc95dwrUoM1BpIZUYyVxEZhMVF5PJTKYSKiolYxkZy6mwggyVZKiigmrKr6H8Wsqro9x6ym2gnEbKbqKsZspqocxWzmjjjHZO7+C0Tk7r4tRuTunhlF5O7uOkfk4a4MRBThjihGGOH+G4UY4d49hxjpng6EmOnuKoaY6c4chZiZiT8HkJX5CwRQldktBlCVmR4FUJXpOgdQnckIBNCdgS/23x2xG/XfHdE5998TkQ70PxOhKvY/E8EY9T9ThT93N1u1C3S3W9Updrdb5R51t1ulPHe3V8UIdHtX9S+2e1e1HbV7V9U5t3tf5Q60+1+lLLb7X8+bVAEIIQhCAEIQhBCEIQghCEIAQhCEEIQhCCEIQgBCEIQQhCEIIQhCAEIQhBCEIQgv5v0B8k63mP6qmfKgAAAABJRU5ErkJggg==`

const MARKDOWN = `Coverage came out flat, so here is the band it moved in:

![Latency band](${INLINE_PNG})

A remote image works the same way — \`![alt](https://…)\` — and both stay
inside the message column however wide the original is.
`

/**
 * Images render from `http`, `https` and `data:` sources, so a screenshot or
 * chart an agent hands back as base64 shows up in the answer instead of
 * vanishing. Streamdown's hardening pass still narrows `data:` to
 * `data:image/*`.
 */
export function MessageMarkdownImagesExample() {
  return (
    <div className="w-full max-w-2xl">
      <MessageMarkdown>{MARKDOWN}</MessageMarkdown>
    </div>
  )
}
