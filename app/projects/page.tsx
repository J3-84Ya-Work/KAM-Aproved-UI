"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ProjectsContent } from "@/components/projects-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

export default function ProjectsPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleExport = () => {
    alert("Export functionality will download all projects as CSV/Excel")
  }

  const actions = [
    { label: "New Project", onClick: () => router.push("/") },
    { label: "Refresh", onClick: () => window.location.reload() },
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
        <AppHeader pageName="Projects" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          <ProjectsContent />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
