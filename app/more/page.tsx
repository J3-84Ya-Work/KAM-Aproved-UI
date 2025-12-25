"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FolderKanban, CheckCircle, Users, Settings, LogOut, LayoutDashboard, User } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const allMoreItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    color: "bg-blue",
    roles: ["H.O.D", "Vertical Head"], // Not visible for KAM
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
    color: "bg-green",
    roles: ["KAM", "H.O.D", "Vertical Head"],
  },
  {
    title: "Customer",
    url: "/clients",
    icon: Users,
    color: "bg-burgundy-80",
    roles: ["KAM", "H.O.D", "Vertical Head"],
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
    badge: 5,
    color: "bg-blue-80",
    roles: ["KAM", "H.O.D", "Vertical Head"],
  },
  {
    title: "Approvals",
    url: "/approvals",
    icon: CheckCircle,
    badge: 3,
    color: "bg-green-80",
    roles: ["H.O.D", "Vertical Head"], // Not visible for KAM
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "bg-blue-60",
    roles: ["KAM", "H.O.D", "Vertical Head"],
  },
]

export default function MorePage() {
  const router = useRouter()
  const [moreItems, setMoreItems] = useState(allMoreItems)

  useEffect(() => {
    const authData = localStorage.getItem("userAuth")
    if (authData) {
      const auth = JSON.parse(authData)
      const userRole = auth.role || "KAM"
      // Filter items based on user role
      const filteredItems = allMoreItems.filter((item) => item.roles.includes(userRole))
      setMoreItems(filteredItems)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userAuth")
    localStorage.removeItem("userProfile")

    // Clear authentication cookie
    document.cookie = "userAuth=; path=/; max-age=0; SameSite=Strict"

    router.push("/login")
  }

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="More" />
        <div className="flex flex-1 flex-col p-4 pb-24 md:p-6 md:pb-6 bg-neutral-gray-50 overflow-auto">
          <div className="grid grid-cols-2 gap-2.5 md:gap-4">
            {moreItems.map((item, index) => (
              <Link key={item.title} href={item.url}>
                <Card
                  className="overflow-hidden border-0 bg-white transition-all duration-200 hover:shadow-md active:scale-[0.98] animate-scale-in h-full"
                  style={{
                    animationDelay: `${index * 30}ms`,
                    boxShadow: "0 1px 3px rgba(0, 81, 128, 0.08)",
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2.5 md:p-4 h-full min-h-[85px] md:min-h-[100px]">
                    <div
                      className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg ${item.color} relative`}
                    >
                      <item.icon className="h-5 w-5 md:h-5 md:w-5 text-white" strokeWidth={2.5} />
                      {item.badge && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 p-0 flex items-center justify-center text-[9px] md:text-[10px] font-bold bg-burgundy hover:bg-burgundy-80 text-white border-2 border-white">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-[11px] md:text-sm text-gray-900 text-center leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}

            <Button
              variant="outline"
              className="w-full h-full p-0 border-0 shadow-none hover:shadow-none transition-all active:scale-[0.98] animate-scale-in bg-transparent col-span-2 md:col-span-1"
              style={{ animationDelay: `${moreItems.length * 30}ms` }}
              onClick={handleLogout}
            >
              <Card className="w-full h-full overflow-hidden border-0 bg-burgundy-5 hover:bg-burgundy-10 transition-all duration-200 min-h-[85px] md:min-h-[100px]">
                <div className="flex flex-col items-center justify-center gap-1.5 md:gap-2 p-2.5 md:p-4 h-full">
                  <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-burgundy">
                    <LogOut className="h-5 w-5 md:h-5 md:w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-semibold text-[11px] md:text-sm text-burgundy text-center leading-tight">
                    Logout
                  </h3>
                </div>
              </Card>
            </Button>
          </div>
        </div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
