import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { FontSizeProvider } from "@/lib/font-size-context"
import { SplashScreen } from "@/components/splash-screen"

export const metadata: Metadata = {
  title: "ParkBuddy",
  description: "ParkBuddy - Key Account Manager Dashboard",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }}
    >
      <body className="font-sans antialiased">
        <SplashScreen />
        <FontSizeProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </FontSizeProvider>
        <Analytics />
      </body>
    </html>
  )
}
