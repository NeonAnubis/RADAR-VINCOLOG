import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/lib/providers/QueryProvider'
import ThemeProvider from '@/lib/providers/ThemeProvider'
import I18nProvider from '@/lib/i18n/I18nProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RADAR VINCOLOG — Torre de Controle Logístico',
  description: 'Gestão e rastreamento de fretes em tempo real',
}

// Runs synchronously BEFORE React hydrates so <html data-theme> and <html lang>
// already reflect the user's stored preference — no flash, no hydration fight.
const earlyInit = `
(function() {
  try {
    var t = localStorage.getItem('radar-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
    var l = localStorage.getItem('radar-locale');
    if (l === 'pt' || l === 'en') {
      document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';
    }
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyInit }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
