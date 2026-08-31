import type { Metadata } from "next"
import Link from "next/link"

import { InstallCommand } from "@/components/docs/command-block"
import { componentDocs } from "@/components/docs/component-docs"
import { DocsPager } from "@/components/docs/docs-pager"
import { docsNav, installCommand } from "@/components/docs/nav"
import { DocsPageHeader } from "@/components/docs/page-header"
import {
  DocsCallout,
  DocsCode,
  DocsH2,
  DocsList,
  DocsP,
} from "@/components/docs/typography"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "A shadcn/ui registry of agent chat primitives: reasoning, tool calls, artifacts, and session management. Install one atom or the whole kit, then compose and restyle it in your own repo.",
}

const componentSections = docsNav.filter(
  (section) => section.title !== "Get Started"
)

export default function DocsIntroductionPage() {
  return (
    <article className="flex flex-col gap-12">
      <DocsPageHeader
        title="Chat Components"
        description="Agent-grade chat UI you own. A shadcn/ui registry of the primitives an agent app needs — reasoning streams, tool-call rows, artifacts, streaming markdown, a session sidebar with drag-and-drop. Install one atom or the whole kit; the code lands in your repo and stays yours."
      />

      <section className="flex flex-col gap-4">
        <DocsH2>Built for agent turns</DocsH2>
        <DocsP>
          A chatbot renders one text stream. An agent turn is a transcript: it
          thinks, calls tools, fails and retries, produces files, and runs long
          enough that the session itself becomes something you manage. Each of
          those has a real surface here.
        </DocsP>
        <DocsList>
          <li>
            <strong className="text-foreground">Reasoning.</strong> Collapsed
            &ldquo;Thought for N seconds&rdquo; above the answer, from an
            explicit <DocsCode>reasoning</DocsCode> prop or parsed out of{" "}
            <DocsCode>&lt;think&gt;</DocsCode> tags.
          </li>
          <li>
            <strong className="text-foreground">Tool calls.</strong> Rows with a{" "}
            <DocsCode>pending / running / done / error</DocsCode> lifecycle,
            collapsible input and output, and readable headlines. Many calls
            fold behind &ldquo;Used N tools&rdquo;.
          </li>
          <li>
            <strong className="text-foreground">Real ordering.</strong>{" "}
            <DocsCode>parts</DocsCode> interleaves text and tool segments, so the
            turn reads in the order the agent produced it.
          </li>
          <li>
            <strong className="text-foreground">Artifacts and code.</strong>{" "}
            Titled artifact cards with an optional preview and{" "}
            <DocsCode>onOpen</DocsCode> handoff, plus Streamdown markdown — GFM,
            Shiki, Mermaid, KaTeX.
          </li>
          <li>
            <strong className="text-foreground">Long streams.</strong> The
            message list sticks to the bottom while tokens arrive and lets go
            the moment the reader scrolls up; the composer swaps send for stop.
          </li>
          <li>
            <strong className="text-foreground">Sessions.</strong> A sidebar
            with rename, pin, delete, status dots, multi-line rows,
            drag-to-reorder, declarative drop zones, and keyboard dragging.
          </li>
        </DocsList>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Quick start</DocsH2>
        <DocsP>
          In a project that already ran <DocsCode>shadcn init</DocsCode>, one
          command installs the starter block and every atom it composes.
        </DocsP>
        <InstallCommand command={installCommand("chat")} />
        <DocsP>
          Prefer to pick and choose? Every item on the left installs on its own.
          See <Link href="/docs/installation">Installation</Link> for the full
          list and the two build settings the markdown renderer needs.
        </DocsP>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>What this is</DocsH2>
        <DocsP>
          This is a <em>custom registry</em>, not an npm package. Running{" "}
          <DocsCode>shadcn add</DocsCode> copies real TypeScript files into{" "}
          <DocsCode>components/ui</DocsCode> — you own them, you can edit them,
          and nothing upgrades behind your back.
        </DocsP>
        <DocsList>
          <li>
            <strong className="text-foreground">Standard tokens.</strong> Only
            the shadcn CSS variables — <DocsCode>--background</DocsCode>,{" "}
            <DocsCode>--muted</DocsCode>, <DocsCode>--primary</DocsCode>,{" "}
            <DocsCode>--sidebar</DocsCode>, <DocsCode>--radius</DocsCode>. Drop
            them into any shadcn theme and they take its colors.
          </li>
          <li>
            <strong className="text-foreground">
              className merges last.
            </strong>{" "}
            Every component runs its classes through <DocsCode>cn()</DocsCode>,
            so your overrides win.
          </li>
          <li>
            <strong className="text-foreground">
              Internals are addressable.
            </strong>{" "}
            Elements carry <DocsCode>data-slot</DocsCode> and state attributes,
            so a parent can restyle a composer surface or a tool row without a
            fork.
          </li>
          <li>
            <strong className="text-foreground">Slots, not config.</strong> The
            sidebar and navbar take nodes — no hard-wired product navigation.
          </li>
        </DocsList>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Why not the AI SDK?</DocsH2>
        <DocsP>
          Vercel&rsquo;s AI SDK is a good stack, and this is not a replacement
          for it — it is a different bet about where the seam belongs.
        </DocsP>
        <DocsList>
          <li>
            <strong className="text-foreground">Protocol-agnostic.</strong>{" "}
            These components take plain props and callbacks. No{" "}
            <DocsCode>useChat</DocsCode>, no <DocsCode>UIMessage</DocsCode>, no
            required stream format — the <DocsCode>ai</DocsCode> package
            isn&rsquo;t even a dependency. AI Elements is designed around the AI
            SDK&rsquo;s message parts and hooks, which is zero glue if your
            backend speaks that protocol. If it doesn&rsquo;t — a CLI agent, a
            LangChain service, a raw SSE endpoint, your own event union — you
            write one small adapter and the rest is normal React.
          </li>
          <li>
            <strong className="text-foreground">Agent-first depth.</strong> The
            tool-call lifecycle, reasoning disclosure, artifacts, and the
            session sidebar are the core of this registry, not extras around a
            message bubble.
          </li>
          <li>
            <strong className="text-foreground">UI only.</strong> The flip side:
            the AI SDK also gives you providers, tool calling, structured
            output, and a server runtime. This gives you none of that. Bring
            your own backend.
          </li>
          <li>
            <strong className="text-foreground">Not exclusive.</strong> Keep{" "}
            <DocsCode>useChat</DocsCode> and map its parts onto{" "}
            <DocsCode>ChatMessageData</DocsCode> — the{" "}
            <Link href="https://github.com/miskibin/chat-components#why-not-the-ai-sdk--ai-elements">
              README
            </Link>{" "}
            has the adapter.
          </li>
        </DocsList>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Components</DocsH2>
        <div className="flex flex-col gap-6">
          {componentSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {section.title}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {section.items.map((item) => {
                  const slug = item.href.split("/").pop() ?? ""
                  const doc = Object.hasOwn(componentDocs, slug)
                    ? componentDocs[slug as keyof typeof componentDocs]
                    : undefined
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border p-3 outline-none transition-colors",
                        "hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      )}
                    >
                      <span className="flex items-center gap-2 text-[13.5px] font-medium text-foreground">
                        {item.title}
                        {item.badge ? (
                          <span className="rounded-sm bg-primary/10 px-1 py-px text-[9.5px] font-semibold tracking-wide text-primary uppercase">
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                      <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                        {doc?.description}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Try it first</DocsH2>
        <DocsCallout title="Playground">
          <p>
            <Link href="/demo">/demo</Link> runs the whole kit against an agent
            backend that streams its own SSE event union — no AI SDK involved.
            Reasoning, tool calls, streaming answers, a sortable sidebar with
            drop zones, and the off-canvas mobile layout. It is a proof of
            concept, not part of the published registry.
          </p>
        </DocsCallout>
      </section>

      <DocsPager className="border-t pt-8" />
    </article>
  )
}
