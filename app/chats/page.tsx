"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock } from "lucide-react"
import { getConversations, Conversation } from "@/lib/chat-api"
import { formatDistanceToNow } from "date-fns"
import { clientLogger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/permissions"

export default function ChatsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Get current user
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      // Don't fetch if we haven't loaded user data yet
      if (!currentUser) {
        clientLogger.log('Waiting for user data before fetching conversations')
        return
      }

      setLoading(true)
      try {
        const userId = currentUser?.userId || '2'
        const companyId = currentUser?.companyId || '2'

        console.log('🔍 CURRENT USER DATA:', currentUser)
        console.log('🔍 Using userId:', userId, 'companyId:', companyId)
        clientLogger.log('Fetching conversations for userId:', userId, 'companyId:', companyId)
        const result = await getConversations(String(userId), String(companyId))

        if (result.success && result.data) {
          clientLogger.log('Conversations fetched:', result.data)
          setConversations(result.data)
        } else {
          clientLogger.error('Failed to fetch conversations:', result.error)
        }
      } catch (error) {
        clientLogger.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [currentUser])

  // Handle New Chat button - navigate to home page
  const handleNewChat = () => {
    router.push('/')
  }

  // Navigate to conversation page when clicked
  const handleConversationClick = (conversation: Conversation) => {
    console.log('🔍 Conversation clicked:', conversation)
    router.push(`/chats/${conversation.conversationId}`)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader pageName="Chats" />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 max-w-4xl mx-auto w-full">
          <Card className="flex flex-col h-[calc(100vh-180px)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversations
                  {conversations.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {conversations.length}
                    </Badge>
                  )}
                </CardTitle>
                <button
                  onClick={handleNewChat}
                  className="mt-3 w-full px-4 py-2 bg-[#005180] text-white rounded-lg hover:bg-[#004166] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  New Chat
                </button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading conversations...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-2 p-4">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.conversationId}
                          onClick={() => handleConversationClick(conversation)}
                          className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-white border-gray-200 hover:border-[#005180] hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm truncate">
                              {conversation.title || `Conversation #${conversation.conversationId}`}
                            </h3>
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs truncate mb-2 text-gray-600">
                              {conversation.lastMessage}
                            </p>
                          )}
                          {conversation.lastMessageTime && (
                            <p className="text-xs flex items-center gap-1 text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
