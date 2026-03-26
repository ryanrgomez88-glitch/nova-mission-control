import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Nova Mission Control',
  description: "Ryan's AI command center",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
