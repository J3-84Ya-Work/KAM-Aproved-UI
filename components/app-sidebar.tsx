"use client"
import {
  FileText,
  FileCheck,
  FolderKanban,
  Users,
  MessageSquare,
  Settings,
  LayoutDashboard,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Home,
  DollarSign,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCurrentUser } from "@/lib/permissions"
import { EnquiryAPI, QuotationsAPI } from "@/lib/api/enquiry"
import { clientLogger } from "@/lib/logger"

const roleBasedNavItems = {
  KAM: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Inquiries",
      url: "/inquiries",
      icon: FileText,
      badge: 12,
    },
    {
      title: "Quotations",
      url: "/quotations",
      icon: FileCheck,
      badge: 8,
    },
    {
      title: "Ask Rate",
      url: "/ask-rate",
      icon: DollarSign,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
      badge: 5,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: LayoutDashboard,
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
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
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
      icon: FolderKanban,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: LayoutDashboard,
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
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
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
      icon: FolderKanban,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: LayoutDashboard,
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
      title: "Customer",
      url: "/clients",
      icon: Users,
    },
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
      icon: FolderKanban,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: LayoutDashboard,
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
  const [inquiryCount, setInquiryCount] = useState<number>(0)
  const [quotationCount, setQuotationCount] = useState<number>(0)
  const [customerCount, setCustomerCount] = useState<number>(0)
  const [approvalCount, setApprovalCount] = useState<number>(0)

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

    // Fetch inquiry count
    const fetchInquiryCount = async () => {
      try {
        // Get current financial year dates
        const currentYear = new Date().getFullYear()
        const nextYear = currentYear + 1

        const response = await EnquiryAPI.getEnquiries({
          FromDate: `${currentYear}-01-01 00:00:00.000`,
          ToDate: `${nextYear}-12-31 23:59:59.999`,
          ApplydateFilter: 'True',
          RadioValue: 'All',
        }, null)

        if (response.success && response.data) {
          setInquiryCount(response.data.length)
        }
      } catch (error) {
        clientLogger.error('Failed to fetch inquiry count:', error)
      }
    }

    // Fetch quotation count
    const fetchQuotationCount = async () => {
      try {
        // Get current financial year dates
        const currentYear = new Date().getFullYear()
        const nextYear = currentYear + 1

        const response = await QuotationsAPI.getQuotations({
          FilterSTR: 'All',
          FromDate: `${currentYear}-01-01 00:00:00.000`,
          ToDate: `${nextYear}-12-31 23:59:59.999`,
        }, null)

        if (response.success && response.data) {
          setQuotationCount(response.data.length)
        }
      } catch (error) {
        clientLogger.error('Failed to fetch quotation count:', error)
      }
    }

    // Fetch customer count
    const fetchCustomerCount = async () => {
      try {
        clientLogger.log('📊 Sidebar - Fetching customer count...')
        const response = await fetch('https://api.indusanalytics.co.in/api/planwindow/GetSbClient', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('parksonsnew:parksonsnew'),
            'CompanyID': '2',
            'UserID': '2',
            'Fyear': '2025-2026',
            'ProductionUnitID': '1',
            'Content-Type': 'application/json',
          },
        })

        clientLogger.log('📊 Sidebar - Customer response status:', response.ok)
        if (response.ok) {
          const data = await response.json()
          clientLogger.log('📊 Sidebar - Customer data:', data)
          if (Array.isArray(data)) {
            clientLogger.log('✅ Sidebar - Setting customer count:', data.length)
            setCustomerCount(data.length)
          }
        }
      } catch (error) {
        clientLogger.error('❌ Sidebar - Failed to fetch customer count:', error)
      }
    }

    // Fetch approvals count (pending quotations)
    const fetchApprovalCount = async () => {
      try {
        clientLogger.log('📊 Sidebar - Fetching approval count...')
        const currentYear = new Date().getFullYear()
        const nextYear = currentYear + 1

        const response = await QuotationsAPI.getQuotations({
          FilterSTR: 'Pending',
          FromDate: `${currentYear}-01-01 00:00:00.000`,
          ToDate: `${nextYear}-12-31 23:59:59.999`,
        }, null)

        clientLogger.log('📊 Sidebar - Approval response:', response)
        if (response.success && response.data) {
          clientLogger.log('✅ Sidebar - Setting approval count:', response.data.length)
          setApprovalCount(response.data.length)
        }
      } catch (error) {
        clientLogger.error('❌ Sidebar - Failed to fetch approval count:', error)
      }
    }

    clientLogger.log('🚀 Sidebar - Starting all count fetches...')
    fetchInquiryCount()
    fetchQuotationCount()
    fetchCustomerCount()
    fetchApprovalCount()
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
    <Sidebar collapsible="icon">
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
                let displayCount: number | undefined = item.badge
                if (item.title === 'Inquiries') {
                  displayCount = inquiryCount
                } else if (item.title === 'Quotations') {
                  displayCount = quotationCount
                } else if (item.title === 'Customer') {
                  displayCount = customerCount
                  clientLogger.log('🔢 Sidebar - Customer menu item, count:', customerCount)
                } else if (item.title === 'Approvals') {
                  displayCount = approvalCount
                  clientLogger.log('🔢 Sidebar - Approvals menu item, count:', approvalCount)
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
