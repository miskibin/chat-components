# chat-components — instructions for coding agents

> `CLAUDE.md` mirrors this file. If you edit one, apply the same edit to the other.

## What this repo is

A shadcn/ui **registry** of agent-grade chat primitives (composer, message list with reasoning /
tool calls / artifacts, streaming markdown, DnD session sidebar, model & mode pickers,
ask-question, change-summary), plus its docs site (`/docs`), landing (`/`), and a mock-agent
playground (`/demo`). Components are distributed by copying — consumers install them via
`npx shadcn add miskibin/chat-components/<item>`.

**Downstream consumer:** [miskibin/agent-ui](https://github.com/miskibin/agent-ui) vendors
`components/ui/**` and several `lib/` files byte-for-byte. The intended workflow for any
component improvement — including ones motivated by agent-ui — is: change it HERE first, then
sync the file(s) into agent-ui. Breaking API changes are acceptable (this registry does not
promise backward compatibility) but must be propagated to agent-ui in the same effort.

## Checklist for ANY component change

A component change is not done until all of these are true:

1. `components/ui/<component>.tsx` follows the idiom below.
2. Its docs entry in `components/docs/component-docs/*` is accurate: usage snippet, an
   `examples` block for anything user-visible, a props table that lists only props worth
   documenting (no `...props` filler, no `className` row that just says "merged last"), and
   the `dataSlots` name list.
3. Its example(s) in `components/examples/` compile and demonstrate the change. Prefer a live
   `example` over a `code` snippet — reach for `code` only when the change is a source edit or
   an integration the docs site cannot run.
4. `registry.json` is accurate (dependencies, registryDependencies, description) and
   `npm run registry:build` has regenerated `public/r/*.json`.
5. `npm run lint`, `npm run typecheck`, `npm run build` pass.
6. If the public API changed: sync the vendored copies in agent-ui (see its `AGENTS.md`).

## Idiom (enforced by review, not optional)

- Semantic tokens only (`bg-muted`, `text-muted-foreground`, `ring-ring/50`, `--sidebar*`…);
  no raw palette classes except deliberate, dark-safe exceptions already in the code (status
  dots, diff +/- counts).
- `data-slot` attribute on every meaningful part + state data-attributes
  (`data-active`, `data-state`, …) so consumers restyle without forking.
- `cn()` with the consumer's `className` merged last; `classNames` record for multi-part
  components; cva for real variant sets.
- React 19, no `forwardRef` (ref-as-prop). Strict react-hooks compiler rules are CI-enforced:
  no synchronous `setState` in effect bodies, refs written in effects, stable callbacks for
  memoized children.
- **Streaming performance is a feature**: message-family components are memoized on purpose —
  rows must never receive per-render closures. Follow the `useStableCallback` patterns in
  `sidebar-item.tsx` / `message-list.tsx`.
- `focus-visible` rings on every interactive element; keyboard paths for every pointer path
  (sidebar DnD has keyboard dragging; menus have roving focus).
- 11–13.5px type scale, `rounded-md/lg`, `transition-colors`.

## Toolchain quirks (do not "fix" these)

- `typescript` is aliased to TS6 (`@typescript/typescript6`) for typescript-eslint, while `tsc`
  runs TS7 via `@typescript/native`; `next.config.ts` sets `useTypeScriptCli: false`. ESLint is
  pinned to 9.x (eslint-config-next crashes on 10).
- `lib/cursor-agent.ts` spawn calls carry `/*turbopackIgnore: true*/` to stop Turbopack tracing.
- `app/api/chat/route.ts` `maxDuration` must stay ≤ 60 (Vercel hobby cap) — raising it breaks
  every production deploy.
- The playground auto-falls back to `lib/mock-agent.ts` when no `agent` binary exists
  (`MOCK_CURSOR_AGENT=1` forces it); keep the mock exercising every UI part.

## Commands

```bash
npm run dev             # site + playground
npm run lint            # eslint (CI)
npm run typecheck       # tsc --noEmit (CI)
npm run build           # next build (CI)
npm run registry:build  # regenerate public/r/*.json — required after component/registry edits
```

Deploys: pushes to `main` deploy to Vercel production (chat-input-azure.vercel.app). CI must be
green before merging.
