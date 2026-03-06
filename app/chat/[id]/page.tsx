"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ParkBuddyChat } from "@/components/parkbuddy-chat"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { AppHeader } from "@/components/app-header"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) toggleMenu()
  }

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader
          pageName="ParkBuddy"
          showBackButton={true}
          onBackClick={() => router.push('/chats')}
          onMenuClick={handleMenuClick}
        />
        <div className="h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)] overflow-hidden">
          <ParkBuddyChat />
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
