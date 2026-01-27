"use client"
import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, XCircle, Clock, AlertTriangle, Search, Eye, Mic, Calendar } from "lucide-react"
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
import { getViewableKAMs, isHOD, isVerticalHead } from "@/lib/permissions"
import { QuotationsAPI } from "@/lib/api/enquiry"
import { clientLogger } from "@/lib/logger"

// REMOVED: Hardcoded data - Now using only API data
/* const pendingApprovals = [
  {
    id: "CUST-2024-001",
    type: "Customer Creation",
    customer: "Tech Solutions Ltd",
    customerName: "Tech Solutions Ltd",
    registeredAddress: "123 Business Park, Mumbai",
    gstNumber: "27AABCU9603R1ZX",
    panNumber: "AABCU9603R",
    productsToManufacture: "Printed Cartons, Labels",
    businessValuePerMonth: "₹5,00,000",
    paymentTerms: "30 Days Credit",
    proposedCreditLimit: "₹10,00,000",
    status: "Pending Finance Approval",
    level: "L1",
    kamName: "Priya Singh",
    hodName: "Kavita Reddy",
    requestedBy: "Priya Singh",
    requestedDate: "2024-10-20",
    createdDate: "2024-10-20",
    urgency: "high",
    kamNote: "New customer with strong business potential. Requires quick approval for upcoming order.",
  },
  {
    id: "CUST-2024-002",
    type: "Customer Creation",
    customer: "Prime Industries",
    customerName: "Prime Industries",
    registeredAddress: "456 Industrial Area, Pune",
    gstNumber: "27AABCP1234R1ZY",
    panNumber: "AABCP1234R",
    productsToManufacture: "Corrugated Boxes, Die-Cut Packaging",
    businessValuePerMonth: "₹8,00,000",
    paymentTerms: "45 Days Credit",
    proposedCreditLimit: "₹15,00,000",
    status: "Pending D.V.P Approval",
    level: "L2",
    kamName: "Rajat Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajat Kumar",
    requestedDate: "2024-10-26",
    createdDate: "2024-10-26",
    urgency: "urgent",
    kamNote: "Large order pending. Customer has strong credentials and references from existing clients.",
  },
  {
    id: "QUO-2024-045",
    type: "Quotation",
    inquiryId: "INQ-2024-001",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    amount: 245000,
    margin: 12.5,
    validTill: "2024-01-18",
    status: "Sent to HOD",
    level: "L1",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajesh Kumar",
    requestedDate: "2024-01-15",
    createdDate: "2024-01-15",
    urgency: "normal",
    kamNote: "Customer is requesting competitive pricing due to bulk order. Recommend approval for long-term partnership potential.",
  },
  {
    id: "QUO-2024-046",
    type: "Quotation",
    inquiryId: "INQ-2024-002",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    amount: 185000,
    margin: 8.2,
    validTill: "2024-01-20",
    status: "Sent to HOD",
    level: "L2",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    requestedBy: "Priya Sharma",
    requestedDate: "2024-01-14",
    createdDate: "2024-01-14",
    urgency: "high",
    kamNote: "Urgent requirement for upcoming product launch. Client has tight deadline. Please expedite approval process.",
  },
  {
    id: "QUO-2024-050",
    type: "Quotation",
    inquiryId: "INQ-2024-006",
    customer: "Tech Solutions",
    job: "Custom Cartons",
    amount: 150000,
    margin: 7.5,
    validTill: "2024-01-19",
    status: "Sent to HOD",
    level: "L2",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    requestedBy: "Amit Patel",
    requestedDate: "2024-01-16",
    createdDate: "2024-01-16",
    urgency: "urgent",
    kamNote: "Special pricing needed to match competitor quote. This is a strategic account we cannot afford to lose.",
  },
  {
    id: "CC-004",
    type: "Customer Creation",
    customer: "Innovative Packaging Solutions",
    customerName: "Innovative Packaging Solutions",
    registeredAddress: "789 Corporate Park, Bangalore",
    gstNumber: "27AABCI7890R1ZA",
    panNumber: "AABCI7890R",
    productsToManufacture: "Rigid Boxes, Corrugated Packaging",
    businessValuePerMonth: "₹6,50,000",
    paymentTerms: "30 Days Credit",
    proposedCreditLimit: "₹12,00,000",
    status: "Pending Finance Approval",
    level: "L1",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajesh Kumar",
    requestedDate: "2024-10-28",
    createdDate: "2024-10-28",
    urgency: "normal",
    kamNote: "Established company with good market reputation. Requesting standard credit terms.",
  },
  {
    id: "CC-005",
    type: "Customer Creation",
    customer: "Express Logistics Pvt Ltd",
    customerName: "Express Logistics Pvt Ltd",
    registeredAddress: "321 Transport Nagar, Chennai",
    gstNumber: "29AABCE4567R1ZB",
    panNumber: "AABCE4567R",
    productsToManufacture: "Custom Boxes, Shipping Cartons",
    businessValuePerMonth: "₹4,00,000",
    paymentTerms: "45 Days Credit",
    proposedCreditLimit: "₹8,00,000",
    status: "Pending HOD Approval",
    level: "L1",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    requestedBy: "Amit Patel",
    requestedDate: "2024-10-27",
    createdDate: "2024-10-27",
    urgency: "high",
    kamNote: "New logistics company with strong financials. Urgent approval needed for immediate order.",
  },
  {
    id: "CC-007",
    type: "Customer Creation",
    customer: "Rapid Manufacturing Co",
    customerName: "Rapid Manufacturing Co",
    registeredAddress: "654 Industrial Zone, Hyderabad",
    gstNumber: "29AABCR6789R1ZD",
    panNumber: "AABCR6789R",
    productsToManufacture: "Die-Cut Packaging, Labels",
    businessValuePerMonth: "₹9,00,000",
    paymentTerms: "60 Days Credit",
    proposedCreditLimit: "₹18,00,000",
    status: "Pending D.V.P Approval",
    level: "L2",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    requestedBy: "Priya Sharma",
    requestedDate: "2024-10-29",
    createdDate: "2024-10-29",
    urgency: "urgent",
    kamNote: "Large manufacturing company with substantial order pipeline. High credit limit required.",
  },
]

const approvalHistory = [
  {
    id: "QUO-2024-047",
    type: "Quotation",
    inquiryId: "INQ-2024-003",
    customer: "Swift Logistics",
    job: "Corrugated Sheets",
    amount: 320000,
    margin: 15.8,
    validTill: "2024-01-22",
    status: "Approved",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    requestedBy: "Amit Patel",
    requestedDate: "2024-01-12",
    approvedBy: "Suresh Menon",
    approvedDate: "2024-01-13",
    createdDate: "2024-01-13",
    level: "L1",
    urgency: "normal",
    kamNote: "High volume order with good margin. Customer is a long-term partner with excellent payment history.",
    approvalRemark: "Approved. Good margin and reliable customer. Proceed with quotation.",
  },
  {
    id: "QUO-2024-049",
    type: "Quotation",
    inquiryId: "INQ-2024-005",
    customer: "Global Traders",
    job: "Printed Labels",
    amount: 95000,
    margin: 6.5,
    validTill: "2024-01-19",
    status: "Disapproved",
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    requestedBy: "Sneha Gupta",
    requestedDate: "2024-01-10",
    approvedBy: "Kavita Reddy",
    approvedDate: "2024-01-11",
    createdDate: "2024-01-11",
    level: "L2",
    urgency: "high",
    kamNote: "Customer is price-sensitive. Need competitive pricing to win this order against competitors.",
    approvalRemark: "Disapproved. Margin too low for this type of job. Request revised quotation with minimum 10% margin.",
  },
  {
    id: "QUO-2024-048",
    type: "Quotation",
    inquiryId: "INQ-2024-004",
    customer: "Express Packaging Co.",
    job: "Offset Printed Boxes",
    amount: 275000,
    margin: 13.2,
    validTill: "2024-01-21",
    status: "Approved",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    requestedBy: "Rajesh Kumar",
    requestedDate: "2024-01-11",
    approvedBy: "Suresh Menon",
    approvedDate: "2024-01-12",
    createdDate: "2024-01-12",
    level: "L1",
    urgency: "urgent",
    kamNote: "Urgent requirement. Customer needs quotation by EOD. Strategic account with potential for repeat orders.",
    approvalRemark: "Approved urgently. Good margin and strategic importance. Fast-track this quotation.",
  },
] */

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

interface ApprovalsContentProps {
  showHistory?: boolean
}

export function ApprovalsContent({ showHistory = false }: ApprovalsContentProps) {
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const isKAMUser = viewableKams.length === 1 // KAM can only see themselves
  const isHODUser = isHOD() // HOD user check
  const isVerticalHeadUser = isVerticalHead() // Vertical Head user check

  const [search, setSearch] = useState("")
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [remark, setRemark] = useState("")

  // API state for quotations
  const [quotationsForApproval, setQuotationsForApproval] = useState<any[]>([])
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Table settings state
  const tableColumns = useMemo(() => [
    { id: 'id', label: 'ID' },
    { id: 'customer', label: 'Customer' },
    { id: 'job', label: 'Job' },
    { id: 'quotedCost', label: 'Quoted Cost' },
    { id: 'margin', label: 'Margin' },
    { id: 'requestedBy', label: 'Requested By' },
    { id: 'status', label: 'Status' },
    { id: 'validTill', label: 'Valid Till' },
  ], [])

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approvals-column-visibility')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) { }
      }
    }
    return {}
  })

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('approvals-column-order')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) { }
      }
    }
    return tableColumns.map(col => col.id)
  })

  const [tableSortColumn, setTableSortColumn] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('approvals-sort-column') || ''
    }
    return ''
  })

  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('approvals-sort-direction') as 'asc' | 'desc') || 'desc'
    }
    return 'desc'
  })

  const resetTableSettings = () => {
    setColumnVisibility({})
    setColumnOrder(tableColumns.map(col => col.id))
    setTableSortColumn('')
    setTableSortDirection('desc')
  }

  // Fetch quotations that need approval
  const fetchQuotationsForApproval = async () => {
      try {
        setIsLoadingQuotations(true)

        // Use wide date range to get all quotations
        const requestParams = {
          FilterSTR: 'All',
          FromDate: '2024-10-01',
          ToDate: '2026-10-10',
        }

        const response = await QuotationsAPI.getAllQuotationsForApproval(requestParams, null)

        if (response.success && response.data) {
          // Log total quotations from API
          console.log('📊 Total quotations from API:', response.data.length)
          const uniqueStatuses = [...new Set(response.data.map((item: any) => item.Status))]
          console.log('📊 Unique statuses:', uniqueStatuses)

          // Show breakdown by status
          uniqueStatuses.forEach((status: string) => {
            const count = response.data.filter((item: any) => item.Status === status).length
            const items = response.data.filter((item: any) => item.Status === status).map((item: any) => ({
              BookingNo: item.BookingNo,
              ClientName: item.ClientName,
              Status: item.Status
            }))
            console.log(`📊 Status "${status || '(empty)'}": ${count} quotations`, items)
          })

          // Filter quotations that need approval
          // Show quotations with Status = "Sent to HOD" or "Sent to Vertical Head"
          const pendingQuotations = response.data
            .filter((item: any) => {
              const isCorrectStatus = item.Status === 'Sent to HOD' || item.Status === 'Sent to Vertical Head'
              const notAlreadyProcessed = item.Status !== 'Approved' && item.Status !== 'Disapproved'
              return isCorrectStatus && notAlreadyProcessed
            })
            .map((item: any) => {
              // Extract numeric values from QuotedCost
              const quotedCostStr = item.QuotedCost || '0'
              const quotedCost = typeof quotedCostStr === 'string'
                ? parseFloat(quotedCostStr.replace(/[^\d.]/g, ''))
                : quotedCostStr

              const finalCost = item.FinalCost || 0

              // Use Margin from API (already a percentage)
              const marginPercent = item.Margin || 0

              // Calculate validTill: createdDate + 10 days
              let validTill = '-'
              if (item.CreatedDate) {
                try {
                  const createdDate = new Date(item.CreatedDate)
                  const validTillDate = new Date(createdDate)
                  validTillDate.setDate(validTillDate.getDate() + 10)

                  const day = String(validTillDate.getDate()).padStart(2, '0')
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const month = months[validTillDate.getMonth()]
                  const year = validTillDate.getFullYear()
                  validTill = `${day}-${month}-${year}`
                } catch (e) {
                  validTill = '-'
                }
              }

              // Determine approval level based on margin from API and Status
              // Margin < 5% -> Sent to Vertical Head -> Level L2
              // Margin 5-10% -> Sent to HOD -> Level L1
              let level = 'L1' // Default: HOD approval
              if (item.Status === 'Sent to Vertical Head') {
                level = 'L2' // Vertical Head approval
              } else if (item.Status === 'Sent to HOD') {
                level = 'L1' // HOD approval
              } else if (marginPercent < 5) {
                level = 'L2' // Low margin -> Vertical Head
              }

              return {
                id: item.BookingNo,
                bookingId: item.BookingID || item.BookingId, // Store actual numeric BookingID
                type: 'Quotation',
                inquiryId: item.EnquiryNo || '-',
                customer: item.ClientName,
                job: item.JobName,
                amount: finalCost,
                margin: marginPercent, // Use margin from API
                validTill: validTill,
                status: item.Status || 'Costing', // Use Status from API
                level: level,
                kamName: item.SalesEmployeeName || '-',
                hodName: '-', // Not available in API
                requestedBy: item.SalesEmployeeName || '-',
                requestedDate: item.CreatedDate,
                createdDate: item.CreatedDate,
                urgency: marginPercent < 10 ? 'high' : 'normal',
                kamNote: item.QuoteRemark || '',
                quotedCost: quotedCost,
                quotedCostDisplay: item.QuotedCost || '0 INR',
                finalCost: finalCost,
                rawData: item
              }
            })

          console.log('📊 Pending approvals (Sent to HOD/VH):', pendingQuotations.length)
          console.log('📊 Pending quotations:', pendingQuotations.map((q: any) => ({ id: q.id, status: q.status, customer: q.customer })))

          setQuotationsForApproval(pendingQuotations)
        }
      } catch (error) {
        clientLogger.error('Error fetching quotations for approval:', error)
      } finally {
        setIsLoadingQuotations(false)
      }
    }

  useEffect(() => {
    fetchQuotationsForApproval()
  }, [])

  // Handle approval/rejection
  const handleApprovalAction = async (bookingId: string, status: 'Approved' | 'Disapproved') => {
    if (!bookingId) {
      alert('Invalid quotation ID')
      return
    }

    // Confirm action
    const confirmMessage = status === 'Approved'
      ? `Are you sure you want to APPROVE quotation ${bookingId}?${remark ? `\n\nYour remark: ${remark}` : ''}`
      : `Are you sure you want to REJECT quotation ${bookingId}?${remark ? `\n\nYour remark: ${remark}` : ''}`

    if (!confirm(confirmMessage)) {
      return
    }

    setIsUpdatingStatus(true)
    try {
      // Try adding IsInternalApproved field as well
      const requestBody = {
        BookingID: bookingId,
        Status: status,
        IsInternalApproved: status === 'Approved' ? true : false
      }

      const response = await QuotationsAPI.updateQuotationStatus(requestBody, null)

      if (response.success) {
        alert(`Quotation ${status.toLowerCase()} successfully!${remark ? `\nRemark: ${remark}` : ''}`)
        setRemark("")
        setSelectedApproval(null)

        // Refresh the data from API
        await new Promise(resolve => setTimeout(resolve, 1000))
        await fetchQuotationsForApproval()
      } else {
        alert(`Failed to ${status.toLowerCase()} quotation: ${response.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      clientLogger.error(`Error ${status.toLowerCase()} quotation:`, error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Use only API quotations (no hardcoded data)
  const allPendingApprovals = quotationsForApproval

  // Filter data based on user role - HOD/VH see all quotations sent to them
  const userFilteredPending = (isRestrictedUser && !isHODUser && !isVerticalHeadUser)
    ? allPendingApprovals.filter(a => a.kamName && viewableKams.includes(a.kamName))
    : allPendingApprovals

  // For now, history is empty (only showing pending approvals from API)
  const userFilteredHistory: any[] = []

  // Select data source based on showHistory prop
  const currentData = showHistory ? userFilteredHistory : userFilteredPending

  // Filter by search
  const filteredApprovals = currentData.filter((approval) => {
    const matchesSearch =
      approval.customer.toLowerCase().includes(search.toLowerCase()) ||
      approval.id.toLowerCase().includes(search.toLowerCase()) ||
      ((approval as any).job && (approval as any).job.toLowerCase().includes(search.toLowerCase())) ||
      (approval.kamName && approval.kamName.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  // MRT Column definitions
  const mrtColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    ...(!isKAMUser ? [{
      accessorKey: 'kamName',
      header: 'KAM Name',
      size: 150,
      Cell: ({ row }: any) => (
        <p className="text-sm font-medium text-foreground">{row.original.kamName || "N/A"}</p>
      ),
    }] : []),
    {
      accessorKey: 'type',
      header: 'Type',
      size: 130,
      Cell: ({ row }: any) => (
        <Badge variant="outline" className="font-semibold">
          {row.original.type || "Quotation"}
        </Badge>
      ),
    },
    {
      accessorKey: 'id',
      header: 'Quotation/Customer',
      size: 160,
      Cell: ({ row }: any) => (
        <div className="leading-[1.15]">
          <p className="text-sm font-semibold text-primary">{row.original.id}</p>
          {row.original.inquiryId && (
            <p className="text-xs text-muted-foreground">Inquiry {row.original.inquiryId}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      size: 200,
      Cell: ({ row }: any) => (
        <div className="leading-[1.15]">
          <TruncatedText text={row.original.customer} limit={25} className="text-sm font-medium text-foreground block" />
          <p className="text-xs text-muted-foreground">Created {row.original.createdDate}</p>
        </div>
      ),
    },
    {
      accessorKey: 'job',
      header: 'Details',
      size: 240,
      Cell: ({ row }: any) => (
        row.original.type === "Customer Creation" ? (
          <div className="leading-[1.15]">
            <p className="text-sm font-semibold text-foreground">
              {row.original.productsToManufacture || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              Credit: {row.original.proposedCreditLimit || "N/A"}
            </p>
          </div>
        ) : (
          <div className="leading-[1.15]">
            <TruncatedText text={row.original.job || "N/A"} limit={30} className="text-sm font-semibold text-foreground" />
            {row.original.validTill && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Valid till {row.original.validTill}</span>
              </div>
            )}
          </div>
        )
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      Cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      size: 180,
      enableSorting: false,
      Cell: ({ row }: any) => (
        !showHistory ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                if (row.original.type === 'Quotation') {
                  handleApprovalAction(row.original.bookingId || row.original.id, 'Disapproved')
                } else {
                  alert(`Disapproving ${row.original.id}`)
                }
              }}
              disabled={isUpdatingStatus}
              className="text-xs bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50"
            >
              <XCircle className="h-3 w-3 mr-1" />
              {isUpdatingStatus ? 'Wait...' : 'Reject'}
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (row.original.type === 'Quotation') {
                  handleApprovalAction(row.original.bookingId || row.original.id, 'Approved')
                } else {
                  alert(`Approving ${row.original.id}`)
                }
              }}
              disabled={isUpdatingStatus}
              className="text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isUpdatingStatus ? 'Wait...' : 'Approve'}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedApproval(row.original)
              setDetailDialogOpen(true)
            }}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        )
      ),
    },
  ], [isKAMUser, showHistory, isUpdatingStatus])

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
            placeholder="Find your approvals by ID, customer, or job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-full border-2 border-[#005180] bg-white pl-20 pr-4 text-base font-medium focus-visible:ring-2 focus-visible:ring-[#005180]/40 focus-visible:border-[#005180] placeholder:truncate"
          />
        </div>
        <TableSettingsButton
          storageKey="approvals"
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

      {/* Loading State */}
      {isLoadingQuotations && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin text-[#005180] mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading approvals...</p>
          </div>
        </div>
      )}

      {/* Approvals Table */}
      {!isLoadingQuotations && (
        <ThemeProvider theme={mrtTheme}>
          <MaterialReactTable
            columns={mrtColumns}
            data={filteredApprovals}
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
                setSelectedApproval(row.original)
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
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Approvals Found</h3>
                <p className="text-sm text-muted-foreground">
                  {search ? 'Try adjusting your search.' : 'There are no pending approvals at the moment.'}
                </p>
              </div>
            )}
          />
        </ThemeProvider>
      )}

      {/* Approval Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Approval Details</DialogTitle>
            <DialogDescription>{selectedApproval?.id}</DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 overflow-y-auto overflow-x-hidden flex-1">
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

              {selectedApproval.kamNote && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <Label className="text-sm font-semibold text-blue-900">
                    Note from {selectedApproval.requestedBy}
                  </Label>
                  <p className="mt-2 text-sm text-blue-800 leading-relaxed">
                    {selectedApproval.kamNote}
                  </p>
                </div>
              )}

              {showHistory ? (
                // History view - show approval/disapproval details
                <div className="space-y-4">
                  <div className={`rounded-lg border p-4 ${
                    selectedApproval.status === "Approved"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-rose-200 bg-rose-50/50"
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      {selectedApproval.status === "Approved" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                      <Label className={`text-sm font-semibold ${
                        selectedApproval.status === "Approved"
                          ? "text-emerald-900"
                          : "text-rose-900"
                      }`}>
                        {selectedApproval.status} by {selectedApproval.approvedBy}
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mb-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Action Date</Label>
                        <p className={`text-sm font-medium ${
                          selectedApproval.status === "Approved"
                            ? "text-emerald-800"
                            : "text-rose-800"
                        }`}>
                          {selectedApproval.approvedDate}
                        </p>
                      </div>
                    </div>
                    {selectedApproval.approvalRemark && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Remark</Label>
                        <p className={`mt-1 text-sm leading-relaxed ${
                          selectedApproval.status === "Approved"
                            ? "text-emerald-800"
                            : "text-rose-800"
                        }`}>
                          {selectedApproval.approvalRemark}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Pending view - show action buttons
                <>
                  <div className="space-y-2">
                    <Label htmlFor="remark" className="text-sm font-medium">
                      Remark <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Textarea
                      id="remark"
                      placeholder="Add your remarks or comments here..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This remark will be attached to your approval/disapproval action
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 hover:text-rose-700"
                      onClick={() => {
                        if (selectedApproval.type === 'Quotation') {
                          handleApprovalAction(selectedApproval.bookingId || selectedApproval.id, 'Disapproved')
                        } else {
                          alert(`Disapproving ${selectedApproval.id}${remark ? `\nRemark: ${remark}` : ''}`)
                          setRemark("")
                        }
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {isUpdatingStatus ? 'Processing...' : 'Disapprove'}
                    </Button>
                    <Button
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => {
                        if (selectedApproval.type === 'Quotation') {
                          handleApprovalAction(selectedApproval.bookingId || selectedApproval.id, 'Approved')
                        } else {
                          alert(`Approving ${selectedApproval.id}${remark ? `\nRemark: ${remark}` : ''}`)
                          setRemark("")
                        }
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {isUpdatingStatus ? 'Processing...' : 'Approve'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
