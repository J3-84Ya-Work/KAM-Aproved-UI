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
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

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

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userAuth")
    localStorage.removeItem("userProfile")

    // Redirect to login page
    router.push("/login")
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
