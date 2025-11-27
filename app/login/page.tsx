"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { clientLogger } from "@/lib/logger"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Load saved credentials on component mount
  useEffect(() => {
    clientLogger.log("🔐 Login page loaded")

    const savedUsername = localStorage.getItem("rememberedUsername")
    const savedPassword = localStorage.getItem("rememberedPassword")
    if (savedUsername && savedPassword) {
      clientLogger.log("✅ Found remembered credentials for:", savedUsername)
      setFormData({ username: savedUsername, password: savedPassword })
      setRememberMe(true)
    } else {
      clientLogger.log("ℹ️ No remembered credentials found")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    clientLogger.log("🔐 Login attempt started")
      clientLogger.log("📧 Username entered:", formData.username)

    try {
      // Call the login API with JSON body
      const requestBody = {
        UserName: formData.username,
        Password: formData.password,
      }

      clientLogger.log('🔗 Using login proxy API')
      clientLogger.log('📦 Request body:', requestBody)

      // Use our proxy API endpoint to handle GET with body on server side
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      clientLogger.log('📊 Response status code:', response.status)
      clientLogger.log('📊 Login API response status:', response.ok)

      // Get response text first to see what we're receiving
      const responseText = await response.text()
      clientLogger.log('📊 Raw response text:', responseText)

      if (!response.ok) {
        clientLogger.log("❌ Login failed: API error")
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
        clientLogger.log('📊 Login API response data:', data)
      } catch (e) {
        clientLogger.error('❌ Failed to parse response as JSON:', e)
      clientLogger.error('Response was:', responseText.substring(0, 200))
        setError("Invalid response from server")
        setIsLoading(false)
        return
      }

      // Handle double-encoded JSON string response
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          clientLogger.error('Failed to parse JSON string:', e)
        }
      }

      // Check if user data exists
      if (!Array.isArray(data) || data.length === 0) {
        clientLogger.log("❌ Login failed: No user found")
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      const user = data[0]
      clientLogger.log("✅ User found:", user.UserName, user.Designation)

      // Determine role based on designation
      let userRole = "KAM" // Default role
      if (user.Designation && typeof user.Designation === 'string') {
        const designation = user.Designation.toLowerCase()
        if (designation.includes('head') || designation.includes('officer')) {
          userRole = "Vertical Head"
        } else if (designation.includes('manager') || designation.includes('hod')) {
          userRole = "H.O.D"
        } else if (designation.includes('purchase')) {
          userRole = "Purchase"
        }
      }

      // Map user data to our auth structure
      const authData = {
        name: user.UserName,
        email: user.EmailID || formData.username,
        role: userRole,
        loggedInAt: new Date().toISOString(),
        userId: user.UserID,
        companyId: user.CompanyID,
        fyear: user.FYear,
        productionUnitId: user.ProductionUnitID,
      }

      localStorage.setItem("userAuth", JSON.stringify(authData))
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          name: user.UserName,
          email: user.EmailID || formData.username,
          phone: user.ContactNo || "",
          company: user.CompanyName || "Parksons",
          role: userRole,
        }),
      )

      // Also set cookie for server-side middleware
      document.cookie = `userAuth=${JSON.stringify(authData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`

      clientLogger.log("✅ Auth data saved to localStorage and cookie")
      clientLogger.log("[v0] User logged in:", authData)

      // Handle Remember Me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username)
        localStorage.setItem("rememberedPassword", formData.password)
        clientLogger.log("✅ Remember Me credentials saved")
      } else {
        localStorage.removeItem("rememberedUsername")
        localStorage.removeItem("rememberedPassword")
        clientLogger.log("✅ Remember Me credentials cleared")
      }

      // Dispatch event to notify other components
      window.dispatchEvent(new Event("profileUpdated"))
      clientLogger.log("✅ profileUpdated event dispatched")

      setTimeout(() => {
        let redirectPath = "/"
        if (userRole === "KAM") {
          redirectPath = "/"
        } else if (userRole === "Purchase") {
          redirectPath = "/rate-queries"
        } else {
          redirectPath = "/approvals"
        }
        clientLogger.log("🔄 Redirecting to:", redirectPath)
        router.push(redirectPath)
      }, 500)
    } catch (error) {
      clientLogger.error("❌ Login error:", error)
      setError("Login failed. Please check your credentials and try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4">
      {/* Desktop: Two-column layout, Mobile: Single column */}
      <div className="w-full max-w-md lg:max-w-6xl lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

        {/* Left side - Branding (Desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:justify-center lg:pr-12">
          <div className="relative w-64 h-64 mx-auto">
            <Image src="/images/parkbuddy-logo.jpg" alt="Park Buddy Logo" fill className="object-contain" priority />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full space-y-8 animate-fade-in lg:bg-white lg:p-10 lg:rounded-2xl lg:shadow-xl lg:border lg:border-gray-200">
          {/* Logo (Mobile only) */}
          <div className="flex justify-center lg:hidden">
            <div className="relative w-32 h-32">
              <Image src="/images/parkbuddy-logo.jpg" alt="Park Buddy Logo" fill className="object-contain" priority />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 lg:text-lg">Sign in to continue to ParkBuddy</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 lg:text-base">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="h-12 lg:h-14 text-base lg:text-lg border-gray-300 focus:border-[#005180] focus:ring-[#005180] focus:ring-2 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 lg:text-base">
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
                    className="h-12 lg:h-14 text-base lg:text-lg border-gray-300 focus:border-[#005180] focus:ring-[#005180] focus:ring-2 pr-12 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm lg:text-base text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 lg:p-4">
                  {error}
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#005180] focus:ring-[#005180] focus:ring-2 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm lg:text-base text-gray-700 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 lg:h-14 text-base lg:text-lg font-medium bg-[#005180] hover:bg-[#004875] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-lg shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  )
}
