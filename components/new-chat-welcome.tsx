"use client"
import { useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Send, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewChatWelcomeProps {
  onStartChat?: (message: string) => void
  onOpenChat?: (chatId: string) => void
  userName?: string
}

export function NewChatWelcome({ onStartChat, onOpenChat, userName = "User" }: NewChatWelcomeProps) {
  const [inputValue, setInputValue] = useState("")
  const [step, setStep] = useState<"initial" | "jobName" | "clientName">("initial")
  const [jobName, setJobName] = useState("")
  const [clientName, setClientName] = useState("")
  const router = useRouter()

  const handleStartChat = () => {
    const value = inputValue.trim()
    if (!value) return

    if (step === "initial") {
      // First input - move to job name step
      setStep("jobName")
      setInputValue("")
    } else if (step === "jobName") {
      // Second input - save job name and move to client name
      setJobName(value)
      setStep("clientName")
      setInputValue("")
    } else if (step === "clientName") {
      // Third input - save client name and start chat
      setClientName(value)
      if (onStartChat) {
        // Start chat with all collected information
        const initialMessage = `I want costing for job: ${jobName}, client: ${value}`
        onStartChat(initialMessage)
      }
      // Reset states
      setInputValue("")
      setStep("initial")
      setJobName("")
      setClientName("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleStartChat()
    }
  }

  const handleQuickSelect = () => {
    // Start the job name collection flow
    setStep("jobName")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex flex-1 max-w-[600px] mx-auto flex-col items-center justify-center bg-background px-4 md:px-6 pb-24 md:pb-6">
        <div className="w-full max-w-2xl space-y-6 md:space-y-8 text-center">
          <div className="space-y-2 md:space-y-3 message-fade-in">
            <h1 className="text-xl md:text-3xl font-semibold text-foreground">
              {step === "initial" && "How can I help you?"}
              {step === "jobName" && "What is the Job Name?"}
              {step === "clientName" && "What is the Client Name?"}
            </h1>
          </div>

          <div className="relative mx-auto w-full message-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5 md:py-3 shadow-sm input-focus-glow focus-within:border-primary">
              <Mic className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  step === "initial"
                    ? "Start your AI chat here..."
                    : step === "jobName"
                    ? "Enter job name..."
                    : "Enter client name..."
                }
                className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {inputValue.trim() && (
                <Button
                  onClick={handleStartChat}
                  size="icon"
                  className="h-10 w-10 md:h-9 md:w-9 shrink-0 rounded-xl button-hover-lift"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {step === "initial" && (
            <div className="space-y-3 message-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleQuickSelect}
                  className="rounded-xl border-border px-5 py-3.5 md:py-3 text-sm button-hover-lift bg-transparent min-h-[44px]"
                >
                  Start AI Chat
                </Button>
              </div>
            </div>
          )}
          {step !== "initial" && jobName && (
            <div className="text-sm text-muted-foreground message-fade-in">
              Job Name: <span className="font-semibold text-foreground">{jobName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
