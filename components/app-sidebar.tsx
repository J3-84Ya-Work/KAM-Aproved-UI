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

const navItems = [
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
]

const moreItems = [
  {
    title: "Approvals",
    url: "/approvals",
    icon: FileCheck,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    // Get current user info
    const user = getCurrentUser()
    if (user) {
      setUserRole(user.role)
      setUserName(user.name)
    }
  }, [])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userAuth")
    localStorage.removeItem("userProfile")

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

      {/* User Role Indicator */}
      {userRole && (
        <div className="border-b border-gray-200 p-3">
          {isCollapsed ? (
            <div className="flex justify-center" title={`${userRole} - ${userName}`}>
              <UserCircle className="h-6 w-6 text-[#005180]" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-[#005180] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <Badge className={`${getRoleBadgeColor(userRole)} border text-xs font-semibold mt-1`}>
                  {userRole}
                </Badge>
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
              {navItems.map((item) => (
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
                      {item.badge && !isCollapsed && (
                        <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs font-bold">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
