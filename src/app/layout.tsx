import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getUserLocale } from '@/lib/locale'
import { BottomBar } from '@/components/layout/BottomBar'
import { Container } from '@/components/layout/Container'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Miru - AI恋愛オーケストレーションシステム',
  description: '「付き合えるかもしれない」希望を可視化する恋愛サポートアプリ',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = getUserLocale()
  const messages = (await import(`../../messages/${locale}.json`)).default

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-bg-primary min-h-screen font-sans text-text-primary`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1 safe-top">
                <Container>
                  {children}
                </Container>
              </main>
              <BottomBar />
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}