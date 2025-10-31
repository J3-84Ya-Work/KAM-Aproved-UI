"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Send, Loader2, Mic, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sendMessage } from "@/lib/chat-api"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isLoading?: boolean
  options?: string[]
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
}: { chatId?: string | null; initialMessage?: string | null; onBackToWelcome?: () => void }) {
  const router = useRouter()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

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
          console.error('Speech recognition error:', event.error)
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
    async (messageText: string, { showUserMessage = true, isFirstMessage = false }: { showUserMessage?: boolean; isFirstMessage?: boolean } = {}) => {
      const content = messageText.trim()
      if (!content) return

      const timestamp = new Date()

      // Only show user message if it's not the first auto-started message
      if (showUserMessage && !isFirstMessage) {
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
        // If this is the first message, send "I want costing" to API
        // Otherwise send the actual user message
        const messageToAPI = isFirstMessage ? "I want costing" : content
        const response = await sendMessage(messageToAPI)

        if (response.success && response.data) {
          const aiResponseText =
            response.data.reply ||
            response.data.message ||
            response.data.response ||
            response.data.text ||
            (typeof response.data === "string" ? response.data : null) ||
            JSON.stringify(response.data)

          const { cleanText, options } = parseOptions(aiResponseText)

          const aiMessage: Message = {
            id: `${Date.now()}-ai`,
            content: options.length > 0 ? cleanText : aiResponseText,
            sender: "ai",
            timestamp: new Date(),
            options: options.length > 0 ? options : undefined,
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
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)

      if (initialMessage) {
        // Mark this as the first message so it sends "I want costing" to API
        // but displays the user's original message in the chat
        sendChatMessage(initialMessage, { isFirstMessage: true })
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [initialMessage, sendChatMessage])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        // Smooth scroll to bottom with a slight delay to ensure content is rendered
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const messageText = inputValue
    setInputValue("")
    sendChatMessage(messageText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
        console.error('Error starting speech recognition:', error)
      }
    }
  }

  const handleOptionSelect = (option: string) => {
    sendChatMessage(option)
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
              <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm whitespace-pre-wrap ${
                    message.sender === "user" ? "chat-bubble-user text-foreground" : "chat-bubble-ai text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>

              {/* Display option buttons if available */}
              {message.options && message.options.length > 0 && (
                <div className="flex flex-col gap-2 mt-3 ml-0">
                  {message.options.map((option, optionIndex) => (
                    <Button
                      key={`${message.id}-option-${optionIndex}`}
                      variant="outline"
                      onClick={() => handleOptionSelect(option)}
                      disabled={isTyping}
                      className="justify-start text-left h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary transition-all"
                    >
                      <span className="font-semibold mr-2 text-primary">{optionIndex + 1}.</span>
                      <span>{option}</span>
                    </Button>
                  ))}
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
        </div>
      </ScrollArea>

      {/* Fixed Input Area */}
      <div className="border-t border-border/50 bg-background px-4 py-3 shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 input-focus-glow focus-within:border-primary">
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
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Message AI Assistant..."}
            className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
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
