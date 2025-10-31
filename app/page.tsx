"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { NewChatWelcome } from "@/components/new-chat-welcome"
import { AICostingChat } from "@/components/ai-costing-chat"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function Page() {
  const router = useRouter()
  const [chatStarted, setChatStarted] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [userName, setUserName] = useState("User")
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  useEffect(() => {
    console.log("[v0] Checking authentication status")
    const authData = localStorage.getItem("userAuth")

    if (!authData) {
      console.log("[v0] No auth data found, redirecting to login")
      router.push("/login")
      return
    }

    try {
      const auth = JSON.parse(authData)
      console.log("[v0] User authenticated:", auth)

      // Extract first name
      if (auth.name) {
        const firstName = auth.name.split(" ")[0]
        setUserName(firstName)
        console.log("[v0] Set userName to:", firstName)
      }

      setIsAuthChecked(true)
    } catch (error) {
      console.error("[v0] Error parsing auth data:", error)
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    console.log("[v0] useEffect running - checking for user profile in localStorage")

    const loadUserName = () => {
      const authData = localStorage.getItem("userAuth")
      console.log("[v0] localStorage.getItem('userAuth'):", authData)

      if (authData) {
        try {
          const auth = JSON.parse(authData)
          console.log("[v0] Parsed auth:", auth)
          if (auth.name) {
            const firstName = auth.name.split(" ")[0]
            setUserName(firstName)
            console.log("[v0] Set userName to:", firstName)
          }
        } catch (error) {
          console.error("[v0] Error loading user profile:", error)
        }
      } else {
        console.log("[v0] No profile data found in localStorage")
      }
    }

    // Load on mount
    loadUserName()

    const handleProfileUpdate = () => {
      loadUserName()
      console.log("[v0] Profile updated, reloading user name")
    }

    window.addEventListener("profileUpdated", handleProfileUpdate)
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate)
  }, [])

  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isAuthChecked) return

    const chatIdParam = searchParams.get("chatId")
    const autoStartParam = searchParams.get("autoStart")

    if (chatIdParam) {
      console.log("[v0] Loading chat from URL param:", chatIdParam)
      handleOpenChat(chatIdParam)
    } else if (autoStartParam === "true") {
      console.log("[v0] Auto-starting new chat with 'I want costing'")
      handleStartChat("I want costing")
    }
  }, [searchParams, isAuthChecked])

  const handleStartChat = (message: string) => {
    console.log("[v0] Starting new chat with message:", message)
    setInitialMessage(message)
    setChatId(null)
    setChatStarted(true)
  }

  const handleOpenChat = (id: string) => {
    console.log("[v0] Opening existing chat with ID:", id)
    setChatId(id)
    setInitialMessage(null)
    setChatStarted(true)
  }

  const handleBackToWelcome = () => {
    console.log("[v0] Returning to welcome screen - resetting chat state")
    setChatStarted(false)
    setInitialMessage(null)
    setChatId(null)
  }

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  if (!isAuthChecked) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader onMenuClick={handleMenuClick} showBackButton={chatStarted} />
        <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] relative overflow-hidden">
          <div
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              !chatStarted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
            }`}
          >
            <NewChatWelcome onStartChat={handleStartChat} onOpenChat={handleOpenChat} userName={userName} />
          </div>
          <div
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              chatStarted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
            }`}
          >
            {chatStarted && (
              <AICostingChat initialMessage={initialMessage} chatId={chatId} onBackToWelcome={handleBackToWelcome} />
            )}
          </div>
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
