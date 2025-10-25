"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock, AlertTriangle, Search, Eye, RefreshCw, Filter, Calendar } from "lucide-react"
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
    id: "QUO-2024-045",
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
    level: "L2",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    requestedBy: "Priya Sharma",
    requestedDate: "2024-01-14",
    createdDate: "2024-01-14",
    urgency: "high",
  },
  {
    id: "QUO-2024-050",
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
  },
]

const approvalHistory = [
  {
    id: "QUO-2024-047",
    inquiryId: "INQ-2024-003",
    customer: "Swift Logistics",
    job: "Corrugated Sheets",
    amount: 320000,
    margin: 15.8,
    validTill: "2024-01-22",
    status: "Approved",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    approvedBy: "Senior Manager",
    approvedDate: "2024-01-13",
    createdDate: "2024-01-13",
    level: "L1",
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
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    approvedBy: "Director",
    approvedDate: "2024-01-11",
    createdDate: "2024-01-11",
    level: "L2",
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

export function ApprovalsContent() {
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const isKAMUser = viewableKams.length === 1 // KAM can only see themselves
  const isHODUser = isHOD() // HOD user check

  const [search, setSearch] = useState("")
  const [hodFilter, setHodFilter] = useState("all")
  const [kamFilter, setKamFilter] = useState("all")
  const [selectedApproval, setSelectedApproval] = useState<(typeof pendingApprovals)[0] | null>(null)
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

  // Get unique HOD and KAM names for filters
  const hodNames = Array.from(new Set(userFilteredPending.map(item => item.hodName).filter((name): name is string => Boolean(name))))
  const kamNames = Array.from(new Set(userFilteredPending.map(item => item.kamName).filter((name): name is string => Boolean(name))))

  const filteredApprovals = userFilteredPending.filter((approval) => {
    // Filter by approval level - HOD sees L1, Vertical Head sees L2
    const matchesLevel = !userLevel || approval.level === userLevel

    const matchesSearch =
      approval.customer.toLowerCase().includes(search.toLowerCase()) ||
      approval.id.toLowerCase().includes(search.toLowerCase()) ||
      approval.job.toLowerCase().includes(search.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
      (approval.kamName && approval.kamName.toLowerCase().includes(search.toLowerCase())) ||
      (approval.hodName && approval.hodName.toLowerCase().includes(search.toLowerCase()))

    const matchesHod = hodFilter === "all" || approval.hodName === hodFilter
    const matchesKam = kamFilter === "all" || approval.kamName === kamFilter

    return matchesLevel && matchesSearch && matchesHod && matchesKam
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
      {/* Search Bar with Refresh Button */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search approvals (ID, Customer, Job Name, HOD, KAM Name)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-12 rounded-2xl border-2 border-border/50 bg-white/80 backdrop-blur-sm focus-visible:border-[#005180] focus-visible:ring-[#005180] text-sm shadow-sm transition-all"
          />
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="h-12 px-4 rounded-2xl bg-[#005180] hover:bg-[#004875] text-white shadow-lg transition-all"
          title="Refresh page"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Approvals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#003d63] via-[#005180] to-[#004875] hover:bg-gradient-to-r hover:from-[#003d63] hover:via-[#005180] hover:to-[#004875]">
                {!isKAMUser && !isHODUser && (
                  <TableHead className="text-white w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
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
                <TableHead className="text-white w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  ID / Inquiry
                </TableHead>
                <TableHead className="text-white w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="text-white w-[240px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Job & Validity
                </TableHead>
                <TableHead className="text-white w-[140px] px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Amount / Margin
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
              {paginatedApprovals.map((approval) => (
                    <Dialog key={approval.id}>
                      <TableRow className="cursor-pointer border-b border-border/40 bg-white transition-colors even:bg-[#005180]/8 hover:bg-[#78BE20]/15">
                        {!isKAMUser && !isHODUser && (
                          <DialogTrigger asChild>
                            <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                              <p className="text-sm font-medium text-foreground">{approval.hodName || "N/A"}</p>
                            </TableCell>
                          </DialogTrigger>
                        )}
                        {!isKAMUser && (
                          <DialogTrigger asChild>
                            <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                              <p className="text-sm font-medium text-foreground">{approval.kamName || "N/A"}</p>
                            </TableCell>
                          </DialogTrigger>
                        )}
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-primary">{approval.id}</p>
                              <p className="text-xs text-muted-foreground">Inquiry {approval.inquiryId}</p>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <TruncatedText text={approval.customer} limit={25} className="text-sm font-medium text-foreground block" />
                            <p className="text-xs text-muted-foreground">Created {approval.createdDate}</p>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <div className="space-y-0.5">
                              <TruncatedText text={approval.job} limit={30} className="text-sm font-semibold text-foreground" />
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Valid till {approval.validTill}</span>
                              </div>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <div>
                              <p className="font-bold text-sm">₹{(approval.amount / 100000).toFixed(2)}L</p>
                              <Badge className={`${getMarginBadge(approval.margin)} border mt-1`}>
                                <span className={getMarginColor(approval.margin)}>{approval.margin}%</span>
                              </Badge>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)} className="py-4">
                            <Badge variant="outline">{approval.status}</Badge>
                          </TableCell>
                        </DialogTrigger>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(`Disapproving ${approval.id}`)
                              }}
                              className="text-xs bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 hover:text-rose-700"
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
                              className="text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </div>
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
                                <Label className="text-muted-foreground">Amount</Label>
                                <p className="mt-1 text-xl font-bold">₹{selectedApproval.amount.toLocaleString("en-IN")}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Margin</Label>
                                <div className="mt-1">
                                  <Badge className={`${getMarginBadge(selectedApproval.margin)} border`}>
                                    <span className={getMarginColor(selectedApproval.margin)}>{selectedApproval.margin}%</span>
                                  </Badge>
                                </div>
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

                            {selectedApproval.margin < 10 && (
                              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <div className="text-sm">
                                  <p className="font-medium text-destructive">Low Margin Warning</p>
                                  <p className="text-muted-foreground">
                                    Margin below 10% - requires {selectedApproval.level} approval
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" className="bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 hover:text-rose-700">
                                <XCircle className="mr-2 h-4 w-4" />
                                Disapprove
                              </Button>
                              <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                            </div>
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
