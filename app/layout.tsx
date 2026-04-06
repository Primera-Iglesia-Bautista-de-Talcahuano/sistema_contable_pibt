import type { Metadata } from "next";
import { Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema Contable Iglesia",
  description: "MVP local de contabilidad para iglesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn(manrope.variable, "font-sans", geist.variable)}>
      <body className="antialiased min-h-screen font-sans bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
