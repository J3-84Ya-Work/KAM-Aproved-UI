"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Send, Mic, MessageSquare, Calculator, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ParkBuddyLogo } from "@/components/parkbuddy-logo"
import { cn } from "@/lib/utils"

interface NewChatWelcomeProps {
  onStartChat?: (message: string) => void
  onOpenChat?: (chatId: string) => void
  userName?: string
}

export function NewChatWelcome({ onStartChat, onOpenChat, userName = "User" }: NewChatWelcomeProps) {
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputValue(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return

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

  const handleStartChat = () => {
    const value = inputValue.trim()
    if (!value) return

    // Navigate to new chat with message
    router.push(`/chat/new?message=${encodeURIComponent(value)}`)
    setInputValue("")
  }

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/chat/new?message=${encodeURIComponent(suggestion)}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleStartChat()
    }
  }

  const suggestions = [
    { icon: MessageSquare, label: 'Ask a printing question' },
    { icon: Calculator, label: 'Start a cost estimate' },
    { icon: ClipboardCheck, label: 'Get business insights', small: true },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex flex-1 max-w-[600px] mx-auto flex-col items-center justify-center bg-background px-4 md:px-6 pb-24 md:pb-6">
        <div className="w-full max-w-2xl space-y-6 md:space-y-8 text-center">
          {/* Welcome Text */}
          <div className="flex flex-col items-center space-y-3 md:space-y-4 message-fade-in">
            <p className="text-xl md:text-2xl text-[#78BE20] font-semibold">
              Hello, {userName}!
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#005180]">
              I'm ParkBuddy
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto px-4">
              Your AI assistant, built for the world of printing.
            </p>
          </div>

          {/* Input Box */}
          <div className="relative mx-auto w-full message-fade-in px-2" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 md:gap-3 rounded-2xl border-2 border-gray-300 bg-white px-3 md:px-4 py-3 md:py-3.5 shadow-md focus-within:border-[#005180] focus-within:ring-2 focus-within:ring-[#005180]/20 transition-all">
              <button onClick={handleVoiceInput} className="shrink-0">
                <Mic className={cn(
                  "h-6 w-6 md:h-5 md:w-5 shrink-0 cursor-pointer active:scale-95 transition-all",
                  isListening ? "text-red-500 animate-pulse" : "text-[#005180] hover:text-[#004570]"
                )} />
              </button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask ParkBuddy anything..."}
                className="flex-1 border-0 bg-transparent text-base md:text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isListening}
              />
              {inputValue.trim() && (
                <Button
                  onClick={handleStartChat}
                  size="icon"
                  className="h-11 w-11 md:h-10 md:w-10 shrink-0 rounded-full bg-[#005180] hover:bg-[#004570] active:scale-95 transition-transform"
                >
                  <Send className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Suggestions Below */}
          <div className="flex flex-col gap-2.5 md:gap-2 message-fade-in w-full" style={{ animationDelay: "200ms" }}>
            {/* First Row - 2 Buttons */}
            <div className="grid grid-cols-2 gap-2.5 md:gap-2 w-full">
              {suggestions.slice(0, 2).map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.label)}
                  className="flex items-center justify-center gap-1.5 px-2 py-3.5 md:py-2.5 rounded-xl md:rounded-lg border border-gray-200 bg-white text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-[#005180]/40 hover:bg-[#005180]/5 active:scale-98 transition-all duration-200 shadow-sm min-h-[48px] md:min-h-0"
                >
                  <s.icon className="w-4 h-4 md:w-4 md:h-4 shrink-0" />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            {/* Second Row - 1 Centered Button */}
            <div className="w-full flex justify-center">
              {(() => {
                const s = suggestions[2]
                return (
                  <button
                    onClick={() => handleSuggestionClick(s.label)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:py-2.5 rounded-xl md:rounded-lg border border-gray-200 bg-white text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-[#005180]/40 hover:bg-[#005180]/5 active:scale-98 transition-all duration-200 shadow-sm min-h-[40px] md:min-h-0 w-auto"
                  >
                    <s.icon className="w-4 h-4 md:w-4 md:h-4 shrink-0" />
                    <span>{s.label}</span>
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
