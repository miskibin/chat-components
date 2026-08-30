import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/docs/code-block"
import { DocsPager } from "@/components/docs/docs-pager"
import { DocsPageHeader } from "@/components/docs/page-header"
import { PropsTable } from "@/components/docs/props-table"
import {
  DocsCallout,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsList,
  DocsP,
} from "@/components/docs/typography"

export const metadata: Metadata = {
  title: "Theming",
  description:
    "Semantic tokens, sidebar tokens, dark mode, and the three levers for restyling a component without forking it.",
}

export default function ThemingPage() {
  return (
    <article className="flex flex-col gap-12">
      <DocsPageHeader
        title="Theming"
        description="Every component here is painted with the standard shadcn CSS variables. Change the variables and the whole kit follows — no theme prop, no config object."
      />

      <section className="flex flex-col gap-4">
        <DocsH2>Tokens</DocsH2>
        <DocsP>
          Nothing in this registry defines a color of its own. If your project
          ran <DocsCode>shadcn init</DocsCode>, these are already in your{" "}
          <DocsCode>globals.css</DocsCode>.
        </DocsP>
        <PropsTable
          caption="Tokens the components read"
          rows={[
            {
              name: "--background / --foreground",
              type: "color",
              description: "Page surface and body text.",
            },
            {
              name: "--muted / --muted-foreground",
              type: "color",
              description:
                "User bubbles, code surfaces, tool output, secondary text.",
            },
            {
              name: "--primary / --primary-foreground",
              type: "color",
              description:
                "Send button, badges, pin markers, the accent drop zone.",
            },
            {
              name: "--destructive",
              type: "color",
              description: "Failed tool calls and the trash drop zone.",
            },
            {
              name: "--border / --input / --ring",
              type: "color",
              description:
                "Hairlines, field borders, and the 3px focus ring shared by every control.",
            },
            {
              name: "--popover / --popover-foreground",
              type: "color",
              description: "Dropdown menus, the slash menu, drag ghosts.",
            },
            {
              name: "--card / --card-foreground",
              type: "color",
              description: "Artifact cards.",
            },
            {
              name: "--sidebar*",
              type: "color",
              description: (
                <>
                  <DocsCode>--sidebar</DocsCode>,{" "}
                  <DocsCode>--sidebar-foreground</DocsCode>,{" "}
                  <DocsCode>--sidebar-accent</DocsCode>,{" "}
                  <DocsCode>--sidebar-accent-foreground</DocsCode>,{" "}
                  <DocsCode>--sidebar-border</DocsCode>,{" "}
                  <DocsCode>--sidebar-ring</DocsCode>.
                </>
              ),
            },
            {
              name: "--radius",
              type: "length",
              description:
                "Drives the whole radius scale. The composer surface is intentionally rounder than the rest.",
            },
            {
              name: "--font-sans / --font-mono",
              type: "font stack",
              description:
                "UI text and every code surface, including highlighted snippets.",
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Dark mode</DocsH2>
        <DocsP>
          Dark styling is class based: define the same variables under{" "}
          <DocsCode>.dark</DocsCode>, and drive that class with next-themes. The
          two components that read the resolved theme directly —{" "}
          <Link href="/docs/components/theme-toggle">ThemeToggle</Link> and the
          Shiki/Mermaid renderers — pick it up from the same provider.
        </DocsP>
        <CodeBlock
          lang="css"
          title="app/globals.css"
          code={`@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.32 0 0);
  --primary: oklch(0.62 0.19 259.81);
  --sidebar: oklch(0.98 0.003 247.84);
  --radius: 0.375rem;
}

.dark {
  --background: oklch(0.2 0 0);
  --foreground: oklch(0.92 0 0);
  --primary: oklch(0.62 0.19 259.81);
  --sidebar: oklch(0.2 0 0);
}`}
        />
        <DocsCallout title="Why the sidebar has its own tokens">
          <p>
            Sidebar rows hover to <DocsCode>bg-sidebar-accent</DocsCode>, not{" "}
            <DocsCode>bg-accent</DocsCode>. That is deliberate: the sidebar is
            meant to sit on a different surface from the conversation, so it
            carries its own palette. Retheme it by redefining the{" "}
            <DocsCode>--sidebar*</DocsCode> variables — point them at your main
            tokens if you want one flat surface.
          </p>
        </DocsCallout>
      </section>

      <section className="flex flex-col gap-6">
        <DocsH2>Restyling a component</DocsH2>
        <DocsP>
          Three levers, in order of how far they reach. None of them require
          editing the installed file.
        </DocsP>

        <div className="flex flex-col gap-3">
          <DocsH3>1. className merges last</DocsH3>
          <DocsP>
            Every component ends its class list with{" "}
            <DocsCode>cn(…, className)</DocsCode>, so tailwind-merge lets your
            class replace the default it conflicts with. Several components add
            a second, deeper hook —{" "}
            <DocsCode>contentClassName</DocsCode> on Message,{" "}
            <DocsCode>classNames</DocsCode> on ChatSidebar.
          </DocsP>
          <CodeBlock
            lang="tsx"
            code={`<ChatInput className="max-w-2xl" />
<Message sender="user" content={text} contentClassName="bg-primary/10" />
<ChatSidebar classNames={{ header: "border-b-0 pt-4", content: "px-3" }} />`}
          />
        </div>

        <div className="flex flex-col gap-3">
          <DocsH3>2. data-slot targeting</DocsH3>
          <DocsP>
            Internals are stamped with <DocsCode>data-slot</DocsCode> and, where
            they have state, a matching data attribute. That makes them
            reachable from any ancestor with an arbitrary variant.
          </DocsP>
          <CodeBlock
            lang="tsx"
            code={`// Square off the composer card
<ChatInput className="[&_[data-slot=chat-input-surface]]:rounded-xl" />

// Recolor every user turn from the scroll container
<MessageList
  className="[&_[data-slot=message][data-sender=user]_[data-slot=message-content]]:bg-primary/10"
  messages={messages}
/>

// Tint failed tool calls
<div className="[&_[data-slot=message-tool-call][data-status=error]]:text-destructive">
  <MessageToolCalls tools={tools} />
</div>`}
          />
          <DocsP>
            Each component page lists the slots it stamps under{" "}
            <em>API reference → Data slots</em>.
          </DocsP>
        </div>

        <div className="flex flex-col gap-3">
          <DocsH3>3. Shared variant recipes</DocsH3>
          <DocsP>
            <DocsCode>ChatInput</DocsCode> exports{" "}
            <DocsCode>chatInputButtonVariants</DocsCode> — the exact recipe its
            own attach and send buttons use — so a custom composer control lines
            up with the toolbar instead of approximating it.
          </DocsP>
          <CodeBlock
            lang="tsx"
            code={`import { ChatInput, chatInputButtonVariants } from "@/components/ui/chat-input"

<ChatInput
  tools={
    <button className={cn(chatInputButtonVariants(), "text-primary")}>
      <Globe />
      <span>Search</span>
    </button>
  }
  onSend={send}
/>`}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>House rules</DocsH2>
        <DocsList>
          <li>
            Focus is always a <DocsCode>3px</DocsCode>{" "}
            <DocsCode>ring-ring/50</DocsCode> — keep it if you restyle a
            control, and never trade it for{" "}
            <DocsCode>outline-none</DocsCode> alone.
          </li>
          <li>
            UI text sits on a <DocsCode>text-[13px]</DocsCode>—
            <DocsCode>text-[15px]</DocsCode> scale; message bodies are 15px with
            a 1.65 line height.
          </li>
          <li>
            Mobile textareas are <DocsCode>text-base</DocsCode> on purpose —
            anything smaller makes iOS Safari zoom on focus.
          </li>
          <li>
            Icons are normalized to <DocsCode>size-4</DocsCode> unless they
            already carry a size class.
          </li>
        </DocsList>
      </section>

      <DocsPager className="border-t pt-8" />
    </article>
  )
}
