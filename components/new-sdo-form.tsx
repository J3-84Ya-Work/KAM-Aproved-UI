"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Building2, User, Package, FileText } from "lucide-react"
import { saveForm, getProductionUnits, getClients } from "@/lib/api/projects"
import { useToast } from "@/hooks/use-toast"

// Dropdown options data
const SDO_DROPDOWN_OPTIONS = {
  BoardType: [
    "ONE SIDE POLY CTD BOARD",
    "PET",
    "PET COATED BOARD",
    "PP",
    "S.KAPPA SOLID BD",
    "SANDWICH BOARD",
    "SAPPI ALGRO DESIGN"
  ],
  BoardMill: [
    "ITC",
    "JK PAPER",
    "SAPPI",
    "WESTROCK"
  ],
  BoardBrand: [
    "CYMK",
    "FBB",
    "IVORY",
    "KRAFT"
  ],
  Fluting: [
    "B-FLUTING",
    "C-FLUTING",
    "E-FLUTING",
    "N-FLUTING",
    "B & C-FLUTING",
    "E & N-FLUTING"
  ],
  InkType: [
    "WATER BASED",
    "UV",
    "SOLVENT",
    "FOOD GRADE"
  ],
  Foiling: [
    "GOLD FOIL",
    "SILVER FOIL",
    "HOLOGRAPHIC FOIL",
    "MATTE FOIL"
  ],
  Window: [
    "YES",
    "NO"
  ],
  WindowLamination: [
    "PET",
    "BOPP",
    "PVC"
  ],
  WindowPatching: [
    "YES",
    "NO"
  ],
  PostPrintLamination: [
    "A PET",
    "B PET",
    "BOPP GLOSS FRONT SIDE",
    "BOPP GLOSS BACK SIDE",
    "BOPP MATT FRONT SIDE",
    "BOPP MATT BACK SIDE",
    "BOPP VELVET FRONT SIDE",
    "BOPP VELVET BACK SIDE",
    "PET FRONT SIDE",
    "PET BACK SIDE"
  ],
  Varnish: [
    "AQUEOUS",
    "AQUEOUS MATT VARNISH",
    "AQUEOUS SPOT MATT VARNISH",
    "AQUEOUS WITH NVZ",
    "FOOD GRADE VARNISH",
    "FOOD GRADE SPOT VARNISH",
    "HEAT RESISTANCE COATING",
    "HEAT SEAL LACQUER COATING",
    "HIGH RUB WB VARNISH WITH NVZ"
  ],
  LinerPasting: [
    "YES",
    "NO"
  ],
  Embossing: [
    "EMBOSS",
    "DEBOSS",
    "REGISTERED EMBOSS"
  ],
  Punching: [
    "YES",
    "NO"
  ],
  Pasting: [
    "SIDE PASTING",
    "BOTTOM PASTING",
    "FULL PASTING"
  ],
  BDtoBDLamination: [
    "YES",
    "NO"
  ],
  ScreenPrinting: [
    "YES",
    "NO"
  ],
  VariableDataPrinting: [
    "YES",
    "NO"
  ],
  BoardNomination: [
    "CUSTOMER",
    "PRINTER"
  ],
  PKD: [
    "YES",
    "NO"
  ],
  LogoPosition: [
    "FRONT",
    "BACK",
    "SIDE",
    "TOP"
  ],
  KraftShade: [
    "BROWN",
    "WHITE",
    "NATURAL"
  ],
  KraftLinerShade: [
    "BROWN",
    "WHITE"
  ],
  YesNo: [
    "YES",
    "NO"
  ],
  SecurityFeatures: [
    "HOLOGRAM",
    "QR CODE",
    "BARCODE",
    "SERIAL NUMBER"
  ]
}

interface NewSDOFormProps {
  onClose: () => void
  onSubmit?: (data: any) => void
}

interface ProductionUnit {
  ProductionUnitID: number
  ProductionUnitName: string
}

interface Client {
  LedgerID: number
  LedgerName: string
}

export function NewSDOForm({ onClose, onSubmit }: NewSDOFormProps) {
  const { toast } = useToast()
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

    // Carton Specification - Board
    boardGSM: "",
    boardType: "",
    boardMill: "",
    boardBrand: "",
    boardNomination: "",

    // Board to Board
    bdToBdLamination: "",

    // Fluting & Kraft
    flutingType: "",
    kraftPaperGSM: "",
    kraftPaperBF: "",
    kraftShade: "",
    kraftLinerGSM: "",
    kraftLinerBF: "",
    kraftLinerShade: "",

    // Printing
    inkType: "",
    screenPrinting: "",
    variableDataPrinting: "",

    // Foil Stamping
    foiling: "",
    hotFoilStamping: "",
    coldFoilStamping: "",

    // Window
    window: "",
    windowLamination: "",
    windowPatching: "",

    // Lamination & Varnish
    postPrintLamination: "",
    varnish: "",

    // Finishing
    embossing: "",
    punching: "",
    pasting: "",
    linerPasting: "",

    // Others
    pkd: "",
    logoPosition: "",
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
      console.log("SDO Form Data:", formData)

      // Convert form data to JSON string as required by API
      const formDataJSON = JSON.stringify(formData)

      // Call API to save the form
      const result = await saveForm({
        FormType: "SDO",
        FormDataJSON: formDataJSON
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "SDO form submitted successfully!",
          variant: "default",
        })

        if (onSubmit) {
          onSubmit(formData)
        }

        onClose()
      } else {
        toast({
          title: "Error",
          description: `Failed to submit SDO form: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting SDO form:", error)
      toast({
        title: "Error",
        description: "Failed to submit SDO form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reusable dropdown component
  const DropdownField = ({
    label,
    field,
    options,
    placeholder = "Select option"
  }: {
    label: string
    field: string
    options: string[]
    placeholder?: string
  }) => (
    <div className="min-w-0">
      <Label htmlFor={field} className="text-sm font-medium truncate block">
        {label}
      </Label>
      <Select
        value={formData[field as keyof typeof formData] as string}
        onValueChange={(value) => handleChange(field, value)}
      >
        <SelectTrigger className="mt-1.5 truncate">
          <SelectValue placeholder={placeholder} className="truncate" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {options.map((option) => (
            <SelectItem key={option} value={option} className="truncate">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="w-full max-w-5xl mx-auto p-6 overflow-x-hidden">
      <form onSubmit={handleSubmit} className="space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Project Briefing - SDO</h2>
            <p className="text-sm text-gray-500 mt-1">DOC NO: FO/MKT-15</p>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="min-w-0">
                <Label htmlFor="productionPlantID" className="text-sm font-medium">
                  Production Plant
                </Label>
                <Select
                  value={formData.productionPlantID}
                  onValueChange={(value) => handlePlantChange("productionPlantID", value)}
                  disabled={isLoadingUnits}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder={isLoadingUnits ? "Loading..." : "Select production plant"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {productionUnits.map((unit) => (
                      <SelectItem key={unit.ProductionUnitID} value={String(unit.ProductionUnitID)}>
                        {unit.ProductionUnitName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0">
                <Label htmlFor="prepressPlantID" className="text-sm font-medium">
                  Prepress Plant
                </Label>
                <Select
                  value={formData.prepressPlantID}
                  onValueChange={(value) => handlePlantChange("prepressPlantID", value)}
                  disabled={isLoadingUnits}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder={isLoadingUnits ? "Loading..." : "Select prepress plant"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {productionUnits.map((unit) => (
                      <SelectItem key={unit.ProductionUnitID} value={String(unit.ProductionUnitID)}>
                        {unit.ProductionUnitName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0">
                <Label htmlFor="customerID" className="text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Customer Name
                </Label>
                <Select
                  value={formData.customerID || undefined}
                  onValueChange={handleCustomerChange}
                  disabled={isLoadingClients}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder={isLoadingClients ? "Loading..." : "Select customer"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {clients.map((client) => (
                      <SelectItem key={`customer-${client.LedgerID}`} value={String(client.LedgerID)}>
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

        {/* Board Specification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Board Specification</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="boardGSM" className="text-sm font-medium">
                  Board GSM
                </Label>
                <Input
                  id="boardGSM"
                  value={formData.boardGSM}
                  onChange={(e) => handleChange("boardGSM", e.target.value)}
                  placeholder="Enter GSM"
                  className="mt-1.5"
                />
              </div>

              <DropdownField
                label="Board Type"
                field="boardType"
                options={SDO_DROPDOWN_OPTIONS.BoardType}
                placeholder="Select board type"
              />

              <DropdownField
                label="Board Mill"
                field="boardMill"
                options={SDO_DROPDOWN_OPTIONS.BoardMill}
                placeholder="Select mill"
              />

              <DropdownField
                label="Board Brand"
                field="boardBrand"
                options={SDO_DROPDOWN_OPTIONS.BoardBrand}
                placeholder="Select brand"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownField
                label="Board Nomination"
                field="boardNomination"
                options={SDO_DROPDOWN_OPTIONS.BoardNomination}
                placeholder="Select nomination"
              />

              <DropdownField
                label="BD to BD Lamination"
                field="bdToBdLamination"
                options={SDO_DROPDOWN_OPTIONS.BDtoBDLamination}
                placeholder="Select Yes/No"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fluting & Kraft Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Fluting & Kraft Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DropdownField
                label="Fluting Type"
                field="flutingType"
                options={SDO_DROPDOWN_OPTIONS.Fluting}
                placeholder="Select fluting"
              />

              <div>
                <Label htmlFor="kraftPaperGSM" className="text-sm font-medium">
                  Kraft Paper GSM
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
                  Kraft Paper BF
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DropdownField
                label="Kraft Shade"
                field="kraftShade"
                options={SDO_DROPDOWN_OPTIONS.KraftShade}
                placeholder="Select shade"
              />

              <div>
                <Label htmlFor="kraftLinerGSM" className="text-sm font-medium">
                  Kraft Liner GSM
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
                  Kraft Liner BF
                </Label>
                <Input
                  id="kraftLinerBF"
                  value={formData.kraftLinerBF}
                  onChange={(e) => handleChange("kraftLinerBF", e.target.value)}
                  placeholder="Enter BF"
                  className="mt-1.5"
                />
              </div>

              <DropdownField
                label="Kraft Liner Shade"
                field="kraftLinerShade"
                options={SDO_DROPDOWN_OPTIONS.KraftLinerShade}
                placeholder="Select shade"
              />
            </div>
          </CardContent>
        </Card>

        {/* Printing Options */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Printing Options</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DropdownField
                label="Ink Type"
                field="inkType"
                options={SDO_DROPDOWN_OPTIONS.InkType}
                placeholder="Select ink type"
              />

              <DropdownField
                label="Screen Printing"
                field="screenPrinting"
                options={SDO_DROPDOWN_OPTIONS.ScreenPrinting}
                placeholder="Select Yes/No"
              />

              <DropdownField
                label="Variable Data Printing"
                field="variableDataPrinting"
                options={SDO_DROPDOWN_OPTIONS.VariableDataPrinting}
                placeholder="Select Yes/No"
              />
            </div>
          </CardContent>
        </Card>

        {/* Foil Stamping */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Foil Stamping</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DropdownField
                label="Foiling Type"
                field="foiling"
                options={SDO_DROPDOWN_OPTIONS.Foiling}
                placeholder="Select foiling"
              />

              <div>
                <Label htmlFor="hotFoilStamping" className="text-sm font-medium">
                  Hot Foil Stamping Details
                </Label>
                <Input
                  id="hotFoilStamping"
                  value={formData.hotFoilStamping}
                  onChange={(e) => handleChange("hotFoilStamping", e.target.value)}
                  placeholder="e.g., Gold foil on logo"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="coldFoilStamping" className="text-sm font-medium">
                  Cold Foil Stamping Details
                </Label>
                <Input
                  id="coldFoilStamping"
                  value={formData.coldFoilStamping}
                  onChange={(e) => handleChange("coldFoilStamping", e.target.value)}
                  placeholder="e.g., Silver foil strip"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Window Options */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Window Options</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DropdownField
                label="Window"
                field="window"
                options={SDO_DROPDOWN_OPTIONS.Window}
                placeholder="Select Yes/No"
              />

              <DropdownField
                label="Window Lamination"
                field="windowLamination"
                options={SDO_DROPDOWN_OPTIONS.WindowLamination}
                placeholder="Select lamination"
              />

              <DropdownField
                label="Window Patching"
                field="windowPatching"
                options={SDO_DROPDOWN_OPTIONS.WindowPatching}
                placeholder="Select Yes/No"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lamination & Varnish */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lamination & Varnish</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownField
                label="Post Print Lamination"
                field="postPrintLamination"
                options={SDO_DROPDOWN_OPTIONS.PostPrintLamination}
                placeholder="Select lamination"
              />

              <DropdownField
                label="Varnish"
                field="varnish"
                options={SDO_DROPDOWN_OPTIONS.Varnish}
                placeholder="Select varnish"
              />
            </div>
          </CardContent>
        </Card>

        {/* Finishing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Finishing</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DropdownField
                label="Embossing"
                field="embossing"
                options={SDO_DROPDOWN_OPTIONS.Embossing}
                placeholder="Select embossing"
              />

              <DropdownField
                label="Punching"
                field="punching"
                options={SDO_DROPDOWN_OPTIONS.Punching}
                placeholder="Select Yes/No"
              />

              <DropdownField
                label="Pasting"
                field="pasting"
                options={SDO_DROPDOWN_OPTIONS.Pasting}
                placeholder="Select pasting"
              />

              <DropdownField
                label="Liner Pasting"
                field="linerPasting"
                options={SDO_DROPDOWN_OPTIONS.LinerPasting}
                placeholder="Select Yes/No"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Additional Options</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DropdownField
                label="PKD"
                field="pkd"
                options={SDO_DROPDOWN_OPTIONS.PKD}
                placeholder="Select Yes/No"
              />

              <DropdownField
                label="Logo Position"
                field="logoPosition"
                options={SDO_DROPDOWN_OPTIONS.LogoPosition}
                placeholder="Select position"
              />

              <DropdownField
                label="Security Features"
                field="securityFeatures"
                options={SDO_DROPDOWN_OPTIONS.SecurityFeatures}
                placeholder="Select features"
              />
            </div>

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
            {isSubmitting ? "Submitting..." : "Submit SDO"}
          </Button>
        </div>
      </form>
    </div>
  )
}
