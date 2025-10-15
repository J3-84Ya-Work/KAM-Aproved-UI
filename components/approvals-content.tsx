"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Clock, AlertTriangle, Search, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const pendingApprovals = [
  {
    id: "QUO-2024-045",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    amount: 245000,
    margin: 12.5,
    validTill: "3 days",
    level: "L1",
    requestedBy: "John Doe",
    requestedDate: "2024-01-15",
    urgency: "normal",
  },
  {
    id: "QUO-2024-046",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    amount: 185000,
    margin: 8.2,
    validTill: "5 days",
    level: "L2",
    requestedBy: "Jane Smith",
    requestedDate: "2024-01-14",
    urgency: "high",
  },
  {
    id: "QUO-2024-050",
    customer: "Tech Solutions",
    job: "Custom Cartons",
    amount: 150000,
    margin: 7.5,
    validTill: "2 days",
    level: "L2",
    requestedBy: "Mike Johnson",
    requestedDate: "2024-01-16",
    urgency: "urgent",
  },
]

const approvalHistory = [
  {
    id: "QUO-2024-047",
    customer: "Swift Logistics",
    job: "Corrugated Sheets",
    amount: 320000,
    margin: 15.8,
    status: "Approved",
    approvedBy: "Senior Manager",
    approvedDate: "2024-01-13",
    level: "L1",
  },
  {
    id: "QUO-2024-049",
    customer: "Global Traders",
    job: "Printed Labels",
    amount: 95000,
    margin: 6.5,
    status: "Rejected",
    approvedBy: "Director",
    approvedDate: "2024-01-11",
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
  const [pendingSearch, setPendingSearch] = useState("")
  const [historySearch, setHistorySearch] = useState("")
  const [selectedApproval, setSelectedApproval] = useState<(typeof pendingApprovals)[0] | null>(null)
  const [selectedHistory, setSelectedHistory] = useState<(typeof approvalHistory)[0] | null>(null)

  const filteredPending = pendingApprovals.filter((approval) => {
    const matchesSearch =
      approval.customer.toLowerCase().includes(pendingSearch.toLowerCase()) ||
      approval.id.toLowerCase().includes(pendingSearch.toLowerCase()) ||
      approval.job.toLowerCase().includes(pendingSearch.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(pendingSearch.toLowerCase())
    return matchesSearch
  })

  const filteredHistory = approvalHistory.filter((item) => {
    const matchesSearch =
      item.customer.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.id.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.job.toLowerCase().includes(historySearch.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {pendingApprovals.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pending approvals (ID, Customer, Job Name, Requested By)..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Pending Approvals Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#005180] hover:bg-[#005180]">
                    <TableHead className="text-white w-[180px]">
                      <div className="font-semibold">ID / Customer</div>
                    </TableHead>
                    <TableHead className="text-white w-[200px]">
                      <div className="font-semibold">Job Name</div>
                    </TableHead>
                    <TableHead className="text-white w-[140px]">
                      <div className="font-semibold">Amount / Margin</div>
                    </TableHead>
                    <TableHead className="text-white w-[160px]">
                      <div className="font-semibold">Requested By</div>
                    </TableHead>
                    <TableHead className="text-white w-[120px]">
                      <div className="font-semibold">Urgency / Level</div>
                    </TableHead>
                    <TableHead className="text-white w-[100px]">
                      <div className="font-semibold">Valid Till</div>
                    </TableHead>
                    <TableHead className="text-white w-[180px]">
                      <div className="font-semibold">Actions</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPending.map((approval) => (
                    <Dialog key={approval.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)}>
                            <div>
                              <p className="font-semibold text-sm">{approval.id}</p>
                              <p className="text-xs text-muted-foreground">{approval.customer}</p>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)}>
                            <p className="font-medium">{approval.job}</p>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)}>
                            <div>
                              <p className="font-bold">₹{(approval.amount / 100000).toFixed(2)}L</p>
                              <Badge className={`${getMarginBadge(approval.margin)} border mt-1`}>
                                <span className={getMarginColor(approval.margin)}>{approval.margin}%</span>
                              </Badge>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)}>
                            <div>
                              <p className="text-sm">{approval.requestedBy}</p>
                              <p className="text-xs text-muted-foreground">{approval.requestedDate}</p>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)}>
                            <div className="space-y-1">
                              <Badge className={`${getUrgencyBadge(approval.urgency)} border`}>
                                {approval.urgency}
                              </Badge>
                              <Badge variant="outline" className="block w-fit">{approval.level}</Badge>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedApproval(approval)}>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>{approval.validTill}</span>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(`Rejecting ${approval.id}`)
                              }}
                              className="text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(`Approving ${approval.id}`)
                              }}
                              className="text-xs"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Approval Details</DialogTitle>
                          <DialogDescription>{selectedApproval?.id}</DialogDescription>
                        </DialogHeader>
                        {selectedApproval && (
                          <div className="space-y-4">
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
                              <Button variant="outline">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                              <Button>
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
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search approval history (ID, Customer, Job Name)..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Approval History Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#005180] hover:bg-[#005180]">
                    <TableHead className="text-white w-[180px]">
                      <div className="font-semibold">ID / Customer</div>
                    </TableHead>
                    <TableHead className="text-white w-[200px]">
                      <div className="font-semibold">Job Name</div>
                    </TableHead>
                    <TableHead className="text-white w-[140px]">
                      <div className="font-semibold">Amount / Margin</div>
                    </TableHead>
                    <TableHead className="text-white w-[160px]">
                      <div className="font-semibold">Approved By</div>
                    </TableHead>
                    <TableHead className="text-white w-[120px]">
                      <div className="font-semibold">Status / Level</div>
                    </TableHead>
                    <TableHead className="text-white w-[80px]">
                      <div className="font-semibold">Actions</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => (
                    <Dialog key={item.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedHistory(item)}>
                            <div>
                              <p className="font-semibold text-sm">{item.id}</p>
                              <p className="text-xs text-muted-foreground">{item.customer}</p>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedHistory(item)}>
                            <p className="font-medium">{item.job}</p>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedHistory(item)}>
                            <div>
                              <p className="font-bold">₹{(item.amount / 100000).toFixed(2)}L</p>
                              <Badge className={`${getMarginBadge(item.margin)} border mt-1`}>
                                <span className={getMarginColor(item.margin)}>{item.margin}%</span>
                              </Badge>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedHistory(item)}>
                            <div>
                              <p className="text-sm">{item.approvedBy}</p>
                              <p className="text-xs text-muted-foreground">{item.approvedDate}</p>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <TableCell onClick={() => setSelectedHistory(item)}>
                            <div className="space-y-1">
                              {item.status === "Approved" ? (
                                <Badge className="badge-green-gradient border gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approved
                                </Badge>
                              ) : (
                                <Badge className="badge-burgundy-gradient border gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Rejected
                                </Badge>
                              )}
                              <Badge variant="outline" className="block w-fit">{item.level}</Badge>
                            </div>
                          </TableCell>
                        </DialogTrigger>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedHistory(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Approval History Details</DialogTitle>
                          <DialogDescription>{selectedHistory?.id}</DialogDescription>
                        </DialogHeader>
                        {selectedHistory && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground">Customer</Label>
                                <p className="mt-1 font-medium">{selectedHistory.customer}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Job Name</Label>
                                <p className="mt-1 font-medium">{selectedHistory.job}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Amount</Label>
                                <p className="mt-1 text-xl font-bold">₹{selectedHistory.amount.toLocaleString("en-IN")}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Margin</Label>
                                <div className="mt-1">
                                  <Badge className={`${getMarginBadge(selectedHistory.margin)} border`}>
                                    <span className={getMarginColor(selectedHistory.margin)}>{selectedHistory.margin}%</span>
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Status</Label>
                                <div className="mt-1">
                                  {selectedHistory.status === "Approved" ? (
                                    <Badge className="badge-green-gradient border gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Approved
                                    </Badge>
                                  ) : (
                                    <Badge className="badge-burgundy-gradient border gap-1">
                                      <XCircle className="h-3 w-3" />
                                      Rejected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Approval Level</Label>
                                <div className="mt-1">
                                  <Badge variant="outline">{selectedHistory.level}</Badge>
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Approved By</Label>
                                <p className="mt-1">{selectedHistory.approvedBy}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Approved Date</Label>
                                <p className="mt-1">{selectedHistory.approvedDate}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
