import type { Metadata, Viewport } from 'next'
import { Geist, Oswald } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ContactProvider } from '@/components/contact-provider'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const oswald = Oswald({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Coiffeurs 225 — Réservez le meilleur barbier à Abidjan',
  description:
    "Réservez les coiffeurs et barbiers les mieux notés d'Abidjan, commandez votre kit de coiffure homme, abonnez-vous et téléchargez l'application mobile.",
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1714',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${oswald.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ContactProvider>{children}</ContactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
