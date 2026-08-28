export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-svh overflow-hidden">{children}</div>
}
