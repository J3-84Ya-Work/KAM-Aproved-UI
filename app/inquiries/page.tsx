"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { InquiriesContent } from "@/components/inquiries-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useCallback, useEffect } from "react"
import { canCreate, isHOD } from "@/lib/permissions"

export default function InquiriesPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [showFAB, setShowFAB] = useState(false)
  const [isHODUser, setIsHODUser] = useState(false)
  const [showInquiryTypeDialog, setShowInquiryTypeDialog] = useState(false)
  const [showNewInquiryDialog, setShowNewInquiryDialog] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    contactPerson: "",
    email: "",
    phone: "",
    productType: "",
    quantity: "",
    requirements: "",
    urgency: "normal",
  })

  useEffect(() => {
    // Check if user can create new inquiries (KAM) or is HOD
    const canCreateInquiry = canCreate()
    const isHODRole = isHOD()
    setShowFAB(canCreateInquiry || isHODRole)
    setIsHODUser(isHODRole)
  }, [])

  const handleNewInquiry = () => {
    setShowInquiryTypeDialog(true)
  }

  const handleInquiryTypeSelection = (type: "manual" | "chat") => {
    setShowInquiryTypeDialog(false)
    if (type === "manual") {
      // Navigate to manual inquiry form page
      router.push("/new-inquiry")
    } else {
      // Navigate to main chat page with autoStart parameter to begin "I want costing" chat
      router.push("/?autoStart=true")
    }
  }

  const handleExport = () => {
    // Implement export functionality - for now, just show alert
    alert("Export functionality will download all inquiries as CSV/Excel")
  }

  const handleSubmitInquiry = () => {
    console.log("New Inquiry:", formData)
    alert("Inquiry created successfully!")
    setShowNewInquiryDialog(false)
    setFormData({
      customerName: "",
      contactPerson: "",
      email: "",
      phone: "",
      productType: "",
      quantity: "",
      requirements: "",
      urgency: "normal",
    })
  }

  // Different actions for HOD vs KAM
  const actions = isHODUser
    ? [{ label: "Export", onClick: handleExport }]
    : [
        { label: "New Inquiry", onClick: handleNewInquiry },
        { label: "Draft", onClick: () => router.push("/chats") },
        { label: "Export", onClick: handleExport },
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
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader pageName="Inquiries" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          <InquiriesContent />
        </div>
        {showFAB && <FloatingActionButton actions={actions} />}
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* Inquiry Type Selection Dialog */}
      <Dialog open={showInquiryTypeDialog} onOpenChange={setShowInquiryTypeDialog}>
        <DialogContent className="max-w-sm p-6 bg-white">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-center text-[#005180]">Create New Inquiry</DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-600">
              Choose how you would like to create the inquiry
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-4">
            <Button
              onClick={() => handleInquiryTypeSelection("chat")}
              variant="outline"
              className="h-auto py-4 flex items-center justify-start gap-3 border-2 border-[#78BE20] text-[#78BE20] hover:bg-[#78BE20]/10 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="bg-[#78BE20]/10 p-2 rounded">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">Chat with AI Assistant</p>
                <p className="text-xs text-[#78BE20]/70">Use intelligent chat engine</p>
              </div>
            </Button>

            <Button
              onClick={() => handleInquiryTypeSelection("manual")}
              variant="outline"
              className="h-auto py-4 flex items-center justify-start gap-3 border-2 border-[#B92221] text-[#B92221] hover:bg-[#B92221]/10 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="bg-[#B92221]/10 p-2 rounded">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold">Manual Form</p>
                <p className="text-xs text-[#B92221]/70">Fill out form manually</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Inquiry Dialog */}
      <Dialog open={showNewInquiryDialog} onOpenChange={setShowNewInquiryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Inquiry</DialogTitle>
            <DialogDescription>Fill in the details to create a new customer inquiry</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  placeholder="Enter contact person name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productType">Product Type *</Label>
                <Select value={formData.productType} onValueChange={(value) => setFormData({ ...formData, productType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folding-cartons">Folding Cartons</SelectItem>
                    <SelectItem value="corrugated-boxes">Corrugated Boxes</SelectItem>
                    <SelectItem value="die-cut-boxes">Die-Cut Boxes</SelectItem>
                    <SelectItem value="printed-labels">Printed Labels</SelectItem>
                    <SelectItem value="custom-packaging">Custom Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  placeholder="e.g., 10000 units"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Additional Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Describe any specific requirements, dimensions, materials, etc."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewInquiryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitInquiry} className="bg-[#005180] hover:bg-[#004875]">
              Create Inquiry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
