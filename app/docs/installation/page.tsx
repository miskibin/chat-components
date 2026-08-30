import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/docs/code-block"
import { CommandBlock, InstallCommand } from "@/components/docs/command-block"
import { DocsPager } from "@/components/docs/docs-pager"
import {
  componentSlugs,
  installCommand,
  REGISTRY_NAMESPACE,
} from "@/components/docs/nav"
import { DocsPageHeader } from "@/components/docs/page-header"
import {
  DocsCallout,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsList,
  DocsP,
} from "@/components/docs/typography"

export const metadata: Metadata = {
  title: "Installation",
  description:
    "Prerequisites, installing the full kit or single atoms, and the two build settings the markdown renderer needs.",
}

const ATOM_COMMANDS = componentSlugs
  .filter((slug) => slug !== "chat")
  .map((slug) => `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${slug}`)
  .join("\n")

export default function InstallationPage() {
  return (
    <article className="flex flex-col gap-12">
      <DocsPageHeader
        title="Installation"
        description="Everything here assumes a React project with Tailwind v4 and shadcn/ui already set up. Components are copied into your repo, so there is no runtime package to keep in sync."
      />

      <section className="flex flex-col gap-4">
        <DocsH2>Prerequisites</DocsH2>
        <DocsList>
          <li>
            A <DocsCode>components.json</DocsCode> at the project root — run{" "}
            <DocsCode>npx shadcn@latest init</DocsCode> if you do not have one.
          </li>
          <li>
            Tailwind CSS v4 with the shadcn CSS variables defined (
            <DocsCode>init</DocsCode> writes them for you).
          </li>
          <li>React 19, and Node 20.9 or newer for the CLI.</li>
        </DocsList>
        <DocsP>
          The components import <DocsCode>cn()</DocsCode> from{" "}
          <DocsCode>@/lib/utils</DocsCode> and resolve shadcn primitives through
          the aliases in <DocsCode>components.json</DocsCode>. Missing
          primitives (dropdown menu, context menu, collapsible) are pulled in
          automatically.
        </DocsP>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Install the kit</DocsH2>
        <DocsP>
          The <DocsCode>chat</DocsCode> block installs a working chat surface
          plus every atom it composes.
        </DocsP>
        <InstallCommand command={installCommand("chat")} />
        <DocsCallout>
          <p>
            <DocsCode>chat</DocsCode> is a starter block —{" "}
            <DocsCode>components/chat.tsx</DocsCode> — plus registry
            dependencies. shadcn installs each atom as its own file rather than
            flattening everything into one; edit them independently.
          </p>
        </DocsCallout>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Install single atoms</DocsH2>
        <DocsP>
          Nothing here needs the block. Add only what you use — each item pulls
          its own dependencies.
        </DocsP>
        <CodeBlock code={ATOM_COMMANDS} lang="bash" maxHeight="22rem" />
      </section>

      <section className="flex flex-col gap-6">
        <DocsH2>Markdown rendering</DocsH2>
        <DocsP>
          <Link href="/docs/components/message-markdown">Message Markdown</Link>{" "}
          renders answers with Streamdown (GFM, Shiki, Mermaid, KaTeX). Those
          packages ship Tailwind utility classes inside their own dist files, so
          two build settings are required — without them the markdown renders
          unstyled.
        </DocsP>

        <div className="flex flex-col gap-3">
          <DocsH3>1. Tailwind sources</DocsH3>
          <DocsP>
            Add these next to your <DocsCode>@import &quot;tailwindcss&quot;</DocsCode>{" "}
            so the utilities are generated.
          </DocsP>
          <CodeBlock
            lang="css"
            title="app/globals.css"
            code={`@import "tailwindcss";
@import "streamdown/styles.css";

@source "../node_modules/streamdown/dist/*.js";
@source "../node_modules/@streamdown/code/dist/*.js";
@source "../node_modules/@streamdown/mermaid/dist/*.js";
@source "../node_modules/@streamdown/math/dist/*.js";`}
          />
        </div>

        <div className="flex flex-col gap-3">
          <DocsH3>2. Transpile the packages</DocsH3>
          <DocsP>On Next.js, add them to the config.</DocsP>
          <CodeBlock
            lang="ts"
            title="next.config.ts"
            code={`import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "streamdown",
    "@streamdown/code",
    "@streamdown/mermaid",
    "@streamdown/math",
    "mermaid",
  ],
}

export default nextConfig`}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Providers</DocsH2>
        <DocsP>
          <Link href="/docs/components/theme-toggle">ThemeToggle</Link> and the
          markdown renderer read the resolved theme from next-themes, so mount
          the provider once at the root. The examples in these docs also use{" "}
          <DocsCode>sonner</DocsCode> for toasts — optional, but the{" "}
          <DocsCode>Toaster</DocsCode> has to be mounted if you copy them
          verbatim.
        </DocsP>
        <CommandBlock command="npm install next-themes sonner" />
        <CodeBlock
          lang="tsx"
          title="app/layout.tsx"
          code={`import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}`}
        />
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Layout</DocsH2>
        <DocsP>
          The chat surface fills its parent and manages its own inner scrolling,
          so give the parent an explicit height and let the message list own the
          overflow.
        </DocsP>
        <CodeBlock
          lang="tsx"
          code={`<div className="flex h-svh min-h-0 flex-col overflow-hidden">
  <ChatNavbar title={title} />
  <MessageList className="flex-1" messages={messages} />
  <ChatInput onSend={send} />
</div>`}
        />
      </section>

      <DocsPager className="border-t pt-8" />
    </article>
  )
}
