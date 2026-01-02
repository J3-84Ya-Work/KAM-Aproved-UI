"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, SlidersHorizontal, ArrowUpCircle, Share2, Calendar, Mic, CheckCircle2, XCircle, Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getQuotationDetail } from '@/lib/api-config'
import * as XLSX from 'xlsx-js-style'
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

// Parksons Logo - Will be loaded from public folder
const PARKSONS_LOGO_PATH = '/parksons-logo.png'

// Helper function to load image as base64 for PDF
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } else {
        reject(new Error('Could not get canvas context'))
      }
    }
    img.onerror = reject
    img.src = url
  })
}

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
  "Sent to Vertical Head": "bg-[#005180]/15 text-[#005180] border-[#005180]/30",
  "Sent to Customer": "bg-[#005180]/20 text-[#005180] border-[#005180]/40",
  Disapproved: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
  Rejected: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
}

const STATUS_ACCENTS: Record<string, string> = {
  Quoted: "bg-[#78BE20]",
  Approved: "bg-[#78BE20]",
  "Sent to HOD": "bg-[#005180]",
  "Sent to Vertical Head": "bg-[#005180]",
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const itemsPerPage = 20

  // Packing Spec Dialog state
  const [packingSpecDialog, setPackingSpecDialog] = useState<{
    isOpen: boolean
    bookingId: string | number | null
    pdfType: 'vertical' | 'horizontal' | null
  }>({ isOpen: false, bookingId: null, pdfType: null })

  // Message Dialog state for showing success/error messages
  const [messageDialog, setMessageDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info'
  }>({ isOpen: false, title: '', message: '', type: 'info' })

  // Helper function to show message dialog
  const showMessage = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessageDialog({ isOpen: true, title, message, type })
  }

  // Fetch quotations from API
  const fetchQuotations = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await QuotationsAPI.getQuotations(
          {
            FilterSTR: 'All',
            FromDate: '2024-01-01',
            ToDate: '2027-12-31',
          },
          null
        )


        if (response.success && response.data && response.data.length > 0) {
          // Debug: Log status breakdown
          console.log('📊 QUOTATIONS PAGE - Total:', response.data.length)
          console.log('📊 QUOTATIONS PAGE - Statuses:', [...new Set(response.data.map((item: any) => item.Status))])
          console.log('📊 QUOTATIONS PAGE - First 10 quotations:', response.data.slice(0, 10).map((item: any) => ({
            BookingNo: item.BookingNo,
            Status: item.Status,
            ClientName: item.ClientName
          })))

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
      showMessage('Error', 'Invalid quotation ID', 'error')
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
        const approvalName = approvalType === 'VerticalHead' ? 'Vertical Head' : 'HOD'
        showMessage('Success', `Quotation sent to ${approvalName} successfully!\n\nThe quotation will now appear in the ${approvalName} approvals page.`, 'success')
        setSelectedQuotation(null)
        await fetchQuotations()
      } else {
        showMessage('Failed', `Failed to send quotation to ${approvalType}: ${response.error}`, 'error')
      }
    } catch (error: any) {
      showMessage('Error', error.message, 'error')
    } finally {
      setIsSendingForApproval(false)
    }
  }

  // Show Packing Spec dialog before downloading PDF
  const showPackingSpecDialog = (bookingId: string | number, pdfType: 'vertical' | 'horizontal') => {
    setPackingSpecDialog({ isOpen: true, bookingId, pdfType })
  }

  // Handle Packing Spec dialog response
  const handlePackingSpecResponse = (includePackingSpec: boolean) => {
    const { bookingId, pdfType } = packingSpecDialog
    setPackingSpecDialog({ isOpen: false, bookingId: null, pdfType: null })

    if (bookingId && pdfType) {
      if (pdfType === 'vertical') {
        downloadPDFVertical(bookingId, includePackingSpec)
      } else {
        downloadPDFHorizontal(bookingId, includePackingSpec)
      }
    }
  }

  // Handle downloading quotation PDF - VERTICAL FORMAT
  const handleDownloadQuotationVertical = (bookingId: string | number | undefined) => {
    if (!bookingId) {
      showMessage('Error', 'Invalid quotation ID: BookingID is missing', 'error')
      return
    }
    showPackingSpecDialog(bookingId, 'vertical')
  }

  // Actual PDF generation for Vertical format
  const downloadPDFVertical = async (bookingId: string | number, showPackingSpec: boolean) => {
    const bookingIdStr = String(bookingId)
    setIsDownloadingPDF(bookingIdStr)
    try {
      const data = await getQuotationDetail(bookingId)

      // Extract data from response - API returns arrays with different property names
      const mainDataArray = data.Main || data.mainData || data.MainData || []
      const detailsDataArray = data.Datails || data.Details || data.detailsData || data.DetailsData || []
      const priceDataArray = data.Price || data.priceData || data.PriceData || []

      // Get all items from arrays for multiple columns
      const allDetailsData = detailsDataArray.length > 0 ? detailsDataArray : [{}]
      const mainData = mainDataArray[0] || {}
      const priceData = priceDataArray[0] || {}

      // Generate PDF with VERTICAL format - A4 Portrait
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const quotationNumber = mainData.BookingNo || bookingId
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      let yPos = 8

      // ========== HEADER SECTION ==========
      // Company Logo - Parksons
      try {
        // Load logo from public folder
        const logoBase64 = await loadImageAsBase64(PARKSONS_LOGO_PATH)
        // Logo dimensions - maintain aspect ratio (original: 995 x 222)
        const logoWidth = 60  // Width in mm
        const logoHeight = logoWidth * (222 / 995)  // Maintain aspect ratio
        pdf.addImage(logoBase64, 'PNG', 10, yPos, logoWidth, logoHeight)
        yPos += logoHeight + 5
      } catch (logoError) {
        // Fallback if logo fails to load
        console.error('Failed to load logo:', logoError)
        pdf.setDrawColor(200, 200, 200)
        pdf.setFillColor(245, 245, 245)
        pdf.rect(10, yPos, pageWidth - 20, 15, 'FD')
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text('PARKSONS PACKAGING LTD', pageWidth / 2, yPos + 9, { align: 'center' })
        yPos += 20
      }

      // QUOTATION Title - Bold, Underlined, Centered
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      const titleText = 'QUOTATION'
      const titleWidth = pdf.getTextWidth(titleText)
      const titleX = (pageWidth - titleWidth) / 2
      pdf.text(titleText, titleX, yPos)
      // Underline
      pdf.setLineWidth(0.4)
      pdf.line(titleX, yPos + 1, titleX + titleWidth, yPos + 1)

      yPos += 8

      // Client Information Section
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')

      // Client Name
      pdf.setFont('helvetica', 'bold')
      pdf.text('Client Name', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ClientName || mainData.LedgerName || ''}`, 38, yPos)

      yPos += 5

      // To (Mailing Name)
      pdf.setFont('helvetica', 'bold')
      pdf.text('To', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.MailingName || mainData.ClientName || ''}`, 38, yPos)

      yPos += 5

      // Address
      pdf.setFont('helvetica', 'bold')
      pdf.text('Address', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      const address = mainData.Address || ''
      // Handle long addresses - wrap text
      const addressLines = pdf.splitTextToSize(`: ${address}`, pageWidth - 48)
      pdf.text(addressLines, 38, yPos)
      yPos += (addressLines.length * 4)

      yPos += 1

      // Subject
      pdf.setFont('helvetica', 'bold')
      pdf.text('Subject', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.EmailSubject || mainData.JobName || ''}`, 38, yPos)

      yPos += 5

      // Kind Attention
      pdf.setFont('helvetica', 'bold')
      pdf.text('Kind Attention', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ConcernPerson || mainData.ContactPerson || ''}`, 38, yPos)

      yPos += 8
      // ========== END HEADER SECTION ==========

      // Build column headers: S.N., then 1, 2, 3, 4... based on number of items
      const numItems = Math.max(allDetailsData.length, 4) // At least 4 columns
      const colHeaders = ['S.N.']
      for (let i = 1; i <= numItems; i++) {
        colHeaders.push(String(i))
      }

      // Build rows with data for each column
      const jobNameRow = ['Job name']
      const sizeRow = ['Size (MM)']
      const boardSpecsRow = ['Board Specs']
      const printingRow = ['Printing & Value Addition']
      const moqRow = ['MOQ']
      const annualQtyRow = ['Annual Quantity']

      for (let i = 0; i < numItems; i++) {
        const detail = allDetailsData[i] || {}
        jobNameRow.push(mainData.JobName || detail.Content_Name || '')
        sizeRow.push(detail.Job_Size || detail.Job_Size_In_Inches || '')
        boardSpecsRow.push(detail.Paper || '')
        printingRow.push(detail.Printing || '')
        moqRow.push('')
        annualQtyRow.push(i === 0 ? (priceData.PlanContQty || '') : '')
      }

      // Calculate column width for A4 (210mm - 20mm margins = 190mm available)
      const availableWidth = pageWidth - 20
      const labelColWidth = 45
      const dataColWidth = (availableWidth - labelColWidth) / numItems

      // Product Details Table - Vertical layout with multiple columns
      autoTable(pdf, {
        startY: yPos,
        head: [colHeaders],
        body: [
          jobNameRow,
          sizeRow,
          boardSpecsRow,
          printingRow,
          moqRow,
          annualQtyRow,
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.2,
          lineColor: [0, 0, 0]
        },
        bodyStyles: {
          fontSize: 6,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          minCellHeight: 6
        },
        columnStyles: {
          0: { cellWidth: labelColWidth, fontStyle: 'bold', halign: 'left' },
          1: { cellWidth: dataColWidth },
          2: { cellWidth: dataColWidth },
          3: { cellWidth: dataColWidth },
          4: { cellWidth: dataColWidth }
        },
        margin: { left: 10, right: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY

      // Quote Section - "Quote (INR / 1000)" as row label on the left with 1L, 2L, 5L, 10L as sub-row labels
      // Build rows with empty cells for each product column
      const quoteLabelWidth = 30
      const quoteSubLabelWidth = 15
      const quoteDataColWidth = (availableWidth - quoteLabelWidth - quoteSubLabelWidth) / numItems

      const quote1LRow: any[] = [{ content: 'Quote\n(INR/1000)', rowSpan: 4, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } }, { content: '1L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]
      const quote2LRow: any[] = [{ content: '2L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]
      const quote5LRow: any[] = [{ content: '5L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]
      const quote10LRow: any[] = [{ content: '10L', styles: { fontStyle: 'bold' as const, halign: 'center' as const } }]

      // Add empty cells for each product column
      for (let i = 0; i < numItems; i++) {
        quote1LRow.push('')
        quote2LRow.push('')
        quote5LRow.push('')
        quote10LRow.push('')
      }

      autoTable(pdf, {
        startY: yPos,
        body: [
          quote1LRow,
          quote2LRow,
          quote5LRow,
          quote10LRow,
        ],
        theme: 'grid',
        bodyStyles: {
          fontSize: 6,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          minCellHeight: 5
        },
        columnStyles: {
          0: { cellWidth: quoteLabelWidth },
          1: { cellWidth: quoteSubLabelWidth, halign: 'center' },
          2: { cellWidth: quoteDataColWidth },
          3: { cellWidth: quoteDataColWidth },
          4: { cellWidth: quoteDataColWidth },
          5: { cellWidth: quoteDataColWidth }
        },
        margin: { left: 10, right: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // Packing Spec Section - Vertical Format (A4 adjusted) - Only if user requested
      if (showPackingSpec) {
        // Column 0: "Packing Spec" label (rowSpan)
        // Column 1: "Tentative Packing Spec" header spans col 1-2, then field labels
        // Column 2: Values (empty)
        autoTable(pdf, {
          startY: yPos,
          body: [
            [
              { content: 'Packing\nSpec', rowSpan: 12, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } },
              { content: 'Tentative Packing Spec', colSpan: 2, styles: { fontStyle: 'bold' as const, halign: 'center' as const } }
            ],
            ['Shipper box size in MM', ''],
            ['Quantity per shipper box: Packs', ''],
            ['Shipper box Weight: Gross in KG', ''],
            ['Pallet size in MM', ''],
            ['Number of Shipper per pallets: Shippers', ''],
            ['Quantity per pallet: Packs', ''],
            ['Pallet Weight: Gross in Kg', ''],
            ['Pallets per 20 FT FCL', ''],
            ['Quantity per 20 FT FCL: Packs', ''],
            ['Pallets per 40 FT FCL', ''],
            ['Quantity per 40 FT FCL: Packs', ''],
          ],
          theme: 'grid',
          bodyStyles: {
            fontSize: 6,
            lineWidth: 0.2,
            lineColor: [0, 0, 0],
            minCellHeight: 5,
            fontStyle: 'bold' as const
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 80, halign: 'left' as const },
            2: { cellWidth: 40 }
          },
          margin: { left: 10 }
        })

        yPos = (pdf as any).lastAutoTable.finalY + 5
      }

      // Terms & Conditions Section - Vertical Format (A4 adjusted)
      // Column 0: "Terms & Conditions" label (rowSpan)
      // Column 1: Field labels
      // Column 2: Values
      autoTable(pdf, {
        startY: yPos,
        body: [
          [
            { content: 'Terms &\nConditions', rowSpan: 6, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } },
            'Delivery Terms',
            '45Days'
          ],
          ['Payment Terms', '30Days'],
          ['Taxes', ''],
          ['Currency', priceData.CurrencySymbol || ''],
          ['Lead Time', ''],
          ['Quote Validity', ''],
        ],
        theme: 'grid',
        bodyStyles: {
          fontSize: 6,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          minCellHeight: 5,
          fontStyle: 'bold' as const
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 80, halign: 'left' as const },
          2: { cellWidth: 40 }
        },
        margin: { left: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // ========== FOOTER SECTION ==========
      // Check if we need a new page for footer
      if (yPos > pageHeight - 35) {
        pdf.addPage()
        yPos = 15
      }

      // Footer Text (from API or default)
      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(80, 80, 80)
      const footerText = mainData.FooterText || 'This quotation is valid for 10 days from the date of issue. All prices are exclusive of applicable taxes unless otherwise stated.'
      const footerLines = pdf.splitTextToSize(footerText, pageWidth - 20)
      pdf.text(footerLines, 10, yPos)

      yPos += (footerLines.length * 3) + 5

      // Prepared By section
      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('Prepared By:', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(mainData.UserName || mainData.SalesEmployeeName || '', 32, yPos)

      // Designation
      if (mainData.Designation) {
        pdf.text(`(${mainData.Designation})`, 32 + pdf.getTextWidth(mainData.UserName || mainData.SalesEmployeeName || '') + 3, yPos)
      }

      yPos += 4

      // Contact
      if (mainData.UserContactNo) {
        pdf.text(`Contact: ${mainData.UserContactNo}`, 10, yPos)
        yPos += 4
      }

      yPos += 5

      // Company Name at bottom
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 81, 128) // #005180
      const companyName = mainData.CompanyName || 'INDAS Packaging Pvt. Ltd.'
      pdf.text(companyName, pageWidth / 2, yPos, { align: 'center' })

      yPos += 4

      // GSTIN and CIN
      pdf.setFontSize(6)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      if (mainData.GSTIN) {
        pdf.text(`GSTIN: ${mainData.GSTIN}`, pageWidth / 2, yPos, { align: 'center' })
        yPos += 3
      }
      if (mainData.CINNo) {
        pdf.text(`CIN: ${mainData.CINNo}`, pageWidth / 2, yPos, { align: 'center' })
      }
      // ========== END FOOTER SECTION ==========

      // Save PDF
      pdf.save(`Quotation-${quotationNumber}-Vertical.pdf`)

    } catch (error: any) {
      showMessage('Download Failed', `Failed to download quotation: ${error.message}`, 'error')
    } finally {
      setIsDownloadingPDF(null)
    }
  }

  // Handle downloading quotation PDF - HORIZONTAL FORMAT
  const handleDownloadQuotationHorizontal = (bookingId: string | number | undefined) => {
    if (!bookingId) {
      showMessage('Error', 'Invalid quotation ID: BookingID is missing', 'error')
      return
    }
    showPackingSpecDialog(bookingId, 'horizontal')
  }

  // Actual PDF generation for Horizontal format
  const downloadPDFHorizontal = async (bookingId: string | number, showPackingSpec: boolean) => {
    const bookingIdStr = String(bookingId)
    setIsDownloadingPDF(bookingIdStr)
    try {
      const data = await getQuotationDetail(bookingId)

      // Extract data from response - API returns arrays with different property names
      const mainDataArray = data.Main || data.mainData || data.MainData || []
      const detailsDataArray = data.Datails || data.Details || data.detailsData || data.DetailsData || []
      const priceDataArray = data.Price || data.priceData || data.PriceData || []

      // Get all items from arrays for multiple rows
      const allDetailsData = detailsDataArray.length > 0 ? detailsDataArray : [{}]
      const mainData = mainDataArray[0] || {}
      const priceData = priceDataArray[0] || {}

      // Generate PDF with HORIZONTAL format - A4 Portrait (same as vertical)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const quotationNumber = mainData.BookingNo || bookingId
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      let yPos = 8

      // ========== HEADER SECTION ==========
      // Company Logo - Parksons
      try {
        // Load logo from public folder
        const logoBase64 = await loadImageAsBase64(PARKSONS_LOGO_PATH)
        // Logo dimensions - maintain aspect ratio (original: 995 x 222)
        const logoWidth = 60  // Width in mm
        const logoHeight = logoWidth * (222 / 995)  // Maintain aspect ratio
        pdf.addImage(logoBase64, 'PNG', 10, yPos, logoWidth, logoHeight)
        yPos += logoHeight + 5
      } catch (logoError) {
        // Fallback if logo fails to load
        console.error('Failed to load logo:', logoError)
        pdf.setDrawColor(200, 200, 200)
        pdf.setFillColor(245, 245, 245)
        pdf.rect(10, yPos, pageWidth - 20, 15, 'FD')
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text('PARKSONS PACKAGING LTD', pageWidth / 2, yPos + 9, { align: 'center' })
        yPos += 20
      }

      // QUOTATION Title - Bold, Underlined, Centered
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      const titleTextH = 'QUOTATION'
      const titleWidthH = pdf.getTextWidth(titleTextH)
      const titleXH = (pageWidth - titleWidthH) / 2
      pdf.text(titleTextH, titleXH, yPos)
      // Underline
      pdf.setLineWidth(0.4)
      pdf.line(titleXH, yPos + 1, titleXH + titleWidthH, yPos + 1)

      yPos += 8

      // Client Information Section
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')

      // Client Name
      pdf.setFont('helvetica', 'bold')
      pdf.text('Client Name', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ClientName || mainData.LedgerName || ''}`, 38, yPos)

      yPos += 5

      // To (Mailing Name)
      pdf.setFont('helvetica', 'bold')
      pdf.text('To', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.MailingName || mainData.ClientName || ''}`, 38, yPos)

      yPos += 5

      // Address
      pdf.setFont('helvetica', 'bold')
      pdf.text('Address', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      const addressH = mainData.Address || ''
      const addressLinesH = pdf.splitTextToSize(`: ${addressH}`, pageWidth - 48)
      pdf.text(addressLinesH, 38, yPos)
      yPos += (addressLinesH.length * 4)

      yPos += 1

      // Subject
      pdf.setFont('helvetica', 'bold')
      pdf.text('Subject', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.EmailSubject || mainData.JobName || ''}`, 38, yPos)

      yPos += 5

      // Kind Attention
      pdf.setFont('helvetica', 'bold')
      pdf.text('Kind Attention', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`: ${mainData.ConcernPerson || mainData.ContactPerson || ''}`, 38, yPos)

      yPos += 8
      // ========== END HEADER SECTION ==========

      // Main Product Table - A4 Portrait (210mm - 20mm margins = 190mm available)
      // Column widths adjusted for portrait: total ~190mm
      autoTable(pdf, {
        startY: yPos,
        head: [
          [
            { content: 'S.N.', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Job name', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Size', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Board Specs', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Printing & Value Add', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'MOQ', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Ann. Qty', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
            { content: 'Quote (INR/1000)', colSpan: 4, styles: { halign: 'center' } },
          ],
          [
            { content: '1L', styles: { halign: 'center' } },
            { content: '2L', styles: { halign: 'center' } },
            { content: '5L', styles: { halign: 'center' } },
            { content: '10L', styles: { halign: 'center' } },
          ]
        ],
        body: allDetailsData.map((detailsData: any, index: number) => [
          String(index + 1),
          mainData.JobName || detailsData.Content_Name || '',
          detailsData.Job_Size || detailsData.Job_Size_In_Inches || '',
          detailsData.Paper || '',
          detailsData.Printing || '',
          '',
          priceData.PlanContQty || '',
          '', // 1L value
          '', // 2L value
          '', // 5L value
          '', // 10L value
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 5,
          fontStyle: 'bold',
          lineWidth: 0.2,
          lineColor: [0, 0, 0]
        },
        bodyStyles: {
          fontSize: 5,
          valign: 'middle',
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          minCellHeight: 6
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 22 },
          2: { cellWidth: 14 },
          3: { cellWidth: 32 },
          4: { cellWidth: 30 },
          5: { cellWidth: 10, halign: 'center' },
          6: { cellWidth: 14, halign: 'center' },
          7: { cellWidth: 12, halign: 'center' },
          8: { cellWidth: 12, halign: 'center' },
          9: { cellWidth: 12, halign: 'center' },
          10: { cellWidth: 12, halign: 'center' }
        },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto'
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // Packing Spec Section - A4 Portrait - Only if user requested
      if (showPackingSpec) {
        autoTable(pdf, {
          startY: yPos,
          body: [
            [
              { content: 'Packing\nSpec', rowSpan: 12, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } },
              { content: 'Tentative Packing Spec', colSpan: 2, styles: { fontStyle: 'bold' as const, halign: 'center' as const } }
            ],
            ['Shipper box size in MM', ''],
            ['Quantity per shipper box: Packs', ''],
            ['Shipper box Weight: Gross in KG', ''],
            ['Pallet size in MM', ''],
            ['Number of Shipper per pallets: Shippers', ''],
            ['Quantity per pallet: Packs', ''],
            ['Pallet Weight: Gross in Kg', ''],
            ['Pallets per 20 FT FCL', ''],
            ['Quantity per 20 FT FCL: Packs', ''],
            ['Pallets per 40 FT FCL', ''],
            ['Quantity per 40 FT FCL: Packs', ''],
          ],
          theme: 'grid',
          bodyStyles: {
            fontSize: 6,
            lineWidth: 0.2,
            lineColor: [0, 0, 0],
            minCellHeight: 5,
            fontStyle: 'bold' as const
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 80, halign: 'left' as const },
            2: { cellWidth: 40 }
          },
          margin: { left: 10 }
        })

        yPos = (pdf as any).lastAutoTable.finalY + 5
      }

      // Terms & Conditions Section - A4 Portrait
      autoTable(pdf, {
        startY: yPos,
        body: [
          [
            { content: 'Terms &\nConditions', rowSpan: 6, styles: { fontStyle: 'bold' as const, valign: 'middle' as const, halign: 'center' as const, fontSize: 6 } },
            'Delivery Terms',
            '45Days'
          ],
          ['Payment Terms', '30Days'],
          ['Taxes', ''],
          ['Currency', priceData.CurrencySymbol || ''],
          ['Lead Time', ''],
          ['Quote Validity', ''],
        ],
        theme: 'grid',
        bodyStyles: {
          fontSize: 6,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          minCellHeight: 5,
          fontStyle: 'bold' as const
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 80, halign: 'left' as const },
          2: { cellWidth: 40 }
        },
        margin: { left: 10 }
      })

      yPos = (pdf as any).lastAutoTable.finalY + 8

      // ========== FOOTER SECTION ==========
      // Check if we need a new page for footer
      if (yPos > pageHeight - 35) {
        pdf.addPage()
        yPos = 15
      }

      // Footer Text (from API or default)
      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(80, 80, 80)
      const footerTextH = mainData.FooterText || 'This quotation is valid for 10 days from the date of issue. All prices are exclusive of applicable taxes unless otherwise stated.'
      const footerLinesH = pdf.splitTextToSize(footerTextH, pageWidth - 20)
      pdf.text(footerLinesH, 10, yPos)

      yPos += (footerLinesH.length * 3) + 5

      // Prepared By section
      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text('Prepared By:', 10, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(mainData.UserName || mainData.SalesEmployeeName || '', 32, yPos)

      // Designation
      if (mainData.Designation) {
        pdf.text(`(${mainData.Designation})`, 32 + pdf.getTextWidth(mainData.UserName || mainData.SalesEmployeeName || '') + 3, yPos)
      }

      yPos += 4

      // Contact
      if (mainData.UserContactNo) {
        pdf.text(`Contact: ${mainData.UserContactNo}`, 10, yPos)
        yPos += 4
      }

      yPos += 5

      // Company Name at bottom
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 81, 128) // #005180
      const companyNameH = mainData.CompanyName || 'INDAS Packaging Pvt. Ltd.'
      pdf.text(companyNameH, pageWidth / 2, yPos, { align: 'center' })

      yPos += 4

      // GSTIN and CIN
      pdf.setFontSize(6)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      if (mainData.GSTIN) {
        pdf.text(`GSTIN: ${mainData.GSTIN}`, pageWidth / 2, yPos, { align: 'center' })
        yPos += 3
      }
      if (mainData.CINNo) {
        pdf.text(`CIN: ${mainData.CINNo}`, pageWidth / 2, yPos, { align: 'center' })
      }
      // ========== END FOOTER SECTION ==========

      // Save PDF
      pdf.save(`Quotation-${quotationNumber}-Horizontal.pdf`)

    } catch (error: any) {
      showMessage('Download Failed', `Failed to download quotation: ${error.message}`, 'error')
    } finally {
      setIsDownloadingPDF(null)
    }
  }

  // Handle downloading quotation as Excel
  const handleDownloadQuotationExcel = async (bookingId: string | number | undefined) => {
    if (!bookingId) {
      showMessage('Error', 'Invalid quotation ID: BookingID is missing', 'error')
      return
    }

    const bookingIdStr = String(bookingId)
    setIsDownloadingPDF(bookingIdStr)
    try {
      const data = await getQuotationDetail(bookingId)

      // Extract data from response
      const mainDataArray = data.Main || data.mainData || data.MainData || []
      const detailsDataArray = data.Datails || data.Details || data.detailsData || data.DetailsData || []
      const priceDataArray = data.Price || data.priceData || data.PriceData || []

      // Get first item from arrays
      const mainData = mainDataArray[0] || {}
      const detailsData = detailsDataArray[0] || {}
      const priceData = priceDataArray[0] || {}

      const quotationNumber = mainData.BookingNo || bookingId

      // Extract specific fields for better display
      const jobName = mainData.JobName || detailsData.Content_Name || ''
      const boxDimensions = detailsData.Job_Size || detailsData.Job_Size_In_Inches || ''
      const paperQualityGSM = detailsData.Paper || ''
      const colorDetails = detailsData.Printing || ''
      const annualQuantity = priceData.PlanContQty || ''

      // Prepare Excel data with HORIZONTAL format (matching screenshot)
      const excelData = [
        // Header Row
        ['S.N.', 'Job name', 'Size (MM)', 'Board Specs', 'Printing & Value Addition', 'MOQ', 'Annual Quantity', '', '', 'Quote (INR / 1000)', '', ''],
        // Subheader for Quote columns
        ['', '', '', '', '', '', '', '1L', '2L', '5L', '6L', ''],
        // Data Row 1 - with proper field labels
        ['1', jobName, boxDimensions, paperQualityGSM, colorDetails, '', annualQuantity, '', '', '', '', ''],
        // Data Row 2 (if more products needed, can be added here)
        ['2', '', '', '', '', '', '', '', '', '', '', ''],
        // Data Row 3
        ['3', '', '', '', '', '', '', '', '', '', '', ''],
        // Data Row 4
        ['4', '', '', '', '', '', '', '', '', '', '', ''],
        // Empty rows for spacing
        ['', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', ''],
        // Tentative Packing Spec Header (separate section)
        ['', '', 'Tentative Packing Spec', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', ''],
        // Packing Spec Section with label in column A
        ['Packing Spec', '', 'Shipper box size in MM', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Quantity per shipper box: Packs', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Shipper box Weight: Gross in KG', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Pallet size in MM', '', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Number of Shipper per pallets: Shippers', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Quantity per pallet: Packs', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Pallet Weight: Gross in Kg', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Pallets per 20 FT FCL', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Quantity per 20 FT FCL: Packs', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Pallets per 40 FT FCL', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Quantity per 40 FT FCL: Packs', '', '', '', '', '', '', '', '', ''],
        // Empty rows for spacing
        ['', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', ''],
        // Terms & Conditions Section
        ['', '', 'Delivery Terms', '45Days', '', '', '', '', '', '', '', ''],
        ['', '', 'Payment Terms', '30Days', '', '', '', '', '', '', '', ''],
        ['Terms &Conditions', '', 'Taxes', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Currency', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Lead Time', '', '', '', '', '', '', '', '', ''],
        ['', '', 'Quote Validity', '', '', '', '', '', '', '', '', ''],
      ]

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(excelData)

      // Set column widths for horizontal format
      ws['!cols'] = [
        { wch: 6 },   // A - S.N.
        { wch: 25 },  // B - Job name
        { wch: 15 },  // C - Size (MM)
        { wch: 45 },  // D - Board Specs
        { wch: 45 },  // E - Printing & Value Addition
        { wch: 10 },  // F - MOQ
        { wch: 15 },  // G - Annual Quantity
        { wch: 12 },  // H - 1L
        { wch: 12 },  // I - 2L
        { wch: 12 },  // J - 5L
        { wch: 12 },  // K - 6L
        { wch: 10 },  // L - Extra
      ]

      // Set row heights - default 20, spacing rows 15
      ws['!rows'] = []
      for (let i = 0; i < excelData.length; i++) {
        // Spacing rows (7, 8, 9 and 22, 23)
        if ([7, 8, 9, 22, 23].includes(i)) {
          ws['!rows'][i] = { hpt: 8, hpx: 8 }  // Smaller height for spacing
        } else {
          ws['!rows'][i] = { hpt: 25, hpx: 25 }  // Standard height
        }
      }

      // Define cell merges
      ws['!merges'] = [
        // Header row - merge "Quote (INR / 1000)" across H1:K1
        { s: { r: 0, c: 7 }, e: { r: 0, c: 10 } },

        // Product section - merge cells vertically for rows 1-5
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // S.N.
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Job name
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Size (MM)
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // Board Specs
        { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // Printing & Value Addition
        { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }, // MOQ
        { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // Annual Quantity

        // Tentative Packing Spec header - merge across C11:F11
        { s: { r: 10, c: 2 }, e: { r: 10, c: 5 } },

        // Packing Spec label - merge vertically A13:A23
        { s: { r: 12, c: 0 }, e: { r: 22, c: 0 } },

        // Terms & Conditions label - merge vertically A26:A31
        { s: { r: 25, c: 0 }, e: { r: 30, c: 0 } },
      ]

      // Apply borders and styling to all cells
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')

      // Border style definitions
      const thinBorder = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }

      const thickBorder = {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'medium', color: { rgb: '000000' } },
        right: { style: 'medium', color: { rgb: '000000' } }
      }

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = { c: C, r: R }
          const cellRef = XLSX.utils.encode_cell(cellAddress)

          if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' }

          // Determine if this cell is in a block boundary
          // Product table block: rows 0-6
          // Spacing rows: 7-9
          // Tentative Packing Spec header: row 10
          // Empty row: 11
          // Packing Spec block: rows 12-22
          // Spacing rows: 23-24
          // Terms & Conditions block: rows 25-30
          const isProductBlock = R >= 0 && R <= 6
          const isPackingBlock = R >= 12 && R <= 22
          const isTermsBlock = R >= 25 && R <= 30
          const isSpacingRow = [7, 8, 9, 11, 23, 24].includes(R)

          // Base style for all cells
          ws[cellRef].s = {
            border: isSpacingRow ? {} : thinBorder,  // No borders on spacing rows
            alignment: {
              vertical: 'center',
              horizontal: 'left',
              wrapText: false,  // Disable wrap text by default
              shrinkToFit: false
            }
          }

          // Apply thick borders around blocks
          if (isProductBlock) {
            // Product block outer borders
            if (R === 0) ws[cellRef].s.border.top = { style: 'medium', color: { rgb: '000000' } }
            if (R === 6) ws[cellRef].s.border.bottom = { style: 'medium', color: { rgb: '000000' } }
            if (C === 0) ws[cellRef].s.border.left = { style: 'medium', color: { rgb: '000000' } }
            if (C === 11) ws[cellRef].s.border.right = { style: 'medium', color: { rgb: '000000' } }
          }

          if (isPackingBlock) {
            // Packing Spec block outer borders
            if (R === 12) ws[cellRef].s.border.top = { style: 'medium', color: { rgb: '000000' } }
            if (R === 22) ws[cellRef].s.border.bottom = { style: 'medium', color: { rgb: '000000' } }
            if (C === 0) ws[cellRef].s.border.left = { style: 'medium', color: { rgb: '000000' } }
            if (C === 6) ws[cellRef].s.border.right = { style: 'medium', color: { rgb: '000000' } }
          }

          if (isTermsBlock) {
            // Terms & Conditions block outer borders
            if (R === 25) ws[cellRef].s.border.top = { style: 'medium', color: { rgb: '000000' } }
            if (R === 30) ws[cellRef].s.border.bottom = { style: 'medium', color: { rgb: '000000' } }
            if (C === 0) ws[cellRef].s.border.left = { style: 'medium', color: { rgb: '000000' } }
            if (C === 6) ws[cellRef].s.border.right = { style: 'medium', color: { rgb: '000000' } }
          }

          // Bold and center headers (rows 0 and 1)
          if (R <= 1) {
            ws[cellRef].s.font = { bold: true, sz: 11 }
            ws[cellRef].s.alignment = {
              ...ws[cellRef].s.alignment,
              horizontal: 'center'
            }
          }

          // Bold section headers (Packing Spec at row 12, Terms & Conditions at row 25)
          if ((R === 12 && C === 0) || (R === 25 && C === 0)) {
            ws[cellRef].s.font = { bold: true, sz: 11 }
            ws[cellRef].s.alignment = {
              vertical: 'center',
              horizontal: 'center',
              wrapText: false
            }
          }

          // Bold "Tentative Packing Spec" header at row 10, column 2 (C)
          if (R === 10 && C === 2) {
            ws[cellRef].s.font = { bold: true, sz: 11 }
            ws[cellRef].s.alignment = {
              ...ws[cellRef].s.alignment,
              horizontal: 'center'
            }
          }
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Quotation')

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `Quotation-${quotationNumber}.xlsx`)

    } catch (error: any) {
      showMessage('Download Failed', `Failed to download quotation: ${error.message}`, 'error')
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
      {/* Packing Spec Confirmation Dialog */}
      <Dialog open={packingSpecDialog.isOpen} onOpenChange={(open) => !open && setPackingSpecDialog({ isOpen: false, bookingId: null, pdfType: null })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">Include Packing Spec?</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground pt-2">
              Do you want to include Packing Spec section in the PDF?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              className="w-24 border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => handlePackingSpecResponse(false)}
            >
              No
            </Button>
            <Button
              className="w-24 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handlePackingSpecResponse(true)}
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog for showing success/error/info messages */}
      <Dialog open={messageDialog.isOpen} onOpenChange={(open) => !open && setMessageDialog({ ...messageDialog, isOpen: false })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className={`text-center text-lg font-semibold flex items-center justify-center gap-2 ${
              messageDialog.type === 'success' ? 'text-green-600' :
              messageDialog.type === 'error' ? 'text-red-600' :
              'text-[#005180]'
            }`}>
              {messageDialog.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
              {messageDialog.type === 'error' && <XCircle className="h-5 w-5" />}
              {messageDialog.title}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground pt-2 whitespace-pre-line">
              {messageDialog.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              className={`w-24 ${
                messageDialog.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                messageDialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                'bg-[#005180] hover:bg-[#004875]'
              } text-white`}
              onClick={() => setMessageDialog({ ...messageDialog, isOpen: false })}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
          onClick={() => showMessage('Coming Soon', 'Voice input feature coming soon', 'info')}
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
                              // Approved quotations: Show Send to Customer and Share only
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-[#78BE20]/10 text-[#78BE20] border-[#78BE20]/30 hover:bg-[#78BE20]/20"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    showMessage('Coming Soon', `Send to customer feature coming soon for ${quotation.id}`, 'info')
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
                                    showMessage('Coming Soon', `Share feature coming soon for ${quotation.id}`, 'info')
                                  }}
                                >
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Share
                                </Button>
                              </div>
                            ) : quotation.status === 'Sent to HOD' || quotation.status === 'Sent to Vertical Head' ? (
                              // Pending approval: Show status text only
                              <div className="flex justify-end gap-2 items-center">
                                <span className="text-xs text-muted-foreground italic">Pending Approval</span>
                              </div>
                            ) : quotation.status === 'Disapproved' ? (
                              // Disapproved: Show status text only
                              <div className="flex justify-end gap-2 items-center">
                                <span className="text-xs text-rose-600 font-medium italic">Disapproved</span>
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
                                    disabled={isSendingForApproval}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSendForApproval(quotation.bookingId, 'VerticalHead')
                                    }}
                                  >
                                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                                    {isSendingForApproval ? 'Sending...' : 'Send to VH'}
                                  </Button>
                                )}
                                {/* Margin 5% to 10%: Send to HOD */}
                                {quotation.margin >= 5 && quotation.margin < 10 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs bg-[#B92221]/10 text-[#B92221] border-[#B92221]/30 hover:bg-[#B92221]/20"
                                    disabled={isSendingForApproval}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSendForApproval(quotation.bookingId, 'HOD')
                                    }}
                                  >
                                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                                    {isSendingForApproval ? 'Sending...' : 'Send to HOD'}
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
                    <DialogContent className="surface-elevated max-w-lg max-h-[85vh] p-0 flex flex-col overflow-hidden">
                      <DialogHeader className="border-b bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-4 flex-shrink-0">
                        <div className="flex items-start justify-between gap-4 pr-8">
                          <div className="flex-1 text-left">
                            <DialogTitle className="text-lg font-bold text-gray-900 break-words pr-4">{selectedQuotation?.job}</DialogTitle>
                            <DialogDescription className="text-xs font-semibold text-gray-600 mt-1">
                              {selectedQuotation?.id}
                            </DialogDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                              {selectedQuotation?.createdDate}
                            </div>
                            {selectedQuotation && (
                              <Badge className={`${getStatusBadge(selectedQuotation.status)} border text-xs px-2 py-0.5 whitespace-nowrap`}>
                                {selectedQuotation.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </DialogHeader>
                      {selectedQuotation && (
                        <div className="space-y-0 overflow-y-auto overflow-x-hidden flex-1 pb-4">
                          {/* Customer Section */}
                          <div className="bg-blue-50/50 px-6 py-3 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1 block">Customer</Label>
                            <p className="text-sm font-semibold text-gray-900 break-words">{selectedQuotation.customer}</p>
                          </div>

                          {/* KAM Name Section */}
                          <div className="bg-white px-6 py-3 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1 block">KAM Name</Label>
                            <p className="text-sm font-semibold text-gray-900">{selectedQuotation.kamName || "N/A"}</p>
                          </div>

                          {/* Quoted Cost Section */}
                          <div className="bg-blue-50/50 px-6 py-3 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1 block">Quoted Cost</Label>
                            <p className="text-sm font-semibold text-gray-900">{selectedQuotation.quotedCostDisplay}</p>
                          </div>

                          {/* Final Cost Section */}
                          <div className="bg-white px-6 py-3 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1 block">Final Cost</Label>
                            <p className="text-sm font-semibold text-gray-900">{selectedQuotation.finalCost.toFixed(2)} INR</p>
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
                      <div className="flex-shrink-0 border-t border-border/60 bg-white">
                        {selectedQuotation && (
                          <>
                            {/* Status/Workflow buttons (only for KAM users) */}
                            {userIsKAM && (
                              <div className="px-6 py-3 border-b border-border/20">
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {selectedQuotation.status === 'Approved' ? (
                                    <>
                                      <Button
                                        size="sm"
                                        className="rounded-md bg-[#78BE20] text-white hover:bg-[#78BE20]/90 text-xs"
                                        onClick={() => {
                                          showMessage('Coming Soon', `Send to customer feature coming soon for ${selectedQuotation.id}`, 'info')
                                        }}
                                      >
                                        <ArrowUpCircle className="mr-1 h-3 w-3" />
                                        Send to Customer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-md border-[#005180] text-[#005180] hover:bg-[#005180]/10 text-xs"
                                        onClick={() => {
                                          showMessage('Coming Soon', `Share feature coming soon for ${selectedQuotation.id}`, 'info')
                                        }}
                                      >
                                        <Share2 className="mr-1 h-3 w-3" />
                                        Share
                                      </Button>
                                    </>
                                  ) : selectedQuotation.status === 'Sent to HOD' || selectedQuotation.status === 'Sent to Vertical Head' ? (
                                    <span className="text-xs text-muted-foreground italic">Awaiting approval...</span>
                                  ) : selectedQuotation.status === 'Disapproved' ? (
                                    <span className="text-xs text-rose-600 font-medium">This quotation was disapproved</span>
                                  ) : (
                                    <>
                                      {/* Margin < 8%: Send to HOD */}
                                      {selectedQuotation.margin < 8 && selectedQuotation.margin >= 5 && (
                                        <Button
                                          size="sm"
                                          className="rounded-md bg-[#B92221] text-white hover:bg-[#B92221]/90 text-xs"
                                          onClick={() => handleSendForApproval(selectedQuotation.bookingId, 'HOD')}
                                          disabled={isSendingForApproval}
                                        >
                                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                                          {isSendingForApproval ? 'Sending...' : 'Send to HOD'}
                                        </Button>
                                      )}

                                      {/* Margin < 5%: Send to Vertical Head */}
                                      {selectedQuotation.margin < 5 && (
                                        <Button
                                          size="sm"
                                          className="rounded-md bg-[#005180] text-white hover:bg-[#005180]/90 text-xs"
                                          onClick={() => handleSendForApproval(selectedQuotation.bookingId, 'VerticalHead')}
                                          disabled={isSendingForApproval}
                                        >
                                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                                          {isSendingForApproval ? 'Sending...' : 'Send to VH'}
                                        </Button>
                                      )}

                                      {/* Margin between 8% and 10%: Show Send to HOD option */}
                                      {selectedQuotation.margin >= 8 && selectedQuotation.margin < 10 && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-md border-[#B92221] text-[#B92221] hover:bg-[#B92221]/10 text-xs"
                                          onClick={() => handleSendForApproval(selectedQuotation.bookingId, 'HOD')}
                                          disabled={isSendingForApproval}
                                        >
                                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                                          {isSendingForApproval ? 'Sending...' : 'Send to HOD'}
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Download buttons (always visible for everyone) */}
                            <div className="px-6 py-3 bg-gray-50">
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 rounded-md border-[#005180] text-[#005180] hover:bg-[#005180]/10 text-xs"
                                  disabled={isDownloadingPDF === selectedQuotation.bookingId}
                                  onClick={() => handleDownloadQuotationVertical(selectedQuotation.bookingId)}
                                  title="Download PDF - Vertical Format"
                                >
                                  <FileText className="mr-1 h-3 w-3" />
                                  PDF (V)
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 rounded-md border-[#005180] text-[#005180] hover:bg-[#005180]/10 text-xs"
                                  disabled={isDownloadingPDF === selectedQuotation.bookingId}
                                  onClick={() => handleDownloadQuotationHorizontal(selectedQuotation.bookingId)}
                                  title="Download PDF - Horizontal Format"
                                >
                                  <FileText className="mr-1 h-3 w-3" />
                                  PDF (H)
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 rounded-md border-[#78BE20] text-[#78BE20] hover:bg-[#78BE20]/10 text-xs"
                                  disabled={isDownloadingPDF === selectedQuotation.bookingId}
                                  onClick={() => handleDownloadQuotationExcel(selectedQuotation.bookingId)}
                                  title="Download Excel"
                                >
                                  <FileSpreadsheet className="mr-1 h-3 w-3" />
                                  Excel
                                </Button>
                              </div>
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
