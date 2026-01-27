"use client"
import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CheckCircle2, Clock, AlertCircle, Search, RefreshCw, Mic } from "lucide-react"
import { TableSettingsButton } from "@/components/ui/table-settings"
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table'
import { ThemeProvider } from '@mui/material/styles'
import { mrtTheme } from '@/lib/mrt-theme'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TruncatedText } from "@/components/truncated-text"
import { getForms } from "@/lib/api/projects"
import { clientLogger } from "@/lib/logger"

const pnOrders = [
  {
    id: "PN-2024-001",
    pnReqNo: "REQ-2024-1001",
    customer: "TechStart Inc",
    job: "Corrugated Boxes",
    commercialId: "COM-2024-001",
    fgMaterial: "FG-CORR-9081",
    amount: 450000,
    quantity: "9000 units",
    status: "Arrived",
    prePressStatus: "Complete",
    productionStatus: "Completed",
    dispatchStatus: "Dispatched",
    punchedDate: "2024-01-10",
    releasedDate: "2024-01-12",
    dispatchedDate: "2024-01-18",
    initiateDate: "2024-01-08",
    progress: 100,
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    notes: "Successfully delivered to customer",
    description: "Printed corrugated shipping boxes",
    rmType: "Paperboard",
    procurementQty: "9,000 units",
    plant: "Plant B",
    orderDate: "2024-01-05",
    expectedDelivery: "2024-01-18",
  },
  {
    id: "PN-2024-002",
    pnReqNo: "REQ-2024-1005",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    commercialId: "COM-2024-002",
    fgMaterial: "FG-FOLD-5523",
    amount: 275000,
    quantity: "6500 units",
    status: "Not Arrived",
    prePressStatus: "Approved",
    productionStatus: "In PDD",
    dispatchStatus: "Pending",
    punchedDate: "2024-01-14",
    releasedDate: "2024-01-15",
    dispatchedDate: null,
    initiateDate: "2024-01-12",
    progress: 60,
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    notes: "Production in progress, expected dispatch: 2024-01-22",
    description: "Premium folding cartons - matte finish",
    rmType: "Coated Board",
    procurementQty: "6,500 units",
    plant: "Plant A",
    orderDate: "2024-01-10",
    expectedDelivery: "2024-01-24",
  },
  {
    id: "PN-2024-003",
    pnReqNo: "REQ-2024-1010",
    customer: "Swift Logistics",
    job: "Custom Labels",
    commercialId: "COM-2024-003",
    fgMaterial: "FG-LBL-7720",
    amount: 195000,
    quantity: "12000 units",
    status: "Not Arrived",
    prePressStatus: "In Review",
    productionStatus: "Released",
    dispatchStatus: "Pending",
    punchedDate: "2024-01-16",
    releasedDate: "2024-01-17",
    dispatchedDate: null,
    initiateDate: "2024-01-15",
    progress: 35,
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    notes: "Released to production floor",
    description: "Logistics barcode and brand labels",
    rmType: "Vinyl",
    procurementQty: "12,000 units",
    plant: "Plant D",
    orderDate: "2024-01-14",
    expectedDelivery: "2024-01-29",
  },
]

const STATUS_THEME: Record<string, { badge: string; accent: string }> = {
  "Sample Approved": {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  "Sales Approval": {
    badge: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
    accent: "bg-indigo-500",
  },
  Clarification: {
    badge: "bg-amber-400/20 text-amber-700 border-amber-400/30",
    accent: "bg-amber-500",
  },
  "In PDD": {
    badge: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    accent: "bg-sky-500",
  },
  Approved: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  "In Review": {
    badge: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
    accent: "bg-cyan-500",
  },
  Complete: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  Completed: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  Pending: {
    badge: "bg-amber-400/20 text-amber-700 border-amber-400/30",
    accent: "bg-amber-500",
  },
  Released: {
    badge: "bg-violet-500/15 text-violet-700 border-violet-500/30",
    accent: "bg-violet-500",
  },
  Scheduled: {
    badge: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    accent: "bg-sky-500",
  },
  Dispatched: {
    badge: "bg-teal-500/15 text-teal-700 border-teal-500/30",
    accent: "bg-teal-500",
  },
  Arrived: {
    badge: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  "Not Arrived": {
    badge: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    accent: "bg-rose-500",
  },
  "In Progress": {
    badge: "bg-amber-400/20 text-amber-700 border-amber-400/30",
    accent: "bg-amber-500",
  },
}

function getStatusBadge(status: string) {
  return STATUS_THEME[status]?.badge ?? "bg-slate-200 text-slate-600 border-slate-300"
}

function getStatusAccent(status: string) {
  return STATUS_THEME[status]?.accent ?? "bg-slate-300"
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Sample Approved":
    case "Approved":
    case "Complete":
    case "Completed":
    case "Dispatched":
    case "Arrived":
      return CheckCircle2
    case "Sales Approval":
    case "In Review":
    case "In PDD":
    case "Released":
    case "Clarification":
    case "Scheduled":
    case "In Progress":
      return Clock
    case "Pending":
    case "Not Arrived":
      return AlertCircle
    default:
      return Clock
  }
}

function mapArtworkStage(status: string) {
  switch (status) {
    case "Approved":
      return "Approved"
    case "In Review":
      return "Awaiting Approval"
    case "Pending":
      return "In Prepress"
    case "Clarification":
      return "Clarification"
    default:
      return status
  }
}

function mapBomRoutingStage(status: string) {
  switch (status) {
    case "Complete":
    case "Completed":
      return "Completed"
    case "Pending":
      return "In MDGT"
    case "Clarification":
      return "Clarification"
    default:
      return status
  }
}

function formatBomRoutingStatus(bomStatus: string, routingStatus: string) {
  const bomStage = mapBomRoutingStage(bomStatus)
  const routingStage = mapBomRoutingStage(routingStatus)
  if (bomStage === routingStage) {
    return bomStage
  }
  return `${bomStage} / ${routingStage}`
}

interface ProjectsContentProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function ProjectsContent({ activeTab = "sdo", onTabChange }: ProjectsContentProps) {
  // API Data states
  const [sdoProjects, setSdoProjects] = useState<any[]>([])
  const [jdoProjects, setJdoProjects] = useState<any[]>([])
  const [commercialOrders, setCommercialOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search states (one per tab)
  const [sdoSearch, setSdoSearch] = useState("")
  const [jdoSearch, setJdoSearch] = useState("")
  const [comSearch, setComSearch] = useState("")
  const [pnSearch, setPnSearch] = useState("")

  // Dialog states for detail views
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Table settings state
  const tableColumns = [
    { id: 'hod', label: 'HOD Name' },
    { id: 'kam', label: 'KAM Name' },
    { id: 'id', label: 'ID / Customer' },
    { id: 'job', label: 'Job Details' },
    { id: 'location', label: 'Location / Plant' },
    { id: 'status', label: 'Status' },
    { id: 'progress', label: 'Progress' },
  ]
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    hod: true, kam: true, id: true, job: true, location: true, status: true, progress: true
  })
  const [columnOrder, setColumnOrder] = useState<string[]>(['hod', 'kam', 'id', 'job', 'location', 'status', 'progress'])
  const [tableSortColumn, setTableSortColumn] = useState<string>('')
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('asc')
  const resetTableSettings = () => {
    setColumnVisibility({ hod: true, kam: true, id: true, job: true, location: true, status: true, progress: true })
    setColumnOrder(['hod', 'kam', 'id', 'job', 'location', 'status', 'progress'])
    setTableSortColumn('')
    setTableSortDirection('asc')
  }

  // Filtered data (search only, MRT handles pagination)
  const filteredSDO = sdoProjects.filter(p => {
    const matchesSearch =
      p.id?.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.customer?.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.job?.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.quoteId?.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.executionLocation?.toLowerCase().includes(sdoSearch.toLowerCase()) ||
      p.productionPlant?.toLowerCase().includes(sdoSearch.toLowerCase())
    return matchesSearch
  })

  const filteredJDO = jdoProjects.filter(p => {
    const matchesSearch =
      p.id?.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.customer?.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.job?.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.sdoId?.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.prePressPlant?.toLowerCase().includes(jdoSearch.toLowerCase()) ||
      p.productionPlant?.toLowerCase().includes(jdoSearch.toLowerCase())
    return matchesSearch
  })

  const filteredCommercial = commercialOrders.filter(p => {
    const matchesSearch =
      p.id?.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.customer?.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.job?.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.jdoId?.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.quantity?.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.prePressPlant?.toLowerCase().includes(comSearch.toLowerCase()) ||
      p.productionPlant?.toLowerCase().includes(comSearch.toLowerCase())
    return matchesSearch
  })

  const filteredPN = pnOrders.filter(p => {
    const matchesSearch =
      p.id?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.customer?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.job?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.commercialId?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.quantity?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.pnReqNo?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.fgMaterial?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.rmType?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.plant?.toLowerCase().includes(pnSearch.toLowerCase()) ||
      p.initiateDate?.toLowerCase().includes(pnSearch.toLowerCase())
    return matchesSearch
  })

  // MRT Column definitions for SDO - id must match tableColumns for visibility to work
  const sdoColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    {
      id: 'hod',
      accessorKey: 'hodName',
      header: 'HOD Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.hodName || "N/A"}</p>,
    },
    {
      id: 'kam',
      accessorKey: 'kamName',
      header: 'KAM Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.kamName || "N/A"}</p>,
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID / Customer',
      size: 180,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <p className="text-sm font-semibold text-primary">{row.original.id}</p>
          <TruncatedText text={row.original.customer} limit={25} className="text-sm text-muted-foreground" />
        </div>
      ),
    },
    {
      id: 'job',
      accessorKey: 'job',
      header: 'Job Details',
      size: 220,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <TruncatedText text={row.original.job} limit={30} className="text-sm font-semibold text-foreground" />
          <p className="text-xs text-muted-foreground">Quote {row.original.quoteId}</p>
        </div>
      ),
    },
    {
      id: 'location',
      accessorKey: 'executionLocation',
      header: 'Execution Location',
      size: 180,
      Cell: ({ row }) => <span className="text-sm">{row.original.executionLocation || '-'}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      size: 160,
      Cell: ({ row }) => {
        const StatusIcon = getStatusIcon(row.original.status)
        return (
          <Badge className={`${getStatusBadge(row.original.status)} border`}>
            <StatusIcon className="mr-1.5 h-3 w-3" />
            {row.original.status}
          </Badge>
        )
      },
    },
  ], [])

  // MRT Column definitions for JDO - id must match tableColumns for visibility to work
  const jdoColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    {
      id: 'hod',
      accessorKey: 'hodName',
      header: 'HOD Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.hodName || "N/A"}</p>,
    },
    {
      id: 'kam',
      accessorKey: 'kamName',
      header: 'KAM Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.kamName || "N/A"}</p>,
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID / Customer',
      size: 180,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <p className="text-sm font-semibold text-primary">{row.original.id}</p>
          <TruncatedText text={row.original.customer} limit={25} className="text-sm text-muted-foreground" />
        </div>
      ),
    },
    {
      id: 'job',
      accessorKey: 'job',
      header: 'Job Details',
      size: 220,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <TruncatedText text={row.original.job} limit={30} className="text-sm font-semibold text-foreground" />
          <p className="text-xs text-muted-foreground">SDO {row.original.sdoId}</p>
        </div>
      ),
    },
    {
      id: 'location',
      accessorKey: 'prePressPlant',
      header: 'Pre-Press Plant',
      size: 180,
      Cell: ({ row }) => <span className="text-sm">{row.original.prePressPlant || '-'}</span>,
    },
    {
      id: 'status',
      accessorKey: 'artworkStatus',
      header: 'Artwork',
      size: 120,
      Cell: ({ row }) => {
        const StatusIcon = getStatusIcon(row.original.artworkStatus)
        return (
          <Badge className={`${getStatusBadge(row.original.artworkStatus)} border`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {row.original.artworkStatus}
          </Badge>
        )
      },
    },
    {
      id: 'progress',
      accessorKey: 'bomStatus',
      header: 'BOM',
      size: 120,
      Cell: ({ row }) => {
        const StatusIcon = getStatusIcon(row.original.bomStatus)
        return (
          <Badge className={`${getStatusBadge(row.original.bomStatus)} border`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {row.original.bomStatus}
          </Badge>
        )
      },
    },
  ], [])

  // MRT Column definitions for Commercial - id must match tableColumns for visibility to work
  const commercialColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    {
      id: 'hod',
      accessorKey: 'hodName',
      header: 'HOD Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.hodName || "N/A"}</p>,
    },
    {
      id: 'kam',
      accessorKey: 'kamName',
      header: 'KAM Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.kamName || "N/A"}</p>,
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID / Customer',
      size: 180,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <p className="text-sm font-semibold text-primary">{row.original.id}</p>
          <TruncatedText text={row.original.customer} limit={25} className="text-sm text-muted-foreground" />
        </div>
      ),
    },
    {
      id: 'job',
      accessorKey: 'job',
      header: 'Job Details',
      size: 220,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <TruncatedText text={row.original.job} limit={30} className="text-sm font-semibold text-foreground" />
          <p className="text-xs text-muted-foreground">JDO {row.original.jdoId}</p>
        </div>
      ),
    },
    {
      id: 'location',
      accessorKey: 'prePressPlant',
      header: 'Pre-Press Plant',
      size: 160,
      Cell: ({ row }) => <span className="text-sm">{row.original.prePressPlant || '-'}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      size: 140,
      Cell: ({ row }) => {
        const StatusIcon = getStatusIcon(row.original.status)
        return (
          <Badge className={`${getStatusBadge(row.original.status)} border`}>
            <StatusIcon className="mr-1.5 h-3 w-3" />
            {row.original.status}
          </Badge>
        )
      },
    },
  ], [])

  // MRT Column definitions for PN - id must match tableColumns for visibility to work
  const pnColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    {
      id: 'hod',
      accessorKey: 'hodName',
      header: 'HOD Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.hodName || "N/A"}</p>,
    },
    {
      id: 'kam',
      accessorKey: 'kamName',
      header: 'KAM Name',
      size: 150,
      Cell: ({ row }) => <p className="text-sm font-medium text-foreground">{row.original.kamName || "N/A"}</p>,
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID / Customer',
      size: 180,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <p className="text-sm font-semibold text-primary">{row.original.id}</p>
          <TruncatedText text={row.original.customer} limit={25} className="text-sm text-muted-foreground" />
        </div>
      ),
    },
    {
      id: 'job',
      accessorKey: 'job',
      header: 'Job Details',
      size: 220,
      Cell: ({ row }) => (
        <div className="leading-[1.15]">
          <TruncatedText text={row.original.job} limit={30} className="text-sm font-semibold text-foreground" />
          <p className="text-xs text-muted-foreground">Commercial {row.original.commercialId}</p>
        </div>
      ),
    },
    {
      id: 'location',
      accessorKey: 'plant',
      header: 'Plant',
      size: 120,
      Cell: ({ row }) => <span className="text-sm">{row.original.plant || '-'}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      size: 140,
      Cell: ({ row }) => {
        const StatusIcon = getStatusIcon(row.original.status)
        return (
          <Badge className={`${getStatusBadge(row.original.status)} border`}>
            <StatusIcon className="mr-1.5 h-3 w-3" />
            {row.original.status}
          </Badge>
        )
      },
    },
    {
      id: 'progress',
      accessorKey: 'progress',
      header: 'Progress',
      size: 120,
      Cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#005180]"
              style={{ width: `${row.original.progress || 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{row.original.progress || 0}%</span>
        </div>
      ),
    },
  ], [])

  // Fetch SDO data
  useEffect(() => {
    const fetchSDOData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getForms({ FormType: "SDO" })
        if (result.success && result.data) {
          // Parse FormDataJSON and map to component structure
          const parsedData = result.data.map((item: any) => {
            try {
              const formData = JSON.parse(item.FormDataJSON || '{}')
              return {
                id: item.FormNo || `SDO-${item.ID}`,
                customer: formData.customerName || "N/A",
                job: "SDO Project",
                quoteId: formData.quoteId || "N/A",
                executionLocation: formData.executionLocation || "N/A",
                productionPlant: formData.productionPlant || "N/A",
                status: formData.status || "In PDD",
                progress: formData.progress || 0,
                createdDate: formData.date || new Date(item.CreatedDate).toISOString().split('T')[0],
                approvedDate: formData.approvedDate || null,
                kamName: formData.kamName || "N/A",
                hodName: formData.hodName || "N/A",
                notes: formData.specialInstructions || "",
                history: formData.history || [],
                // Include all form fields
                ...formData
              }
            } catch (e) {
              clientLogger.log("Error parsing SDO form data:", e)
              return null
            }
          }).filter(Boolean)
          setSdoProjects(parsedData)
        } else {
          setError(result.error || "Failed to fetch SDO data")
        }
      } catch (err) {
        clientLogger.log("Error fetching SDO data:", err)
        setError("Failed to load SDO projects")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSDOData()
  }, [])

  // Fetch JDO data
  useEffect(() => {
    const fetchJDOData = async () => {
      try {
        const result = await getForms({ FormType: "JDO" })
        if (result.success && result.data) {
          const parsedData = result.data.map((item: any) => {
            try {
              const formData = JSON.parse(item.FormDataJSON || '{}')
              return {
                id: item.FormNo || `JDO-${item.ID}`,
                customer: formData.customerName || "N/A",
                job: formData.jobName || "JDO Project",
                sdoId: formData.sdoId || "N/A",
                prePressPlant: formData.prepressPlant || "N/A",
                productionPlant: formData.productionPlant || "N/A",
                artworkStatus: formData.artworkStatus || "Pending",
                bomStatus: formData.bomStatus || "Pending",
                routingStatus: formData.routingStatus || "Pending",
                progress: formData.progress || 0,
                createdDate: formData.date || new Date(item.CreatedDate).toISOString().split('T')[0],
                kamName: formData.kamName || "N/A",
                hodName: formData.hodName || "N/A",
                notes: formData.specialInstructions || "",
                mfReleased: formData.mfReleased || false,
                ...formData
              }
            } catch (e) {
              clientLogger.log("Error parsing JDO form data:", e)
              return null
            }
          }).filter(Boolean)
          setJdoProjects(parsedData)
        }
      } catch (err) {
        clientLogger.log("Error fetching JDO data:", err)
      }
    }

    fetchJDOData()
  }, [])

  // Fetch Commercial data
  useEffect(() => {
    const fetchCommercialData = async () => {
      try {
        const result = await getForms({ FormType: "Commercial" })
        if (result.success && result.data) {
          const parsedData = result.data.map((item: any) => {
            try {
              const formData = JSON.parse(item.FormDataJSON || '{}')
              return {
                id: item.FormNo || `COM-${item.ID}`,
                customer: formData.customerName || "N/A",
                job: formData.jobName || "Commercial Order",
                jdoId: formData.jdoId || "N/A",
                prePressPlant: formData.prepressPlant || "N/A",
                productionPlant: formData.productionPlant || "N/A",
                prePressStatus: formData.prePressStatus || "Pending",
                productionStatus: formData.productionStatus || "Pending",
                dispatchStatus: formData.dispatchStatus || "Pending",
                amount: formData.amount || 0,
                quantity: formData.quantity || "N/A",
                status: formData.status || "In Review",
                orderDate: formData.date || new Date(item.CreatedDate).toISOString().split('T')[0],
                expectedDelivery: formData.expectedDelivery || "N/A",
                progress: formData.progress || 0,
                kamName: formData.kamName || "N/A",
                hodName: formData.hodName || "N/A",
                notes: formData.specialInstructions || "",
                ...formData
              }
            } catch (e) {
              clientLogger.log("Error parsing Commercial form data:", e)
              return null
            }
          }).filter(Boolean)
          setCommercialOrders(parsedData)
        }
      } catch (err) {
        clientLogger.log("Error fetching Commercial data:", err)
      }
    }

    fetchCommercialData()
  }, [])

  // Note: MRT handles pagination internally, no need to reset pages manually

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* SDO Tab */}
        <TabsContent value="sdo">
          <div className="relative mb-6 w-full flex gap-3 items-center">
            <div className="relative flex-1">
              <Mic
                onClick={() => alert("Voice input feature coming soon")}
                className="pointer-events-auto absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-[#005180] hover:text-[#004875] transition-colors duration-200 z-10"
              />
              <Search className="pointer-events-none absolute left-12 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your SDO by ID, customer, job, or location..."
                value={sdoSearch}
                onChange={(e) => setSdoSearch(e.target.value)}
                className="h-12 rounded-full border-2 border-[#005180] bg-white pl-20 pr-4 text-base font-medium focus-visible:ring-2 focus-visible:ring-[#005180]/40 focus-visible:border-[#005180] placeholder:truncate"
              />
            </div>
            <TableSettingsButton
              storageKey="projects-sdo"
              columns={tableColumns}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
              sortColumn={tableSortColumn}
              setSortColumn={setTableSortColumn}
              sortDirection={tableSortDirection}
              setSortDirection={setTableSortDirection}
              onReset={resetTableSettings}
            />
          </div>

          <ThemeProvider theme={mrtTheme}>
            <MaterialReactTable
              columns={sdoColumns}
              data={filteredSDO}
              enableTopToolbar={false}
              enableBottomToolbar={true}
              enableColumnActions={false}
              enableColumnFilters={false}
              enablePagination={true}
              enableSorting={true}
              enableGlobalFilter={false}
              initialState={{ pagination: { pageSize: 20, pageIndex: 0 } }}
              state={{
                columnVisibility,
                sorting: tableSortColumn ? [{ id: tableSortColumn, desc: tableSortDirection === 'desc' }] : [],
              }}
              onColumnVisibilityChange={setColumnVisibility}
              muiTablePaperProps={{
                sx: { boxShadow: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }
              }}
              muiTableContainerProps={{ sx: { maxHeight: '600px' } }}
              muiTableHeadRowProps={{
                sx: { backgroundColor: '#005180 !important', '& th': { backgroundColor: '#005180 !important' } }
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: '#005180 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  fontSize: '0.75rem !important',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '14px 20px !important',
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                  borderBottom: 'none !important',
                  '&:last-child': { borderRight: 'none' },
                  '&:hover': { backgroundColor: '#005180 !important' },
                }
              }}
              muiTableBodyRowProps={({ row }) => ({
                onClick: () => {
                  setSelectedProject(row.original)
                  setDetailDialogOpen(true)
                },
                sx: {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(120, 190, 32, 0.2)' },
                  '&:nth-of-type(even)': { backgroundColor: 'rgba(185, 34, 33, 0.05)' },
                }
              })}
              muiTableBodyCellProps={{ sx: { fontSize: '0.875rem', padding: '16px' } }}
              muiPaginationProps={{ rowsPerPageOptions: [10, 20, 50], showFirstButton: false, showLastButton: false }}
              renderEmptyRowsFallback={() => (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No SDO projects found</p>
                </div>
              )}
            />
          </ThemeProvider>
        </TabsContent>


        {/* JDO Tab */}
        <TabsContent value="jdo">
          <div className="relative mb-6 w-full flex gap-3 items-center">
            <div className="relative flex-1">
              <Mic
                onClick={() => alert("Voice input feature coming soon")}
                className="pointer-events-auto absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-[#005180] hover:text-[#004875] transition-colors duration-200 z-10"
              />
              <Search className="pointer-events-none absolute left-12 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your JDO by ID, customer, job, or plant..."
                value={jdoSearch}
                onChange={(e) => setJdoSearch(e.target.value)}
                className="h-12 rounded-full border-2 border-[#005180] bg-white pl-20 pr-4 text-base font-medium focus-visible:ring-2 focus-visible:ring-[#005180]/40 focus-visible:border-[#005180] placeholder:truncate"
              />
            </div>
            <TableSettingsButton
              storageKey="projects-jdo"
              columns={tableColumns}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
              sortColumn={tableSortColumn}
              setSortColumn={setTableSortColumn}
              sortDirection={tableSortDirection}
              setSortDirection={setTableSortDirection}
              onReset={resetTableSettings}
            />
          </div>

          <ThemeProvider theme={mrtTheme}>
            <MaterialReactTable
              columns={jdoColumns}
              data={filteredJDO}
              enableTopToolbar={false}
              enableBottomToolbar={true}
              enableColumnActions={false}
              enableColumnFilters={false}
              enablePagination={true}
              enableSorting={true}
              enableGlobalFilter={false}
              initialState={{ pagination: { pageSize: 20, pageIndex: 0 } }}
              state={{
                columnVisibility,
                sorting: tableSortColumn ? [{ id: tableSortColumn, desc: tableSortDirection === 'desc' }] : [],
              }}
              onColumnVisibilityChange={setColumnVisibility}
              muiTablePaperProps={{
                sx: { boxShadow: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }
              }}
              muiTableContainerProps={{ sx: { maxHeight: '600px' } }}
              muiTableHeadRowProps={{
                sx: { backgroundColor: '#005180 !important', '& th': { backgroundColor: '#005180 !important' } }
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: '#005180 !important',
                  color: 'white !important',
                  fontWeight: 'bold !important',
                  fontSize: '0.75rem !important',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '14px 20px !important',
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                  borderBottom: 'none !important',
                  '&:last-child': { borderRight: 'none' },
                  '&:hover': { backgroundColor: '#005180 !important' },
                }
              }}
              muiTableBodyRowProps={({ row }) => ({
                onClick: () => {
                  setSelectedProject(row.original)
                  setDetailDialogOpen(true)
                },
                sx: {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(120, 190, 32, 0.2)' },
                  '&:nth-of-type(even)': { backgroundColor: 'rgba(185, 34, 33, 0.05)' },
                }
              })}
              muiTableBodyCellProps={{ sx: { fontSize: '0.875rem', padding: '16px' } }}
              muiPaginationProps={{ rowsPerPageOptions: [10, 20, 50], showFirstButton: false, showLastButton: false }}
              renderEmptyRowsFallback={() => (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No JDO projects found</p>
                </div>
              )}
            />
          </ThemeProvider>
        </TabsContent>


        {/* Commercial Tab */}
        <TabsContent value="commercial">
          <div className="relative mb-6 w-full flex gap-3 items-center">
            <div className="relative flex-1">
              <Mic
                onClick={() => alert("Voice input feature coming soon")}
                className="pointer-events-auto absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-[#005180] hover:text-[#004875] transition-colors duration-200 z-10"
              />
              <Search className="pointer-events-none absolute left-12 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your commercial orders by ID, customer, or job..."
                value={comSearch}
                onChange={(e) => setComSearch(e.target.value)}
                className="h-12 rounded-full border-2 border-[#005180] bg-white pl-20 pr-4 text-base font-medium focus-visible:ring-2 focus-visible:ring-[#005180]/40 focus-visible:border-[#005180] placeholder:truncate"
              />
            </div>
            <TableSettingsButton
              storageKey="projects-commercial"
              columns={tableColumns}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
              sortColumn={tableSortColumn}
              setSortColumn={setTableSortColumn}
              sortDirection={tableSortDirection}
              setSortDirection={setTableSortDirection}
              onReset={resetTableSettings}
            />
          </div>

          <ThemeProvider theme={mrtTheme}>
            <MaterialReactTable
              columns={commercialColumns}
              data={filteredCommercial}
              enableTopToolbar={false}
              enableBottomToolbar={true}
              enableColumnActions={false}
              enableColumnFilters={false}
              enablePagination={true}
              enableSorting={true}
              enableGlobalFilter={false}
              initialState={{ pagination: { pageSize: 20, pageIndex: 0 } }}
              state={{
                columnVisibility,
                sorting: tableSortColumn ? [{ id: tableSortColumn, desc: tableSortDirection === 'desc' }] : [],
              }}
              onColumnVisibilityChange={setColumnVisibility}
              muiTablePaperProps={{
                elevation: 0,
                sx: { borderRadius: '8px', border: '1px solid #e5e7eb' },
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: '#005180',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '14px 20px',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:last-child': { borderRight: 'none' },
                },
              }}
              muiTableBodyRowProps={({ row }) => ({
                onClick: () => {
                  setSelectedProject(row.original)
                  setDetailDialogOpen(true)
                },
                sx: {
                  backgroundColor: row.index % 2 === 0 ? 'white' : 'rgba(185, 34, 33, 0.05)',
                  '&:hover': { backgroundColor: 'rgba(120, 190, 32, 0.2)' },
                  cursor: 'pointer',
                },
              })}
              muiTableBodyCellProps={{
                sx: { padding: '16px' },
              }}
              renderEmptyRowsFallback={() => (
                <div className="text-center py-8 text-muted-foreground">
                  No commercial orders found
                </div>
              )}
            />
          </ThemeProvider>
        </TabsContent>

        {/* PN Tab */}
        <TabsContent value="pn">
          <div className="relative mb-6 w-full flex gap-3 items-center">
            <div className="relative flex-1">
              <Mic
                onClick={() => alert("Voice input feature coming soon")}
                className="pointer-events-auto absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-[#005180] hover:text-[#004875] transition-colors duration-200 z-10"
              />
              <Search className="pointer-events-none absolute left-12 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find your PN by number, request, or customer..."
                value={pnSearch}
                onChange={(e) => setPnSearch(e.target.value)}
                className="h-12 rounded-full border-2 border-[#005180] bg-white pl-20 pr-4 text-base font-medium focus-visible:ring-2 focus-visible:ring-[#005180]/40 focus-visible:border-[#005180] placeholder:truncate"
              />
            </div>
            <TableSettingsButton
              storageKey="projects-pn"
              columns={tableColumns}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
              sortColumn={tableSortColumn}
              setSortColumn={setTableSortColumn}
              sortDirection={tableSortDirection}
              setSortDirection={setTableSortDirection}
              onReset={resetTableSettings}
            />
          </div>

          <ThemeProvider theme={mrtTheme}>
            <MaterialReactTable
              columns={pnColumns}
              data={filteredPN}
              enableTopToolbar={false}
              enableBottomToolbar={true}
              enableColumnActions={false}
              enableColumnFilters={false}
              enablePagination={true}
              enableSorting={true}
              enableGlobalFilter={false}
              initialState={{ pagination: { pageSize: 20, pageIndex: 0 } }}
              state={{
                columnVisibility,
                sorting: tableSortColumn ? [{ id: tableSortColumn, desc: tableSortDirection === 'desc' }] : [],
              }}
              onColumnVisibilityChange={setColumnVisibility}
              muiTablePaperProps={{
                elevation: 0,
                sx: { borderRadius: '8px', border: '1px solid #e5e7eb' },
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: '#005180',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '14px 20px',
                  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:last-child': { borderRight: 'none' },
                },
              }}
              muiTableBodyRowProps={({ row }) => ({
                onClick: () => {
                  setSelectedProject(row.original)
                  setDetailDialogOpen(true)
                },
                sx: {
                  backgroundColor: row.index % 2 === 0 ? 'white' : 'rgba(185, 34, 33, 0.05)',
                  '&:hover': { backgroundColor: 'rgba(120, 190, 32, 0.2)' },
                  cursor: 'pointer',
                },
              })}
              muiTableBodyCellProps={{
                sx: { padding: '16px' },
              }}
              renderEmptyRowsFallback={() => (
                <div className="text-center py-8 text-muted-foreground">
                  No PN orders found
                </div>
              )}
            />
          </ThemeProvider>
        </TabsContent>
      </Tabs>

      {/* Project Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="surface-elevated max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="border-b border-border/60 bg-primary/10 px-6 py-5 flex-shrink-0">
            <DialogTitle className="text-lg font-semibold text-foreground">
              {selectedProject?.job || selectedProject?.id || "Project Details"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedProject?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 py-6 overflow-y-auto overflow-x-hidden flex-1">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Customer</Label>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedProject?.customer || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">HOD Name</Label>
                <p className="mt-1 text-sm text-foreground/80">{selectedProject?.hodName || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">KAM Name</Label>
                <p className="mt-1 text-sm text-foreground/80">{selectedProject?.kamName || "N/A"}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Plant</Label>
                <p className="mt-1 text-sm text-foreground/80">{selectedProject?.plant || selectedProject?.productionPlant || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className={`${getStatusBadge(selectedProject?.status || "Pending")} border px-3 py-1 text-sm font-semibold`}>
                    {selectedProject?.status || "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
            {selectedProject?.progress !== undefined && (
              <div>
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress</Label>
                <div className="mt-1 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{selectedProject?.progress}%</p>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-border/80">
                    <div
                      className={`${getStatusAccent(selectedProject?.status || "Pending")} h-full transition-all`}
                      style={{ width: `${selectedProject?.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            {selectedProject?.notes && (
              <div>
                <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes</Label>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{selectedProject?.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
