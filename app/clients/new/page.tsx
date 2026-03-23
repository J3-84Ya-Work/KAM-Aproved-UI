"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { clientLogger } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft, ArrowRight, Building2, Truck, FileText, CheckCircle,
  Users, Plus, Search, Trash2, ChevronDown, ChevronUp,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────

interface BuyerGroupData {
  customerCode: string; name1: string; name2: string; searchTerm: string
  street: string; houseNo: string; postalCode: string; city: string
  country: string; region: string; telephone: string; faxNo: string
  emailId: string; transportationZone: string; contactPerson: string
  customerClassification: string; industry: string
  distributionChannel: string; division: string
}

interface SoldToPartyData {
  customerCode: string; name1: string; name2: string; searchTerm: string
  street: string; houseNo: string; postalCode: string; city: string
  country: string; region: string; telephone: string; faxNo: string
  emailId: string; transportationZone: string; contactPerson: string
  customerClassification: string; industry: string; vatTinRegNumber: string
  overDeliveryToleranceLimit: string; salesEmployee: string; currency: string
  orderCombination: string; incoterms: string; incotermsPlace: string
  paymentTerms: string; eccNo: string; exciseRegistrationNo: string
  exciseRange: string; exciseDivision: string; commissionRate: string
  exciseTaxIndicator: string; lstNo: string; cstNo: string
  serviceTaxRegNo: string; gst: string
}

interface ShipToPartyData {
  customerCode: string; name1: string; name2: string; searchTerm: string
  street: string; houseNo: string; postalCode: string; city: string
  country: string; region: string; telephone: string; faxNo: string
  emailId: string; transportationZone: string; contactPerson: string
  vatTinRegNumber: string; overDeliveryToleranceLimit: string
  eccNo: string; exciseRegistrationNo: string; exciseRange: string
  exciseDivision: string; commissionRate: string; exciseTaxIndicator: string
  lstNo: string; cstNo: string; serviceTaxRegNo: string; pan: string
}

// ── Defaults ──────────────────────────────────────────────────────────

const emptyBuyerGroup: BuyerGroupData = {
  customerCode: "", name1: "", name2: "", searchTerm: "", street: "", houseNo: "",
  postalCode: "", city: "", country: "India", region: "", telephone: "", faxNo: "",
  emailId: "", transportationZone: "", contactPerson: "", customerClassification: "",
  industry: "", distributionChannel: "10 - Domestic Sales", division: "10 - Board Cartons",
}

const emptySoldToParty: SoldToPartyData = {
  customerCode: "", name1: "", name2: "", searchTerm: "", street: "", houseNo: "",
  postalCode: "", city: "", country: "India", region: "", telephone: "", faxNo: "",
  emailId: "", transportationZone: "", contactPerson: "", customerClassification: "",
  industry: "", vatTinRegNumber: "", overDeliveryToleranceLimit: "", salesEmployee: "",
  currency: "INR", orderCombination: "N", incoterms: "", incotermsPlace: "",
  paymentTerms: "", eccNo: "", exciseRegistrationNo: "", exciseRange: "",
  exciseDivision: "", commissionRate: "", exciseTaxIndicator: "", lstNo: "",
  cstNo: "", serviceTaxRegNo: "", gst: "",
}

const emptyShipToParty: ShipToPartyData = {
  customerCode: "", name1: "", name2: "", searchTerm: "", street: "", houseNo: "",
  postalCode: "", city: "", country: "India", region: "", telephone: "", faxNo: "",
  emailId: "", transportationZone: "", contactPerson: "", vatTinRegNumber: "",
  overDeliveryToleranceLimit: "", eccNo: "", exciseRegistrationNo: "",
  exciseRange: "", exciseDivision: "", commissionRate: "", exciseTaxIndicator: "",
  lstNo: "", cstNo: "", serviceTaxRegNo: "", pan: "",
}

const existingBuyerGroups = [
  { id: "BG001", name: "Hindustan Unilever Ltd" },
  { id: "BG002", name: "Godrej Consumer Products" },
  { id: "BG003", name: "ITC Limited" },
  { id: "BG004", name: "Dabur India Ltd" },
  { id: "BG005", name: "Marico Limited" },
]

// ── Reusable Field Components ─────────────────────────────────────────

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <Label className="text-xs font-medium text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  )
}

function FormInput({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-9 text-sm border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
    />
  )
}

// ── Review Field ──────────────────────────────────────────────────────

function ReviewRow({ items }: { items: [string, string][] }) {
  const filtered = items.filter(([, v]) => v)
  if (!filtered.length) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
      {filtered.map(([label, value]) => (
        <div key={label}>
          <span className="text-gray-500">{label}:</span>{" "}
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function NewCustomerPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [buyerGroupType, setBuyerGroupType] = useState<"new" | "existing" | "">("")
  const [selectedBuyerGroup, setSelectedBuyerGroup] = useState("")
  const [buyerGroupSearch, setBuyerGroupSearch] = useState("")
  const [buyerGroup, setBuyerGroup] = useState<BuyerGroupData>({ ...emptyBuyerGroup })
  const [soldToParty, setSoldToParty] = useState<SoldToPartyData>({ ...emptySoldToParty })
  const [shipToParties, setShipToParties] = useState<ShipToPartyData[]>([{ ...emptyShipToParty }])
  const [expandedShipTo, setExpandedShipTo] = useState<number>(0)
  const [copyFromSoldTo, setCopyFromSoldTo] = useState(true)

  // ── Handlers ──────────────────────────────────────────────────────

  const handleCopyToShip = () => {
    const copied: ShipToPartyData = {
      customerCode: "", name1: soldToParty.name1, name2: soldToParty.name2,
      searchTerm: soldToParty.searchTerm, street: soldToParty.street,
      houseNo: soldToParty.houseNo, postalCode: soldToParty.postalCode,
      city: soldToParty.city, country: soldToParty.country,
      region: soldToParty.region, telephone: soldToParty.telephone,
      faxNo: soldToParty.faxNo, emailId: soldToParty.emailId,
      transportationZone: soldToParty.transportationZone,
      contactPerson: soldToParty.contactPerson,
      vatTinRegNumber: soldToParty.vatTinRegNumber,
      overDeliveryToleranceLimit: soldToParty.overDeliveryToleranceLimit,
      eccNo: soldToParty.eccNo, exciseRegistrationNo: soldToParty.exciseRegistrationNo,
      exciseRange: soldToParty.exciseRange, exciseDivision: soldToParty.exciseDivision,
      commissionRate: soldToParty.commissionRate,
      exciseTaxIndicator: soldToParty.exciseTaxIndicator,
      lstNo: soldToParty.lstNo, cstNo: soldToParty.cstNo,
      serviceTaxRegNo: soldToParty.serviceTaxRegNo, pan: "",
    }
    setShipToParties(prev => { const u = [...prev]; u[0] = copied; return u })
  }

  const updateShipToParty = (index: number, field: keyof ShipToPartyData, value: string) => {
    setShipToParties(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u })
  }

  const addShipToParty = () => {
    setShipToParties(prev => [...prev, { ...emptyShipToParty }])
    setExpandedShipTo(shipToParties.length)
  }

  const removeShipToParty = (index: number) => {
    if (shipToParties.length <= 1) return
    setShipToParties(prev => prev.filter((_, i) => i !== index))
    setExpandedShipTo(prev => prev >= index ? Math.max(0, prev - 1) : prev)
  }

  const handleSubmit = () => {
    const payload = {
      buyerGroupType,
      buyerGroupId: buyerGroupType === "existing" ? selectedBuyerGroup : null,
      buyerGroup: buyerGroupType === "new" ? buyerGroup : null,
      soldToParty,
      shipToParties,
    }
    clientLogger.log("New Customer Submission:", payload)
    toast({ title: "Customer Submitted", description: "Customer master request has been submitted for approval." })
    router.push("/clients")
  }

  // ── Validation ────────────────────────────────────────────────────

  const canProceedStep1 = buyerGroupType === "existing"
    ? !!selectedBuyerGroup
    : (buyerGroupType === "new" && !!buyerGroup.name1 && !!buyerGroup.searchTerm && !!buyerGroup.houseNo && !!buyerGroup.postalCode && !!buyerGroup.city && !!buyerGroup.country)

  const canProceedStep2 = !!soldToParty.name1 && !!soldToParty.searchTerm && !!soldToParty.houseNo
    && !!soldToParty.postalCode && !!soldToParty.city && !!soldToParty.country
    && !!soldToParty.vatTinRegNumber && !!soldToParty.salesEmployee && !!soldToParty.currency
    && !!soldToParty.paymentTerms && !!soldToParty.eccNo && !!soldToParty.exciseRegistrationNo
    && !!soldToParty.exciseRange && !!soldToParty.exciseDivision && !!soldToParty.commissionRate
    && !!soldToParty.exciseTaxIndicator && !!soldToParty.lstNo && !!soldToParty.cstNo
    && !!soldToParty.serviceTaxRegNo && !!soldToParty.gst

  const canProceedStep3 = shipToParties.length > 0
    && shipToParties.every(sp => !!sp.name1 && !!sp.searchTerm && !!sp.city && !!sp.country && !!sp.vatTinRegNumber && !!sp.exciseTaxIndicator)

  const canProceed = step === 1 ? canProceedStep1 : step === 2 ? canProceedStep2 : step === 3 ? canProceedStep3 : true

  const filteredBuyerGroups = existingBuyerGroups.filter(bg =>
    bg.name.toLowerCase().includes(buyerGroupSearch.toLowerCase())
  )

  // ── Step Config ───────────────────────────────────────────────────

  const steps = [
    { num: 1, label: "Buyer Group", icon: Building2 },
    { num: 2, label: "Sold To Party", icon: Users },
    { num: 3, label: "Ship To / Bill To", icon: Truck },
    { num: 4, label: "Review", icon: FileText },
  ]

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="New Customer Master" showBackButton onBackClick={() => router.push("/clients")} />
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-5 space-y-5">

            {/* ── Step Progress Bar ──────────────────────────────── */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-[#005180] to-[#005180]/90 px-6 py-4">
                <div className="flex items-center justify-between">
                  {steps.map((s, i) => {
                    const isActive = step === s.num
                    const isCompleted = step > s.num
                    const Icon = s.icon
                    return (
                      <div key={s.num} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            isActive ? "bg-white text-[#005180] shadow-lg" :
                            isCompleted ? "bg-[#78BE20] text-white" :
                            "bg-white/20 text-white/50"
                          }`}>
                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <span className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
                            isActive ? "text-white" : isCompleted ? "text-[#78BE20]" : "text-white/40"
                          }`}>{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 -mt-4 sm:-mt-6 ${
                            step > s.num ? "bg-[#78BE20]" : "bg-white/20"
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* ── STEP 1: Buyer Group ──────────────────────────── */}
            {step === 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-[#005180] flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Select Buyer Group
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    A Buyer Group represents the parent entity (e.g., Unilever). Multiple Sold To Parties can exist under one Buyer Group.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Selection cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => { setBuyerGroupType("new"); setSelectedBuyerGroup("") }}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        buyerGroupType === "new"
                          ? "border-[#005180] bg-[#005180]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          buyerGroupType === "new" ? "bg-[#005180] text-white" : "bg-gray-100 text-gray-400"
                        }`}><Plus className="h-5 w-5" /></div>
                        <div>
                          <p className="font-semibold text-sm">New Buyer Group</p>
                          <p className="text-xs text-gray-500">Create a new parent entity</p>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => { setBuyerGroupType("existing"); setBuyerGroup({ ...emptyBuyerGroup }) }}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        buyerGroupType === "existing"
                          ? "border-[#005180] bg-[#005180]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          buyerGroupType === "existing" ? "bg-[#005180] text-white" : "bg-gray-100 text-gray-400"
                        }`}><Search className="h-5 w-5" /></div>
                        <div>
                          <p className="font-semibold text-sm">Existing Buyer Group</p>
                          <p className="text-xs text-gray-500">Add party under existing group</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Buyer Group form */}
                  {buyerGroupType === "new" && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[#005180]">General Data</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[10px]">{buyerGroup.distributionChannel}</Badge>
                          <Badge variant="outline" className="text-[10px]">{buyerGroup.division}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Distribution Channel">
                          <Select value={buyerGroup.distributionChannel} onValueChange={v => setBuyerGroup({ ...buyerGroup, distributionChannel: v })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10 - Domestic Sales">10 - Domestic Sales</SelectItem>
                              <SelectItem value="20 - Export Sales">20 - Export Sales</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>
                        <FormField label="Division">
                          <Select value={buyerGroup.division} onValueChange={v => setBuyerGroup({ ...buyerGroup, division: v })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10 - Board Cartons">10 - Board Cartons</SelectItem>
                              <SelectItem value="20 - Flexible Packaging">20 - Flexible Packaging</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Name 1 (Customer Name)" required>
                          <FormInput value={buyerGroup.name1} onChange={v => setBuyerGroup({ ...buyerGroup, name1: v })} placeholder="Customer Name" />
                        </FormField>
                        <FormField label="Name 2">
                          <FormInput value={buyerGroup.name2} onChange={v => setBuyerGroup({ ...buyerGroup, name2: v })} placeholder="Optional" />
                        </FormField>
                        <FormField label="Search Term" required>
                          <FormInput value={buyerGroup.searchTerm} onChange={v => setBuyerGroup({ ...buyerGroup, searchTerm: v })} placeholder="Short name" />
                        </FormField>
                        <FormField label="Customer Code">
                          <FormInput value={buyerGroup.customerCode} onChange={() => {}} placeholder="Auto-generated" disabled />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Street">
                          <FormInput value={buyerGroup.street} onChange={v => setBuyerGroup({ ...buyerGroup, street: v })} placeholder="Street address" />
                        </FormField>
                        <FormField label="House No" required>
                          <FormInput value={buyerGroup.houseNo} onChange={v => setBuyerGroup({ ...buyerGroup, houseNo: v })} placeholder="House/Building No" />
                        </FormField>
                        <FormField label="Postal Code" required>
                          <FormInput value={buyerGroup.postalCode} onChange={v => setBuyerGroup({ ...buyerGroup, postalCode: v })} placeholder="PIN Code" />
                        </FormField>
                        <FormField label="City" required>
                          <FormInput value={buyerGroup.city} onChange={v => setBuyerGroup({ ...buyerGroup, city: v })} placeholder="City" />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Country" required>
                          <FormInput value={buyerGroup.country} onChange={v => setBuyerGroup({ ...buyerGroup, country: v })} placeholder="India" />
                        </FormField>
                        <FormField label="Region">
                          <FormInput value={buyerGroup.region} onChange={v => setBuyerGroup({ ...buyerGroup, region: v })} placeholder="State/Region" />
                        </FormField>
                        <FormField label="Telephone">
                          <FormInput value={buyerGroup.telephone} onChange={v => setBuyerGroup({ ...buyerGroup, telephone: v })} placeholder="Phone number" />
                        </FormField>
                        <FormField label="Fax No">
                          <FormInput value={buyerGroup.faxNo} onChange={v => setBuyerGroup({ ...buyerGroup, faxNo: v })} placeholder="Fax number" />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Email-Id">
                          <FormInput value={buyerGroup.emailId} onChange={v => setBuyerGroup({ ...buyerGroup, emailId: v })} placeholder="email@company.com" />
                        </FormField>
                        <FormField label="Transportation Zone">
                          <FormInput value={buyerGroup.transportationZone} onChange={v => setBuyerGroup({ ...buyerGroup, transportationZone: v })} placeholder="Zone" />
                        </FormField>
                        <FormField label="Contact Person">
                          <FormInput value={buyerGroup.contactPerson} onChange={v => setBuyerGroup({ ...buyerGroup, contactPerson: v })} placeholder="Contact person" />
                        </FormField>
                        <FormField label="Customer Classification">
                          <FormInput value={buyerGroup.customerClassification} onChange={v => setBuyerGroup({ ...buyerGroup, customerClassification: v })} placeholder="Classification" />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField label="Industry">
                          <FormInput value={buyerGroup.industry} onChange={v => setBuyerGroup({ ...buyerGroup, industry: v })} placeholder="Industry" />
                        </FormField>
                      </div>
                    </div>
                  )}

                  {/* Existing Buyer Group list */}
                  {buyerGroupType === "existing" && (
                    <div className="space-y-3 pt-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input value={buyerGroupSearch} onChange={e => setBuyerGroupSearch(e.target.value)} placeholder="Search buyer groups..." className="h-10 pl-10 text-sm" />
                      </div>
                      <div className="max-h-[280px] overflow-y-auto border rounded-lg divide-y">
                        {filteredBuyerGroups.map(bg => (
                          <div
                            key={bg.id}
                            onClick={() => setSelectedBuyerGroup(bg.id)}
                            className={`p-3 cursor-pointer transition-all flex items-center justify-between ${
                              selectedBuyerGroup === bg.id ? "bg-[#005180]/5 border-l-4 border-l-[#005180]" : "hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <p className="font-medium text-sm">{bg.name}</p>
                              <p className="text-xs text-gray-500">{bg.id}</p>
                            </div>
                            {selectedBuyerGroup === bg.id && <CheckCircle className="h-5 w-5 text-[#005180]" />}
                          </div>
                        ))}
                        {filteredBuyerGroups.length === 0 && (
                          <div className="p-6 text-center text-sm text-gray-400">No buyer groups found</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── STEP 2: Sold To Party ────────────────────────── */}
            {step === 2 && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-[#005180] flex items-center gap-2">
                      <Users className="h-5 w-5" /> Sold To Party -- General Data
                    </CardTitle>
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2">
                      <strong>Note:</strong> Sold To Party can be one entity, or it can also serve as Ship To Party / Bill To Party / Payer.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Name 1 (Customer Name)" required>
                        <FormInput value={soldToParty.name1} onChange={v => setSoldToParty({ ...soldToParty, name1: v })} placeholder="Customer Name" />
                      </FormField>
                      <FormField label="Name 2">
                        <FormInput value={soldToParty.name2} onChange={v => setSoldToParty({ ...soldToParty, name2: v })} placeholder="Optional" />
                      </FormField>
                      <FormField label="Search Term" required>
                        <FormInput value={soldToParty.searchTerm} onChange={v => setSoldToParty({ ...soldToParty, searchTerm: v })} placeholder="Short name" />
                      </FormField>
                      <FormField label="Customer Code">
                        <FormInput value={soldToParty.customerCode} onChange={() => {}} placeholder="Auto-generated" disabled />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Street">
                        <FormInput value={soldToParty.street} onChange={v => setSoldToParty({ ...soldToParty, street: v })} placeholder="Street address" />
                      </FormField>
                      <FormField label="House No" required>
                        <FormInput value={soldToParty.houseNo} onChange={v => setSoldToParty({ ...soldToParty, houseNo: v })} placeholder="House/Building No" />
                      </FormField>
                      <FormField label="Postal Code" required>
                        <FormInput value={soldToParty.postalCode} onChange={v => setSoldToParty({ ...soldToParty, postalCode: v })} placeholder="PIN Code" />
                      </FormField>
                      <FormField label="City" required>
                        <FormInput value={soldToParty.city} onChange={v => setSoldToParty({ ...soldToParty, city: v })} placeholder="City" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Country" required>
                        <FormInput value={soldToParty.country} onChange={v => setSoldToParty({ ...soldToParty, country: v })} placeholder="India" />
                      </FormField>
                      <FormField label="Region">
                        <FormInput value={soldToParty.region} onChange={v => setSoldToParty({ ...soldToParty, region: v })} placeholder="State/Region" />
                      </FormField>
                      <FormField label="Telephone">
                        <FormInput value={soldToParty.telephone} onChange={v => setSoldToParty({ ...soldToParty, telephone: v })} placeholder="Phone number" />
                      </FormField>
                      <FormField label="Fax No">
                        <FormInput value={soldToParty.faxNo} onChange={v => setSoldToParty({ ...soldToParty, faxNo: v })} placeholder="Fax number" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Email-Id">
                        <FormInput value={soldToParty.emailId} onChange={v => setSoldToParty({ ...soldToParty, emailId: v })} placeholder="email@company.com" />
                      </FormField>
                      <FormField label="Transportation Zone">
                        <FormInput value={soldToParty.transportationZone} onChange={v => setSoldToParty({ ...soldToParty, transportationZone: v })} placeholder="Zone" />
                      </FormField>
                      <FormField label="Contact Person">
                        <FormInput value={soldToParty.contactPerson} onChange={v => setSoldToParty({ ...soldToParty, contactPerson: v })} placeholder="Contact person" />
                      </FormField>
                      <FormField label="Customer Classification">
                        <FormInput value={soldToParty.customerClassification} onChange={v => setSoldToParty({ ...soldToParty, customerClassification: v })} placeholder="Classification" />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-[#78BE20] uppercase tracking-wider">Sales & Commercial Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="VAT (TIN) Reg. Number" required>
                        <FormInput value={soldToParty.vatTinRegNumber} onChange={v => setSoldToParty({ ...soldToParty, vatTinRegNumber: v })} placeholder="TIN Number" />
                      </FormField>
                      <FormField label="Industry">
                        <FormInput value={soldToParty.industry} onChange={v => setSoldToParty({ ...soldToParty, industry: v })} placeholder="Industry" />
                      </FormField>
                      <FormField label="Over Delivery Tolerance Limit">
                        <FormInput value={soldToParty.overDeliveryToleranceLimit} onChange={v => setSoldToParty({ ...soldToParty, overDeliveryToleranceLimit: v })} placeholder="Tolerance %" />
                      </FormField>
                      <FormField label="Sales Employee" required>
                        <FormInput value={soldToParty.salesEmployee} onChange={v => setSoldToParty({ ...soldToParty, salesEmployee: v })} placeholder="Sales employee" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Currency" required>
                        <Select value={soldToParty.currency} onValueChange={v => setSoldToParty({ ...soldToParty, currency: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Order Combination">
                        <Select value={soldToParty.orderCombination} onValueChange={v => setSoldToParty({ ...soldToParty, orderCombination: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Yes</SelectItem>
                            <SelectItem value="N">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Incoterms">
                        <FormInput value={soldToParty.incoterms} onChange={v => setSoldToParty({ ...soldToParty, incoterms: v })} placeholder="e.g., FOB, CIF" />
                      </FormField>
                      <FormField label="Incoterms Place">
                        <FormInput value={soldToParty.incotermsPlace} onChange={v => setSoldToParty({ ...soldToParty, incotermsPlace: v })} placeholder="Place" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Payment Terms" required>
                        <FormInput value={soldToParty.paymentTerms} onChange={v => setSoldToParty({ ...soldToParty, paymentTerms: v })} placeholder="e.g., 30 days" />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-[#B92221] uppercase tracking-wider">CIN / Tax Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="ECC No" required>
                        <FormInput value={soldToParty.eccNo} onChange={v => setSoldToParty({ ...soldToParty, eccNo: v })} placeholder="ECC Number" />
                      </FormField>
                      <FormField label="Excise Registration No" required>
                        <FormInput value={soldToParty.exciseRegistrationNo} onChange={v => setSoldToParty({ ...soldToParty, exciseRegistrationNo: v })} placeholder="Excise Reg. No" />
                      </FormField>
                      <FormField label="Excise Range" required>
                        <FormInput value={soldToParty.exciseRange} onChange={v => setSoldToParty({ ...soldToParty, exciseRange: v })} placeholder="Range" />
                      </FormField>
                      <FormField label="Excise Division" required>
                        <FormInput value={soldToParty.exciseDivision} onChange={v => setSoldToParty({ ...soldToParty, exciseDivision: v })} placeholder="Division" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Commission Rate" required>
                        <FormInput value={soldToParty.commissionRate} onChange={v => setSoldToParty({ ...soldToParty, commissionRate: v })} placeholder="Rate" />
                      </FormField>
                      <FormField label="Excise Tax Indicator" required>
                        <FormInput value={soldToParty.exciseTaxIndicator} onChange={v => setSoldToParty({ ...soldToParty, exciseTaxIndicator: v })} placeholder="Indicator" />
                      </FormField>
                      <FormField label="LST No" required>
                        <FormInput value={soldToParty.lstNo} onChange={v => setSoldToParty({ ...soldToParty, lstNo: v })} placeholder="LST Number" />
                      </FormField>
                      <FormField label="CST No" required>
                        <FormInput value={soldToParty.cstNo} onChange={v => setSoldToParty({ ...soldToParty, cstNo: v })} placeholder="CST Number" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Service Tax Reg. No" required>
                        <FormInput value={soldToParty.serviceTaxRegNo} onChange={v => setSoldToParty({ ...soldToParty, serviceTaxRegNo: v })} placeholder="Service Tax Reg. No" />
                      </FormField>
                      <FormField label="GST" required>
                        <FormInput value={soldToParty.gst} onChange={v => setSoldToParty({ ...soldToParty, gst: v })} placeholder="27AABCU9603R1ZM" />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── STEP 3: Ship To Party ────────────────────────── */}
            {step === 3 && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-[#005180] flex items-center gap-2">
                      <Truck className="h-5 w-5" /> Ship To Party / Bill To Party / Payer
                    </CardTitle>
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2">
                      <strong>Note:</strong> You can add multiple Ship To Parties for one Sold To Party. Click "+ Add Ship To Party" below.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Switch checked={copyFromSoldTo} onCheckedChange={checked => { setCopyFromSoldTo(checked); if (checked) handleCopyToShip() }} />
                      <div>
                        <p className="text-sm font-medium">Copy from Sold To Party</p>
                        <p className="text-xs text-gray-500">Use Sold To Party details for the first Ship To Party</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {shipToParties.map((sp, idx) => {
                  const isExpanded = expandedShipTo === idx
                  return (
                    <Card key={idx} className="overflow-hidden">
                      <div
                        className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedShipTo(isExpanded ? -1 : idx)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#78BE20] text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                          <div>
                            <span className="text-sm font-semibold text-gray-800">Ship To Party #{idx + 1}</span>
                            {sp.name1 && <span className="text-xs text-gray-500 ml-2">- {sp.name1}{sp.city ? `, ${sp.city}` : ""}</span>}
                          </div>
                          {!isExpanded && sp.name1 && sp.city && sp.country && sp.vatTinRegNumber && (
                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Complete</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {shipToParties.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); removeShipToParty(idx) }} className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <CardContent className="pt-0 space-y-4 border-t">
                          <h4 className="text-xs font-semibold text-[#005180] uppercase tracking-wider pt-4">General Data</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Name 1 (Customer Name)" required>
                              <FormInput value={sp.name1} onChange={v => updateShipToParty(idx, "name1", v)} placeholder="Customer Name" />
                            </FormField>
                            <FormField label="Name 2">
                              <FormInput value={sp.name2} onChange={v => updateShipToParty(idx, "name2", v)} placeholder="Optional" />
                            </FormField>
                            <FormField label="Search Term" required>
                              <FormInput value={sp.searchTerm} onChange={v => updateShipToParty(idx, "searchTerm", v)} placeholder="Short name" />
                            </FormField>
                            <FormField label="Customer Code">
                              <FormInput value={sp.customerCode} onChange={() => {}} placeholder="Auto-generated" disabled />
                            </FormField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Street">
                              <FormInput value={sp.street} onChange={v => updateShipToParty(idx, "street", v)} placeholder="Street address" />
                            </FormField>
                            <FormField label="House No">
                              <FormInput value={sp.houseNo} onChange={v => updateShipToParty(idx, "houseNo", v)} placeholder="House/Building No" />
                            </FormField>
                            <FormField label="Postal Code">
                              <FormInput value={sp.postalCode} onChange={v => updateShipToParty(idx, "postalCode", v)} placeholder="PIN Code" />
                            </FormField>
                            <FormField label="City" required>
                              <FormInput value={sp.city} onChange={v => updateShipToParty(idx, "city", v)} placeholder="City" />
                            </FormField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Country" required>
                              <FormInput value={sp.country} onChange={v => updateShipToParty(idx, "country", v)} placeholder="India" />
                            </FormField>
                            <FormField label="Region">
                              <FormInput value={sp.region} onChange={v => updateShipToParty(idx, "region", v)} placeholder="State/Region" />
                            </FormField>
                            <FormField label="Telephone">
                              <FormInput value={sp.telephone} onChange={v => updateShipToParty(idx, "telephone", v)} placeholder="Phone number" />
                            </FormField>
                            <FormField label="Fax No">
                              <FormInput value={sp.faxNo} onChange={v => updateShipToParty(idx, "faxNo", v)} placeholder="Fax number" />
                            </FormField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Email-Id">
                              <FormInput value={sp.emailId} onChange={v => updateShipToParty(idx, "emailId", v)} placeholder="email@company.com" />
                            </FormField>
                            <FormField label="Transportation Zone">
                              <FormInput value={sp.transportationZone} onChange={v => updateShipToParty(idx, "transportationZone", v)} placeholder="Zone" />
                            </FormField>
                            <FormField label="Contact Person">
                              <FormInput value={sp.contactPerson} onChange={v => updateShipToParty(idx, "contactPerson", v)} placeholder="Contact person" />
                            </FormField>
                            <FormField label="VAT (TIN) Reg. Number" required>
                              <FormInput value={sp.vatTinRegNumber} onChange={v => updateShipToParty(idx, "vatTinRegNumber", v)} placeholder="TIN Number" />
                            </FormField>
                          </div>

                          <h4 className="text-xs font-semibold text-[#B92221] uppercase tracking-wider pt-3 border-t">CIN / Tax Details</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Over Delivery Tolerance Limit">
                              <FormInput value={sp.overDeliveryToleranceLimit} onChange={v => updateShipToParty(idx, "overDeliveryToleranceLimit", v)} placeholder="%" />
                            </FormField>
                            <FormField label="ECC No">
                              <FormInput value={sp.eccNo} onChange={v => updateShipToParty(idx, "eccNo", v)} placeholder="ECC Number" />
                            </FormField>
                            <FormField label="Excise Registration No">
                              <FormInput value={sp.exciseRegistrationNo} onChange={v => updateShipToParty(idx, "exciseRegistrationNo", v)} placeholder="Excise Reg. No" />
                            </FormField>
                            <FormField label="Excise Range">
                              <FormInput value={sp.exciseRange} onChange={v => updateShipToParty(idx, "exciseRange", v)} placeholder="Range" />
                            </FormField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Excise Division">
                              <FormInput value={sp.exciseDivision} onChange={v => updateShipToParty(idx, "exciseDivision", v)} placeholder="Division" />
                            </FormField>
                            <FormField label="Commission Rate">
                              <FormInput value={sp.commissionRate} onChange={v => updateShipToParty(idx, "commissionRate", v)} placeholder="Rate" />
                            </FormField>
                            <FormField label="Excise Tax Indicator" required>
                              <FormInput value={sp.exciseTaxIndicator} onChange={v => updateShipToParty(idx, "exciseTaxIndicator", v)} placeholder="Indicator" />
                            </FormField>
                            <FormField label="LST No">
                              <FormInput value={sp.lstNo} onChange={v => updateShipToParty(idx, "lstNo", v)} placeholder="LST Number" />
                            </FormField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="CST No">
                              <FormInput value={sp.cstNo} onChange={v => updateShipToParty(idx, "cstNo", v)} placeholder="CST Number" />
                            </FormField>
                            <FormField label="Service Tax Reg. No">
                              <FormInput value={sp.serviceTaxRegNo} onChange={v => updateShipToParty(idx, "serviceTaxRegNo", v)} placeholder="Service Tax Reg. No" />
                            </FormField>
                            <FormField label="PAN">
                              <FormInput value={sp.pan} onChange={v => updateShipToParty(idx, "pan", v)} placeholder="AABCU9603R" />
                            </FormField>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}

                <Button variant="outline" onClick={addShipToParty} className="w-full h-11 border-dashed border-2 border-[#78BE20]/40 text-[#78BE20] hover:bg-[#78BE20]/5 hover:border-[#78BE20] gap-2">
                  <Plus className="h-4 w-4" /> Add Ship To Party #{shipToParties.length + 1}
                </Button>
              </>
            )}

            {/* ── STEP 4: Review ───────────────────────────────── */}
            {step === 4 && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-[#005180] flex items-center gap-2">
                      <Building2 className="h-5 w-5" /> Buyer Group
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {buyerGroupType === "new" ? (
                      <ReviewRow items={[
                        ["Name 1", buyerGroup.name1], ["Name 2", buyerGroup.name2],
                        ["Search Term", buyerGroup.searchTerm], ["Street", buyerGroup.street],
                        ["House No", buyerGroup.houseNo], ["Postal Code", buyerGroup.postalCode],
                        ["City", buyerGroup.city], ["Country", buyerGroup.country],
                        ["Region", buyerGroup.region], ["Telephone", buyerGroup.telephone],
                        ["Email", buyerGroup.emailId], ["Distribution Channel", buyerGroup.distributionChannel],
                        ["Division", buyerGroup.division], ["Industry", buyerGroup.industry],
                      ]} />
                    ) : (
                      <p className="text-sm">
                        <span className="text-gray-500">Existing Group:</span>{" "}
                        <span className="font-medium">{existingBuyerGroups.find(bg => bg.id === selectedBuyerGroup)?.name || selectedBuyerGroup}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-[#005180] flex items-center gap-2">
                      <Users className="h-5 w-5" /> Sold To Party
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewRow items={[
                      ["Name 1", soldToParty.name1], ["Name 2", soldToParty.name2],
                      ["Search Term", soldToParty.searchTerm], ["Street", soldToParty.street],
                      ["House No", soldToParty.houseNo], ["Postal Code", soldToParty.postalCode],
                      ["City", soldToParty.city], ["Country", soldToParty.country],
                      ["Region", soldToParty.region], ["Telephone", soldToParty.telephone],
                      ["Email", soldToParty.emailId], ["VAT/TIN", soldToParty.vatTinRegNumber],
                      ["Industry", soldToParty.industry], ["Sales Employee", soldToParty.salesEmployee],
                      ["Currency", soldToParty.currency], ["Payment Terms", soldToParty.paymentTerms],
                      ["ECC No", soldToParty.eccNo], ["Excise Reg. No", soldToParty.exciseRegistrationNo],
                      ["Excise Range", soldToParty.exciseRange], ["Excise Division", soldToParty.exciseDivision],
                      ["Commission Rate", soldToParty.commissionRate], ["LST No", soldToParty.lstNo],
                      ["CST No", soldToParty.cstNo], ["Service Tax Reg. No", soldToParty.serviceTaxRegNo],
                      ["GST", soldToParty.gst],
                    ]} />
                  </CardContent>
                </Card>

                {shipToParties.map((sp, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-[#78BE20] flex items-center gap-2">
                        <Truck className="h-5 w-5" /> Ship To Party {shipToParties.length > 1 ? `#${idx + 1}` : ""}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReviewRow items={[
                        ["Name 1", sp.name1], ["Name 2", sp.name2],
                        ["Search Term", sp.searchTerm], ["Street", sp.street],
                        ["House No", sp.houseNo], ["Postal Code", sp.postalCode],
                        ["City", sp.city], ["Country", sp.country],
                        ["Region", sp.region], ["Telephone", sp.telephone],
                        ["Email", sp.emailId], ["VAT/TIN", sp.vatTinRegNumber],
                        ["Excise Tax Indicator", sp.exciseTaxIndicator],
                        ["ECC No", sp.eccNo], ["Excise Reg. No", sp.exciseRegistrationNo],
                        ["Commission Rate", sp.commissionRate],
                        ["LST No", sp.lstNo], ["CST No", sp.cstNo],
                        ["Service Tax Reg. No", sp.serviceTaxRegNo], ["PAN", sp.pan],
                      ]} />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* ── Footer Navigation ────────────────────────────── */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    {step > 1 && (
                      <Button variant="outline" onClick={() => setStep((step - 1) as any)} className="h-10 gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push("/clients")} className="h-10 px-5">
                      Cancel
                    </Button>
                    {step < 4 ? (
                      <Button
                        onClick={() => { if (step === 2 && copyFromSoldTo) handleCopyToShip(); setStep((step + 1) as any) }}
                        disabled={!canProceed}
                        className="h-10 px-6 gap-2 bg-[#005180] hover:bg-[#004060] text-white"
                      >
                        Next <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} className="h-10 px-8 gap-2 bg-[#78BE20] hover:bg-[#6ba91b] text-white">
                        <CheckCircle className="h-4 w-4" /> Submit for Approval
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
