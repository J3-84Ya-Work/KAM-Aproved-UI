"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Send, Loader2, Mic, Check, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sendMessage, getConversations } from "@/lib/chat-api"
import { useAutoSaveDraft } from "@/hooks/use-auto-save-draft"
import { clientLogger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getQuotationDetail } from '@/lib/api-config'

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isLoading?: boolean
  options?: string[]
  allowMultiSelect?: boolean  // Flag to enable multiple selection for this message
  bookingId?: number | string  // For PDF download when quotation is created
}

// Function to clean option text by removing IDs like (CategoryID: 15) or (ClientID: 68)
function cleanOptionText(text: string): string {
  // Remove patterns like (CategoryID: 15), (ClientID: 68), (ID: 123), etc.
  return text
    .replace(/\s*\([^)]*ID\s*:\s*\d+\)/gi, '')  // Remove (CategoryID: X), (ClientID: X), etc.
    .replace(/\s*\(ID\s*:\s*\d+\)/gi, '')       // Remove (ID: X)
    .trim()
}

// Function to parse ContentSizeValues string like "SizeHeight=123AndOrSizeLength=23AndOr..."
function parseContentSizeValues(sizeValues: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!sizeValues) return result

  const pairs = sizeValues.split('AndOr')
  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key && value !== undefined) {
      result[key.trim()] = value.trim()
    }
  }
  return result
}

// Function to format JSON data into readable text
function formatJsonResponse(data: any): string {
  // Handle multiple levels of JSON string encoding
  if (typeof data === 'string') {
    let parsed = data
    let attempts = 0
    while (typeof parsed === 'string' && attempts < 5) {
      try {
        parsed = JSON.parse(parsed)
        attempts++
      } catch {
        break
      }
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return formatJsonResponse(parsed)
    }
    return data
  }

  if (typeof data !== 'object' || data === null) {
    return String(data)
  }

  // Map of technical field names to user-friendly labels
  const fieldLabels: Record<string, string> = {
    PlanContQty: 'Quantity',
    AnnualQuantity: 'Annual Quantity',
    SizeLength: 'Length',
    SizeWidth: 'Width',
    SizeHeight: 'Height',
    SizeOpenflap: 'Open Flap',
    SizePastingflap: 'Pasting Flap',
    SizeTuckinflap: 'Tuck-in Flap',
    ItemPlanQuality: 'Board',
    ItemPlanGsm: 'GSM',
    ItemPlanMill: 'Mill',
    ItemPlanFinish: 'Finish',
    PlanFColor: 'Front Colors',
    PlanBColor: 'Back Colors',
    PlanSpeFColor: 'Special Front Colors',
    PlanSpeBColor: 'Special Back Colors',
    ProcessName: 'Process',
    ContentName: 'Content Type',
    PlanContentType: 'Content Type',
    PlanContName: 'Content Name',
    CategoryName: 'Category',
    ClientName: 'Client',
    JobName: 'Job Name',
    TotalCost: 'Total Cost',
    UnitCost: 'Unit Cost',
    Rate: 'Rate',
    PaperSize: 'Paper Size',
    PlanWastageType: 'Wastage Type',
  }

  const lines: string[] = []

  // Check if this is TblBookingContents format from load enquiry API
  if (data.TblBookingContents && Array.isArray(data.TblBookingContents) && data.TblBookingContents.length > 0) {
    const content = data.TblBookingContents[0]

    lines.push('📋 Enquiry Details')
    lines.push('─────────────────')

    // Content type
    if (content.PlanContentType || content.PlanContName) {
      lines.push(`• Content Type: ${content.PlanContentType || content.PlanContName}`)
    }

    // Parse ContentSizeValues
    if (content.ContentSizeValues) {
      const sizeData = parseContentSizeValues(content.ContentSizeValues)

      // Dimensions
      const hasDimensions = sizeData.SizeHeight || sizeData.SizeLength || sizeData.SizeWidth
      if (hasDimensions) {
        lines.push('')
        lines.push('📐 Dimensions (mm)')
        if (sizeData.SizeHeight) lines.push(`• Height: ${sizeData.SizeHeight}`)
        if (sizeData.SizeLength) lines.push(`• Length: ${sizeData.SizeLength}`)
        if (sizeData.SizeWidth) lines.push(`• Width: ${sizeData.SizeWidth}`)
        if (sizeData.SizeOpenflap) lines.push(`• Open Flap: ${sizeData.SizeOpenflap}`)
        if (sizeData.SizePastingflap) lines.push(`• Pasting Flap: ${sizeData.SizePastingflap}`)
      }

      // Material
      const hasMaterial = sizeData.ItemPlanQuality || sizeData.ItemPlanGsm || sizeData.ItemPlanMill
      if (hasMaterial) {
        lines.push('')
        lines.push('📦 Material')
        if (sizeData.ItemPlanQuality) lines.push(`• Board: ${sizeData.ItemPlanQuality}`)
        if (sizeData.ItemPlanGsm) lines.push(`• GSM: ${sizeData.ItemPlanGsm}`)
        if (sizeData.ItemPlanMill) lines.push(`• Mill: ${sizeData.ItemPlanMill}`)
        if (sizeData.ItemPlanFinish && sizeData.ItemPlanFinish !== '-') lines.push(`• Finish: ${sizeData.ItemPlanFinish}`)
      }

      // Colors
      const hasColors = sizeData.PlanFColor || sizeData.PlanBColor
      if (hasColors) {
        lines.push('')
        lines.push('🎨 Colors')
        if (sizeData.PlanFColor) lines.push(`• Front: ${sizeData.PlanFColor}`)
        if (sizeData.PlanBColor) lines.push(`• Back: ${sizeData.PlanBColor}`)
      }
    }

    // Processes
    if (data.TblBookingProcess && data.TblBookingProcess.length > 0) {
      lines.push('')
      lines.push('⚙️ Processes')
      for (const proc of data.TblBookingProcess) {
        lines.push(`• ${proc.ProcessName || proc.ProcessID}`)
      }
    }

    return lines.join('\n')
  }

  // Standard format - Group fields by category for better display
  const sizeFields = ['SizeLength', 'SizeWidth', 'SizeHeight', 'SizeOpenflap', 'SizePastingflap', 'SizeTuckinflap']
  const quantityFields = ['PlanContQty', 'AnnualQuantity']
  const materialFields = ['ItemPlanQuality', 'ItemPlanGsm', 'ItemPlanMill', 'ItemPlanFinish']
  const colorFields = ['PlanFColor', 'PlanBColor', 'PlanSpeFColor', 'PlanSpeBColor']

  // Add header
  lines.push('📋 Order Details')
  lines.push('─────────────────')

  // Quantity section
  const hasQuantity = quantityFields.some(f => data[f] !== undefined && data[f] !== null && data[f] !== '')
  if (hasQuantity) {
    for (const field of quantityFields) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const label = fieldLabels[field] || field
        lines.push(`• ${label}: ${Number(data[field]).toLocaleString()}`)
      }
    }
    lines.push('')
  }

  // Size section
  const hasSize = sizeFields.some(f => data[f] !== undefined && data[f] !== null && data[f] !== '')
  if (hasSize) {
    lines.push('📐 Dimensions (mm)')
    for (const field of sizeFields) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const label = fieldLabels[field] || field
        lines.push(`• ${label}: ${data[field]}`)
      }
    }
    lines.push('')
  }

  // Material section
  const hasMaterial = materialFields.some(f => data[f] !== undefined && data[f] !== null && data[f] !== '' && data[f] !== '-')
  if (hasMaterial) {
    lines.push('📦 Material')
    for (const field of materialFields) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '' && data[field] !== '-') {
        const label = fieldLabels[field] || field
        lines.push(`• ${label}: ${data[field]}`)
      }
    }
    lines.push('')
  }

  // Colors section
  const hasColors = colorFields.some(f => data[f] !== undefined && data[f] !== null && data[f] !== '' && data[f] !== '0')
  if (hasColors) {
    lines.push('🎨 Colors')
    for (const field of colorFields) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '' && data[field] !== '0') {
        const label = fieldLabels[field] || field
        lines.push(`• ${label}: ${data[field]}`)
      }
    }
    lines.push('')
  }

  // Other fields
  const processedFields = [...sizeFields, ...quantityFields, ...materialFields, ...colorFields]
  const otherEntries = Object.entries(data).filter(
    ([key, value]) => !processedFields.includes(key) && value !== null && value !== undefined && value !== ''
  )

  if (otherEntries.length > 0) {
    lines.push('📝 Other Details')
    for (const [key, value] of otherEntries) {
      const label = fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()
      lines.push(`• ${label}: ${value}`)
    }
  }

  return lines.join('\n')
}

// Function to render text with markdown-style bold (**text**)
function renderTextWithBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove ** and render as bold
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

// Function to parse numbered options from message text
function parseOptions(text: string): { cleanText: string; options: string[] } {
  // Match patterns like "1. Option" or "1) Option" or "1 - Option"
  const optionRegex = /^\s*(\d+)[\.\)]\s*(.+)$/gm
  const matches = [...text.matchAll(optionRegex)]

  if (matches.length >= 2) {
    // Found multiple numbered options - clean each option to remove IDs
    const options = matches.map(match => cleanOptionText(match[2].trim()))

    // Remove duplicates while preserving order
    const uniqueOptions = [...new Set(options)]

    // Extract the text before options (if any)
    const firstMatchIndex = text.indexOf(matches[0][0])
    const textBeforeOptions = text.substring(0, firstMatchIndex).trim()

    return {
      cleanText: textBeforeOptions,
      options: uniqueOptions
    }
  }

  return { cleanText: text, options: [] }
}

// Parksons Logo path
const PARKSONS_LOGO_PATH = '/parksons-logo.png'

// Helper function to load image as base64 for PDF
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } else {
        reject(new Error('Could not get canvas context'))
      }
    }
    img.onerror = reject
    img.src = url
  })
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

  // Track conversation ID from API response
  const [conversationId, setConversationId] = useState<number | null>(null)

  // Track PDF download state
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<string | null>(null)

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

  // Auto-save hook - disabled for AI chat
  useAutoSaveDraft({
    formData,
    formType: 'DynamicFill',
    draftName: `AI_Chat_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}`,
    enabled: false, // Disabled - no auto-save for AI chat
    debounceMs: 2000,
    initialDraftId: loadedDraftId,
    onSaveSuccess: (draftId) => {
      clientLogger.log('[AI Chat] Draft saved/updated with ID:', draftId)
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

        // Use conversationId from state, or 0 for new chat
        const currentConversationId = conversationId || 0

        clientLogger.log('💬 Sending message with conversationId:', currentConversationId, 'isNewChat:', isNewChat)

        // Send newChat: true for the first message from home
        const response = await sendMessage(messageToAPI, currentConversationId, '9999999999', isNewChat)

        // After first message is sent, fetch conversations to get the new conversationId
        if (isNewChat && response.success) {
          setIsNewChat(false)

          // Get user credentials for fetching conversations
          const authData = localStorage.getItem('userAuth')
          const parsedAuth = authData ? JSON.parse(authData) : null
          const userId = parsedAuth?.userId || '2'
          const companyId = parsedAuth?.companyId || '2'

          // Fetch conversations to get the newly created conversationId
          clientLogger.log('💬 Fetching conversations to get new conversationId...')
          const conversationsResponse = await getConversations(String(userId), String(companyId))

          if (conversationsResponse.success && conversationsResponse.data && conversationsResponse.data.length > 0) {
            // Sort by lastMessageTime or updatedAt to get the most recent conversation
            const sortedConversations = [...conversationsResponse.data].sort((a, b) => {
              const timeA = new Date(a.lastMessageTime || a.updatedAt || a.createdAt || 0).getTime()
              const timeB = new Date(b.lastMessageTime || b.updatedAt || b.createdAt || 0).getTime()
              return timeB - timeA // Most recent first
            })

            const newestConversation = sortedConversations[0]
            if (newestConversation && newestConversation.conversationId) {
              clientLogger.log('💬 Found new conversationId:', newestConversation.conversationId)
              setConversationId(newestConversation.conversationId)
            }
          }
        }

        if (response.success && response.data) {
          // Extract text response, or format JSON data into readable text
          let aiResponseText =
            response.data.reply ||
            response.data.message ||
            response.data.response ||
            response.data.text ||
            null

          // If no text field found, check if response.data itself is a string or object
          if (!aiResponseText) {
            if (typeof response.data === "string") {
              // Check if it's a JSON string that needs formatting
              const trimmed = response.data.trim()
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                aiResponseText = formatJsonResponse(response.data)
              } else {
                aiResponseText = response.data
              }
            } else {
              aiResponseText = formatJsonResponse(response.data)
            }
          } else if (typeof aiResponseText === "string") {
            // Also check if the extracted text is JSON that needs formatting
            const trimmed = aiResponseText.trim()
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              aiResponseText = formatJsonResponse(aiResponseText)
            }
          }

          // Check if the message contains "select" or is asking about plant/customer/category (case-insensitive)
          const shouldShowButtons = /select/i.test(aiResponseText) ||
                                    /which\s+plant/i.test(aiResponseText) ||
                                    /which\s+customer/i.test(aiResponseText) ||
                                    /which\s+category/i.test(aiResponseText) ||
                                    /\*\*Customers:\*\*/i.test(aiResponseText) ||
                                    /Categories:/i.test(aiResponseText)
          // Check if multi-select should be enabled for processes
          const isMultiSelect = /select\s+processes/i.test(aiResponseText)
          const { cleanText, options } = parseOptions(aiResponseText)

          // Extract BookingID from response for PDF download
          let extractedBookingId: number | string | undefined = undefined
          if (response.data) {
            // Try to find BookingID in various places in the response
            extractedBookingId = response.data.BookingID ||
                                 response.data.bookingId ||
                                 response.data.booking_id ||
                                 response.data.QuotationID ||
                                 response.data.quotationId

            // Also check if it's nested in data object
            if (!extractedBookingId && response.data.data) {
              extractedBookingId = response.data.data.BookingID ||
                                   response.data.data.bookingId ||
                                   response.data.data.QuotationID
            }

            // Check if the response text contains BookingID pattern
            if (!extractedBookingId && typeof aiResponseText === 'string') {
              const bookingIdMatch = aiResponseText.match(/Booking\s*(?:ID|No)?[:\s]*(\d+)/i)
              if (bookingIdMatch) {
                extractedBookingId = bookingIdMatch[1]
              }
            }
          }

          const aiMessage: Message = {
            id: `${Date.now()}-ai`,
            content: shouldShowButtons && options.length > 0 ? cleanText : aiResponseText,
            sender: "ai",
            timestamp: new Date(),
            options: shouldShowButtons && options.length > 0 ? options : undefined,
            allowMultiSelect: isMultiSelect,
            bookingId: extractedBookingId,
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
    [isNewChat, conversationId]
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

  // Handle downloading quotation PDF - VERTICAL FORMAT
  const handleDownloadQuotationVertical = async (bookingId: string | number | undefined) => {
    if (!bookingId) {
      toast({ title: "Error", description: "Invalid quotation ID: BookingID is missing", variant: "destructive" })
      return
    }

    const bookingIdStr = String(bookingId)
    setIsDownloadingPDF(bookingIdStr + '-v')
    try {
      const data = await getQuotationDetail(bookingId)

      const mainDataArray = data.Main || data.mainData || data.MainData || []
      const detailsDataArray = data.Datails || data.Details || data.detailsData || data.DetailsData || []
      const priceDataArray = data.Price || data.priceData || data.PriceData || []

      const allDetailsData = detailsDataArray.length > 0 ? detailsDataArray : [{}]
      const mainData = mainDataArray[0] || {}
      const priceData = priceDataArray[0] || {}

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const quotationNumber = mainData.BookingNo || bookingId
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      let yPos = 8

      // Header with logo
      try {
        const logoBase64 = await loadImageAsBase64(PARKSONS_LOGO_PATH)
        const logoWidth = 60
        const logoHeight = logoWidth * (222 / 995)
        pdf.addImage(logoBase64, 'PNG', 10, yPos, logoWidth, logoHeight)
        yPos += logoHeight + 5
      } catch {
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text('PARKSONS PACKAGING LTD', pageWidth / 2, yPos + 9, { align: 'center' })
        yPos += 20
      }

      // QUOTATION Title
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      const titleText = 'QUOTATION'
      const titleWidth = pdf.getTextWidth(titleText)
      const titleX = (pageWidth - titleWidth) / 2
      pdf.text(titleText, titleX, yPos)
      pdf.setLineWidth(0.4)
      pdf.line(titleX, yPos + 1, titleX + titleWidth, yPos + 1)
      yPos += 8

      // Client info
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Client Name', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ClientName || mainData.LedgerName || ''}`, 38, yPos)
      yPos += 5

      pdf.setFont('helvetica', 'bold')
      pdf.text('To', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.MailingName || mainData.ClientName || ''}`, 38, yPos)
      yPos += 5

      pdf.setFont('helvetica', 'bold')
      pdf.text('Address', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      const address = mainData.Address || ''
      const addressLines = pdf.splitTextToSize(`: ${address}`, pageWidth - 48)
      pdf.text(addressLines, 38, yPos)
      yPos += (addressLines.length * 4) + 1

      pdf.setFont('helvetica', 'bold')
      pdf.text('Subject', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.EmailSubject || mainData.JobName || ''}`, 38, yPos)
      yPos += 5

      pdf.setFont('helvetica', 'bold')
      pdf.text('Kind Attention', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ConcernPerson || mainData.ContactPerson || ''}`, 38, yPos)
      yPos += 8

      // Build table data
      const numItems = Math.max(allDetailsData.length, 4)
      const colHeaders = ['S.N.']
      for (let i = 1; i <= numItems; i++) colHeaders.push(String(i))

      const jobNameRow = ['Job name']
      const sizeRow = ['Size (MM)']
      const boardSpecsRow = ['Board Specs']
      const printingRow = ['Printing & Value Addition']
      const moqRow = ['MOQ']
      const annualQtyRow = ['Annual Quantity']

      for (let i = 0; i < numItems; i++) {
        const detail = allDetailsData[i] || {}
        jobNameRow.push(mainData.JobName || detail.Content_Name || '')
        sizeRow.push(detail.Job_Size || detail.Job_Size_In_Inches || '')
        boardSpecsRow.push(detail.Paper || '')
        printingRow.push(detail.Printing || '')
        moqRow.push('')
        annualQtyRow.push(i === 0 ? (priceData.PlanContQty || '') : '')
      }

      const availableWidth = pageWidth - 20
      const labelColWidth = 45
      const dataColWidth = (availableWidth - labelColWidth) / numItems

      autoTable(pdf, {
        startY: yPos,
        head: [colHeaders],
        body: [jobNameRow, sizeRow, boardSpecsRow, printingRow, moqRow, annualQtyRow],
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center', lineWidth: 0.2, lineColor: [0, 0, 0] },
        bodyStyles: { fontSize: 6, lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 6 },
        columnStyles: { 0: { cellWidth: labelColWidth, fontStyle: 'bold', halign: 'left' }, 1: { cellWidth: dataColWidth }, 2: { cellWidth: dataColWidth }, 3: { cellWidth: dataColWidth }, 4: { cellWidth: dataColWidth } },
        margin: { left: 10, right: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY

      // Quote section
      const quoteLabelWidth = 30
      const quoteSubLabelWidth = 15
      const quoteDataColWidth = (availableWidth - quoteLabelWidth - quoteSubLabelWidth) / numItems

      const quote1LRow: any[] = [{ content: 'Quote\n(INR/1000)', rowSpan: 4, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } }, { content: '1L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]
      const quote2LRow: any[] = [{ content: '2L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]
      const quote5LRow: any[] = [{ content: '5L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]
      const quote10LRow: any[] = [{ content: '10L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]

      for (let i = 0; i < numItems; i++) {
        quote1LRow.push('')
        quote2LRow.push('')
        quote5LRow.push('')
        quote10LRow.push('')
      }

      autoTable(pdf, {
        startY: yPos,
        body: [quote1LRow, quote2LRow, quote5LRow, quote10LRow],
        theme: 'grid',
        bodyStyles: { fontSize: 6, lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 5 },
        columnStyles: { 0: { cellWidth: quoteLabelWidth }, 1: { cellWidth: quoteSubLabelWidth, halign: 'center' }, 2: { cellWidth: quoteDataColWidth }, 3: { cellWidth: quoteDataColWidth }, 4: { cellWidth: quoteDataColWidth }, 5: { cellWidth: quoteDataColWidth } },
        margin: { left: 10, right: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // Packing Spec
      autoTable(pdf, {
        startY: yPos,
        body: [
          [{ content: 'Packing\nSpec', rowSpan: 12, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } }, { content: 'Tentative Packing Spec', colSpan: 2, styles: { fontStyle: 'bold' as const, halign: 'center' as const } }],
          ['Shipper box size in MM', ''], ['Quantity per shipper box: Packs', ''], ['Shipper box Weight: Gross in KG', ''],
          ['Pallet size in MM', ''], ['Number of Shipper per pallets: Shippers', ''], ['Quantity per pallet: Packs', ''],
          ['Pallet Weight: Gross in Kg', ''], ['Pallets per 20 FT FCL', ''], ['Quantity per 20 FT FCL: Packs', ''],
          ['Pallets per 40 FT FCL', ''], ['Quantity per 40 FT FCL: Packs', ''],
        ],
        theme: 'grid',
        bodyStyles: { fontSize: 6, lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 5, fontStyle: 'bold' as const },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 80, halign: 'left' as const }, 2: { cellWidth: 40 } },
        margin: { left: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 5

      // Terms
      autoTable(pdf, {
        startY: yPos,
        body: [
          [{ content: 'Terms &\nConditions', rowSpan: 6, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } }, 'Delivery Terms', '45Days'],
          ['Payment Terms', '30Days'], ['Taxes', ''], ['Currency', priceData.CurrencySymbol || ''], ['Lead Time', ''], ['Quote Validity', ''],
        ],
        theme: 'grid',
        bodyStyles: { fontSize: 6, lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 5, fontStyle: 'bold' as const },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 80, halign: 'left' as const }, 2: { cellWidth: 40 } },
        margin: { left: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // Footer
      if (yPos > pageHeight - 35) { pdf.addPage(); yPos = 15 }

      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(80, 80, 80)
      const footerText = mainData.FooterText || 'This quotation is valid for 10 days from the date of issue.'
      const footerLines = pdf.splitTextToSize(footerText, pageWidth - 20)
      pdf.text(footerLines, 10, yPos)
      yPos += (footerLines.length * 3) + 5

      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('Prepared By:', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(mainData.UserName || mainData.SalesEmployeeName || '', 32, yPos)
      yPos += 4

      if (mainData.UserContactNo) { pdf.text(`Contact: ${mainData.UserContactNo}`, 10, yPos); yPos += 4 }
      yPos += 5

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 81, 128)
      pdf.text(mainData.CompanyName || 'INDAS Packaging Pvt. Ltd.', pageWidth / 2, yPos, { align: 'center' })

      pdf.save(`Quotation-${quotationNumber}-Vertical.pdf`)
      toast({ title: "Success", description: "PDF downloaded successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to download PDF: ${error.message}`, variant: "destructive" })
    } finally {
      setIsDownloadingPDF(null)
    }
  }

  // Handle downloading quotation PDF - HORIZONTAL FORMAT
  const handleDownloadQuotationHorizontal = async (bookingId: string | number | undefined) => {
    if (!bookingId) {
      toast({ title: "Error", description: "Invalid quotation ID: BookingID is missing", variant: "destructive" })
      return
    }

    const bookingIdStr = String(bookingId)
    setIsDownloadingPDF(bookingIdStr + '-h')
    try {
      const data = await getQuotationDetail(bookingId)

      const mainDataArray = data.Main || data.mainData || data.MainData || []
      const detailsDataArray = data.Datails || data.Details || data.detailsData || data.DetailsData || []
      const priceDataArray = data.Price || data.priceData || data.PriceData || []

      const allDetailsData = detailsDataArray.length > 0 ? detailsDataArray : [{}]
      const mainData = mainDataArray[0] || {}
      const priceData = priceDataArray[0] || {}

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const quotationNumber = mainData.BookingNo || bookingId
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      let yPos = 8

      // Header with logo
      try {
        const logoBase64 = await loadImageAsBase64(PARKSONS_LOGO_PATH)
        const logoWidth = 60
        const logoHeight = logoWidth * (222 / 995)
        pdf.addImage(logoBase64, 'PNG', 10, yPos, logoWidth, logoHeight)
        yPos += logoHeight + 5
      } catch {
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text('PARKSONS PACKAGING LTD', pageWidth / 2, yPos + 9, { align: 'center' })
        yPos += 20
      }

      // QUOTATION Title
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      const titleText = 'QUOTATION'
      const titleWidth = pdf.getTextWidth(titleText)
      const titleX = (pageWidth - titleWidth) / 2
      pdf.text(titleText, titleX, yPos)
      pdf.setLineWidth(0.4)
      pdf.line(titleX, yPos + 1, titleX + titleWidth, yPos + 1)
      yPos += 8

      // Client info
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Client Name', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ClientName || mainData.LedgerName || ''}`, 38, yPos)
      yPos += 5

      pdf.setFont('helvetica', 'bold')
      pdf.text('To', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.MailingName || mainData.ClientName || ''}`, 38, yPos)
      yPos += 5

      pdf.setFont('helvetica', 'bold')
      pdf.text('Address', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      const addressH = mainData.Address || ''
      const addressLinesH = pdf.splitTextToSize(`: ${addressH}`, pageWidth - 48)
      pdf.text(addressLinesH, 38, yPos)
      yPos += (addressLinesH.length * 4) + 1

      pdf.setFont('helvetica', 'bold')
      pdf.text('Subject', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.EmailSubject || mainData.JobName || ''}`, 38, yPos)
      yPos += 5

      pdf.setFont('helvetica', 'bold')
      pdf.text('Kind Attention', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ConcernPerson || mainData.ContactPerson || ''}`, 38, yPos)
      yPos += 8

      // Main table - Horizontal format
      autoTable(pdf, {
        startY: yPos,
        head: [
          [
            { content: 'S.N.', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Job name', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Size', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Board Specs', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Printing & Value Add', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'MOQ', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Ann. Qty', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Quote (INR/1000)', colSpan: 4, styles: { halign: 'center' } },
          ],
          [
            { content: '1L', styles: { halign: 'center' } },
            { content: '2L', styles: { halign: 'center' } },
            { content: '5L', styles: { halign: 'center' } },
            { content: '10L', styles: { halign: 'center' } },
          ]
        ],
        body: allDetailsData.map((detailsData: any, index: number) => [
          String(index + 1),
          mainData.JobName || detailsData.Content_Name || '',
          detailsData.Job_Size || detailsData.Job_Size_In_Inches || '',
          detailsData.Paper || '',
          detailsData.Printing || '',
          '',
          priceData.PlanContQty || '',
          '', '', '', ''
        ]),
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 5, fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0] },
        bodyStyles: { fontSize: 5, valign: 'middle', lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 6 },
        columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 22 }, 2: { cellWidth: 14 }, 3: { cellWidth: 32 }, 4: { cellWidth: 30 }, 5: { cellWidth: 10, halign: 'center' }, 6: { cellWidth: 14, halign: 'center' }, 7: { cellWidth: 12, halign: 'center' }, 8: { cellWidth: 12, halign: 'center' }, 9: { cellWidth: 12, halign: 'center' }, 10: { cellWidth: 12, halign: 'center' } },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto'
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // Packing Spec
      autoTable(pdf, {
        startY: yPos,
        body: [
          [{ content: 'Packing\nSpec', rowSpan: 12, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } }, { content: 'Tentative Packing Spec', colSpan: 2, styles: { fontStyle: 'bold' as const, halign: 'center' as const } }],
          ['Shipper box size in MM', ''], ['Quantity per shipper box: Packs', ''], ['Shipper box Weight: Gross in KG', ''],
          ['Pallet size in MM', ''], ['Number of Shipper per pallets: Shippers', ''], ['Quantity per pallet: Packs', ''],
          ['Pallet Weight: Gross in Kg', ''], ['Pallets per 20 FT FCL', ''], ['Quantity per 20 FT FCL: Packs', ''],
          ['Pallets per 40 FT FCL', ''], ['Quantity per 40 FT FCL: Packs', ''],
        ],
        theme: 'grid',
        bodyStyles: { fontSize: 6, lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 5, fontStyle: 'bold' as const },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 80, halign: 'left' as const }, 2: { cellWidth: 40 } },
        margin: { left: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 5

      // Terms
      autoTable(pdf, {
        startY: yPos,
        body: [
          [{ content: 'Terms &\nConditions', rowSpan: 6, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } }, 'Delivery Terms', '45Days'],
          ['Payment Terms', '30Days'], ['Taxes', ''], ['Currency', priceData.CurrencySymbol || ''], ['Lead Time', ''], ['Quote Validity', ''],
        ],
        theme: 'grid',
        bodyStyles: { fontSize: 6, lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 5, fontStyle: 'bold' as const },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 80, halign: 'left' as const }, 2: { cellWidth: 40 } },
        margin: { left: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // Footer
      if (yPos > pageHeight - 35) { pdf.addPage(); yPos = 15 }

      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(80, 80, 80)
      const footerText = mainData.FooterText || 'This quotation is valid for 10 days from the date of issue.'
      const footerLines = pdf.splitTextToSize(footerText, pageWidth - 20)
      pdf.text(footerLines, 10, yPos)
      yPos += (footerLines.length * 3) + 5

      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('Prepared By:', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(mainData.UserName || mainData.SalesEmployeeName || '', 32, yPos)
      yPos += 4

      if (mainData.UserContactNo) { pdf.text(`Contact: ${mainData.UserContactNo}`, 10, yPos); yPos += 4 }
      yPos += 5

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 81, 128)
      pdf.text(mainData.CompanyName || 'INDAS Packaging Pvt. Ltd.', pageWidth / 2, yPos, { align: 'center' })

      pdf.save(`Quotation-${quotationNumber}-Horizontal.pdf`)
      toast({ title: "Success", description: "PDF downloaded successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to download PDF: ${error.message}`, variant: "destructive" })
    } finally {
      setIsDownloadingPDF(null)
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
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] w-full flex-col bg-background overflow-hidden pb-16 md:pb-0">
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
                <div className={`relative group ${message.sender === "user" ? "max-w-[85%] md:max-w-[80%]" : "max-w-[95%] md:max-w-[90%]"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm whitespace-pre-wrap break-words overflow-hidden cursor-pointer transition-all active:scale-95 ${
                      message.sender === "user"
                        ? "bg-blue text-white"
                        : "bg-blue-5 text-foreground"
                    } ${copiedMessageId === message.id ? "ring-2 ring-green-500" : ""}`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    onMouseDown={() => handleLongPressStart(message.content, message.id)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(message.content, message.id)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                  >
                    {renderTextWithBold(message.content)}
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
                <div className="flex flex-col gap-2 mt-3 ml-0 max-w-[45%]">
                  {message.options.map((option, optionIndex) => {
                    const isMultiSelect = message.allowMultiSelect || false
                    const isSelected = isMultiSelect && (selectedOptions[message.id] || []).includes(option)

                    return (
                      <Button
                        key={`${message.id}-option-${optionIndex}`}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleOptionSelect(option, message.id, isMultiSelect)}
                        disabled={isTyping}
                        className={`justify-start text-left h-auto py-3 px-4 transition-all w-full ${
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
                      className="mt-2 bg-primary text-white hover:bg-primary/90 w-full"
                    >
                      Submit Selected ({(selectedOptions[message.id] || []).length})
                    </Button>
                  )}
                </div>
              )}

              {/* PDF Download buttons when quotation is created */}
              {message.bookingId && (
                <div className="flex gap-2 mt-3 ml-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadQuotationVertical(message.bookingId)}
                    disabled={isDownloadingPDF === `${message.bookingId}-v`}
                    className="flex items-center gap-1 text-xs"
                  >
                    {isDownloadingPDF === `${message.bookingId}-v` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    PDF (V)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadQuotationHorizontal(message.bookingId)}
                    disabled={isDownloadingPDF === `${message.bookingId}-h`}
                    className="flex items-center gap-1 text-xs"
                  >
                    {isDownloadingPDF === `${message.bookingId}-h` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    PDF (H)
                  </Button>
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
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 input-focus-glow focus-within:border-primary">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMicClick}
            disabled={isTyping}
            className={`h-9 w-9 shrink-0 rounded-full ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
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
            className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[40px] max-h-[120px] py-2"
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
            className="h-9 w-9 shrink-0 rounded-full button-hover-lift disabled:opacity-50 text-white"
            style={{ backgroundColor: "#2F4669" }}
          >
            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
