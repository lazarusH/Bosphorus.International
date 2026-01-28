import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PWAProvider from './components/PWAProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bosphorus International - Student Certificate System',
  description: 'Student certificate management system for Bosphorus Cosmetology and Skin Care School',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <PWAProvider />
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </body>
    </html>
  )
}
