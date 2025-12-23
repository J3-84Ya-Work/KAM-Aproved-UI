"use client"
import {
  FileCheck,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Home,
  DollarSign,
  Package,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/permissions"
import { clientLogger } from "@/lib/logger"

const roleBasedNavItems = {
  KAM: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
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
    {
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Conversations",
      url: "/chats",
      icon: MessageSquare,
    },
    {
      title: "Ask Rate",
      url: "/ask-rate",
      icon: DollarSign,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  "H.O.D": [
    {
      title: "Approvals",
      url: "/approvals",
      icon: FileCheck,
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
    {
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  "VerticalHead": [
    {
      title: "Approvals",
      url: "/approvals",
      icon: FileCheck,
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
    {
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  "VH": [
    {
      title: "Approvals",
      url: "/approvals",
      icon: FileCheck,
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
    {
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  Purchase: [
    {
      title: "Rate Queries",
      url: "/rate-queries",
      icon: DollarSign,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [navItems, setNavItems] = useState(roleBasedNavItems.KAM) // Default to KAM
  const [customerCount, setCustomerCount] = useState<number>(0)
  const [conversationCount, setConversationCount] = useState<number>(0)
  const [askRateCount, setAskRateCount] = useState<number>(0)

  useEffect(() => {
    // Get current user info
    const user = getCurrentUser()
    clientLogger.log('AppSidebar - Current user:', user)
    if (user) {
      setUserRole(user.role)
      setUserName(user.name)
      clientLogger.log('AppSidebar - User role:', user.role, 'User name:', user.name)
      // Set navigation items based on role
      setNavItems(roleBasedNavItems[user.role as keyof typeof roleBasedNavItems] || roleBasedNavItems.KAM)
    } else {
      clientLogger.log('AppSidebar - No user found in localStorage')
    }

    // Fetch customer count
    const fetchCustomerCount = async () => {
      try {
        clientLogger.log('📊 Sidebar - Fetching customer count...')
        const user = getCurrentUser()
        const userId = user?.userId || '2'
        const companyId = user?.companyId || '2'

        clientLogger.log('📊 Sidebar - Customer fetch using userId:', userId, 'companyId:', companyId)

        const response = await fetch('https://api.indusanalytics.co.in/api/planwindow/GetSbClient', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('parksonsnew:parksonsnew'),
            'CompanyID': String(companyId),
            'UserID': String(userId),
            'Fyear': '2025-2026',
            'ProductionUnitID': '1',
            'Content-Type': 'application/json',
          },
        })

        clientLogger.log('📊 Sidebar - Customer response status:', response.ok)
        if (response.ok) {
          let data = await response.json()
          clientLogger.log('📊 Sidebar - Customer raw data:', data)
          clientLogger.log('📊 Sidebar - Customer data type:', typeof data)

          // Handle double-encoded JSON string response (same as in enquiry.ts)
          if (typeof data === 'string') {
            try {
              clientLogger.log('📊 Sidebar - Parsing JSON string...')
              data = JSON.parse(data)

              // Check if it's still a string after first parse (triple-encoded)
              if (typeof data === 'string') {
                clientLogger.log('📊 Sidebar - Parsing JSON string again (triple-encoded)...')
                data = JSON.parse(data)
              }
            } catch (e) {
              clientLogger.error('❌ Sidebar - Failed to parse JSON string:', e)
            }
          }

          clientLogger.log('📊 Sidebar - Customer data after parsing:', data)
          clientLogger.log('📊 Sidebar - Customer data is array?', Array.isArray(data))

          // Handle different response formats
          let clients = []
          if (Array.isArray(data)) {
            clients = data
          } else if (data && typeof data === 'object') {
            clients = data.data || data.Data || data.customers || data.Customers || []
          }

          console.log('🔍 CUSTOMER DATA - Total count:', clients.length)
          console.log('🔍 CUSTOMER DATA - Full list:', clients)
          console.table(clients)

          clientLogger.log('✅ Sidebar - Setting customer count:', clients.length)
          clientLogger.log('📊 Sidebar - Full customer list:', clients)
          setCustomerCount(clients.length)
        } else {
          clientLogger.error('❌ Sidebar - Customer API returned error status:', response.status)
        }
      } catch (error) {
        clientLogger.error('❌ Sidebar - Failed to fetch customer count:', error)
      }
    }

    // Fetch conversations count
    const fetchConversationCount = async () => {
      try {
        clientLogger.log('📊 Sidebar - Fetching conversation count...')
        const user = getCurrentUser()
        const userId = user?.userId || '2'
        const companyId = user?.companyId || '2'

        const response = await fetch('https://api.indusanalytics.co.in/api/parksons/conversations', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('parksonsnew:parksonsnew'),
            'CompanyID': String(companyId),
            'UserID': String(userId),
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            clientLogger.log('✅ Sidebar - Setting conversation count:', data.length)
            setConversationCount(data.length)
          }
        }
      } catch (error) {
        clientLogger.error('❌ Sidebar - Failed to fetch conversation count:', error)
      }
    }

    // Fetch ask rate count (pending)
    const fetchAskRateCount = async () => {
      try {
        clientLogger.log('📊 Sidebar - Fetching ask rate count...')
        const RATE_API_URL = process.env.NEXT_PUBLIC_RATE_API_BASE_URL || 'http://localhost:5003/api/raterequest'
        const response = await fetch(`${RATE_API_URL}/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        clientLogger.log('📊 Sidebar - Ask rate response status:', response.ok)
        if (response.ok) {
          let data = await response.json()
          clientLogger.log('📊 Sidebar - Ask rate raw data:', data)
          clientLogger.log('📊 Sidebar - Ask rate data type:', typeof data)

          // Handle double-encoded JSON string response
          if (typeof data === 'string') {
            try {
              clientLogger.log('📊 Sidebar - Parsing ask rate JSON string...')
              data = JSON.parse(data)

              // Check if it's still a string after first parse (triple-encoded)
              if (typeof data === 'string') {
                clientLogger.log('📊 Sidebar - Parsing ask rate JSON string again (triple-encoded)...')
                data = JSON.parse(data)
              }
            } catch (e) {
              clientLogger.error('❌ Sidebar - Failed to parse ask rate JSON string:', e)
            }
          }

          clientLogger.log('📊 Sidebar - Ask rate data after parsing:', data)

          // Handle different response formats
          let askRates = []
          if (Array.isArray(data)) {
            askRates = data
          } else if (data && typeof data === 'object') {
            askRates = data.data || data.Data || data.requests || data.Requests || []
          }

          clientLogger.log('📊 Sidebar - Ask rate is array?', Array.isArray(askRates))
          clientLogger.log('📊 Sidebar - Ask rate total items:', askRates.length)

          if (askRates.length > 0) {
            clientLogger.log('📊 Sidebar - First ask rate item:', askRates[0])
            clientLogger.log('📊 Sidebar - First item keys:', Object.keys(askRates[0]))
          }

          // Count only pending requests - check multiple possible field names
          const pendingCount = askRates.filter((item: any) =>
            item.Status === 'Pending' ||
            item.status === 'Pending' ||
            item.STATUS === 'Pending' ||
            item.State === 'Pending' ||
            item.state === 'Pending'
          ).length

          clientLogger.log('✅ Sidebar - Setting ask rate count (pending only):', pendingCount)
          setAskRateCount(pendingCount)
        } else {
          clientLogger.error('❌ Sidebar - Ask rate API returned error status:', response.status)
        }
      } catch (error) {
        clientLogger.error('❌ Sidebar - Failed to fetch ask rate count:', error)
      }
    }

    clientLogger.log('🚀 Sidebar - Starting all count fetches...')
    fetchCustomerCount()
    fetchConversationCount()
    fetchAskRateCount()
    clientLogger.log('🚀 Sidebar - All fetch functions called')
  }, [])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userAuth")
    localStorage.removeItem("userProfile")

    // Clear authentication cookie
    document.cookie = "userAuth=; path=/; max-age=0; SameSite=Strict"

    // Redirect to login page
    router.push("/login")
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "KAM":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "H.O.D":
        return "bg-amber-100 text-amber-700 border-amber-300"
      case "Vertical Head":
      case "VerticalHead":
      case "VH":
        return "bg-purple-100 text-purple-700 border-purple-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      {/* Toggle Button at Top */}
      <div className="border-b border-gray-200 p-2">
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className="w-full flex items-center justify-start h-10 hover:bg-[#005180]/10 transition-colors px-2"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-[#005180]" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 text-[#005180]" />
              <span className="ml-2 text-sm font-medium text-[#005180]">Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User Info */}
      {userName && (
        <div className="border-b border-gray-200 p-3">
          {isCollapsed ? (
            <div className="flex justify-center" title={`${userName}${userRole ? ` - ${userRole}` : ''}`}>
              <UserCircle className="h-6 w-6 text-[#005180]" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-[#005180] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                {userRole && (
                  <Badge className={`${getRoleBadgeColor(userRole)} border text-xs font-semibold mt-1`}>
                    {userRole}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Get dynamic count for specific items
                let displayCount: number | undefined = undefined
                if (item.title === 'Customer') {
                  displayCount = customerCount
                  clientLogger.log('🔢 Sidebar - Customer menu item, count:', customerCount)
                } else if (item.title === 'Conversations') {
                  displayCount = conversationCount
                  clientLogger.log('🔢 Sidebar - Conversations menu item, count:', conversationCount)
                } else if (item.title === 'Ask Rate') {
                  displayCount = askRateCount
                  clientLogger.log('🔢 Sidebar - Ask Rate menu item, count:', askRateCount)
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Link href={item.url} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-6 w-6" />
                          <span className="text-base font-bold">{item.title}</span>
                        </div>
                        {displayCount !== undefined && displayCount > 0 && (
                          <Badge variant="secondary" className={`ml-auto h-5 px-2 text-xs font-bold ${isCollapsed ? 'hidden' : ''}`}>
                            {displayCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Logout Button at Bottom */}
      <SidebarFooter className="mt-auto border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center justify-start h-12 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors px-2"
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
