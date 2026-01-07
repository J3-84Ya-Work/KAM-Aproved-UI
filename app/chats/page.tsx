"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare } from "lucide-react"
import { getConversations, Conversation } from "@/lib/chat-api"
import { formatDistanceToNow } from "date-fns"
import { clientLogger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/permissions"
import { FloatingActionButton } from "@/components/floating-action-button"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function ChatsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

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
    console.log('🔍 Conversation ID:', conversation.conversationId)
    console.log('🔍 All conversation fields:', Object.keys(conversation))

    if (!conversation.conversationId) {
      console.error('❌ ERROR: conversationId is undefined!')
      console.error('Full conversation object:', JSON.stringify(conversation, null, 2))
      alert('Error: Cannot open conversation - ID is missing')
      return
    }

    router.push(`/chats/${conversation.conversationId}`)
  }

  const actions = [
    { label: "New Chat", onClick: handleNewChat }
  ]

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Conversations" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 overflow-auto">
          <Card className="surface-elevated overflow-hidden relative">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading conversations...</p>
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No conversations yet</p>
                    <p className="text-sm">Start a new chat to begin</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto relative z-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#005180] to-[#003d63] hover:bg-gradient-to-r hover:from-[#005180] hover:to-[#003d63]">
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                          Title
                        </TableHead>
                        <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                          Created
                        </TableHead>
                        <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                          Last Activity
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversations.map((conversation) => (
                        <TableRow
                          key={conversation.conversationId}
                          onClick={() => handleConversationClick(conversation)}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-[#005180] flex-shrink-0" />
                              <span className="font-medium">
                                {conversation.title || `Conversation #${conversation.conversationId}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-600">
                            {conversation.createdAt
                              ? formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })
                              : '-'}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-600">
                            {conversation.lastMessageTime
                              ? formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })
                              : conversation.createdAt
                              ? formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
