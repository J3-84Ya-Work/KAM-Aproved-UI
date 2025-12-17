"use client"
import { FileText, LayoutDashboard, Package, FileCheck, Users, CheckCircle, User, Settings, UserCircle, Home } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

const roleBasedNavItems = {
  KAM: [
    {
      title: "Enquiries",
      url: "/inquiries",
      icon: FileText,
    },
    {
      title: "Quotations",
      url: "/quotations",
      icon: FileCheck,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Package,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  "H.O.D": [
    {
      title: "Approvals",
      url: "/approvals",
      icon: CheckCircle,
    },
    {
      title: "Quotations",
      url: "/quotations",
      icon: FileCheck,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Package,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  "Vertical Head": [
    {
      title: "Approvals",
      url: "/approvals",
      icon: CheckCircle,
    },
    {
      title: "Quotations",
      url: "/quotations",
      icon: FileCheck,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Package,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
}

interface MobileBottomNavProps {
  onMenuToggle?: (toggle: () => void) => void
}

export function MobileBottomNav({ onMenuToggle }: MobileBottomNavProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [navItems, setNavItems] = useState(roleBasedNavItems.KAM) // Default to KAM
  const [showSidePanel, setShowSidePanel] = useState(false) // State for side panel
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")

  const toggleSidePanel = () => {
    setShowSidePanel(prev => !prev)
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userAuth")
    localStorage.removeItem("userProfile")

    // Clear authentication cookie
    document.cookie = "userAuth=; path=/; max-age=0; SameSite=Strict"

    // Close side panel
    setShowSidePanel(false)

    // Redirect to login page
    router.push("/login")
  }

  useEffect(() => {
    const authData = localStorage.getItem("userAuth")
    if (authData) {
      const auth = JSON.parse(authData)
      const role = auth.role || "KAM"
      const name = auth.name || ""
      setUserRole(role)
      setUserName(name)
      setNavItems(roleBasedNavItems[role as keyof typeof roleBasedNavItems] || roleBasedNavItems.KAM)
    }
  }, [pathname])

  useEffect(() => {
    if (onMenuToggle) {
      onMenuToggle(toggleSidePanel)
    }
  }, [onMenuToggle])

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "KAM":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "H.O.D":
        return "bg-amber-100 text-amber-700 border-amber-300"
      case "Vertical Head":
        return "bg-purple-100 text-purple-700 border-purple-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const sidePanelItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Customer", url: "/clients", icon: Users },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ]

  return (
    <>
      {/* Side Panel - Hidden on Desktop (lg and above) */}
      {showSidePanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 lg:hidden"
            onClick={() => setShowSidePanel(false)}
            aria-hidden="true"
          />
          {/* Side Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out lg:hidden">
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: "#005180" }}>
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button
                  onClick={() => setShowSidePanel(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* User Role Indicator */}
              {userRole && (
                <div className="border-b border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-8 w-8 text-[#005180] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                      <Badge className={`${getRoleBadgeColor(userRole)} border text-xs font-semibold mt-1`}>
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Panel Content */}
              <nav className="flex-1 overflow-y-auto py-2 bg-white">
                <ul className="space-y-0">
                  {sidePanelItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-6 py-4 text-gray-700 hover:text-white font-medium transition-colors touch-manipulation border-b border-gray-100 hover:bg-[#005180]"
                        onClick={() => setShowSidePanel(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Panel Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  style={{ backgroundColor: "#B92221" }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation - Tab Style (Hidden on Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom lg:hidden">
        <div className="relative flex h-14 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url || "")
            return (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "relative flex items-center justify-center flex-1 transition-all duration-200 touch-manipulation mx-0.5",
                  isActive
                    ? "bg-white -mt-3 h-[68px] rounded-t-2xl border-l border-r border-t border-gray-200"
                    : "bg-transparent hover:bg-gray-50 h-14",
                )}
                title={item.title}
              >
                {/* Curved connectors for active tab */}
                {isActive && (
                  <>
                    {/* Left curve */}
                    <div className="absolute -left-2 bottom-0 w-2 h-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" className="absolute bottom-0 right-0">
                        <path d="M8,0 Q8,8 0,8 L0,0 Z" fill="white" />
                      </svg>
                    </div>
                    {/* Right curve */}
                    <div className="absolute -right-2 bottom-0 w-2 h-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" className="absolute bottom-0 left-0">
                        <path d="M0,0 Q0,8 8,8 L8,0 Z" fill="white" />
                      </svg>
                    </div>
                  </>
                )}

                <item.icon
                  className={cn(
                    "transition-all duration-200",
                    isActive ? "h-6 w-6 text-[#B92221]" : "h-5 w-5 text-gray-500"
                  )}
                />
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
