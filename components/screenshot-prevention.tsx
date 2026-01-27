"use client"

import { useEffect, useCallback, useState, useRef } from "react"

/**
 * ScreenshotPrevention Component - Aggressive Version
 *
 * Uses multiple detection methods:
 * 1. Window blur detection (catches most screenshot tools)
 * 2. Visibility API
 * 3. Keyboard shortcuts (as backup)
 * 4. Focus loss detection
 */
export function ScreenshotPrevention() {
  const [showBlackScreen, setShowBlackScreen] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFocusTimeRef = useRef<number>(Date.now())

  // Show black screen overlay
  const showBlackOverlay = useCallback((message: string, duration: number = 2000) => {
    setWarningMessage(message)
    setShowBlackScreen(true)

    // Hide after duration
    setTimeout(() => {
      setShowBlackScreen(false)
      setWarningMessage("")
    }, duration)
  }, [])

  // Handle window blur - this catches most screenshot tools on Mac
  const handleWindowBlur = useCallback(() => {
    // Show black screen immediately when window loses focus
    // This catches Cmd+Shift+3/4/5 on Mac as they briefly remove focus
    setWarningMessage("Content Protected")
    setShowBlackScreen(true)

    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
  }, [])

  // Handle window focus - restore screen when focus returns
  const handleWindowFocus = useCallback(() => {
    // Small delay before hiding to ensure screenshot captured black screen
    blurTimeoutRef.current = setTimeout(() => {
      setShowBlackScreen(false)
      setWarningMessage("")
    }, 300)

    lastFocusTimeRef.current = Date.now()
  }, [])

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setWarningMessage("Content Protected")
      setShowBlackScreen(true)
    } else {
      // Delay hiding when becoming visible again
      setTimeout(() => {
        setShowBlackScreen(false)
        setWarningMessage("")
      }, 300)
    }
  }, [])

  // Block keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Block PrintScreen
    if (e.key === "PrintScreen" || e.keyCode === 44) {
      e.preventDefault()
      e.stopPropagation()
      navigator.clipboard.writeText("").catch(() => {})
      showBlackOverlay("Screenshots are not allowed", 3000)
      return false
    }

    // Block Ctrl/Cmd+P (Print)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
      e.preventDefault()
      e.stopPropagation()
      showBlackOverlay("Printing is not allowed", 3000)
      return false
    }

    // Block Ctrl/Cmd+S (Save)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault()
      e.stopPropagation()
      showBlackOverlay("Saving is not allowed", 2000)
      return false
    }

    // Block F12 and DevTools shortcuts
    if (e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c", "u"].includes(e.key.toLowerCase()))) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }, [showBlackOverlay])

  // Block right-click
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    showBlackOverlay("Right-click is disabled", 1500)
    return false
  }, [showBlackOverlay])

  // Block copy (except in inputs)
  const handleCopy = useCallback((e: ClipboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return true
    }
    e.preventDefault()
    e.stopPropagation()
    return false
  }, [])

  // Block drag
  const handleDragStart = useCallback((e: DragEvent) => {
    e.preventDefault()
    return false
  }, [])

  // Print prevention
  const handleBeforePrint = useCallback(() => {
    showBlackOverlay("Printing is not allowed", 5000)
  }, [showBlackOverlay])

  useEffect(() => {
    // Window focus/blur - PRIMARY detection method
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("focus", handleWindowFocus)

    // Visibility API - catches tab switches and some screenshot tools
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyDown, { capture: true })

    // Context menu
    document.addEventListener("contextmenu", handleContextMenu, { capture: true })

    // Copy prevention
    document.addEventListener("copy", handleCopy, { capture: true })

    // Drag prevention
    document.addEventListener("dragstart", handleDragStart, { capture: true })

    // Print prevention
    window.addEventListener("beforeprint", handleBeforePrint)

    // Clear clipboard periodically (catches delayed clipboard access)
    const clipboardInterval = setInterval(() => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Only clear if we recently showed black screen
        if (showBlackScreen) {
          navigator.clipboard.writeText("").catch(() => {})
        }
      }
    }, 500)

    // Add CSS for print prevention
    const printStyle = document.createElement("style")
    printStyle.id = "screenshot-prevention-style"
    printStyle.textContent = `
      @media print {
        html, body, * {
          display: none !important;
          visibility: hidden !important;
        }
      }
    `
    document.head.appendChild(printStyle)

    // Cleanup
    return () => {
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("focus", handleWindowFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("keydown", handleKeyDown, { capture: true })
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true })
      document.removeEventListener("copy", handleCopy, { capture: true })
      document.removeEventListener("dragstart", handleDragStart, { capture: true })
      window.removeEventListener("beforeprint", handleBeforePrint)
      clearInterval(clipboardInterval)

      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }

      const style = document.getElementById("screenshot-prevention-style")
      if (style) style.remove()
    }
  }, [handleWindowBlur, handleWindowFocus, handleVisibilityChange, handleKeyDown, handleContextMenu, handleCopy, handleDragStart, handleBeforePrint, showBlackScreen])

  // Black screen overlay
  if (showBlackScreen) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000000",
          zIndex: 2147483647, // Maximum z-index
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Shield Icon */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ marginBottom: "24px", opacity: 0.9 }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>

        {warningMessage && (
          <div
            style={{
              fontSize: "24px",
              fontWeight: "600",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            {warningMessage}
          </div>
        )}

        <div
          style={{
            fontSize: "14px",
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          This content is protected
        </div>
      </div>
    )
  }

  return null
}
