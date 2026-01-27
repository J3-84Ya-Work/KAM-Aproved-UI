"use client"
import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Upload, CheckCircle2, XCircle, AlertCircle, Mic } from "lucide-react"
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
import { getViewableKAMs, isHOD } from "@/lib/permissions"

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
  const isKAM = viewableKams.length === 1 // KAM can only see themselves
  const isHODUser = isHOD() // HOD user check

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // API state
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Table settings state
  const tableColumns = useMemo(() => [
    { id: 'hodName', label: 'HOD' },
    { id: 'kamName', label: 'KAM Name' },
    { id: 'id', label: 'Customer ID' },
    { id: 'name', label: 'Company Name' },
    { id: 'code', label: 'Customer Code' },
    { id: 'phone', label: 'Contact' },
    { id: 'status', label: 'Status' },
    { id: 'complianceStatus', label: 'Compliance' },
    { id: 'totalOrders', label: 'Total Orders' },
  ], [])

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clients-column-visibility')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) { }
      }
    }
    return {
      hodName: !isKAM && !isHODUser,
      kamName: !isKAM,
    }
  })

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clients-column-order')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) { }
      }
    }
    return tableColumns.map(col => col.id)
  })

  const [tableSortColumn, setTableSortColumn] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clients-sort-column') || ''
    }
    return ''
  })

  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('clients-sort-direction') as 'asc' | 'desc') || 'desc'
    }
    return 'desc'
  })

  const resetTableSettings = () => {
    setColumnVisibility({
      hodName: !isKAM && !isHODUser,
      kamName: !isKAM,
    })
    setColumnOrder(tableColumns.map(col => col.id))
    setTableSortColumn('')
    setTableSortDirection('desc')
  }

  // Fetch customers from GetSbClient API (direct fetch to avoid caching issues)
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('🚀 STARTING CUSTOMER FETCH...')
        setIsLoading(true)
        setError(null)

        // Direct API call
        const response = await fetch('https://api.indusanalytics.co.in/api/planwindow/GetSbClient', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa('parksonsnew:parksonsnew'),
            'CompanyID': '2',
            'UserID': '2',
            'Fyear': '2025-2026',
            'ProductionUnitID': '1',
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 API Response status:', response.ok, response.status)

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        let data = await response.json()
        console.log('📊 Raw data:', data)
        console.log('📊 Data type:', typeof data)

        // Handle triple-encoded JSON string
        if (typeof data === 'string') {
          console.log('📊 Parsing first level...')
          data = JSON.parse(data)
          if (typeof data === 'string') {
            console.log('📊 Parsing second level (triple-encoded)...')
            data = JSON.parse(data)
          }
        }

        console.log('📊 Parsed data:', data)

        // Handle different response formats
        let clientsData = []
        if (Array.isArray(data)) {
          clientsData = data
        } else if (data?.data && Array.isArray(data.data)) {
          clientsData = data.data
        } else if (data?.Data && Array.isArray(data.Data)) {
          clientsData = data.Data
        }

        console.log('📊 Clients data:', clientsData)
        console.log('📊 Clients count:', clientsData.length)

        if (clientsData.length > 0) {
          // Map client data to match the expected format
          const customersArray = clientsData.map((client: any) => {
            console.log('🔍 CLIENT MAPPING - Original:', client)

            const mapped = {
              id: `CUST-${client.LedgerId || client.ledgerId || client.LedgerID || client.id}`,
              ledgerId: client.LedgerId || client.ledgerId || client.LedgerID || client.id,
              name: client.LedgerName || client.ledgerName || client.ClientName || client.name || '-',
              code: (client.LedgerId || client.ledgerId || client.LedgerID || client.id || '').toString(),
              email: '-',
              phone: client.Mobile || client.mobile || client.phone || '-',
              gst: '-',
              pan: '-',
              status: 'Active',
              approvalStatus: '-',
              complianceStatus: '-',
              totalOrders: 0,
              totalValue: 0,
              lastOrder: '-',
              kamName: '-',
              hodName: '-',
              submittedDate: '-',
              creditDays: client.CreditDays || client.creditDays || 0,
              documents: {
                gst: false,
                pan: false,
                agreement: false,
              },
            }

            console.log('🔍 CLIENT MAPPING - Mapped:', mapped)
            return mapped
          })

          console.log('✅ FINAL CUSTOMERS ARRAY:', customersArray)
          console.log('✅ FINAL CUSTOMERS COUNT:', customersArray.length)
          setClients(customersArray)
        } else {
          console.log('⚠️ NO CUSTOMERS FOUND')
          setError('No customers found')
          setClients([])
        }
      } catch (err: any) {
        console.error('❌ Error fetching customers:', err)
        setError(err.message || 'An error occurred while loading customers')
        setClients([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Filter data based on search
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.code && client.code.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  // MRT Column definitions
  const mrtColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    ...(!isKAM && !isHODUser ? [{
      accessorKey: 'hodName',
      header: 'HOD',
      size: 150,
      Cell: ({ row }: any) => (
        <p className="text-sm font-medium text-foreground">{row.original.hodName || "N/A"}</p>
      ),
    }] : []),
    ...(!isKAM ? [{
      accessorKey: 'kamName',
      header: 'KAM Name',
      size: 150,
      Cell: ({ row }: any) => (
        <p className="text-sm font-medium text-foreground">{row.original.kamName || "N/A"}</p>
      ),
    }] : []),
    {
      accessorKey: 'id',
      header: 'Customer ID',
      size: 140,
      Cell: ({ row }: any) => (
        <span className="font-medium text-primary">{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Company Name',
      size: 200,
      Cell: ({ row }: any) => (
        <div>
          <TruncatedText text={row.original.name} limit={25} className="font-medium block" />
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Customer Code',
      size: 130,
      Cell: ({ row }: any) => (
        row.original.code ? (
          <Badge variant="outline">{row.original.code}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Not Created</span>
        )
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      size: 140,
      Cell: ({ row }: any) => (
        <p className="text-sm">{row.original.phone}</p>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      Cell: ({ row }: any) => (
        <Badge variant={getStatusColor(row.original.status)}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: 'complianceStatus',
      header: 'Compliance',
      size: 120,
      Cell: ({ row }: any) => (
        <Badge variant={getComplianceColor(row.original.complianceStatus)}>{row.original.complianceStatus}</Badge>
      ),
    },
    {
      accessorKey: 'totalOrders',
      header: 'Total Orders',
      size: 120,
      Cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.totalOrders}</p>
          <p className="text-xs text-muted-foreground">₹{(row.original.totalValue / 100000).toFixed(1)}L</p>
        </div>
      ),
    },
  ], [isKAM, isHODUser])

  return (
    <div className="space-y-4">
      {/* Search Bar with Table Settings */}
      <div className="relative mb-6 w-full flex gap-3 items-center">
        <div className="relative flex-1">
          <Mic
            onClick={() => alert("Voice input feature coming soon")}
            className="pointer-events-auto absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 cursor-pointer text-[#005180] hover:text-[#004875] transition-colors duration-200 z-10"
          />
          <Search className="pointer-events-none absolute left-12 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Find your customers by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-full border-2 border-[#005180] bg-white pl-20 pr-4 text-base font-medium focus-visible:ring-2 focus-visible:ring-[#005180]/40 focus-visible:border-[#005180] placeholder:truncate"
          />
        </div>
        <TableSettingsButton
          storageKey="clients"
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

      {/* Clients Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading customers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Error loading customers</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <ThemeProvider theme={mrtTheme}>
          <MaterialReactTable
            columns={mrtColumns}
            data={filteredClients}
            enableTopToolbar={false}
            enableBottomToolbar={true}
            enableColumnActions={false}
            enableColumnFilters={false}
            enablePagination={true}
            enableSorting={true}
            enableGlobalFilter={false}
            manualPagination={false}
            initialState={{
              pagination: { pageSize: 20, pageIndex: 0 },
            }}
            state={{
              columnVisibility,
              sorting: tableSortColumn ? [{ id: tableSortColumn, desc: tableSortDirection === 'desc' }] : [],
            }}
            onColumnVisibilityChange={setColumnVisibility}
            muiTablePaperProps={{
              sx: { boxShadow: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }
            }}
            muiTableContainerProps={{
              sx: { maxHeight: '600px' }
            }}
            muiTableHeadRowProps={{
              sx: {
                backgroundColor: '#005180 !important',
                '& th': { backgroundColor: '#005180 !important' }
              }
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
                setSelectedClient(row.original)
                setDetailDialogOpen(true)
              },
              sx: {
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(120, 190, 32, 0.2)' },
                '&:nth-of-type(even)': { backgroundColor: 'rgba(185, 34, 33, 0.05)' },
              }
            })}
            muiTableBodyCellProps={{
              sx: { fontSize: '0.875rem', padding: '16px' }
            }}
            muiPaginationProps={{
              rowsPerPageOptions: [10, 20, 50],
              showFirstButton: false,
              showLastButton: false,
            }}
            renderEmptyRowsFallback={() => (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No customers found</p>
              </div>
            )}
          />
        </ThemeProvider>
      )}

      {/* Client Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
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
                      {selectedClient.documents?.gst ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">GST Certificate</span>
                    </div>
                    {selectedClient.documents?.gst ? (
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
                      {selectedClient.documents?.pan ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">PAN Card</span>
                    </div>
                    {selectedClient.documents?.pan ? (
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
                      {selectedClient.documents?.agreement ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      )}
                      <span className="text-sm">Service Agreement</span>
                    </div>
                    {selectedClient.documents?.agreement ? (
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
    </div>
  )
}
