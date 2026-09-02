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
              description: (
                <>
                  Drives the whole radius scale. Surfaces stay on it —{" "}
                  <DocsCode>rounded-md</DocsCode> for controls,{" "}
                  <DocsCode>rounded-lg</DocsCode> for cards, and{" "}
                  <DocsCode>rounded-2xl</DocsCode> as the one soft step, for the
                  composer.
                </>
              ),
            },
            {
              name: "--font-sans / --font-mono",
              type: "font stack",
              description:
                "ChatGPT uses Klim’s Söhne (licensed). We ship Inter in that slot, then the same system fallbacks they use.",
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
<ChatSidebar classNames={{ header: "pt-4", content: "px-3" }} />`}
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
        <DocsH2>Scaling the whole UI</DocsH2>
        <DocsP>
          An app that offers a zoom control cannot simply put{" "}
          <DocsCode>zoom</DocsCode> on <DocsCode>&lt;html&gt;</DocsCode>. Radix
          portals render into <DocsCode>&lt;body&gt;</DocsCode>, so a menu, a
          popover or a context menu would land <em>inside</em> the scaled
          subtree, where Floating UI measures rects in visual pixels and writes
          the result into a layout-unit box — every menu drifts off screen by
          the scale factor.
        </DocsP>
        <DocsP>
          So the scale is published as a variable and applied to a wrapper{" "}
          <em>inside</em> the body instead, and each portalled surface scales
          itself. Anchor, content and viewport then stay in one coordinate
          space, and the menu comes out the right size in the right place. Two
          edits do it, both in your own copies of the shadcn primitives —{" "}
          <DocsCode>PopoverContent</DocsCode>,{" "}
          <DocsCode>DropdownMenuContent</DocsCode> and{" "}
          <DocsCode>ContextMenuContent</DocsCode>, which this registry lists as
          dependencies rather than ships. Sub-content is not portalled, so it
          deliberately does <em>not</em> repeat the scale: it inherits its
          parent&apos;s.
        </DocsP>
        <DocsP>
          The widths are the part that catches people out:{" "}
          <DocsCode>vw</DocsCode> is not scaled by <DocsCode>zoom</DocsCode>, so
          a clamp against the viewport has to divide it back out. Every picker
          in this registry already does — <DocsCode>ModelPicker</DocsCode>,{" "}
          <DocsCode>ModePicker</DocsCode>, <DocsCode>FolderPicker</DocsCode>.
        </DocsP>
        <CodeBlock
          lang="tsx"
          code={`/* On the app wrapper, not on <html> — portals must stay outside it. */
<div style={{ zoom: "var(--ui-scale, 1)" }}>{children}</div>

/* In PopoverContent / DropdownMenuContent / ContextMenuContent */
className={cn("[zoom:var(--ui-scale,1)]", …)}

/* A viewport-clamped width inside a portal: vw is not scaled by zoom */
className="w-[min(17rem,calc((100vw-1.5rem)/var(--ui-scale,1)))]"`}
        />
        <DocsP>
          Set nothing and every one of these is a no-op —{" "}
          <DocsCode>var(--ui-scale, 1)</DocsCode> falls back to 1.
        </DocsP>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>House rules</DocsH2>
        <DocsList>
          <li>
            Focus on a control is always a <DocsCode>3px</DocsCode>{" "}
            <DocsCode>ring-ring/50</DocsCode> — keep it if you restyle one, and
            never trade it for <DocsCode>outline-none</DocsCode> alone. Large
            surfaces that merely <em>contain</em> a focused field — the composer
            card, the edit bubble — shift their border to{" "}
            <DocsCode>border-ring</DocsCode> instead, because a ring that wide
            reads as an error state.
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
