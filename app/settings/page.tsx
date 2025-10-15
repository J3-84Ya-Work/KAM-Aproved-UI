"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useFontSize } from "@/lib/font-size-context"
import { Type, Check } from "lucide-react"
import { useState, useCallback } from "react"

export default function SettingsPage() {
  const { fontSize, setFontSize } = useFontSize()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const fontSizes = [
    { value: "small" as const, label: "Small", description: "Compact text" },
    { value: "medium" as const, label: "Medium", description: "Standard size" },
    { value: "large" as const, label: "Large", description: "Default (Recommended)" },
  ]

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader pageName="Settings" showBackButton onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-4 p-3 pb-20 md:p-6 md:pb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                <CardTitle className="text-lg md:text-xl">Text Size</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Choose your preferred text size for better readability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setFontSize(size.value)}
                    className={`flex items-center justify-between rounded-lg border-2 p-4 min-h-[72px] transition-all active:scale-[0.98] ${
                      fontSize === size.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                    }`}
                  >
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="cursor-pointer font-semibold text-base">{size.label}</Label>
                        {fontSize === size.value && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{size.description}</p>
                    </div>
                    <div
                      className="font-semibold ml-4"
                      style={{
                        fontSize: size.value === "small" ? "20px" : size.value === "medium" ? "24px" : "28px",
                      }}
                    >
                      Aa
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">About</CardTitle>
              <CardDescription className="text-sm">Application information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground text-sm md:text-base">Version</span>
                <span className="font-medium text-sm md:text-base">1.0.0</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground text-sm md:text-base">Build</span>
                <span className="font-medium text-sm md:text-base">2024.01</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
