"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { InquiriesContent } from "@/components/inquiries-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useRouter } from "next/navigation"
import { useState, useCallback, useEffect } from "react"
import { canCreate } from "@/lib/permissions"

export default function InquiriesPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [showFAB, setShowFAB] = useState(false)

  useEffect(() => {
    // Check if user can create new inquiries (only KAM)
    setShowFAB(canCreate())
  }, [])

  const handleExport = () => {
    // Implement export functionality - for now, just show alert
    alert("Export functionality will download all inquiries as CSV/Excel")
  }

  const actions = [
    { label: "Draft", onClick: () => router.push("/chats") },
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
        <AppHeader pageName="Inquiries" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          <InquiriesContent />
        </div>
        {showFAB && <FloatingActionButton actions={actions} />}
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
