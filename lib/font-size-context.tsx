"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { clientLogger } from "@/lib/logger"

type FontSize = "small" | "medium" | "large"

interface FontSizeContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("large")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedSize = localStorage.getItem("fontSize") as FontSize
    if (savedSize && ["small", "medium", "large"].includes(savedSize)) {
      setFontSizeState(savedSize)
      applyFontSize(savedSize)
    } else {
      applyFontSize("large")
    }
  }, [])

  const applyFontSize = (size: FontSize) => {
    const html = document.documentElement

    // Remove all font size classes
    html.classList.remove("text-size-small", "text-size-medium", "text-size-large")

    // Force a reflow to ensure the removal is processed
    void html.offsetHeight

    // Add the new class
    html.classList.add(`text-size-${size}`)

    // Also set the font-size directly on the html element for better mobile support
    const fontSizes = {
      small: "16px",
      medium: "18px",
      large: "20px",
    }
    html.style.fontSize = fontSizes[size]

    clientLogger.log("[v0] Font size applied:", size, "- HTML font-size:", html.style.fontSize)
  }

  const setFontSize = (size: FontSize) => {
    clientLogger.log("[v0] Setting font size to:", size)
    setFontSizeState(size)
    localStorage.setItem("fontSize", size)
    applyFontSize(size)
  }

  const increaseFontSize = () => {
    if (fontSize === "small") setFontSize("medium")
    else if (fontSize === "medium") setFontSize("large")
  }

  const decreaseFontSize = () => {
    if (fontSize === "large") setFontSize("medium")
    else if (fontSize === "medium") setFontSize("small")
  }

  if (!mounted) {
    return null
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, increaseFontSize, decreaseFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() {
  const context = useContext(FontSizeContext)
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider")
  }
  return context
}
