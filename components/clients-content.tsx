"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Upload, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
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

const clients = [
  {
    id: "CUST-001",
    name: "Acme Corp",
    code: "ACM-2024",
    email: "contact@acmecorp.com",
    phone: "+91 98765 43210",
    gst: "27AABCU9603R1ZM",
    pan: "AABCU9603R",
    status: "Active",
    complianceStatus: "Complete",
    totalOrders: 45,
    totalValue: 12500000,
    lastOrder: "2024-01-14",
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
    status: "Active",
    complianceStatus: "Complete",
    totalOrders: 32,
    totalValue: 8900000,
    lastOrder: "2024-01-15",
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
    status: "Active",
    complianceStatus: "Pending",
    totalOrders: 12,
    totalValue: 3200000,
    lastOrder: "2024-01-13",
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
    status: "Active",
    complianceStatus: "Complete",
    totalOrders: 28,
    totalValue: 7800000,
    lastOrder: "2024-01-12",
    documents: {
      gst: true,
      pan: true,
      agreement: true,
    },
  },
  {
    id: "CUST-005",
    name: "Prime Packaging",
    code: null,
    email: "contact@primepack.com",
    phone: "+91 98765 43214",
    gst: "27AABCP7854K1Z8",
    pan: "AABCP7854K",
    status: "Pending Setup",
    complianceStatus: "Incomplete",
    totalOrders: 0,
    totalValue: 0,
    lastOrder: null,
    documents: {
      gst: false,
      pan: false,
      agreement: false,
    },
  },
]

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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<(typeof clients)[0] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.code && client.code.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="space-y-4">
      {/* Search Bar Only */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, code, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="px-4 rounded-lg bg-[#005180] hover:bg-[#004875] text-white shadow-lg transition-all"
          title="Refresh page"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#004875] to-[#003d63] hover:bg-gradient-to-r hover:from-[#004875] hover:to-[#003d63] [&_th]:text-white [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-xs">
                <TableHead>Client ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Customer Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client, index) => (
                <TableRow key={client.id} className="border-b border-border/40 bg-white transition-colors even:bg-[#005180]/8 hover:bg-[#78BE20]/15">
                  <TableCell className="font-medium text-primary">{client.id}</TableCell>
                  <TableCell>
                    <div>
                      <TruncatedText text={client.name} limit={25} className="font-medium block" />
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.code ? (
                      <Badge variant="outline">{client.code}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not Created</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{client.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(client.status)}>{client.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getComplianceColor(client.complianceStatus)}>{client.complianceStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{client.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">₹{(client.totalValue / 100000).toFixed(1)}L</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Client Details</DialogTitle>
                          <DialogDescription>{selectedClient?.name}</DialogDescription>
                        </DialogHeader>
                        {selectedClient && (
                          <div className="grid gap-6 py-4">
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
                    </Dialog>
                  </TableCell>
                </TableRow>
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
