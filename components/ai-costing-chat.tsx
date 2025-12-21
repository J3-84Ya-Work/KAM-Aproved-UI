"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Send, Loader2, Mic, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sendMessage } from "@/lib/chat-api"
import { useAutoSaveDraft } from "@/hooks/use-auto-save-draft"
import { clientLogger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isLoading?: boolean
  options?: string[]
  allowMultiSelect?: boolean  // Flag to enable multiple selection for this message
}

// Function to parse numbered options from message text
function parseOptions(text: string): { cleanText: string; options: string[] } {
  // Match patterns like "1. Option" or "1) Option" or "1 - Option"
  const optionRegex = /^\s*(\d+)[\.\)]\s*(.+)$/gm
  const matches = [...text.matchAll(optionRegex)]

  if (matches.length >= 2) {
    // Found multiple numbered options
    const options = matches.map(match => match[2].trim())

    // Extract the text before options (if any)
    const firstMatchIndex = text.indexOf(matches[0][0])
    const textBeforeOptions = text.substring(0, firstMatchIndex).trim()

    return {
      cleanText: textBeforeOptions,
      options: options
    }
  }

  return { cleanText: text, options: [] }
}

export function AICostingChat({
  chatId,
  initialMessage,
  onBackToWelcome,
  loadedDraftData,
}: {
  chatId?: string | null
  initialMessage?: string | null
  onBackToWelcome?: () => void
  loadedDraftData?: any
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({}) // Track multi-select per message
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Track loaded draft ID for updates
  const [loadedDraftId, setLoadedDraftId] = useState<number | null>(null)

  // Track if this is a new chat (first message should send newChat: true)
  const [isNewChat, setIsNewChat] = useState(true)

  // Track if initial message has been sent to prevent duplicate sends
  const initialMessageSentRef = useRef(false)

  // Prepare form data for auto-save
  const formData = {
    conversationType: 'DynamicFill',
    messages: messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: msg.timestamp.toISOString(), // Convert Date to string for JSON serialization
      options: msg.options,
    })),
    currentInput: inputValue,
    chatId: chatId,
  }

  // Log formData when messages change for debugging
  useEffect(() => {
    if (messages.length > 0) {
      clientLogger.log('[AI Chat] FormData for auto-save:', {
        messageCount: messages.length,
        hasInput: !!inputValue,
        chatId: chatId,
      })
    }
  }, [messages, inputValue, chatId])

  // Auto-save hook
  useAutoSaveDraft({
    formData,
    formType: 'DynamicFill',
    draftName: `AI_Chat_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}`,
    enabled: messages.length > 0, // Only save if there are messages
    debounceMs: 2000,  // Save 2 seconds after user stops typing
    initialDraftId: loadedDraftId,  // Pass the loaded draft ID for updates
    onSaveSuccess: (draftId) => {
      clientLogger.log('[AI Chat] Draft saved/updated with ID:', draftId)
      // Update the loaded draft ID if this was a new save
      if (!loadedDraftId && draftId) {
        setLoadedDraftId(draftId)
      }
    },
    onSaveError: (error) => {
      clientLogger.error('[AI Chat] Failed to save draft:', error)
    },
  })

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputValue((prev) => prev + (prev ? ' ' : '') + transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          clientLogger.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const sendChatMessage = useCallback(
    async (messageText: string, { showUserMessage = true }: { showUserMessage?: boolean } = {}) => {
      const content = messageText.trim()
      if (!content) return

      const timestamp = new Date()

      // Show user message in the chat
      if (showUserMessage) {
        const userMessage: Message = {
          id: `${Date.now()}-user`,
          content,
          sender: "user",
          timestamp,
        }
        setMessages((prev) => [...prev, userMessage])
      }

      setIsTyping(true)

      try {
        // Send the actual user message to API
        const messageToAPI = content

        // Send newChat: true for the first message from home
        const response = await sendMessage(messageToAPI, 2, '9999999999', isNewChat)

        // After first message is sent, set isNewChat to false
        if (isNewChat) {
          setIsNewChat(false)
        }

        if (response.success && response.data) {
          const aiResponseText =
            response.data.reply ||
            response.data.message ||
            response.data.response ||
            response.data.text ||
            (typeof response.data === "string" ? response.data : null) ||
            JSON.stringify(response.data)

          // Check if the message contains "select" (case-insensitive)
          const shouldShowButtons = /select/i.test(aiResponseText)
          // Check if multi-select should be enabled for processes
          const isMultiSelect = /select\s+processes/i.test(aiResponseText)
          const { cleanText, options } = parseOptions(aiResponseText)

          const aiMessage: Message = {
            id: `${Date.now()}-ai`,
            content: shouldShowButtons && options.length > 0 ? cleanText : aiResponseText,
            sender: "ai",
            timestamp: new Date(),
            options: shouldShowButtons && options.length > 0 ? options : undefined,
            allowMultiSelect: isMultiSelect,
          }
          setMessages((prev) => [...prev, aiMessage])
        } else {
          const errorMessage: Message = {
            id: `${Date.now()}-error`,
            content: `Error: ${response.error || "Failed to connect to chat engine"}`,
            sender: "ai",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      } catch (error) {
        const errorMessage: Message = {
          id: `${Date.now()}-exception`,
          content: "An unexpected error occurred. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    },
    [isNewChat]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)

      // Check if we need to load a draft
      const urlParams = new URLSearchParams(window.location.search)
      const shouldLoadDraft = urlParams.get('loadDraft') === 'true'

      if (shouldLoadDraft) {
        const draftDataStr = sessionStorage.getItem('loadedDraft')
        if (draftDataStr) {
          try {
            const draftData = JSON.parse(draftDataStr)

            clientLogger.log('[AI Chat] Loading draft data:', draftData)

            // The draft data is flat at the top level with FormType added
            // Extract the loaded draft ID
            if (draftData.LoadedDraftID) {
              setLoadedDraftId(draftData.LoadedDraftID)
              clientLogger.log('[AI Chat] Set loaded draft ID:', draftData.LoadedDraftID)
            }

            // Restore messages (convert timestamp strings back to Date objects)
            if (draftData.messages && Array.isArray(draftData.messages)) {
              const restoredMessages = draftData.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp), // Convert string back to Date
              }))
              setMessages(restoredMessages)
              clientLogger.log('[AI Chat] Restored messages:', restoredMessages.length)

              // If we have restored messages, this is not a new chat
              if (restoredMessages.length > 0) {
                setIsNewChat(false)
              }
            }

            // Restore current input
            if (draftData.currentInput) {
              setInputValue(draftData.currentInput)
            }

            // Note: chatId is passed as a prop, so we don't restore it from draft
            // The component will use the chatId prop if provided

            // Clear session storage after loading
            sessionStorage.removeItem('loadedDraft')

            clientLogger.log('[AI Chat] Draft loaded successfully')

            // Show toast notification (create a custom event since we can't use toast hook in timeout)
            setTimeout(() => {
              const toastEvent = new CustomEvent('show-toast', {
                detail: {
                  title: "Draft Loaded",
                  description: "Your conversation has been restored. Continue where you left off.",
                }
              })
              window.dispatchEvent(toastEvent)
            }, 100)
          } catch (error) {
            clientLogger.error('[AI Chat] Failed to parse draft data:', error)
          }
        }
      } else if (initialMessage && !initialMessageSentRef.current) {
        // Send the initial message
        initialMessageSentRef.current = true
        sendChatMessage(initialMessage)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [initialMessage, sendChatMessage])

  // Auto-scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    const scrollToBottom = () => {
      // Method 1: Scroll using messagesEndRef (most reliable)
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' })
      }

      // Method 2: Fallback - scroll container directly
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }

    // Immediate scroll
    scrollToBottom()

    // Multiple delayed scrolls to handle long content rendering
    const timers = [
      setTimeout(scrollToBottom, 50),
      setTimeout(scrollToBottom, 150),
      setTimeout(scrollToBottom, 300),
      setTimeout(scrollToBottom, 500),
      setTimeout(scrollToBottom, 1000)
    ]

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const messageText = inputValue
    setInputValue("")
    sendChatMessage(messageText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // On desktop: Enter sends, Shift+Enter adds new line
    // On mobile: Let Enter add new line, user clicks send button
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault()
      handleSendMessage()
    }
    // On mobile, Enter always creates new line
  }

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      })
    }
  }

  // Long press handlers
  const handleLongPressStart = (content: string, messageId: string) => {
    const timer = setTimeout(() => {
      handleCopyMessage(content, messageId)
    }, 500) // 500ms long press
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        clientLogger.error('Error starting speech recognition:', error)
      }
    }
  }

  const handleOptionSelect = (option: string, messageId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      // Toggle option in multi-select mode
      setSelectedOptions(prev => {
        const currentSelections = prev[messageId] || []
        const isSelected = currentSelections.includes(option)

        if (isSelected) {
          // Remove option
          return {
            ...prev,
            [messageId]: currentSelections.filter(opt => opt !== option)
          }
        } else {
          // Add option
          return {
            ...prev,
            [messageId]: [...currentSelections, option]
          }
        }
      })
    } else {
      // Single select - send immediately
      sendChatMessage(option)

      // Force scroll after option is selected
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }
      }, 100)
    }
  }

  const handleMultiSelectSubmit = (messageId: string) => {
    const selections = selectedOptions[messageId] || []
    if (selections.length > 0) {
      // Join selected options with comma
      const message = selections.join(', ')
      sendChatMessage(message)

      // Clear selections for this message
      setSelectedOptions(prev => {
        const newState = { ...prev }
        delete newState[messageId]
        return newState
      })

      // Force scroll
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }
      }, 100)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border/50 bg-background px-4 py-3">
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Initializing AI Assistant...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] max-w-[600px] mx-auto flex-col bg-background overflow-hidden pb-16 md:pb-0">
      {/* Scrollable Chat Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
        <div className="space-y-4 px-4 py-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="message-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} w-full pr-2`}>
                <div className="relative group max-w-[85%] md:max-w-[80%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm whitespace-pre-wrap break-words cursor-pointer transition-all active:scale-95 ${
                      message.sender === "user"
                        ? "bg-blue text-white"
                        : "bg-blue-5 text-foreground"
                    } ${copiedMessageId === message.id ? "ring-2 ring-green-500" : ""}`}
                    onMouseDown={() => handleLongPressStart(message.content, message.id)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(message.content, message.id)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                  >
                    {message.content}
                  </div>

                  {/* Show check icon when copied */}
                  {copiedMessageId === message.id && (
                    <div className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center bg-green-500 rounded-full shadow-sm">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Display option buttons only when message contains "select" */}
              {message.options && message.options.length > 0 && (
                <div className="flex flex-col gap-2 mt-3 ml-0">
                  {message.options.map((option, optionIndex) => {
                    const isMultiSelect = message.allowMultiSelect || false
                    const isSelected = isMultiSelect && (selectedOptions[message.id] || []).includes(option)

                    return (
                      <Button
                        key={`${message.id}-option-${optionIndex}`}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleOptionSelect(option, message.id, isMultiSelect)}
                        disabled={isTyping}
                        className={`justify-start text-left h-auto py-3 px-4 transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-primary/10 hover:border-primary"
                        }`}
                      >
                        <span className="font-semibold mr-2 text-primary">{optionIndex + 1}.</span>
                        <span>{option}</span>
                      </Button>
                    )
                  })}

                  {/* Submit button for multi-select */}
                  {message.allowMultiSelect && (selectedOptions[message.id] || []).length > 0 && (
                    <Button
                      onClick={() => handleMultiSelectSubmit(message.id)}
                      disabled={isTyping}
                      className="mt-2 bg-primary text-white hover:bg-primary/90"
                    >
                      Submit Selected ({(selectedOptions[message.id] || []).length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start message-fade-in">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invisible element at the end for scrolling */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      {/* Fixed Input Area */}
      <div className="border-t border-border/50 bg-background px-4 py-3 shadow-sm shrink-0 z-10">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 input-focus-glow focus-within:border-primary">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMicClick}
            disabled={isTyping}
            className={`h-8 w-8 shrink-0 ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
            title={isListening ? 'Stop recording' : 'Start voice input'}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Message AI Assistant..."}
            className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[40px] max-h-[120px]"
            rows={1}
            style={{
              height: 'auto',
              overflow: inputValue.split('\n').length > 3 ? 'auto' : 'hidden'
            }}
            onInput={(e) => {
              // Auto-resize textarea
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl button-hover-lift disabled:opacity-50 text-white"
            style={{ backgroundColor: "#2F4669" }}
          >
            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
