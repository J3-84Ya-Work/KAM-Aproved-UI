import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { FontSizeProvider } from "@/lib/font-size-context"
import { SplashScreen } from "@/components/splash-screen"
import { Toaster } from "@/components/ui/sonner"
// import { ScreenshotPrevention } from "@/components/screenshot-prevention"

export const metadata: Metadata = {
  title: "ParkBuddy",
  description: "ParkBuddy - Key Account Manager Dashboard",
  generator: "v0.app",
  icons: {
    icon: "/images/parkbuddy-logo.jpg",
    shortcut: "/images/parkbuddy-logo.jpg",
    apple: "/images/parkbuddy-logo.jpg",
  },
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
        {/* <ScreenshotPrevention /> */}
        <SplashScreen />
        <FontSizeProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </FontSizeProvider>
        <Toaster />
      </body>
    </html>
  )
}
