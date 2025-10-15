"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, AlertCircle, Package, FileText, Truck, Eye, FileCheck, Package2, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

const sdoProjects = [
  {
    id: "SDO-2024-001",
    customer: "Acme Corp",
    product: "Custom Packaging Box",
    quoteId: "QUO-2024-048",
    status: "Sample Approved",
    progress: 100,
    createdDate: "2024-01-10",
    approvedDate: "2024-01-14",
    notes: "Customer approved sample with minor color adjustment",
  },
  {
    id: "SDO-2024-002",
    customer: "TechStart Inc",
    product: "Printed Labels",
    quoteId: "QUO-2024-047",
    status: "Awaiting Approval",
    progress: 75,
    createdDate: "2024-01-12",
    approvedDate: null,
    notes: "Sample sent to customer on 2024-01-15",
  },
  {
    id: "SDO-2024-003",
    customer: "Metro Supplies",
    product: "Folding Cartons",
    quoteId: "QUO-2024-045",
    status: "In Production",
    progress: 50,
    createdDate: "2024-01-14",
    approvedDate: null,
    notes: "Sample production in progress",
  },
]

const jdoProjects = [
  {
    id: "JDO-2024-001",
    customer: "Acme Corp",
    product: "Custom Packaging Box",
    sdoId: "SDO-2024-001",
    artworkStatus: "Approved",
    bomStatus: "Complete",
    routingStatus: "Complete",
    progress: 100,
    createdDate: "2024-01-15",
    notes: "Ready for commercial PO",
  },
  {
    id: "JDO-2024-002",
    customer: "Swift Logistics",
    product: "Corrugated Sheets",
    sdoId: "SDO-2024-004",
    artworkStatus: "In Review",
    bomStatus: "Complete",
    routingStatus: "Pending",
    progress: 60,
    createdDate: "2024-01-13",
    notes: "Awaiting artwork approval from customer",
  },
]

const commercialOrders = [
  {
    id: "COM-2024-001",
    customer: "Prime Packaging",
    product: "Die-Cut Boxes",
    jdoId: "JDO-2024-003",
    amount: 425000,
    quantity: "8000 units",
    status: "In Production",
    orderDate: "2024-01-08",
    expectedDelivery: "2024-01-25",
    progress: 70,
    notes: "Commercial production ongoing",
  },
  {
    id: "COM-2024-002",
    customer: "Global Traders",
    product: "Printed Labels",
    jdoId: "JDO-2024-004",
    amount: 185000,
    quantity: "10000 units",
    status: "Approved",
    orderDate: "2024-01-12",
    expectedDelivery: "2024-01-28",
    progress: 100,
    notes: "Commercial order approved, ready for production",
  },
  {
    id: "COM-2024-003",
    customer: "Acme Corp",
    product: "Custom Packaging",
    jdoId: "JDO-2024-001",
    amount: 320000,
    quantity: "5000 units",
    status: "In Review",
    orderDate: "2024-01-15",
    expectedDelivery: "2024-02-02",
    progress: 45,
    notes: "Under commercial review",
  },
]

const pnOrders = [
  {
    id: "PN-2024-001",
    customer: "TechStart Inc",
    product: "Corrugated Boxes",
    commercialId: "COM-2024-001",
    amount: 450000,
    quantity: "9000 units",
    status: "Dispatched",
    punchedDate: "2024-01-10",
    releasedDate: "2024-01-12",
    dispatchedDate: "2024-01-18",
    progress: 100,
    notes: "Successfully delivered to customer",
  },
  {
    id: "PN-2024-002",
    customer: "Metro Supplies",
    product: "Folding Cartons",
    commercialId: "COM-2024-002",
    amount: 275000,
    quantity: "6500 units",
    status: "In Production",
    punchedDate: "2024-01-14",
    releasedDate: "2024-01-15",
    dispatchedDate: null,
    progress: 60,
    notes: "Production in progress, expected dispatch: 2024-01-22",
  },
  {
    id: "PN-2024-003",
    customer: "Swift Logistics",
    product: "Custom Labels",
    commercialId: "COM-2024-003",
    amount: 195000,
    quantity: "12000 units",
    status: "Released",
    punchedDate: "2024-01-16",
    releasedDate: "2024-01-17",
    dispatchedDate: null,
    progress: 35,
    notes: "Released to production floor",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "Sample Approved":
    case "Approved":
    case "Complete":
    case "Dispatched":
      return "badge-green-gradient"
    case "Awaiting Approval":
    case "Pending":
      return "bg-burgundy-10 text-burgundy border-burgundy-40"
    case "In Review":
    case "In Production":
      return "badge-blue-gradient"
    case "Released":
      return "bg-green-10 text-green border-green-40"
    default:
      return "bg-neutral-gray-100 text-neutral-gray-600 border-neutral-gray-300"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Sample Approved":
    case "Approved":
    case "Complete":
    case "Dispatched":
      return CheckCircle2
    case "Awaiting Approval":
    case "In Review":
    case "In Production":
    case "Released":
      return Clock
    case "Pending":
      return AlertCircle
    default:
      return Clock
  }
}

export function ProjectsContent() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectType, setProjectType] = useState<"sdo" | "jdo" | "commercial" | "pn">("sdo")

  // Search filters
  const [sdoSearch, setSdoSearch] = useState("")
  const [sdoStatusFilter, setSdoStatusFilter] = useState("all")

  const [jdoSearch, setJdoSearch] = useState("")

  const [comSearch, setComSearch] = useState("")
  const [comStatusFilter, setComStatusFilter] = useState("all")

  const [pnSearch, setPnSearch] = useState("")
  const [pnStatusFilter, setPnStatusFilter] = useState("all")

  // Filtered data
  const filteredSDO = sdoProjects.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.product.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.quoteId.toLowerCase().includes(sdoSearch.toLowerCase())
    return matchesSearch && (sdoStatusFilter === "all" || p.status === sdoStatusFilter)
  })

  const filteredJDO = jdoProjects.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.product.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.sdoId.toLowerCase().includes(jdoSearch.toLowerCase())
    return matchesSearch
  })

  const filteredCommercial = commercialOrders.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.product.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.jdoId.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.quantity.toLowerCase().includes(comSearch.toLowerCase())
    return matchesSearch && (comStatusFilter === "all" || p.status === comStatusFilter)
  })

  const filteredPN = pnOrders.filter(p => {
    const matchesSearch =
      p.id.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.product.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.commercialId.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.quantity.toLowerCase().includes(pnSearch.toLowerCase())
    return matchesSearch && (pnStatusFilter === "all" || p.status === pnStatusFilter)
  })

  return (
    <div className="space-y-4">
      <Tabs defaultValue="sdo" className="w-full" onValueChange={(value) => setProjectType(value as any)}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="sdo" className="gap-1 sm:gap-2 flex-col sm:flex-row py-2 sm:py-1.5">
            <Package className="h-4 w-4" />
            <span className="text-xs sm:text-sm">SDO</span>
            <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
              {sdoProjects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="jdo" className="gap-1 sm:gap-2 flex-col sm:flex-row py-2 sm:py-1.5">
            <FileText className="h-4 w-4" />
            <span className="text-xs sm:text-sm">JDO</span>
            <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
              {jdoProjects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="commercial" className="gap-1 sm:gap-2 flex-col sm:flex-row py-2 sm:py-1.5">
            <FileCheck className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Commercial</span>
            <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
              {commercialOrders.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pn" className="gap-1 sm:gap-2 flex-col sm:flex-row py-2 sm:py-1.5">
            <Truck className="h-4 w-4" />
            <span className="text-xs sm:text-sm">PN</span>
            <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
              {pnOrders.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* SDO Tab */}
        <TabsContent value="sdo">
          {/* SDO Search Bar */}
          <div className="flex gap-2 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SDO (ID, Customer, Product, Quote ID)..."
                value={sdoSearch}
                onChange={(e) => setSdoSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sdoStatusFilter} onValueChange={setSdoStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Sample Approved">Sample Approved</SelectItem>
                <SelectItem value="Awaiting Approval">Awaiting Approval</SelectItem>
                <SelectItem value="In Production">In Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[180px]">
                        <div className="font-semibold">ID / Customer</div>
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <div className="font-semibold">Product</div>
                      </TableHead>
                      <TableHead className="w-[140px]">
                        <div className="font-semibold">Status</div>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <div className="font-semibold">Progress</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSDO.map((project, index) => {
                      const StatusIcon = getStatusIcon(project.status)
                      return (
                        <Dialog key={project.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className={`cursor-pointer animate-scale-in hover:bg-${
                                project.status === 'Sample Approved' ? 'green' :
                                project.status === 'Awaiting Approval' ? 'burgundy' :
                                'blue'
                              }-5 transition-colors`}
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-1 h-12 rounded-full ${
                                    project.status === 'Sample Approved' ? 'bg-green' :
                                    project.status === 'Awaiting Approval' ? 'bg-burgundy' :
                                    'bg-blue'
                                  }`} />
                                  <div>
                                    <p className="font-bold text-sm text-blue">{project.id}</p>
                                    <p className="text-sm font-medium">{project.customer}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-sm">{project.product}</p>
                                  <p className="text-xs text-muted-foreground">Quote: {project.quoteId}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(project.status)} gap-1 border`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {project.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold">{project.progress}%</span>
                                  </div>
                                  <Progress value={project.progress} className="h-2" />
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-blue">{project.id}</DialogTitle>
                              <DialogDescription>
                                Sample Development Order Details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Customer</Label>
                                <p className="text-base font-medium">{project.customer}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Product</Label>
                                <p className="text-base font-medium">{project.product}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Quote ID</Label>
                                <p className="text-base font-medium">{project.quoteId}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                                <Badge className={`${getStatusColor(project.status)} gap-1 border w-fit`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {project.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Created Date</Label>
                                <p className="text-base font-medium">{project.createdDate}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Approved Date</Label>
                                <p className="text-base font-medium">{project.approvedDate || "Pending"}</p>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Progress</Label>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">{project.progress}%</span>
                                  </div>
                                  <Progress value={project.progress} className="h-3" />
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Notes</Label>
                                <p className="text-base">{project.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* JDO Tab */}
        <TabsContent value="jdo">
          {/* JDO Search Bar */}
          <div className="flex gap-2 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search JDO (ID, Customer, Product, SDO ID)..."
                value={jdoSearch}
                onChange={(e) => setJdoSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[180px]">
                        <div className="font-semibold">ID / Customer</div>
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <div className="font-semibold">Product</div>
                      </TableHead>
                      <TableHead className="w-[240px]">
                        <div className="font-semibold">Status (Artwork / BOM / Routing)</div>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <div className="font-semibold">Progress</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJDO.map((project, index) => {
                      const overallStatus =
                        project.artworkStatus === 'Approved' && project.bomStatus === 'Complete' && project.routingStatus === 'Complete'
                          ? 'Approved'
                          : 'In Review'
                      return (
                        <Dialog key={project.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className={`cursor-pointer animate-scale-in hover:bg-${
                                overallStatus === 'Approved' ? 'green' : 'blue'
                              }-5 transition-colors`}
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-1 h-12 rounded-full ${
                                    overallStatus === 'Approved' ? 'bg-green' : 'bg-blue'
                                  }`} />
                                  <div>
                                    <p className="font-bold text-sm text-blue">{project.id}</p>
                                    <p className="text-sm font-medium">{project.customer}</p>
                                    <p className="text-xs text-muted-foreground">SDO: {project.sdoId}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-semibold text-sm">{project.product}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <div className="flex-1 text-center">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Artwork</p>
                                    <Badge className={`${getStatusColor(project.artworkStatus)} border text-[10px]`}>
                                      {project.artworkStatus}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 text-center">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">BOM</p>
                                    <Badge className={`${getStatusColor(project.bomStatus)} border text-[10px]`}>
                                      {project.bomStatus}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 text-center">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Routing</p>
                                    <Badge className={`${getStatusColor(project.routingStatus)} border text-[10px]`}>
                                      {project.routingStatus}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold">{project.progress}%</span>
                                  </div>
                                  <Progress value={project.progress} className="h-2" />
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-blue">{project.id}</DialogTitle>
                              <DialogDescription>
                                Job Development Order Details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Customer</Label>
                                <p className="text-base font-medium">{project.customer}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Product</Label>
                                <p className="text-base font-medium">{project.product}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">SDO ID</Label>
                                <p className="text-base font-medium">{project.sdoId}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Created Date</Label>
                                <p className="text-base font-medium">{project.createdDate}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Artwork Status</Label>
                                <Badge className={`${getStatusColor(project.artworkStatus)} gap-1 border w-fit`}>
                                  {project.artworkStatus}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">BOM Status</Label>
                                <Badge className={`${getStatusColor(project.bomStatus)} gap-1 border w-fit`}>
                                  {project.bomStatus}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Routing Status</Label>
                                <Badge className={`${getStatusColor(project.routingStatus)} gap-1 border w-fit`}>
                                  {project.routingStatus}
                                </Badge>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Progress</Label>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">{project.progress}%</span>
                                  </div>
                                  <Progress value={project.progress} className="h-3" />
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Notes</Label>
                                <p className="text-base">{project.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commercial Tab */}
        <TabsContent value="commercial">
          {/* Commercial Search Bar */}
          <div className="flex gap-2 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Commercial (ID, Customer, Product, JDO ID, Quantity)..."
                value={comSearch}
                onChange={(e) => setComSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={comStatusFilter} onValueChange={setComStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="In Production">In Production</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[180px]">
                        <div className="font-semibold">ID / Customer</div>
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <div className="font-semibold">Product</div>
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <div className="font-semibold">Amount & Dates</div>
                      </TableHead>
                      <TableHead className="w-[160px]">
                        <div className="font-semibold">Status</div>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <div className="font-semibold">Progress</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommercial.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status)
                      return (
                        <Dialog key={order.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className={`cursor-pointer animate-scale-in hover:bg-${
                                order.status === 'Approved' ? 'green' :
                                order.status === 'In Review' ? 'burgundy' :
                                'blue'
                              }-5 transition-colors`}
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-1 h-12 rounded-full ${
                                    order.status === 'Approved' ? 'bg-green' :
                                    order.status === 'In Review' ? 'bg-burgundy' :
                                    'bg-blue'
                                  }`} />
                                  <div>
                                    <p className="font-bold text-sm text-blue">{order.id}</p>
                                    <p className="text-sm font-medium">{order.customer}</p>
                                    <p className="text-xs text-muted-foreground">JDO: {order.jdoId}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-sm">{order.product}</p>
                                  <p className="text-xs text-muted-foreground">{order.quantity}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-lg font-bold text-blue">₹{order.amount.toLocaleString("en-IN")}</p>
                                  <p className="text-[10px] text-muted-foreground">Order: {order.orderDate}</p>
                                  <p className="text-[10px] text-muted-foreground">Delivery: {order.expectedDelivery}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(order.status)} gap-1 border`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold">{order.progress}%</span>
                                  </div>
                                  <Progress value={order.progress} className="h-2" />
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-blue">{order.id}</DialogTitle>
                              <DialogDescription>
                                Commercial Order Details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Customer</Label>
                                <p className="text-base font-medium">{order.customer}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Product</Label>
                                <p className="text-base font-medium">{order.product}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">JDO ID</Label>
                                <p className="text-base font-medium">{order.jdoId}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Amount</Label>
                                <p className="text-lg font-bold text-blue">₹{order.amount.toLocaleString("en-IN")}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Quantity</Label>
                                <p className="text-base font-medium">{order.quantity}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                                <Badge className={`${getStatusColor(order.status)} gap-1 border w-fit`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Order Date</Label>
                                <p className="text-base font-medium">{order.orderDate}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Expected Delivery</Label>
                                <p className="text-base font-medium">{order.expectedDelivery}</p>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Progress</Label>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">{order.progress}%</span>
                                  </div>
                                  <Progress value={order.progress} className="h-3" />
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Notes</Label>
                                <p className="text-base">{order.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PN Tab */}
        <TabsContent value="pn">
          {/* PN Search Bar */}
          <div className="flex gap-2 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PN (ID, Customer, Product, Commercial ID, Quantity)..."
                value={pnSearch}
                onChange={(e) => setPnSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={pnStatusFilter} onValueChange={setPnStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Dispatched">Dispatched</SelectItem>
                <SelectItem value="In Production">In Production</SelectItem>
                <SelectItem value="Released">Released</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[180px]">
                        <div className="font-semibold">ID / Customer</div>
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <div className="font-semibold">Product</div>
                      </TableHead>
                      <TableHead className="w-[160px]">
                        <div className="font-semibold">Status</div>
                      </TableHead>
                      <TableHead className="w-[240px]">
                        <div className="font-semibold">Timeline</div>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <div className="font-semibold">Progress</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPN.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status)
                      return (
                        <Dialog key={order.id}>
                          <DialogTrigger asChild>
                            <TableRow
                              className={`cursor-pointer animate-scale-in hover:bg-${
                                order.status === 'Dispatched' ? 'green' :
                                order.status === 'Released' ? 'blue' :
                                'burgundy'
                              }-5 transition-colors`}
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-1 h-12 rounded-full ${
                                    order.status === 'Dispatched' ? 'bg-green' :
                                    order.status === 'Released' ? 'bg-blue' :
                                    'bg-burgundy'
                                  }`} />
                                  <div>
                                    <p className="font-bold text-sm text-blue">{order.id}</p>
                                    <p className="text-sm font-medium">{order.customer}</p>
                                    <p className="text-xs text-muted-foreground">Comm: {order.commercialId}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-sm">{order.product}</p>
                                  <p className="text-sm font-bold text-blue">₹{order.amount.toLocaleString("en-IN")}</p>
                                  <p className="text-[10px] text-muted-foreground">{order.quantity}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(order.status)} gap-1 border`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="grid grid-cols-3 gap-1 text-[10px]">
                                  <div>
                                    <p className="text-muted-foreground">Punched</p>
                                    <p className="font-semibold">{order.punchedDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Released</p>
                                    <p className="font-semibold">{order.releasedDate || "Pending"}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Dispatched</p>
                                    <p className="font-semibold">{order.dispatchedDate || "Pending"}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold">{order.progress}%</span>
                                  </div>
                                  <Progress value={order.progress} className="h-2" />
                                </div>
                              </TableCell>
                            </TableRow>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-blue">{order.id}</DialogTitle>
                              <DialogDescription>
                                Production Order Details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Customer</Label>
                                <p className="text-base font-medium">{order.customer}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Product</Label>
                                <p className="text-base font-medium">{order.product}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Commercial ID</Label>
                                <p className="text-base font-medium">{order.commercialId}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Amount</Label>
                                <p className="text-lg font-bold text-blue">₹{order.amount.toLocaleString("en-IN")}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Quantity</Label>
                                <p className="text-base font-medium">{order.quantity}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                                <Badge className={`${getStatusColor(order.status)} gap-1 border w-fit`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Punched Date</Label>
                                <p className="text-base font-medium">{order.punchedDate}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Released Date</Label>
                                <p className="text-base font-medium">{order.releasedDate || "Pending"}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Dispatched Date</Label>
                                <p className="text-base font-medium">{order.dispatchedDate || "Pending"}</p>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Progress</Label>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold">{order.progress}%</span>
                                  </div>
                                  <Progress value={order.progress} className="h-3" />
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-sm font-semibold text-muted-foreground">Notes</Label>
                                <p className="text-base">{order.notes}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
