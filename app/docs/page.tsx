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
    "A shadcn/ui registry of chat primitives: install one atom or the whole kit, then compose and restyle it in your own repo.",
}

const componentSections = docsNav.filter(
  (section) => section.title !== "Get Started"
)

export default function DocsIntroductionPage() {
  return (
    <article className="flex flex-col gap-12">
      <DocsPageHeader
        title="Chat Components"
        description="A shadcn/ui registry of chat primitives — composer, message list, markdown, sidebar, pickers. Install one atom or the whole kit; the code lands in your repo and stays yours."
      />

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
            <Link href="/demo">/demo</Link> runs the whole kit against a live
            agent backend — streaming answers, reasoning, tool calls, a sortable
            sidebar with drop zones, and the off-canvas mobile layout. It is a
            proof of concept, not part of the published registry.
          </p>
        </DocsCallout>
      </section>

      <DocsPager className="border-t pt-8" />
    </article>
  )
}
