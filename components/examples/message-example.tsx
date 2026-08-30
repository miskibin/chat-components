import { Message } from "@/components/ui/message"

const ANSWER = `The build fails because \`generateStaticParams\` returns \`string[]\`
instead of \`{ slug: string }[]\`.

\`\`\`ts
export function generateStaticParams() {
  return componentSlugs.map((slug) => ({ slug }))
}
\`\`\`
`

export function MessageExample() {
  return (
    <div className="w-full max-w-2xl">
      <Message sender="user" content="Why does the docs build fail?" />
      <Message
        sender="assistant"
        content={ANSWER}
        reasoning="The stack trace points at the docs route, so the params shape is the first thing to check."
        reasoningDuration={4}
        tools={[
          {
            id: "read-1",
            name: "read",
            status: "done",
            input: '{ "path": "app/docs/components/[slug]/page.tsx" }',
          },
        ]}
      />
    </div>
  )
}
