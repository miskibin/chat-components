import { Message, type MessagePart } from "@/components/ui/message"

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
      <Message sender="user" content="Why does the docs build fail?" />
      <Message
        sender="assistant"
        content={ANSWER}
        parts={PARTS}
        workedFor={12}
      />
    </div>
  )
}
