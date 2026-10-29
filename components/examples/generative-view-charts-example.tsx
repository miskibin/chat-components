"use client"

import { GenerativeView } from "@/components/ui/generative-view"
import { normalizeView } from "@/lib/generative-view"

const data = [
  { label: "Mon", requests: 186, completed: 140 },
  { label: "Tue", requests: 305, completed: 220 },
  { label: "Wed", requests: 237, completed: 190 },
  { label: "Thu", requests: 273, completed: 240 },
  { label: "Fri", requests: 349, completed: 290 },
  { label: "Sat", requests: 410, completed: 340 }
]
const series = [
  { key: "requests", label: "Requests" },
  { key: "completed", label: "Completed" }
]
const view = normalizeView({
  type: "tabs",
  items: ["area", "line", "bar", "donut"].map((kind) => ({
    label: kind[0].toUpperCase() + kind.slice(1),
    children: [
      {
        type: "chart",
        kind,
        title: "Weekly activity",
        description: "Example data · same tokens as the rest of the interface",
        data,
        series
      }
    ]
  }))
})

export function GenerativeViewChartsExample() {
  return <GenerativeView view={view} className="w-full max-w-2xl" />
}
