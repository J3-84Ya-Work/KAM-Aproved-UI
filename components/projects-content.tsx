"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, AlertCircle, Package, FileText, Truck, Eye, FileCheck, Package2, Search, Filter, RefreshCw, Mic } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TruncatedText } from "@/components/truncated-text"

const sdoProjects = [
  {
    id: "SDO-2024-001",
    customer: "Acme Corp",
    job: "Custom Packaging Box",
    quoteId: "QUO-2024-048",
    executionLocation: "Mumbai",
    productionPlant: "Plant A",
    status: "Sample Approved",
    progress: 100,
    createdDate: "2024-01-10",
    approvedDate: "2024-01-14",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    notes: "Customer approved sample with minor color adjustment",
    history: [
      { stage: "Inquiry Received", date: "2024-01-06" },
      { stage: "Sample Initiated", date: "2024-01-08" },
      { stage: "Sample Approved", date: "2024-01-14" },
    ],
  },
  {
    id: "SDO-2024-002",
    customer: "TechStart Inc",
    job: "Printed Labels",
    quoteId: "QUO-2024-047",
    executionLocation: "Pune",
    productionPlant: "Plant B",
    status: "Sales Approval",
    progress: 75,
    createdDate: "2024-01-12",
    approvedDate: null,
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    notes: "Sent for sales approval on 2024-01-15",
    history: [
      { stage: "Inquiry Received", date: "2024-01-09" },
      { stage: "Sample Prepared", date: "2024-01-12" },
      { stage: "Sales Approval", date: "2024-01-15" },
    ],
  },
  {
    id: "SDO-2024-003",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    quoteId: "QUO-2024-045",
    executionLocation: "Navi Mumbai",
    productionPlant: "Plant C",
    status: "Clarification",
    progress: 50,
    createdDate: "2024-01-14",
    approvedDate: null,
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    notes: "Awaiting clarification on material finish",
    history: [
      { stage: "Inquiry Received", date: "2024-01-11" },
      { stage: "Clarification Requested", date: "2024-01-14" },
    ],
  },
  {
    id: "SDO-2024-004",
    customer: "Prime Packaging",
    job: "Rigid Box",
    quoteId: "QUO-2024-050",
    executionLocation: "Delhi",
    productionPlant: "Plant D",
    status: "In PDD",
    progress: 40,
    createdDate: "2024-01-16",
    approvedDate: null,
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    notes: "Prototype build in progress",
    history: [
      { stage: "Inquiry Received", date: "2024-01-12" },
      { stage: "Sample Fabrication", date: "2024-01-16" },
    ],
  },
]

const jdoProjects = [
  {
    id: "JDO-2024-001",
    customer: "Acme Corp",
    job: "Custom Packaging Box",
    sdoId: "SDO-2024-001",
    prePressPlant: "Prepress Hub 1",
    productionPlant: "Plant A",
    artworkStatus: "Approved",
    bomStatus: "Complete",
    routingStatus: "Complete",
    progress: 100,
    createdDate: "2024-01-15",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    notes: "Ready for commercial PO",
    mfReleased: true,
  },
  {
    id: "JDO-2024-002",
    customer: "Swift Logistics",
    job: "Corrugated Sheets",
    sdoId: "SDO-2024-004",
    prePressPlant: "Prepress Hub 2",
    productionPlant: "Plant C",
    artworkStatus: "In Review",
    bomStatus: "Complete",
    routingStatus: "Pending",
    progress: 60,
    createdDate: "2024-01-13",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    notes: "Awaiting artwork approval from customer",
    mfReleased: false,
  },
]

const commercialOrders = [
  {
    id: "COM-2024-001",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    jdoId: "JDO-2024-003",
    prePressPlant: "Prepress Hub 1",
    productionPlant: "Plant B",
    prePressStatus: "Complete",
    productionStatus: "In PDD",
    dispatchStatus: "Pending",
    amount: 425000,
    quantity: "8000 units",
    status: "In PDD",
    orderDate: "2024-01-08",
    expectedDelivery: "2024-01-25",
    progress: 70,
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    notes: "Commercial production ongoing",
  },
  {
    id: "COM-2024-002",
    customer: "Global Traders",
    job: "Printed Labels",
    jdoId: "JDO-2024-004",
    prePressPlant: "Prepress Hub 3",
    productionPlant: "Plant A",
    prePressStatus: "Approved",
    productionStatus: "Approved",
    dispatchStatus: "Scheduled",
    amount: 185000,
    quantity: "10000 units",
    status: "Approved",
    orderDate: "2024-01-12",
    expectedDelivery: "2024-01-28",
    progress: 100,
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    notes: "Commercial order approved, ready for production",
  },
  {
    id: "COM-2024-003",
    customer: "Acme Corp",
    job: "Custom Packaging",
    jdoId: "JDO-2024-001",
    prePressPlant: "Prepress Hub 2",
    productionPlant: "Plant D",
    prePressStatus: "In Progress",
    productionStatus: "Pending",
    dispatchStatus: "Pending",
    amount: 320000,
    quantity: "5000 units",
    status: "In Review",
    orderDate: "2024-01-15",
    expectedDelivery: "2024-02-02",
    progress: 45,
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    notes: "Under commercial review",
  },
]

const pnOrders = [
  {
    id: "PN-2024-001",
    pnReqNo: "REQ-2024-1001",
    customer: "TechStart Inc",
    job: "Corrugated Boxes",
    commercialId: "COM-2024-001",
    fgMaterial: "FG-CORR-9081",
    amount: 450000,
    quantity: "9000 units",
    status: "Arrived",
    prePressStatus: "Complete",
    productionStatus: "Completed",
    dispatchStatus: "Dispatched",
    punchedDate: "2024-01-10",
    releasedDate: "2024-01-12",
    dispatchedDate: "2024-01-18",
    initiateDate: "2024-01-08",
    progress: 100,
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    notes: "Successfully delivered to customer",
    description: "Printed corrugated shipping boxes",
    rmType: "Paperboard",
    procurementQty: "9,000 units",
    plant: "Plant B",
    orderDate: "2024-01-05",
    expectedDelivery: "2024-01-18",
  },
  {
    id: "PN-2024-002",
    pnReqNo: "REQ-2024-1005",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    commercialId: "COM-2024-002",
    fgMaterial: "FG-FOLD-5523",
    amount: 275000,
    quantity: "6500 units",
    status: "Not Arrived",
    prePressStatus: "Approved",
    productionStatus: "In PDD",
    dispatchStatus: "Pending",
    punchedDate: "2024-01-14",
    releasedDate: "2024-01-15",
    dispatchedDate: null,
    initiateDate: "2024-01-12",
    progress: 60,
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    notes: "Production in progress, expected dispatch: 2024-01-22",
    description: "Premium folding cartons - matte finish",
    rmType: "Coated Board",
    procurementQty: "6,500 units",
    plant: "Plant A",
    orderDate: "2024-01-10",
    expectedDelivery: "2024-01-24",
  },
  {
    id: "PN-2024-003",
    pnReqNo: "REQ-2024-1010",
    customer: "Swift Logistics",
    job: "Custom Labels",
    commercialId: "COM-2024-003",
    fgMaterial: "FG-LBL-7720",
    amount: 195000,
    quantity: "12000 units",
    status: "Not Arrived",
    prePressStatus: "In Review",
    productionStatus: "Released",
    dispatchStatus: "Pending",
    punchedDate: "2024-01-16",
    releasedDate: "2024-01-17",
    dispatchedDate: null,
    initiateDate: "2024-01-15",
    progress: 35,
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    notes: "Released to production floor",
    description: "Logistics barcode and brand labels",
    rmType: "Vinyl",
    procurementQty: "12,000 units",
    plant: "Plant D",
    orderDate: "2024-01-14",
    expectedDelivery: "2024-01-29",
  },
]

const STATUS_THEME: Record<string, { badge: string; accent: string }> = {
  "Sample Approved": {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  "Sales Approval": {
    badge: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
    accent: "bg-indigo-500",
  },
  Clarification: {
    badge: "bg-amber-400/20 text-amber-700 border-amber-400/30",
    accent: "bg-amber-500",
  },
  "In PDD": {
    badge: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    accent: "bg-sky-500",
  },
  Approved: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  "In Review": {
    badge: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
    accent: "bg-cyan-500",
  },
  Complete: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  Completed: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  Pending: {
    badge: "bg-amber-400/20 text-amber-700 border-amber-400/30",
    accent: "bg-amber-500",
  },
  Released: {
    badge: "bg-violet-500/15 text-violet-700 border-violet-500/30",
    accent: "bg-violet-500",
  },
  Scheduled: {
    badge: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    accent: "bg-sky-500",
  },
  Dispatched: {
    badge: "bg-teal-500/15 text-teal-700 border-teal-500/30",
    accent: "bg-teal-500",
  },
  Arrived: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  "Not Arrived": {
    badge: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    accent: "bg-rose-500",
  },
  "In Progress": {
    badge: "bg-amber-400/20 text-amber-700 border-amber-400/30",
    accent: "bg-amber-500",
  },
}

function getStatusBadge(status: string) {
  return STATUS_THEME[status]?.badge ?? "bg-slate-200 text-slate-600 border-slate-300"
}

function getStatusAccent(status: string) {
  return STATUS_THEME[status]?.accent ?? "bg-slate-300"
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Sample Approved":
    case "Approved":
    case "Complete":
    case "Completed":
    case "Dispatched":
    case "Arrived":
      return CheckCircle2
    case "Sales Approval":
    case "In Review":
    case "In PDD":
    case "Released":
    case "Clarification":
    case "Scheduled":
    case "In Progress":
      return Clock
    case "Pending":
    case "Not Arrived":
      return AlertCircle
    default:
      return Clock
  }
}

function mapArtworkStage(status: string) {
  switch (status) {
    case "Approved":
      return "Approved"
    case "In Review":
      return "Awaiting Approval"
    case "Pending":
      return "In Prepress"
    case "Clarification":
      return "Clarification"
    default:
      return status
  }
}

function mapBomRoutingStage(status: string) {
  switch (status) {
    case "Complete":
    case "Completed":
      return "Completed"
    case "Pending":
      return "In MDGT"
    case "Clarification":
      return "Clarification"
    default:
      return status
  }
}

function formatBomRoutingStatus(bomStatus: string, routingStatus: string) {
  const bomStage = mapBomRoutingStage(bomStatus)
  const routingStage = mapBomRoutingStage(routingStatus)
  if (bomStage === routingStage) {
    return bomStage
  }
  return `${bomStage} / ${routingStage}`
}

interface ProjectsContentProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function ProjectsContent({ activeTab = "sdo", onTabChange }: ProjectsContentProps) {
  const [sdoSearch, setSdoSearch] = useState("")
  const [sdoStatusFilter, setSdoStatusFilter] = useState("all")
  const [sdoKamFilter, setSdoKamFilter] = useState("all")
  const [sdoHodFilter, setSdoHodFilter] = useState("all")
  const [jdoSearch, setJdoSearch] = useState("")
  const [jdoStatusFilter, setJdoStatusFilter] = useState("all")
  const [jdoKamFilter, setJdoKamFilter] = useState("all")
  const [jdoHodFilter, setJdoHodFilter] = useState("all")
  const [comSearch, setComSearch] = useState("")
  const [comStatusFilter, setComStatusFilter] = useState("all")
  const [comKamFilter, setComKamFilter] = useState("all")
  const [comHodFilter, setComHodFilter] = useState("all")
  const [pnSearch, setPnSearch] = useState("")
  const [pnStatusFilter, setPnStatusFilter] = useState("all")
  const [pnKamFilter, setPnKamFilter] = useState("all")
  const [pnHodFilter, setPnHodFilter] = useState("all")

  // Pagination states
  const [sdoPage, setSdoPage] = useState(1)
  const [jdoPage, setJdoPage] = useState(1)
  const [comPage, setComPage] = useState(1)
  const [pnPage, setPnPage] = useState(1)
  const itemsPerPage = 20

  // Get unique KAM names
  const sdoKamNames = Array.from(new Set(sdoProjects.map(p => p.kamName).filter((name): name is string => Boolean(name))))
  const jdoKamNames = Array.from(new Set(jdoProjects.map(p => p.kamName).filter((name): name is string => Boolean(name))))
  const comKamNames = Array.from(new Set(commercialOrders.map(p => p.kamName).filter((name): name is string => Boolean(name))))
  const pnKamNames = Array.from(new Set(pnOrders.map(p => p.kamName).filter((name): name is string => Boolean(name))))

  // Get unique HOD names
  const sdoHodNames = Array.from(new Set(sdoProjects.map(p => p.hodName).filter((name): name is string => Boolean(name))))
  const jdoHodNames = Array.from(new Set(jdoProjects.map(p => p.hodName).filter((name): name is string => Boolean(name))))
  const comHodNames = Array.from(new Set(commercialOrders.map(p => p.hodName).filter((name): name is string => Boolean(name))))
  const pnHodNames = Array.from(new Set(pnOrders.map(p => p.hodName).filter((name): name is string => Boolean(name))))

  // Filtered data
  const filteredSDO = sdoProjects.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.job.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.quoteId.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.executionLocation.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.productionPlant.toLowerCase().includes(sdoSearch.toLowerCase())
    const matchesStatus = sdoStatusFilter === "all" || p.status === sdoStatusFilter
    const matchesKam = sdoKamFilter === "all" || p.kamName === sdoKamFilter
    const matchesHod = sdoHodFilter === "all" || p.hodName === sdoHodFilter
    return matchesSearch && matchesStatus && matchesKam && matchesHod
  })

  const filteredJDO = jdoProjects.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.job.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.sdoId.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.prePressPlant.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.productionPlant.toLowerCase().includes(jdoSearch.toLowerCase())
    const overallStatus =
      p.artworkStatus === "Approved" && p.bomStatus === "Complete" && p.routingStatus === "Complete"
        ? "Approved"
        : "In Review"
    const matchesKam = jdoKamFilter === "all" || p.kamName === jdoKamFilter
    const matchesHod = jdoHodFilter === "all" || p.hodName === jdoHodFilter
    return matchesSearch && (jdoStatusFilter === "all" || overallStatus === jdoStatusFilter) && matchesKam && matchesHod
  })

  const filteredCommercial = commercialOrders.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.job.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.jdoId.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.quantity.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.prePressPlant.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.productionPlant.toLowerCase().includes(comSearch.toLowerCase())
    const matchesKam = comKamFilter === "all" || p.kamName === comKamFilter
    const matchesHod = comHodFilter === "all" || p.hodName === comHodFilter
    return matchesSearch && (comStatusFilter === "all" || p.status === comStatusFilter) && matchesKam && matchesHod
  })

  const filteredPN = pnOrders.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.job.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.commercialId.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.quantity.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.pnReqNo.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.fgMaterial.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.rmType.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.plant.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.initiateDate.toLowerCase().includes(pnSearch.toLowerCase())
    const matchesKam = pnKamFilter === "all" || p.kamName === pnKamFilter
    const matchesHod = pnHodFilter === "all" || p.hodName === pnHodFilter
    return matchesSearch && (pnStatusFilter === "all" || p.status === pnStatusFilter) && matchesKam && matchesHod
  })

  // Pagination calculations for SDO
  const sdoTotalPages = Math.ceil(filteredSDO.length / itemsPerPage)
  const sdoStartIndex = (sdoPage - 1) * itemsPerPage
  const sdoEndIndex = sdoStartIndex + itemsPerPage
  const paginatedSDO = filteredSDO.slice(sdoStartIndex, sdoEndIndex)

  // Pagination calculations for JDO
  const jdoTotalPages = Math.ceil(filteredJDO.length / itemsPerPage)
  const jdoStartIndex = (jdoPage - 1) * itemsPerPage
  const jdoEndIndex = jdoStartIndex + itemsPerPage
  const paginatedJDO = filteredJDO.slice(jdoStartIndex, jdoEndIndex)

  // Pagination calculations for Commercial
  const comTotalPages = Math.ceil(filteredCommercial.length / itemsPerPage)
  const comStartIndex = (comPage - 1) * itemsPerPage
  const comEndIndex = comStartIndex + itemsPerPage
  const paginatedCommercial = filteredCommercial.slice(comStartIndex, comEndIndex)

  // Pagination calculations for PN
  const pnTotalPages = Math.ceil(filteredPN.length / itemsPerPage)
  const pnStartIndex = (pnPage - 1) * itemsPerPage
  const pnEndIndex = pnStartIndex + itemsPerPage
  const paginatedPN = filteredPN.slice(pnStartIndex, pnEndIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setSdoPage(1)
  }, [sdoSearch, sdoStatusFilter, sdoKamFilter, sdoHodFilter])

  useEffect(() => {
    setJdoPage(1)
  }, [jdoSearch, jdoStatusFilter, jdoKamFilter, jdoHodFilter])

  useEffect(() => {
    setComPage(1)
  }, [comSearch, comStatusFilter, comKamFilter, comHodFilter])

  useEffect(() => {
    setPnPage(1)
  }, [pnSearch, pnStatusFilter, pnKamFilter, pnHodFilter])

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* SDO Tab */}
        <TabsContent value="sdo">
          <div className="relative mb-4 w-full flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your SDO by ID, customer, job, or location..."
                value={sdoSearch}
                onChange={(e) => setSdoSearch(e.target.value)}
                className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:truncate"
              />
            </div>
            <Mic
              onClick={() => alert("Voice input feature coming soon")}
              className="h-6 w-6 text-[#005180] cursor-pointer hover:text-[#004875] transition-colors duration-200 flex-shrink-0"
            />
          </div>

          <Card className="surface-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#005180] to-[#0066a1] hover:bg-gradient-to-r hover:from-[#005180] hover:to-[#0066a1]">
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>HOD Name</span>
                          <Select value={sdoHodFilter} onValueChange={setSdoHodFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#0066a1]/40 hover:bg-[#0066a1]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All HODs</SelectItem>
                              {sdoHodNames.map(hodName => (
                                <SelectItem key={hodName} value={hodName}>{hodName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>KAM Name</span>
                          <Select value={sdoKamFilter} onValueChange={setSdoKamFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#0066a1]/40 hover:bg-[#0066a1]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All KAMs</SelectItem>
                              {sdoKamNames.map(kamName => (
                                <SelectItem key={kamName} value={kamName}>{kamName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        ID / Customer
                      </TableHead>
                      <TableHead className="w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Job Details
                      </TableHead>
                      <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Execution Location
                      </TableHead>
                      <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Production Plant
                      </TableHead>
                      <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <Select value={sdoStatusFilter} onValueChange={setSdoStatusFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#0066a1]/40 hover:bg-[#0066a1]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[160px]">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="Sample Approved">Sample Approved</SelectItem>
                              <SelectItem value="Sales Approval">Sales Approval</SelectItem>
                              <SelectItem value="Clarification">Clarification</SelectItem>
                              <SelectItem value="In PDD">In PDD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSDO.map((project, index) => {
                      const StatusIcon = getStatusIcon(project.status)
                      return (
                        <Dialog key={project.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className="group cursor-pointer border-b border-border/40 bg-white transition-colors even:bg-[#005180]/8 hover:bg-[#78BE20]/15"
                              style={{ animationDelay: `${index * 25}ms` }}
                            >
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{project.hodName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{project.kamName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="leading-[1.15]">
                                  <p className="text-sm font-semibold text-primary">{project.id}</p>
                                  <TruncatedText text={project.customer} limit={25} className="text-sm text-muted-foreground" />
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="leading-[1.15]">
                                  <TruncatedText text={project.job} limit={30} className="text-sm font-semibold text-foreground" />
                                  <p className="text-xs text-muted-foreground">Quote {project.quoteId}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{project.executionLocation}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{project.productionPlant}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge className={`${getStatusBadge(project.status)} border gap-1 px-3 py-1 text-xs font-semibold` }>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {project.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="surface-elevated max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
                            <DialogHeader className="border-b border-border/60 bg-primary/10 px-6 py-5 flex-shrink-0">
                              <DialogTitle className="text-lg font-semibold text-foreground">{project.job}</DialogTitle>
                              <DialogDescription className="text-sm text-muted-foreground">{project.id}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 px-6 py-6 overflow-y-auto overflow-x-hidden flex-1">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Customer</Label>
                                  <p className="mt-1 text-sm font-medium text-foreground">{project.customer}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quote</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.quoteId}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Execution Location</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.executionLocation}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Production Plant</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.productionPlant}</p>
                                </div>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.createdDate}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approved</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.approvedDate ?? "Pending"}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</Label>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge className={`${getStatusBadge(project.status)} border px-3 py-1 text-sm font-semibold`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {project.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</Label>
                                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{project.notes}</p>
                              </div>
                              {project.history?.length ? (
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Journey</Label>
                                  <div className="mt-2 space-y-3 border-l border-border/60 pl-4">
                                    {project.history.map((step, stepIndex) => (
                                      <div key={`${project.id}-history-${step.stage}-${stepIndex}`} className="flex items-start gap-3">
                                        <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${getStatusAccent(project.status)}`} />
                                        <div>
                                          <p className="text-sm font-semibold text-foreground">{step.stage}</p>
                                          <p className="text-xs text-muted-foreground">{step.date}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {sdoTotalPages > 1 && (
              <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSdoPage(sdoPage - 1)}
                    disabled={sdoPage === 1}
                    className="h-8 px-3"
                  >
                    Previous
                  </Button>
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: sdoTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={sdoPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSdoPage(page)}
                        className={`h-8 w-8 ${sdoPage === page ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <div className="md:hidden text-sm text-muted-foreground">
                    {sdoPage} / {sdoTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSdoPage(sdoPage + 1)}
                    disabled={sdoPage === sdoTotalPages}
                    className="h-8 px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* JDO Tab */}
        <TabsContent value="jdo">
          <div className="relative mb-4 w-full flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your JDO by ID, customer, job, or plant..."
                value={jdoSearch}
                onChange={(e) => setJdoSearch(e.target.value)}
                className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:truncate"
              />
            </div>
            <Mic
              onClick={() => alert("Voice input feature coming soon")}
              className="h-6 w-6 text-[#005180] cursor-pointer hover:text-[#004875] transition-colors duration-200 flex-shrink-0"
            />
          </div>

          <Card className="surface-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#004875] to-[#005180] hover:bg-gradient-to-r hover:from-[#004875] hover:to-[#005180]">
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>HOD Name</span>
                          <Select value={jdoHodFilter} onValueChange={setJdoHodFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#005180]/40 hover:bg-[#005180]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All HODs</SelectItem>
                              {jdoHodNames.map(hodName => (
                                <SelectItem key={hodName} value={hodName}>{hodName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>KAM Name</span>
                          <Select value={jdoKamFilter} onValueChange={setJdoKamFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#005180]/40 hover:bg-[#005180]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All KAMs</SelectItem>
                              {jdoKamNames.map(kamName => (
                                <SelectItem key={kamName} value={kamName}>{kamName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        ID / Customer
                      </TableHead>
                      <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Job Details
                      </TableHead>
                      <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Pre-Press Plant
                      </TableHead>
                      <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Production Plant
                      </TableHead>
                      <TableHead className="w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Stage Status
                      </TableHead>
                      <TableHead className="w-[140px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>Progress</span>
                          <Select value={jdoStatusFilter} onValueChange={setJdoStatusFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#005180]/40 hover:bg-[#005180]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[140px]">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="In Review">In Review</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedJDO.map((project, index) => {
                      const overallStatus =
                        project.artworkStatus === "Approved" && project.bomStatus === "Complete" && project.routingStatus === "Complete"
                          ? "Approved"
                          : "In Review"
                      const StatusIcon = getStatusIcon(overallStatus)
                      return (
                        <Dialog key={project.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className="group cursor-pointer border-b border-border/40 bg-white transition-colors even:bg-[#005180]/8 hover:bg-[#78BE20]/15"
                              style={{ animationDelay: `${index * 25}ms` }}
                            >
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{project.hodName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{project.kamName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="leading-[1.15]">
                                  <p className="text-sm font-semibold text-primary">{project.id}</p>
                                  <TruncatedText text={project.customer} limit={25} className="text-sm text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">SDO {project.sdoId}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <TruncatedText text={project.job} limit={30} className="text-sm font-semibold text-foreground" />
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{project.prePressPlant}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{project.productionPlant}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="space-y-1 text-xs font-semibold text-foreground">
                                  <p>Artwork – {mapArtworkStage(project.artworkStatus)}</p>
                                  <p>BOM/Routing – {formatBomRoutingStatus(project.bomStatus, project.routingStatus)}</p>
                                  <p>MF Released – {project.mfReleased ? "Yes" : "No"}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="space-y-2">
                                  <Badge className={`${getStatusBadge(overallStatus)} border gap-1 px-3 py-1 text-xs font-semibold`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {overallStatus}
                                  </Badge>
                                  <p className="text-xs font-semibold text-muted-foreground">Progress {project.progress}%</p>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/80">
                                    <div
                                      className={`${getStatusAccent(overallStatus)} h-full transition-all`}
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="surface-elevated max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
                            <DialogHeader className="border-b border-border/60 bg-primary/10 px-6 py-5 flex-shrink-0">
                              <DialogTitle className="text-lg font-semibold text-foreground">{project.job}</DialogTitle>
                              <DialogDescription className="text-sm text-muted-foreground">{project.id}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 px-6 py-6 overflow-y-auto overflow-x-hidden flex-1">
                              <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Customer</Label>
                                  <p className="mt-1 text-sm font-medium text-foreground">{project.customer}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">SDO</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.sdoId}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.createdDate}</p>
                                </div>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pre-Press Plant</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.prePressPlant}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Production Plant</Label>
                                  <p className="mt-1 text-sm text-foreground/80">{project.productionPlant}</p>
                                </div>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Artwork</Label>
                                  <p className="mt-1 text-sm font-semibold text-foreground">{mapArtworkStage(project.artworkStatus)}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">BOM/Routing</Label>
                                  <p className="mt-1 text-sm font-semibold text-foreground">{formatBomRoutingStatus(project.bomStatus, project.routingStatus)}</p>
                                </div>
                                <div>
                                  <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">MF Released</Label>
                                  <p className="mt-1 text-sm font-semibold text-foreground">{project.mfReleased ? "Yes" : "No"}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Overall Status</Label>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge className={`${getStatusBadge(overallStatus)} border px-3 py-1 text-sm font-semibold`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {overallStatus}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress</Label>
                                <div className="mt-1 space-y-2">
                                  <p className="text-sm font-semibold text-muted-foreground">{project.progress}%</p>
                                  <div className="h-3 w-full overflow-hidden rounded-full bg-border/80">
                                    <div
                                      className={`${getStatusAccent(overallStatus)} h-full transition-all`}
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</Label>
                                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{project.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {jdoTotalPages > 1 && (
              <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJdoPage(jdoPage - 1)}
                    disabled={jdoPage === 1}
                    className="h-8 px-3"
                  >
                    Previous
                  </Button>
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: jdoTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={jdoPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setJdoPage(page)}
                        className={`h-8 w-8 ${jdoPage === page ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <div className="md:hidden text-sm text-muted-foreground">
                    {jdoPage} / {jdoTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJdoPage(jdoPage + 1)}
                    disabled={jdoPage === jdoTotalPages}
                    className="h-8 px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Commercial Tab */}
        <TabsContent value="commercial">
          {/* Commercial Search Bar */}
          <div className="relative mb-4 w-full flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your commercial orders by ID, customer, or job..."
                value={comSearch}
                onChange={(e) => setComSearch(e.target.value)}
                className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:truncate"
              />
            </div>
            <Mic
              onClick={() => alert("Voice input feature coming soon")}
              className="h-6 w-6 text-[#005180] cursor-pointer hover:text-[#004875] transition-colors duration-200 flex-shrink-0"
            />
          </div>

          <Card className="surface-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#003d63] to-[#005180] hover:bg-gradient-to-r hover:from-[#003d63] hover:to-[#005180]">
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>HOD Name</span>
                          <Select value={comHodFilter} onValueChange={setComHodFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#005180]/40 hover:bg-[#005180]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All HODs</SelectItem>
                              {comHodNames.map(hodName => (
                                <SelectItem key={hodName} value={hodName}>{hodName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>KAM Name</span>
                          <Select value={comKamFilter} onValueChange={setComKamFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#005180]/40 hover:bg-[#005180]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All KAMs</SelectItem>
                              {comKamNames.map(kamName => (
                                <SelectItem key={kamName} value={kamName}>{kamName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        ID / Customer
                      </TableHead>
                      <TableHead className="w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Job Details
                      </TableHead>
                      <TableHead className="w-[170px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Pre-Press Plant
                      </TableHead>
                      <TableHead className="w-[170px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Production Plant
                      </TableHead>
                      <TableHead className="w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Stage Status
                      </TableHead>
                      <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <Select value={comStatusFilter} onValueChange={setComStatusFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#005180]/40 hover:bg-[#005180]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[140px]">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="In PDD">In PDD</SelectItem>
                              <SelectItem value="In Review">In Review</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[170px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Financials
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCommercial.map((order, index) => {
                      return (
                        <Dialog key={order.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className="group cursor-pointer border-b border-border/40 bg-white transition-colors even:bg-[#005180]/8 hover:bg-[#78BE20]/15"
                              style={{ animationDelay: `${index * 25}ms` }}
                            >
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{order.hodName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{order.kamName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="leading-[1.15]">
                                  <p className="text-sm font-semibold text-primary">{order.id}</p>
                                  <TruncatedText text={order.customer} limit={25} className="text-sm text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">JDO {order.jdoId}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="leading-[1.15]">
                                  <TruncatedText text={order.job} limit={30} className="text-sm font-semibold text-foreground" />
                                  <p className="text-xs text-muted-foreground">{order.quantity}</p>
                                  <p className="text-xs text-muted-foreground">Order {order.orderDate}</p>
                                  <p className="text-xs text-muted-foreground">Delivery {order.expectedDelivery}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.prePressPlant}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.productionPlant}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="space-y-1 text-xs font-semibold text-foreground">
                                  <p>Pre-Press – {order.prePressStatus}</p>
                                  <p>Production – {order.productionStatus}</p>
                                  <p>Dispatch – {order.dispatchStatus}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="space-y-2">
                                  <Badge className={`${getStatusBadge(order.status)} border gap-1 px-3 py-1 text-xs font-semibold`}>
                                    {order.status}
                                  </Badge>
                                  <p className="text-xs font-semibold text-muted-foreground">Progress {order.progress}%</p>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/80">
                                    <div className={`${getStatusAccent(order.status)} h-full transition-all`} style={{ width: `${order.progress}%` }} />
                                  </div>
                                  <p className="text-xs font-semibold text-foreground">₹{order.amount.toLocaleString("en-IN")}</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                            <DialogHeader className="flex-shrink-0">
                              <DialogTitle className="text-2xl font-bold text-blue">{order.id}</DialogTitle>
                              <DialogDescription>
                                Commercial Order Details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4 overflow-y-auto overflow-x-hidden flex-1">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Customer</Label>
                                <p className="text-base font-medium">{order.customer}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Job Name</Label>
                                <p className="text-base font-medium">{order.job}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">JDO ID</Label>
                                <p className="text-base font-medium">{order.jdoId}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Pre-Press Plant</Label>
                                <p className="text-base font-medium">{order.prePressPlant}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Production Plant</Label>
                                <p className="text-base font-medium">{order.productionPlant}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Amount</Label>
                                <p className="text-lg font-bold text-blue">₹{order.amount.toLocaleString("en-IN")}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Quantity</Label>
                                <p className="text-base font-medium">{order.quantity}</p>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Stage Status</Label>
                                <div className="space-y-1 text-sm font-semibold text-foreground">
                                  <p>Pre-Press - {order.prePressStatus}</p>
                                  <p>Production - {order.productionStatus}</p>
                                  <p>Dispatch - {order.dispatchStatus}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Order Date</Label>
                                <p className="text-base font-medium">{order.orderDate}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Expected Delivery</Label>
                                <p className="text-base font-medium">{order.expectedDelivery}</p>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Progress</Label>
                                <div className="space-y-2">
                                  <div className="text-sm font-semibold text-muted-foreground">{order.progress}%</div>
                                  <div className="h-3 w-full overflow-hidden rounded-full bg-border/80">
                                    <div className={`${getStatusAccent(order.status)} h-full transition-all`} style={{ width: `${order.progress}%` }} />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Notes</Label>
                                <p className="text-base">{order.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {comTotalPages > 1 && (
              <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setComPage(comPage - 1)}
                    disabled={comPage === 1}
                    className="h-8 px-3"
                  >
                    Previous
                  </Button>
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: comTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={comPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setComPage(page)}
                        className={`h-8 w-8 ${comPage === page ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <div className="md:hidden text-sm text-muted-foreground">
                    {comPage} / {comTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setComPage(comPage + 1)}
                    disabled={comPage === comTotalPages}
                    className="h-8 px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* PN Tab */}
        <TabsContent value="pn">
          {/* PN Search Bar */}
          <div className="relative mb-4 w-full flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your PN by number, request, or customer..."
                value={pnSearch}
                onChange={(e) => setPnSearch(e.target.value)}
                className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:truncate"
              />
            </div>
            <Mic
              onClick={() => alert("Voice input feature coming soon")}
              className="h-6 w-6 text-[#005180] cursor-pointer hover:text-[#004875] transition-colors duration-200 flex-shrink-0"
            />
          </div>

          <Card className="surface-elevated overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#005180] to-[#004875] hover:bg-gradient-to-r hover:from-[#005180] hover:to-[#004875]">
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>HOD Name</span>
                          <Select value={pnHodFilter} onValueChange={setPnHodFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#004875]/40 hover:bg-[#004875]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All HODs</SelectItem>
                              {pnHodNames.map(hodName => (
                                <SelectItem key={hodName} value={hodName}>{hodName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>KAM Name</span>
                          <Select value={pnKamFilter} onValueChange={setPnKamFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#004875]/40 hover:bg-[#004875]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All KAMs</SelectItem>
                              {pnKamNames.map(kamName => (
                                <SelectItem key={kamName} value={kamName}>{kamName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      <TableHead className="w-[130px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        PN
                      </TableHead>
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        PN Req No.
                      </TableHead>
                      <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        FG Material
                      </TableHead>
                      <TableHead className="w-[170px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Customer
                      </TableHead>
                      <TableHead className="w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Description
                      </TableHead>
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        RM Type
                      </TableHead>
                      <TableHead className="w-[150px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Procurement Qty
                      </TableHead>
                      <TableHead className="w-[120px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Plant
                      </TableHead>
                      <TableHead className="w-[140px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        Initiate Date
                      </TableHead>
                      <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <Select value={pnStatusFilter} onValueChange={setPnStatusFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#004875]/40 hover:bg-[#004875]/60 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[140px]">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="Arrived">Arrived</SelectItem>
                              <SelectItem value="Not Arrived">Not Arrived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPN.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status)
                      return (
                        <Dialog key={order.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className="group cursor-pointer border-b border-border/40 bg-white transition-colors even:bg-[#005180]/8 hover:bg-[#78BE20]/15"
                              style={{ animationDelay: `${index * 25}ms` }}
                            >
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{order.hodName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground">{order.kamName || "N/A"}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="leading-[1.15]">
                                  <p className="text-sm font-semibold text-primary">{order.id}</p>
                                  <p className="text-xs text-muted-foreground">Commercial {order.commercialId}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.pnReqNo}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.fgMaterial}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <TruncatedText text={order.customer} limit={25} className="text-sm font-medium text-foreground/80" />
                              </TableCell>
                              <TableCell className="py-4">
                                <TruncatedText text={order.description} limit={40} className="text-sm text-muted-foreground" />
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.rmType}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.procurementQty}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.plant}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <p className="text-sm font-medium text-foreground/80">{order.initiateDate}</p>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge className={`${getStatusBadge(order.status)} border gap-1 px-3 py-1 text-xs font-semibold`}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                            <DialogHeader className="flex-shrink-0">
                              <DialogTitle className="text-2xl font-bold text-blue">{order.id}</DialogTitle>
                              <DialogDescription>Production Order Details</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4 overflow-y-auto overflow-x-hidden flex-1">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">PN Req No.</Label>
                                <p className="text-base font-medium">{order.pnReqNo}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">FG Material</Label>
                                <p className="text-base font-medium">{order.fgMaterial}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Customer</Label>
                                <p className="text-base font-medium">{order.customer}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                                <p className="text-base font-medium">{order.description}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">RM Type</Label>
                                <p className="text-base font-medium">{order.rmType}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Procurement Qty</Label>
                                <p className="text-base font-medium">{order.procurementQty}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Plant</Label>
                                <p className="text-base font-medium">{order.plant}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Initiate Date</Label>
                                <p className="text-base font-medium">{order.initiateDate}</p>                         </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Order Date</Label>
                                <p className="text-base font-medium">{order.orderDate}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Expected Delivery</Label>
                                <p className="text-base font-medium">{order.expectedDelivery}</p>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Stage Status</Label>
                                <div className="space-y-1 text-sm font-semibold text-foreground">
                                  <p>Pre-Press - {order.prePressStatus}</p>
                                  <p>Production - {order.productionStatus}</p>
                                  <p>Dispatch - {order.dispatchStatus}</p>
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Timeline</Label>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <p className="text-muted-foreground text-xs">Punched</p>
                                    <p className="font-semibold">{order.punchedDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Released</p>
                                    <p className="font-semibold">{order.releasedDate || "Pending"}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Dispatched</p>
                                    <p className="font-semibold">{order.dispatchedDate || "Pending"}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Notes</Label>
                                <p className="text-base">{order.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {pnTotalPages > 1 && (
              <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPnPage(pnPage - 1)}
                    disabled={pnPage === 1}
                    className="h-8 px-3"
                  >
                    Previous
                  </Button>
                  <div className="hidden md:flex items-center gap-1">
                    {Array.from({ length: pnTotalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={pnPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPnPage(page)}
                        className={`h-8 w-8 ${pnPage === page ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <div className="md:hidden text-sm text-muted-foreground">
                    {pnPage} / {pnTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPnPage(pnPage + 1)}
                    disabled={pnPage === pnTotalPages}
                    className="h-8 px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
