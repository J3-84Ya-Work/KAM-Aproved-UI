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
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { canCreate, isHOD } from "@/lib/permissions"
import { clientLogger } from "@/lib/logger"

export default function InquiriesPage() {
  const router = useRouter()
  const [showFAB, setShowFAB] = useState(false)
  const [isHODUser, setIsHODUser] = useState(false)
  const [showNewInquiryDialog, setShowNewInquiryDialog] = useState(false)
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
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
    // Navigate directly to manual form
    router.push("/inquiries/new?mode=manual")
  }

  const handleExport = () => {
    // Implement export functionality - for now, just show alert
    alert("Export functionality will download all inquiries as CSV/Excel")
  }

  const handleSubmitInquiry = () => {
    clientLogger.log("New Inquiry:", formData)
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
        { label: "New Enquiry", onClick: handleNewInquiry },
        { label: "Draft", onClick: () => router.push("/drafts") },
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
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Enquiries" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 overflow-auto">
          <InquiriesContent />
        </div>
        {showFAB && <FloatingActionButton actions={actions} />}
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* New Enquiry Dialog */}
      <Dialog open={showNewInquiryDialog} onOpenChange={setShowNewInquiryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Enquiry</DialogTitle>
            <DialogDescription>Fill in the details to create a new customer enquiry</DialogDescription>
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
