"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Save, X, Edit, Trash2, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Dropdown options
const ENQUIRY_TYPE_OPTIONS = [
  { label: "Bid", value: "Bid" },
  { label: "General", value: "General" },
]

const SALES_TYPE_OPTIONS = [
  { label: "Export", value: "Export" },
  { label: "Domestic", value: "Domestic" },
]

const TYPE_OF_JOB_OPTIONS = [
  { label: "New Development", value: "New Development" },
  { label: "Repeat Order", value: "Repeat Order" },
  { label: "Sample", value: "Sample" },
]

const TYPE_OF_PRINTING_OPTIONS = [
  { label: "Flexo", value: "Flexo" },
  { label: "Offset", value: "Offset" },
  { label: "Digital", value: "Digital" },
  { label: "Screen", value: "Screen" },
]

const UOM_OPTIONS = [
  { label: "PCS", value: "PCS" },
  { label: "KGS", value: "KGS" },
  { label: "Sheets", value: "Sheets" },
  { label: "Boxes", value: "Boxes" },
]

const PLANT_OPTIONS = [
  { label: "Mumbai", value: "Mumbai" },
  { label: "Delhi", value: "Delhi" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "Pune", value: "Pune" },
  { label: "Ahmedabad", value: "Ahmedabad" },
]

const CATEGORY_OPTIONS = [
  { label: "Folding Cartons", value: "Folding Cartons" },
  { label: "Corrugated Boxes", value: "Corrugated Boxes" },
  { label: "Labels", value: "Labels" },
  { label: "Flexible Packaging", value: "Flexible Packaging" },
]

// Mock content data with images
const MOCK_CONTENTS = [
  { id: 1, name: "Rectangular Box", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth,JobUps" },
  { id: 2, name: "Square Box", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth" },
  { id: 3, name: "Mailer Box", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth,SizeOpenflap,SizePastingflap" },
  { id: 4, name: "Die Cut", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth,JobAcrossUps,JobAroundUps" },
]

const AVAILABLE_PROCESSES = [
  "Transportation",
  "Transportation (I)",
  "2 Ply Roto Sheet Making",
  "Block Making",
  "Die Cutting with Embossing",
  "Digital Roto Printing",
  "Gluing",
  "Frame and Positive Making",
  "Laminating Pad",
  "MICRONAME/SONG",
  "Outsouce Roto Printing",
  "Outsouce Stitching",
  "Outsouce Front Printing",
  "Sheet Pasting",
  "Spiral Binding",
]

interface AttachedFile {
  name: string
  size: number
  type: string
  file: File
}

export function NewInquiryForm() {
  const router = useRouter()
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

  // Form data
  const [formData, setFormData] = useState({
    enquiryNo: "Auto-generated",
    enquiryDate: new Date().toISOString().split("T")[0],
    enquiryType: "",
    salesType: "",
    clientName: "",
    concernPerson: "",
    concernPersonMobile: "",
    jobName: "",
    categoryName: "",
    productCode: "",
    quantity: "",
    annualQuantity: "",
    unit: "",
    divisionName: "",
    typeOfPrinting: "",
    plant: "",
    supplyLocation: "",
    paymentTerms: "",
    salesPerson: "",
    expectCompletion: "",
    remark: "",
    attachments: [] as AttachedFile[],
  })

  // Content selection state
  const [selectedContentIds, setSelectedContentIds] = useState<number[]>([])
  const [contentGridData, setContentGridData] = useState<any[]>([])

  // Plan details state
  const [planDetails, setPlanDetails] = useState<Record<string, string>>({})

  // Process selection state
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([])
  const [processSearchTerm, setProcessSearchTerm] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray: AttachedFile[] = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }))

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...fileArray],
    }))
  }

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const handleContentSelect = (contentId: number) => {
    setSelectedContentIds((prev) => {
      if (prev.includes(contentId)) {
        return prev.filter((id) => id !== contentId)
      }
      return [...prev, contentId]
    })
  }

  const handleProcessToggle = (process: string) => {
    setSelectedProcesses((prev) => {
      if (prev.includes(process)) {
        return prev.filter((p) => p !== process)
      }
      return [...prev, process]
    })
  }

  const handlePlanDetailChange = (field: string, value: string) => {
    setPlanDetails((prev) => ({ ...prev, [field]: value }))
  }

  const handleApplyContent = () => {
    if (selectedContentIds.length === 0) {
      alert("Please select at least one content")
      return
    }

    const selectedContents = MOCK_CONTENTS.filter((c) => selectedContentIds.includes(c.id))

    const newContentData = selectedContents.map((content) => ({
      id: Date.now() + content.id,
      ContentName: content.name,
      Size: `${planDetails.height || ""} x ${planDetails.length || ""} x ${planDetails.width || ""} MM`.trim(),
      OtherDetails: `GSM: ${planDetails.gsm || "N/A"}, Processes: ${selectedProcesses.length}`,
      rawData: {
        content,
        planDetails: { ...planDetails },
        processes: [...selectedProcesses],
      },
    }))

    setContentGridData((prev) => [...prev, ...newContentData])

    // Reset selections
    setSelectedContentIds([])
    setSelectedProcesses([])
    setPlanDetails({})

    alert(`${newContentData.length} content(s) added successfully`)
  }

  const handleContentDelete = (contentId: number) => {
    setContentGridData((prev) => prev.filter((c) => c.id !== contentId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const errors: Record<string, boolean> = {}

    if (!formData.clientName) errors.clientName = true
    if (!formData.jobName) errors.jobName = true
    if (!formData.quantity || Number(formData.quantity) === 0) errors.quantity = true
    if (!formData.productCode) errors.productCode = true
    if (!formData.salesPerson) errors.salesPerson = true

    // File name validation
    const invalidPattern = /[^A-Za-z0-9._\-\s()]/g
    for (const file of formData.attachments) {
      if (invalidPattern.test(file.name)) {
        alert(
          `File name contains unsupported special characters (only letters, numbers, _, -, . are allowed): ${file.name}`
        )
        return
      }
      if (file.name.length > 65) {
        alert(`File name must not exceed 60 characters (including extension): ${file.name}`)
        return
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      alert("Please fill in all mandatory fields (highlighted in red)")
      return
    }

    // Clear validation errors
    setValidationErrors({})

    console.log("Form data:", {
      ...formData,
      contentGridData,
    })

    alert("Enquiry created successfully!")
    router.push("/inquiries")
  }

  // Generate dynamic fields based on first selected content
  const dynamicFields = (() => {
    if (selectedContentIds.length === 0) return []

    const firstSelectedContent = MOCK_CONTENTS.find((c) => c.id === selectedContentIds[0])
    if (!firstSelectedContent?.sizes) return []

    const sizeFields = firstSelectedContent.sizes.split(",").map((field) => field.trim())

    const fieldConfig: Record<string, { label: string; placeholder: string; key: string }> = {
      SizeHeight: { label: "Height (MM)", placeholder: "0", key: "height" },
      SizeLength: { label: "Length (MM)", placeholder: "0", key: "length" },
      SizeWidth: { label: "Width (MM)", placeholder: "0", key: "width" },
      JobPrePlan: { label: "Pre Plan", placeholder: "Enter", key: "prePlan" },
      JobAcrossUps: { label: "Across Ups", placeholder: "0", key: "acrossUps" },
      JobAroundUps: { label: "Around Ups", placeholder: "0", key: "aroundUps" },
      JobUps: { label: "Ups", placeholder: "0", key: "ups" },
      SizeOpenflap: { label: "Opening Flap", placeholder: "0", key: "openingFlap" },
      SizePastingflap: { label: "Pasting Flap", placeholder: "0", key: "pastingFlap" },
      SizeBottomflap: { label: "Bottom Flap", placeholder: "0", key: "bottomFlap" },
      SizeBottomflapPer: { label: "Bottom Flap %", placeholder: "0", key: "bottomFlapPer" },
    }

    return sizeFields.map((field) => fieldConfig[field]).filter(Boolean)
  })()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="enquiryNo">Enquiry No</Label>
              <Input id="enquiryNo" value={formData.enquiryNo} disabled />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="enquiryDate">Enquiry Date</Label>
              <Input
                id="enquiryDate"
                type="date"
                value={formData.enquiryDate}
                onChange={(e) => handleInputChange("enquiryDate", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="enquiryType">Enquiry Type</Label>
              <Select value={formData.enquiryType} onValueChange={(value) => handleInputChange("enquiryType", value)}>
                <SelectTrigger id="enquiryType">
                  <SelectValue placeholder="Select Enquiry Type" />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="salesType">Sales Type</Label>
              <Select value={formData.salesType} onValueChange={(value) => handleInputChange("salesType", value)}>
                <SelectTrigger id="salesType">
                  <SelectValue placeholder="Select Sales Type" />
                </SelectTrigger>
                <SelectContent>
                  {SALES_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Label htmlFor="clientName">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange("clientName", e.target.value)}
                placeholder="Enter Client Name"
                className={validationErrors.clientName ? "border-red-500" : ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Contact & Job Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Contact & Job Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <div className="md:col-span-3">
              <Label htmlFor="concernPerson">Concerned Person</Label>
              <Input
                id="concernPerson"
                value={formData.concernPerson}
                onChange={(e) => handleInputChange("concernPerson", e.target.value)}
                placeholder="Enter Concerned Person"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="concernPersonMobile">Mobile No.</Label>
              <Input
                id="concernPersonMobile"
                value={formData.concernPersonMobile}
                onChange={(e) => handleInputChange("concernPersonMobile", e.target.value)}
                placeholder="Mobile Number"
              />
            </div>
            <div className="md:col-span-4">
              <Label htmlFor="jobName">
                Job Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobName"
                value={formData.jobName}
                onChange={(e) => handleInputChange("jobName", e.target.value)}
                placeholder="Enter Job Name"
                className={validationErrors.jobName ? "border-red-500" : ""}
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="categoryName">Category Name</Label>
              <Select value={formData.categoryName} onValueChange={(value) => handleInputChange("categoryName", value)}>
                <SelectTrigger id="categoryName">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Product Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="productCode">
                Product Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productCode"
                value={formData.productCode}
                onChange={(e) => handleInputChange("productCode", e.target.value)}
                placeholder="Enter Product Code"
                className={validationErrors.productCode ? "border-red-500" : ""}
              />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="Quantity"
                className={validationErrors.quantity ? "border-red-500" : ""}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="annualQuantity">Annual Quantity</Label>
              <Input
                id="annualQuantity"
                type="number"
                value={formData.annualQuantity}
                onChange={(e) => handleInputChange("annualQuantity", e.target.value)}
                placeholder="Annual Quantity"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="unit">UOM</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  {UOM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="divisionName">Division Name</Label>
              <Input
                id="divisionName"
                value={formData.divisionName}
                onChange={(e) => handleInputChange("divisionName", e.target.value)}
                placeholder="Select Division"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="typeOfPrinting">Type of Printing</Label>
              <Select
                value={formData.typeOfPrinting}
                onValueChange={(value) => handleInputChange("typeOfPrinting", value)}
              >
                <SelectTrigger id="typeOfPrinting">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OF_PRINTING_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Location & Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Location & Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="plant">Production Unit</Label>
              <Select value={formData.plant} onValueChange={(value) => handleInputChange("plant", value)}>
                <SelectTrigger id="plant">
                  <SelectValue placeholder="Select Plant" />
                </SelectTrigger>
                <SelectContent>
                  {PLANT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="supplyLocation">Supply Location</Label>
              <Input
                id="supplyLocation"
                value={formData.supplyLocation}
                onChange={(e) => handleInputChange("supplyLocation", e.target.value)}
                placeholder="Enter Location"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                placeholder="Payment Terms"
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="salesPerson">
                Sales Person <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salesPerson"
                value={formData.salesPerson}
                onChange={(e) => handleInputChange("salesPerson", e.target.value)}
                placeholder="Enter Sales Person"
                className={validationErrors.salesPerson ? "border-red-500" : ""}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="expectCompletion">Expect Completion (Days)</Label>
              <Input
                id="expectCompletion"
                value={formData.expectCompletion}
                onChange={(e) => handleInputChange("expectCompletion", e.target.value)}
                placeholder="Days"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Content Selection & Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Content Selection & Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 border rounded-lg p-3 md:p-4">
            {/* Left Panel: Content Selection */}
            <div className="lg:col-span-4 lg:border-r lg:pr-4 pb-4 lg:pb-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Select Content</span>
                <span className="text-xs text-muted-foreground">{selectedContentIds.length} selected</span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                {MOCK_CONTENTS.map((content) => (
                  <button
                    key={content.id}
                    type="button"
                    onClick={() => handleContentSelect(content.id)}
                    className={`relative rounded-lg border-2 p-2 transition-all hover:shadow-md ${
                      selectedContentIds.includes(content.id)
                        ? "border-[#005180] bg-[#005180]/5"
                        : "border-border hover:border-[#005180]/50"
                    }`}
                  >
                    {selectedContentIds.includes(content.id) && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#005180] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-2">
                      <span className="text-xs text-muted-foreground">Content Image</span>
                    </div>
                    <p className="text-xs text-center font-medium line-clamp-2">{content.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Middle Panel: Plan Details */}
            <div className="lg:col-span-5 lg:border-r lg:pr-4 pb-4 lg:pb-0">
              <span className="text-sm font-medium block mb-3">Plan Winding Details</span>
              <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto">
                {selectedContentIds.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    Select a content to view detail fields
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {dynamicFields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key} className="text-xs">
                          {field.label}
                        </Label>
                        <Input
                          id={field.key}
                          placeholder={field.placeholder}
                          value={planDetails[field.key] || ""}
                          onChange={(e) => handlePlanDetailChange(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Process Selection */}
            <div className="lg:col-span-3">
              <span className="text-sm font-medium block mb-3">Add Allowed Process</span>
              <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto">
                <Input
                  placeholder="Search processes..."
                  className="mb-2"
                  value={processSearchTerm}
                  onChange={(e) => setProcessSearchTerm(e.target.value)}
                />
                <div className="space-y-1">
                  {AVAILABLE_PROCESSES.filter((p) => p.toLowerCase().includes(processSearchTerm.toLowerCase())).map(
                    (process, index) => (
                      <label
                        key={`${process}-${index}`}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedProcesses.includes(process)}
                          onCheckedChange={() => handleProcessToggle(process)}
                        />
                        <span className="text-xs">{process}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={handleApplyContent}
              disabled={selectedContentIds.length === 0}
              className="bg-[#78BE20] hover:bg-[#78BE20]/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Apply Content
            </Button>
          </div>

          {/* Applied Content Grid */}
          {contentGridData.length > 0 && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 font-medium text-sm">Applied Content</div>
              <div className="divide-y">
                {contentGridData.map((content) => (
                  <div key={content.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{content.ContentName}</p>
                      <p className="text-sm text-muted-foreground">{content.Size}</p>
                      <p className="text-xs text-muted-foreground">{content.OtherDetails}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleContentDelete(content.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 6: Remark & Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Remark & Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e) => handleInputChange("remark", e.target.value)}
                placeholder="Enter Remark"
                rows={4}
              />
            </div>
            <div className="md:col-span-5">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="space-y-2">
                <div className="border-2 border-dashed rounded-lg p-3 md:p-4 text-center">
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="attachments" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload files</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 10 files, 10MB each</p>
                  </label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="space-y-1">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-xs">
                        <span className="truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pb-20 md:pb-6">
        <Button type="button" variant="outline" onClick={() => router.push("/inquiries")} className="w-full sm:w-auto">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" className="bg-[#005180] hover:bg-[#004875] w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          Create Enquiry
        </Button>
      </div>
    </form>
  )
}
