import type { Metadata } from 'next'
import { Cinzel, Crimson_Pro } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700'],
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'LoreForge — Construa universos extraordinários',
  description: 'Inteligência artificial para criadores de mundos. Crie lore, mapas, culturas e histórias com consistência profunda.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${crimsonPro.variable}`}>
      <body>{children}</body>
    </html>
  )
}