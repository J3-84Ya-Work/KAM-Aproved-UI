"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export function NewInquiryForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customer: "",
    cartonStyle: "",
    boardType: "",
    length: "",
    width: "",
    height: "",
    gsm: "",
    quantityMin: "",
    quantityMax: "",
    plant: "",
    deliveryLocation: "",
    priority: "medium",
    notes: "",
    addons: [] as string[],
    exportRequirements: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form data:", formData)
    // After submission, redirect to inquiries page
    router.push("/inquiries")
  }

  const handleAddonChange = (addon: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, addons: [...formData.addons, addon] })
    } else {
      setFormData({ ...formData, addons: formData.addons.filter((a) => a !== addon) })
    }
  }

  const handleExportChange = (requirement: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, exportRequirements: [...formData.exportRequirements, requirement] })
    } else {
      setFormData({ ...formData, exportRequirements: formData.exportRequirements.filter((r) => r !== requirement) })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer Name *</Label>
            <Input
              id="customer"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="carton-style">Carton Style *</Label>
              <Select value={formData.cartonStyle} onValueChange={(value) => setFormData({ ...formData, cartonStyle: value })}>
                <SelectTrigger id="carton-style">
                  <SelectValue placeholder="Select carton style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rsc">RSC (Regular Slotted Container)</SelectItem>
                  <SelectItem value="fol">FOL (Full Overlap)</SelectItem>
                  <SelectItem value="hsc">HSC (Half Slotted Container)</SelectItem>
                  <SelectItem value="die-cut">Die Cut</SelectItem>
                  <SelectItem value="mailer">Mailer Box</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="board-type">Board Type *</Label>
              <Select value={formData.boardType} onValueChange={(value) => setFormData({ ...formData, boardType: value })}>
                <SelectTrigger id="board-type">
                  <SelectValue placeholder="Select board type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-ply">3 Ply</SelectItem>
                  <SelectItem value="5-ply">5 Ply</SelectItem>
                  <SelectItem value="7-ply">7 Ply</SelectItem>
                  <SelectItem value="duplex">Duplex Board</SelectItem>
                  <SelectItem value="corrugated">Corrugated Sheet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Dimensions (mm) *</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Length"
                type="number"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                required
              />
              <Input
                placeholder="Width"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                required
              />
              <Input
                placeholder="Height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gsm">GSM (Grams per Square Meter) *</Label>
            <Input
              id="gsm"
              type="number"
              placeholder="e.g., 150"
              value={formData.gsm}
              onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Quantity Range *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Min (e.g., 5000)"
                type="number"
                value={formData.quantityMin}
                onChange={(e) => setFormData({ ...formData, quantityMin: e.target.value })}
                required
              />
              <Input
                placeholder="Max (e.g., 10000)"
                type="number"
                value={formData.quantityMax}
                onChange={(e) => setFormData({ ...formData, quantityMax: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="plant">Manufacturing Plant *</Label>
              <Select value={formData.plant} onValueChange={(value) => setFormData({ ...formData, plant: value })}>
                <SelectTrigger id="plant">
                  <SelectValue placeholder="Select plant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="delivery-location">Delivery Location *</Label>
              <Input
                id="delivery-location"
                placeholder="Enter delivery address"
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons and Options */}
      <Card>
        <CardHeader>
          <CardTitle>Add-ons & Special Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Printing & Finishing Options</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Foiling", "UV Coating", "Lamination", "Embossing", "Spot UV", "Die Cutting", "Window Patching"].map((addon) => (
                <div key={addon} className="flex items-center space-x-2">
                  <Checkbox
                    id={addon.toLowerCase().replace(" ", "-")}
                    checked={formData.addons.includes(addon)}
                    onCheckedChange={(checked) => handleAddonChange(addon, checked as boolean)}
                  />
                  <label
                    htmlFor={addon.toLowerCase().replace(" ", "-")}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {addon}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-3 block">Export Requirements</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["FOB", "CIF", "Pallet Load", "Container Load", "Export Docs", "Custom Packaging"].map((req) => (
                <div key={req} className="flex items-center space-x-2">
                  <Checkbox
                    id={req.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                    checked={formData.exportRequirements.includes(req)}
                    onCheckedChange={(checked) => handleExportChange(req, checked as boolean)}
                  />
                  <label
                    htmlFor={req.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {req}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any special requirements or notes..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Priority */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="priority">Set Priority *</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High - Urgent</SelectItem>
                <SelectItem value="medium">Medium - Normal</SelectItem>
                <SelectItem value="low">Low - Can Wait</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-20">
        <Button type="button" variant="outline" onClick={() => router.push("/inquiries")}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Create Inquiry
        </Button>
      </div>
    </form>
  )
}
