import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employee Portal',
  description: 'Employee Portal with Hebrew RTL support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
