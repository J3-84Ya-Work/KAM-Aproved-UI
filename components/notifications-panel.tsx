"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Package, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"

interface Notification {
  id: string
  type: "inquiry" | "approval" | "order" | "alert"
  title: string
  message: string
  time: string
  read: boolean
}

export const notificationsData: Notification[] = [
  {
    id: "1",
    type: "inquiry",
    title: "New Inquiry",
    message: "Acme Corp requested a quote for 10,000 units",
    time: "5m ago",
    read: false,
  },
  {
    id: "2",
    type: "approval",
    title: "Quote Approved",
    message: "Your quote #Q-2024-156 has been approved",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    type: "order",
    title: "Order Dispatched",
    message: "Order #ORD-2024-089 has been dispatched",
    time: "3h ago",
    read: false,
  },
  {
    id: "4",
    type: "alert",
    title: "Low Margin Alert",
    message: "Quote #Q-2024-155 has margin below 15%",
    time: "5h ago",
    read: true,
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "inquiry":
      return <FileText className="h-5 w-5 text-[#005180]" />
    case "approval":
      return <Check className="h-5 w-5 text-[#78BE20]" />
    case "order":
      return <Package className="h-5 w-5 text-[#005180]" />
    case "alert":
      return <AlertCircle className="h-5 w-5 text-[#B92221]" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

export function NotificationsList({ notifications = notificationsData }: { notifications?: Notification[] }) {
  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          className={`flex gap-3 p-4 transition-colors hover:bg-gray-50 cursor-pointer w-full text-left touch-manipulation active:bg-gray-100 ${
            !notification.read ? "bg-[#005180]/5" : ""
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm leading-tight text-gray-900">{notification.title}</h4>
              {!notification.read && <div className="h-2 w-2 rounded-full bg-[#B92221] flex-shrink-0 mt-1" />}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-1">{notification.message}</p>
            <span className="text-xs text-gray-500">{notification.time}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function NotificationContent({ onViewAll }: { onViewAll: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 z-10" style={{ backgroundColor: "#005180" }}>
        <h3 className="font-semibold text-base text-white">Notifications</h3>
      </div>
      <ScrollArea className="h-[min(60vh,420px)]">
        <NotificationsList notifications={notificationsData} />
      </ScrollArea>
      <div className="border-t p-3 bg-gray-50 sticky bottom-0">
        <Button
          variant="ghost"
          className="w-full text-sm hover:bg-[#005180]/10 touch-manipulation"
          style={{ color: "#005180" }}
          onClick={onViewAll}
        >
          View all notifications
        </Button>
      </div>
    </>
  )
}

export function NotificationsPanel() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const unreadCount = notificationsData.filter((n) => !n.read).length

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-11 w-11 rounded-full hover:bg-accent touch-manipulation active:scale-95 transition-transform"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-[#005180]" />
      {unreadCount > 0 && (
        <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-[#B92221] px-1.5 text-xs font-bold text-white flex items-center justify-center border-2 border-white shadow-sm pointer-events-none">
          {unreadCount}
        </Badge>
      )}
    </Button>
  )

  const handleViewAll = () => {
    setOpen(false)
    router.push("/notifications")
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="right" className="w-[90vw] max-w-[420px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationContent onViewAll={handleViewAll} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-2rem),420px)] p-0 rounded-3xl border border-border shadow-2xl"
      >
        <NotificationContent onViewAll={handleViewAll} />
      </PopoverContent>
    </Popover>
  )
}
