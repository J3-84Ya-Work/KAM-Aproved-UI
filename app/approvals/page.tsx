"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ApprovalsContent } from "@/components/approvals-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useState, useCallback } from "react"

export default function ApprovalsPage() {
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const handleHistory = () => {
    setShowHistory(!showHistory)
  }

  const handleExport = () => {
    alert("Export functionality will download all approvals as CSV/Excel")
  }

  const actions = [
    { label: showHistory ? "Pending" : "History", onClick: handleHistory },
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
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName={showHistory ? "Approval History" : "Approvals & Escalations"} onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 overflow-auto">
          <ApprovalsContent showHistory={showHistory} />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
