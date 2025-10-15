"use client"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChatListSkeleton } from "@/components/loading-skeleton"

interface Chat {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline?: boolean
}

const getAvatarColor = (name: string) => {
  const firstLetter = name.charAt(0).toUpperCase()
  const charCode = firstLetter.charCodeAt(0)

  const colors = [
    "#B92221", // Burgundy
    "#8B2E39", // Dark Red
    "#5D3A51", // Purple
    "#2F4669", // Dark Blue
    "#005180", // Blue
    "#0F5F74", // Teal
    "#5AA538", // Green
    "#69B12C", // Light Green
    "#78BE20", // Bright Green
  ]
  const index = charCode % colors.length
  return colors[index]
}

export function RecentChats({
  onNewChat,
  onOpenChat,
}: { onNewChat?: () => void; onOpenChat?: (chatId: string) => void }) {
  const [isLoading, setIsLoading] = useState(true)
  const [chats] = useState<Chat[]>([
    {
      id: "1",
      name: "Office Renovation",
      lastMessage: "I need a quote for renovating a 2000 sq ft office space...",
      timestamp: "2:30 PM",
      unreadCount: 3,
      isOnline: true,
    },
    {
      id: "2",
      name: "Residential Project",
      lastMessage: "Looking for cost estimates on a 3-bedroom house...",
      timestamp: "Yesterday",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: "3",
      name: "Commercial Building",
      lastMessage: "Need pricing for a 5-story commercial building...",
      timestamp: "Monday",
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: "4",
      name: "Interior Design",
      lastMessage: "What would be the cost for interior design services...",
      timestamp: "Sunday",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: "5",
      name: "Kitchen Remodel",
      lastMessage: "Can you help me estimate the cost for a kitchen renovation?",
      timestamp: "Saturday",
      unreadCount: 0,
      isOnline: false,
    },
  ])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleChatClick = (chatId: string) => {
    console.log("[v0] Chat item clicked:", chatId)
    if (onOpenChat) {
      onOpenChat(chatId)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatListSkeleton />
        ) : chats.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center animate-fade-in">
            <div className="text-6xl">💬</div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No drafts yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Start a new conversation to get cost estimates</p>
            </div>
            {onNewChat ? (
              <Button size="lg" className="gap-2 mt-2 modern-button" onClick={onNewChat}>
                <Plus className="h-5 w-5" />
                Start a Chat
              </Button>
            ) : (
              <Link href="/chat/new">
                <Button size="lg" className="gap-2 mt-2 modern-button">
                  <Plus className="h-5 w-5" />
                  Start a Chat
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chats.map((chat, index) => {
              const chatContent = (
                <div
                  key={chat.id} // Added key property here
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted active:bg-accent transition-all duration-200 cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onOpenChat && handleChatClick(chat.id)}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center font-semibold text-base text-white ring-2 ring-background shadow-sm"
                      style={{ backgroundColor: getAvatarColor(chat.name) }}
                    >
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-base truncate">{chat.name}</h3>
                      <span
                        className={`text-xs flex-shrink-0 ${chat.unreadCount > 0 ? "font-semibold" : "text-muted-foreground"}`}
                        style={{ color: chat.unreadCount > 0 ? "#0F5F74" : undefined }}
                      >
                        {chat.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <Badge
                          className="h-5 min-w-5 rounded-full px-2 text-xs font-semibold text-white flex items-center justify-center shadow-sm animate-scale-in"
                          style={{ backgroundColor: "#2F4669" }}
                        >
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )

              return onOpenChat ? (
                <div key={chat.id}>{chatContent}</div>
              ) : (
                <Link key={chat.id} href={`/chat/${chat.id}`}>
                  {chatContent}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
