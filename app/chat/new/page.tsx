"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ParkBuddyChat } from "@/components/parkbuddy-chat"
import { NewChatWelcome } from "@/components/new-chat-welcome"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { AppHeader } from "@/components/app-header"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

export default function NewChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setInitialMessage(message)
      setShowChat(true)
    } else {
      setShowChat(false)
    }
  }, [searchParams])

  const handleNewChat = () => {
    router.push('/')
  }

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
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader
          showBackButton={!showChat}
          showNewChatButton={showChat}
          onNewChatClick={handleNewChat}
          onMenuClick={handleMenuClick}
          pageName="ParkBuddy"
        />
        <div className="h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)] overflow-hidden">
          {showChat ? <ParkBuddyChat initialMessage={initialMessage} /> : <NewChatWelcome />}
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
