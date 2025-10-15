"use client"
import {
  FileText,
  FileCheck,
  FolderKanban,
  CheckCircle,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  LayoutDashboard,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navItems = [
  {
    title: "Customer",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Recent Drafts",
    url: "/chats",
    icon: MessageSquare,
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
    title: "Approvals",
    url: "/approvals",
    icon: CheckCircle,
    badge: 3,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

const moreItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-6 w-6" />
                        <span className="text-base font-bold">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs font-bold">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center gap-3">
                      <MoreHorizontal className="h-6 w-6" />
                      <span className="text-base font-bold">More</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-48">
                    {moreItems.map((item) => (
                      <DropdownMenuItem key={item.title} asChild>
                        <Link href={item.url} className="flex items-center gap-3 cursor-pointer">
                          <item.icon className="h-5 w-5" />
                          <span className="font-bold">{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
