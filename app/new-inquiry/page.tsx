"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { NewInquiryForm } from "@/components/new-inquiry-form"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function NewInquiryPage() {
  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader pageName="New Inquiry" showBackButton />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          <NewInquiryForm />
        </div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
