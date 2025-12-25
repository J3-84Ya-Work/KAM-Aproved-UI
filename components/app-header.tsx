"use client"
import { NotificationsPanel } from "@/components/notifications-panel"
import Image from "next/image"
import { ArrowLeft, MessageSquarePlus, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface AppHeaderProps {
  pageName?: string
  showBackButton?: boolean
  showNewChatButton?: boolean
  onBackClick?: () => void
  onNewChatClick?: () => void
  onMenuClick?: () => void
}

export function AppHeader({ pageName, showBackButton = false, showNewChatButton = false, onBackClick, onNewChatClick }: AppHeaderProps) {
  const router = useRouter()

  const handleNewChat = () => {
    if (onNewChatClick) {
      onNewChatClick()
    } else {
      router.push('/')
    }
  }

  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      // Check if there's history to go back to, otherwise go to home
      if (window.history.length > 1) {
        // Check if previous page is login/logout - if so, go to home
        const referrer = document.referrer
        if (referrer && (referrer.includes('/login') || referrer.includes('/logout') || referrer.includes('/auth'))) {
          router.push('/')
        } else {
          router.back()
        }
      } else {
        // No history, go to home
        router.push('/')
      }
    }
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 md:h-16 items-center justify-between border-b border-border bg-white px-3 md:px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        {/* Hamburger Menu - Mobile Only - Top Left */}
        <SidebarTrigger className="h-8 w-8 md:hidden shrink-0" />

        {showBackButton && !showNewChatButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8 md:h-9 md:w-9 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
        {!showBackButton && !showNewChatButton && (
          <Image
            src="/images/parkbuddy-logo.jpg"
            alt="Park Buddy"
            width={36}
            height={36}
            className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-contain shrink-0"
          />
        )}
        {pageName && <h1 className="text-base md:text-lg font-semibold text-foreground truncate ml-1">{pageName}</h1>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Show New Chat button only when showNewChatButton is true (on chat pages) */}
        {showNewChatButton ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            className="h-8 w-8 md:h-9 md:w-9 hover:bg-gray-100"
            title="New Chat"
          >
            <MessageSquarePlus className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReload}
            className="h-8 w-8 md:h-9 md:w-9 hover:bg-gray-100"
            title="Refresh page"
          >
            <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
        <NotificationsPanel />
      </div>
    </header>
  )
}
