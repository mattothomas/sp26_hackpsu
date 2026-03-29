import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import GodMode from '@/components/GodMode'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CallMyBluff.tech',
  description: 'Stop flaking. We will find out.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Providers>
          {children}
          {/* GodMode persists across all pages — G→O→D to activate */}
          <GodMode />
        </Providers>
      </body>
    </html>
  )
}
