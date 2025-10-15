"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    // Start fade out animation after 2 seconds
    const fadeOutTimer = setTimeout(() => {
      setIsAnimatingOut(true)
    }, 2000)

    // Remove splash screen completely after fade out animation completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2500) // 2000ms display + 500ms fade out

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo with subtle shadow */}
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-lg">
          <Image src="/images/parkbuddy-logo.jpg" alt="Park Buddy Logo" fill className="object-contain" priority />
        </div>

        {/* Brand color accent dots */}
        <div className="flex gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#B92221", animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#005180", animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#0F5F74", animationDelay: "300ms" }}
          />
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#5AA538", animationDelay: "450ms" }}
          />
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#78BE20", animationDelay: "600ms" }}
          />
        </div>
      </div>
    </div>
  )
}
