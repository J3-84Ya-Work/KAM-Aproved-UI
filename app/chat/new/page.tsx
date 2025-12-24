"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AICostingChat } from "@/components/ai-costing-chat"
import { NewChatWelcome } from "@/components/new-chat-welcome"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { AppHeader } from "@/components/app-header"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function NewChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)

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
    // Go to home screen
    router.push('/')
  }

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader
          showBackButton={!showChat}
          showNewChatButton={showChat}
          onNewChatClick={handleNewChat}
        />
        <div className={`${showChat ? "pb-16 md:pb-0" : "h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]"}`}>
          {showChat ? <AICostingChat initialMessage={initialMessage} /> : <NewChatWelcome />}
        </div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
