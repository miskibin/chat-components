import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

/** ChatGPT ships Klim’s Söhne (paid). Inter is the closest webfont we can distribute. */
const fontSansUi = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans-ui",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Chat Components",
    template: "%s — Chat Components",
  },
  description:
    "A shadcn/ui registry of chat primitives: composer, message list, streaming markdown, sortable sidebar, and pickers.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSansUi.variable,
        fontMono.variable,
        fontSansUi.className
      )}
    >
      <body className="min-h-svh" suppressHydrationWarning>
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
}
