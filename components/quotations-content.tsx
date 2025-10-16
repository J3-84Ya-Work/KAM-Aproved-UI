"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, ArrowUpCircle, Share2, Eye, Calendar, ArrowUpDown, Download, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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

function getStatusColor(status: string) {
  switch (status) {
    case "Approved":
      return "badge-green-gradient"
    case "Quoted":
      return "bg-blue-10 text-blue border-blue-40"
    case "Sent to HOD":
      return "bg-burgundy-10 text-burgundy border-burgundy-40"
    case "Sent to Customer":
      return "badge-blue-gradient"
    case "Rejected":
      return "bg-neutral-gray-100 text-neutral-gray-600 border-neutral-gray-300"
    default:
      return "outline"
  }
}

export function QuotationsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedQuotation, setSelectedQuotation] = useState<(typeof quotations)[0] | null>(null)

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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations (ID, Customer, Job Name, Inquiry ID, Amount)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Quoted">Quoted</SelectItem>
            <SelectItem value="Sent to HOD">Sent to HOD</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Sent to Customer">Sent</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotations Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#005180] hover:bg-[#005180]">
                  <TableHead className="text-white w-[150px]">
                    <div className="font-semibold">ID</div>
                  </TableHead>
                  <TableHead className="text-white w-[180px]">
                    <div className="font-semibold">Customer</div>
                  </TableHead>
                  <TableHead className="text-white w-[250px]">
                    <div className="font-semibold">Job Name</div>
                  </TableHead>
                  <TableHead className="text-white w-[160px]">
                    <div className="font-semibold">Status</div>
                  </TableHead>
                  <TableHead className="text-white w-[200px]">
                    <div className="font-semibold">Actions</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation, index) => (
                  <Dialog key={quotation.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className="animate-scale-in hover:bg-blue-50 cursor-pointer transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => setSelectedQuotation(quotation)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-12 rounded-full bg-blue" />
                            <div>
                              <p className="font-bold text-sm text-blue">{quotation.id}</p>
                              <p className="text-xs text-muted-foreground">{quotation.inquiryId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{quotation.customer}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{quotation.job}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>Valid till: {quotation.validTill}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={`${getStatusColor(quotation.status)} border`}>
                              {quotation.status}
                            </Badge>
                            {quotation.status === "Quoted" && (
                              <p className="text-xs text-muted-foreground">{quotation.approvalLevel}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {quotation.status === "Quoted" && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Sending ${quotation.id} to HOD`)
                                }}
                                className="h-9 w-9 p-0 flex items-center justify-center"
                                title="Send to HOD"
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
                                className="h-9 w-9 p-0 flex items-center justify-center"
                                title="Share with Customer"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Quotation Details</DialogTitle>
                            <DialogDescription>{selectedQuotation?.id}</DialogDescription>
                          </DialogHeader>
                          {selectedQuotation && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Customer</Label>
                                  <p className="mt-1 font-medium">{selectedQuotation.customer}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Status</Label>
                                  <div className="mt-1">
                                    <Badge className={`${getStatusColor(selectedQuotation.status)} border`}>
                                      {selectedQuotation.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Job Name</Label>
                                  <p className="mt-1 font-medium">{selectedQuotation.job}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Inquiry ID</Label>
                                  <p className="mt-1 font-medium">{selectedQuotation.inquiryId}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Amount</Label>
                                  <p className="mt-1 text-lg font-semibold">
                                    ₹{selectedQuotation.amount.toLocaleString("en-IN")}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Margin</Label>
                                  <div className="mt-1">
                                    <Badge className={`${getMarginBadge(selectedQuotation.margin)} border text-lg px-3 py-1`}>
                                      <span className={`${getMarginColor(selectedQuotation.margin)} font-bold`}>
                                        {selectedQuotation.margin}%
                                      </span>
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Level</Label>
                                  <p className="mt-1 font-medium">{selectedQuotation.approvalLevel}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Created</Label>
                                  <p className="mt-1">{selectedQuotation.createdDate}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Valid Till</Label>
                                  <p className="mt-1 font-medium">{selectedQuotation.validTill}</p>
                                </div>
                              </div>
                              {selectedQuotation.history && selectedQuotation.history.length > 0 && (
                                <div>
                                  <Label className="text-muted-foreground">Journey</Label>
                                  <div className="mt-2 pl-3 border-l border-muted space-y-3">
                                    {selectedQuotation.history.map((step, stepIndex) => {
                                      const isCurrent =
                                        stepIndex === selectedQuotation.history.length - 1 &&
                                        step.stage === selectedQuotation.status
                                      return (
                                        <div key={`${selectedQuotation.id}-step-${stepIndex}`} className="flex items-start gap-3">
                                          <span
                                            className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                                              isCurrent ? "bg-blue" : "bg-muted-foreground/50"
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
                              )}
                              <div>
                                <Label className="text-muted-foreground">Notes</Label>
                                <p className="mt-1">{selectedQuotation.notes}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            {selectedQuotation?.status === "Quoted" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                title="Send to HOD"
                              >
                                <ArrowUpCircle className="h-5 w-5" />
                              </Button>
                            )}
                            {selectedQuotation?.status === "Approved" && (
                              <Button size="icon" className="h-10 w-10" title="Share with Customer">
                                <Share2 className="h-5 w-5" />
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
      </Card>
    </div>
  )
}
