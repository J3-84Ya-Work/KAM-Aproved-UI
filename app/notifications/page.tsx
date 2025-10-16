"use client"
import { useState, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NotificationsList, notificationsData } from "@/components/notifications-panel"

export default function NotificationsPage() {
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

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
        <AppHeader pageName="Notifications" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 max-w-full overflow-x-hidden">
          <Card className="border border-border/60">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold">Inbox</CardTitle>
              <CardDescription>Review alerts, approvals, and order updates in one place.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <NotificationsList notifications={notificationsData} />
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
