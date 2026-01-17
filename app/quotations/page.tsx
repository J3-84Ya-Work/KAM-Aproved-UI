"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { QuotationsContent } from "@/components/quotations-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"

export default function QuotationsPage() {
  const router = useRouter()
  const [showQuotationTypeDialog, setShowQuotationTypeDialog] = useState(false)
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const handleNewQuotation = () => {
    setShowQuotationTypeDialog(true)
  }

  const handleQuotationTypeSelection = (type: "chat" | "dynamic") => {
    setShowQuotationTypeDialog(false)
    if (type === "dynamic") {
      router.push("/quotations/new?mode=dynamic")
    } else {
      // Navigate to main chat page with autoStart to begin "I want costing" chat
      router.push("/?autoStart=true")
    }
  }

  const actions = [
    { label: "New Quotation", onClick: handleNewQuotation },
  ]

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Quotations" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 overflow-auto">
          <QuotationsContent />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* Quotation Type Selection Dialog */}
      <Dialog open={showQuotationTypeDialog} onOpenChange={setShowQuotationTypeDialog}>
        <DialogContent className="max-w-sm p-6 bg-white">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-center text-[#005180]">Create New Quotation</DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-600">
              Choose how you would like to create the quotation
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-4">
            <Button
              onClick={() => handleQuotationTypeSelection("chat")}
              variant="outline"
              className="h-auto py-4 flex items-center justify-start gap-3 border-2 border-[#78BE20] text-[#78BE20] hover:bg-[#78BE20]/10 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="bg-[#78BE20]/10 p-2 rounded">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">Chat with Parkbuddy</p>
                <p className="text-xs text-[#78BE20]/70">Use intelligent chat engine</p>
              </div>
            </Button>

            <Button
              onClick={() => handleQuotationTypeSelection("dynamic")}
              variant="outline"
              className="h-auto py-4 flex items-center justify-start gap-3 border-2 border-[#005180] text-[#005180] hover:bg-[#005180]/10 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="bg-[#005180]/10 p-2 rounded">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">Dynamic Fill</p>
                <p className="text-xs text-[#005180]/70">Complete costing wizard</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
