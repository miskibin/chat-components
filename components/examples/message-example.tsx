import { Message, type MessagePart } from "@/components/ui/message"

const SCREENSHOT_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#dc2626" />
      <rect x="24" y="24" width="152" height="18" rx="4" fill="#fecaca" />
      <rect x="24" y="60" width="100" height="12" rx="3" fill="#fecaca" />
    </svg>`
  )

const ANSWER = `The build fails because \`generateStaticParams\` returns \`string[]\`
instead of \`{ slug: string }[]\`.

\`\`\`ts
export function generateStaticParams() {
  return componentSlugs.map((slug) => ({ slug }))
}
\`\`\`
`

const PARTS: MessagePart[] = [
  {
    type: "thinking",
    id: "think-1",
    text: "The stack trace points at the docs route, so the params shape is the first thing to check.",
  },
  {
    type: "tool",
    id: "read-1",
    tool: {
      id: "read-1",
      name: "read",
      status: "done",
      input: '{ "path": "app/docs/components/[slug]/page.tsx" }',
    },
  },
  {
    type: "thinking",
    id: "think-2",
    text: "generateStaticParams is returning a string array. I'll show the object-shaped fix.",
  },
  {
    type: "tool",
    id: "edit-1",
    tool: {
      id: "edit-1",
      name: "Edit",
      status: "done",
      input: JSON.stringify({
        path: "app/docs/components/[slug]/page.tsx",
        old_string:
          "export function generateStaticParams() {\n  return componentSlugs\n}",
        new_string:
          "export function generateStaticParams() {\n  return componentSlugs.map((slug) => ({ slug }))\n}",
      }),
      output: "+3 −1",
    },
  },
  { type: "text", id: "answer-1", text: ANSWER },
]

export function MessageExample() {
  return (
    <div className="w-full max-w-2xl">
      <Message
        sender="user"
        content="Why does the docs build fail? Here's the error."
        attachments={[
          {
            id: "shot-1",
            name: "error.png",
            mimeType: "image/svg+xml",
            url: SCREENSHOT_DATA_URL,
          },
        ]}
      />
      <Message
        sender="assistant"
        content={ANSWER}
        parts={PARTS}
        workedFor={12}
      />
    </div>
  )
}
