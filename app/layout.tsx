import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClientBootWrapper } from '@/components/ClientBootWrapper'
import './globals.css'

// Fontes mandatorias de identidade ZVISION
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ZVISION | CRM de Inteligencia Tatica',
  description: 'CRM de inteligencia tatica para agencias de alto ticket.',
  icons: {
    icon: [
      { url: '/icon-dark-32x32.png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='pt-BR' className='dark'>
      <body className={[spaceGrotesk.variable, jetbrainsMono.variable, 'font-sans antialiased bg-background text-foreground min-h-screen'].join(' ')}>
        <ClientBootWrapper>
          {children}
        </ClientBootWrapper>
        <Analytics />
      </body>
    </html>
  )
}