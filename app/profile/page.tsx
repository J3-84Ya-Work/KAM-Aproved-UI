"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { clientLogger } from "@/lib/logger"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    company: "ABC Corporation",
    role: "Sales Manager",
  })

  useEffect(() => {
    const authData = localStorage.getItem("userAuth")
    const savedProfile = localStorage.getItem("userProfile")

    if (authData) {
      try {
        const auth = JSON.parse(authData)
        const profileData = savedProfile ? JSON.parse(savedProfile) : {}

        // Merge auth data with profile data
        const mergedProfile = {
          name: auth.name || profileData.name || "John Doe",
          email: auth.email || profileData.email || "john.doe@example.com",
          phone: profileData.phone || "+1 234 567 8900",
          company: profileData.company || "ABC Corporation",
          role: profileData.role || "Sales Manager",
        }

        setProfile(mergedProfile)
        clientLogger.log("[v0] Loaded profile from auth and localStorage:", mergedProfile)
      } catch (error) {
        clientLogger.error("[v0] Error loading profile:", error)
      }
    } else if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(parsedProfile)
        clientLogger.log("[v0] Loaded profile from localStorage:", parsedProfile)
      } catch (error) {
        clientLogger.error("[v0] Error loading profile:", error)
      }
    }
  }, [])

  const handleSave = () => {
    setIsEditing(false)

    localStorage.setItem("userProfile", JSON.stringify(profile))

    const authData = localStorage.getItem("userAuth")
    if (authData) {
      try {
        const auth = JSON.parse(authData)
        auth.name = profile.name
        auth.email = profile.email
        localStorage.setItem("userAuth", JSON.stringify(auth))
        clientLogger.log("[v0] Updated userAuth with new profile data:", auth)
      } catch (error) {
        clientLogger.error("[v0] Error updating auth data:", error)
      }
    }

    clientLogger.log("[v0] Profile saved to localStorage:", profile)

    window.dispatchEvent(new Event("profileUpdated"))
  }

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

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader pageName="Profile" showBackButton onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-4 p-4 pb-20 md:p-6 md:pb-6 bg-gradient-to-b from-white to-gray-50">
          <Card className="overflow-hidden border-0 shadow-sm animate-slide-in">
            <div className="relative h-32 bg-gradient-to-r from-[#0F5F74] to-[#69B12C]">
              <div className="absolute -bottom-16 left-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src="/placeholder.svg" alt={profile.name} />
                    <AvatarFallback className="text-3xl font-bold bg-[#8B2E39] text-white">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-[#0F5F74] hover:bg-[#0F5F74]/90 shadow-lg"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-20 p-6 space-y-6">
              <div className="flex justify-end">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-[#2F4669] hover:bg-[#2F4669]/90 text-white">
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-[#B92221] text-[#B92221] hover:bg-[#B92221]/10"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-[#5AA538] hover:bg-[#5AA538]/90 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="text-base"
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
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold text-foreground">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    disabled={!isEditing}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-foreground">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    disabled={!isEditing}
                    className="text-base"
                  />
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
