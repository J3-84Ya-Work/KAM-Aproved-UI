"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { AppHeader } from "@/components/app-header"
import { FloatingActionButton } from "@/components/floating-action-button"
import { DraftsContent } from "@/components/drafts-content"

export default function ChatsPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleExport = () => {
    alert("Export functionality will download all drafts as CSV/Excel")
  }

  const actions = [
    { label: "New Inquiry", onClick: () => router.push("/?autoStart=true") },
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
        <AppHeader pageName="Drafts" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          <DraftsContent />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
