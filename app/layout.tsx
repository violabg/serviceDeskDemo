import type { Metadata } from "next"
import { Geist_Mono, IBM_Plex_Sans, Source_Sans_3 } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import "./globals.css"

const sourceSans3Heading = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-heading",
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Service Desk Demo",
  description: "Enterprise service desk demo app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        ibmPlexSans.variable,
        sourceSans3Heading.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
