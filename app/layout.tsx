import type { Metadata, Viewport } from 'next'
import './globals.css'

/**
 * Root layout for the Prayer Dashboard
 * Configured for Google Nest Hub display (1024x600)
 */

export const metadata: Metadata = {
  title: 'Prayer Times Dashboard',
  description: 'Islamic prayer times display for Google Nest Hub',
  // Prevent indexing (private display)
  robots: 'noindex, nofollow',
}

export const viewport: Viewport = {
  // Optimize for Nest Hub 7" display
  width: 1024,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Dark theme for OLED-friendly display
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className="dark">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prevent screen from sleeping (for always-on display) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
