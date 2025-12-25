"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ProjectsContent } from "@/components/projects-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { ProjectBriefingForm, ProjectBriefingData } from "@/components/project-briefing-form"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { isKAM } from "@/lib/permissions"
import { clientLogger } from "@/lib/logger"

export default function ProjectsPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [showProjectBriefing, setShowProjectBriefing] = useState(false)
  const [projectType, setProjectType] = useState<"JDO" | "Commercial" | "SDO" | "PN" | null>(null)

  // Check if user is KAM (can create new records)
  const userIsKAM = isKAM()

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
    router.push('/projects/new?type=SDO')
  }

  const handleNewJDO = () => {
    router.push('/projects/new?type=JDO')
  }

  const handleNewCommercial = () => {
    router.push('/projects/new?type=Commercial')
  }

  const handleNewPN = () => {
    router.push('/projects/new?type=PN')
  }

  const handleProjectBriefingSubmit = (data: ProjectBriefingData) => {
    clientLogger.log(`Creating new ${projectType}:`, data)
    // TODO: Save project briefing data to database/API
    // TODO: Navigate to next step or show success message
    alert(`✅ ${projectType} Project Briefing saved successfully!\n\nNext: Create the actual ${projectType} order.`)
  }

  // Dynamic actions based on active tab
  const getActions = () => {
    const commonActions = [
      { label: "Export", onClick: handleExport },
    ]

    // Only KAM users can create new records
    const showNewButtons = userIsKAM

    switch (activeTab) {
      case "sdo":
        return [
          ...(showNewButtons ? [{ label: "New SDO", onClick: handleNewSDO }] : []),
          { label: "View JDO", onClick: handleViewJDO },
          { label: "View Commercial", onClick: handleViewCommercial },
          { label: "View PN", onClick: handleViewPN },
          ...commonActions,
        ]
      case "jdo":
        return [
          ...(showNewButtons ? [{ label: "New JDO", onClick: handleNewJDO }] : []),
          { label: "View SDO", onClick: handleViewSDO },
          { label: "View Commercial", onClick: handleViewCommercial },
          { label: "View PN", onClick: handleViewPN },
          ...commonActions,
        ]
      case "commercial":
        return [
          ...(showNewButtons ? [{ label: "New Commercial", onClick: handleNewCommercial }] : []),
          { label: "View SDO", onClick: handleViewSDO },
          { label: "View JDO", onClick: handleViewJDO },
          { label: "View PN", onClick: handleViewPN },
          ...commonActions,
        ]
      case "pn":
        return [
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
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Projects" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 overflow-auto">
          <ProjectsContent activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* Project Briefing Form Dialog */}
      <ProjectBriefingForm
        open={showProjectBriefing}
        onOpenChange={setShowProjectBriefing}
        onSubmit={handleProjectBriefingSubmit}
        docNumber={`FDMKT-${projectType}-${Date.now().toString().slice(-6)}`}
        projectType={projectType}
      />
    </SidebarProvider>
  )
}
