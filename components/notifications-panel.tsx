"use client"
import { Bell, Check, Package, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

interface Notification {
  id: string
  type: "inquiry" | "approval" | "order" | "alert"
  title: string
  message: string
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
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

export function NotificationsPanel() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length
  const isMobile = useIsMobile()

  const NotificationContent = () => (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 z-10" style={{ backgroundColor: "#005180" }}>
        <h3 className="font-semibold text-base text-white">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-sm text-white hover:text-white hover:bg-white/20 touch-manipulation"
          >
            Mark all read
          </Button>
        )}
      </div>
      <ScrollArea className="h-[min(60vh,420px)]">
        <div className="divide-y divide-gray-200">
          {mockNotifications.map((notification) => (
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
      </ScrollArea>
      <div className="border-t p-3 bg-gray-50 sticky bottom-0">
        <Button
          variant="ghost"
          className="w-full text-sm hover:bg-[#005180]/10 touch-manipulation"
          style={{ color: "#005180" }}
        >
          View all notifications
        </Button>
      </div>
    </>
  )

  const TriggerButton = () => (
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

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <TriggerButton />
        </SheetTrigger>
        <SheetContent side="right" className="w-[90vw] max-w-[420px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TriggerButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),420px)] p-0" sideOffset={8} alignOffset={-8}>
        <NotificationContent />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
