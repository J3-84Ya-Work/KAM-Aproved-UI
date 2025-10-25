"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ProjectsContent } from "@/components/projects-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { getViewableKAMs } from "@/lib/permissions"

export default function ProjectsPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const viewableKams = getViewableKAMs()
  const isKAM = viewableKams.length === 1 // KAM can only see themselves

  const handleExport = () => {
    alert("Export functionality will download all projects as CSV/Excel")
  }

  const [activeTab, setActiveTab] = useState("sdo")

  const handleViewJDO = () => {
    setActiveTab("jdo")
  }

  const handleViewCommercial = () => {
    setActiveTab("commercial")
  }

  const handleViewPN = () => {
    setActiveTab("pn")
  }

  const handleViewSDO = () => {
    setActiveTab("sdo")
  }

  const handleNewSDO = () => {
    alert("Create New SDO - Feature coming soon")
  }

  const handleNewJDO = () => {
    alert("Create New JDO - Feature coming soon")
  }

  const handleNewCommercial = () => {
    alert("Create New Commercial Order - Feature coming soon")
  }

  const handleNewPN = () => {
    alert("Create New PN Order - Feature coming soon")
  }

  // Dynamic actions based on active tab
  const getActions = () => {
    const commonActions = [
      { label: "Export", onClick: handleExport },
    ]

    switch (activeTab) {
      case "sdo":
        return [
          { label: "New SDO", onClick: handleNewSDO },
          { label: "View JDO", onClick: handleViewJDO },
          { label: "View Commercial", onClick: handleViewCommercial },
          { label: "View PN", onClick: handleViewPN },
          ...commonActions,
        ]
      case "jdo":
        return [
          { label: "New SDO", onClick: handleNewSDO },
          { label: "View SDO", onClick: handleViewSDO },
          { label: "View Commercial", onClick: handleViewCommercial },
          { label: "View PN", onClick: handleViewPN },
          ...commonActions,
        ]
      case "commercial":
        return [
          { label: "New SDO", onClick: handleNewSDO },
          { label: "View SDO", onClick: handleViewSDO },
          { label: "View JDO", onClick: handleViewJDO },
          { label: "View PN", onClick: handleViewPN },
          ...commonActions,
        ]
      case "pn":
        return [
          { label: "New SDO", onClick: handleNewSDO },
          { label: "View SDO", onClick: handleViewSDO },
          { label: "View JDO", onClick: handleViewJDO },
          { label: "View Commercial", onClick: handleViewCommercial },
          ...commonActions,
        ]
      default:
        return commonActions
    }
  }

  const actions = getActions()

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
          <ProjectsContent activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
