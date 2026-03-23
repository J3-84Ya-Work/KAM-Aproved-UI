"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { KeyRound, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { clientLogger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const { toast } = useToast()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    designation: "",
    city: "",
    state: "",
    loginUserName: "",
  })

  // Reset Password State
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'newPassword' | 'success'>('request')
  const [resetLoading, setResetLoading] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpVerified, setOtpVerified] = useState(false)
  const [verifiedOtp, setVerifiedOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [otpTimer, setOtpTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const authData = localStorage.getItem("userAuth")
    const savedProfile = localStorage.getItem("userProfile")

    if (authData) {
      try {
        const auth = JSON.parse(authData)
        const profileData = savedProfile ? JSON.parse(savedProfile) : {}

        const mergedProfile = {
          name: auth.name || profileData.name || "",
          email: auth.email || profileData.email || "",
          phone: profileData.phone || "",
          company: profileData.company || "",
          role: profileData.role || auth.role || "",
          designation: profileData.designation || "",
          city: profileData.city || "",
          state: profileData.state || "",
          loginUserName: profileData.loginUserName || "",
        }

        setProfile(mergedProfile)
        clientLogger.log("[v0] Loaded profile from auth and localStorage:", mergedProfile)
      } catch (error) {
        clientLogger.error("[v0] Error loading profile:", error)
      }
    } else if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(prev => ({ ...prev, ...parsedProfile }))
        clientLogger.log("[v0] Loaded profile from localStorage:", parsedProfile)
      } catch (error) {
        clientLogger.error("[v0] Error loading profile:", error)
      }
    }
  }, [])

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [otpTimer])

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  // ─── Reset Password Handlers ────────────────────────────────────────

  const handleRequestOtp = async () => {
    if (!profile.email || !profile.email.includes('@')) {
      toast({ title: "Error", description: "No valid email found on your profile.", variant: "destructive" })
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', email: profile.email }),
      })
      const data = await res.json()

      if (data.success) {
        setResetStep('verify')
        setOtpTimer(300) // 5 min
        setResendCooldown(60)
        toast({ title: "OTP Sent", description: `Verification code sent to ${maskEmail(profile.email)}` })
      } else {
        toast({ title: "Error", description: data.message || "Failed to send OTP", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" })
    } finally {
      setResetLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    await handleRequestOtp()
  }

  const handleVerifyOtp = async () => {
    const code = otpCode.join('')
    if (code.length !== 6) {
      toast({ title: "Error", description: "Please enter the complete 6-digit code", variant: "destructive" })
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', email: profile.email, otpCode: code }),
      })
      const data = await res.json()

      if (data.success && data.data?.isValid) {
        setOtpVerified(true)
        setVerifiedOtp(code)
        setResetStep('newPassword')
        toast({ title: "Verified", description: "OTP verified. Set your new password." })
      } else {
        toast({ title: "Invalid OTP", description: data.message || "The code you entered is incorrect.", variant: "destructive" })
        setOtpCode(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" })
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', email: profile.email, otpCode: verifiedOtp, newPassword }),
      })
      const data = await res.json()

      if (data.success) {
        setResetStep('success')
        toast({ title: "Password Reset", description: "Your password has been changed successfully." })
      } else {
        toast({ title: "Error", description: data.message || "Failed to reset password", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" })
    } finally {
      setResetLoading(false)
    }
  }

  const handleCloseResetPassword = () => {
    setShowResetPassword(false)
    setResetStep('request')
    setOtpCode(['', '', '', '', '', ''])
    setOtpVerified(false)
    setVerifiedOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setOtpTimer(0)
    setResendCooldown(0)
  }

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otpCode]
    newOtp[index] = value.slice(-1)
    setOtpCode(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOtp(), 100)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return
    const newOtp = [...otpCode]
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newOtp[i] = pasted[i]
    }
    setOtpCode(newOtp)
    const nextIndex = Math.min(pasted.length, 5)
    otpRefs.current[nextIndex]?.focus()

    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOtp(), 100)
    }
  }

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@')
    if (!user || !domain) return email
    const masked = user.substring(0, 2) + '***'
    return `${masked}@${domain}`
  }

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Profile" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-4 p-4 pb-20 md:p-6 md:pb-6 bg-gradient-to-b from-white to-gray-50 overflow-auto">
          <Card className="overflow-hidden border-0 shadow-sm animate-slide-in">
            <div className="relative h-32 bg-gradient-to-r from-[#0F5F74] to-[#69B12C]">
              <div className="absolute -bottom-16 left-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl font-bold bg-[#005180] text-white">
                    {getInitials(profile.name || 'U')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="pt-20 p-6 space-y-6">
              <div className="flex justify-end gap-2">
                {!showResetPassword && (
                  <Button
                    onClick={() => setShowResetPassword(true)}
                    variant="outline"
                    className="border-[#005180] text-[#005180] hover:bg-[#005180]/10"
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                )}
              </div>

              {/* Reset Password Section */}
              {showResetPassword && (
                <Card className="border border-[#005180]/20 bg-[#005180]/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#005180] flex items-center gap-2">
                      <KeyRound className="w-5 h-5" />
                      Reset Password
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleCloseResetPassword} className="text-gray-500 hover:text-gray-700">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>

                  {/* Step 1: Request OTP */}
                  {resetStep === 'request' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        We'll send a verification code to your registered email to verify your identity.
                      </p>
                      <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Email Address</div>
                        <div className="text-sm font-medium text-gray-900">{profile.email}</div>
                      </div>
                      <Button
                        onClick={handleRequestOtp}
                        disabled={resetLoading}
                        className="w-full bg-[#005180] hover:bg-[#004570] text-white"
                      >
                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Send Verification Code
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Enter OTP */}
                  {resetStep === 'verify' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Enter the 6-digit code sent to <span className="font-medium">{maskEmail(profile.email)}</span>
                      </p>

                      {otpTimer > 0 && (
                        <div className="text-center text-sm text-gray-500">
                          Code expires in <span className="font-mono font-semibold text-[#005180]">{formatTimer(otpTimer)}</span>
                        </div>
                      )}

                      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                        {otpCode.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => { otpRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className="w-11 h-13 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#005180] focus:ring-2 focus:ring-[#005180]/20 outline-none transition-all bg-white"
                            autoFocus={i === 0}
                          />
                        ))}
                      </div>

                      <Button
                        onClick={handleVerifyOtp}
                        disabled={resetLoading || otpCode.join('').length !== 6}
                        className="w-full bg-[#005180] hover:bg-[#004570] text-white"
                      >
                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Verify Code
                      </Button>

                      <div className="text-center">
                        <button
                          onClick={handleResendOtp}
                          disabled={resendCooldown > 0 || resetLoading}
                          className="text-sm text-[#005180] hover:underline disabled:text-gray-400 disabled:no-underline"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: New Password */}
                  {resetStep === 'newPassword' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Create your new password. Must be at least 6 characters.
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-semibold">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-red-500">Passwords do not match</p>
                        )}
                      </div>

                      <Button
                        onClick={handleResetPassword}
                        disabled={resetLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                        className="w-full bg-[#005180] hover:bg-[#004570] text-white"
                      >
                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Reset Password
                      </Button>
                    </div>
                  )}

                  {/* Step 4: Success */}
                  {resetStep === 'success' && (
                    <div className="text-center space-y-3 py-4">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                      <h4 className="text-lg font-semibold text-gray-900">Password Changed!</h4>
                      <p className="text-sm text-gray-600">
                        Your password has been reset successfully. Use your new password next time you log in.
                      </p>
                      <Button
                        onClick={handleCloseResetPassword}
                        className="bg-[#005180] hover:bg-[#004570] text-white"
                      >
                        Done
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      disabled
                      className="text-base bg-gray-50"
                    />
                  </div>

                  {profile.loginUserName && (
                    <div className="space-y-2">
                      <Label htmlFor="loginUserName" className="text-sm font-semibold text-foreground">
                        Username
                      </Label>
                      <Input
                        id="loginUserName"
                        value={profile.loginUserName}
                        disabled
                        className="text-base bg-gray-50"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="text-base bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      disabled
                      className="text-base bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-semibold text-foreground">
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={profile.company}
                      disabled
                      className="text-base bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-sm font-semibold text-foreground">
                      Designation
                    </Label>
                    <Input
                      id="designation"
                      value={profile.designation}
                      disabled
                      className="text-base bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-semibold text-foreground">
                      Role
                    </Label>
                    <Input
                      id="role"
                      value={profile.role}
                      disabled
                      className="text-base bg-gray-50"
                    />
                  </div>

                  {(profile.city || profile.state) && (
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-semibold text-foreground">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={[profile.city, profile.state].filter(Boolean).join(', ')}
                        disabled
                        className="text-base bg-gray-50"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
