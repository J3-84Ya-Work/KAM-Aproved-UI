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
    status: "Pending Approval",
    approvalLevel: "L1",
    createdDate: "2024-01-15",
    notes: "Standard pricing applied",
  },
  {
    id: "QUO-2024-046",
    inquiryId: "INQ-2024-002",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    amount: 185000,
    margin: 8.2,
    validTill: "2024-01-20",
    status: "Pending Approval",
    approvalLevel: "L2",
    createdDate: "2024-01-14",
    notes: "Low margin - requires L2 approval",
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
    case "Sent to Customer":
      return "badge-blue-gradient"
    case "Pending Approval":
      return "bg-burgundy-10 text-burgundy border-burgundy-40"
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
            <SelectItem value="Pending Approval">Pending</SelectItem>
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
                            {quotation.status === "Pending Approval" && (
                              <p className="text-xs text-muted-foreground">{quotation.approvalLevel}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {quotation.status === "Pending Approval" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Sending ${quotation.id} for approval`)
                                }}
                                className="text-xs"
                              >
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                                Send for Approval
                              </Button>
                            )}
                            {quotation.status === "Approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  alert(`Sharing ${quotation.id} with customer`)
                                }}
                                className="text-xs"
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
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
                              <div>
                                <Label className="text-muted-foreground">Notes</Label>
                                <p className="mt-1">{selectedQuotation.notes}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            {selectedQuotation?.status === "Pending Approval" && (
                              <>
                                <Button variant="outline">
                                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                                  Forward
                                </Button>
                                <Button>Approve</Button>
                              </>
                            )}
                            {selectedQuotation?.status === "Approved" && (
                              <Button>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
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
