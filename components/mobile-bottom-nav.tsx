"use client"
import { FileText, LayoutDashboard, Package, FileCheck, Users, CheckCircle, FileBarChart, User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const roleBasedNavItems = {
  KAM: [
    {
      title: "Inquiries",
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
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  "H.O.D": [
    {
      title: "Inquiries",
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
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  "Vertical Head": [
    {
      title: "Inquiries",
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
      title: "Dashboard",
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

  const toggleSidePanel = () => {
    setShowSidePanel(prev => !prev)
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userAuth")
    localStorage.removeItem("userProfile")

    // Close side panel
    setShowSidePanel(false)

    // Redirect to login page
    router.push("/login")
  }

  useEffect(() => {
    const authData = localStorage.getItem("userAuth")
    if (authData) {
      const auth = JSON.parse(authData)
      const userRole = auth.role || "KAM"
      setNavItems(roleBasedNavItems[userRole as keyof typeof roleBasedNavItems] || roleBasedNavItems.KAM)
    }
  }, [pathname])

  useEffect(() => {
    if (onMenuToggle) {
      onMenuToggle(toggleSidePanel)
    }
  }, [onMenuToggle])

  const sidePanelItems = [
    { title: "Customer", url: "/clients", icon: Users },
    { title: "Reports", url: "/reports", icon: FileBarChart },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ]

  return (
    <>
      {/* Side Panel */}
      {showSidePanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
            onClick={() => setShowSidePanel(false)}
            aria-hidden="true"
          />
          {/* Side Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out">
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url || "")
            return (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 flex-1 h-full transition-all duration-200 rounded-lg touch-manipulation",
                  isActive
                    ? "font-semibold"
                    : "hover:bg-blue-50/50",
                )}
                style={{
                  color: isActive ? "#B92221" : "#005180"
                }}
              >
                <item.icon className={cn(
                  "transition-all",
                  isActive ? "h-6 w-6" : "h-5 w-5"
                )} />
                <span className={cn(
                  "text-[10px] sm:text-xs leading-tight",
                  isActive ? "font-bold" : "font-medium"
                )}>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
