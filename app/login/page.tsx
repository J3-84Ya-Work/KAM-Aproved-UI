"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { clientLogger } from "@/lib/logger"
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react"

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

  // OTP state
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [otpTimer, setOtpTimer] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername")
    const savedPassword = localStorage.getItem("rememberedPassword")
    if (savedUsername && savedPassword) {
      setFormData({ username: savedUsername, password: savedPassword })
      setRememberMe(true)
    }
  }, [])

  // OTP countdown timer
  useEffect(() => {
    if (step === 'otp' && otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [step, otpTimer])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(t); setCanResend(true); return 0 }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(t)
    }
  }, [resendCooldown])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Step 1: Validate credentials
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `/api/login?username=${encodeURIComponent(formData.username)}&password=${encodeURIComponent(formData.password)}`,
        { method: 'GET' }
      )

      const responseText = await response.text()

      if (!response.ok) {
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        setError("Invalid response from server")
        setIsLoading(false)
        return
      }

      if (typeof data === 'string') {
        try { data = JSON.parse(data) } catch {}
      }

      if (!Array.isArray(data) || data.length === 0) {
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      const user = data[0]
      clientLogger.log("User found:", user.UserName, user.RoleName)
      clientLogger.log("User object keys:", Object.keys(user))
      clientLogger.log("User full data:", JSON.stringify(user))

      // Store user data for after OTP
      setPendingUser(user)

      // Send 2FA OTP
      const email = user.EmailID || formData.username
      if (!email || !email.includes('@')) {
        // No email on file — skip OTP, login directly
        clientLogger.log("No email found, skipping OTP")
        completeLogin(user)
        return
      }

      clientLogger.log("Sending 2FA OTP | UserID:", user.UserID, "CompanyID:", user.CompanyID)

      const otpResponse = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          deviceId: 'web-login',
          userId: user.UserID,
          companyId: user.CompanyID,
          productionUnitId: user.ProductionUnitID,
          fYear: user.FYear,
        }),
      })

      const otpResult = await otpResponse.json()

      if (otpResult.success || otpResult.Success) {
        const validity = otpResult.data?.validitySeconds || otpResult.ExpirySeconds || 300
        setStep('otp')
        setOtpTimer(validity)
        setCanResend(false)
        setResendCooldown(60)
        setOtpValues(['', '', '', '', '', ''])
        setIsLoading(false)
        // Focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      } else {
        setError(otpResult.message || otpResult.Message || "Failed to send OTP. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      clientLogger.error("Login error:", error)
      setError("Login failed. Please check your credentials and try again.")
      setIsLoading(false)
    }
  }

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // digits only

    const newValues = [...otpValues]
    newValues[index] = value.slice(-1) // single digit
    setOtpValues(newValues)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits filled
    if (value && index === 5) {
      const fullOtp = newValues.join('')
      if (fullOtp.length === 6) {
        verifyOtp(fullOtp)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newValues = [...otpValues]
      for (let i = 0; i < 6; i++) {
        newValues[i] = pasted[i] || ''
      }
      setOtpValues(newValues)
      // Focus last filled or next empty
      const focusIndex = Math.min(pasted.length, 5)
      otpRefs.current[focusIndex]?.focus()
      // Auto-submit if all 6 pasted
      if (pasted.length === 6) {
        verifyOtp(pasted)
      }
    }
  }

  // Step 2: Verify OTP
  const verifyOtp = async (otp: string) => {
    if (!pendingUser) return
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          otp,
          deviceId: 'web-login',
          deviceName: navigator.userAgent,
          userId: pendingUser.UserID,
          companyId: pendingUser.CompanyID,
          productionUnitId: pendingUser.ProductionUnitID,
          fYear: pendingUser.FYear,
        }),
      })

      const result = await response.json()

      if (result.success || result.Success) {
        completeLogin(pendingUser)
      } else {
        setError(result.message || result.Message || "Invalid or expired OTP. Please try again.")
        setOtpValues(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
        setIsLoading(false)
      }
    } catch (error) {
      clientLogger.error("OTP verify error:", error)
      setError("Verification failed. Please try again.")
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    if (!pendingUser || !canResend) return
    setError("")
    setCanResend(false)

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend',
          deviceId: 'web-login',
          userId: pendingUser.UserID,
          companyId: pendingUser.CompanyID,
          productionUnitId: pendingUser.ProductionUnitID,
          fYear: pendingUser.FYear,
        }),
      })

      const result = await response.json()

      if (result.success || result.Success) {
        const validity = result.data?.validitySeconds || result.ExpirySeconds || 300
        setOtpTimer(validity)
        setResendCooldown(60)
        setOtpValues(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      } else {
        setError(result.message || result.Message || "Failed to resend OTP.")
        setCanResend(true)
      }
    } catch {
      setError("Failed to resend OTP. Please try again.")
      setCanResend(true)
    }
  }

  // Complete login — save auth data and redirect
  const completeLogin = (user: any) => {
    const userRole = user.RoleName || "KAM"

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
        designation: user.Designation || "",
        city: user.City || "",
        state: user.State || "",
        loginUserName: user.LoginUserName || formData.username,
      }),
    )

    document.cookie = `userAuth=${JSON.stringify(authData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`

    if (rememberMe) {
      localStorage.setItem("rememberedUsername", formData.username)
      localStorage.setItem("rememberedPassword", formData.password)
    } else {
      localStorage.removeItem("rememberedUsername")
      localStorage.removeItem("rememberedPassword")
    }

    window.dispatchEvent(new Event("profileUpdated"))

    setTimeout(() => {
      let redirectPath = "/"
      if (userRole === "KAM") redirectPath = "/"
      else if (userRole === "Purchase") redirectPath = "/rate-queries"
      else redirectPath = "/approvals"
      router.push(redirectPath)
    }, 500)
  }

  const maskedEmail = pendingUser?.EmailID
    ? pendingUser.EmailID.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4">
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

          {step === 'credentials' ? (
            <>
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
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </span>
                  ) : "Sign In"}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#005180]/10 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-[#005180]" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Verify Your Identity</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>OTP sent to <strong className="text-gray-900">{maskedEmail}</strong></span>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-6">
                <div className="flex justify-center gap-2 md:gap-3" onPaste={handleOtpPaste}>
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold text-[#005180] border-2 border-gray-300 rounded-xl focus:border-[#005180] focus:ring-2 focus:ring-[#005180]/30 outline-none transition-all bg-white shadow-sm"
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Code expires in <span className="font-semibold text-[#005180]">{formatTime(otpTimer)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-500 font-medium">OTP expired. Please resend.</p>
                  )}
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    {error}
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  onClick={() => {
                    const otp = otpValues.join('')
                    if (otp.length === 6) verifyOtp(otp)
                  }}
                  disabled={isLoading || otpValues.join('').length < 6 || otpTimer === 0}
                  className="w-full h-12 lg:h-14 text-base lg:text-lg font-medium bg-[#005180] hover:bg-[#004875] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-lg shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </span>
                  ) : "Verify & Sign In"}
                </Button>

                {/* Resend + Back */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setError(''); setPendingUser(null) }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend}
                    className={`text-sm font-medium transition-colors ${
                      canResend
                        ? 'text-[#005180] hover:text-[#004875] cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canResend ? 'Resend OTP' : `Resend in ${resendCooldown}s`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
