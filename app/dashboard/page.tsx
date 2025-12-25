"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardContent } from "@/components/dashboard-content-new"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { clientLogger } from "@/lib/logger"

export default function Page() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleExport = () => {
    // Export functionality - can be implemented later
    clientLogger.log("Exporting dashboard data...")
    alert("Export functionality will be implemented")
  }

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  const dashboardActions = [
    { label: "Export Report", onClick: handleExport },
  ]

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Analytics" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col pb-20 md:pb-6 overflow-auto">
          <DashboardContent />
        </div>
        <FloatingActionButton actions={dashboardActions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
