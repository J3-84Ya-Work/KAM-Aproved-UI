"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, SlidersHorizontal, ArrowUpCircle, Share2, Calendar, Mic, CheckCircle2, XCircle, Download } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getQuotationDetail } from '@/lib/api-config'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TruncatedText } from "@/components/truncated-text"
import { isHOD, isVerticalHead, isKAM, getViewableKAMs } from "@/lib/permissions"
import { QuotationsAPI } from "@/lib/api/enquiry"

// REMOVED: Static data - using API now
/*
const quotations = [
  {
    id: "QUO-2024-045",
    inquiryId: "INQ-2024-001",
    customer: "Metro Supplies",
    job: "Folding Cartons",
    amount: 245000,
    margin: 12.5,
    validTill: "2024-01-18",
    status: "Quoted",
    internalStatus: "Not Updated",
    internalStatusNote: "",
    approvalLevel: "L1",
    createdDate: "2024-01-15",
    notes: "Standard pricing applied",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    history: [
      { stage: "Inquiry Received", date: "2024-01-10" },
      { stage: "Costing Completed", date: "2024-01-13" },
      { stage: "Quoted", date: "2024-01-15" },
    ],
  },
  {
    id: "QUO-2024-046",
    inquiryId: "INQ-2024-002",
    customer: "Prime Packaging",
    job: "Die-Cut Boxes",
    amount: 185000,
    margin: 8.2,
    validTill: "2024-01-20",
    status: "Sent to HOD",
    internalStatus: "In Progress",
    internalStatusNote: "Waiting for HOD response",
    approvalLevel: "L2",
    createdDate: "2024-01-14",
    notes: "Low margin - requires L2 approval",
    kamName: "Priya Sharma",
    hodName: "Kavita Reddy",
    history: [
      { stage: "Inquiry Received", date: "2024-01-09" },
      { stage: "Costing Completed", date: "2024-01-11" },
      { stage: "Quotation Drafted", date: "2024-01-13" },
      { stage: "Sent to HOD", date: "2024-01-14" },
    ],
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
    internalStatus: "Approved",
    internalStatusNote: "",
    approvalLevel: "L1",
    createdDate: "2024-01-13",
    notes: "Good margin - approved",
    kamName: "Amit Patel",
    hodName: "Suresh Menon",
    history: [
      { stage: "Inquiry Received", date: "2024-01-08" },
      { stage: "Quotation Drafted", date: "2024-01-11" },
      { stage: "Sent to HOD", date: "2024-01-12" },
      { stage: "Approved", date: "2024-01-13" },
    ],
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
    internalStatus: "Not Updated",
    internalStatusNote: "",
    approvalLevel: "L1",
    createdDate: "2024-01-12",
    notes: "Premium pricing - customer accepted",
    kamName: "Rajesh Kumar",
    hodName: "Suresh Menon",
    history: [
      { stage: "Inquiry Received", date: "2024-01-06" },
      { stage: "Quotation Drafted", date: "2024-01-08" },
      { stage: "Sent to HOD", date: "2024-01-09" },
      { stage: "Approved", date: "2024-01-10" },
      { stage: "Sent to Customer", date: "2024-01-12" },
    ],
  },
  {
    id: "QUO-2024-049",
    inquiryId: "INQ-2024-005",
    customer: "Global Traders",
    job: "Printed Labels",
    amount: 95000,
    margin: 6.5,
    validTill: "2024-01-19",
    status: "Disapproved",
    internalStatus: "Disapproved",
    internalStatusNote: "",
    approvalLevel: "L2",
    createdDate: "2024-01-11",
    notes: "Margin too low - disapproved by L2",
    kamName: "Sneha Gupta",
    hodName: "Kavita Reddy",
    history: [
      { stage: "Inquiry Received", date: "2024-01-05" },
      { stage: "Quotation Drafted", date: "2024-01-07" },
      { stage: "Sent to HOD", date: "2024-01-08" },
      { stage: "Disapproved", date: "2024-01-09" },
    ],
  },
]
*/

const STATUS_BADGES: Record<string, string> = {
  Quoted: "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30",
  Approved: "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30",
  "Sent to HOD": "bg-[#005180]/15 text-[#005180] border-[#005180]/30",
  "Sent to Customer": "bg-[#005180]/20 text-[#005180] border-[#005180]/40",
  Disapproved: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
  Rejected: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
}

const STATUS_ACCENTS: Record<string, string> = {
  Quoted: "bg-[#78BE20]",
  Approved: "bg-[#78BE20]",
  "Sent to HOD": "bg-[#005180]",
  "Sent to Customer": "bg-[#005180]",
  Disapproved: "bg-[#B92221]",
  Rejected: "bg-[#B92221]",
}

const INTERNAL_STATUS_BADGES: Record<string, string> = {
  "Approved": "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30 font-semibold",
  "Disapproved": "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30 font-semibold",
  "In Progress": "bg-[#005180]/15 text-[#005180] border-[#005180]/30 font-semibold",
  "Not Updated": "bg-gray-100 text-gray-500 border-gray-300",
}

function getStatusBadge(status: string) {
  return STATUS_BADGES[status] ?? "bg-slate-200 text-slate-600 border-slate-300"
}

function getInternalStatusBadge(status: string) {
  return INTERNAL_STATUS_BADGES[status] ?? "bg-gray-100 text-gray-500 border-gray-300"
}

function getStatusAccent(status: string) {
  return STATUS_ACCENTS[status] ?? "bg-slate-300"
}

function getMarginColor(margin: number) {
  if (margin >= 15) return "text-[#78BE20]"
  if (margin >= 10) return "text-[#005180]"
  return "text-[#B92221]"
}

function getMarginBadge(margin: number) {
  if (margin >= 15) return "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30"
  if (margin >= 10) return "bg-[#005180]/15 text-[#005180] border-[#005180]/30"
  return "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30"
}

export function QuotationsContent() {
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const isKAMUser = isKAM() // Check if user is KAM role
  const isHODUser = isHOD() // Check if user is HOD role

  // API state
  const [quotations, setQuotations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [internalStatusFilter, setInternalStatusFilter] = useState("all")
  const [hodFilter, setHodFilter] = useState("all")
  const [kamFilter, setKamFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [userIsHOD, setUserIsHOD] = useState(false)
  const [userIsVerticalHead, setUserIsVerticalHead] = useState(false)
  const [userIsKAM, setUserIsKAM] = useState(false)
  const [internalStatusMap, setInternalStatusMap] = useState<Record<string, string>>({})
  const [internalStatusNoteMap, setInternalStatusNoteMap] = useState<Record<string, string>>({})
  const [isSendingForApproval, setIsSendingForApproval] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<string | null>(null)
  const itemsPerPage = 20

  // Fetch quotations from API
  const fetchQuotations = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await QuotationsAPI.getQuotations(
          {
            FilterSTR: 'All',
            FromDate: '2024-10-01',
            ToDate: '2026-10-10',
          },
          null
        )


        if (response.success && response.data && response.data.length > 0) {
          // Transform API data
          const transformedData = response.data.map((item: any) => {
            // Extract numeric values from QuotedCost (remove "INR" and parse)
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

                // Format as DD-MMM-YYYY
                const day = String(validTillDate.getDate()).padStart(2, '0')
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                const month = months[validTillDate.getMonth()]
                const year = validTillDate.getFullYear()
                validTill = `${day}-${month}-${year}`
              } catch (e) {
                validTill = '-'
              }
            }

            return {
              id: item.BookingNo,
              bookingId: item.BookingID, // Numeric BookingID for API calls
              inquiryId: item.EnquiryNo || '-',
              customer: item.ClientName,
              job: item.JobName,
              amount: finalCost,
              quotedCost: quotedCost,
              quotedCostDisplay: item.QuotedCost || '0 INR',
              finalCost: finalCost,
              margin: marginPercent,
              validTill: validTill,
              status: item.Status || 'Quoted', // Use Status from API
              internalStatus: item.IsInternalApproved ? 'Approved' : item.IsSendForInternalApproval ? 'Pending Approval' : 'Not Updated',
              internalStatusNote: item.RemarkInternalApproved || '',
              approvalLevel: '-',
              createdDate: item.CreatedDate,
              notes: item.QuoteRemark || '',
              kamName: item.SalesEmployeeName || '-',
              hodName: '-',
              history: [],
              // Raw data for reference
              rawData: item
            }
          })

          setQuotations(transformedData)
        } else {
          setError(response.error || 'No quotations found')
          setQuotations([])
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading quotations')
        setQuotations([])
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    fetchQuotations()
  }, [])

  useEffect(() => {
    // Check user role on component mount
    setUserIsHOD(isHOD())
    setUserIsVerticalHead(isVerticalHead())
    setUserIsKAM(isKAM())
  }, [])

  // Handle sending quotation for approval
  const handleSendForApproval = async (bookingId: string | number, approvalType: 'HOD' | 'VerticalHead') => {
    if (!bookingId) {
      alert('Invalid quotation ID')
      return
    }

    setIsSendingForApproval(true)
    try {
      const bookingIdStr = String(bookingId)

      const response = await QuotationsAPI.sendForApproval({
        BookingID: bookingIdStr,
        ApprovalType: approvalType
      }, null)

      if (response.success) {
        alert(`✅ Quotation sent to ${approvalType} successfully!\nThe quotation will now appear in the ${approvalType} approvals page.`)
        setSelectedQuotation(null)
        await fetchQuotations()
      } else {
        alert(`❌ Failed to send quotation to ${approvalType}: ${response.error}`)
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setIsSendingForApproval(false)
    }
  }

  // Handle downloading quotation PDF
  const handleDownloadQuotation = async (bookingId: string | number | undefined) => {
    if (!bookingId) {
      alert('Invalid quotation ID: BookingID is missing')
      return
    }

    const bookingIdStr = String(bookingId)
    setIsDownloadingPDF(bookingIdStr)
    try {
      const data = await getQuotationDetail(bookingId)

      // Extract data from response - API returns arrays with different property names
      const mainDataArray = data.Main || data.mainData || data.MainData || []
      const detailsDataArray = data.Datails || data.Details || data.detailsData || data.DetailsData || []
      const priceDataArray = data.Price || data.priceData || data.PriceData || []

      // Get first item from arrays
      const mainData = mainDataArray[0] || {}
      const detailsData = detailsDataArray[0] || {}
      const priceData = priceDataArray[0] || {}

      // Generate PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      let yPos = 15

      // Company Header
      if (mainData.CompanyName) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(mainData.CompanyName, 105, yPos, { align: 'center' })
        yPos += 5

        if (mainData.CompanyAddress || mainData.ContactNO) {
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          const companyInfo = [
            mainData.CompanyAddress || '',
            mainData.ContactNO ? `Tel: ${mainData.ContactNO}` : '',
            mainData.CompanyEmail ? `Email: ${mainData.CompanyEmail}` : ''
          ].filter(Boolean).join(' | ')
          pdf.text(companyInfo, 105, yPos, { align: 'center' })
          yPos += 7
        }
      }

      // Title with Quotation and Booking Numbers
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('QUOTATION', 105, yPos, { align: 'center' })
      yPos += 10

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const quotationNumber = mainData.QuotationNo || mainData.BookingNo || bookingId
      pdf.text(`Quotation No: ${quotationNumber}`, 15, yPos)
      if (mainData.BookingNo) {
        pdf.text(`Booking No: ${mainData.BookingNo}`, 140, yPos)
      }
      yPos += 5
      pdf.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 15, yPos)
      yPos += 10

      // Client Information
      autoTable(pdf, {
        startY: yPos,
        head: [],
        body: [
          ['Client Name', ':', mainData.LedgerName || 'N/A'],
          ['To,', ':', mainData.LedgerName || 'N/A'],
          mainData.Address ? ['', '', mainData.Address] : null,
          ['Subject', ':', `Quotation For : ${mainData.JobName || 'N/A'}`],
          mainData.ConcernPerson ? ['Kind Attention', ':', mainData.ConcernPerson] : null,
          mainData.EmailTo ? ['Email', ':', mainData.EmailTo] : null,
          mainData.ContactNO ? ['Phone', ':', mainData.ContactNO] : null,
        ].filter(row => row !== null && row[2] !== ''),
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: 'bold' },
          1: { cellWidth: 5 },
          2: { cellWidth: 150 }
        }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 10

      // Product Details with Pricing
      const taxAmount = priceData.GrandTotalCost - priceData.Amount || 0
      autoTable(pdf, {
        startY: yPos,
        body: [
          ['Product Name', ':', mainData.JobName || 'N/A', 'Quantity', (priceData.PlanContQty || 0).toLocaleString()],
          ['Product Code', ':', mainData.ProductCode || priceData.ProductCode || 'N/A', 'Unit Cost', `${priceData.CurrencySymbol || 'INR'} ${(priceData.UnitCost || 0).toFixed(2)}`],
          ['Category', ':', detailsData.CategoryName || priceData.CategoryName || 'N/A', 'Sub Total', `${priceData.CurrencySymbol || 'INR'} ${(priceData.Amount || 0).toLocaleString()}`],
          ['Carton Type', ':', detailsData.Content_Name || 'N/A', 'Tax Amount', `${priceData.CurrencySymbol || 'INR'} ${taxAmount.toFixed(2)}`],
          ['Date', ':', mainData.Job_Date || priceData.Job_Date || 'N/A', 'Grand Total', `${priceData.CurrencySymbol || 'INR'} ${(priceData.GrandTotalCost || 0).toLocaleString()}`]
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 30 },
          1: { cellWidth: 5 },
          2: { cellWidth: 60 },
          3: { fontStyle: 'bold', cellWidth: 30 },
          4: { cellWidth: 65, halign: 'right' }
        }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 10

      // Technical Specifications
      autoTable(pdf, {
        startY: yPos,
        body: [
          ['Content Name', ':', detailsData.Content_Name || 'N/A', 'Job Size', detailsData.Job_Size || 'N/A'],
          ['Color/Printing', ':', detailsData.Printing || 'N/A', 'Job Size (Inch)', detailsData.Job_Size_In_Inches || 'N/A'],
          ['Paper Details', ':', detailsData.Paper || 'N/A', 'Job Size (Details)', detailsData.JobSizeDetails || 'N/A'],
          ['Paper Supplied By', ':', detailsData.Paperby || 'N/A', 'Category', detailsData.CategoryName || 'N/A'],
          detailsData.Operatios ? ['Operations', ':', detailsData.Operatios, '', ''] : null,
        ].filter(row => row !== null),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 30 },
          1: { cellWidth: 5 },
          2: { cellWidth: 55 },
          3: { fontStyle: 'bold', cellWidth: 30 },
          4: { cellWidth: 40 }
        }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 15

      // Signature Section
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('For ' + (mainData.CompanyName || 'Company Name'), 15, yPos)
      pdf.text('Customer Acceptance', 140, yPos)
      yPos += 15

      pdf.setFont('helvetica', 'normal')
      pdf.text('_____________________', 15, yPos)
      pdf.text('_____________________', 140, yPos)
      yPos += 5
      pdf.text('Authorized Signatory', 15, yPos)
      pdf.text('Customer Signature', 140, yPos)

      // Footer
      yPos = 280
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      pdf.text('This is a computer-generated quotation and does not require a signature.', 105, yPos, { align: 'center' })

      // Save PDF
      pdf.save(`Quotation-${quotationNumber}.pdf`)

    } catch (error: any) {
      alert(`❌ Failed to download quotation: ${error.message}`)
    } finally {
      setIsDownloadingPDF(null)
    }
  }

  // Filter data based on user role - KAMs can only see their own data
  // DISABLED: Show all quotations for now
  const userFilteredQuotations = quotations

  // Get unique HOD and KAM names for filters
  const hodNames = Array.from(new Set(userFilteredQuotations.map(q => q.hodName).filter((name): name is string => Boolean(name))))
  const kamNames = Array.from(new Set(userFilteredQuotations.map(q => q.kamName).filter((name): name is string => Boolean(name))))
  const sourceNames = Array.from(new Set(userFilteredQuotations.map(q => q.Source || 'KAM APP')))

  const filteredQuotations = userFilteredQuotations
    .filter((quotation) => {
      const matchesSearch =
        quotation.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.inquiryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.amount.toString().includes(searchQuery) ||
        (quotation.kamName && quotation.kamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (quotation.hodName && quotation.hodName.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === "all" || quotation.status === statusFilter
      const matchesInternalStatus = internalStatusFilter === "all" || quotation.internalStatus === internalStatusFilter
      const matchesHod = hodFilter === "all" || quotation.hodName === hodFilter
      const matchesKam = kamFilter === "all" || quotation.kamName === kamFilter
      const matchesSource = sourceFilter === "all" || quotation.Source === sourceFilter || (!quotation.Source && sourceFilter === "KAM APP")

      return matchesSearch && matchesStatus && matchesInternalStatus && matchesHod && matchesKam && matchesSource
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, internalStatusFilter, hodFilter, kamFilter, sortBy])

  const handleOpenQuotation = (quotation: (typeof quotations)[0]) => {
    setSelectedQuotation(quotation)
  }

  return (
    <div className="section-spacing">
      <div className="relative w-full flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Find your quotations by customer, job, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:truncate"
          />
        </div>
        <Mic
          onClick={() => alert("Voice input feature coming soon")}
          className="h-6 w-6 text-[#005180] cursor-pointer hover:text-[#004875] transition-colors duration-200 flex-shrink-0"
        />
      </div>

      <Card className="surface-elevated overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#005180] to-[#003d63] hover:bg-gradient-to-r hover:from-[#005180] hover:to-[#003d63]">
                  {!isKAMUser && !isHODUser && (
                    <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
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
                  {!isKAMUser && (
                    <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
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
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    ID / Inquiry
                  </TableHead>
                  <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Customer
                  </TableHead>
                  <TableHead className="w-[240px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Job & Validity
                  </TableHead>
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                          <Filter className="h-4 w-4 text-white" />
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-[180px]">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Quoted">Quoted</SelectItem>
                          <SelectItem value="Sent to HOD">Sent to HOD</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Sent to Customer">Sent to Customer</SelectItem>
                          <SelectItem value="Disapproved">Disapproved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                  {isKAMUser && (
                    <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white text-right">
                      Actions
                    </TableHead>
                  )}
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    <div className="flex items-center justify-between">
                      <span>Internal Status</span>
                      <Select value={internalStatusFilter} onValueChange={setInternalStatusFilter}>
                        <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                          <Filter className="h-4 w-4 text-white" />
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-[180px]">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Not Updated">Not Updated</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Disapproved">Disapproved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    <div className="flex items-center justify-between">
                      <span>Source</span>
                      <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                          <Filter className="h-4 w-4 text-white" />
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-[150px]">
                          <SelectItem value="all">All Sources</SelectItem>
                          {sourceNames.map(source => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuotations.map((quotation, index) => (
                  <Dialog key={quotation.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className="group cursor-pointer border-b border-border/40 bg-white transition-all duration-200 even:bg-[#B92221]/5 hover:bg-[#78BE20]/20 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                        onClick={() => handleOpenQuotation(quotation)}
                      >
                        {!isKAMUser && !isHODUser && (
                          <TableCell className="py-4">
                            <p className="text-sm font-medium text-foreground">{quotation.hodName || "N/A"}</p>
                          </TableCell>
                        )}
                        {!isKAMUser && (
                          <TableCell className="py-4">
                            <p className="text-sm font-medium text-foreground">{quotation.kamName || "N/A"}</p>
                          </TableCell>
                        )}
                        <TableCell className="py-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-primary">{quotation.id}</p>
                            <p className="text-xs text-muted-foreground">Inquiry {quotation.inquiryId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <TruncatedText text={quotation.customer} limit={25} className="text-sm font-medium text-foreground block" />
                          <p className="text-xs text-muted-foreground">Created {quotation.createdDate}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-0.5">
                            <TruncatedText text={quotation.job} limit={30} className="text-sm font-semibold text-foreground" />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Valid till {quotation.validTill}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`${getStatusBadge(quotation.status)} border`}>{quotation.status}</Badge>
                          {quotation.status === "Quoted" && (
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
                              Level {quotation.approvalLevel}
                            </p>
                          )}
                        </TableCell>
                        {isKAMUser && (
                          <TableCell className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            {/* Show different actions based on status */}
                            {quotation.status === 'Approved' ? (
                              // Approved quotations: Show Send to Customer, Share, and Download
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-[#78BE20]/10 text-[#78BE20] border-[#78BE20]/30 hover:bg-[#78BE20]/20"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    alert(`Sending ${quotation.id} to customer`)
                                  }}
                                >
                                  <ArrowUpCircle className="h-3 w-3 mr-1" />
                                  Send to Customer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-[#005180]/10 text-[#005180] border-[#005180]/30 hover:bg-[#005180]/20"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    alert(`Sharing ${quotation.id}`)
                                  }}
                                >
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Share
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadQuotation(quotation.bookingId)
                                  }}
                                  disabled={isDownloadingPDF === quotation.bookingId}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {isDownloadingPDF === quotation.bookingId ? 'Downloading...' : 'Download'}
                                </Button>
                              </div>
                            ) : quotation.status === 'Sent to HOD' || quotation.status === 'Sent to Vertical Head' ? (
                              // Pending approval: Show status text and Download
                              <div className="flex justify-end gap-2 items-center">
                                <span className="text-xs text-muted-foreground italic">Pending Approval</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadQuotation(quotation.bookingId)
                                  }}
                                  disabled={isDownloadingPDF === quotation.bookingId}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {isDownloadingPDF === quotation.bookingId ? 'Downloading...' : 'Download'}
                                </Button>
                              </div>
                            ) : quotation.status === 'Disapproved' ? (
                              // Disapproved: Show status text and Download
                              <div className="flex justify-end gap-2 items-center">
                                <span className="text-xs text-rose-600 font-medium italic">Disapproved</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadQuotation(quotation.bookingId)
                                  }}
                                  disabled={isDownloadingPDF === quotation.bookingId}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  {isDownloadingPDF === quotation.bookingId ? 'Downloading...' : 'Download'}
                                </Button>
                              </div>
                            ) : (
                              // Other statuses (Costing, Quoted, etc.): Show approval buttons based on margin
                              <div className="flex justify-end gap-2">
                                {/* Margin < 5%: Send to Vertical Head */}
                                {quotation.margin < 5 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs bg-[#005180]/10 text-[#005180] border-[#005180]/30 hover:bg-[#005180]/20"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      alert(`Sending ${quotation.id} to Vertical Head`)
                                    }}
                                  >
                                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                                    Send to VH
                                  </Button>
                                )}
                                {/* Margin 5% to 10%: Send to HOD */}
                                {quotation.margin >= 5 && quotation.margin < 10 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs bg-[#B92221]/10 text-[#B92221] border-[#B92221]/30 hover:bg-[#B92221]/20"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      alert(`Sending ${quotation.id} to HOD`)
                                    }}
                                  >
                                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                                    Send to HOD
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                          {isKAMUser ? (
                            <div className="space-y-2">
                              <Select
                                value={internalStatusMap[quotation.id] || quotation.internalStatus}
                                onValueChange={(value) => {
                                  setInternalStatusMap({ ...internalStatusMap, [quotation.id]: value })
                                }}
                              >
                                <SelectTrigger className="w-full border-border/60">
                                  <Badge className={`${getInternalStatusBadge(internalStatusMap[quotation.id] || quotation.internalStatus)} border text-xs`}>
                                    {internalStatusMap[quotation.id] || quotation.internalStatus}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Not Updated">
                                    <Badge className={`${getInternalStatusBadge("Not Updated")} border text-xs`}>
                                      Not Updated
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="In Progress">
                                    <Badge className={`${getInternalStatusBadge("In Progress")} border text-xs`}>
                                      In Progress
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="Approved">
                                    <Badge className={`${getInternalStatusBadge("Approved")} border text-xs`}>
                                      Approved
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="Disapproved">
                                    <Badge className={`${getInternalStatusBadge("Disapproved")} border text-xs`}>
                                      Disapproved
                                    </Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {(internalStatusMap[quotation.id] === "In Progress" || (quotation.internalStatus === "In Progress" && !internalStatusMap[quotation.id])) && (
                                <Input
                                  placeholder="Enter progress note..."
                                  value={internalStatusNoteMap[quotation.id] || quotation.internalStatusNote || ""}
                                  onChange={(e) => {
                                    setInternalStatusNoteMap({ ...internalStatusNoteMap, [quotation.id]: e.target.value })
                                  }}
                                  className="text-xs h-8"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                            </div>
                          ) : (
                            <Badge className={`${getInternalStatusBadge(quotation.internalStatus)} border`}>
                              {quotation.internalStatus}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-700">{quotation.Source || 'KAM APP'}</span>
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="surface-elevated max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
                      <DialogHeader className="border-b-0 bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-5 flex-shrink-0">
                        <div className="flex items-start justify-between gap-4 pr-8">
                          <div className="flex-1 text-left">
                            <DialogTitle className="text-xl font-bold text-gray-900">{selectedQuotation?.job}</DialogTitle>
                            <DialogDescription className="text-sm font-semibold text-gray-600 mt-1">
                              {selectedQuotation?.id}
                            </DialogDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 mr-2">
                            <div className="text-sm font-semibold text-gray-600">
                              {selectedQuotation?.createdDate}
                            </div>
                            {selectedQuotation && (
                              <Badge className={`${getStatusBadge(selectedQuotation.status)} border text-xs px-3 py-1`}>
                                {selectedQuotation.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </DialogHeader>
                      {selectedQuotation && (
                        <div className="space-y-0 overflow-y-auto overflow-x-hidden flex-1">
                          {/* Customer Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Customer</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.customer}</p>
                          </div>

                          {/* KAM Name Section */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">KAM Name</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.kamName || "N/A"}</p>
                          </div>

                          {/* Quoted Cost Section */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Quoted Cost</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.quotedCostDisplay}</p>
                          </div>

                          {/* Final Cost Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Final Cost</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.finalCost.toFixed(2)} INR</p>
                          </div>

                          {/* Margin Percentage Section */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Margin %</Label>
                            <Badge className={`${getMarginBadge(selectedQuotation.margin)} border text-sm px-3 py-1`}>
                              {selectedQuotation.margin.toFixed(2)}%
                            </Badge>
                          </div>

                          {/* Approval Level Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Approval Level</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.approvalLevel}</p>
                          </div>

                          {/* Valid Till Section */}
                          <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Valid Till</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.validTill}</p>
                          </div>

                          {/* Inquiry Section */}
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Inquiry</Label>
                            <p className="text-base font-semibold text-gray-900">{selectedQuotation.inquiryId}</p>
                          </div>

                          {/* Journey Section */}
                          {selectedQuotation.history?.length ? (
                            <div className="bg-white px-6 py-4 border-b border-gray-200">
                              <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-3 block">Journey</Label>
                              <div className="space-y-3">
                                {selectedQuotation.history.map((step: any, stepIndex: number) => {
                                  const isCurrent =
                                    stepIndex === selectedQuotation.history.length - 1 &&
                                    step.stage === selectedQuotation.status
                                  return (
                                    <div key={`${selectedQuotation.id}-step-${step.stage}`} className="flex items-start gap-3">
                                      <span
                                        className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                                          isCurrent ? getStatusAccent(selectedQuotation.status) : "bg-gray-400"
                                        }`}
                                      />
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">{step.stage}</p>
                                        <p className="text-xs text-gray-500">{step.date}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-border/60 bg-muted/30 px-6 py-4">
                        {selectedQuotation && (
                          <>
                            {/* Left side - Status/Workflow buttons (only for KAM users) */}
                            <div className="flex flex-wrap gap-2">
                              {userIsKAM && (
                                <>
                                  {selectedQuotation.status === 'Approved' ? (
                                    <>
                                      <Button
                                        size="sm"
                                        className="rounded-lg bg-[#78BE20] text-white hover:bg-[#78BE20]/90"
                                        onClick={() => {
                                          alert(`Sending ${selectedQuotation.id} to customer`)
                                        }}
                                      >
                                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                                        Send to Customer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg border-border/60"
                                        onClick={() => {
                                          alert(`Sharing ${selectedQuotation.id}`)
                                        }}
                                      >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                      </Button>
                                    </>
                                  ) : selectedQuotation.status === 'Sent to HOD' || selectedQuotation.status === 'Sent to Vertical Head' ? (
                                    <span className="text-sm text-muted-foreground italic">Awaiting approval...</span>
                                  ) : selectedQuotation.status === 'Disapproved' ? (
                                    <span className="text-sm text-rose-600 font-medium">This quotation was disapproved</span>
                                  ) : (
                                    <>
                                      {/* Margin < 8%: Send to HOD */}
                                      {selectedQuotation.margin < 8 && selectedQuotation.margin >= 5 && (
                                        <Button
                                          size="sm"
                                          className="rounded-lg bg-[#B92221] text-white hover:bg-[#B92221]/90"
                                          onClick={() => handleSendForApproval(selectedQuotation.bookingId, 'HOD')}
                                          disabled={isSendingForApproval}
                                        >
                                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                                          {isSendingForApproval ? 'Sending...' : 'Send to HOD'}
                                        </Button>
                                      )}

                                      {/* Margin < 5%: Send to Vertical Head */}
                                      {selectedQuotation.margin < 5 && (
                                        <Button
                                          size="sm"
                                          className="rounded-lg bg-[#005180] text-white hover:bg-[#005180]/90"
                                          onClick={() => handleSendForApproval(selectedQuotation.bookingId, 'VerticalHead')}
                                          disabled={isSendingForApproval}
                                        >
                                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                                          {isSendingForApproval ? 'Sending...' : 'Send to Vertical Head'}
                                        </Button>
                                      )}

                                      {/* Margin between 8% and 10%: Show Send to HOD option */}
                                      {selectedQuotation.margin >= 8 && selectedQuotation.margin < 10 && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-lg border-[#B92221] text-[#B92221] hover:bg-[#B92221]/10"
                                          onClick={() => handleSendForApproval(selectedQuotation.bookingId, 'HOD')}
                                          disabled={isSendingForApproval}
                                        >
                                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                                          {isSendingForApproval ? 'Sending...' : 'Send to HOD'}
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Right side - Download button (always visible for everyone) */}
                            <div className="flex justify-end sm:justify-start">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100"
                                onClick={() => handleDownloadQuotation(selectedQuotation.bookingId)}
                                disabled={isDownloadingPDF === selectedQuotation.bookingId}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {isDownloadingPDF === selectedQuotation.bookingId ? 'Downloading...' : 'Download PDF'}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </div>
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
