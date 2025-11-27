"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ClientsContent } from "@/components/clients-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { canCreate } from "@/lib/permissions"
import { clientLogger } from "@/lib/logger"

export default function ClientsPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [showNewClientDialog, setShowNewClientDialog] = useState(false)
  const [formData, setFormData] = useState({
    kamName: "",
    responsibility: "",
    customerName: "",
    customerUnit: "",
    registeredAddress: "",
    directors: "",
    gstNumber: "",
    panNumber: "",
    productsToManufacture: "",
    businessValuePerMonth: "",
    existingCustomerType: "",
    paymentBy: "",
    paymentTerms: "",
    creditLimitPerSystem: "0",
    proposedCreditLimit: "",
    approvedCreditLimit: "0",
  })

  const handleNewCustomer = () => {
    setShowNewClientDialog(true)
  }

  const handleExport = () => {
    alert("Export clients as CSV/Excel")
  }

  const handleSubmitClient = () => {
    clientLogger.log("New Client:", formData)
    alert("Customer created successfully! Pending approval.")
    setShowNewClientDialog(false)
    setFormData({
      kamName: "",
      responsibility: "",
      customerName: "",
      customerUnit: "",
      registeredAddress: "",
      directors: "",
      gstNumber: "",
      panNumber: "",
      productsToManufacture: "",
      businessValuePerMonth: "",
      existingCustomerType: "",
      paymentBy: "",
      paymentTerms: "",
      creditLimitPerSystem: "0",
      proposedCreditLimit: "",
      approvedCreditLimit: "0",
    })
  }

  const isKAM = canCreate()

  const actions = isKAM
    ? [
        { label: "New Customer", onClick: handleNewCustomer },
        { label: "Export", onClick: handleExport },
      ]
    : [{ label: "Export", onClick: handleExport }]

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
        <AppHeader pageName="Customer" onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          <ClientsContent />
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* New Customer Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/30">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-[#005180]">New Customer Approval</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Complete the form below to submit for approval
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-8 py-6">
            {/* KAM & Customer Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-[#005180] rounded-full"></div>
                <h3 className="text-base font-bold text-[#005180]">KAM & Customer Information</h3>
              </div>
              <div className="grid gap-5 pl-4">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="kamName" className="text-sm text-gray-700">KAM Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="kamName"
                      placeholder="Enter KAM name"
                      value={formData.kamName}
                      onChange={(e) => setFormData({ ...formData, kamName: e.target.value })}
                      className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsibility" className="text-sm text-gray-700">Responsibility <span className="text-red-500">*</span></Label>
                    <Input
                      id="responsibility"
                      placeholder="Enter responsibility"
                      value={formData.responsibility}
                      onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })}
                      className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm text-gray-700">Customer Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer/company name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerUnit" className="text-sm text-gray-700">Customer Unit <span className="text-red-500">*</span></Label>
                  <Input
                    id="customerUnit"
                    placeholder="Enter customer unit/division"
                    value={formData.customerUnit}
                    onChange={(e) => setFormData({ ...formData, customerUnit: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-[#78BE20] rounded-full"></div>
                <h3 className="text-base font-bold text-[#005180]">Company Details</h3>
              </div>
              <div className="grid gap-5 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="registeredAddress" className="text-sm text-gray-700">Registered Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="registeredAddress"
                    placeholder="Enter complete registered address"
                    value={formData.registeredAddress}
                    onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directors" className="text-sm text-gray-700">Directors/Promoters <span className="text-red-500">*</span></Label>
                  <Input
                    id="directors"
                    placeholder="Enter director/promoter names"
                    value={formData.directors}
                    onChange={(e) => setFormData({ ...formData, directors: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber" className="text-sm text-gray-700">GST Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="gstNumber"
                      placeholder="27AABCU9603R1ZM"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber" className="text-sm text-gray-700">PAN Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="panNumber"
                      placeholder="AABCU9603R"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-[#005180] rounded-full"></div>
                <h3 className="text-base font-bold text-[#005180]">Business Information</h3>
              </div>
              <div className="grid gap-5 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="productsToManufacture" className="text-sm text-gray-700">Products to be Manufactured <span className="text-red-500">*</span></Label>
                  <Input
                    id="productsToManufacture"
                    placeholder="Enter products to be manufactured"
                    value={formData.productsToManufacture}
                    onChange={(e) => setFormData({ ...formData, productsToManufacture: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessValuePerMonth" className="text-sm text-gray-700">Business Value per Month <span className="text-red-500">*</span></Label>
                  <Input
                    id="businessValuePerMonth"
                    placeholder="Enter expected monthly business value"
                    value={formData.businessValuePerMonth}
                    onChange={(e) => setFormData({ ...formData, businessValuePerMonth: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingCustomerType" className="text-sm text-gray-700">Customer Type <span className="text-red-500">*</span></Label>
                  <Select value={formData.existingCustomerType} onValueChange={(value) => setFormData({ ...formData, existingCustomerType: value })}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20">
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Customer</SelectItem>
                      <SelectItem value="2p">2P (Existing)</SelectItem>
                      <SelectItem value="3p">3P (Existing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Payment & Credit Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-[#78BE20] rounded-full"></div>
                <h3 className="text-base font-bold text-[#005180]">Payment & Credit</h3>
              </div>
              <div className="grid gap-5 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentBy" className="text-sm text-gray-700">Payment by (Payer Name) <span className="text-red-500">*</span></Label>
                  <Input
                    id="paymentBy"
                    placeholder="Enter payer name"
                    value={formData.paymentBy}
                    onChange={(e) => setFormData({ ...formData, paymentBy: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms" className="text-sm text-gray-700">Payment Terms <span className="text-red-500">*</span></Label>
                  <Input
                    id="paymentTerms"
                    placeholder="e.g., 30 days, 60 days, Advance"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                  />
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="creditLimitPerSystem" className="text-sm text-gray-700">System Credit Limit</Label>
                    <Input
                      id="creditLimitPerSystem"
                      type="number"
                      placeholder="0"
                      value={formData.creditLimitPerSystem}
                      onChange={(e) => setFormData({ ...formData, creditLimitPerSystem: e.target.value })}
                      className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposedCreditLimit" className="text-sm text-gray-700">Proposed Limit <span className="text-red-500">*</span></Label>
                    <Input
                      id="proposedCreditLimit"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.proposedCreditLimit}
                      onChange={(e) => setFormData({ ...formData, proposedCreditLimit: e.target.value })}
                      className="h-11 border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvedCreditLimit" className="text-sm text-gray-700">Approved Limit</Label>
                    <Input
                      id="approvedCreditLimit"
                      type="number"
                      placeholder="0"
                      value={formData.approvedCreditLimit}
                      onChange={(e) => setFormData({ ...formData, approvedCreditLimit: e.target.value })}
                      className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-6 border-t -mx-6 px-6 -mb-6 pb-6 bg-white">
            <Button
              variant="outline"
              onClick={() => setShowNewClientDialog(false)}
              className="h-11 px-6 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitClient}
              className="h-11 px-8 bg-[#78BE20] hover:bg-[#6ba91b] text-white shadow-sm"
            >
              Submit for Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
