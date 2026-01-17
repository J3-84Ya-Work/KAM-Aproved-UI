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
import { useToast } from "@/hooks/use-toast"

// Dropdown options from Master Data
const DROPDOWN_OPTIONS = {
  cartonStyle: [
    "BOTH SIDE OPEN SAME DIRECTION",
    "BURGOPACK",
    "CRASH LOCK BOTTOM",
    "CRASH LOCK BOTTOM & FLIP TOP",
    "END GLUED",
    "FLAT",
    "OTHERS",
    "OUTSERTS",
    "REVERSE TUCK IN",
    "RING FLAP STYLE",
    "SIDE PASTING & LOCK BOTTOM",
    "SLEEVE",
    "SNAP LOCK BOTTOM",
    "STRAIGHT TUCK IN",
    "TRIANGULAR"
  ],
  packagingType: [
    "BURGO PACK",
    "CANISTER",
    "FLUTED",
    "GABLE TOP",
    "MONOCARTON",
    "RIGID BOX",
    "SPECIALITY PACKAGING"
  ],
  flutingType: [
    "A & B-FLUTING",
    "A-FLUTING",
    "B & C-FLUTING",
    "B-FLUTING",
    "C-FLUTING",
    "E & N-FLUTING",
    "E-FLUTING",
    "F-FLUTING",
    "G-FLUTING",
    "N-FLUTING",
    "N/A"
  ],
  embossingType: [
    "2D Embossing",
    "3D Embossing",
    "Debossing",
    "Embossing",
    "Micro Embossing",
    "Step Embossing"
  ],
  variableDataPrinting: [
    "ALPHANUMERIC CODE",
    "BARCODE",
    "OTHER 2D CODE",
    "QR CODE"
  ],
  postPrintLamination: [
    "A PET",
    "B PET",
    "BOPP GLOSS BACK SIDE",
    "BOPP GLOSS FRONT SIDE",
    "BOPP MATT BACK SIDE",
    "BOPP MATT FRONT SIDE",
    "BOPP VELVET BACK SIDE",
    "BOPP VELVET FRONT SIDE",
    "LDPE Low Density PolyEthylene",
    "MATT PET LAMINATION",
    "PET BACK SIDE",
    "PET FRONT SIDE",
    "SCUFF FREE MATT BOPP",
    "THERMAL MATT LAMINATION BACK SIDE",
    "THERMAL MATT LAMINATION FRONT SIDE",
    "TRANSPARENT HOLOGRAPHIC"
  ],
  cartonPasting: [
    "4 CORNER PASTING",
    "6 CORNER PASTING",
    "DOUBLE SIDE PASTING",
    "FLAME SEAL & FLAME SKIVING",
    "LOCK BOTTOM & HEADER PASTING",
    "MANUAL ASSEMBLY",
    "N/A",
    "OTHER",
    "SIDE PASTING",
    "SIDE PASTING & LOCK BOTTOM",
    "SIDE PASTING - FLAME SEAL",
    "SIDE STAPLED"
  ],
  boardMill: [
    "BALKRISHNA",
    "BILT",
    "CENTURY",
    "DEEVYASHAKTI",
    "DEVPRIYA",
    "DIYAN",
    "EMAMI",
    "FAVINI",
    "FEDRIGONI",
    "GAYATRISHAKTI",
    "IGGESUND",
    "ITC LTD",
    "J K",
    "JODHANI MILL",
    "KAPSTONE",
    "KHANNA",
    "KRAFT SDP (YASH)",
    "Kraft",
    "LAXMI",
    "MEAD WESTVACO",
    "MEHALI",
    "METSA",
    "MILM",
    "N R AGARWAL",
    "N/A",
    "NAINI PAPERS",
    "NIPPON DYNAWAVE",
    "NOT KNOWN",
    "PP",
    "SAPPI",
    "SHREE AJIT KRAFT",
    "SIDHARTH",
    "SMURFIT",
    "SRI VENKATESHWARA",
    "SRIHARI VENKATESHWARA MILL",
    "STORA ENSO",
    "TNPL",
    "WAYARHAEUSE",
    "WEST ROCK"
  ],
  boardBrand: [
    "A-PET",
    "AURA FOLD PREMIUM BOARD",
    "BILT CHROMO ART PAPER",
    "BILT MAPLITHO NSD P H PAPER",
    "BK DUPLEX GB",
    "BK ECO HWC GB",
    "BK SUPER CHROMO GB",
    "BK SUPER CHROMO WB",
    "BROWN KRAFT",
    "Board Supplied From Vendor",
    "CARTA INTEGRA",
    "CENTURY GREY BACK",
    "CENTURY MARINE GRAPHIC",
    "CENTURY OMEGA",
    "CENTURY OMEGA PLUS",
    "CENTURY POLYCOATED",
    "CENTURY PRIMA FOLD",
    "CENTURY PRIMA PLUS",
    "CENTURY SUPERIA FOLD",
    "CENTURY SUPERIA GRAPHIC",
    "CENTURY SUPERIAL FOLD PLUS",
    "CENTURY SW MAPLITHO",
    "Century Marine Fold One Side PE Coated",
    "DEEVYASHAKTI HWC GB",
    "DEVPRIYA HWC GB",
    "DEVPRIYA HWC WB",
    "DIYAN STAR PRIME",
    "EMAMI FBB",
    "EMAMI FBB MAXOFOLD",
    "EMAMI GB",
    "EMAMI GLAMKOT",
    "EMAMI WB",
    "Emami Ecostrong GB CGT",
    "FM STORA NATURAL",
    "Flutted Sheets from Outside",
    "GAG PET MATT/MATT",
    "GAYATRI COATED GB",
    "GAYATRI COATED HWC GB BLISTER",
    "GAYATRI COATED HWC WB BLISTER",
    "GAYATRI COATED WB",
    "GAYATRI HWC WB BLISTER",
    "GLOSSY CHROMO ART PAPER",
    "GOLDEN KRAFT",
    "IMPORTED WHITE KRAFT LINER",
    "INVERCOTE CREATO MATT",
    "ITC BLEACHED KRAFTLINER",
    "ITC C2S SG ARTCARD",
    "ITC CARTE LUMINA",
    "ITC CFK",
    "ITC CLC TRIPLEX FSC BOARD",
    "ITC COATED GB BCM",
    "ITC CTD HIGH BUSTER LIN",
    "ITC CTD W K LINER",
    "ITC CYBERXL CYX GC2",
    "ITC CYBERXL GC1 MTS CTD",
    "ITC CYBERXLPAC",
    "ITC CYBERXLPAC AF",
    "ITC CYBERXLPAC GC1",
    "ITC CYBERXLPAC GC2",
    "ITC CYBERXLPAC PREMIUM",
    "ITC FILOPACK",
    "ITC FILOSERVE",
    "ITC HIZINE PAPER",
    "ITC High Stiff GB",
    "ITC INDO BAR",
    "ITC INDO BAR 1 PE",
    "ITC INDO RK SANDWICH",
    "ITC INDOBAR ECO 2PE",
    "ITC INDOBASE UNTD VIVAA",
    "ITC INDOBASE [MF]TRIPLEX BD",
    "ITC INDOBASE [MF]TRIPLEX BD COATED",
    "ITC INDOBOWL 1 PE",
    "ITC INDOLUX SAFFIRE",
    "ITC KOVAI COATED FR GB",
    "ITC KOVAI COATED GB",
    "ITC KOVAI COATED GB HS",
    "ITC KOVAI COATED GB PREMIUM",
    "ITC KOVAI COATED HB GB",
    "ITC KOVAI COATED WB",
    "ITC KOVAI COATED WB PREMIUM",
    "ITC KOVAI WB HS",
    "ITC NEO BLISS",
    "ITC NEO BLISS SANDWICH BOARD",
    "ITC NEO WHITE BLISS",
    "ITC OBA CLC TRIPLEX",
    "ITC PEARL GRAPHIK",
    "ITC PEARLXLPAC",
    "ITC PHARMA PRINT",
    "ITC SAFFIRE GRAPHIK",
    "ITC SAFFIRE GRAPHIK 1PE",
    "ITC SAFFIRE GRAPHIK C2S",
    "ITC SAFFIRE XLPAC",
    "ITC SUPERFINE PRINT",
    "ITC VIVA LINER",
    "ITC VIVAA CARD",
    "ITC WHITE KRAFT LINER",
    "JK ARTCARD",
    "JK MAPLITHO PAPER",
    "JK TUFFCOTE",
    "JK TUFFCOTE HIGH BULK",
    "JK ULTIMA",
    "KAPSTONE KRAFTPAK",
    "KHANNA DIAMOND GRAPHIK GB",
    "KHANNA OPTIC GB",
    "KHANNA OPTIC WB",
    "KRAFT PAPER",
    "Kraft Korean Shade",
    "Kraft Paper",
    "MAPLITHO PAPER",
    "MATERICA GESSO",
    "MEADWEST PRINTCOTE C1S",
    "MEADWEST PRINTCOTE C2S",
    "MEHALI ECO GREEN GB",
    "MEHALI ECO WHITE WB",
    "METSA AVANTA ULTRA",
    "METSA PRIME FBB BRIGHT",
    "METSA PRIME FBB EB",
    "METSA SIMCOTE FBB",
    "MILM KAPPA GB+WB",
    "Metalized Board From Customer",
    "N R EXCEL",
    "N/A",
    "NOT KNOWN",
    "NR CLASSIC PAPER",
    "NR COATED WB",
    "NR DUPLEX GB",
    "NR WB BLISTER",
    "PET",
    "POL WAYERHAEUSE G-9159",
    "POLY COAT LIQ PACK BD 9159",
    "POLYCOATED GAY WB",
    "POLYCTD CENTURYSWMAPLIT",
    "PP BLACK ROUGHSAND/SAND PP",
    "PP BOTHSIDE GLOSS",
    "PP CROSSLINE/GLOSS",
    "PP DEADMATT/SANDMATT",
    "PP FINE SAND/FINE SAND MILKY",
    "PP FINE SAND/GLOSS",
    "PP FINE SAND/SANDMATT",
    "PP GLOSS/ FINESAND MATT",
    "PP GLOSS/DULLMATT",
    "PP GLOSS/FINEMATT",
    "PP GLOSS/GLOSS",
    "PP GLOSS/GLOSS HIGH CLE",
    "PP GLOSS/GLOSS HT",
    "PP GLOSS/GLOSS ULTRACLE",
    "PP GLOSS/PLAIN",
    "PP GLOSS/SANDMATT",
    "PP MILKYWHIT ROUGH SAND/SAND",
    "PP MILKYWHIT SAND/PLAIN",
    "PP PMS 431C ROUGHSAND/SAND PP",
    "PP PMS 5463U ROUGHSAND/SAND PP",
    "PP STRAIGHTLINE/GLOSS",
    "PRINT COTE WEST VACO",
    "Printed Board From Outside",
    "Printed Kraft From External Vendor",
    "SANDWICH (BOARD/KRAFT)",
    "SAPPI ALGRO DESIGN",
    "SAPPI MAGNOSTAR ARTPAPER",
    "SHIRO ECO WH FN PAPER",
    "SIDHARTH CLASSIC GB",
    "SIDHARTH CRYSTAL WB",
    "SMURFIT BOARD 2.00MMCALIPER",
    "STORA CKB CARRIER BOARD",
    "STORA COATED KRAFT",
    "STORA ENSO COAT",
    "STORA ENSO COATED GB",
    "STORA ENSO COTE",
    "STORA ENSO TRAYFORMA",
    "STORA ENSO TRAYFORMA BIO",
    "STORA NATURA 2 PE",
    "STORA NATURA AL93 378G",
    "STORA TAM BRITE",
    "STORA TAM WHITE",
    "VENK KAPPA GB+GB",
    "VENK KAPPA GB+WB",
    "WHITE KRAFT LINER"
  ],
  kraftLinerShade: [
    "Black Maplitho",
    "FM WHITE MAPLITHO",
    "FM White Natural",
    "FR WHITE KRAFT LINER",
    "FSC FR Gray Back",
    "FSC FR Natural",
    "Golden",
    "Grey Back",
    "ITC INDOBASE [MF]TRIPLEX",
    "KOREAN SHADE",
    "Maplitho",
    "N/A",
    "Natural",
    "Natural Water Repellent",
    "WHITE KRAFT LINER",
    "White",
    "White Back",
    "White Maplitho",
    "YELLOW GOLD SHADE"
  ],
  screenPrinting: [
    "ABRASIVE",
    "GLOW IN DARK",
    "GOLD GLITTER",
    "HYDROCHROMIC INK",
    "INK PRINTING",
    "RAISED UV",
    "RUB N SNIFF",
    "SAND EFFECT",
    "SCRATCH OFF",
    "SILVER GLITTER",
    "SOFT TOUCH",
    "SPOT GLOSS",
    "SPOT UV",
    "THERMOCROMIC"
  ],
  securityFeatures: [
    "COIN REACTIVE",
    "HOLOGRAM",
    "INK HIDDEN IMAGE",
    "INVISIBLE INK",
    "LINE EMBOSSING",
    "LINE SCREENING",
    "MICRO TEXT",
    "THERMOCHROMIC INK"
  ],
  windowPastingFilm: [
    "A-PET",
    "PET"
  ],
  yesNo: [
    "YES",
    "NO"
  ],
  varnish: [
    "AQUEOUS",
    "AQUEOUS BASED BLISTER COATING",
    "AQUEOUS MATT VARNISH",
    "AQUEOUS MATT VARNISH WITH NVZ",
    "AQUEOUS SPOT MATT VARNISH",
    "AQUEOUS WITH NVZ",
    "FLASH AQUEOUS",
    "FOOD GRADE SPOT VARNISH",
    "FOOD GRADE VARNISH",
    "FOOD GRADE VARNISH WITH NVZ",
    "HEAT RESISTANCE COAT WITH NVZ",
    "HEAT RESISTANCE COATING",
    "HEAT SEAL LACQUER COATING",
    "HIGH RUB WB VARNISH WITH NVZ",
    "IRIODIN EFFECT",
    "LT. COAT OF AQUA SPOT",
    "MATT UV",
    "MATT UV ON DEFINED AREA",
    "MATT UV WITH NVZ",
    "N/A",
    "PEARLIEST VARNISH WITH NVZ",
    "PEARLISED VARNISH",
    "SHIMMERING EFFECT",
    "SILKY MATT AQUEOS",
    "SOFT TOUCH VARNISH",
    "SOFT TOUCH VARNISH WITH NVZ",
    "SOLVENT BASED BLISTER COATING",
    "SPOT MATT UV",
    "TOYO Varnish",
    "TOYO Varnish with NVZ",
    "UV COATING",
    "UV ON DEFINED AREA",
    "UV WITH NVZ",
    "WATER BASED BLISTER VARNISH",
    "WATER REPELLENT COATING"
  ],
  kraftShade: [
    "Black Maplitho",
    "FM WHITE MAPLITHO",
    "FM White Natural",
    "FR White",
    "FSC FR Natural",
    "Golden Yellow",
    "ITC INDOBASE [MF]TRIPLEX",
    "KOREAN SHADE",
    "Maplitho",
    "N/A",
    "Natural",
    "Natural Water Repellent",
    "White Back",
    "White Maplitho",
    "YELLOW GOLD SHADE",
    "Yellow"
  ],
  boardType: [
    "ART PAPER",
    "ARTCARD",
    "BIBLE PAPER",
    "BIOCOMPOSITES",
    "BOTHSIDE POLY CTD BOARD",
    "CHROMO PAPER",
    "CLC TRIPLEX",
    "COATED FOLDING BOX BOARD",
    "FOIL BOARD 15PT HYPK-NC DULL S",
    "FOLDING BOX BOARD (FBB)",
    "FSC MIXED (FM)",
    "FSC PURE (FP)",
    "FSC RECYCLED (FR)",
    "GB CGT(Blue Tone)",
    "GREY BACK (GB)",
    "GREY BACK BLISTER",
    "ITC OBA",
    "KRAFT PAPER",
    "MAPLITHO PAPER",
    "N/A",
    "ONE SIDE COATED PAPER",
    "ONE SIDE POLY CTD BOARD",
    "OTHER",
    "PET",
    "PET COATED BOARD",
    "PP",
    "S.KAPPA SOLID BD.",
    "SANDWICH BOARD",
    "SAPPI ALGRO DESIGN",
    "SOLID BLEACHED SULPHATE (SBS)",
    "SUPER WHITE MAPLITHO PAPER",
    "VIRGIN KRAFT",
    "WHITE BACK (WB)",
    "WHITE BACK BLISTER",
    "WHITE KRAFT PAPER"
  ],
  plant: [
    "1100 - DAMAN",
    "1200 - CHAKAN",
    "1400 - PANTNAGAR I",
    "1500 - PANTNAGAR II",
    "1600 - SRICITY",
    "1700 - GUWAHATI",
    "1800 - GOA",
    "1900 - RAJPURA",
    "2000 - BADDI",
    "TZ00 - TANZANIA"
  ],
  punching: [
    "Front Side",
    "Reverse Side"
  ]
}

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
        toast({
          title: "Success",
          description: `${projectType} form submitted successfully!`,
          variant: "default",
        })

        if (onSubmit) {
          onSubmit(formData)
        }

        onClose()
      } else {
        toast({
          title: "Error",
          description: `Failed to submit ${projectType} form: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error submitting ${projectType} form:`, error)
      toast({
        title: "Error",
        description: `Failed to submit ${projectType} form. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden">
      <form onSubmit={handleSubmit} className="space-y-4 overflow-hidden">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#005180]">Project Briefing - {projectType}</h2>
            <p className="text-sm text-gray-500 mt-1">DOC NO: FO/MKT-15</p>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#005180]">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Job Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#005180]">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cartonStyle" className="text-sm font-medium">
                  Carton Style
                </Label>
                <Select
                  value={formData.cartonStyle}
                  onValueChange={(value) => handleChange("cartonStyle", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select carton style" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.cartonStyle.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pkdReqd" className="text-sm font-medium">
                  PKD Reqd?
                </Label>
                <Select
                  value={formData.pkdReqd}
                  onValueChange={(value) => handleChange("pkdReqd", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select Yes/No" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.yesNo.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#005180]">Carton Specification</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-6">
            {/* Board Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide border-b pb-2">Board</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Select
                    value={formData.boardType}
                    onValueChange={(value) => handleChange("boardType", value)}
                  >
                    <SelectTrigger className="mt-1.5 truncate">
                      <SelectValue placeholder="Select board type" className="truncate" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {DROPDOWN_OPTIONS.boardType.map((option) => (
                        <SelectItem key={option} value={option} className="truncate">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="boardMill" className="text-sm font-medium">
                    MILL
                  </Label>
                  <Select
                    value={formData.boardMill}
                    onValueChange={(value) => handleChange("boardMill", value)}
                  >
                    <SelectTrigger className="mt-1.5 truncate">
                      <SelectValue placeholder="Select mill" className="truncate" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {DROPDOWN_OPTIONS.boardMill.map((option) => (
                        <SelectItem key={option} value={option} className="truncate">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="boardBrand" className="text-sm font-medium">
                    Board Brand
                  </Label>
                  <Select
                    value={formData.boardBrand}
                    onValueChange={(value) => handleChange("boardBrand", value)}
                  >
                    <SelectTrigger className="mt-1.5 truncate">
                      <SelectValue placeholder="Select board brand" className="truncate" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {DROPDOWN_OPTIONS.boardBrand.map((option) => (
                        <SelectItem key={option} value={option} className="truncate">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Board Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide border-b pb-2">Board Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="boardNominated" className="text-sm font-medium">
                  Board Nominated?
                </Label>
                <Select
                  value={formData.boardNominated}
                  onValueChange={(value) => handleChange("boardNominated", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select Yes/No" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
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
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select Yes/No" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
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
                <Select
                  value={formData.flutingType}
                  onValueChange={(value) => handleChange("flutingType", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select fluting type" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.flutingType.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
            </div>

            <Separator />

            {/* Kraft Paper Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide border-b pb-2">Kraft Paper (Fluting Details)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide border-b pb-2">Kraft Liner Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#005180]">Pre-Printing Requirements</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#005180]">Post Printing Requirements</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frontSideVarnish" className="text-sm font-medium">
                  Front Side Varnish
                </Label>
                <Select
                  value={formData.frontSideVarnish}
                  onValueChange={(value) => handleChange("frontSideVarnish", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select varnish" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.varnish.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="backSideVarnish" className="text-sm font-medium">
                  Back Side Varnish
                </Label>
                <Select
                  value={formData.backSideVarnish}
                  onValueChange={(value) => handleChange("backSideVarnish", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select varnish" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.varnish.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="postPrintingLamination" className="text-sm font-medium">
                  Post Printing Lamination
                </Label>
                <Select
                  value={formData.postPrintingLamination}
                  onValueChange={(value) => handleChange("postPrintingLamination", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select lamination" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.postPrintLamination.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gravurePrinting" className="text-sm font-medium">
                  Gravure Printing
                </Label>
                <Select
                  value={formData.gravurePrinting}
                  onValueChange={(value) => handleChange("gravurePrinting", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select Yes/No" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.yesNo.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hotFoilStamping" className="text-sm font-medium">
                  HOT Foil Stamping
                </Label>
                <Select
                  value={formData.hotFoilStamping}
                  onValueChange={(value) => handleChange("hotFoilStamping", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select Yes/No" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.yesNo.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coldFoil" className="text-sm font-medium">
                  COLD Foil
                </Label>
                <Select
                  value={formData.coldFoil}
                  onValueChange={(value) => handleChange("coldFoil", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select Yes/No" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.yesNo.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="embossing" className="text-sm font-medium">
                  Embossing
                </Label>
                <Select
                  value={formData.embossing}
                  onValueChange={(value) => handleChange("embossing", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select embossing type" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.embossingType.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="windowPasting" className="text-sm font-medium">
                  Window Pasting (Film Type)
                </Label>
                <Select
                  value={formData.windowPasting}
                  onValueChange={(value) => handleChange("windowPasting", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select film type" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.windowPastingFilm.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="linerPasting" className="text-sm font-medium">
                  Liner Pasting
                </Label>
                <Select
                  value={formData.linerPasting}
                  onValueChange={(value) => handleChange("linerPasting", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select Yes/No" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.yesNo.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="screenPrinting" className="text-sm font-medium">
                  Screen Printing
                </Label>
                <Select
                  value={formData.screenPrinting}
                  onValueChange={(value) => handleChange("screenPrinting", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select screen printing" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.screenPrinting.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  Variable Data Printing
                </Label>
                <Select
                  value={formData.variableDataPrinting}
                  onValueChange={(value) => handleChange("variableDataPrinting", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select variable data printing" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.variableDataPrinting.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cartonPasting" className="text-sm font-medium">
                  Carton Pasting
                </Label>
                <Select
                  value={formData.cartonPasting}
                  onValueChange={(value) => handleChange("cartonPasting", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select carton pasting" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.cartonPasting.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="securityFeatures" className="text-sm font-medium">
                  Security Features
                </Label>
                <Select
                  value={formData.securityFeatures}
                  onValueChange={(value) => handleChange("securityFeatures", value)}
                >
                  <SelectTrigger className="mt-1.5 truncate">
                    <SelectValue placeholder="Select security features" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {DROPDOWN_OPTIONS.securityFeatures.map((option) => (
                      <SelectItem key={option} value={option} className="truncate">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#005180]">Special Instructions</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div>
              <Label htmlFor="specialInstructions" className="text-sm font-medium">
                Additional Notes
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

        {/* Footer Actions - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-6 flex justify-end gap-3 shadow-lg">
          <Button type="button" variant="outline" onClick={onClose} className="min-w-[120px]">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] bg-[#005180] hover:bg-[#003d5c]"
          >
            {isSubmitting ? "Submitting..." : `Submit ${projectType}`}
          </Button>
        </div>
      </form>
    </div>
  )
}
