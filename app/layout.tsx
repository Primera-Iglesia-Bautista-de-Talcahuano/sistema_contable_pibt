import type { Metadata } from "next"
import { Roboto, Roboto_Slab } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap"
})

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-roboto-slab",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Sistema Contable Iglesia",
  description: "Sistema de contabilidad para iglesia"
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("pibt-theme")?.value

  return (
    <html
      lang="es"
      className={cn(roboto.variable, robotoSlab.variable)}
      {...(theme === "dark" ? { "data-theme": "dark" } : {})}
    >
      <body className="antialiased min-h-screen font-sans bg-background text-on-surface">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
