"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, SlidersHorizontal, ArrowUpCircle, Share2, Calendar, Mic, CheckCircle2, XCircle } from "lucide-react"
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
import { isHOD, isVerticalHead, isKAM, getViewableKAMs } from "@/lib/permissions"

const quotations = [
  {
    id: "QUO-2024-045",
    inquiryId: "INQ-2024-001",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    amount: 245000,
    margin: 12.5,
    validTill: "2024-01-18",
    status: "Quoted",
    internalStatus: "Not Updated",
    internalStatusNote: "",
    approvalLevel: "L1",
    createdDate: "2024-01-15",
    notes: "Standard pricing applied",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    history: [
      { stage: "Inquiry Received", date: "2024-01-10" },
      { stage: "Costing Completed", date: "2024-01-13" },
      { stage: "Quoted", date: "2024-01-15" },
    ],
  },
  {
    id: "QUO-2024-046",
    inquiryId: "INQ-2024-002",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    amount: 185000,
    margin: 8.2,
    validTill: "2024-01-20",
    status: "Sent to HOD",
    internalStatus: "In Progress",
    internalStatusNote: "Waiting for HOD response",
    approvalLevel: "L2",
    createdDate: "2024-01-14",
    notes: "Low margin - requires L2 approval",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    history: [
      { stage: "Inquiry Received", date: "2024-01-09" },
      { stage: "Costing Completed", date: "2024-01-11" },
      { stage: "Quotation Drafted", date: "2024-01-13" },
      { stage: "Sent to HOD", date: "2024-01-14" },
    ],
  },
  {
    id: "QUO-2024-047",
    inquiryId: "INQ-2024-003",
    customer: "Swift Logistics",
    job: "Corrugated Sheets",
    amount: 320000,
    margin: 15.8,
    validTill: "2024-01-22",
    status: "Approved",
    internalStatus: "Approved",
    internalStatusNote: "",
    approvalLevel: "L1",
    createdDate: "2024-01-13",
    notes: "Good margin - approved",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    history: [
      { stage: "Inquiry Received", date: "2024-01-08" },
      { stage: "Quotation Drafted", date: "2024-01-11" },
      { stage: "Sent to HOD", date: "2024-01-12" },
      { stage: "Approved", date: "2024-01-13" },
    ],
  },
  {
    id: "QUO-2024-048",
    inquiryId: "INQ-2024-004",
    customer: "Acme Corp",
    job: "Custom Packaging",
    amount: 425000,
    margin: 18.5,
    validTill: "2024-01-25",
    status: "Sent to Customer",
    internalStatus: "Not Updated",
    internalStatusNote: "",
    approvalLevel: "L1",
    createdDate: "2024-01-12",
    notes: "Premium pricing - customer accepted",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    history: [
      { stage: "Inquiry Received", date: "2024-01-06" },
      { stage: "Quotation Drafted", date: "2024-01-08" },
      { stage: "Sent to HOD", date: "2024-01-09" },
      { stage: "Approved", date: "2024-01-10" },
      { stage: "Sent to Customer", date: "2024-01-12" },
    ],
  },
  {
    id: "QUO-2024-049",
    inquiryId: "INQ-2024-005",
    customer: "Global Traders",
    job: "Printed Labels",
    amount: 95000,
    margin: 6.5,
    validTill: "2024-01-19",
    status: "Disapproved",
    internalStatus: "Disapproved",
    internalStatusNote: "",
    approvalLevel: "L2",
    createdDate: "2024-01-11",
    notes: "Margin too low - disapproved by L2",
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    history: [
      { stage: "Inquiry Received", date: "2024-01-05" },
      { stage: "Quotation Drafted", date: "2024-01-07" },
      { stage: "Sent to HOD", date: "2024-01-08" },
      { stage: "Disapproved", date: "2024-01-09" },
    ],
  },
]

const STATUS_BADGES: Record<string, string> = {
  Quoted: "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30",
  Approved: "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30",
  "Sent to HOD": "bg-[#005180]/15 text-[#005180] border-[#005180]/30",
  "Sent to Customer": "bg-[#005180]/20 text-[#005180] border-[#005180]/40",
  Disapproved: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
  Rejected: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
}

const STATUS_ACCENTS: Record<string, string> = {
  Quoted: "bg-[#78BE20]",
  Approved: "bg-[#78BE20]",
  "Sent to HOD": "bg-[#005180]",
  "Sent to Customer": "bg-[#005180]",
  Disapproved: "bg-[#B92221]",
  Rejected: "bg-[#B92221]",
}

const INTERNAL_STATUS_BADGES: Record<string, string> = {
  "Approved": "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30 font-semibold",
  "Disapproved": "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30 font-semibold",
  "In Progress": "bg-[#005180]/15 text-[#005180] border-[#005180]/30 font-semibold",
  "Not Updated": "bg-gray-100 text-gray-500 border-gray-300",
}

function getStatusBadge(status: string) {
  return STATUS_BADGES[status] ?? "bg-slate-200 text-slate-600 border-slate-300"
}

function getInternalStatusBadge(status: string) {
  return INTERNAL_STATUS_BADGES[status] ?? "bg-gray-100 text-gray-500 border-gray-300"
}

function getStatusAccent(status: string) {
  return STATUS_ACCENTS[status] ?? "bg-slate-300"
}

function getMarginColor(margin: number) {
  if (margin >= 15) return "text-[#78BE20]"
  if (margin >= 10) return "text-[#005180]"
  return "text-[#B92221]"
}

function getMarginBadge(margin: number) {
  if (margin >= 15) return "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30"
  if (margin >= 10) return "bg-[#005180]/15 text-[#005180] border-[#005180]/30"
  return "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30"
}

export function QuotationsContent() {
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const isKAMUser = viewableKams.length === 1 // KAM can only see themselves
  const isHODUser = isHOD() // HOD user check

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [internalStatusFilter, setInternalStatusFilter] = useState("all")
  const [hodFilter, setHodFilter] = useState("all")
  const [kamFilter, setKamFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedQuotation, setSelectedQuotation] = useState<(typeof quotations)[0] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [userIsHOD, setUserIsHOD] = useState(false)
  const [userIsVerticalHead, setUserIsVerticalHead] = useState(false)
  const [userIsKAM, setUserIsKAM] = useState(false)
  const [internalStatusMap, setInternalStatusMap] = useState<Record<string, string>>({})
  const [internalStatusNoteMap, setInternalStatusNoteMap] = useState<Record<string, string>>({})
  const itemsPerPage = 20

  useEffect(() => {
    // Check user role on component mount
    setUserIsHOD(isHOD())
    setUserIsVerticalHead(isVerticalHead())
    setUserIsKAM(isKAM())
  }, [])

  // Filter data based on user role - KAMs can only see their own data
  const userFilteredQuotations = isRestrictedUser
    ? quotations.filter(q => q.kamName && viewableKams.includes(q.kamName))
    : quotations

  // Get unique HOD and KAM names for filters
  const hodNames = Array.from(new Set(userFilteredQuotations.map(q => q.hodName).filter((name): name is string => Boolean(name))))
  const kamNames = Array.from(new Set(userFilteredQuotations.map(q => q.kamName).filter((name): name is string => Boolean(name))))

  const filteredQuotations = userFilteredQuotations
    .filter((quotation) => {
      const matchesSearch =
        quotation.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.inquiryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.amount.toString().includes(searchQuery) ||
        (quotation.kamName && quotation.kamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (quotation.hodName && quotation.hodName.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === "all" || quotation.status === statusFilter
      const matchesInternalStatus = internalStatusFilter === "all" || quotation.internalStatus === internalStatusFilter
      const matchesHod = hodFilter === "all" || quotation.hodName === hodFilter
      const matchesKam = kamFilter === "all" || quotation.kamName === kamFilter

      return matchesSearch && matchesStatus && matchesInternalStatus && matchesHod && matchesKam
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        case "date-asc":
          return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
        case "amount-desc":
          return b.amount - a.amount
        case "amount-asc":
          return a.amount - b.amount
        case "margin-desc":
          return b.margin - a.margin
        case "margin-asc":
          return a.margin - b.margin
        default:
          return 0
      }
    })

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, internalStatusFilter, hodFilter, kamFilter, sortBy])

  const handleOpenQuotation = (quotation: (typeof quotations)[0]) => {
    setSelectedQuotation(quotation)
  }

  return (
    <div className="section-spacing">
      <div className="relative w-full flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Find your quotations by customer, job, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <TableRow className="bg-gradient-to-r from-[#005180] to-[#003d63] hover:bg-gradient-to-r hover:from-[#005180] hover:to-[#003d63]">
                  {!isKAMUser && !isHODUser && (
                    <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                      <div className="flex items-center justify-between">
                        <span>HOD</span>
                        {!isRestrictedUser && (
                          <Select value={hodFilter} onValueChange={setHodFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All HODs</SelectItem>
                              {hodNames.map(hodName => (
                                <SelectItem key={hodName} value={hodName}>{hodName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableHead>
                  )}
                  {!isKAMUser && (
                    <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                      <div className="flex items-center justify-between">
                        <span>KAM Name</span>
                        <Select value={kamFilter} onValueChange={setKamFilter}>
                          <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                            <Filter className="h-4 w-4 text-white" />
                          </SelectTrigger>
                          <SelectContent align="start" className="min-w-[150px]">
                            <SelectItem value="all">All KAMs</SelectItem>
                            {kamNames.map(kamName => (
                              <SelectItem key={kamName} value={kamName}>{kamName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    ID / Inquiry
                  </TableHead>
                  <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Customer
                  </TableHead>
                  <TableHead className="w-[240px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Job & Validity
                  </TableHead>
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                          <Filter className="h-4 w-4 text-white" />
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-[180px]">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Quoted">Quoted</SelectItem>
                          <SelectItem value="Sent to HOD">Sent to HOD</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Sent to Customer">Sent to Customer</SelectItem>
                          <SelectItem value="Disapproved">Disapproved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                  {isKAMUser && (
                    <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white text-right">
                      Actions
                    </TableHead>
                  )}
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    <div className="flex items-center justify-between">
                      <span>Internal Status</span>
                      <Select value={internalStatusFilter} onValueChange={setInternalStatusFilter}>
                        <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                          <Filter className="h-4 w-4 text-white" />
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-[180px]">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Not Updated">Not Updated</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Disapproved">Disapproved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuotations.map((quotation, index) => (
                  <Dialog key={quotation.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className="group cursor-pointer border-b border-border/40 bg-white transition-all duration-200 even:bg-[#B92221]/5 hover:bg-[#78BE20]/20 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                        onClick={() => handleOpenQuotation(quotation)}
                      >
                        {!isKAMUser && !isHODUser && (
                          <TableCell className="py-4">
                            <p className="text-sm font-medium text-foreground">{quotation.hodName || "N/A"}</p>
                          </TableCell>
                        )}
                        {!isKAMUser && (
                          <TableCell className="py-4">
                            <p className="text-sm font-medium text-foreground">{quotation.kamName || "N/A"}</p>
                          </TableCell>
                        )}
                        <TableCell className="py-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-primary">{quotation.id}</p>
                            <p className="text-xs text-muted-foreground">Inquiry {quotation.inquiryId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <TruncatedText text={quotation.customer} limit={25} className="text-sm font-medium text-foreground block" />
                          <p className="text-xs text-muted-foreground">Created {quotation.createdDate}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-0.5">
                            <TruncatedText text={quotation.job} limit={30} className="text-sm font-semibold text-foreground" />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Valid till {quotation.validTill}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`${getStatusBadge(quotation.status)} border`}>{quotation.status}</Badge>
                          {quotation.status === "Quoted" && (
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
                              Level {quotation.approvalLevel}
                            </p>
                          )}
                        </TableCell>
                        {isKAMUser && (
                          <TableCell className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-[#005180]/10 text-[#005180] border-[#005180]/30 hover:bg-[#005180]/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Sending ${quotation.id} to HOD`)
                                }}
                              >
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                                Send to HOD
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs bg-[#78BE20]/10 text-[#78BE20] border-[#78BE20]/30 hover:bg-[#78BE20]/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Sharing ${quotation.id} with customer`)
                                }}
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                          {isKAMUser ? (
                            <div className="space-y-2">
                              <Select
                                value={internalStatusMap[quotation.id] || quotation.internalStatus}
                                onValueChange={(value) => {
                                  setInternalStatusMap({ ...internalStatusMap, [quotation.id]: value })
                                }}
                              >
                                <SelectTrigger className="w-full border-border/60">
                                  <Badge className={`${getInternalStatusBadge(internalStatusMap[quotation.id] || quotation.internalStatus)} border text-xs`}>
                                    {internalStatusMap[quotation.id] || quotation.internalStatus}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Not Updated">
                                    <Badge className={`${getInternalStatusBadge("Not Updated")} border text-xs`}>
                                      Not Updated
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="In Progress">
                                    <Badge className={`${getInternalStatusBadge("In Progress")} border text-xs`}>
                                      In Progress
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="Approved">
                                    <Badge className={`${getInternalStatusBadge("Approved")} border text-xs`}>
                                      Approved
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="Disapproved">
                                    <Badge className={`${getInternalStatusBadge("Disapproved")} border text-xs`}>
                                      Disapproved
                                    </Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {(internalStatusMap[quotation.id] === "In Progress" || (quotation.internalStatus === "In Progress" && !internalStatusMap[quotation.id])) && (
                                <Input
                                  placeholder="Enter progress note..."
                                  value={internalStatusNoteMap[quotation.id] || quotation.internalStatusNote || ""}
                                  onChange={(e) => {
                                    setInternalStatusNoteMap({ ...internalStatusNoteMap, [quotation.id]: e.target.value })
                                  }}
                                  className="text-xs h-8"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                            </div>
                          ) : (
                            <Badge className={`${getInternalStatusBadge(quotation.internalStatus)} border`}>
                              {quotation.internalStatus}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="surface-elevated max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
                      <DialogHeader className="border-b-0 bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-5 flex-shrink-0 text-center">
                        <DialogTitle className="text-xl font-bold text-gray-900">{selectedQuotation?.job}</DialogTitle>
                        <DialogDescription className="text-sm font-semibold text-gray-600">{selectedQuotation?.id}</DialogDescription>
                      </DialogHeader>
                      {selectedQuotation && (
                        <div className="space-y-0 overflow-y-auto overflow-x-hidden flex-1">
                          {/* Customer Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Customer</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.customer}</p>
                          </div>

                          {/* Status Section */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Status</Label>
                            <Badge className={`${getStatusBadge(selectedQuotation.status)} border text-sm px-3 py-1`}>
                              {selectedQuotation.status}
                            </Badge>
                          </div>

                          {/* KAM Name Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">KAM Name</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.kamName || "N/A"}</p>
                          </div>

                          {/* Approval Level Section */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Approval Level</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.approvalLevel}</p>
                          </div>

                          {/* Inquiry Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Inquiry</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.inquiryId}</p>
                          </div>

                          {/* Valid Till Section */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Valid Till</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.validTill}</p>
                          </div>

                          {/* Created Date Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Created Date</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.createdDate}</p>
                          </div>

                          {/* Journey Section */}
                          {selectedQuotation.history?.length ? (
                            <div className="bg-white px-6 py-4 border-b border-gray-200">
                              <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-3 block">Journey</Label>
                              <div className="space-y-3">
                                {selectedQuotation.history.map((step, stepIndex) => {
                                  const isCurrent =
                                    stepIndex === selectedQuotation.history.length - 1 &&
                                    step.stage === selectedQuotation.status
                                  return (
                                    <div key={`${selectedQuotation.id}-step-${step.stage}`} className="flex items-start gap-3">
                                      <span
                                        className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                                          isCurrent ? getStatusAccent(selectedQuotation.status) : "bg-gray-400"
                                        }`}
                                      />
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">{step.stage}</p>
                                        <p className="text-xs text-gray-500">{step.date}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 border-t border-border/60 bg-muted/30 px-6 py-4">
                        {selectedQuotation?.status === "Quoted" && (
                          <Button variant="outline" size="sm" className="rounded-lg border-border/60 text-primary">
                            <ArrowUpCircle className="mr-2 h-4 w-4" /> Send to HOD
                          </Button>
                        )}
                        {selectedQuotation?.status === "Approved" && (
                          <Button size="sm" className="rounded-lg bg-primary text-white hover:bg-primary/90">
                            <Share2 className="mr-2 h-4 w-4" /> Share with Customer
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Previous
              </Button>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <div className="md:hidden text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
