"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock, AlertTriangle, Search, Eye, Mic, Filter, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { getApprovalLevel, getViewableKAMs, isHOD } from "@/lib/permissions"

const pendingApprovals = [
  {
    id: "CUST-2024-001",
    type: "Customer Creation",
    customer: "Tech Solutions Ltd",
    customerName: "Tech Solutions Ltd",
    registeredAddress: "123 Business Park, Mumbai",
    gstNumber: "27AABCU9603R1ZX",
    panNumber: "AABCU9603R",
    productsToManufacture: "Printed Cartons, Labels",
    businessValuePerMonth: "₹5,00,000",
    paymentTerms: "30 Days Credit",
    proposedCreditLimit: "₹10,00,000",
    status: "Pending Finance Approval",
    level: "L1",
    kamName: "Priya Singh",
    hodName: "Kavita Reddy",
    requestedBy: "Priya Singh",
    requestedDate: "2024-10-20",
    createdDate: "2024-10-20",
    urgency: "high",
    kamNote: "New customer with strong business potential. Requires quick approval for upcoming order.",
  },
  {
    id: "CUST-2024-002",
    type: "Customer Creation",
    customer: "Prime Industries",
    customerName: "Prime Industries",
    registeredAddress: "456 Industrial Area, Pune",
    gstNumber: "27AABCP1234R1ZY",
    panNumber: "AABCP1234R",
    productsToManufacture: "Corrugated Boxes, Die-Cut Packaging",
    businessValuePerMonth: "₹8,00,000",
    paymentTerms: "45 Days Credit",
    proposedCreditLimit: "₹15,00,000",
    status: "Pending D.V.P Approval",
    level: "L2",
    kamName: "Rajat Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajat Kumar",
    requestedDate: "2024-10-26",
    createdDate: "2024-10-26",
    urgency: "urgent",
    kamNote: "Large order pending. Customer has strong credentials and references from existing clients.",
  },
  {
    id: "QUO-2024-045",
    type: "Quotation",
    inquiryId: "INQ-2024-001",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    amount: 245000,
    margin: 12.5,
    validTill: "2024-01-18",
    status: "Sent to HOD",
    level: "L1",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajesh Kumar",
    requestedDate: "2024-01-15",
    createdDate: "2024-01-15",
    urgency: "normal",
    kamNote: "Customer is requesting competitive pricing due to bulk order. Recommend approval for long-term partnership potential.",
  },
  {
    id: "QUO-2024-046",
    type: "Quotation",
    inquiryId: "INQ-2024-002",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    amount: 185000,
    margin: 8.2,
    validTill: "2024-01-20",
    status: "Sent to HOD",
    level: "L2",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    requestedBy: "Priya Sharma",
    requestedDate: "2024-01-14",
    createdDate: "2024-01-14",
    urgency: "high",
    kamNote: "Urgent requirement for upcoming product launch. Client has tight deadline. Please expedite approval process.",
  },
  {
    id: "QUO-2024-050",
    type: "Quotation",
    inquiryId: "INQ-2024-006",
    customer: "Tech Solutions",
    job: "Custom Cartons",
    amount: 150000,
    margin: 7.5,
    validTill: "2024-01-19",
    status: "Sent to HOD",
    level: "L2",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    requestedBy: "Amit Patel",
    requestedDate: "2024-01-16",
    createdDate: "2024-01-16",
    urgency: "urgent",
    kamNote: "Special pricing needed to match competitor quote. This is a strategic account we cannot afford to lose.",
  },
  {
    id: "CC-004",
    type: "Customer Creation",
    customer: "Innovative Packaging Solutions",
    customerName: "Innovative Packaging Solutions",
    registeredAddress: "789 Corporate Park, Bangalore",
    gstNumber: "27AABCI7890R1ZA",
    panNumber: "AABCI7890R",
    productsToManufacture: "Rigid Boxes, Corrugated Packaging",
    businessValuePerMonth: "₹6,50,000",
    paymentTerms: "30 Days Credit",
    proposedCreditLimit: "₹12,00,000",
    status: "Pending Finance Approval",
    level: "L1",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajesh Kumar",
    requestedDate: "2024-10-28",
    createdDate: "2024-10-28",
    urgency: "normal",
    kamNote: "Established company with good market reputation. Requesting standard credit terms.",
  },
  {
    id: "CC-005",
    type: "Customer Creation",
    customer: "Express Logistics Pvt Ltd",
    customerName: "Express Logistics Pvt Ltd",
    registeredAddress: "321 Transport Nagar, Chennai",
    gstNumber: "29AABCE4567R1ZB",
    panNumber: "AABCE4567R",
    productsToManufacture: "Custom Boxes, Shipping Cartons",
    businessValuePerMonth: "₹4,00,000",
    paymentTerms: "45 Days Credit",
    proposedCreditLimit: "₹8,00,000",
    status: "Pending HOD Approval",
    level: "L1",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    requestedBy: "Amit Patel",
    requestedDate: "2024-10-27",
    createdDate: "2024-10-27",
    urgency: "high",
    kamNote: "New logistics company with strong financials. Urgent approval needed for immediate order.",
  },
  {
    id: "CC-007",
    type: "Customer Creation",
    customer: "Rapid Manufacturing Co",
    customerName: "Rapid Manufacturing Co",
    registeredAddress: "654 Industrial Zone, Hyderabad",
    gstNumber: "29AABCR6789R1ZD",
    panNumber: "AABCR6789R",
    productsToManufacture: "Die-Cut Packaging, Labels",
    businessValuePerMonth: "₹9,00,000",
    paymentTerms: "60 Days Credit",
    proposedCreditLimit: "₹18,00,000",
    status: "Pending D.V.P Approval",
    level: "L2",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    requestedBy: "Priya Sharma",
    requestedDate: "2024-10-29",
    createdDate: "2024-10-29",
    urgency: "urgent",
    kamNote: "Large manufacturing company with substantial order pipeline. High credit limit required.",
  },
]

const approvalHistory = [
  {
    id: "QUO-2024-047",
    type: "Quotation",
    inquiryId: "INQ-2024-003",
    customer: "Swift Logistics",
    job: "Corrugated Sheets",
    amount: 320000,
    margin: 15.8,
    validTill: "2024-01-22",
    status: "Approved",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    requestedBy: "Amit Patel",
    requestedDate: "2024-01-12",
    approvedBy: "Suresh Menon",
    approvedDate: "2024-01-13",
    createdDate: "2024-01-13",
    level: "L1",
    urgency: "normal",
    kamNote: "High volume order with good margin. Customer is a long-term partner with excellent payment history.",
    approvalRemark: "Approved. Good margin and reliable customer. Proceed with quotation.",
  },
  {
    id: "QUO-2024-049",
    type: "Quotation",
    inquiryId: "INQ-2024-005",
    customer: "Global Traders",
    job: "Printed Labels",
    amount: 95000,
    margin: 6.5,
    validTill: "2024-01-19",
    status: "Disapproved",
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    requestedBy: "Sneha Gupta",
    requestedDate: "2024-01-10",
    approvedBy: "Kavita Reddy",
    approvedDate: "2024-01-11",
    createdDate: "2024-01-11",
    level: "L2",
    urgency: "high",
    kamNote: "Customer is price-sensitive. Need competitive pricing to win this order against competitors.",
    approvalRemark: "Disapproved. Margin too low for this type of job. Request revised quotation with minimum 10% margin.",
  },
  {
    id: "QUO-2024-048",
    type: "Quotation",
    inquiryId: "INQ-2024-004",
    customer: "Express Packaging Co.",
    job: "Offset Printed Boxes",
    amount: 275000,
    margin: 13.2,
    validTill: "2024-01-21",
    status: "Approved",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajesh Kumar",
    requestedDate: "2024-01-11",
    approvedBy: "Suresh Menon",
    approvedDate: "2024-01-12",
    createdDate: "2024-01-12",
    level: "L1",
    urgency: "urgent",
    kamNote: "Urgent requirement. Customer needs quotation by EOD. Strategic account with potential for repeat orders.",
    approvalRemark: "Approved urgently. Good margin and strategic importance. Fast-track this quotation.",
  },
]

function getMarginColor(margin: number) {
  if (margin >= 15) return "text-green font-bold"
  if (margin >= 10) return "text-blue-80 font-bold"
  return "text-burgundy font-bold"
}

function getMarginBadge(margin: number) {
  if (margin >= 15) return "badge-green-gradient"
  if (margin >= 10) return "bg-blue-10 text-blue border-blue-40"
  return "badge-burgundy-gradient"
}

function getUrgencyBadge(urgency: string) {
  switch (urgency) {
    case "urgent":
      return "badge-burgundy-gradient"
    case "high":
      return "bg-burgundy-10 text-burgundy border-burgundy-40"
    default:
      return "bg-neutral-gray-100 text-neutral-gray-600 border-neutral-gray-300"
  }
}

interface ApprovalsContentProps {
  showHistory?: boolean
}

export function ApprovalsContent({ showHistory = false }: ApprovalsContentProps) {
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const isKAMUser = viewableKams.length === 1 // KAM can only see themselves
  const isHODUser = isHOD() // HOD user check

  const [search, setSearch] = useState("")
  const [hodFilter, setHodFilter] = useState("all")
  const [kamFilter, setKamFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApproval, setSelectedApproval] = useState<(typeof pendingApprovals)[0] | null>(null)
  const [remark, setRemark] = useState("")
  const [page, setPage] = useState(1)
  const [userLevel, setUserLevel] = useState<"L1" | "L2" | null>(null)
  const itemsPerPage = 20

  useEffect(() => {
    // Get user's approval level (HOD = L1, Vertical Head = L2)
    setUserLevel(getApprovalLevel())
  }, [])

  // Filter data based on user role - KAMs can only see their own data
  const userFilteredPending = isRestrictedUser
    ? pendingApprovals.filter(a => a.kamName && viewableKams.includes(a.kamName))
    : pendingApprovals

  const userFilteredHistory = isRestrictedUser
    ? approvalHistory.filter(a => a.kamName && viewableKams.includes(a.kamName))
    : approvalHistory

  // Select data source based on showHistory prop
  const currentData = showHistory ? userFilteredHistory : userFilteredPending

  // Get unique HOD and KAM names for filters
  const hodNames = Array.from(new Set(currentData.map(item => item.hodName).filter((name): name is string => Boolean(name))))
  const kamNames = Array.from(new Set(currentData.map(item => item.kamName).filter((name): name is string => Boolean(name))))

  const filteredApprovals = currentData.filter((approval) => {
    // Filter by approval level - HOD sees L1, Vertical Head sees L2 (only for pending approvals)
    const matchesLevel = showHistory || !userLevel || approval.level === userLevel

    const matchesType = statusFilter === "all" || (approval as any).type === statusFilter

    const matchesSearch =
      approval.customer.toLowerCase().includes(search.toLowerCase()) ||
      approval.id.toLowerCase().includes(search.toLowerCase()) ||
      ((approval as any).job && (approval as any).job.toLowerCase().includes(search.toLowerCase())) ||
      (approval.kamName && approval.kamName.toLowerCase().includes(search.toLowerCase())) ||
      (approval.hodName && approval.hodName.toLowerCase().includes(search.toLowerCase()))

    const matchesHod = hodFilter === "all" || approval.hodName === hodFilter
    const matchesKam = kamFilter === "all" || approval.kamName === kamFilter

    return matchesLevel && matchesType && matchesSearch && matchesHod && matchesKam
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredApprovals.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedApprovals = filteredApprovals.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [search, hodFilter, kamFilter])

  return (
    <div className="space-y-4">
      {/* Search Bar with Mic */}
      <div className="relative w-full flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Find your approvals by ID, customer, or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:truncate"
          />
        </div>
        <Mic
          onClick={() => alert("Voice input feature coming soon")}
          className="h-6 w-6 text-[#005180] cursor-pointer hover:text-[#004875] transition-colors duration-200 flex-shrink-0"
        />
      </div>

      {/* Approvals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#003d63] via-[#005180] to-[#004875] hover:bg-gradient-to-r hover:from-[#003d63] hover:via-[#005180] hover:to-[#004875]">
                {!isKAMUser && (
                  <TableHead className="text-white w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
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
                <TableHead className="text-white w-[140px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center justify-between">
                    <span>Type</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                        <Filter className="h-4 w-4 text-white" />
                      </SelectTrigger>
                      <SelectContent align="start" className="min-w-[180px]">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Quotation">Quotation</SelectItem>
                        <SelectItem value="Customer Creation">Customer Creation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                <TableHead className="text-white w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Quotation/Customer
                </TableHead>
                <TableHead className="text-white w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="text-white w-[240px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Details
                </TableHead>
                <TableHead className="text-white w-[120px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-white w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApprovals.map((approval, index) => (
                    <Dialog key={approval.id}>
                      <TableRow
                        className="cursor-pointer border-b border-border/40 bg-white transition-all duration-200 even:bg-[#B92221]/5 hover:bg-[#78BE20]/20 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {!isKAMUser && (
                          <DialogTrigger asChild>
                            <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                              <p className="text-sm font-medium text-foreground">{approval.kamName || "N/A"}</p>
                            </TableCell>
                          </DialogTrigger>
                        )}
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <Badge variant="outline" className="font-semibold">
                              {(approval as any).type || "Quotation"}
                            </Badge>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <div className="leading-[1.15]">
                              <p className="text-sm font-semibold text-primary">{approval.id}</p>
                              {approval.inquiryId && (
                                <p className="text-xs text-muted-foreground">Inquiry {approval.inquiryId}</p>
                              )}
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <div className="leading-[1.15]">
                              <TruncatedText text={approval.customer} limit={25} className="text-sm font-medium text-foreground block" />
                              <p className="text-xs text-muted-foreground">Created {approval.createdDate}</p>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            {approval.type === "Customer Creation" ? (
                              <div className="leading-[1.15]">
                                <p className="text-sm font-semibold text-foreground">
                                  {(approval as any).productsToManufacture || "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Credit: {(approval as any).proposedCreditLimit || "N/A"}
                                </p>
                              </div>
                            ) : (
                              <div className="leading-[1.15]">
                                <TruncatedText text={(approval as any).job || "N/A"} limit={30} className="text-sm font-semibold text-foreground" />
                                {(approval as any).validTill && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Valid till {(approval as any).validTill}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <Badge variant="outline">{approval.status}</Badge>
                          </TableCell>
                        </DialogTrigger>
                        <TableCell>
                          {!showHistory ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Disapproving ${approval.id}`)
                                }}
                                className="text-xs bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 hover:text-rose-700 hover:scale-110 active:scale-95 transition-all duration-200"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Disapprove
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Approving ${approval.id}`)
                                }}
                                className="text-xs bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all duration-200"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedApproval(approval)
                                }}
                                className="text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                          )}
                        </TableCell>
                      </TableRow>
                      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle>Approval Details</DialogTitle>
                          <DialogDescription>{selectedApproval?.id}</DialogDescription>
                        </DialogHeader>
                        {selectedApproval && (
                          <div className="space-y-4 overflow-y-auto overflow-x-hidden flex-1">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground">Customer</Label>
                                <p className="mt-1 font-medium">{selectedApproval.customer}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Job Name</Label>
                                <p className="mt-1 font-medium">{selectedApproval.job}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Requested By</Label>
                                <p className="mt-1">{selectedApproval.requestedBy}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Requested Date</Label>
                                <p className="mt-1">{selectedApproval.requestedDate}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Approval Level</Label>
                                <div className="mt-1">
                                  <Badge variant="outline">{selectedApproval.level}</Badge>
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Valid Till</Label>
                                <p className="mt-1">{selectedApproval.validTill}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Urgency</Label>
                                <div className="mt-1">
                                  <Badge className={`${getUrgencyBadge(selectedApproval.urgency)} border`}>
                                    {selectedApproval.urgency}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {selectedApproval.kamNote && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                                <Label className="text-sm font-semibold text-blue-900">
                                  Note from {selectedApproval.requestedBy}
                                </Label>
                                <p className="mt-2 text-sm text-blue-800 leading-relaxed">
                                  {selectedApproval.kamNote}
                                </p>
                              </div>
                            )}

                            {showHistory ? (
                              // History view - show approval/disapproval details
                              <div className="space-y-4">
                                <div className={`rounded-lg border p-4 ${
                                  selectedApproval.status === "Approved"
                                    ? "border-emerald-200 bg-emerald-50/50"
                                    : "border-rose-200 bg-rose-50/50"
                                }`}>
                                  <div className="flex items-center gap-2 mb-3">
                                    {selectedApproval.status === "Approved" ? (
                                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-rose-600" />
                                    )}
                                    <Label className={`text-sm font-semibold ${
                                      selectedApproval.status === "Approved"
                                        ? "text-emerald-900"
                                        : "text-rose-900"
                                    }`}>
                                      {selectedApproval.status} by {(selectedApproval as any).approvedBy}
                                    </Label>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 mb-3">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Action Date</Label>
                                      <p className={`text-sm font-medium ${
                                        selectedApproval.status === "Approved"
                                          ? "text-emerald-800"
                                          : "text-rose-800"
                                      }`}>
                                        {(selectedApproval as any).approvedDate}
                                      </p>
                                    </div>
                                  </div>
                                  {(selectedApproval as any).approvalRemark && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Remark</Label>
                                      <p className={`mt-1 text-sm leading-relaxed ${
                                        selectedApproval.status === "Approved"
                                          ? "text-emerald-800"
                                          : "text-rose-800"
                                      }`}>
                                        {(selectedApproval as any).approvalRemark}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Pending view - show action buttons
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="remark" className="text-sm font-medium">
                                    Remark <span className="text-muted-foreground">(Optional)</span>
                                  </Label>
                                  <Textarea
                                    id="remark"
                                    placeholder="Add your remarks or comments here..."
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    className="min-h-[100px] resize-none"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    This remark will be attached to your approval/disapproval action
                                  </p>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    className="bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 hover:text-rose-700"
                                    onClick={() => {
                                      alert(`Disapproving ${selectedApproval.id}${remark ? `\nRemark: ${remark}` : ''}`)
                                      setRemark("")
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Disapprove
                                  </Button>
                                  <Button
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    onClick={() => {
                                      alert(`Approving ${selectedApproval.id}${remark ? `\nRemark: ${remark}` : ''}`)
                                      setRemark("")
                                    }}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="h-8 px-3"
              >
                Previous
              </Button>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 ${page === pageNum ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
              <div className="md:hidden text-sm text-muted-foreground">
                {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
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
