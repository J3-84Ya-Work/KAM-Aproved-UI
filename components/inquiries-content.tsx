"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, Eye, Send, Clock, ArrowUpDown, Download, RefreshCw } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

const inquiries = [
  {
    id: "INQ-2024-001",
    customer: "Acme Corp",
    job: "Custom Packaging Box",
    sku: "PKG-001",
    quantityRange: "5000-10000",
    status: "Costing",
    priority: "high",
    date: "2024-01-15",
    dueDate: "2024-01-18",
    notes: "Urgent requirement for Q1 launch",
  },
  {
    id: "INQ-2024-002",
    customer: "TechStart Inc",
    job: "Printed Labels",
    sku: "LBL-045",
    quantityRange: "10000-15000",
    status: "Quoted",
    priority: "medium",
    date: "2024-01-14",
    dueDate: "2024-01-20",
    notes: "Repeat order with minor modifications",
  },
  {
    id: "INQ-2024-003",
    customer: "Global Traders",
    job: "Corrugated Sheets",
    sku: "COR-023",
    quantityRange: "2000-5000",
    status: "Draft",
    priority: "low",
    date: "2024-01-13",
    dueDate: "2024-01-25",
    notes: "New customer inquiry",
  },
  {
    id: "INQ-2024-004",
    customer: "Metro Suppliers",
    job: "Folding Cartons",
    sku: "FLD-012",
    quantityRange: "8000-12000",
    status: "Approved",
    priority: "high",
    date: "2024-01-12",
    dueDate: "2024-01-17",
    notes: "Ready for quotation",
  },
  {
    id: "INQ-2024-005",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    sku: "DCB-089",
    quantityRange: "3000-6000",
    status: "Pending",
    priority: "medium",
    date: "2024-01-11",
    dueDate: "2024-01-22",
    notes: "Awaiting customer specifications",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "Approved":
      return "badge-green-gradient"
    case "Quoted":
      return "badge-blue-gradient"
    case "Costing":
      return "bg-blue-10 text-blue border-blue-40"
    case "Draft":
      return "bg-neutral-gray-100 text-neutral-gray-600 border-neutral-gray-300"
    case "Pending":
      return "bg-burgundy-10 text-burgundy border-burgundy-40"
    default:
      return "outline"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "badge-burgundy-gradient"
    case "medium":
      return "bg-blue-10 text-blue border-blue-40"
    case "low":
      return "bg-green-10 text-green border-green-40"
    default:
      return "outline"
  }
}

export function InquiriesContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedInquiry, setSelectedInquiry] = useState<(typeof inquiries)[0] | null>(null)

  const filteredInquiries = inquiries
    .filter((inquiry) => {
      // Exclude Draft status inquiries
      if (inquiry.status === "Draft") return false

      const matchesSearch =
        inquiry.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.quantityRange.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter
      const matchesPriority = priorityFilter === "all" || inquiry.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "due-asc":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "due-desc":
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
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
            placeholder="Search inquiries (ID, Customer, Job Name, SKU, Quantity)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Costing">Costing</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Quoted">Quoted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#005180] hover:bg-[#005180]">
                  <TableHead className="w-[180px] text-white">
                    <div className="font-semibold">ID / Customer</div>
                  </TableHead>
                  <TableHead className="w-[200px] text-white">
                    <div className="font-semibold">Job Name</div>
                  </TableHead>
                  <TableHead className="w-[160px] text-white">
                    <div className="font-semibold">Quantity Range</div>
                  </TableHead>
                  <TableHead className="w-[140px] text-white">
                    <div className="font-semibold">Status</div>
                  </TableHead>
                  <TableHead className="w-[180px] text-white">
                    <div className="font-semibold">Priority / Due Date</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry, index) => (
                  <Dialog key={inquiry.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className={`animate-scale-in hover:bg-${
                          inquiry.priority === 'high' ? 'burgundy' :
                          inquiry.priority === 'medium' ? 'blue' :
                          'green'
                        }-5 transition-colors cursor-pointer`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-12 rounded-full ${
                              inquiry.priority === 'high' ? 'bg-burgundy' :
                              inquiry.priority === 'medium' ? 'bg-blue' :
                              'bg-green'
                            }`} />
                            <div>
                              <p className="font-bold text-sm text-blue">{inquiry.id}</p>
                              <p className="text-sm font-medium">{inquiry.customer}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{inquiry.job}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{inquiry.quantityRange}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(inquiry.status)} border`}>
                            {inquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={`${getPriorityColor(inquiry.priority)} border capitalize`}>
                              {inquiry.priority}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{inquiry.dueDate}</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Inquiry Details</DialogTitle>
                        <DialogDescription>{inquiry.id}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Customer</Label>
                            <p className="mt-1 font-medium">{inquiry.customer}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <div className="mt-1">
                              <Badge className={`${getStatusColor(inquiry.status)} border`}>
                                {inquiry.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Job Name</Label>
                          <p className="mt-1 font-medium">{inquiry.job}</p>
                          <p className="text-sm text-muted-foreground">SKU: {inquiry.sku}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Quantity Range</Label>
                            <p className="mt-1">{inquiry.quantityRange}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Priority</Label>
                            <div className="mt-1">
                              <Badge className={`${getPriorityColor(inquiry.priority)} border capitalize`}>
                                {inquiry.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Date</Label>
                            <p className="mt-1">{inquiry.date}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Due Date</Label>
                            <p className="mt-1">{inquiry.dueDate}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Notes</Label>
                          <p className="mt-1">{inquiry.notes}</p>
                        </div>
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
