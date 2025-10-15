"use client"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RecentChats } from "@/components/recent-chats"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { AppHeader } from "@/components/app-header"
import { FloatingActionButton } from "@/components/floating-action-button"

export default function ChatsPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleNewChat = () => {
    console.log("[v0] Redirecting to root page for new chat")
    router.push("/")
  }

  const handleOpenChat = (chatId: string) => {
    console.log("[v0] Redirecting to root page for chat:", chatId)
    router.push(`/?chatId=${chatId}`)
  }

  const handleExport = () => {
    alert("Export functionality will download all drafts as CSV/Excel")
  }

  const actions = [
    { label: "New Chat", onClick: handleNewChat },
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
        <AppHeader pageName="Drafts" onMenuClick={handleMenuClick} />
        <div className="h-screen pb-16 md:pb-0">
          <RecentChats onNewChat={handleNewChat} onOpenChat={handleOpenChat} />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
