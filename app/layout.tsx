import type { Metadata } from "next"
import { Manrope, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Sistema Contable Iglesia",
  description: "Sistema de contabilidad para iglesia"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={cn(inter.variable, manrope.variable)}>
      <body className="antialiased min-h-screen font-sans bg-background text-on-surface">
        {children}
      </body>
    </html>
  )
}
