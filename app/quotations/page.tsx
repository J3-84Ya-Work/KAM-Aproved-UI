"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { QuotationsContent } from "@/components/quotations-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useState, useCallback } from "react"

export default function QuotationsPage() {
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleExport = () => {
    alert("Export functionality will download all quotations as CSV/Excel")
  }

  const handleCompareQuantity = () => {
    // Navigate to compare quantity page or open dialog
    alert("Compare Quantity feature - Compare pricing across different quantities")
    // TODO: Implement compare quantity functionality
  }

  const actions = [
    { label: "Compare Quantity", onClick: handleCompareQuantity },
    { label: "Export", onClick: handleExport },
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
        <AppHeader pageName="Quotations" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          <QuotationsContent />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
