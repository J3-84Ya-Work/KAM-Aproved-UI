"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, User, ArrowLeft, Send, Loader2, Mic, Check } from "lucide-react"
import { ScrollableOptionsList, ActionButtonsRow } from "@/components/ui/scrollable-options-list"
import { getMessages, Message } from "@/lib/chat-api"
import { formatDistanceToNow } from "date-fns"
import { clientLogger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/permissions"
import { useToast } from "@/hooks/use-toast"

// Function to clean option text by removing IDs like (CategoryID: 15) or (ClientID: 68)
function cleanOptionText(text: string): string {
  return text
    .replace(/\s*\([^)]*ID\s*:\s*\d+\)/gi, '')
    .replace(/\s*\(ID\s*:\s*\d+\)/gi, '')
    .trim()
}

// Function to render text with markdown-style bold (**text**) and clickable links
function renderTextWithBoldAndLinks(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }

    const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return <strong key={`${index}-${boldIndex}`}>{boldPart.slice(2, -2)}</strong>
      }
      return <span key={`${index}-${boldIndex}`}>{boldPart}</span>
    })
  })
}

// Function to check if text is a costing summary
function isCostingSummary(text: string): boolean {
  return text.includes('COSTING SUMMARY') || text.includes('Customer & JOB DETAILS') || text.includes('COST STRUCTURE') || text.includes('"CostingBot"')
}

// Function to check if text is a costing summary and render as table
function renderCostingSummary(text: string): React.ReactNode | null {
  // Check if this is a costing summary - look for the specific markers
  if (!isCostingSummary(text)) {
    return null
  }

  let customerName = '-'
  let jobName = '-'
  let sheetSize = '-'
  let orderQuantity = '-'
  let noOfUps = '-'
  let requiredSheets = '-'
  let boardCost = '-'
  let otherMaterialCost = '-'
  let conversionCost = '-'
  let profit = '-'
  let totalCost = '-'
  let status = 'Estimated'
  let generatedDate = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })

  // Try to parse as JSON first (new format)
  try {
    // Extract JSON from the text - it might have text before the JSON
    const jsonMatch = text.match(/\{[\s\S]*"Type"\s*:\s*"CostingBot"[\s\S]*\}/)
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0])

      if (jsonData.CustomerDetails) {
        customerName = jsonData.CustomerDetails.CustomerName || '-'
        jobName = jsonData.CustomerDetails.JobName || '-'
        sheetSize = jsonData.CustomerDetails.SheetSize || '-'
        orderQuantity = jsonData.CustomerDetails.OrderQuantity?.toLocaleString() || '-'
        noOfUps = jsonData.CustomerDetails.Ups?.toString() || '-'
        requiredSheets = jsonData.CustomerDetails.RequiredSheets?.toLocaleString() || '-'
      }

      if (jsonData.CostStructurePer1000) {
        boardCost = jsonData.CostStructurePer1000.BoardCost?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'
        otherMaterialCost = jsonData.CostStructurePer1000.OtherMaterialCost?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'
        conversionCost = jsonData.CostStructurePer1000.ConversionCost?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'
        profit = jsonData.CostStructurePer1000.Profit?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'
        totalCost = jsonData.CostStructurePer1000.TotalCostPer1000?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'
      }

      if (jsonData.Status) {
        status = jsonData.Status
      }
    }
  } catch (e) {
    // JSON parsing failed, fall back to text extraction
    console.log('JSON parsing failed, using text extraction')
  }

  // If JSON parsing didn't work, try text extraction (old format)
  if (customerName === '-' && jobName === '-') {
    const extractValue = (labelPattern: string): string => {
      const lines = text.split('\n')
      for (const line of lines) {
        const regex = new RegExp(labelPattern + '.+:\\s*(.+)', 'i')
        const match = line.match(regex)
        if (match && match[1]) {
          return match[1].trim()
        }
      }
      return '-'
    }

    customerName = extractValue('Customer Name')
    jobName = extractValue('Job Name')
    sheetSize = extractValue('Sheet Size')
    orderQuantity = extractValue('Order Quantity')
    noOfUps = extractValue('No\\.? of Ups')
    requiredSheets = extractValue('Required Sheets')
    boardCost = extractValue('Board Cost')
    otherMaterialCost = extractValue('Other Material Cost')
    conversionCost = extractValue('Conversion')
    profit = extractValue('Profit')
    totalCost = extractValue('TOTAL COST')
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 bg-[#2F4669]/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#2F4669]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2F4669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[#2F4669] text-sm">Costing Summary</h3>
            <p className="text-gray-500 text-xs">{jobName !== '-' ? jobName : 'Costing'}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium border border-[#005180] text-[#005180] bg-[#005180]/5">
          BEST PLAN
        </span>
      </div>

      {/* Customer & Sheet Info Cards */}
      <div className="p-3 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-[#005180]/20 p-3 bg-[#005180]/5">
          <p className="text-[#005180]/70 text-xs uppercase tracking-wide mb-1">Customer</p>
          <p className="text-[#2F4669] text-sm font-medium truncate">{customerName}</p>
        </div>
        <div className="rounded-md border border-[#005180]/20 p-3 bg-[#005180]/5">
          <p className="text-[#005180]/70 text-xs uppercase tracking-wide mb-1">Sheet Size</p>
          <p className="text-[#2F4669] text-sm font-medium">{sheetSize}</p>
        </div>
        <div className="rounded-md border border-[#005180]/20 p-3 bg-[#005180]/5">
          <p className="text-[#005180]/70 text-xs uppercase tracking-wide mb-1">Order Qty</p>
          <p className="text-[#2F4669] text-sm font-medium">{orderQuantity}</p>
        </div>
        <div className="rounded-md border border-[#005180]/20 p-3 bg-[#005180]/5">
          <p className="text-[#005180]/70 text-xs uppercase tracking-wide mb-1">Ups / Sheets</p>
          <p className="text-[#2F4669] text-sm font-medium">{noOfUps} / {requiredSheets}</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#005180] rounded-full"></div>
          <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Cost Breakdown (Per 1,000 Units)</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Board Cost</span>
            <span className="text-[#2F4669] text-sm font-medium">₹ {boardCost}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Other Material Cost</span>
            <span className="text-[#2F4669] text-sm font-medium">₹ {otherMaterialCost}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Conversion Cost</span>
            <span className="text-[#2F4669] text-sm font-medium">₹ {conversionCost}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-[#005180] text-sm font-medium">Profit Margin</span>
            <span className="text-green-600 text-sm font-medium">₹ {profit}</span>
          </div>
        </div>

        {/* Total Cost */}
        <div className="mt-4 rounded-md p-3 flex justify-between items-center bg-[#2F4669]/5 border border-[#2F4669]/20">
          <span className="text-[#005180] text-sm font-semibold">TOTAL COST / 1,000</span>
          <span className="text-[#005180] text-lg font-bold">₹ {totalCost}</span>
        </div>
      </div>

    </div>
  )
}

// Function to parse numbered options from message text
function parseOptions(text: string): { cleanText: string; options: string[] } {
  const optionRegex = /^\s*(\d+)[\.\)]\s*(.+)$/gm
  const matches = [...text.matchAll(optionRegex)]

  if (matches.length >= 2) {
    const options = matches.map(match => cleanOptionText(match[2].trim()))
    const uniqueOptions = [...new Set(options)]
    const firstMatchIndex = text.indexOf(matches[0][0])
    const textBeforeOptions = text.substring(0, firstMatchIndex).trim()

    return {
      cleanText: textBeforeOptions,
      options: uniqueOptions
    }
  }

  return { cleanText: text, options: [] }
}

// Extended message type with options
interface ExtendedMessage extends Message {
  options?: string[]
  allowMultiSelect?: boolean
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<ExtendedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({})
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  // Get current user
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

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
          setInputMessage((prev) => prev + (prev ? ' ' : '') + transcript)
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

  // Fetch messages on load
  // Function to process a message and extract options
  const processMessageForOptions = (message: Message): ExtendedMessage => {
    // Only process assistant messages
    if (message.role !== 'assistant') {
      return message
    }

    let content = message.content || ''

    // Convert escaped newlines to actual newlines
    content = content.replace(/\\n/g, '\n')

    // Check if the message should show buttons
    const shouldShowButtons = /select/i.test(content) ||
                              /which\s+plant/i.test(content) ||
                              /which\s+customer/i.test(content) ||
                              /which\s+category/i.test(content) ||
                              /\*\*Customers:\*\*/i.test(content) ||
                              /Categories:/i.test(content) ||
                              /available\s+GSM/i.test(content) ||
                              /available\s+\w+.*:/i.test(content) ||
                              /choose\s+(one|from)/i.test(content) ||
                              /^\s*\d+\.\s+\d+\s*$/m.test(content)

    // Check if this is a YES/NO confirmation message
    const isYesNoConfirmation = /Reply with:\s*\n?\s*YES\s+[–-]\s+Save/i.test(content) ||
                                /YES\s+[–-]\s+Save.*NO\s+[–-]\s+Discard/i.test(content)

    // Check if multi-select should be enabled for processes
    const isMultiSelect = /select\s+processes/i.test(content)

    let { cleanText, options } = parseOptions(content)
    const hasNumberedOptions = options.length >= 2

    // If it's a YES/NO confirmation, override options
    if (isYesNoConfirmation) {
      cleanText = content.replace(/Reply with:[\s\S]*$/i, '').trim()
      options = ['YES', 'NO']
    }

    // Check if this is a Job Specification Summary message with Confirm/Modify options
    const isJobSpecSummary = /Job Specification Summary/i.test(content) &&
                             (/Confirm.*Generate.*Costing/i.test(content) ||
                              /Modify.*Details/i.test(content))

    if (isJobSpecSummary) {
      // Remove everything from the dashes line onwards (including "Please review..." and numbered options)
      cleanText = content.replace(/-{5,}[\s\S]*$/g, '').trim()
      // Also try to remove numbered options if dashes weren't present
      cleanText = cleanText.replace(/\d+\.\s*[✅❌✏️✓✎]?\s*[✅❌✏️✓✎]?\s*(Confirm.*|Modify.*)$/gim, '').trim()
      cleanText = cleanText.replace(/Please review.*details\.?\s*/gi, '').trim()
      cleanText = cleanText.replace(/What would you like to do\?/i, '').trim()
      // Remove leading emoji from title (📋)
      cleanText = cleanText.replace(/^[📋📝📄]\s*/g, '').trim()
      options = ['CONFIRM', 'MODIFY']
    }

    const showOptionsButtons = (shouldShowButtons && options.length > 0) || hasNumberedOptions || isYesNoConfirmation || isJobSpecSummary

    return {
      ...message,
      content: showOptionsButtons ? cleanText : content,
      options: showOptionsButtons ? options : undefined,
      allowMultiSelect: isMultiSelect
    }
  }

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
          // Process each message to extract options for clickable buttons
          const processedMessages = result.data.map(processMessageForOptions)
          setMessages(processedMessages)
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

  // Auto-focus on input - always keep cursor in input box
  useEffect(() => {
    // Focus on mount - more aggressive timing
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    // Initial focus after component mounts with multiple attempts
    focusInput()
    const timers = [
      setTimeout(focusInput, 50),
      setTimeout(focusInput, 100),
      setTimeout(focusInput, 300),
      setTimeout(focusInput, 500),
      setTimeout(focusInput, 1000),
    ]

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [])

  // Focus on input after loading completes
  useEffect(() => {
    if (!loading && inputRef.current) {
      const timers = [
        setTimeout(() => inputRef.current?.focus(), 50),
        setTimeout(() => inputRef.current?.focus(), 200),
      ]
      return () => timers.forEach(timer => clearTimeout(timer))
    }
  }, [loading])

  // Focus on input after sending completes
  useEffect(() => {
    if (!isSending && inputRef.current) {
      const timers = [
        setTimeout(() => inputRef.current?.focus(), 50),
        setTimeout(() => inputRef.current?.focus(), 200),
      ]
      return () => timers.forEach(timer => clearTimeout(timer))
    }
  }, [isSending])

  // Focus on input after messages change (new message received)
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages])

  // Refocus on input when window/document gets focus or after button click
  useEffect(() => {
    const handleWindowFocus = () => {
      setTimeout(() => inputRef.current?.focus(), 50)
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // After clicking a button, focus on input after a delay
      if (target.closest('button')) {
        setTimeout(() => inputRef.current?.focus(), 150)
      }
      // If clicking anywhere else (not textarea, button, or link), also focus
      else if (!target.closest('textarea') && !target.closest('a')) {
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('click', handleClick)
    }
  }, [])

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

    // Reset textarea height to default
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = '40px'
    }

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

      let replyText = await response.text()

      // Convert escaped newlines to actual newlines
      replyText = replyText.replace(/\\n/g, '\n')

      // Check if the message contains "select" or is asking about plant/customer/category
      // Also check for numbered lists that should be clickable
      const shouldShowButtons = /select/i.test(replyText) ||
                                /which\s+plant/i.test(replyText) ||
                                /which\s+customer/i.test(replyText) ||
                                /which\s+category/i.test(replyText) ||
                                /\*\*Customers:\*\*/i.test(replyText) ||
                                /Categories:/i.test(replyText) ||
                                /available\s+GSM/i.test(replyText) ||
                                /available\s+\w+.*:/i.test(replyText) ||
                                /choose\s+(one|from)/i.test(replyText) ||
                                /^\s*\d+\.\s+\d+\s*$/m.test(replyText)  // Numbered list of values like "1. 200"

      // Check if this is a YES/NO confirmation message
      const isYesNoConfirmation = /Reply with:\s*\n?\s*YES\s+[–-]\s+Save/i.test(replyText) ||
                                  /YES\s+[–-]\s+Save.*NO\s+[–-]\s+Discard/i.test(replyText)

      // Check if multi-select should be enabled for processes
      const isMultiSelect = /select\s+processes/i.test(replyText)
      let { cleanText, options } = parseOptions(replyText)

      // If we have options from parsing, show them as buttons
      const hasNumberedOptions = options.length >= 2

      // If it's a YES/NO confirmation, override options
      if (isYesNoConfirmation) {
        cleanText = replyText.replace(/Reply with:[\s\S]*$/i, '').trim()
        options = ['YES', 'NO']
      }

      // Check if this is a Job Specification Summary message with Confirm/Modify options
      const isJobSpecSummary = /Job Specification Summary/i.test(replyText) &&
                               (/Confirm.*Generate.*Costing/i.test(replyText) ||
                                /Modify.*Details/i.test(replyText))

      if (isJobSpecSummary) {
        // Remove everything from the dashes line onwards (including "Please review..." and numbered options)
        cleanText = replyText.replace(/-{5,}[\s\S]*$/g, '').trim()
        // Also try to remove numbered options if dashes weren't present
        cleanText = cleanText.replace(/\d+\.\s*[✅❌✏️✓✎]?\s*[✅❌✏️✓✎]?\s*(Confirm.*|Modify.*)$/gim, '').trim()
        cleanText = cleanText.replace(/Please review.*details\.?\s*/gi, '').trim()
        cleanText = cleanText.replace(/What would you like to do\?/i, '').trim()
        // Remove leading emoji from title (📋)
        cleanText = cleanText.replace(/^[📋📝📄]\s*/g, '').trim()
        options = ['CONFIRM', 'MODIFY']
      }

      // Show buttons if we have numbered options OR explicit triggers
      const showOptionsButtons = (shouldShowButtons && options.length > 0) || hasNumberedOptions || isYesNoConfirmation || isJobSpecSummary

      // Remove thinking indicator and add actual response
      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.content !== 'Thinking...')
        return [...withoutThinking, {
          messageId: Date.now() + 2,
          conversationId: Number(conversationId),
          role: 'assistant',
          content: showOptionsButtons ? cleanText : replyText,
          timestamp: new Date().toISOString(),
          options: showOptionsButtons ? options : undefined,
          allowMultiSelect: isMultiSelect
        }]
      })

    } catch (error) {
      clientLogger.error('Error sending message:', error)
      // Remove thinking indicator on error
      setMessages(prev => prev.filter(m => m.content !== 'Thinking...'))
    } finally {
      setIsSending(false)
      // Focus back on input after sending
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // Copy message handler
  const handleCopyMessage = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      })
    }
  }

  // Long press handlers
  const handleLongPressStart = (content: string, messageId: number) => {
    const timer = setTimeout(() => {
      handleCopyMessage(content, messageId)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  // Helper function to force focus on input with multiple attempts
  const forceFocusInput = () => {
    const attempts = [50, 100, 200, 300, 500]
    attempts.forEach(delay => {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, delay)
    })
  }

  // Handle mic click for voice input
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

  // Option select handler - supports both string and number messageId for compatibility
  const handleOptionSelect = (option: string, messageId: string | number, isMultiSelect: boolean) => {
    const numericId = typeof messageId === 'string' ? Number(messageId) : messageId
    if (isMultiSelect) {
      setSelectedOptions(prev => {
        const currentSelections = prev[numericId] || []
        const isSelected = currentSelections.includes(option)
        if (isSelected) {
          return { ...prev, [numericId]: currentSelections.filter(opt => opt !== option) }
        } else {
          return { ...prev, [numericId]: [...currentSelections, option] }
        }
      })
      // Focus on input after multi-select toggle
      forceFocusInput()
    } else {
      // Handle special CONFIRM/MODIFY buttons for Job Specification Summary
      if (option === 'CONFIRM') {
        // Send confirm message directly
        handleSendMessageWithText('Confirm & Generate Costing')
        // Focus on input after action
        forceFocusInput()
      } else if (option === 'MODIFY') {
        // Put "Modify: " in input box and focus
        setInputMessage('Modify: ')
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
            // Move cursor to end
            const len = inputRef.current.value?.length || 0
            inputRef.current.setSelectionRange(len, len)
          }
        }, 100)
        return // Don't send message, let user complete it
      } else {
        // Single select - send immediately
        handleSendMessageWithText(option)
        // Focus on input after action
        forceFocusInput()
      }
    }
  }

  // Send message with specific text
  const handleSendMessageWithText = async (text: string) => {
    if (!text.trim() || isSending) return

    setIsSending(true)
    const userMessage: ExtendedMessage = {
      messageId: Date.now(),
      conversationId: Number(conversationId),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Reset textarea height to default
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = '40px'
    }

    const thinkingMessage: ExtendedMessage = {
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

      let replyText = await response.text()

      // Convert escaped newlines to actual newlines
      replyText = replyText.replace(/\\n/g, '\n')

      // Check if the message contains "select" or is asking about plant/customer/category
      // Also check for numbered lists that should be clickable
      const shouldShowButtons = /select/i.test(replyText) ||
                                /which\s+plant/i.test(replyText) ||
                                /which\s+customer/i.test(replyText) ||
                                /which\s+category/i.test(replyText) ||
                                /\*\*Customers:\*\*/i.test(replyText) ||
                                /Categories:/i.test(replyText) ||
                                /available\s+GSM/i.test(replyText) ||
                                /available\s+\w+.*:/i.test(replyText) ||
                                /choose\s+(one|from)/i.test(replyText) ||
                                /^\s*\d+\.\s+\d+\s*$/m.test(replyText)  // Numbered list of values like "1. 200"

      const isYesNoConfirmation = /Reply with:\s*\n?\s*YES\s+[–-]\s+Save/i.test(replyText) ||
                                  /YES\s+[–-]\s+Save.*NO\s+[–-]\s+Discard/i.test(replyText)

      const isMultiSelect = /select\s+processes/i.test(replyText)
      let { cleanText, options } = parseOptions(replyText)

      // If we have options from parsing, show them as buttons
      const hasNumberedOptions = options.length >= 2

      if (isYesNoConfirmation) {
        cleanText = replyText.replace(/Reply with:[\s\S]*$/i, '').trim()
        options = ['YES', 'NO']
      }

      // Check if this is a Job Specification Summary message with Confirm/Modify options
      const isJobSpecSummary = /Job Specification Summary/i.test(replyText) &&
                               (/Confirm.*Generate.*Costing/i.test(replyText) ||
                                /Modify.*Details/i.test(replyText))

      if (isJobSpecSummary) {
        // Remove everything from the dashes line onwards (including "Please review..." and numbered options)
        cleanText = replyText.replace(/-{5,}[\s\S]*$/g, '').trim()
        // Also try to remove numbered options if dashes weren't present
        cleanText = cleanText.replace(/\d+\.\s*[✅❌✏️✓✎]?\s*[✅❌✏️✓✎]?\s*(Confirm.*|Modify.*)$/gim, '').trim()
        cleanText = cleanText.replace(/Please review.*details\.?\s*/gi, '').trim()
        cleanText = cleanText.replace(/What would you like to do\?/i, '').trim()
        // Remove leading emoji from title (📋)
        cleanText = cleanText.replace(/^[📋📝📄]\s*/g, '').trim()
        options = ['CONFIRM', 'MODIFY']
      }

      // Show buttons if we have numbered options OR explicit triggers
      const showOptionsButtons = (shouldShowButtons && options.length > 0) || hasNumberedOptions || isYesNoConfirmation || isJobSpecSummary

      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.content !== 'Thinking...')
        return [...withoutThinking, {
          messageId: Date.now() + 2,
          conversationId: Number(conversationId),
          role: 'assistant',
          content: showOptionsButtons ? cleanText : replyText,
          timestamp: new Date().toISOString(),
          options: showOptionsButtons ? options : undefined,
          allowMultiSelect: isMultiSelect
        }]
      })
    } catch (error) {
      clientLogger.error('Error sending message:', error)
      setMessages(prev => prev.filter(m => m.content !== 'Thinking...'))
    } finally {
      setIsSending(false)
      // Focus back on input after sending
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // Multi-select submit handler - supports both string and number messageId for compatibility
  const handleMultiSelectSubmit = (messageId: string | number) => {
    const numericId = typeof messageId === 'string' ? Number(messageId) : messageId
    const selections = selectedOptions[numericId] || []
    if (selections.length > 0) {
      const message = selections.join(', ')
      handleSendMessageWithText(message)
      setSelectedOptions(prev => {
        const newState = { ...prev }
        delete newState[numericId]
        return newState
      })
      // Focus on input after submit with multiple attempts
      forceFocusInput()
    }
  }

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0">
          <AppHeader
            pageName={`Conversation #${conversationId}`}
            showBackButton={true}
            onBackClick={() => router.push('/chats')}
          />
        </div>

        {/* Main Content Area - fills remaining space */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Card className="flex-1 m-4 mb-0 flex flex-col min-h-0 overflow-hidden">
            <CardContent className="flex-1 p-0 flex flex-col min-h-0 overflow-hidden">
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
                    <p>Loading messages...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Scrollable Chat Area */}
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-4 p-4">
                      {messages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No messages yet</p>
                        </div>
                      )}
                      {messages.map((message) => {
                        const isCosting = isCostingSummary(message.content)
                        return (
                        <div key={message.messageId}>
                          <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full pr-2`}>
                            <div className={`relative group ${message.role === 'user' ? 'max-w-[85%] md:max-w-[40%]' : 'max-w-[95%] md:max-w-[40%]'} ${isCosting ? 'w-full' : ''}`}>
                              <div
                                className={`rounded-2xl text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden cursor-pointer transition-all active:scale-95 ${
                                  isCosting ? 'p-0 bg-transparent shadow-none w-full' : 'px-4 py-3 shadow-sm'
                                } ${
                                  message.role === 'user'
                                    ? 'bg-[#2F4669] text-white'
                                    : isCosting ? '' : 'bg-blue-50 text-foreground'
                                } ${copiedMessageId === message.messageId ? 'ring-2 ring-green-500' : ''}`}
                                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                onMouseDown={() => handleLongPressStart(message.content, message.messageId)}
                                onMouseUp={handleLongPressEnd}
                                onMouseLeave={handleLongPressEnd}
                                onTouchStart={() => handleLongPressStart(message.content, message.messageId)}
                                onTouchEnd={handleLongPressEnd}
                                onTouchCancel={handleLongPressEnd}
                              >
                                {message.content === 'Thinking...' ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                  </div>
                                ) : isCosting ? (
                                  renderCostingSummary(message.content)
                                ) : (
                                  <div className="text-sm">{renderTextWithBoldAndLinks(message.content)}</div>
                                )}
                              </div>

                              {/* Show "Copied" badge when copied */}
                              {copiedMessageId === message.messageId && (
                                <div className="absolute -top-3 -right-2 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full shadow-md text-xs font-medium">
                                  <Check className="h-3 w-3" />
                                  <span>Copied</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Display option buttons - use ActionButtonsRow for YES/NO or CONFIRM/MODIFY, ScrollableOptionsList for others */}
                          {message.options && message.options.length > 0 && (
                            <>
                              {/* Check if it's YES/NO or CONFIRM/MODIFY - use horizontal button row */}
                              {((message.options.length === 2 && message.options.includes('YES') && message.options.includes('NO')) ||
                                (message.options.length === 2 && message.options.includes('CONFIRM') && message.options.includes('MODIFY'))) ? (
                                <ActionButtonsRow
                                  options={message.options}
                                  messageId={String(message.messageId)}
                                  onOptionSelect={handleOptionSelect}
                                  isTyping={isSending}
                                />
                              ) : (
                                /* Use scrollable list for all other options */
                                <ScrollableOptionsList
                                  options={message.options}
                                  messageId={String(message.messageId)}
                                  isMultiSelect={message.allowMultiSelect || false}
                                  selectedOptions={selectedOptions[message.messageId] || []}
                                  onOptionSelect={handleOptionSelect}
                                  onMultiSelectSubmit={handleMultiSelectSubmit}
                                  isTyping={isSending}
                                  maxVisibleItems={5}
                                />
                              )}
                            </>
                          )}
                        </div>
                      )})}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </>
              )}
            </CardContent>
          </Card>

          {/* Fixed Input Area at Bottom */}
          <div className="shrink-0 border-t border-border/50 bg-background px-4 py-3 shadow-sm z-10">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 focus-within:border-primary">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                disabled={isSending}
                className={`h-9 w-9 shrink-0 rounded-full ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={isListening ? "Listening..." : "Message to Park Buddy..."}
                className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[40px] max-h-[120px] py-2"
                rows={1}
                autoFocus
                disabled={isSending}
                style={{
                  height: 'auto',
                  overflow: inputMessage.split('\n').length > 3 ? 'auto' : 'hidden'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full disabled:opacity-50 text-white"
                style={{ backgroundColor: "#2F4669" }}
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
