"use client"

import * as React from "react"
import type { ViewChart } from "@/lib/generative-view"
import { cn } from "@/lib/utils"

const WIDTH = 640
const HEIGHT = 248
const LEFT = 60
const RIGHT = 16
const TOP = 12
const BOTTOM = 32
const PLOT_W = WIDTH - LEFT - RIGHT
const PLOT_H = HEIGHT - TOP - BOTTOM
const number = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 2
})
const fullNumber = new Intl.NumberFormat(undefined, {
  maximumSignificantDigits: 21
})
const color = (index: number) =>
  `var(--chart-${(index % 5) + 1}, var(--primary))`

/** Theme-owned SVG charts: no generated code, remote assets or chart runtime. */
export function GenerativeChart({
  node,
  className
}: {
  node: ViewChart
  className?: string
}) {
  const id = React.useId().replace(/:/g, "")
  const [active, setActive] = React.useState<number | null>(null)
  const numeric = node.data.flatMap((row) =>
    row.values.filter((n): n is number => n !== null)
  )
  const min = Math.min(0, ...numeric)
  const max = Math.max(0, ...numeric) || (min === 0 ? 1 : 0)
  const span = max - min || 1
  const y = (n: number) => TOP + ((max - n) / span) * PLOT_H
  const x = (index: number) =>
    LEFT + ((index + 0.5) / Math.max(1, node.data.length)) * PLOT_W
  const zero = y(0)
  const donut = node.kind === "donut"
  const total = node.data.reduce((sum, row) => sum + (row.values[0] ?? 0), 0)
  const selected = active === null ? undefined : node.data[active]
  // Split at missing values: a gap is not a measured zero or an inferred line.
  const paths = node.series.map((_, series) => {
    const segments: { line: string; area: string }[] = []
    let points: string[] = []
    let first = 0
    let last = 0
    const flush = () => {
      if (points.length)
        segments.push({
          line: points.join(" "),
          area: points.join(" ") + ` L${last},${zero} L${first},${zero} Z`
        })
      points = []
    }
    node.data.forEach((row, i) => {
      const value = row.values[series]
      if (value === null) {
        flush()
        return
      }
      if (!points.length) first = x(i)
      last = x(i)
      points.push(`${points.length ? "L" : "M"}${x(i)},${y(value)}`)
    })
    flush()
    return segments
  })
  const label = node.title ?? `${node.kind} chart`
  return (
    <figure
      data-slot="generative-view-chart"
      data-kind={node.kind}
      className={cn(
        "m-0 min-w-0 space-y-3 rounded-lg border border-border/60 bg-card p-4 text-card-foreground",
        className
      )}
    >
      {node.title || node.description ? (
        <figcaption className="space-y-1">
          {node.title ? (
            <div className="text-[13px] font-medium">{node.title}</div>
          ) : null}
          {node.description ? (
            <p className="m-0 text-[12px] text-muted-foreground">
              {node.description}
            </p>
          ) : null}
        </figcaption>
      ) : null}
      {!numeric.length || (donut && !total) ? (
        <p
          data-slot="generative-view-chart-empty"
          className="py-8 text-center text-[12px] text-muted-foreground"
        >
          No numeric data to display
        </p>
      ) : (
        <>
          <div
            data-slot="generative-view-chart-plot"
            className="relative"
            onMouseLeave={() => setActive(null)}
          >
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="block h-auto w-full overflow-visible"
              role="img"
              aria-label={label}
            >
              <title>{label}</title>
              <desc>Exact values are available in the chart data table.</desc>
              {donut ? (
                <g transform="translate(320 124) rotate(-90)">
                  {node.data.map((row, i) => {
                    const fraction = (row.values[0] ?? 0) / total
                    const start =
                      node.data
                        .slice(0, i)
                        .reduce(
                          (sum, point) => sum + (point.values[0] ?? 0),
                          0
                        ) / total
                    return (
                      <circle
                        key={i}
                        data-slot="generative-view-chart-mark"
                        cx="0"
                        cy="0"
                        r="84"
                        fill="none"
                        stroke={color(i)}
                        strokeWidth={active === i ? 32 : 28}
                        pathLength="1"
                        strokeDasharray={`${Math.max(0, fraction - (fraction < 1 ? 0.006 : 0))} 1`}
                        strokeDashoffset={-start}
                        className="transition-[stroke-width]"
                        onMouseEnter={() => setActive(i)}
                      >
                        <title>{`${row.label}: ${fullNumber.format(row.values[0] ?? 0)}${node.unit ?? ""}`}</title>
                      </circle>
                    )
                  })}
                  <g transform="rotate(90)">
                    <text
                      textAnchor="middle"
                      y="-3"
                      fill="currentColor"
                      fontSize="24"
                      fontWeight="600"
                    >
                      {number.format(total)}
                    </text>
                    <text
                      textAnchor="middle"
                      y="20"
                      className="fill-muted-foreground"
                      fontSize="12"
                    >
                      {node.unit ?? "Total"}
                    </text>
                  </g>
                </g>
              ) : (
                <>
                  {[0, 1, 2, 3, 4].map((tick) => {
                    const value = max - (tick / 4) * span
                    const yy = TOP + (tick / 4) * PLOT_H
                    return (
                      <g key={tick} data-slot="generative-view-chart-grid">
                        <line
                          x1={LEFT}
                          x2={WIDTH - RIGHT}
                          y1={yy}
                          y2={yy}
                          className="stroke-border"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={LEFT - 10}
                          y={yy + 4}
                          textAnchor="end"
                          className="fill-muted-foreground"
                          fontSize="11"
                        >
                          {number.format(value)}
                        </text>
                      </g>
                    )
                  })}
                  {node.series.map((series, s) => (
                    <g key={series.key}>
                      {node.kind === "bar" ? (
                        node.data.map((row, i) => {
                          const value = row.values[s]
                          if (value === null) return null
                          const slot = PLOT_W / node.data.length
                          const width = Math.min(
                            48,
                            (slot * 0.72) / node.series.length
                          )
                          return (
                            <rect
                              key={i}
                              data-slot="generative-view-chart-mark"
                              x={x(i) + (s - node.series.length / 2) * width}
                              y={Math.min(y(value), zero)}
                              width={Math.max(0.25, width - 2)}
                              height={Math.abs(y(value) - zero)}
                              rx="3"
                              fill={color(s)}
                            />
                          )
                        })
                      ) : (
                        <>
                          {node.kind === "area" ? (
                            <defs>
                              <linearGradient
                                id={`${id}-${s}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={color(s)}
                                  stopOpacity="0.28"
                                />
                                <stop
                                  offset="100%"
                                  stopColor={color(s)}
                                  stopOpacity="0.025"
                                />
                              </linearGradient>
                            </defs>
                          ) : null}
                          {paths[s].map((path, i) => (
                            <g key={i}>
                              {node.kind === "area" ? (
                                <path d={path.area} fill={`url(#${id}-${s})`} />
                              ) : null}
                              <path
                                data-slot="generative-view-chart-mark"
                                d={path.line}
                                stroke={color(s)}
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                fill="none"
                              />
                            </g>
                          ))}
                          {node.data.map((row, i) =>
                            row.values[s] !== null ? (
                              <circle
                                key={i}
                                cx={x(i)}
                                cy={y(row.values[s]!)}
                                r={
                                  active === i
                                    ? 4
                                    : node.data.length === 1 ||
                                        (node.data[i - 1]?.values[s] == null &&
                                          node.data[i + 1]?.values[s] == null)
                                      ? 3
                                      : 0
                                }
                                fill={color(s)}
                                stroke="var(--card)"
                                strokeWidth="2"
                              />
                            ) : null
                          )}
                        </>
                      )}
                    </g>
                  ))}
                  {node.data.map((row, i) => (
                    <g key={i}>
                      {i === 0 ||
                      i === node.data.length - 1 ||
                      i % Math.max(1, Math.ceil(node.data.length / 6)) === 0 ? (
                        <text
                          x={x(i)}
                          y={HEIGHT - 8}
                          textAnchor="middle"
                          className="fill-muted-foreground"
                          fontSize="11"
                        >
                          {row.label.length > 12
                            ? `${row.label.slice(0, 11)}…`
                            : row.label}
                        </text>
                      ) : null}
                      <rect
                        x={LEFT + (i / node.data.length) * PLOT_W}
                        y={TOP}
                        width={PLOT_W / node.data.length}
                        height={PLOT_H}
                        fill="transparent"
                        onMouseEnter={() => setActive(i)}
                      />
                    </g>
                  ))}
                </>
              )}
            </svg>
            {selected ? (
              <div
                data-slot="generative-view-chart-tooltip"
                role="status"
                className="pointer-events-none absolute right-2 top-2 min-w-28 space-y-1.5 rounded-lg border border-border/60 bg-background px-3 py-2 text-[11px] shadow-lg"
              >
                <div className="font-medium">{selected.label}</div>
                {(donut ? node.series.slice(0, 1) : node.series).map(
                  (series, i) => (
                    <div key={series.key} className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-sm"
                        style={{ background: color(donut ? active! : i) }}
                      />
                      <span className="text-muted-foreground">
                        {series.label}
                      </span>
                      <span className="ml-auto font-mono tabular-nums">
                        {selected.values[i] === null
                          ? "—"
                          : fullNumber.format(selected.values[i]!)}
                        {selected.values[i] === null ? "" : node.unit}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : null}
          </div>
          <div
            data-slot="generative-view-chart-legend"
            className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground"
          >
            {(donut ? node.data : node.series).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-sm"
                  style={{ background: color(i) }}
                />
                {item.label}
              </span>
            ))}
          </div>
          <details
            data-slot="generative-view-chart-data"
            className="text-[11px] text-muted-foreground"
          >
            <summary className="w-fit cursor-pointer rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50">
              View data
            </summary>
            <div className="mt-2 max-h-60 overflow-auto">
              <table className="w-full text-left tabular-nums">
                <caption className="sr-only">{label}</caption>
                <thead>
                  <tr>
                    <th scope="col" className="px-2 py-1">
                      Label
                    </th>
                    {(donut ? node.series.slice(0, 1) : node.series).map(
                      (s) => (
                        <th
                          key={s.key}
                          scope="col"
                          className="px-2 py-1 text-right"
                        >
                          {s.label}
                          {node.unit ? ` (${node.unit})` : ""}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {node.data.map((row, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <th scope="row" className="px-2 py-1 font-normal">
                        {row.label}
                      </th>
                      {(donut ? row.values.slice(0, 1) : row.values).map(
                        (v, s) => (
                          <td key={s} className="px-2 py-1 text-right">
                            {v === null ? "—" : fullNumber.format(v)}
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </figure>
  )
}
