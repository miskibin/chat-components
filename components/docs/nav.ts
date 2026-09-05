export const REGISTRY_NAMESPACE = "miskibin/chat-components"
export const REPO_URL = "https://github.com/miskibin/chat-components"

/** Every component that gets a generated page under `/docs/components`. */
export const componentSlugs = [
  "chat",
  "chat-input",
  "prompt-suggestions",
  "todo-list",
  "chat-navbar",
  "resizable",
  "message",
  "message-list",
  "message-parts",
  "ask-question",
  "plan-card",
  "message-markdown",
  "change-summary",
  "file-preview",
  "file-icon",
  "generation-status",
  "folder-picker",
  "model-picker",
  "mode-picker",
  "context-meter",
  "theme-toggle",
  "chat-sidebar",
  "sidebar-item",
  "sidebar-dnd",
  "sidebar-drop-zones",
  "use-click-outside",
] as const

export type ComponentSlug = (typeof componentSlugs)[number]

export type DocsNavItem = {
  title: string
  href: string
  /** Small tag shown after the title, e.g. `block`. */
  badge?: string
}

export type DocsNavSection = {
  title: string
  items: DocsNavItem[]
}

function component(slug: ComponentSlug, title: string, badge?: string) {
  return { title, href: `/docs/components/${slug}`, badge }
}

export const docsNav: DocsNavSection[] = [
  {
    title: "Get Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Theming", href: "/docs/theming" },
    ],
  },
  {
    title: "Chat",
    items: [
      component("chat", "Chat", "block"),
      component("chat-input", "Chat Input"),
      component("prompt-suggestions", "Prompt Suggestions"),
      component("todo-list", "Todo List"),
      component("chat-navbar", "Chat Navbar"),
      component("resizable", "Resizable"),
    ],
  },
  {
    title: "Messages",
    items: [
      component("message", "Message"),
      component("message-list", "Message List"),
      component("message-parts", "Message Parts"),
      component("ask-question", "Ask Question"),
      component("plan-card", "Plan Card"),
      component("message-markdown", "Message Markdown"),
      component("change-summary", "Change Summary"),
      component("file-preview", "File Preview"),
      component("file-icon", "File Icon"),
      component("generation-status", "Generation Status"),
    ],
  },
  {
    title: "Controls",
    items: [
      component("folder-picker", "Folder Picker"),
      component("model-picker", "Model Picker"),
      component("mode-picker", "Mode Picker"),
      component("context-meter", "Context Meter"),
      component("theme-toggle", "Theme Toggle"),
    ],
  },
  {
    title: "Sidebar",
    items: [
      component("chat-sidebar", "Chat Sidebar"),
      component("sidebar-item", "Sidebar Item"),
      component("sidebar-dnd", "Sidebar DnD"),
      component("sidebar-drop-zones", "Sidebar Drop Zones"),
    ],
  },
  {
    title: "Hooks",
    items: [component("use-click-outside", "useClickOutside")],
  },
]

export function installCommand(name: string) {
  return `shadcn@latest add ${REGISTRY_NAMESPACE}/${name}`
}
