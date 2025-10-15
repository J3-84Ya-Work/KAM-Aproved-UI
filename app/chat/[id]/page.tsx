import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AICostingChat } from "@/components/ai-costing-chat"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <div className="pb-16 md:pb-0">
          <AICostingChat chatId={params.id} />
        </div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
