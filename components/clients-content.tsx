"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Upload, CheckCircle2, XCircle, AlertCircle, Mic, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TruncatedText } from "@/components/truncated-text"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { getViewableKAMs, isHOD } from "@/lib/permissions"
import { EnquiryAPI } from "@/lib/api/enquiry"
import { clientLogger } from "@/lib/logger"

// REMOVED: Static hardcoded clients data - using API now
/*
const clients = [
  {
    id: "CC-001",
    name: "Tech Solutions Ltd",
    code: "Pending",
    email: "info@techsolutions.com",
    phone: "+91 98765 43220",
    gst: "27AABCU9603R1ZX",
    pan: "AABCU9603R",
    status: "Pending",
    approvalStatus: "Pending Finance Approval",
    complianceStatus: "Pending",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Priya Singh",
    hodName: "Kavita Reddy",
    submittedDate: "2024-10-20",
    documents: {
      gst: true,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CC-002",
    name: "Prime Industries",
    code: "Pending",
    email: "contact@primeindustries.com",
    phone: "+91 98765 43221",
    gst: "27AABCP1234R1ZY",
    pan: "AABCP1234R",
    status: "Pending",
    approvalStatus: "Pending D.V.P Approval",
    complianceStatus: "Pending",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Rajat Kumar",
    hodName: "Suresh Menon",
    submittedDate: "2024-10-26",
    documents: {
      gst: true,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CC-003",
    name: "Global Packaging Inc",
    code: "Rejected",
    email: "sales@globalpackaging.com",
    phone: "+91 98765 43222",
    gst: "27AABCG5555R1ZZ",
    pan: "AABCG5555R",
    status: "Rejected",
    approvalStatus: "Rejected by Finance",
    complianceStatus: "Incomplete",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Amit Verma",
    hodName: "Kavita Reddy",
    submittedDate: "2024-10-22",
    documents: {
      gst: false,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CUST-001",
    name: "Acme Corp",
    code: "ACM-2024",
    email: "contact@acmecorp.com",
    phone: "+91 98765 43210",
    gst: "27AABCU9603R1ZM",
    pan: "AABCU9603R",
    status: "Approved",
    approvalStatus: "Approved",
    complianceStatus: "Complete",
    totalOrders: 45,
    totalValue: 12500000,
    lastOrder: "2024-01-14",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    documents: {
      gst: true,
      pan: true,
      agreement: true,
    },
  },
  {
    id: "CUST-002",
    name: "TechStart Inc",
    code: "TCH-2024",
    email: "info@techstart.com",
    phone: "+91 98765 43211",
    gst: "29AABCT1332L1ZG",
    pan: "AABCT1332L",
    status: "Approved",
    complianceStatus: "Complete",
    totalOrders: 32,
    totalValue: 8900000,
    lastOrder: "2024-01-15",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    documents: {
      gst: true,
      pan: true,
      agreement: true,
    },
  },
  {
    id: "CUST-003",
    name: "Global Traders",
    code: "GLB-2024",
    email: "sales@globaltraders.com",
    phone: "+91 98765 43212",
    gst: "27AABCG5647N1ZL",
    pan: "AABCG5647N",
    status: "Approved",
    complianceStatus: "Pending",
    totalOrders: 12,
    totalValue: 3200000,
    lastOrder: "2024-01-13",
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    documents: {
      gst: true,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CUST-004",
    name: "Metro Supplies",
    code: "MET-2024",
    email: "orders@metrosupplies.com",
    phone: "+91 98765 43213",
    gst: "29AABCM8965F1Z5",
    pan: "AABCM8965F",
    status: "Approved",
    complianceStatus: "Complete",
    totalOrders: 28,
    totalValue: 7800000,
    lastOrder: "2024-01-12",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    documents: {
      gst: true,
      pan: true,
      agreement: true,
    },
  },
  {
    id: "CC-004",
    name: "Innovative Packaging Solutions",
    code: "Pending",
    email: "sales@innovativepack.com",
    phone: "+91 98765 43223",
    gst: "27AABCI7890R1ZA",
    pan: "AABCI7890R",
    status: "Pending",
    approvalStatus: "Pending Finance Approval",
    complianceStatus: "Pending",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    submittedDate: "2024-10-28",
    documents: {
      gst: true,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CC-005",
    name: "Express Logistics Pvt Ltd",
    code: "Pending",
    email: "info@expresslogistics.com",
    phone: "+91 98765 43224",
    gst: "29AABCE4567R1ZB",
    pan: "AABCE4567R",
    status: "Pending",
    approvalStatus: "Pending HOD Approval",
    complianceStatus: "Pending",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    submittedDate: "2024-10-27",
    documents: {
      gst: true,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CC-006",
    name: "Smart Print Solutions",
    code: "Rejected",
    email: "contact@smartprint.com",
    phone: "+91 98765 43225",
    gst: "27AABCS1234R1ZC",
    pan: "AABCS1234R",
    status: "Rejected",
    approvalStatus: "Rejected by D.V.P",
    complianceStatus: "Incomplete",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    submittedDate: "2024-10-24",
    documents: {
      gst: false,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CC-007",
    name: "Rapid Manufacturing Co",
    code: "Pending",
    email: "sales@rapidmfg.com",
    phone: "+91 98765 43226",
    gst: "29AABCR6789R1ZD",
    pan: "AABCR6789R",
    status: "Pending",
    approvalStatus: "Pending D.V.P Approval",
    complianceStatus: "Pending",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    submittedDate: "2024-10-29",
    documents: {
      gst: true,
      pan: true,
      agreement: false,
    },
  },
  {
    id: "CC-008",
    name: "Quality Box Manufacturers",
    code: "Rejected",
    email: "info@qualitybox.com",
    phone: "+91 98765 43227",
    gst: "27AABCQ3456R1ZE",
    pan: "AABCQ3456R",
    status: "Rejected",
    approvalStatus: "Rejected by Finance",
    complianceStatus: "Incomplete",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: "-",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    submittedDate: "2024-10-21",
    documents: {
      gst: true,
      pan: false,
      agreement: false,
    },
  },
]
*/

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "default"
    case "Pending Setup":
      return "secondary"
    case "Inactive":
      return "outline"
    default:
      return "outline"
  }
}

function getComplianceColor(status: string) {
  switch (status) {
    case "Complete":
      return "default"
    case "Pending":
      return "secondary"
    case "Incomplete":
      return "destructive"
    default:
      return "outline"
  }
}

export function ClientsContent() {
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const isKAM = viewableKams.length === 1 // KAM can only see themselves
  const isHODUser = isHOD() // HOD user check

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hodFilter, setHodFilter] = useState("all")
  const [kamFilter, setKamFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const itemsPerPage = 20

  // API state
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch customers from inquiries API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await EnquiryAPI.getEnquiries(
          {
            FromDate: '2025-01-01 00:00:00.000',
            ToDate: '2026-12-31 23:59:59.999',
            ApplydateFilter: 'True',
            RadioValue: 'All',
          },
          null
        )

        clientLogger.log('📊 Customers API Response:', response)

        if (response.success && response.data && response.data.length > 0) {
          // Extract unique customers from inquiries
          const customersMap = new Map()

          response.data.forEach((inquiry: any) => {
            if (inquiry.LedgerID && inquiry.ClientName) {
              if (!customersMap.has(inquiry.LedgerID)) {
                customersMap.set(inquiry.LedgerID, {
                  id: `CUST-${inquiry.LedgerID}`,
                  ledgerId: inquiry.LedgerID,
                  name: inquiry.ClientName,
                  code: inquiry.LedgerID.toString(),
                  email: '-',
                  phone: inquiry.Mobile || '-',
                  gst: '-',
                  pan: '-',
                  status: 'Active',
                  approvalStatus: '-',
                  complianceStatus: '-',
                  totalOrders: 0,
                  totalValue: 0,
                  lastOrder: inquiry.EnquiryDate1 || inquiry.EnquiryDate,
                  kamName: inquiry.SalesRepresentative || '-',
                  hodName: '-',
                  submittedDate: inquiry.EnquiryDate1 || inquiry.EnquiryDate,
                  documents: {
                    gst: false,
                    pan: false,
                    agreement: false,
                  },
                })
              } else {
                // Update total orders count
                const customer = customersMap.get(inquiry.LedgerID)
                customer.totalOrders += 1
                // Update last order date if newer
                if (inquiry.EnquiryDate1 || inquiry.EnquiryDate) {
                  customer.lastOrder = inquiry.EnquiryDate1 || inquiry.EnquiryDate
                }
              }
            }
          })

          const customersArray = Array.from(customersMap.values())
          clientLogger.log('✅ Unique Customers:', customersArray.length, customersArray)
          setClients(customersArray)
        } else {
          clientLogger.log('⚠️ No customers found')
          setError(response.error || 'No customers found')
          setClients([])
        }
      } catch (err: any) {
        clientLogger.error('❌ Error fetching customers:', err)
        setError(err.message || 'An error occurred while loading customers')
        setClients([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Filter data based on user role - KAMs can only see their own data
  const userFilteredClients = clients

  const hodNames = Array.from(new Set(userFilteredClients.map(client => client.hodName).filter((name): name is string => Boolean(name))))
  const kamNames = Array.from(new Set(userFilteredClients.map(client => client.kamName).filter((name): name is string => Boolean(name))))

  const filteredClients = userFilteredClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.code && client.code.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesHod = hodFilter === "all" || client.hodName === hodFilter
    const matchesKam = kamFilter === "all" || client.kamName === kamFilter
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    return matchesSearch && matchesHod && matchesKam && matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, hodFilter, kamFilter, statusFilter])

  return (
    <div className="space-y-4">
      {/* Search Bar Only */}
      <div className="relative flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Find your clients by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 placeholder:truncate"
          />
        </div>
        <Mic
          onClick={() => alert("Voice input feature coming soon")}
          className="h-6 w-6 text-[#005180] cursor-pointer hover:text-[#004875] transition-colors duration-200 flex-shrink-0"
        />
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#004875] to-[#003d63] hover:bg-gradient-to-r hover:from-[#004875] hover:to-[#003d63] [&_th]:text-white [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-xs">
                {!isKAM && !isHODUser && (
                  <TableHead>
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
                {!isKAM && (
                  <TableHead>
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
                <TableHead>Client ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Customer Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                        <Filter className="h-4 w-4 text-white" />
                      </SelectTrigger>
                      <SelectContent align="start" className="min-w-[150px]">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Total Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client, index) => (
                <Dialog key={client.id}>
                  <TableRow
                    className="cursor-pointer border-b border-border/40 bg-white transition-all duration-200 even:bg-[#B92221]/5 hover:bg-[#78BE20]/20 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {!isKAM && !isHODUser && (
                      <DialogTrigger asChild>
                        <TableCell onClick={() => setSelectedClient(client)}>
                          <p className="text-sm font-medium text-foreground">{client.hodName || "N/A"}</p>
                        </TableCell>
                      </DialogTrigger>
                    )}
                    {!isKAM && (
                      <DialogTrigger asChild>
                        <TableCell onClick={() => setSelectedClient(client)}>
                          <p className="text-sm font-medium text-foreground">{client.kamName || "N/A"}</p>
                        </TableCell>
                      </DialogTrigger>
                    )}
                    <DialogTrigger asChild>
                      <TableCell onClick={() => setSelectedClient(client)} className="font-medium text-primary">{client.id}</TableCell>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <TableCell onClick={() => setSelectedClient(client)}>
                        <div>
                          <TruncatedText text={client.name} limit={25} className="font-medium block" />
                          <p className="text-xs text-muted-foreground">{client.email}</p>
                        </div>
                      </TableCell>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <TableCell onClick={() => setSelectedClient(client)}>
                        {client.code ? (
                          <Badge variant="outline">{client.code}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not Created</span>
                        )}
                      </TableCell>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <TableCell onClick={() => setSelectedClient(client)}>
                        <p className="text-sm">{client.phone}</p>
                      </TableCell>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <TableCell onClick={() => setSelectedClient(client)}>
                        <Badge variant={getStatusColor(client.status)}>{client.status}</Badge>
                      </TableCell>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <TableCell onClick={() => setSelectedClient(client)}>
                        <Badge variant={getComplianceColor(client.complianceStatus)}>{client.complianceStatus}</Badge>
                      </TableCell>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <TableCell onClick={() => setSelectedClient(client)}>
                        <div>
                          <p className="font-medium">{client.totalOrders}</p>
                          <p className="text-xs text-muted-foreground">₹{(client.totalValue / 100000).toFixed(1)}L</p>
                        </div>
                      </TableCell>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle>Client Details</DialogTitle>
                          <DialogDescription>{selectedClient?.name}</DialogDescription>
                        </DialogHeader>
                        {selectedClient && (
                          <div className="grid gap-6 py-4 overflow-y-auto overflow-x-hidden flex-1">
                            {/* Basic Info */}
                            <div>
                              <h3 className="mb-3 text-sm font-semibold">Basic Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Client ID</Label>
                                  <p className="mt-1 font-medium">{selectedClient.id}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Customer Code</Label>
                                  <div className="mt-1">
                                    {selectedClient.code ? (
                                      <Badge variant="outline">{selectedClient.code}</Badge>
                                    ) : (
                                      <Button variant="outline" size="sm">
                                        Create Code
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Email</Label>
                                  <p className="mt-1">{selectedClient.email}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Phone</Label>
                                  <p className="mt-1">{selectedClient.phone}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Status</Label>
                                  <div className="mt-1">
                                    <Badge variant={getStatusColor(selectedClient.status)}>
                                      {selectedClient.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Compliance</Label>
                                  <div className="mt-1">
                                    <Badge variant={getComplianceColor(selectedClient.complianceStatus)}>
                                      {selectedClient.complianceStatus}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Tax Info */}
                            <div>
                              <h3 className="mb-3 text-sm font-semibold">Tax Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">GST Number</Label>
                                  <p className="mt-1 font-mono text-sm">{selectedClient.gst}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">PAN Number</Label>
                                  <p className="mt-1 font-mono text-sm">{selectedClient.pan}</p>
                                </div>
                              </div>
                            </div>

                            {/* Documents */}
                            <div>
                              <h3 className="mb-3 text-sm font-semibold">Compliance Documents</h3>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                  <div className="flex items-center gap-2">
                                    {selectedClient.documents.gst ? (
                                      <CheckCircle2 className="h-4 w-4 text-success" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className="text-sm">GST Certificate</span>
                                  </div>
                                  {selectedClient.documents.gst ? (
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  ) : (
                                    <Button variant="outline" size="sm">
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                  <div className="flex items-center gap-2">
                                    {selectedClient.documents.pan ? (
                                      <CheckCircle2 className="h-4 w-4 text-success" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className="text-sm">PAN Card</span>
                                  </div>
                                  {selectedClient.documents.pan ? (
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  ) : (
                                    <Button variant="outline" size="sm">
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                  <div className="flex items-center gap-2">
                                    {selectedClient.documents.agreement ? (
                                      <CheckCircle2 className="h-4 w-4 text-success" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-warning" />
                                    )}
                                    <span className="text-sm">Service Agreement</span>
                                  </div>
                                  {selectedClient.documents.agreement ? (
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  ) : (
                                    <Button variant="outline" size="sm">
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Business Stats */}
                            <div>
                              <h3 className="mb-3 text-sm font-semibold">Business Summary</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Total Orders</p>
                                  <p className="mt-1 text-2xl font-bold">{selectedClient.totalOrders}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Total Value</p>
                                  <p className="mt-1 text-2xl font-bold">
                                    ₹{(selectedClient.totalValue / 100000).toFixed(1)}L
                                  </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Last Order</p>
                                  <p className="mt-1 text-sm font-medium">
                                    {selectedClient.lastOrder || "No orders yet"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Edit Details</Button>
                        <Button>Update Compliance</Button>
                      </div>
                    </DialogContent>
                  </TableRow>
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
