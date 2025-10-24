"use client"
import { NotificationsPanel } from "@/components/notifications-panel"
import Image from "next/image"
import { ArrowLeft, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  pageName?: string
  showBackButton?: boolean
  onMenuClick?: () => void
}

export function AppHeader({ pageName, showBackButton = false, onMenuClick }: AppHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 flex h-14 md:h-16 items-center justify-between border-b border-border bg-white px-3 md:px-6 shadow-sm">
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        {/* Hamburger Menu - Mobile Only - Top Left */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100 md:hidden shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 md:h-9 md:w-9 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
        <Image
          src="/images/parkbuddy-logo.jpg"
          alt="Park Buddy"
          width={36}
          height={36}
          className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-contain shrink-0"
        />
        {pageName && <h1 className="text-base md:text-lg font-semibold text-foreground truncate ml-1">{pageName}</h1>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationsPanel />
      </div>
    </header>
  )
}
