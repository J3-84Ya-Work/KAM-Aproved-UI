"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, User, ArrowLeft } from "lucide-react"
import { getMessages, Message } from "@/lib/chat-api"
import { formatDistanceToNow } from "date-fns"
import { clientLogger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/permissions"

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current user
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Fetch messages on load
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser) return

      setLoading(true)
      try {
        const userId = currentUser?.userId || '2'
        const companyId = currentUser?.companyId || '2'

        console.log('🔍 Fetching messages for conversationId:', conversationId, 'userId:', userId, 'companyId:', companyId)
        const result = await getMessages(Number(conversationId), String(userId), String(companyId))

        console.log('🔍 Messages API result:', result)

        if (result.success && result.data) {
          clientLogger.log('Messages fetched:', result.data)
          setMessages(result.data)
        } else {
          clientLogger.error('Failed to fetch messages:', result.error)
          setMessages([])
        }
      } catch (error) {
        clientLogger.error('Error fetching messages:', error)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [conversationId, currentUser])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message function
  const handleSendMessage = async () => {
    const text = inputMessage.trim()
    if (!text || isSending) return

    setIsSending(true)

    // Add user message to UI
    const userMessage: Message = {
      messageId: Date.now(),
      conversationId: Number(conversationId),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Add thinking indicator
    const thinkingMessage: Message = {
      messageId: Date.now() + 1,
      conversationId: Number(conversationId),
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      const userId = currentUser?.userId || '2'
      const companyId = currentUser?.companyId || '2'

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          newChat: false,
          conversationId: Number(conversationId),
          phone: '9999999999',
          userId,
          companyId
        })
      })

      const replyText = await response.text()

      // Remove thinking indicator and add actual response
      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.content !== 'Thinking...')
        return [...withoutThinking, {
          messageId: Date.now() + 2,
          conversationId: Number(conversationId),
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toISOString()
        }]
      })

    } catch (error) {
      clientLogger.error('Error sending message:', error)
      // Remove thinking indicator on error
      setMessages(prev => prev.filter(m => m.content !== 'Thinking...'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader
          pageName={`Conversation #${conversationId}`}
          showBackButton={true}
          onBackClick={() => router.push('/chats')}
        />
        <div className="flex flex-1 flex-col h-[calc(100vh-64px)]">
          <Card className="flex-1 m-4 flex flex-col">
            <CardContent className="flex-1 p-0 flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
                    <p>Loading messages...</p>
                  </div>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1">
                    <div className="space-y-4 p-4">
                      {messages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No messages yet</p>
                        </div>
                      )}
                      {messages.map((message) => (
                        <div
                          key={message.messageId}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.role === 'user'
                                ? 'bg-[#005180] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.content === 'Thinking...' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4" />
                                  <span className="text-xs font-semibold">
                                    {message.role === 'user' ? 'You' : 'Assistant'}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-2 ${
                                  message.role === 'user' ? 'text-gray-200' : 'text-gray-500'
                                }`}>
                                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005180]"
                        disabled={isSending}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isSending}
                        className="px-6 py-2 bg-[#005180] text-white rounded-lg hover:bg-[#004166] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
