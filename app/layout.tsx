import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Raíces Verdes - Comercio Justo Indígena',
  description: 'Plataforma para productores indígenas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} bg-amber-50 text-green-900 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-green-800 text-amber-50 p-4 text-center">
          <p>© {new Date().getFullYear()} Raíces Verdes - Comercio Justo Indígena</p>
        </footer>
      </body>
    </html>
  )
}
