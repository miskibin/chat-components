import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment } from "react"

import { CodeBlock } from "@/components/docs/code-block"
import { InstallCommand } from "@/components/docs/command-block"
import type { DocSection } from "@/components/docs/component-doc"
import { componentDocs } from "@/components/docs/component-docs"
import { ComponentPreview } from "@/components/docs/component-preview"
import { DocsPager } from "@/components/docs/docs-pager"
import {
  componentSlugs,
  installCommand,
  type ComponentSlug,
} from "@/components/docs/nav"
import { DocsPageHeader } from "@/components/docs/page-header"
import { PropsTable } from "@/components/docs/props-table"
import {
  DocsCode,
  DocsH2,
  DocsH3,
  DocsP,
} from "@/components/docs/typography"
import { CopyInstallButton } from "@/components/copy-install-button"
import { OpenInV0Button } from "@/components/open-in-v0-button"

export const dynamicParams = false

export function generateStaticParams() {
  return componentSlugs.map((slug) => ({ slug }))
}

function getDoc(slug: string) {
  return Object.hasOwn(componentDocs, slug)
    ? componentDocs[slug as ComponentSlug]
    : undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) return {}
  return { title: doc.title, description: doc.description }
}

/** One customization or note block: prose, then a live example or a snippet. */
async function DocBlock({ section }: { section: DocSection }) {
  return (
    <div className="flex flex-col gap-3">
      <DocsH3>{section.title}</DocsH3>
      {section.description ? <DocsP>{section.description}</DocsP> : null}
      {section.example ? (
        <ComponentPreview
          name={section.example.name}
          align={section.example.align}
        >
          {section.example.node}
        </ComponentPreview>
      ) : null}
      {section.code ? (
        <CodeBlock
          code={section.code.code}
          lang={section.code.lang}
          title={section.code.title}
        />
      ) : null}
    </div>
  )
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()

  return (
    <article className="flex flex-col gap-12">
      <div className="flex flex-col gap-8">
        <DocsPageHeader title={doc.title} description={doc.description} />
        {doc.preview ? (
          <ComponentPreview
            name={doc.preview.name}
            align={doc.preview.align}
            actions={
              <>
                <CopyInstallButton name={doc.registry} />
                <OpenInV0Button name={doc.registry} className="max-sm:hidden" />
              </>
            }
          >
            {doc.preview.node}
          </ComponentPreview>
        ) : null}
      </div>

      <section className="flex flex-col gap-4">
        <DocsH2>Installation</DocsH2>
        <InstallCommand command={installCommand(doc.registry)} />
        {doc.registryDependencies?.length ? (
          <DocsP>
            Also installs{" "}
            {doc.registryDependencies.map((dependency, index) => (
              <Fragment key={dependency}>
                {index > 0 ? ", " : ""}
                {Object.hasOwn(componentDocs, dependency) ? (
                  <Link href={`/docs/components/${dependency}`}>
                    <DocsCode>{dependency}</DocsCode>
                  </Link>
                ) : (
                  <DocsCode>{dependency}</DocsCode>
                )}
              </Fragment>
            ))}
            .
          </DocsP>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <DocsH2>Usage</DocsH2>
        <CodeBlock code={doc.usage} lang={doc.usageLang ?? "tsx"} />
      </section>

      <section className="flex flex-col gap-6">
        <DocsH2>API reference</DocsH2>
        {doc.props.map((group) => (
          <PropsTable
            key={group.caption}
            caption={group.caption}
            rows={group.rows}
          />
        ))}

        {doc.dataSlots?.length ? (
          <div className="flex flex-col gap-3">
            <DocsH3>Data slots</DocsH3>
            <DocsP>
              Every element below is addressable from a parent, so you can
              restyle internals without forking the component.
            </DocsP>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_minmax(0,1fr)]">
              {doc.dataSlots.map((entry) => (
                <Fragment key={entry.slot}>
                  <dt className="pt-0.5">
                    <DocsCode>{entry.slot}</DocsCode>
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground max-sm:mb-2">
                    {entry.description}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </div>
        ) : null}
      </section>

      {doc.customization?.length ? (
        <section className="flex flex-col gap-8">
          <DocsH2>Customization</DocsH2>
          {doc.customization.map((section) => (
            <DocBlock key={section.title} section={section} />
          ))}
        </section>
      ) : null}

      {doc.notes?.length ? (
        <section className="flex flex-col gap-8">
          <DocsH2>Notes</DocsH2>
          {doc.notes.map((section) => (
            <DocBlock key={section.title} section={section} />
          ))}
        </section>
      ) : null}

      <DocsPager className="border-t pt-8" />
    </article>
  )
}
