"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

// Hardcoded user credentials with roles
const USERS = [
  { email: "kam@parksons", password: "kam@123", name: "KAM User", role: "KAM" },
  { email: "hod@parksons", password: "hod@123", name: "HOD User", role: "H.O.D" },
  { email: "vertical@parksons", password: "vertical@123", name: "Vertical Head User", role: "Vertical Head" },
]

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Find matching user
    const user = USERS.find(
      (u) => u.email === formData.email && u.password === formData.password
    )

    if (!user) {
      setError("Invalid email or password")
      setIsLoading(false)
      return
    }

    const authData = {
      name: user.name,
      email: user.email,
      role: user.role,
      loggedInAt: new Date().toISOString(),
    }

    localStorage.setItem("userAuth", JSON.stringify(authData))
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        name: user.name,
        email: user.email,
        phone: "",
        company: "Parksons",
        role: user.role,
      }),
    )

    console.log("[v0] User logged in:", authData)

    // Dispatch event to notify other components
    window.dispatchEvent(new Event("profileUpdated"))

    setTimeout(() => {
      if (user.role === "KAM") {
        router.push("/") // KAM goes to home/new chat
      } else {
        router.push("/dashboard") // Vertical Head and H.O.D go to dashboard
      }
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <Image src="/images/parkbuddy-logo.jpg" alt="Park Buddy Logo" fill className="object-contain" priority />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
          <p className="text-gray-600">Sign in to your ParkBuddy</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 text-base border-gray-300 focus:border-[#0F5F74] focus:ring-[#0F5F74]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 text-base border-gray-300 focus:border-[#0F5F74] focus:ring-[#0F5F74] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-[#2F4669] hover:bg-[#1f2f47] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-500">Your AI Sales Assistant is ready to help</p>
      </div>
    </div>
  )
}
