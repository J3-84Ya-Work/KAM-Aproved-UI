"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Clock, CheckCircle2, XCircle, ArrowLeft, Search, Mic } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useVoiceInput } from "@/hooks/use-voice-input"

// Mock data for customer creation history
const customerCreationHistory = [
  {
    id: "CC-001",
    customerName: "Acme Corp",
    kamName: "Nilesh Barsate",
    submittedDate: "2024-10-15",
    status: "Approved",
    preparedBy: "Nilesh Barsate",
    checkedBy: "Rahul Sharma",
    approvedBy: "Priya Mehta",
    finalApproval: "Rajesh Kumar",
  },
  {
    id: "CC-002",
    customerName: "Tech Solutions Ltd",
    kamName: "Priya Singh",
    submittedDate: "2024-10-20",
    status: "Pending",
    preparedBy: "Priya Singh",
    checkedBy: "Pending",
    approvedBy: "Pending",
    finalApproval: "Pending",
  },
  {
    id: "CC-003",
    customerName: "Global Packaging Inc",
    kamName: "Amit Verma",
    submittedDate: "2024-10-22",
    status: "Rejected",
    preparedBy: "Amit Verma",
    checkedBy: "Rahul Sharma",
    approvedBy: "Rejected",
    finalApproval: "Not Required",
  },
  {
    id: "CC-004",
    customerName: "Metro Supplies Co",
    kamName: "Sneha Gupta",
    submittedDate: "2024-10-25",
    status: "Approved",
    preparedBy: "Sneha Gupta",
    checkedBy: "Rahul Sharma",
    approvedBy: "Priya Mehta",
    finalApproval: "Rajesh Kumar",
  },
  {
    id: "CC-005",
    customerName: "Prime Industries",
    kamName: "Rajat Kumar",
    submittedDate: "2024-10-26",
    status: "Pending",
    preparedBy: "Rajat Kumar",
    checkedBy: "Rahul Sharma",
    approvedBy: "Pending",
    finalApproval: "Pending",
  },
]

export default function CustomerHistoryPage() {
  const router = useRouter()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kamFilter, setKamFilter] = useState("all")

  // Voice input hook
  const { isListening, transcript, startListening, resetTranscript } = useVoiceInput()

  // Update search query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  const handleExport = () => {
    alert("Export history as CSV/Excel")
  }

  const handleBack = () => {
    router.push("/clients")
  }

  const actions = [
    { label: "Export", onClick: handleExport },
  ]

  // Get unique KAM names for filter
  const uniqueKAMs = Array.from(new Set(customerCreationHistory.map((record) => record.kamName).filter(Boolean)))

  // Filter logic - exclude approved customers (they show in customer table)
  const filteredHistory = customerCreationHistory.filter((record) => {
    // Don't show approved customers in the queue
    if (record.status === "Approved") return false

    const matchesSearch =
      record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.kamName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesKAM = kamFilter === "all" || record.kamName === kamFilter

    return matchesSearch && matchesStatus && matchesKAM
  })

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Customer Creation Queue" showBackButton={true} onBackClick={handleBack} onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 overflow-auto">
          {/* Search Bar */}
          <div className="relative w-full flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Request ID, Customer Name, or KAM Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
            <Mic
              onClick={isListening ? undefined : startListening}
              className={`h-6 w-6 cursor-pointer transition-colors duration-200 flex-shrink-0 ${
                isListening
                  ? "text-[#B92221] animate-pulse"
                  : "text-[#005180] hover:text-[#004875]"
              }`}
            />
          </div>

          {/* History Table */}
          <Card className="surface-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#005180] to-[#005180]/90 hover:from-[#005180] hover:to-[#005180]/90">
                  <TableHead className="font-bold text-white text-sm">Request ID</TableHead>
                  <TableHead className="font-bold text-white text-sm">Customer Name</TableHead>
                  <TableHead className="font-bold text-white text-sm">
                    <div className="flex items-center gap-2">
                      <span>KAM Name</span>
                      <Select value={kamFilter} onValueChange={setKamFilter}>
                        <SelectTrigger className="h-8 w-[140px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <SelectValue placeholder="All KAMs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All KAMs</SelectItem>
                          {uniqueKAMs.map((kam) => (
                            <SelectItem key={kam} value={kam}>
                              {kam}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-white text-sm">Submitted Date</TableHead>
                  <TableHead className="font-bold text-white text-sm">
                    <div className="flex items-center gap-2">
                      <span>Status</span>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 w-[120px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                      No records found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((record) => (
                    <TableRow
                      key={record.id}
                      onClick={() => setSelectedHistoryRecord(record)}
                      className="cursor-pointer border-b border-border/40 bg-white transition-all duration-200 even:bg-[#B92221]/5 hover:bg-[#78BE20]/20 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <TableCell className="font-bold text-[#005180]">{record.id}</TableCell>
                      <TableCell className="font-semibold">{record.customerName}</TableCell>
                      <TableCell className="text-gray-700">{record.kamName}</TableCell>
                      <TableCell className="text-gray-600">{record.submittedDate}</TableCell>
                      <TableCell>
                        {record.status === "Approved" && (
                          <Badge className="bg-green-500/15 text-green-700 border-green-500/30 hover:bg-green-500/20 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Approved
                          </Badge>
                        )}
                        {record.status === "Pending" && (
                          <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/20 font-semibold">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            Pending
                          </Badge>
                        )}
                        {record.status === "Rejected" && (
                          <Badge className="bg-red-500/15 text-red-700 border-red-500/30 hover:bg-red-500/20 font-semibold">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </Card>
        </div>
        <FloatingActionButton actions={actions} />
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* Customer History Details Dialog */}
      <Dialog open={!!selectedHistoryRecord} onOpenChange={() => setSelectedHistoryRecord(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/30">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-[#005180]">
              {selectedHistoryRecord?.customerName}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Request ID: {selectedHistoryRecord?.id} • Submitted: {selectedHistoryRecord?.submittedDate}
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryRecord && (
            <div className="py-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
                  <p className="text-lg font-bold text-gray-900">Customer Creation Request</p>
                </div>
                <div>
                  {selectedHistoryRecord.status === "Approved" && (
                    <Badge className="bg-green-500/15 text-green-700 border-green-500/30 text-base px-4 py-2">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Approved
                    </Badge>
                  )}
                  {selectedHistoryRecord.status === "Pending" && (
                    <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30 text-base px-4 py-2">
                      <Clock className="h-5 w-5 mr-2" />
                      Pending
                    </Badge>
                  )}
                  {selectedHistoryRecord.status === "Rejected" && (
                    <Badge className="bg-red-500/15 text-red-700 border-red-500/30 text-base px-4 py-2">
                      <XCircle className="h-5 w-5 mr-2" />
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Approval Workflow */}
              <div>
                <h4 className="text-base font-bold text-[#005180] mb-4 flex items-center gap-2">
                  <div className="h-6 w-1 bg-[#78BE20] rounded-full"></div>
                  Approval Workflow
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prepared By</p>
                    <p className="text-base font-bold text-gray-900">{selectedHistoryRecord.preparedBy}</p>
                    <p className="text-xs text-gray-500">[Marketing Dept.]</p>
                    {selectedHistoryRecord.status !== "Pending" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-2" />
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Checked & Approved By</p>
                    <p className="text-base font-bold text-gray-900">{selectedHistoryRecord.checkedBy}</p>
                    <p className="text-xs text-gray-500">[Finance Dept.]</p>
                    {selectedHistoryRecord.checkedBy !== "Pending" && selectedHistoryRecord.status !== "Pending" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-2" />
                    )}
                    {selectedHistoryRecord.checkedBy === "Pending" && (
                      <Clock className="h-5 w-5 text-yellow-600 mt-2" />
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approved By</p>
                    <p className="text-base font-bold text-gray-900">{selectedHistoryRecord.approvedBy}</p>
                    <p className="text-xs text-gray-500">[D.V.P, Sales]</p>
                    {selectedHistoryRecord.approvedBy !== "Pending" && selectedHistoryRecord.approvedBy !== "Rejected" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-2" />
                    )}
                    {selectedHistoryRecord.approvedBy === "Pending" && (
                      <Clock className="h-5 w-5 text-yellow-600 mt-2" />
                    )}
                    {selectedHistoryRecord.approvedBy === "Rejected" && (
                      <XCircle className="h-5 w-5 text-red-600 mt-2" />
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Final Approval</p>
                    <p className="text-base font-bold text-gray-900">{selectedHistoryRecord.finalApproval}</p>
                    <p className="text-xs text-gray-500">Managing Director</p>
                    {selectedHistoryRecord.finalApproval !== "Pending" && selectedHistoryRecord.finalApproval !== "Not Required" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-2" />
                    )}
                    {selectedHistoryRecord.finalApproval === "Pending" && (
                      <Clock className="h-5 w-5 text-yellow-600 mt-2" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSelectedHistoryRecord(null)}
              className="h-10 px-6 border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
