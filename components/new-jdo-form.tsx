"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Building2, User, Package, FileText, Paintbrush } from "lucide-react"
import { saveForm, getProductionUnits, getClients } from "@/lib/api/projects"

interface NewJDOFormProps {
  onClose: () => void
  onSubmit?: (data: any) => void
  projectType?: "JDO" | "Commercial" | "PN"
}

interface ProductionUnit {
  ProductionUnitID: number
  ProductionUnitName: string
}

interface Client {
  LedgerID: number
  LedgerName: string
}

export function NewJDOForm({ onClose, onSubmit, projectType = "JDO" }: NewJDOFormProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    productionPlantID: "",
    productionPlantIDName: "",
    prepressPlantID: "",
    prepressPlantIDName: "",
    customerID: "",
    customerName: "",
    brandName: "",
    date: new Date().toISOString().split('T')[0],
    kamName: "",
    kamID: "",
    hodName: "",
    hodID: "",

    // Job Details
    cartonStyle: "",
    pkdReqd: "",
    previousMaterialId: "",
    costSheetReferenceNo: "",
    punchReference: "",
    shadeReference: "",

    // Carton Specification - Board
    boardGSM: "",
    boardType: "",
    boardMill: "",
    boardBrand: "",
    boardNominated: "",
    boardToBoardNominated: "",
    boardToBoardLamination: "",

    // Fluting & Kraft
    flutingType: "",
    kraftPaperGSM: "",
    kraftPaperBF: "",
    kraftLinerGSM: "",
    kraftLinerBF: "",

    // Pre-Printing / Printing Requirements
    prePrintingValueAdd: "",

    // Post Printing Requirements
    frontSideVarnish: "",
    backSideVarnish: "",
    postPrintingLamination: "",
    gravurePrinting: "",
    hotFoilStamping: "",
    coldFoil: "",
    embossing: "",
    windowPasting: "",
    linerPasting: "",
    screenPrinting: "",
    specialComponent: "",
    variableDataPrinting: "",
    cartonPasting: "",
    securityFeatures: "",

    // Additional
    specialInstructions: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productionUnits, setProductionUnits] = useState<ProductionUnit[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingUnits, setIsLoadingUnits] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(false)

  // Fetch production units and clients on component mount, and get user auth data
  useEffect(() => {
    // Get logged-in user's KAM and HOD info
    const authData = localStorage.getItem('userAuth')
    if (authData) {
      try {
        const auth = JSON.parse(authData)
        setFormData(prev => ({
          ...prev,
          kamName: auth.name || "",
          kamID: auth.userId || "",
          hodName: auth.hodName || "",
          hodID: auth.hodId || ""
        }))
      } catch (error) {
        console.error("Error parsing auth data:", error)
      }
    }

    const fetchData = async () => {
      // Fetch production units
      setIsLoadingUnits(true)
      try {
        const unitsResult = await getProductionUnits()
        if (unitsResult.success && unitsResult.data) {
          setProductionUnits(unitsResult.data)
        }
      } catch (error) {
        console.error("Error fetching production units:", error)
      } finally {
        setIsLoadingUnits(false)
      }

      // Fetch clients
      setIsLoadingClients(true)
      try {
        const clientsResult = await getClients()
        if (clientsResult.success && clientsResult.data) {
          setClients(clientsResult.data)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setIsLoadingClients(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePlantChange = (field: string, plantID: string) => {
    const plant = productionUnits.find(u => String(u.ProductionUnitID) === plantID)
    setFormData(prev => ({
      ...prev,
      [field]: plantID,
      [`${field}Name`]: plant?.ProductionUnitName || ""
    }))
  }

  const handleCustomerChange = (customerID: string) => {
    const customer = clients.find(c => String(c.LedgerID) === customerID)
    setFormData(prev => ({
      ...prev,
      customerID: customerID,
      customerName: customer?.LedgerName || ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log(`${projectType} Form Data:`, formData)

      // Convert form data to JSON string as required by API
      const formDataJSON = JSON.stringify(formData)

      // Determine the FormType based on projectType
      const formType = projectType === "Commercial" ? "Commercial" : projectType === "PN" ? "JDO" : "JDO"

      // Call API to save the form
      const result = await saveForm({
        FormType: formType as "JDO" | "SDO" | "Commercial",
        FormDataJSON: formDataJSON
      })

      if (result.success) {
        alert(`✅ ${projectType} form submitted successfully!`)

        if (onSubmit) {
          onSubmit(formData)
        }

        onClose()
      } else {
        alert(`❌ Failed to submit ${projectType} form: ${result.error}`)
      }
    } catch (error) {
      console.error(`Error submitting ${projectType} form:`, error)
      alert(`❌ Failed to submit ${projectType} form. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Project Briefing - {projectType}</h2>
            <p className="text-sm text-gray-500 mt-1">DOC NO: FO/MKT-15</p>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="productionPlantID" className="text-sm font-medium">
                  Production Plant
                </Label>
                <Select
                  value={formData.productionPlantID}
                  onValueChange={(value) => handlePlantChange("productionPlantID", value)}
                  disabled={isLoadingUnits}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={isLoadingUnits ? "Loading..." : "Select production plant"} />
                  </SelectTrigger>
                  <SelectContent>
                    {productionUnits.map((unit) => (
                      <SelectItem key={unit.ProductionUnitID} value={String(unit.ProductionUnitID)}>
                        {unit.ProductionUnitName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prepressPlantID" className="text-sm font-medium">
                  Prepress Plant
                </Label>
                <Select
                  value={formData.prepressPlantID}
                  onValueChange={(value) => handlePlantChange("prepressPlantID", value)}
                  disabled={isLoadingUnits}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={isLoadingUnits ? "Loading..." : "Select prepress plant"} />
                  </SelectTrigger>
                  <SelectContent>
                    {productionUnits.map((unit) => (
                      <SelectItem key={unit.ProductionUnitID} value={String(unit.ProductionUnitID)}>
                        {unit.ProductionUnitName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customerID" className="text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Customer Name
                </Label>
                <Select
                  value={formData.customerID}
                  onValueChange={handleCustomerChange}
                  disabled={isLoadingClients}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={isLoadingClients ? "Loading..." : "Select customer"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.LedgerID} value={String(client.LedgerID)}>
                        {client.LedgerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brandName" className="text-sm font-medium">
                  Brand Name
                </Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleChange("brandName", e.target.value)}
                  placeholder="Enter brand name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="cartonStyle" className="text-sm font-medium">
                  Carton Style
                </Label>
                <Input
                  id="cartonStyle"
                  value={formData.cartonStyle}
                  onChange={(e) => handleChange("cartonStyle", e.target.value)}
                  placeholder="Enter carton style"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="pkdReqd" className="text-sm font-medium">
                  PKD Reqd? (Yes/No | Details)
                </Label>
                <Input
                  id="pkdReqd"
                  value={formData.pkdReqd}
                  onChange={(e) => handleChange("pkdReqd", e.target.value)}
                  placeholder="Yes/No with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="previousMaterialId" className="text-sm font-medium">
                  Previous Material ID
                </Label>
                <Input
                  id="previousMaterialId"
                  value={formData.previousMaterialId}
                  onChange={(e) => handleChange("previousMaterialId", e.target.value)}
                  placeholder="Enter previous material ID"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="costSheetReferenceNo" className="text-sm font-medium">
                  Cost Sheet Reference No
                </Label>
                <Input
                  id="costSheetReferenceNo"
                  value={formData.costSheetReferenceNo}
                  onChange={(e) => handleChange("costSheetReferenceNo", e.target.value)}
                  placeholder="Enter cost sheet reference"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="punchReference" className="text-sm font-medium">
                  Punch Reference
                </Label>
                <Input
                  id="punchReference"
                  value={formData.punchReference}
                  onChange={(e) => handleChange("punchReference", e.target.value)}
                  placeholder="Enter punch reference"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="shadeReference" className="text-sm font-medium">
                  Shade Reference
                </Label>
                <Input
                  id="shadeReference"
                  value={formData.shadeReference}
                  onChange={(e) => handleChange("shadeReference", e.target.value)}
                  placeholder="Enter shade reference"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carton Specification */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Board Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Board</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="boardGSM" className="text-sm font-medium">
                    GSM
                  </Label>
                  <Input
                    id="boardGSM"
                    value={formData.boardGSM}
                    onChange={(e) => handleChange("boardGSM", e.target.value)}
                    placeholder="Enter GSM"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="boardType" className="text-sm font-medium">
                    Board Type
                  </Label>
                  <Input
                    id="boardType"
                    value={formData.boardType}
                    onChange={(e) => handleChange("boardType", e.target.value)}
                    placeholder="N/A or specify"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="boardMill" className="text-sm font-medium">
                    MILL
                  </Label>
                  <Input
                    id="boardMill"
                    value={formData.boardMill}
                    onChange={(e) => handleChange("boardMill", e.target.value)}
                    placeholder="Enter mill"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="boardBrand" className="text-sm font-medium">
                    Board Brand
                  </Label>
                  <Input
                    id="boardBrand"
                    value={formData.boardBrand}
                    onChange={(e) => handleChange("boardBrand", e.target.value)}
                    placeholder="Enter board brand"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Board Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boardNominated" className="text-sm font-medium">
                  Board Nominated?
                </Label>
                <Select
                  value={formData.boardNominated}
                  onValueChange={(value) => handleChange("boardNominated", value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Yes/No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="boardToBoardNominated" className="text-sm font-medium">
                  Board to Board Nominated?
                </Label>
                <Select
                  value={formData.boardToBoardNominated}
                  onValueChange={(value) => handleChange("boardToBoardNominated", value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Yes/No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="boardToBoardLamination" className="text-sm font-medium">
                  Board to Board Lamination
                </Label>
                <Input
                  id="boardToBoardLamination"
                  value={formData.boardToBoardLamination}
                  onChange={(e) => handleChange("boardToBoardLamination", e.target.value)}
                  placeholder="N/A or specify"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="flutingType" className="text-sm font-medium">
                  Fluting Type
                </Label>
                <Input
                  id="flutingType"
                  value={formData.flutingType}
                  onChange={(e) => handleChange("flutingType", e.target.value)}
                  placeholder="e.g., PLY"
                  className="mt-1.5"
                />
              </div>
            </div>

            <Separator />

            {/* Kraft Paper Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Kraft Paper (Fluting Details)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kraftPaperGSM" className="text-sm font-medium">
                    GSM
                  </Label>
                  <Input
                    id="kraftPaperGSM"
                    value={formData.kraftPaperGSM}
                    onChange={(e) => handleChange("kraftPaperGSM", e.target.value)}
                    placeholder="Enter GSM"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="kraftPaperBF" className="text-sm font-medium">
                    BF
                  </Label>
                  <Input
                    id="kraftPaperBF"
                    value={formData.kraftPaperBF}
                    onChange={(e) => handleChange("kraftPaperBF", e.target.value)}
                    placeholder="Enter BF"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Kraft Liner Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Kraft Liner Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kraftLinerGSM" className="text-sm font-medium">
                    GSM
                  </Label>
                  <Input
                    id="kraftLinerGSM"
                    value={formData.kraftLinerGSM}
                    onChange={(e) => handleChange("kraftLinerGSM", e.target.value)}
                    placeholder="Enter GSM"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="kraftLinerBF" className="text-sm font-medium">
                    BF
                  </Label>
                  <Input
                    id="kraftLinerBF"
                    value={formData.kraftLinerBF}
                    onChange={(e) => handleChange("kraftLinerBF", e.target.value)}
                    placeholder="Enter BF"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pre-Printing / Printing Requirements */}
        <Card>
          <CardContent className="pt-6">
            <div>
              <Label htmlFor="prePrintingValueAdd" className="text-sm font-medium">
                Pre Printing Value Add (Selection | Microns / Details)
              </Label>
              <Input
                id="prePrintingValueAdd"
                value={formData.prePrintingValueAdd}
                onChange={(e) => handleChange("prePrintingValueAdd", e.target.value)}
                placeholder="Enter pre-printing details"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Post Printing Requirements */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frontSideVarnish" className="text-sm font-medium">
                  Front Side Varnish (Selections)
                </Label>
                <Input
                  id="frontSideVarnish"
                  value={formData.frontSideVarnish}
                  onChange={(e) => handleChange("frontSideVarnish", e.target.value)}
                  placeholder="NO or specify"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="backSideVarnish" className="text-sm font-medium">
                  Back Side Varnish (Selections)
                </Label>
                <Input
                  id="backSideVarnish"
                  value={formData.backSideVarnish}
                  onChange={(e) => handleChange("backSideVarnish", e.target.value)}
                  placeholder="NO or specify"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="postPrintingLamination" className="text-sm font-medium">
                  Post Printing Lamination (Film Type / Microns)
                </Label>
                <Input
                  id="postPrintingLamination"
                  value={formData.postPrintingLamination}
                  onChange={(e) => handleChange("postPrintingLamination", e.target.value)}
                  placeholder="Specify film type and microns"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="gravurePrinting" className="text-sm font-medium">
                  Gravure Printing (Yes/No | Details, If Any)
                </Label>
                <Input
                  id="gravurePrinting"
                  value={formData.gravurePrinting}
                  onChange={(e) => handleChange("gravurePrinting", e.target.value)}
                  placeholder="Yes/No with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="hotFoilStamping" className="text-sm font-medium">
                  HOT Foil Stamping (Yes/No | Details)
                </Label>
                <Input
                  id="hotFoilStamping"
                  value={formData.hotFoilStamping}
                  onChange={(e) => handleChange("hotFoilStamping", e.target.value)}
                  placeholder="Yes/No with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="coldFoil" className="text-sm font-medium">
                  COLD Foil (Yes/No | Details)
                </Label>
                <Input
                  id="coldFoil"
                  value={formData.coldFoil}
                  onChange={(e) => handleChange("coldFoil", e.target.value)}
                  placeholder="Yes/No with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="embossing" className="text-sm font-medium">
                  Embossing (Selections)
                </Label>
                <Input
                  id="embossing"
                  value={formData.embossing}
                  onChange={(e) => handleChange("embossing", e.target.value)}
                  placeholder="Enter embossing details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="windowPasting" className="text-sm font-medium">
                  Window Pasting (Film Type | Microns)
                </Label>
                <Input
                  id="windowPasting"
                  value={formData.windowPasting}
                  onChange={(e) => handleChange("windowPasting", e.target.value)}
                  placeholder="Film type and microns"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="linerPasting" className="text-sm font-medium">
                  Liner Pasting (Yes/No | Details)
                </Label>
                <Input
                  id="linerPasting"
                  value={formData.linerPasting}
                  onChange={(e) => handleChange("linerPasting", e.target.value)}
                  placeholder="Yes/No with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="screenPrinting" className="text-sm font-medium">
                  Screen Printing (Selection | Details If Any)
                </Label>
                <Input
                  id="screenPrinting"
                  value={formData.screenPrinting}
                  onChange={(e) => handleChange("screenPrinting", e.target.value)}
                  placeholder="Selection with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="specialComponent" className="text-sm font-medium">
                  Special Component
                </Label>
                <Input
                  id="specialComponent"
                  value={formData.specialComponent}
                  onChange={(e) => handleChange("specialComponent", e.target.value)}
                  placeholder="Enter special component"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="variableDataPrinting" className="text-sm font-medium">
                  Variable Data Printing (Selection | Details If Any)
                </Label>
                <Input
                  id="variableDataPrinting"
                  value={formData.variableDataPrinting}
                  onChange={(e) => handleChange("variableDataPrinting", e.target.value)}
                  placeholder="Selection with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="cartonPasting" className="text-sm font-medium">
                  Carton Pasting (Selection | Details If Any)
                </Label>
                <Input
                  id="cartonPasting"
                  value={formData.cartonPasting}
                  onChange={(e) => handleChange("cartonPasting", e.target.value)}
                  placeholder="Selection with details"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="securityFeatures" className="text-sm font-medium">
                  Security Features (Selection | Details If Any)
                </Label>
                <Input
                  id="securityFeatures"
                  value={formData.securityFeatures}
                  onChange={(e) => handleChange("securityFeatures", e.target.value)}
                  placeholder="Selection with details"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardContent className="pt-6">
            <div>
              <Label htmlFor="specialInstructions" className="text-sm font-medium">
                Special Instructions
              </Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => handleChange("specialInstructions", e.target.value)}
                placeholder="Enter any special instructions or requirements..."
                rows={4}
                className="mt-1.5 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-w-[120px]">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] bg-[#005180] hover:bg-[#003d5c]"
          >
            {isSubmitting ? "Submitting..." : "Submit JDO"}
          </Button>
        </div>
      </form>
    </div>
  )
}
