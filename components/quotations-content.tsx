"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, SlidersHorizontal, ArrowUpCircle, Share2, Calendar, RefreshCw } from "lucide-react"
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
    approvalLevel: "L1",
    createdDate: "2024-01-15",
    notes: "Standard pricing applied",
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
    approvalLevel: "L2",
    createdDate: "2024-01-14",
    notes: "Low margin - requires L2 approval",
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
    approvalLevel: "L1",
    createdDate: "2024-01-13",
    notes: "Good margin - approved",
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
    approvalLevel: "L1",
    createdDate: "2024-01-12",
    notes: "Premium pricing - customer accepted",
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
    status: "Rejected",
    approvalLevel: "L2",
    createdDate: "2024-01-11",
    notes: "Margin too low - rejected by L2",
    history: [
      { stage: "Inquiry Received", date: "2024-01-05" },
      { stage: "Quotation Drafted", date: "2024-01-07" },
      { stage: "Sent to HOD", date: "2024-01-08" },
      { stage: "Rejected", date: "2024-01-09" },
    ],
  },
]

const STATUS_BADGES: Record<string, string> = {
  Quoted: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  Approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  "Sent to HOD": "bg-amber-400/20 text-amber-700 border-amber-400/30",
  "Sent to Customer": "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
  Rejected: "bg-rose-500/15 text-rose-700 border-rose-500/30",
}

const STATUS_ACCENTS: Record<string, string> = {
  Quoted: "bg-blue-500",
  Approved: "bg-emerald-500",
  "Sent to HOD": "bg-amber-500",
  "Sent to Customer": "bg-cyan-500",
  Rejected: "bg-rose-500",
}

function getStatusBadge(status: string) {
  return STATUS_BADGES[status] ?? "bg-slate-200 text-slate-600 border-slate-300"
}

function getStatusAccent(status: string) {
  return STATUS_ACCENTS[status] ?? "bg-slate-300"
}

function getMarginColor(margin: number) {
  if (margin >= 15) return "text-emerald-600"
  if (margin >= 10) return "text-blue-600"
  return "text-rose-600"
}

function getMarginBadge(margin: number) {
  if (margin >= 15) return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
  if (margin >= 10) return "bg-blue-500/15 text-blue-700 border-blue-500/30"
  return "bg-rose-500/15 text-rose-700 border-rose-500/30"
}

export function QuotationsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedQuotation, setSelectedQuotation] = useState<(typeof quotations)[0] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredQuotations = quotations
    .filter((quotation) => {
      const matchesSearch =
        quotation.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.inquiryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.amount.toString().includes(searchQuery)
      const matchesStatus = statusFilter === "all" || quotation.status === statusFilter

      return matchesSearch && matchesStatus
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
  }, [searchQuery, statusFilter, sortBy])

  const handleOpenQuotation = (quotation: (typeof quotations)[0]) => {
    setSelectedQuotation(quotation)
  }

  return (
    <div className="section-spacing">
      <div className="relative w-full flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotations, customers, jobs, or inquiry IDs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40"
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

      <Card className="surface-elevated overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#005180] to-[#003d63] hover:bg-gradient-to-r hover:from-[#005180] hover:to-[#003d63]">
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
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                  <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuotations.map((quotation, index) => (
                  <Dialog key={quotation.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className="group cursor-pointer border-b border-border/40 bg-white transition-colors even:bg-[#005180]/8 hover:bg-[#78BE20]/15"
                        style={{ animationDelay: `${index * 25}ms` }}
                        onClick={() => handleOpenQuotation(quotation)}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-1 rounded-full ${getStatusAccent(quotation.status)}`} />
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-primary">{quotation.id}</p>
                              <p className="text-xs text-muted-foreground">Inquiry {quotation.inquiryId}</p>
                            </div>
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
                        <TableCell className="py-4">
                          <div className="flex gap-2">
                            {quotation.status === "Quoted" && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Sending ${quotation.id} to HOD`)
                                }}
                                className="h-9 w-9 rounded-xl border-border/70 bg-white/80 text-primary hover:bg-primary/10"
                              >
                                <ArrowUpCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {quotation.status === "Approved" && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Sharing ${quotation.id} with customer`)
                                }}
                                className="h-9 w-9 rounded-xl border-border/70 bg-white/80 text-primary hover:bg-primary/10"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="surface-elevated max-w-2xl p-0">
                      <DialogHeader className="border-b border-border/60 bg-primary/10 px-6 py-5">
                        <DialogTitle className="text-lg font-semibold text-foreground">{selectedQuotation?.job}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">{selectedQuotation?.id}</DialogDescription>
                      </DialogHeader>
                      {selectedQuotation && (
                        <div className="space-y-5 px-6 py-6">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Customer</Label>
                              <p className="mt-1 text-sm font-medium text-foreground">{selectedQuotation.customer}</p>
                            </div>
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</Label>
                              <div className="mt-1">
                                <Badge className={`${getStatusBadge(selectedQuotation.status)} border`}>
                                  {selectedQuotation.status}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approval Level</Label>
                              <p className="mt-1 text-sm text-foreground/80">{selectedQuotation.approvalLevel}</p>
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Inquiry</Label>
                              <p className="mt-1 text-sm text-foreground/80">{selectedQuotation.inquiryId}</p>
                            </div>
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Valid Till</Label>
                              <p className="mt-1 text-sm text-foreground/80">{selectedQuotation.validTill}</p>
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</Label>
                              <p className="mt-1 text-lg font-semibold text-foreground">
                                ₹{selectedQuotation.amount.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Margin</Label>
                              <div className="mt-1">
                                <Badge className={`${getMarginBadge(selectedQuotation.margin)} border px-3 py-1 text-sm font-semibold`}>
                                  <span className={getMarginColor(selectedQuotation.margin)}>
                                    {selectedQuotation.margin}%
                                  </span>
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</Label>
                              <p className="mt-1 text-sm text-foreground/80">{selectedQuotation.createdDate}</p>
                            </div>
                          </div>
                          {selectedQuotation.history?.length ? (
                            <div>
                              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Journey</Label>
                              <div className="mt-2 space-y-3 border-l border-border/60 pl-4">
                                {selectedQuotation.history.map((step, stepIndex) => {
                                  const isCurrent =
                                    stepIndex === selectedQuotation.history.length - 1 &&
                                    step.stage === selectedQuotation.status
                                  return (
                                    <div key={`${selectedQuotation.id}-step-${step.stage}`} className="flex items-start gap-3">
                                      <span
                                        className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                                          isCurrent ? getStatusAccent(selectedQuotation.status) : "bg-muted-foreground/50"
                                        }`}
                                      />
                                      <div>
                                        <p className="text-sm font-semibold text-foreground">{step.stage}</p>
                                        <p className="text-xs text-muted-foreground">{step.date}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ) : null}
                          <div>
                            <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</Label>
                            <TruncatedText text={selectedQuotation.notes} limit={200} className="mt-1 text-sm leading-relaxed text-foreground/80 block" />
                          </div>
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
