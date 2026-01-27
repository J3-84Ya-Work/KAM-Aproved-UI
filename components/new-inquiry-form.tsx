"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Save, X, Edit, Trash2, Upload, Loader2, CheckCircle2, AlertCircle, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EnquiryAPI, MasterDataAPI, QuotationsAPI, formatDateForAPI, formatDateForDisplay, type BasicEnquiryData, type DetailedEnquiryData } from "@/lib/api/enquiry"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAutoSaveDraft, type FormType } from "@/hooks/use-auto-save-draft"
import { clientLogger } from "@/lib/logger"

// Dropdown options
const ENQUIRY_FORM_TYPE_OPTIONS = [
  { label: "Basic", value: "Basic" },
  { label: "Detailed", value: "Detailed" },
]

const SALES_TYPE_OPTIONS = [
  { label: "Export", value: "Export" },
  { label: "Domestic", value: "Domestic" },
]

const ENQUIRY_TYPE_OPTIONS = [
  { label: "Bid", value: "Bid" },
  { label: "General", value: "General" },
]

const TYPE_OF_JOB_OPTIONS = [
  { label: "New", value: "New" },
  { label: "Repeat", value: "Repeat" },
  { label: "Sample", value: "Sample" },
]

const TYPE_OF_PRINTING_OPTIONS = [
  { label: "Offset", value: "Offset" },
  { label: "Flexo", value: "Flexo" },
  { label: "Digital", value: "Digital" },
  { label: "Outsource", value: "Outsource" },
  { label: "Others", value: "Others" },
]

// Mock content data with images
const MOCK_CONTENTS = [
  { id: 1, name: "Rectangular Box", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth,JobUps" },
  { id: 2, name: "Square Box", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth" },
  { id: 3, name: "Mailer Box", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth,SizeOpenflap,SizePastingflap" },
  { id: 4, name: "Die Cut", image: "/placeholder.svg", sizes: "SizeHeight,SizeLength,SizeWidth,JobAcrossUps,JobAroundUps" },
]

const AVAILABLE_PROCESSES = [
  "Transportation",
  "Transportation (I)",
  "2 Ply Roto Sheet Making",
  "Block Making",
  "Die Cutting with Embossing",
  "Digital Roto Printing",
  "Gluing",
  "Frame and Positive Making",
  "Laminating Pad",
  "MICRONAME/SONG",
  "Outsouce Roto Printing",
  "Outsouce Stitching",
  "Outsouce Front Printing",
  "Sheet Pasting",
  "Spiral Binding",
]

interface AttachedFile {
  name: string
  size: number
  type: string
  file: File
}

type InquiryFormType = 'basic' | 'detailed'

// Helper function to get content image path
const getContentImagePath = (contentName: string): string => {
  // Map of content names to image filenames
  const imageMap: Record<string, string> = {
    'ReverseTuckIn': 'Reverse Tuck In.jpg',
    'Reverse Tuck In': 'Reverse Tuck In.jpg',
    'ReverseTuckAndTongue': 'Reverse Tuck And Tongue.jpg',
    'StandardStraightTuckIn': 'Standard Straight Tuck In.jpg',
    'StandardStraightTuckInNested': 'Standard Straight Tuck In Nested.jpg',
    'CrashLockWithPasting': 'Crash Lock With Pasting.jpg',
    'CrashLockWithoutPasting': 'Crash Lock Without Pasting.jpg',
    'FourCornerBox': 'Four Corner Box.jpg',
    'SixCornerBox': '6 Corner Box.jpg',
    'InnerTray': 'Inner Tray.jpg',
    'TuckToFrontOpenTop': 'Tuck To Front Open Top.jpg',
    'UniversalCarton': 'Universal Carton.jpg',
    'UniversalOpenCrashLockWithPasting': 'Universal Open Crash Lock With Pasting.jpg',
    'FourCornerHingedLid': 'Four Corner Hinged Lid.jpg',
    'Four Corner Hinged Lid': 'Four Corner Hinged Lid.jpg',
    'TurnOverEndTray': 'Turn Over End Tray.jpg',
    'WebbedSelfLockingTray': 'Webbed Self Locking Tray.jpg',
    'PillowPouch': 'Pillow Pouch.jpg',
    'ThreeSideSealPouch': 'Three Side Seal Pouch.jpg',
    'CenterSealPouch': 'Center Seal Pouch.jpg',
    'StandUpPouch': 'Stand Up Pouch.jpg',
    'FlatBottomPouch': 'Flat Bottom Pouch.jpg',
    'SpoutPouch': 'Spout Pouch.jpg',
    'FourSideSealPouch': 'Four Side Seal Pouch.jpg',
    'PrePlannedSheet': 'Pre Planned Sheet.jpg',
    'Pre Planned Sheet': 'Pre Planned Sheet.jpg',
  }

  // Check if we have a specific mapping
  if (imageMap[contentName]) {
    return `/images/${imageMap[contentName]}`;
  }

  // Try with .jpg extension directly
  return `/images/${contentName}.jpg`;
}

interface NewInquiryFormProps {
  editMode?: boolean
  initialData?: any
  onSaveSuccess?: () => void
}

export function NewInquiryForm({ editMode = false, initialData, onSaveSuccess }: NewInquiryFormProps = {}) {
  const router = useRouter()
  const { toast } = useToast()
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  const [formType, setFormType] = useState<InquiryFormType>('detailed') // Default to detailed for edit
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingEnquiryNo, setIsFetchingEnquiryNo] = useState(!editMode) // Don't fetch if editing
  const [isMasterDataLoaded, setIsMasterDataLoaded] = useState(false)

  // Track loaded draft ID for updates
  const [loadedDraftId, setLoadedDraftId] = useState<number | null>(null)

  // API data state
  const [categories, setCategories] = useState<any[]>([])
  const [contentTypes, setContentTypes] = useState<any[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [productionUnits, setProductionUnits] = useState<any[]>([])
  const [salesPersons, setSalesPersons] = useState<any[]>([])
  const [concernPersons, setConcernPersons] = useState<{ ConcernPersonID: number; Name: string; Mobile: string }[]>([])

  // Form data
  const [formData, setFormData] = useState({
    enquiryNo: "",
    enquiryDate: new Date().toISOString().split("T")[0],
    enquiryType: "", // Bid or General
    salesType: "", // Export or Domestic
    formType: "", // Basic or Detailed (auto-set based on form type)
    clientName: "",
    concernPerson: "",
    concernPersonMobile: "",
    jobName: "",
    categoryName: "",
    contentType: "", // Content type based on category
    productCode: "",
    quantity: "",
    annualQuantity: "",
    unit: "PCS",
    divisionName: "Packaging",
    typeOfPrinting: "",
    plant: "",
    supplyLocation: "",
    paymentTerms: "",
    salesPerson: "",
    expectCompletion: "",
    remark: "",
    attachments: [] as AttachedFile[],
  })

  // Content selection state
  const [selectedContentIds, setSelectedContentIds] = useState<number[]>([])
  const [contentGridData, setContentGridData] = useState<any[]>([])
  const [viewAllContentsOpen, setViewAllContentsOpen] = useState(false)

  // Plan details state
  const [planDetails, setPlanDetails] = useState<Record<string, string>>({})

  // Process selection state
  const [selectedProcesses, setSelectedProcesses] = useState<Array<{ProcessID: number, ProcessName: string}>>([])
  const [processSearchTerm, setProcessSearchTerm] = useState("")
  const [availableProcesses, setAvailableProcesses] = useState<any[]>([]) // Processes from API with IDs
  const [loadingProcesses, setLoadingProcesses] = useState(false)

  // Content selection dialog state
  const [contentDialogOpen, setContentDialogOpen] = useState(false)

  // Process selection dialog state
  const [processDialogOpen, setProcessDialogOpen] = useState(false)

  // Size inputs state (for selected content type)
  const [sizeInputs, setSizeInputs] = useState<Record<string, string>>({})
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [pendingContentTypeToSelect, setPendingContentTypeToSelect] = useState<string | null>(null)

  // Dropdown data for material properties
  const [qualities, setQualities] = useState<any[]>([])
  const [gsmOptions, setGsmOptions] = useState<any[]>([])
  const [millOptions, setMillOptions] = useState<any[]>([])
  const [finishOptions, setFinishOptions] = useState<any[]>([])

  // Search filters for dropdowns
  const [qualitySearch, setQualitySearch] = useState<string>("")
  const [gsmSearch, setGsmSearch] = useState<string>("")

  // Prepare draft data for auto-save
  const draftFormData = {
    ...formData,
    formType: formType,
    selectedCategoryId,
    selectedContentIds,
    contentGridData,
    planDetails,
    selectedProcesses,
    sizeInputs,
    selectedContent,
  }

  // Auto-save hook - only enable if not in edit mode and form has data
  const { saveStatus, lastSaved, currentDraftId } = useAutoSaveDraft({
    formData: draftFormData,
    formType: 'ManualForm',
    draftName: formData.jobName
      ? `${formData.jobName}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}`
      : `Manual_Inquiry_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}`,
    enabled: !editMode && (formData.jobName !== '' || formData.clientName !== ''), // Only save if there's meaningful data
    debounceMs: 2000,  // Save 2 seconds after user stops typing
    initialDraftId: loadedDraftId,  // Pass the loaded draft ID for updates
    onSaveSuccess: (draftId) => {
      clientLogger.log('[Manual Form] Draft saved/updated with ID:', draftId)
      // Update the loaded draft ID if this was a new save
      if (!loadedDraftId && draftId) {
        setLoadedDraftId(draftId)
      }
    },
    onSaveError: (error) => {
      clientLogger.error('[Manual Form] Failed to save draft:', error)
    },
  })

  // Set form type based on selected form type (Basic or Detailed)
  useEffect(() => {
    if (formType === 'basic') {
      setFormData(prev => ({ ...prev, formType: 'Basic' }))
    } else {
      setFormData(prev => ({ ...prev, formType: 'Detailed' }))
    }
  }, [formType])

  // Load draft from sessionStorage if loadDraft=true
  // Wait for master data to be loaded before applying draft data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shouldLoadDraft = urlParams.get('loadDraft') === 'true'

    // Only load draft after master data is available
    const masterDataLoaded = categories.length > 0 && clients.length > 0

    if (shouldLoadDraft && masterDataLoaded) {
      const draftDataStr = sessionStorage.getItem('loadedDraft')
      if (draftDataStr) {
        try {
          const draftData = JSON.parse(draftDataStr)

          clientLogger.log('[Draft Load] Loaded draft data:', draftData)
          clientLogger.log('[Draft Load] Master data loaded - Categories:', categories.length, 'Clients:', clients.length)

          // The draft data structure is flat at the top level
          // Extract the form data fields directly
          const {
            FormType,
            formType,
            selectedCategoryId,
            selectedContentIds,
            contentGridData,
            planDetails,
            selectedProcesses,
            sizeInputs,
            selectedContent,
            LoadedDraftID,  // Extract the draft ID
            ...formFields
          } = draftData

          // Set the loaded draft ID so it can be used for updates
          if (LoadedDraftID) {
            setLoadedDraftId(LoadedDraftID)
            clientLogger.log('[Draft Load] Set loaded draft ID:', LoadedDraftID)
          }

          // Restore basic form fields (all fields except the special state ones)
          if (Object.keys(formFields).length > 0) {
            setFormData(prev => ({ ...prev, ...formFields }))
            clientLogger.log('[Draft Load] Restored form fields:', formFields)
          }

          // Restore form type
          if (formType) {
            setFormType(formType)
            clientLogger.log('[Draft Load] Restored form type:', formType)
          }

          // Restore selected category
          if (selectedCategoryId) {
            setSelectedCategoryId(selectedCategoryId)
            clientLogger.log('[Draft Load] Restored category ID:', selectedCategoryId)
          }

          // Restore selected content
          if (selectedContentIds && selectedContentIds.length > 0) {
            setSelectedContentIds(selectedContentIds)
            clientLogger.log('[Draft Load] Restored content IDs:', selectedContentIds)
          }

          if (selectedContent) {
            setSelectedContent(selectedContent)
            clientLogger.log('[Draft Load] Restored selected content:', selectedContent)
          }

          // Restore content grid data
          if (contentGridData && contentGridData.length > 0) {
            setContentGridData(contentGridData)
            clientLogger.log('[Draft Load] Restored content grid data')
          }

          // Restore plan details
          if (planDetails && Object.keys(planDetails).length > 0) {
            setPlanDetails(planDetails)
            clientLogger.log('[Draft Load] Restored plan details:', planDetails)
          }

          // Restore selected processes
          if (selectedProcesses && selectedProcesses.length > 0) {
            setSelectedProcesses(selectedProcesses)
            clientLogger.log('[Draft Load] Restored processes:', selectedProcesses)
          }

          // Restore size inputs
          if (sizeInputs && Object.keys(sizeInputs).length > 0) {
            setSizeInputs(sizeInputs)
            clientLogger.log('[Draft Load] Restored size inputs:', sizeInputs)
          }

          // Prevent enquiry number from being fetched
          setIsFetchingEnquiryNo(false)

          // Clear session storage after loading
          sessionStorage.removeItem('loadedDraft')

          toast({
            title: "Draft Loaded",
            description: "Your draft has been loaded successfully. Continue where you left off.",
          })
        } catch (error) {
          clientLogger.error('Failed to parse draft data:', error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load draft data.",
          })
        }
      }
    }
  }, [categories, clients, toast])

  // Populate form with initial data when in edit mode
  useEffect(() => {
    // Wait for all master data to be loaded before populating edit form
    if (editMode && initialData && categories.length > 0 && clients.length > 0 && salesPersons.length > 0 && productionUnits.length > 0) {
      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📝 EDIT MODE - Form Population Starting')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📋 Initial Data Received:', JSON.stringify(initialData, null, 2))
      console.log('📋 Available categories:', categories.length)
      console.log('📋 Available clients:', clients.length)
      console.log('📋 Available sales persons:', salesPersons.length)
      console.log('📋 Available production units:', productionUnits.length)
      console.log('═══════════════════════════════════════════════════════════════')

      // Find the category to verify it exists
      const category = categories.find(c => c.CategoryId === initialData.categoryId)
      console.log('📋 Found category:', category)

      // Helper function to parse and format date
      const formatDateForInput = (dateStr: string | undefined): string => {
        if (!dateStr) return new Date().toISOString().split("T")[0]
        try {
          // Try parsing the date string
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0]
          return date.toISOString().split("T")[0]
        } catch {
          return new Date().toISOString().split("T")[0]
        }
      }

      // Populate basic form data
      const newFormData = {
        enquiryNo: initialData.id || initialData.enquiryNo || '',
        enquiryDate: formatDateForInput(initialData.date || initialData.enquiryDate),
        clientName: initialData.ledgerId?.toString() || initialData.rawData?.LedgerID?.toString() || '',
        jobName: initialData.job || initialData.jobName || '',
        productCode: initialData.sku || initialData.productCode || '',
        quantity: initialData.quantityRange?.toString() || initialData.quantity?.toString() || '',
        unit: initialData.unit || 'PCS',
        categoryName: initialData.categoryId?.toString() || initialData.rawData?.CategoryID?.toString() || '',
        salesPerson: initialData.salesEmployeeId?.toString() || initialData.rawData?.EmployeeID?.toString() || initialData.rawData?.SalesEmployeeID?.toString() || '',
        plant: initialData.productionUnitId?.toString() || initialData.rawData?.ProductionUnitID?.toString() || '',
        remark: initialData.notes || initialData.remark || initialData.rawData?.Remark || '',
        expectCompletion: initialData.expectCompletion?.toString() || initialData.rawData?.ExpectCompletion?.toString() || '',
        typeOfPrinting: initialData.typeOfPrinting || initialData.jobType || initialData.rawData?.TypeOfPrinting || '',
        annualQuantity: initialData.annualQuantity?.toString() || initialData.rawData?.AnnualQuantity?.toString() || '',
        // Add enquiry type and sales type from rawData or direct fields
        enquiryType: initialData.enquiryType || initialData.rawData?.EnquiryType || '',
        salesType: initialData.salesType || initialData.rawData?.SalesType || '',
        // Additional fields for edit
        concernPerson: initialData.concernPerson || initialData.rawData?.ConcernPerson || initialData.rawData?.ConcernPersonName || initialData.rawData?.ContactPerson || '',
        concernPersonMobile: initialData.concernPersonMobile || initialData.rawData?.Mobile || '',
        divisionName: initialData.divisionName || initialData.rawData?.DivisionName || 'Packaging',
        supplyLocation: initialData.supplyLocation || initialData.rawData?.SupplyLocation || '',
        paymentTerms: initialData.paymentTerms || initialData.rawData?.PaymentTerms || '',
      }

      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📝 EDIT MODE - Mapped Form Data')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📋 New Form Data:', JSON.stringify(newFormData, null, 2))
      console.log('═══════════════════════════════════════════════════════════════')

      setFormData(prev => ({
        ...prev,
        ...newFormData,
      }))

      clientLogger.log('[Edit Mode] Form data populated with basic fields')
      clientLogger.log('[Edit Mode] ═══════════════════════════════════════')
      clientLogger.log('[Edit Mode] POPULATED FIELDS SUMMARY:')
      clientLogger.log('[Edit Mode] ─────────────────────────────────────')
      clientLogger.log('[Edit Mode] Enquiry No:', initialData.id)
      clientLogger.log('[Edit Mode] Client:', initialData.ledgerId)
      clientLogger.log('[Edit Mode] Job Name:', initialData.job)
      clientLogger.log('[Edit Mode] Quantity:', initialData.quantityRange)
      clientLogger.log('[Edit Mode] Category ID:', initialData.categoryId)
      clientLogger.log('[Edit Mode] Sales Person ID:', initialData.salesEmployeeId)
      clientLogger.log('[Edit Mode] Production Unit ID:', initialData.productionUnitId)
      clientLogger.log('[Edit Mode] Enquiry Type:', initialData.enquiryType)
      clientLogger.log('[Edit Mode] Sales Type:', initialData.salesType)
      clientLogger.log('[Edit Mode] Type of Printing:', initialData.typeOfPrinting)
      clientLogger.log('[Edit Mode] Concern Person:', initialData.concernPerson)
      clientLogger.log('[Edit Mode] Concern Person Mobile:', initialData.concernPersonMobile)
      clientLogger.log('[Edit Mode] Annual Quantity:', initialData.annualQuantity)
      clientLogger.log('[Edit Mode] Has Detailed Data:', !!initialData.detailedData)
      clientLogger.log('[Edit Mode] ═══════════════════════════════════════')

      // Set category ID to trigger content types loading
      if (initialData.categoryId) {
        setSelectedCategoryId(initialData.categoryId)
      }

      // If detailed data is available, populate dimensions and other fields
      console.log('═══════════════════════════════════════════════════════════════')
      console.log('🔎 CHECKING DETAILED DATA')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📋 initialData.detailedData exists:', !!initialData.detailedData)
      console.log('📋 initialData.detailedData type:', typeof initialData.detailedData)
      console.log('📋 initialData.detailedData value:', initialData.detailedData)
      console.log('═══════════════════════════════════════════════════════════════')

      if (initialData.detailedData) {
        let detailedData = initialData.detailedData

        // Handle case where detailedData might still be a JSON string (multi-encoded)
        if (typeof detailedData === 'string') {
          let parseAttempts = 0
          while (typeof detailedData === 'string' && parseAttempts < 5) {
            try {
              detailedData = JSON.parse(detailedData)
              parseAttempts++
              clientLogger.log(`[Edit Mode] Parsed detailedData, attempt ${parseAttempts}`)
            } catch (e) {
              clientLogger.log(`[Edit Mode] Failed to parse detailedData at attempt ${parseAttempts + 1}`)
              break
            }
          }
        }

        clientLogger.log('[Edit Mode] Detailed data found:', detailedData)
        clientLogger.log('[Edit Mode] Detailed data type:', typeof detailedData)
        clientLogger.log('[Edit Mode] TblBookingContents exists:', !!detailedData?.TblBookingContents)

        // Check if it's the new API format (TblBookingContents) or old format (MainData)
        const isNewFormat = detailedData?.TblBookingContents || detailedData?.TblBookingProcess

        if (isNewFormat) {
          clientLogger.log('[Edit Mode] Using NEW API format (TblBookingContents/TblBookingProcess)')

          // Parse TblBookingContents for dimensions and content type - MULTI-CONTENT SUPPORT
          if (detailedData.TblBookingContents && detailedData.TblBookingContents.length > 0) {
            clientLogger.log('[Edit Mode] Found', detailedData.TblBookingContents.length, 'contents in TblBookingContents')

            // Build contentGridData from all contents
            const gridData = detailedData.TblBookingContents.map((content: any, index: number) => {
              // Parse ContentSizeValues to extract dimensions and material properties
              const sizeValues: Record<string, string> = {}
              if (content.ContentSizeValues) {
                const pairs = content.ContentSizeValues.split('AndOr')
                pairs.forEach((pair: string) => {
                  const [key, value] = pair.split('=')
                  if (key && value) {
                    sizeValues[key] = value
                  }
                })
              }

              // Get content name
              const contentName = content.PlanContentType || content.PlanContName || content.ContentName || content.ContentType || ''

              // Build size string
              const sizeHeight = sizeValues.SizeHeight || ''
              const sizeLength = sizeValues.SizeLength || ''
              const sizeWidth = sizeValues.SizeWidth || ''
              const sizeParts = [sizeHeight, sizeLength, sizeWidth].filter(s => s && s !== '')
              const sizeString = sizeParts.length > 0 ? `${sizeParts.join(' x ')} MM` : '-'

              // Build other details string
              const quality = sizeValues.ItemPlanQuality || ''
              const gsm = sizeValues.ItemPlanGsm || ''
              const mill = sizeValues.ItemPlanMill || ''
              const finish = sizeValues.ItemPlanFinish || ''

              const otherDetailsParts = []
              if (quality) otherDetailsParts.push(`Board: ${quality}`)
              if (gsm) otherDetailsParts.push(`GSM: ${gsm}`)
              if (mill) otherDetailsParts.push(`Mill: ${mill}`)
              if (finish && finish !== '-') otherDetailsParts.push(`Finish: ${finish}`)
              const otherDetailsString = otherDetailsParts.length > 0 ? otherDetailsParts.join(', ') : '-'

              // Get processes for this content from TblBookingProcess (filter by PlanContName with flexible matching)
              const normalizeForMatch = (str: string) => (str || '').toLowerCase().replace(/[\s\-_]+/g, '')
              const contentNameNormalized = normalizeForMatch(contentName)
              const contentProcesses = detailedData.TblBookingProcess?.filter((p: any) => {
                const pContName = normalizeForMatch(p.PlanContName || '')
                const pContentType = normalizeForMatch(p.PlanContentType || '')
                const pContentName = normalizeForMatch(p.ContentName || '')
                return pContName === contentNameNormalized ||
                       pContentType === contentNameNormalized ||
                       pContentName === contentNameNormalized ||
                       p.PlanContName === contentName ||
                       p.PlanContentType === contentName
              }).map((p: any) => ({
                ProcessID: Number(p.ProcessID),
                ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
              })) || []

              // If no processes matched and this is the only content, assign all processes
              let finalProcesses = contentProcesses
              if (contentProcesses.length === 0 && detailedData.TblBookingContents.length === 1 && detailedData.TblBookingProcess?.length > 0) {
                clientLogger.log(`[Edit Mode] No matched processes, assigning all processes to single content`)
                finalProcesses = detailedData.TblBookingProcess.map((p: any) => ({
                  ProcessID: Number(p.ProcessID),
                  ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
                }))
              }

              clientLogger.log(`[Edit Mode] Content ${index + 1}:`, contentName, 'with', finalProcesses.length, 'processes')

              return {
                id: Date.now() + index + Math.random() * 1000,
                contentName: contentName,
                ContentName: contentName,
                Size: sizeString,
                OtherDetails: otherDetailsString,
                rawData: {
                  content: {
                    ContentID: content.ContentID || content.PlanContentID,
                    ContentName: contentName,
                  },
                  planDetails: { ...sizeValues },
                  processes: finalProcesses,
                },
                ...sizeValues,
              }
            })

            // Set contentGridData with all contents
            setContentGridData(gridData)
            clientLogger.log('[Edit Mode] Populated contentGridData with', gridData.length, 'contents')

            // Also set the first content for form display (for backwards compatibility)
            const firstContent = detailedData.TblBookingContents[0]
            if (firstContent.ContentSizeValues) {
              const sizeValues: Record<string, string> = {}
              const pairs = firstContent.ContentSizeValues.split('AndOr')
              pairs.forEach((pair: string) => {
                const [key, value] = pair.split('=')
                if (key && value) {
                  sizeValues[key] = value
                }
              })
              setPlanDetails(prev => ({ ...prev, ...sizeValues }))
            }

            const contentTypeToSelect = firstContent.PlanContentType || firstContent.PlanContName || firstContent.ContentName || firstContent.ContentType || firstContent.ContName || firstContent.ContentDomainType || firstContent.PlanContDomainType || firstContent.DomainType
            const contentIdFromApi = firstContent.ContentID || firstContent.PlanContentID || firstContent.ContID || firstContent.ContentMasterID

            console.log('═══════════════════════════════════════════════════════════════')
            console.log('🎯 EDIT MODE - MULTI-CONTENT LOADED')
            console.log('─────────────────────────────────────────────────────────────')
            console.log('📋 Total contents loaded:', gridData.length)
            console.log('📋 First content type:', contentTypeToSelect)
            console.log('📋 First content ID:', contentIdFromApi)
            console.log('═══════════════════════════════════════════════════════════════')

            if (contentTypeToSelect) {
              setFormData(prev => ({ ...prev, contentType: contentTypeToSelect }))
              setPendingContentTypeToSelect(contentTypeToSelect)
            }

            if (contentIdFromApi) {
              setSelectedContentIds([Number(contentIdFromApi)])
            }
          }

          // Parse TblBookingProcess for processes (for first content - backwards compatibility)
          if (detailedData.TblBookingProcess && detailedData.TblBookingProcess.length > 0) {
            // Get processes for first content only (for form display)
            const firstContentName = detailedData.TblBookingContents?.[0]?.PlanContentType || detailedData.TblBookingContents?.[0]?.PlanContName
            const firstContentProcesses = detailedData.TblBookingProcess
              .filter((p: any) => !firstContentName || p.PlanContName === firstContentName || p.PlanContentType === firstContentName)
              .map((p: any) => ({
                ProcessID: Number(p.ProcessID),
                ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
              }))
            clientLogger.log('[Edit Mode] Processes for first content:', firstContentProcesses)
            setSelectedProcesses(firstContentProcesses.length > 0 ? firstContentProcesses : detailedData.TblBookingProcess.map((p: any) => ({
              ProcessID: Number(p.ProcessID),
              ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
            })))
          }

        } else {
          // Old format handling (MainData, DetailsData, ProcessData) - MULTI-CONTENT SUPPORT
          clientLogger.log('[Edit Mode] Using OLD API format (MainData/DetailsData/ProcessData)')

          // Populate additional fields from MainData if available
          if (detailedData.MainData && detailedData.MainData.length > 0) {
            const mainData = detailedData.MainData[0]
            clientLogger.log('[Edit Mode] MainData:', mainData)

            // Update form data with additional fields from MainData
            setFormData(prev => ({
              ...prev,
              enquiryType: mainData.EnquiryType || prev.enquiryType || '',
              salesType: mainData.SalesType || prev.salesType || '',
              concernPerson: mainData.ConcernPerson || mainData.ConcernPersonName || prev.concernPerson || '',
              concernPersonMobile: mainData.Mobile || mainData.ConcernPersonMobile || prev.concernPersonMobile || '',
            }))
          }

          // Populate plan details (dimensions) if available - BUILD MULTI-CONTENT GRID
          if (detailedData.DetailsData && detailedData.DetailsData.length > 0) {
            clientLogger.log('[Edit Mode] Found', detailedData.DetailsData.length, 'contents in DetailsData')

            // Build contentGridData from all contents
            const gridData = detailedData.DetailsData.map((details: any, index: number) => {
              // Parse ContentSizeValues to extract dimensions
              const sizeValues: Record<string, string> = {}
              if (details.ContentSizeValues) {
                const pairs = details.ContentSizeValues.split('AndOr')
                pairs.forEach((pair: string) => {
                  const [key, value] = pair.split('=')
                  if (key && value) {
                    sizeValues[key] = value
                  }
                })
              }

              // Get content name
              const contentName = details.PlanContentType || details.PlanContName || details.ContentName || details.ContentType || ''

              // Build size string
              const sizeHeight = sizeValues.SizeHeight || ''
              const sizeLength = sizeValues.SizeLength || ''
              const sizeWidth = sizeValues.SizeWidth || ''
              const sizeParts = [sizeHeight, sizeLength, sizeWidth].filter(s => s && s !== '')
              const sizeString = sizeParts.length > 0 ? `${sizeParts.join(' x ')} MM` : '-'

              // Build other details string
              const quality = sizeValues.ItemPlanQuality || ''
              const gsm = sizeValues.ItemPlanGsm || ''
              const mill = sizeValues.ItemPlanMill || ''
              const finish = sizeValues.ItemPlanFinish || ''

              const otherDetailsParts = []
              if (quality) otherDetailsParts.push(`Board: ${quality}`)
              if (gsm) otherDetailsParts.push(`GSM: ${gsm}`)
              if (mill) otherDetailsParts.push(`Mill: ${mill}`)
              if (finish && finish !== '-') otherDetailsParts.push(`Finish: ${finish}`)
              const otherDetailsString = otherDetailsParts.length > 0 ? otherDetailsParts.join(', ') : '-'

              // Get processes for this content from ProcessData (filter by PlanContName with flexible matching)
              const normalizeForMatch = (str: string) => (str || '').toLowerCase().replace(/[\s\-_]+/g, '')
              const contentNameNormalized = normalizeForMatch(contentName)
              const contentProcesses = detailedData.ProcessData?.filter((p: any) => {
                const pContName = normalizeForMatch(p.PlanContName || '')
                const pContentType = normalizeForMatch(p.PlanContentType || '')
                const pContentName = normalizeForMatch(p.ContentName || '')
                return pContName === contentNameNormalized ||
                       pContentType === contentNameNormalized ||
                       pContentName === contentNameNormalized ||
                       p.PlanContName === contentName ||
                       p.PlanContentType === contentName
              }).map((p: any) => ({
                ProcessID: Number(p.ProcessID),
                ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
              })) || []

              // If no processes matched and this is the only content, assign all processes
              let finalProcesses = contentProcesses
              if (contentProcesses.length === 0 && detailedData.DetailsData.length === 1 && detailedData.ProcessData?.length > 0) {
                clientLogger.log(`[Edit Mode] No matched processes, assigning all processes to single content`)
                finalProcesses = detailedData.ProcessData.map((p: any) => ({
                  ProcessID: Number(p.ProcessID),
                  ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
                }))
              }

              clientLogger.log(`[Edit Mode] Content ${index + 1}:`, contentName, 'with', finalProcesses.length, 'processes')

              return {
                id: Date.now() + index + Math.random() * 1000,
                contentName: contentName,
                ContentName: contentName,
                Size: sizeString,
                OtherDetails: otherDetailsString,
                rawData: {
                  content: {
                    ContentID: details.ContentID || details.PlanContentID,
                    ContentName: contentName,
                  },
                  planDetails: { ...sizeValues },
                  processes: finalProcesses,
                },
                ...sizeValues,
              }
            })

            // Set contentGridData with all contents
            setContentGridData(gridData)
            clientLogger.log('[Edit Mode] Populated contentGridData with', gridData.length, 'contents')

            // Also set the first content for form display (for backwards compatibility)
            const firstDetails = detailedData.DetailsData[0]
            if (firstDetails.ContentSizeValues) {
              const sizeValues: Record<string, string> = {}
              const pairs = firstDetails.ContentSizeValues.split('AndOr')
              pairs.forEach((pair: string) => {
                const [key, value] = pair.split('=')
                if (key && value) {
                  sizeValues[key] = value
                }
              })
              setPlanDetails(prev => ({ ...prev, ...sizeValues }))
            }

            // Store content type to be selected after content types are loaded
            const contentTypeToSelect = firstDetails.PlanContentType || firstDetails.PlanContName || firstDetails.ContentName || firstDetails.ContentType
            const contentIdFromApi = firstDetails.ContentID || firstDetails.PlanContentID

            clientLogger.log('[Edit Mode] Content type to select:', contentTypeToSelect)
            clientLogger.log('[Edit Mode] Content ID from API:', contentIdFromApi)

            if (contentTypeToSelect) {
              setFormData(prev => ({ ...prev, contentType: contentTypeToSelect }))
              setPendingContentTypeToSelect(contentTypeToSelect)
            }

            if (contentIdFromApi) {
              setSelectedContentIds([Number(contentIdFromApi)])
            }
          }

          // Populate selected processes if available (for first content)
          if (detailedData.ProcessData && detailedData.ProcessData.length > 0) {
            const firstContentName = detailedData.DetailsData?.[0]?.PlanContentType || detailedData.DetailsData?.[0]?.PlanContName
            const firstContentProcesses = detailedData.ProcessData
              .filter((p: any) => !firstContentName || p.PlanContName === firstContentName || p.PlanContentType === firstContentName)
              .map((p: any) => ({
                ProcessID: Number(p.ProcessID),
                ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
              }))
            setSelectedProcesses(firstContentProcesses.length > 0 ? firstContentProcesses : detailedData.ProcessData.map((p: any) => ({
              ProcessID: Number(p.ProcessID),
              ProcessName: p.ProcessName || p.ProcessID?.toString() || ''
            })))
          }
        }
      } else {
        clientLogger.log('[Edit Mode] No detailed data available')
      }

      // If no content was found from detailedData, try to get it from rawData
      // This handles the case where the enquiry was created without detailed content
      if (selectedContentIds.length === 0 && initialData.rawData) {
        clientLogger.log('[Edit Mode] Checking rawData for content info...')
        const rawContentType = initialData.rawData.ContentType || initialData.rawData.ContentName || initialData.rawData.PlanContentType
        const rawContentId = initialData.rawData.ContentID

        clientLogger.log('[Edit Mode] rawData ContentType:', rawContentType)
        clientLogger.log('[Edit Mode] rawData ContentID:', rawContentId)

        if (rawContentType && !formData.contentType) {
          setFormData(prev => ({ ...prev, contentType: rawContentType }))
          setPendingContentTypeToSelect(rawContentType)
          clientLogger.log('[Edit Mode] Set pendingContentTypeToSelect from rawData:', rawContentType)
        }

        if (rawContentId) {
          setSelectedContentIds([Number(rawContentId)])
        }
      }

      // Set form type to 'detailed' for edit mode if there is detailed data
      if (initialData.detailedData || initialData.rawData) {
        setFormType('detailed')
        clientLogger.log('[Edit Mode] Set form type to detailed')
      }

      setIsFetchingEnquiryNo(false)
    }
  }, [editMode, initialData, categories, clients, salesPersons, productionUnits])

  // Select content type after content types are loaded (for edit mode)
  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('🔍 CONTENT SELECTION useEffect triggered')
    console.log('─────────────────────────────────────────────────────────────')
    console.log('📋 editMode:', editMode)
    console.log('📋 pendingContentTypeToSelect:', pendingContentTypeToSelect)
    console.log('📋 formData.contentType:', formData.contentType)
    console.log('📋 contentTypes.length:', contentTypes.length)
    console.log('📋 selectedContentIds.length:', selectedContentIds.length)
    console.log('📋 selectedContent:', selectedContent?.ContentName)
    console.log('═══════════════════════════════════════════════════════════════')

    // Use pendingContentTypeToSelect as the primary source (set when edit mode data is loaded)
    const contentTypeToMatch = pendingContentTypeToSelect || formData.contentType

    // Run if in edit mode, have content type to match, content types are loaded
    // Remove the !selectedContent check to allow re-selection if needed
    if (editMode && contentTypeToMatch && contentTypes.length > 0) {
      // Skip if content is already correctly selected
      if (selectedContent?.ContentName) {
        const normalizeString = (str: string) => str?.replace(/[\s\-_]+/g, '').toLowerCase() || ''
        if (normalizeString(selectedContent.ContentName) === normalizeString(contentTypeToMatch)) {
          console.log('[Edit Mode] ⏭️ Content already correctly selected:', selectedContent.ContentName)
          return
        }
      }
      console.log('[Edit Mode] ✅ All conditions met, attempting to select content type:', contentTypeToMatch)
      console.log('[Edit Mode] Available content types:', contentTypes.map(c => ({ id: c.ContentID, name: c.ContentName, code: c.ContentCode, domain: c.ContentDomainType })))

      // Normalize the search term (remove spaces, dashes, underscores and convert to lowercase)
      const normalizeString = (str: string) => str?.replace(/[\s\-_]+/g, '').toLowerCase() || ''
      const searchTerm = normalizeString(contentTypeToMatch)
      console.log('[Edit Mode] Normalized search term:', searchTerm)

      // Find content by PlanContentType or ContentCode or ContentName
      let matchingContent = contentTypes.find((c) => {
        const matches = (
          normalizeString(c.ContentDomainType) === searchTerm ||
          normalizeString(c.ContentCode) === searchTerm ||
          normalizeString(c.ContentName) === searchTerm ||
          c.ContentDomainType === contentTypeToMatch ||
          c.ContentCode === contentTypeToMatch ||
          c.ContentName === contentTypeToMatch
        )

        if (matches) {
          console.log('[Edit Mode] Found exact match:', c.ContentName)
        }

        return matches
      })

      // If no exact match, try partial matching (contains)
      if (!matchingContent) {
        console.log('[Edit Mode] No exact match, trying partial matching...')
        matchingContent = contentTypes.find((c) => {
          const contentNameNormalized = normalizeString(c.ContentName)
          const contentCodeNormalized = normalizeString(c.ContentCode)
          const domainTypeNormalized = normalizeString(c.ContentDomainType)

          const partialMatch = (
            contentNameNormalized.includes(searchTerm) ||
            searchTerm.includes(contentNameNormalized) ||
            contentCodeNormalized.includes(searchTerm) ||
            searchTerm.includes(contentCodeNormalized) ||
            domainTypeNormalized.includes(searchTerm) ||
            searchTerm.includes(domainTypeNormalized)
          )

          if (partialMatch) {
            console.log('[Edit Mode] Found partial match:', c.ContentName, 'for search term:', searchTerm)
          }

          return partialMatch
        })
      }

      if (matchingContent) {
        console.log('[Edit Mode] ✅ Found matching content:', matchingContent.ContentName, 'ID:', matchingContent.ContentID)
        setSelectedContentIds([matchingContent.ContentID])
        setSelectedContent(matchingContent)
        // Clear the pending state after successful selection
        setPendingContentTypeToSelect(null)
      } else {
        console.log('[Edit Mode] ❌ No matching content found for:', contentTypeToMatch)
        console.log('[Edit Mode] Available content names:', contentTypes.map(c => `${c.ContentName} (code: ${c.ContentCode}, domain: ${c.ContentDomainType})`))
      }
    } else {
      console.log('[Edit Mode] ⚠️ Conditions not met, skipping content selection')
      if (!editMode) console.log('  - Not in edit mode')
      if (!contentTypeToMatch) console.log('  - No contentType to match')
      if (contentTypes.length === 0) console.log('  - ContentTypes not loaded yet')
    }
  }, [editMode, pendingContentTypeToSelect, formData.contentType, contentTypes, selectedContent])

  // Set selectedContent object when selectedContentIds is set directly (from API ContentID)
  useEffect(() => {
    if (editMode && selectedContentIds.length > 0 && contentTypes.length > 0 && !selectedContent) {
      console.log('[Edit Mode] Trying to find content by ID:', selectedContentIds[0], 'Type:', typeof selectedContentIds[0])
      console.log('[Edit Mode] Available ContentIDs:', contentTypes.map(c => ({ id: c.ContentID, type: typeof c.ContentID })))

      // Try exact match first (same type)
      let matchingContent = contentTypes.find((c) => c.ContentID === selectedContentIds[0])

      // Try converting to same type if no match
      if (!matchingContent) {
        matchingContent = contentTypes.find((c) => Number(c.ContentID) === Number(selectedContentIds[0]))
      }

      // Try string comparison if still no match
      if (!matchingContent) {
        matchingContent = contentTypes.find((c) => String(c.ContentID) === String(selectedContentIds[0]))
      }

      if (matchingContent) {
        console.log('[Edit Mode] ✅ Setting selectedContent from ContentID:', matchingContent.ContentName)
        setSelectedContent(matchingContent)
        // Also set formData.contentType if not already set
        if (!formData.contentType) {
          setFormData(prev => ({ ...prev, contentType: matchingContent.ContentName }))
        }
      } else if (formData.contentType) {
        console.log('[Edit Mode] ❌ ContentID not found, trying to match by name:', formData.contentType)
        // ContentID didn't match, try name matching immediately
        const normalizeString = (str: string) => str?.replace(/[\s\-_]+/g, '').toLowerCase() || ''
        const searchTerm = normalizeString(formData.contentType)

        // Find content by name
        let matchByName = contentTypes.find((c) => {
          return (
            normalizeString(c.ContentDomainType) === searchTerm ||
            normalizeString(c.ContentCode) === searchTerm ||
            normalizeString(c.ContentName) === searchTerm ||
            c.ContentDomainType === formData.contentType ||
            c.ContentCode === formData.contentType ||
            c.ContentName === formData.contentType
          )
        })

        // Try partial matching if no exact match
        if (!matchByName) {
          matchByName = contentTypes.find((c) => {
            const contentNameNormalized = normalizeString(c.ContentName)
            const contentCodeNormalized = normalizeString(c.ContentCode)
            const domainTypeNormalized = normalizeString(c.ContentDomainType)
            return (
              contentNameNormalized.includes(searchTerm) ||
              searchTerm.includes(contentNameNormalized) ||
              contentCodeNormalized.includes(searchTerm) ||
              searchTerm.includes(contentCodeNormalized) ||
              domainTypeNormalized.includes(searchTerm) ||
              searchTerm.includes(domainTypeNormalized)
            )
          })
        }

        if (matchByName) {
          console.log('[Edit Mode] ✅ Found content by name matching:', matchByName.ContentName, 'ID:', matchByName.ContentID)
          setSelectedContentIds([matchByName.ContentID])
          setSelectedContent(matchByName)
        } else {
          console.log('[Edit Mode] ❌ No matching content found by ID or name')
          // Clear selectedContentIds only if truly no match found
          setSelectedContentIds([])
        }
      } else {
        console.log('[Edit Mode] ❌ No ContentID match and no contentType name to match')
        setSelectedContentIds([])
      }
    }
  }, [editMode, selectedContentIds, contentTypes, selectedContent, formData.contentType])

  // Fetch all master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      // Fetch categories
      const categoriesResponse = await EnquiryAPI.getEnquiryCategories(null)
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data)
      }

      // Fetch clients
      const clientsResponse = await MasterDataAPI.getClients(null)
      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data)
      }

      // Fetch production units
      const unitsResponse = await MasterDataAPI.getProductionUnits(null)
      if (unitsResponse.success && unitsResponse.data) {
        setProductionUnits(unitsResponse.data)
      }

      // Fetch sales persons
      const salesResponse = await MasterDataAPI.getSalesPersons(null)
      if (salesResponse.success && salesResponse.data) {
        setSalesPersons(salesResponse.data)
      }

      // Fetch allowed processes
      const processesResponse = await EnquiryAPI.getAllowedProcesses(null)
      if (processesResponse.success && processesResponse.data) {
        setAvailableProcesses(processesResponse.data)
      }

      // Mark master data as loaded
      setIsMasterDataLoaded(true)
    }
    fetchMasterData()
  }, [])

  // Fetch content types when category changes
  useEffect(() => {
    const fetchContentTypes = async () => {
      if (selectedCategoryId) {
        console.log('═══════════════════════════════════════════════════════════════')
        console.log('📦 FETCHING CONTENT TYPES for category:', selectedCategoryId)
        console.log('═══════════════════════════════════════════════════════════════')
        const response = await EnquiryAPI.getContentTypes(selectedCategoryId, null)
        if (response.success && response.data) {
          console.log('✅ Content types loaded:', response.data.length, 'items')
          console.log('📋 Content types:', response.data.map((c: any) => ({ id: c.ContentID, name: c.ContentName })))
          setContentTypes(response.data)
        } else {
          console.log('❌ Failed to fetch content types:', response.error)
        }
      }
    }
    fetchContentTypes()
  }, [selectedCategoryId])

  // Fetch concern persons when client changes (detailed form only)
  useEffect(() => {
    const loadConcernPersons = async () => {
      console.log('🟢 [Concern Persons] useEffect triggered - clientName:', formData.clientName, 'formType:', formType)

      if (!formData.clientName || formType !== 'detailed') {
        console.log('🟢 [Concern Persons] Skipping - no clientName or not detailed form')
        setConcernPersons([])
        return
      }

      try {
        const ledgerId = parseInt(formData.clientName)
        if (isNaN(ledgerId)) {
          console.log('🟢 [Concern Persons] Invalid LedgerID:', formData.clientName)
          return
        }

        console.log('🟢 [Concern Persons] Fetching for LedgerID:', ledgerId)
        const response = await EnquiryAPI.getConcernPersons(ledgerId, null)
        console.log('🟢 [Concern Persons] API Response:', response)

        if (response.data && Array.isArray(response.data)) {
          setConcernPersons(response.data)
          console.log('🟢 [Concern Persons] Loaded:', response.data.length, 'persons:', response.data)

          // Auto-select first concern person if available and no selection yet
          if (response.data.length > 0 && !formData.concernPerson) {
            const firstPerson = response.data[0]
            setFormData(prev => ({
              ...prev,
              concernPerson: firstPerson.ConcernPersonID.toString(),
              concernPersonMobile: firstPerson.Mobile || ''
            }))
            console.log('🟢 [Concern Persons] Auto-selected first person:', firstPerson.Name, 'Mobile:', firstPerson.Mobile)
          }
        } else {
          console.log('🟢 [Concern Persons] No data in response:', response)
          setConcernPersons([])
        }
      } catch (error) {
        console.error('🟢 [Concern Persons] Error fetching:', error)
        setConcernPersons([])
      }
    }

    loadConcernPersons()
  }, [formData.clientName, formType])

  // Auto-fill mobile when concern person selection changes
  useEffect(() => {
    if (formData.concernPerson && concernPersons.length > 0) {
      const selectedPerson = concernPersons.find(
        p => p.ConcernPersonID.toString() === formData.concernPerson
      )
      if (selectedPerson && selectedPerson.Mobile) {
        setFormData(prev => ({
          ...prev,
          concernPersonMobile: selectedPerson.Mobile
        }))
        clientLogger.log('[Concern Person] Auto-filled mobile:', selectedPerson.Mobile)
      }
    }
  }, [formData.concernPerson, concernPersons])

  // Fetch qualities when content is selected
  useEffect(() => {
    const fetchQualities = async () => {
      if (selectedContentIds.length > 0) {
        const selectedContentItem = contentTypes.find((c) => c.ContentID === selectedContentIds[0])

        if (selectedContentItem?.ContentCode || selectedContentItem?.ContentName) {
          // Use ContentCode (like "RTI") or ContentName - NOT ContentDomainType
          const contentTypeForAPI = selectedContentItem.ContentCode || selectedContentItem.ContentName

          const response = await MasterDataAPI.getItemQualities(contentTypeForAPI, null)
          if (response.success && response.data) {
            setQualities(response.data)
          } else {
          }
        } else {
        }
      } else {
        setQualities([])
      }
    }
    fetchQualities()
  }, [selectedContentIds, contentTypes])

  // Fetch processes when content type is selected
  useEffect(() => {
    const fetchProcesses = async () => {
      clientLogger.log('🔧 useEffect triggered - selectedContentIds:', selectedContentIds)

      if (selectedContentIds.length > 0) {
        const selectedContentItem = contentTypes.find((c) => c.ContentID === selectedContentIds[0])
        clientLogger.log('🔧 Selected content item:', selectedContentItem)

        if (selectedContentItem?.ContentName) {
          clientLogger.log('🔧 Fetching processes for:', selectedContentItem.ContentName)
          setLoadingProcesses(true)
          try {
            const response = await EnquiryAPI.getProcesses(selectedContentItem.ContentName, null)
            clientLogger.log('🔧 Process fetch response:', response)
            if (response.success && response.data) {
              clientLogger.log('🔧 Setting available processes:', response.data)
              setAvailableProcesses(response.data)
            } else {
              clientLogger.log('🔧 Response not successful or no data, clearing processes')
              setAvailableProcesses([])
            }
          } catch (error) {
            clientLogger.error('🔧 Failed to fetch processes:', error)
            setAvailableProcesses([])
          } finally {
            setLoadingProcesses(false)
          }
        }
      } else {
        clientLogger.log('🔧 No content IDs selected, clearing processes')
        setAvailableProcesses([])
      }
    }
    fetchProcesses()
  }, [selectedContentIds, contentTypes])

  // Fetch GSM when quality is selected
  useEffect(() => {
    const fetchGSM = async () => {

      if (selectedContentIds.length > 0 && planDetails.ItemPlanQuality) {
        const selectedContentItem = contentTypes.find((c) => c.ContentID === selectedContentIds[0])

        if (selectedContentItem?.ContentCode || selectedContentItem?.ContentName) {
          // Use ContentCode or ContentName - NOT ContentDomainType
          const contentTypeForAPI = selectedContentItem.ContentCode || selectedContentItem.ContentName

          const response = await MasterDataAPI.getGSMData(
            contentTypeForAPI,
            planDetails.ItemPlanQuality,
            null
          )
          if (response.success && response.data) {
            setGsmOptions(response.data)
          } else {
          }
        } else {
        }
      } else {
        setGsmOptions([])
      }
    }
    fetchGSM()
  }, [planDetails.ItemPlanQuality, selectedContentIds, contentTypes])

  // Fetch Mill when GSM is selected
  useEffect(() => {
    const fetchMill = async () => {
      if (selectedContentIds.length > 0 && planDetails.ItemPlanQuality && planDetails.ItemPlanGsm) {
        const selectedContentItem = contentTypes.find((c) => c.ContentID === selectedContentIds[0])
        if (selectedContentItem?.ContentCode || selectedContentItem?.ContentName) {
          // Use ContentCode or ContentName - NOT ContentDomainType
          const contentTypeForAPI = selectedContentItem.ContentCode || selectedContentItem.ContentName

          const response = await MasterDataAPI.getMillData(
            contentTypeForAPI,
            planDetails.ItemPlanQuality,
            parseInt(planDetails.ItemPlanGsm),
            null
          )
          if (response.success && response.data) {
            if (Array.isArray(response.data) && response.data.length > 0) {
            }
            setMillOptions(response.data)
            // Auto-fill if only one option
            if (response.data.length === 1) {
              const millValue = typeof response.data[0] === 'object' ? ((response.data[0] as any).Mill || (response.data[0] as any).mill) : response.data[0]
              handlePlanDetailChange('ItemPlanMill', millValue?.toString() || response.data[0].toString())
            }
          }
        }
      } else {
        // Reset mill options when dependencies are not met
        setMillOptions([])
      }
    }
    fetchMill()
  }, [planDetails.ItemPlanGsm, planDetails.ItemPlanQuality, selectedContentIds, contentTypes])

  // Fetch Finish when Mill is selected
  useEffect(() => {
    const fetchFinish = async () => {
      if (planDetails.ItemPlanQuality && planDetails.ItemPlanGsm && planDetails.ItemPlanMill) {
        const response = await MasterDataAPI.getFinishData(
          planDetails.ItemPlanQuality,
          parseInt(planDetails.ItemPlanGsm),
          planDetails.ItemPlanMill,
          null
        )
        if (response.success && response.data) {
          setFinishOptions(response.data)
        }
      }
    }
    fetchFinish()
  }, [planDetails.ItemPlanMill, planDetails.ItemPlanQuality, planDetails.ItemPlanGsm])

  // Fetch enquiry number on component mount
  useEffect(() => {
    const fetchEnquiryNumber = async () => {
      try {
        setIsFetchingEnquiryNo(true)

        const response = await fetch('https://api.indusanalytics.co.in/api/enquiry/getenquiryno', {
          method: 'GET',
          headers: {
            'CompanyID': '2',
            'UserID': '2',
            'Authorization': `Basic ${btoa('parksonsnew:parksonsnew')}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (response.ok) {
          // Handle different response formats
          let enquiryNumber = null

          if (typeof data === 'string') {
            enquiryNumber = data
          } else if (data.data) {
            enquiryNumber = data.data
          } else if (data.Data) {
            enquiryNumber = data.Data
          }

          if (enquiryNumber) {
            setFormData(prev => ({ ...prev, enquiryNo: enquiryNumber }))
          } else {
            setFormData(prev => ({ ...prev, enquiryNo: 'N/A' }))
          }
        } else {
          setFormData(prev => ({ ...prev, enquiryNo: 'Error' }))
        }
      } catch (error) {
        setFormData(prev => ({ ...prev, enquiryNo: 'Error' }))
      } finally {
        setIsFetchingEnquiryNo(false)
      }
    }

    fetchEnquiryNumber()
  }, [])

  // Helper function to get date constraints (current date and previous 2 days)
  const getDateConstraints = () => {
    const today = new Date()
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(today.getDate() - 2)

    return {
      min: twoDaysAgo.toISOString().split('T')[0],
      max: today.toISOString().split('T')[0]
    }
  }

  // Mobile number validation helper
  const validateMobileNumber = (value: string): boolean => {
    // Allow only digits, max 10 characters
    const digitsOnly = value.replace(/\D/g, '')
    return digitsOnly.length <= 10
  }

  const handleInputChange = (field: string, value: string) => {
    // Special validation for mobile number
    if (field === 'concernPersonMobile') {
      // Only allow digits and max 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
      setFormData((prev) => ({ ...prev, [field]: digitsOnly }))

      // Set validation error if not exactly 10 digits (but allow empty)
      if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
        setValidationErrors((prev) => ({ ...prev, [field]: true }))
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
      return
    }

    // Special validation for enquiry date
    if (field === 'enquiryDate') {
      const { min, max } = getDateConstraints()
      const selectedDate = new Date(value)
      const minDate = new Date(min)
      const maxDate = new Date(max)

      if (selectedDate < minDate || selectedDate > maxDate) {
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "Enquiry date must be within the last 2 days",
        })
        return
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray: AttachedFile[] = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }))

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...fileArray],
    }))
  }

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const handleContentSelect = (contentId: number) => {
    // Check if content is actually changing
    const isChanging = !selectedContentIds.includes(contentId)

    setSelectedContentIds((prev) => {
      // Only allow single selection
      if (prev.includes(contentId)) {
        // Deselect if clicking the same content
        return []
      }
      // Replace with new selection
      return [contentId]
    })

    // If content changed, clear sizes, quality, processes
    if (isChanging) {
      setPlanDetails({})
      setSelectedProcesses([])
      clientLogger.log('[Content Change] Cleared sizes, quality and processes for new content')
    }
  }

  const handleProcessToggle = (process: {ProcessID: number, ProcessName: string}) => {
    const processId = Number(process.ProcessID)
    setSelectedProcesses((prev) => {
      const isSelected = prev.some(p => Number(p.ProcessID) === processId)
      if (isSelected) {
        return prev.filter((p) => Number(p.ProcessID) !== processId)
      }
      return [...prev, { ProcessID: processId, ProcessName: process.ProcessName }]
    })
  }

  const handlePlanDetailChange = (field: string, value: string) => {
    setPlanDetails((prev) => ({ ...prev, [field]: value }))
  }

  const handleApplyContent = () => {
    if (selectedContentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No Content Selected",
        description: "Please select at least one content",
      })
      return
    }

    const selectedContents = contentTypes.filter((c) => selectedContentIds.includes(c.ContentID))

    const newContentData = selectedContents.map((content) => {
      // Build size string from actual plan detail fields
      const sizeHeight = planDetails.SizeHeight || planDetails.sizeHeight || ''
      const sizeLength = planDetails.SizeLength || planDetails.sizeLength || ''
      const sizeWidth = planDetails.SizeWidth || planDetails.sizeWidth || ''
      const sizeParts = [sizeHeight, sizeLength, sizeWidth].filter(s => s && s !== '')
      const sizeString = sizeParts.length > 0 ? `${sizeParts.join(' x ')} MM` : '-'

      // Build other details from material properties
      const gsm = planDetails.ItemPlanGsm || ''
      const quality = planDetails.ItemPlanQuality || ''
      const mill = planDetails.ItemPlanMill || ''
      const finish = planDetails.ItemPlanFinish || ''

      const otherDetailsParts = []
      if (quality) otherDetailsParts.push(`Board: ${quality}`)
      if (gsm) otherDetailsParts.push(`GSM: ${gsm}`)
      if (mill) otherDetailsParts.push(`Mill: ${mill}`)
      if (finish && finish !== '-') otherDetailsParts.push(`Finish: ${finish}`)

      const otherDetailsString = otherDetailsParts.length > 0 ? otherDetailsParts.join(', ') : '-'

      return {
        id: Date.now() + content.ContentID,
        contentName: content.ContentName,
        ContentName: content.ContentName,
        Size: sizeString,
        OtherDetails: otherDetailsString,
        rawData: {
          content,
          planDetails: { ...planDetails },
          processes: [...selectedProcesses],
        },
        // Add all plan details to the content data
        ...planDetails,
      }
    })

    setContentGridData((prev) => [...prev, ...newContentData])

    // Reset selections
    setSelectedContentIds([])
    setSelectedProcesses([])
    setPlanDetails({})

    toast({
      title: "Success",
      description: `${newContentData.length} content(s) added successfully`,
    })
  }

  const handleContentDelete = (contentId: number) => {
    setContentGridData((prev) => prev.filter((c) => c.id !== contentId))
  }

  // Edit content - loads content back to form for modification and removes from grid
  const handleContentEdit = (content: any) => {
    const { rawData } = content
    if (rawData) {
      // Restore content selection
      if (rawData.content?.ContentID) {
        setSelectedContentIds([rawData.content.ContentID])
        setSelectedContent(rawData.content)
      }

      // Restore plan details (sizes, material properties, etc.)
      if (rawData.planDetails) {
        setPlanDetails(rawData.planDetails)
      }

      // Restore selected processes
      if (rawData.processes && rawData.processes.length > 0) {
        setSelectedProcesses(rawData.processes)
      }

      // Remove the content from grid since we're editing it
      setContentGridData((prev) => prev.filter((c) => c.id !== content.id))

      toast({
        title: "Content Loaded for Edit",
        description: "Make your changes and click Apply to update.",
      })
    }
  }

  // Duplicate content - loads content data to form but keeps original in grid
  const handleContentDuplicate = (content: any) => {
    const { rawData } = content
    if (rawData) {
      // Restore content selection
      if (rawData.content?.ContentID) {
        setSelectedContentIds([rawData.content.ContentID])
        setSelectedContent(rawData.content)
      }

      // Restore plan details (sizes, material properties, etc.)
      if (rawData.planDetails) {
        setPlanDetails(rawData.planDetails)
      }

      // Restore selected processes
      if (rawData.processes && rawData.processes.length > 0) {
        setSelectedProcesses(rawData.processes)
      }

      // Keep the original content in grid (don't remove it)
      toast({
        title: "Content Duplicated",
        description: "Modify and click Apply to add as new content.",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const errors: Record<string, boolean> = {}

    if (!formData.clientName) errors.clientName = true
    if (!formData.jobName) errors.jobName = true
    if (!formData.quantity || Number(formData.quantity) === 0) errors.quantity = true
    if (!formData.salesPerson) errors.salesPerson = true
    if (!formData.plant) errors.plant = true
    // UOM is now fixed to "PCS", no validation needed
    // Category is only required for detailed form (the field is only shown in detailed form)
    if (formType === 'detailed' && !formData.categoryName) errors.categoryName = true

    // Annual Quantity is mandatory for detailed form
    if (formType === 'detailed' && (!formData.annualQuantity || Number(formData.annualQuantity) === 0)) {
      errors.annualQuantity = true
    }

    // Board and GSM are mandatory for detailed form when content is selected
    if (formType === 'detailed' && selectedContentIds.length > 0) {
      if (!planDetails.ItemPlanQuality) {
        toast({
          variant: "destructive",
          title: "Board Required",
          description: "Please select board",
        })
        return
      }
      if (!planDetails.ItemPlanGsm) {
        toast({
          variant: "destructive",
          title: "GSM Required",
          description: "Please select GSM (paper weight)",
        })
        return
      }
    }

    // File name validation
    const invalidPattern = /[^A-Za-z0-9._\-\s()]/g
    for (const file of formData.attachments) {
      if (invalidPattern.test(file.name)) {
        toast({
          variant: "destructive",
          title: "Invalid File Name",
          description: `File name contains unsupported special characters. Only letters, numbers, _, -, . are allowed: ${file.name}`,
        })
        return
      }
      if (file.name.length > 65) {
        toast({
          variant: "destructive",
          title: "File Name Too Long",
          description: `File name must not exceed 60 characters (including extension): ${file.name}`,
        })
        return
      }
    }

    // Validate size fields for detailed form
    if (formType === 'detailed' && selectedContentIds.length > 0) {
      const firstSelectedContent = contentTypes.find((c) => selectedContentIds.includes(c.ContentID))
      if (firstSelectedContent?.ContentSizes) {
        const requiredSizeFields = firstSelectedContent.ContentSizes.split(',').map((s: string) => s.trim())
        const missingSizes: string[] = []

        const fieldLabels: Record<string, string> = {
          'SizeHeight': 'Height',
          'SizeLength': 'Length',
          'SizeWidth': 'Width',
          'SizeOpenflap': 'Open Flap',
          'SizePastingflap': 'Pasting Flap',
          'JobUps': 'Job Ups',
          'SizeDiameter': 'Diameter',
          'SizeDepth': 'Depth',
        }

        for (const field of requiredSizeFields) {
          if (!planDetails[field] || planDetails[field].toString().trim() === '') {
            const label = fieldLabels[field] || field
            missingSizes.push(label)
          }
        }

        if (missingSizes.length > 0) {
          toast({
            variant: "destructive",
            title: "Missing Size Fields",
            description: `Please fill in all size fields: ${missingSizes.join(', ')}. All size dimensions are mandatory for this content type.`,
          })
          return
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)

      // Map field names to user-friendly labels
      const fieldLabels: Record<string, string> = {
        clientName: 'Customer Name',
        jobName: 'Job Name',
        quantity: 'Quantity',
        salesPerson: 'Sales Person',
        categoryName: 'Category',
        plant: 'Production Unit',
        unit: 'UOM',
        annualQuantity: 'Annual Quantity',
      }

      const missingFields = Object.keys(errors).map(key => fieldLabels[key] || key)

      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
      })
      return
    }

    // Clear validation errors
    setValidationErrors({})

    try {
      setIsLoading(true)

      // Helper functions to get IDs from form values
      const getLedgerID = () => {
        // Client dropdown stores LedgerId directly
        const parsed = parseInt(formData.clientName)
        return isNaN(parsed) ? 0 : parsed
      }

      const getCategoryID = () => {
        // Category dropdown stores CategoryId directly
        const parsed = parseInt(formData.categoryName)
        return isNaN(parsed) ? 0 : parsed
      }

      const getProductionUnitID = () => {
        // Production unit dropdown stores ProductionUnitID directly
        const parsed = parseInt(formData.plant)
        return isNaN(parsed) ? 0 : parsed
      }

      const getEmployeeID = () => {
        // Sales person dropdown stores EmployeeID directly
        const parsed = parseInt(formData.salesPerson)
        return isNaN(parsed) ? 0 : parsed
      }

      if (formType === 'basic') {
        // Submit Basic Enquiry
        const basicEnquiryData: BasicEnquiryData = {
          ProductCode: formData.productCode || '',
          LedgerID: getLedgerID(),
          JObName: formData.jobName,
          FileName: formData.attachments.length > 0 ? formData.attachments[0].name : '',
          Quantity: parseInt(formData.quantity) || 0,
          EnquiryDate: formData.enquiryDate,
          Remark: formData.remark || '',
          SalesEmployeeID: getEmployeeID(),
          TypeOfJob: formData.typeOfPrinting || 'Commercial',
          UnitCost: 0,
          Status: 'Costing',
          CategoryID: getCategoryID(),
        }

        const response = await EnquiryAPI.saveBasicEnquiry([basicEnquiryData], null, getProductionUnitID())

        if (response.success) {
          toast({
            title: "Success",
            description: "Enquiry created successfully!",
          })
          router.push("/inquiries")
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to save enquiry: ${response.error}`,
          })
        }
      } else {
        // Submit Detailed Enquiry
        // Get selected content info
        const selectedContentItem = selectedContentIds.length > 0
          ? contentTypes.find((c) => c.ContentID === selectedContentIds[0])
          : null

        // Format date to "DD MMM YYYY" format
        const formatEnquiryDate = (dateStr: string) => {
          const date = new Date(dateStr)
          const day = date.getDate()
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          const month = monthNames[date.getMonth()]
          const year = date.getFullYear()
          return `${day} ${month} ${year}`
        }

        const mainData = {
          ProductCode: formData.productCode || '',
          LedgerID: getLedgerID(),
          SalesEmployeeID: getEmployeeID(),
          CategoryID: getCategoryID(),
          ConcernPersonID: null,
          JobName: formData.jobName,
          FileName: formData.attachments.length > 0 ? formData.attachments[0].name : '',
          EnquiryDate: formatEnquiryDate(formData.enquiryDate),
          EstimationUnit: formData.unit || 'PCS',
          ExpectCompletion: formData.expectCompletion || '',
          Remark: formData.remark || '',
          TypeOfJob: null,
          TypeOfPrinting: null,
          EnquiryType: formData.enquiryType || 'General',
          SalesType: formData.salesType || 'Export',
          AnnualQuantity: parseInt(formData.annualQuantity) || parseInt(formData.quantity) || 0,
          PlantID: getProductionUnitID(),
          IsDetailed: 1,
          Source: 'parkbuddy',
          Quantity: String(parseInt(formData.quantity) || 0),
        }

        // Helper function to build ContentSizeValues string from plan details
        const buildContentSizeValuesFromPlan = (plan: Record<string, any>) => {
          const parts: string[] = []
          if (plan.SizeHeight) parts.push(`SizeHeight=${plan.SizeHeight}`)
          if (plan.SizeLength) parts.push(`SizeLength=${plan.SizeLength}`)
          if (plan.SizeWidth) parts.push(`SizeWidth=${plan.SizeWidth}`)
          if (plan.SizeOpenflap) parts.push(`SizeOpenflap=${plan.SizeOpenflap}`)
          if (plan.SizePastingflap) parts.push(`SizePastingflap=${plan.SizePastingflap}`)
          // Crash Lock fields
          if (plan.SizeBottomflap) parts.push(`SizeBottomflap=${plan.SizeBottomflap}`)
          if (plan.SizeBottomflapPer) parts.push(`SizeBottomflapPer=${plan.SizeBottomflapPer}`)
          // Brochure JobFold fields
          if (plan.SizeJobFoldInH) parts.push(`SizeJobFoldInH=${plan.SizeJobFoldInH}`)
          if (plan.SizeJobFoldInL) parts.push(`SizeJobFoldInL=${plan.SizeJobFoldInL}`)
          if (plan.SizeJobFoldedH) parts.push(`SizeJobFoldedH=${plan.SizeJobFoldedH}`)
          if (plan.SizeJobFoldedL) parts.push(`SizeJobFoldedL=${plan.SizeJobFoldedL}`)
          if (plan.JobUps) parts.push(`JobUps=${plan.JobUps}`)
          if (plan.PlanFColor) parts.push(`PlanFColor=${plan.PlanFColor}`)
          if (plan.PlanBColor) parts.push(`PlanBColor=${plan.PlanBColor}`)
          if (plan.PlanSpeFColor) parts.push(`PlanSpeFColor=${plan.PlanSpeFColor}`)
          if (plan.PlanSpeBColor) parts.push(`PlanSpeBColor=${plan.PlanSpeBColor}`)
          if (plan.ItemPlanQuality) parts.push(`ItemPlanQuality=${plan.ItemPlanQuality}`)
          if (plan.ItemPlanGsm) parts.push(`ItemPlanGsm=${plan.ItemPlanGsm}`)
          if (plan.ItemPlanMill) parts.push(`ItemPlanMill=${plan.ItemPlanMill}`)
          if (plan.ItemPlanFinish) parts.push(`ItemPlanFinish=${plan.ItemPlanFinish}`)
          if (plan.PlanWastageType) parts.push(`PlanWastageType=${plan.PlanWastageType}`)
          return parts.join('AndOr')
        }

        // Helper function to build Size string for display from plan details
        const buildSizeStringFromPlan = (plan: Record<string, any>) => {
          const parts: string[] = []
          if (plan.SizeHeight) parts.push(`H=${plan.SizeHeight}`)
          if (plan.SizeLength) parts.push(`L=${plan.SizeLength}`)
          if (plan.SizeWidth) parts.push(`W=${plan.SizeWidth}`)
          if (plan.SizeOpenflap) parts.push(`OF=${plan.SizeOpenflap}`)
          if (plan.SizePastingflap) parts.push(`PF=${plan.SizePastingflap}`)
          // Crash Lock fields
          if (plan.SizeBottomflap) parts.push(`BF=${plan.SizeBottomflap}`)
          if (plan.SizeBottomflapPer) parts.push(`BF%=${plan.SizeBottomflapPer}`)
          // Brochure JobFold fields
          if (plan.SizeJobFoldedH) parts.push(`FH=${plan.SizeJobFoldedH}`)
          if (plan.SizeJobFoldedL) parts.push(`FL=${plan.SizeJobFoldedL}`)
          if (plan.SizeJobFoldInH) parts.push(`FInH=${plan.SizeJobFoldInH}`)
          if (plan.SizeJobFoldInL) parts.push(`FInL=${plan.SizeJobFoldInL}`)
          return parts.length > 0 ? parts.join(', ') + ' (MM)' : ''
        }

        // Build DetailsData and ProcessData from contentGridData if available, otherwise use current selections
        let detailsData: any[] = []
        let processData: any[] = []

        if (contentGridData.length > 0) {
          // Use contents from the grid (multiple contents)
          detailsData = contentGridData.map((gridItem) => {
            const contentPlanDetails = gridItem.rawData?.planDetails || gridItem
            const contentName = gridItem.ContentName || gridItem.contentName || ''
            return {
              PlanContName: contentName,
              Size: buildSizeStringFromPlan(contentPlanDetails),
              PlanContentType: contentName,
              ContentSizeValues: buildContentSizeValuesFromPlan(contentPlanDetails),
              valuesString: Object.values(contentPlanDetails).filter(v => v !== undefined && v !== null).join(','),
              JobSizeInCM: buildSizeStringFromPlan(contentPlanDetails),
            }
          })

          // Build process data for each content
          processData = contentGridData.flatMap((gridItem) => {
            const contentName = gridItem.ContentName || gridItem.contentName || ''
            const processes = gridItem.rawData?.processes || []
            return processes.map((process: any) => ({
              ProcessID: process.ProcessID,
              ProcessName: process.ProcessName,
              PlanContName: contentName,
              PlanContentType: contentName,
            }))
          })
        } else if (selectedContentItem) {
          // Fallback to current selections (single content, not applied to grid)
          detailsData = [{
            PlanContName: selectedContentItem.ContentName || '',
            Size: buildSizeStringFromPlan(planDetails),
            PlanContentType: selectedContentItem.ContentName || '',
            ContentSizeValues: buildContentSizeValuesFromPlan(planDetails),
            valuesString: Object.values(planDetails).filter(v => v !== undefined && v !== null).join(','),
            JobSizeInCM: buildSizeStringFromPlan(planDetails),
          }]

          processData = selectedProcesses.map(process => ({
            ProcessID: process.ProcessID,
            ProcessName: process.ProcessName,
            PlanContName: selectedContentItem.ContentName || '',
            PlanContentType: selectedContentItem.ContentName || '',
          }))
        }

        const detailedEnquiryData = {
          MainData: [{ ...mainData, Source: 'parkbuddy' }],
          DetailsData: detailsData,
          ProcessData: processData,
          Prefix: "EQ",
          Quantity: parseInt(formData.quantity) || 0,
          AnnualQuantity: parseInt(formData.annualQuantity || formData.quantity) || 0,
          IsEdit: "false",
          IsDetailed: 1,
          Source: 'parkbuddy',
          LayerDetailArr: [],
          JsonObjectsUserApprovalProcessArray: [{
            ProductCode: mainData.ProductCode,
            LedgerID: mainData.LedgerID,
            LedgerName: clients.find(c => c.LedgerId === getLedgerID())?.LedgerName || '',
            SalesEmployeeID: mainData.SalesEmployeeID,
            CategoryName: categories.find(c => c.CategoryId === getCategoryID())?.CategoryName || '',
            ConcernPersonID: mainData.ConcernPersonID,
            JobName: mainData.JobName,
            FileName: mainData.FileName,
            EnquiryDate: mainData.EnquiryDate,
            EstimationUnit: mainData.EstimationUnit,
            ExpectCompletion: mainData.ExpectCompletion,
            Remark: mainData.Remark,
            TypeOfJob: mainData.TypeOfJob,
            TypeOfPrinting: mainData.TypeOfPrinting,
            EnquiryType: mainData.EnquiryType,
            SalesType: mainData.SalesType,
            Quantity: String(parseInt(formData.quantity) || 0),
            AnnualQuantity: parseInt(formData.annualQuantity || formData.quantity) || 0,
            Source: 'parkbuddy',
          }],
        }

        clientLogger.log('🚀 === DETAILED ENQUIRY SUBMISSION ===')
        clientLogger.log('📤 Sending data to API:', JSON.stringify(detailedEnquiryData, null, 2))
        clientLogger.log('📋 Main Data:', mainData)
        clientLogger.log('📋 Details Data:', detailsData)
        clientLogger.log('📋 Process Data:', processData)
        clientLogger.log('🌐 Endpoint: POST /api/enquiry/SaveMultipleEnquiry')
        clientLogger.log('====================================')

        // Use update API if in edit mode, otherwise create new
        let response
        if (editMode && initialData) {
          // Build update data without Prefix field (only for create)
          // Match exact format from API spec: /api/enquiry/updatmultipleenquiry
          // Remove Quantity from MainData for update
          const updateMainData = detailedEnquiryData.MainData.map((item: any) => {
            const { Quantity, ...rest } = item
            return rest
          })

          const updateData = {
            MainData: updateMainData,
            DetailsData: detailedEnquiryData.DetailsData,
            ProcessData: detailedEnquiryData.ProcessData,
            Quantity: detailedEnquiryData.Quantity,
            IsEdit: "True",
            EnquiryID: initialData.enquiryId || initialData.EnquiryID || 0,
            LayerDetailArr: detailedEnquiryData.LayerDetailArr || [],
            JsonObjectsUserApprovalProcessArray: detailedEnquiryData.JsonObjectsUserApprovalProcessArray,
          }

          clientLogger.log('📝 === UPDATE ENQUIRY MODE ===')
          clientLogger.log('Enquiry ID:', updateData.EnquiryID)
          clientLogger.log('Update Data:', JSON.stringify(updateData, null, 2))
          clientLogger.log('🌐 Endpoint: POST /api/enquiry/updatmultipleenquiry')
          clientLogger.log('====================================')

          response = await QuotationsAPI.updateMultipleEnquiry(updateData, null)

          clientLogger.log('📥 Update Response:', response)
        } else {
          response = await EnquiryAPI.saveDetailedEnquiry(detailedEnquiryData as any, null)
        }

        if (response.success) {
          toast({
            title: "Success",
            description: editMode ? "Enquiry updated successfully!" : "Enquiry created successfully!",
          })
          if (onSaveSuccess) {
            onSaveSuccess()
          } else {
            router.push("/inquiries")
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to ${editMode ? 'update' : 'save'} enquiry: ${response.error}`,
          })
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `An error occurred: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate dynamic fields based on first selected content
  const dynamicFields = (() => {
    if (selectedContentIds.length === 0) return []

    const firstSelectedContent = contentTypes.find((c) => c.ContentID === selectedContentIds[0])
    if (!firstSelectedContent?.ContentSizes) return []

    const sizeFields = firstSelectedContent.ContentSizes.split(",").map((field: string) => field.trim())

    const fieldConfig: Record<string, { label: string; placeholder: string; key: string }> = {
      SizeHeight: { label: "Height (MM)", placeholder: "0", key: "height" },
      SizeLength: { label: "Length (MM)", placeholder: "0", key: "length" },
      SizeWidth: { label: "Width (MM)", placeholder: "0", key: "width" },
      JobPrePlan: { label: "Pre Plan", placeholder: "Enter", key: "prePlan" },
      JobAcrossUps: { label: "Across Ups", placeholder: "0", key: "acrossUps" },
      JobAroundUps: { label: "Around Ups", placeholder: "0", key: "aroundUps" },
      JobUps: { label: "Ups", placeholder: "0", key: "ups" },
      SizeOpenflap: { label: "Opening Flap", placeholder: "0", key: "openingFlap" },
      SizePastingflap: { label: "Pasting Flap", placeholder: "0", key: "pastingFlap" },
      SizeBottomflap: { label: "Bottom Flap", placeholder: "0", key: "bottomFlap" },
      SizeBottomflapPer: { label: "Bottom Flap %", placeholder: "70", key: "bottomFlapPer" },
      // Brochure JobFold fields
      SizeJobFoldInH: { label: "JobFold In H", placeholder: "1", key: "JobFoldInH" },
      SizeJobFoldInL: { label: "JobFold In L", placeholder: "2", key: "JobFoldInL" },
      SizeJobFoldedH: { label: "Job Folded H", placeholder: "0", key: "JobFoldedH" },
      SizeJobFoldedL: { label: "Job Folded L", placeholder: "0", key: "JobFoldedL" },
    }

    return sizeFields.map((field: string) => fieldConfig[field]).filter(Boolean)
  })()

  // Show loading state for edit mode while master data is loading
  if (editMode && !isMasterDataLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 max-w-full overflow-x-hidden">
      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Row 1: Enquiry No & Enquiry Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="enquiryNo" className="text-sm">Enquiry No</Label>
                <Input
                  id="enquiryNo"
                  value={isFetchingEnquiryNo ? "Loading..." : (formData.enquiryNo || "")}
                  disabled
                  className="text-sm h-10"
                />
              </div>
              <div>
                <Label htmlFor="enquiryDate" className="text-sm">Enquiry Date</Label>
                <Input
                  id="enquiryDate"
                  type="date"
                  value={formData.enquiryDate}
                  onChange={(e) => handleInputChange("enquiryDate", e.target.value)}
                  min={getDateConstraints().min}
                  max={getDateConstraints().max}
                  className="text-sm h-10"
                />
                <p className="text-xs text-gray-500 mt-1">Only current date and up to 2 days prior allowed</p>
              </div>
            </div>

            {/* Row 2: Sales Type & Enquiry Type - Only for Detailed */}
            {formType === 'detailed' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="salesType" className="text-sm">Sales Type *</Label>
                  <Select value={formData.salesType} onValueChange={(value) => handleInputChange("salesType", value)}>
                    <SelectTrigger id="salesType" className="text-sm h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SALES_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="enquiryType" className="text-sm">Enquiry Type *</Label>
                  <Select value={formData.enquiryType} onValueChange={(value) => handleInputChange("enquiryType", value)}>
                    <SelectTrigger id="enquiryType" className="text-sm h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENQUIRY_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Row 3: Customer Name - Full width */}
            <div className="w-full">
              <Label htmlFor="clientName" className="text-sm">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.clientName}
                onValueChange={(value) => handleInputChange("clientName", value)}
              >
                <SelectTrigger id="clientName" className={`text-sm h-10 w-full ${validationErrors.clientName ? "border-red-500" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.length > 0 ? (
                    clients
                      .filter(client => client?.LedgerId && client?.LedgerName)
                      .map((client) => (
                        <SelectItem key={client.LedgerId} value={client.LedgerId.toString()}>
                          {client.LedgerName}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading customers...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Contact & Job Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">{formType === 'basic' ? 'Job Information' : 'Contact & Job Information'}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            {formType === 'detailed' && (
              <>
                <div className="md:col-span-3">
                  <Label htmlFor="concernPerson">Customer Concern Person</Label>
                  <Select
                    value={formData.concernPerson}
                    onValueChange={(value) => handleInputChange("concernPerson", value)}
                    disabled={!formData.clientName || concernPersons.length === 0}
                  >
                    <SelectTrigger id="concernPerson" className="h-10">
                      <SelectValue placeholder={
                        !formData.clientName
                          ? "Select customer first"
                          : concernPersons.length === 0
                            ? "No concern persons"
                            : "Select concern person"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {concernPersons.map((person) => (
                        <SelectItem key={person.ConcernPersonID} value={person.ConcernPersonID.toString()}>
                          {person.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="concernPersonMobile">Mobile No.</Label>
                  <Input
                    id="concernPersonMobile"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={formData.concernPersonMobile}
                    onChange={(e) => handleInputChange("concernPersonMobile", e.target.value)}
                    placeholder="10 digit mobile number"
                    readOnly
                    disabled
                    className="h-10 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </>
            )}
            <div className={formType === 'detailed' ? "md:col-span-7" : "md:col-span-12"}>
              <Label htmlFor="jobName">
                Job Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobName"
                value={formData.jobName}
                onChange={(e) => handleInputChange("jobName", e.target.value)}
                className={`h-10 ${validationErrors.jobName ? "border-red-500" : ""}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Product Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
            {formType === 'detailed' && (
              <div className="col-span-2 md:col-span-3">
                <Label htmlFor="productCode">Product Code</Label>
                <Input
                  id="productCode"
                  value={formData.productCode}
                  onChange={(e) => handleInputChange("productCode", e.target.value)}
                  className="h-10"
                />
              </div>
            )}
            {/* Row: Quantity & Annual Quantity (same row on mobile) */}
            <div className={formType === 'basic' ? "col-span-1 md:col-span-4" : "col-span-1 md:col-span-2"}>
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="1"
                value={formData.quantity}
                onChange={(e) => {
                  // Only allow positive integers
                  const value = e.target.value.replace(/[^\d]/g, '')
                  const cleanValue = value.replace(/^0+/, '') || ''
                  handleInputChange("quantity", cleanValue)
                }}
                onKeyDown={(e) => {
                  // Prevent decimal point, minus, plus, and e (scientific notation)
                  if (['.', '-', '+', 'e', 'E'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className={`h-10 ${validationErrors.quantity ? "border-red-500" : ""}`}
                placeholder="Enter quantity"
              />
            </div>
            {formType === 'detailed' && (
              <div className="col-span-1 md:col-span-3">
                <Label htmlFor="annualQuantity">
                  Annual Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="annualQuantity"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.annualQuantity}
                  onChange={(e) => {
                    // Only allow positive integers
                    const value = e.target.value.replace(/[^\d]/g, '')
                    const cleanValue = value.replace(/^0+/, '') || ''
                    handleInputChange("annualQuantity", cleanValue)
                  }}
                  onKeyDown={(e) => {
                    if (['.', '-', '+', 'e', 'E'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`h-10 ${validationErrors.annualQuantity ? "border-red-500" : ""}`}
                  placeholder="Enter annual quantity"
                />
              </div>
            )}
            {/* Row: UOM & Division Name (same row on mobile) */}
            <div className={formType === 'basic' ? "col-span-1 md:col-span-4" : "col-span-1 md:col-span-2"}>
              <Label htmlFor="unit">
                UOM <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit"
                value="PCS"
                readOnly
                disabled
                className="h-10 bg-gray-100 cursor-not-allowed"
              />
            </div>
            {formType === 'detailed' && (
              <>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="divisionName">Division Name</Label>
                  <Input
                    id="divisionName"
                    value="Packaging"
                    readOnly
                    disabled
                    className="h-10 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Location & Sales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Location & Sales</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
            <div className={formType === 'basic' ? "md:col-span-3" : "md:col-span-2"}>
              <Label htmlFor="plant">
                Production Unit <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.plant} onValueChange={(value) => handleInputChange("plant", value)}>
                <SelectTrigger id="plant" className={`h-10 ${validationErrors.plant ? "border-red-500" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productionUnits.length > 0 ? (
                    productionUnits
                      .filter(unit => unit?.ProductionUnitID && unit?.ProductionUnitName)
                      .map((unit) => (
                        <SelectItem key={unit.ProductionUnitID} value={unit.ProductionUnitID.toString()}>
                          {unit.ProductionUnitName}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading units...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {formType === 'detailed' && (
              <>
                <div className="md:col-span-3">
                  <Label htmlFor="supplyLocation">Supply Location</Label>
                  <Input
                    id="supplyLocation"
                    value={formData.supplyLocation}
                    onChange={(e) => handleInputChange("supplyLocation", e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                    className="h-10"
                  />
                </div>
              </>
            )}
            <div className={formType === 'basic' ? "md:col-span-3" : "md:col-span-3"}>
              <Label htmlFor="salesPerson">
                Sales Person <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.salesPerson}
                onValueChange={(value) => handleInputChange("salesPerson", value)}
              >
                <SelectTrigger id="salesPerson" className={`h-10 ${validationErrors.salesPerson ? "border-red-500" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {salesPersons.length > 0 ? (
                    salesPersons
                      .filter(person => person?.EmployeeID && person?.EmployeeName)
                      .map((person) => (
                        <SelectItem key={person.EmployeeID} value={person.EmployeeID.toString()}>
                          {person.EmployeeName}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading sales persons...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {formType === 'detailed' && (
              <div className="md:col-span-2">
                <Label htmlFor="expectCompletion">Expect Completion (Days)</Label>
                <Input
                  id="expectCompletion"
                  type="number"
                  min="0"
                  value={formData.expectCompletion}
                  onChange={(e) => handleInputChange("expectCompletion", e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="h-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Content Selection & Configuration - Only for Detailed Form */}
      {formType === 'detailed' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg truncate">Content Selection & Configuration</CardTitle>
          </CardHeader>
        <CardContent className="pt-0">
          {/* Category and Content in one row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Category Selection */}
            <div className="min-w-0 overflow-hidden">
              <Label htmlFor="contentCategory" className="text-sm">
                Select Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryName}
                onValueChange={(value) => {
                  // Check if category is actually changing
                  const isChanging = formData.categoryName !== value

                  handleInputChange("categoryName", value)
                  // Find the selected category and set its ID
                  const category = categories.find(cat => cat?.CategoryId?.toString() === value)
                  if (category && category.CategoryId) {
                    setSelectedCategoryId(category.CategoryId)

                    // If category changed, clear everything below: content, sizes, quality, processes, applied contents
                    if (isChanging) {
                      // Clear content selection
                      setSelectedContentIds([])
                      setSelectedContent(null)
                      handleInputChange("contentType", "")

                      // Clear sizes and quality (planDetails)
                      setPlanDetails({})

                      // Clear processes
                      setSelectedProcesses([])

                      // Clear applied contents grid
                      setContentGridData([])

                      clientLogger.log('[Category Change] Cleared all: content, sizes, quality, processes, applied contents')
                    }
                  }
                }}
              >
                <SelectTrigger id="contentCategory" className={`text-sm h-10 w-full overflow-hidden ${validationErrors.categoryName ? "border-red-500" : ""}`}>
                  <span className="truncate block max-w-[calc(100%-20px)]">
                    {formData.categoryName
                      ? categories.find(cat => cat?.CategoryId?.toString() === formData.categoryName)?.CategoryName || 'Select Category'
                      : 'Select Category'
                    }
                  </span>
                </SelectTrigger>
                <SelectContent className="max-w-[250px]">
                  <div className="max-h-[200px] overflow-y-auto">
                    {categories.length > 0 ? (
                      categories
                        .filter(category => category?.CategoryId && category?.CategoryName)
                        .map((category) => (
                          <SelectItem key={category.CategoryId} value={category.CategoryId.toString()} className="max-w-[230px]">
                            <span className="truncate block max-w-[200px]">{category.CategoryName}</span>
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Content Selection - Image-based Dialog */}
            <div>
              <Label htmlFor="contentSelect" className="text-sm">
                Select Content <span className="text-red-500">*</span>
              </Label>
              <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm h-10"
                    disabled={!selectedCategoryId || contentTypes.length === 0}
                  >
                    <span className="truncate">
                      {selectedContent?.ContentName
                        ? selectedContent.ContentName
                        : selectedContentIds.length > 0
                          ? contentTypes.find(c => c.ContentID === selectedContentIds[0])?.ContentName || 'Select Content Type'
                          : selectedCategoryId
                            ? (contentTypes.length > 0 ? 'Select Content Type' : 'Loading content types...')
                            : 'Please select a category first'
                      }
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Content Type</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {contentTypes.map((content) => (
                      <div
                        key={content.ContentID}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedContentIds.includes(content.ContentID)
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                        onClick={() => {
                          handleContentSelect(content.ContentID)
                          setContentDialogOpen(false)
                        }}
                        title={content.ContentName}
                      >
                        <div className="aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={getContentImagePath(content.ContentName)}
                            alt={content.ContentName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder.svg'
                            }}
                          />
                        </div>
                        <p className="text-sm font-medium text-center line-clamp-2 min-h-[2.5rem]">
                          {content.ContentName}
                        </p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Sizes Section - Below Category and Content */}
          {selectedContentIds.length > 0 && (() => {
            const firstSelectedContent = contentTypes.find((c) => selectedContentIds.includes(c.ContentID))
            return firstSelectedContent && firstSelectedContent.ContentSizes
          })() && (
            <div className="border rounded-lg p-3 md:p-4 mb-4">
              <span className="text-sm font-medium block mb-3">Sizes <span className="text-red-500">*</span> <span className="text-xs font-normal text-muted-foreground">(in MM)</span></span>
              {(() => {
                const firstSelectedContent = contentTypes.find((c) => selectedContentIds.includes(c.ContentID))
                if (!firstSelectedContent?.ContentSizes) return null

                const sizeFields = firstSelectedContent.ContentSizes.split(',').map((s: string) => s.trim())
                const contentName = firstSelectedContent?.ContentName?.toLowerCase() || ''

                // Check if Crash Lock type
                const isCrashLock = contentName.includes('crash lock') || contentName.includes('crashlock')

                // Check if Brochure type (has JobFold fields)
                const jobFoldFields = ['SizeJobFoldInH', 'SizeJobFoldInL', 'SizeJobFoldedH', 'SizeJobFoldedL']
                const hasBrochureFields = sizeFields.some((f: string) => jobFoldFields.includes(f))

                // Separate fields into groups
                const lwh = ['SizeLength', 'SizeWidth', 'SizeHeight']
                const flaps = ['SizeOpenflap', 'SizePastingflap']
                const bottomFlapFields = ['SizeBottomflap', 'SizeBottomflapPer']
                const jobFoldIn = ['SizeJobFoldInH', 'SizeJobFoldInL']
                const jobFolded = ['SizeJobFoldedH', 'SizeJobFoldedL']

                const lwhFields = sizeFields.filter((f: string) => lwh.includes(f))
                const flapFields = sizeFields.filter((f: string) => flaps.includes(f))
                const jobFoldInFields = sizeFields.filter((f: string) => jobFoldIn.includes(f))
                const jobFoldedFields = sizeFields.filter((f: string) => jobFolded.includes(f))
                const otherFields = sizeFields.filter((f: string) =>
                  !lwh.includes(f) && !flaps.includes(f) && !bottomFlapFields.includes(f) &&
                  !jobFoldIn.includes(f) && !jobFolded.includes(f)
                )

                // Map field names to labels
                const fieldLabels: Record<string, string> = {
                  'SizeHeight': 'Height',
                  'SizeLength': 'Length',
                  'SizeWidth': 'Width',
                  'SizeOpenflap': 'Open Flap',
                  'SizePastingflap': 'Pasting Flap',
                  'SizeBottomflap': 'Bottom Flap',
                  'SizeBottomflapPer': 'Bottom Flap %',
                  'JobUps': 'Job Ups',
                  'SizeDiameter': 'Diameter',
                  'SizeDepth': 'Depth',
                  'SizeJobFoldInH': 'JobFold In H',
                  'SizeJobFoldInL': 'JobFold In L',
                  'SizeJobFoldedH': 'Job Folded H',
                  'SizeJobFoldedL': 'Job Folded L',
                }

                return (
                  <>
                    {/* Width field removed for brochure types - not needed */}

                    {/* For Brochure types - JobFold In H and JobFold In L (2 per row) */}
                    {hasBrochureFields && (
                      <>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <Label htmlFor="content-SizeJobFoldInH" className="text-sm">
                              JobFold In H <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="content-SizeJobFoldInH"
                              type="number"
                              step="1"
                              min="1"
                              value={planDetails['SizeJobFoldInH'] || '1'}
                              onChange={(e) => {
                                const newJobFoldInH = parseFloat(e.target.value) || 1
                                const jobFoldedH = parseFloat(planDetails['SizeJobFoldedH']) || 0
                                const calculatedHeight = jobFoldedH * newJobFoldInH
                                handlePlanDetailChange('SizeJobFoldInH', e.target.value)
                                if (calculatedHeight > 0) {
                                  handlePlanDetailChange('SizeHeight', String(calculatedHeight))
                                }
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="text-sm h-10"
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="content-SizeJobFoldInL" className="text-sm">
                              JobFold In L <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="content-SizeJobFoldInL"
                              type="number"
                              step="1"
                              min="1"
                              value={planDetails['SizeJobFoldInL'] || '2'}
                              onChange={(e) => {
                                const newJobFoldInL = parseFloat(e.target.value) || 2
                                const jobFoldedL = parseFloat(planDetails['SizeJobFoldedL']) || 0
                                const calculatedLength = jobFoldedL * newJobFoldInL
                                handlePlanDetailChange('SizeJobFoldInL', e.target.value)
                                if (calculatedLength > 0) {
                                  handlePlanDetailChange('SizeLength', String(calculatedLength))
                                }
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="text-sm h-10"
                              placeholder="2"
                            />
                          </div>
                        </div>

                        {/* Job Folded H and Job Folded L (2 per row) */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <Label htmlFor="content-SizeJobFoldedH" className="text-sm">
                              Job Folded H <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="content-SizeJobFoldedH"
                              type="number"
                              step="0.001"
                              min="0"
                              value={planDetails['SizeJobFoldedH'] || ''}
                              onChange={(e) => {
                                const newJobFoldedH = parseFloat(e.target.value) || 0
                                const jobFoldInH = parseFloat(planDetails['SizeJobFoldInH']) || 1
                                const calculatedHeight = newJobFoldedH * jobFoldInH
                                handlePlanDetailChange('SizeJobFoldedH', e.target.value)
                                if (calculatedHeight > 0) {
                                  handlePlanDetailChange('SizeHeight', String(calculatedHeight))
                                }
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="text-sm h-10"
                              placeholder="Enter value"
                            />
                          </div>
                          <div>
                            <Label htmlFor="content-SizeJobFoldedL" className="text-sm">
                              Job Folded L <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="content-SizeJobFoldedL"
                              type="number"
                              step="0.001"
                              min="0"
                              value={planDetails['SizeJobFoldedL'] || ''}
                              onChange={(e) => {
                                const newJobFoldedL = parseFloat(e.target.value) || 0
                                const jobFoldInL = parseFloat(planDetails['SizeJobFoldInL']) || 2
                                const calculatedLength = newJobFoldedL * jobFoldInL
                                handlePlanDetailChange('SizeJobFoldedL', e.target.value)
                                if (calculatedLength > 0) {
                                  handlePlanDetailChange('SizeLength', String(calculatedLength))
                                }
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="text-sm h-10"
                              placeholder="Enter value"
                            />
                          </div>
                        </div>

                        {/* Height and Length - Auto calculated (2 per row) */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <Label htmlFor="content-SizeHeight-auto" className="text-sm">
                              Height <span className="text-xs text-blue-600 ml-1">(Auto)</span>
                            </Label>
                            <Input
                              id="content-SizeHeight-auto"
                              type="number"
                              step="0.001"
                              min="0"
                              readOnly
                              value={planDetails['SizeHeight'] || ''}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="text-sm h-10 bg-blue-50 text-blue-900"
                              placeholder="Job Folded H × JobFold In H"
                            />
                          </div>
                          <div>
                            <Label htmlFor="content-SizeLength-auto" className="text-sm">
                              Length <span className="text-xs text-blue-600 ml-1">(Auto)</span>
                            </Label>
                            <Input
                              id="content-SizeLength-auto"
                              type="number"
                              step="0.001"
                              min="0"
                              readOnly
                              value={planDetails['SizeLength'] || ''}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="text-sm h-10 bg-blue-50 text-blue-900"
                              placeholder="Job Folded L × JobFold In L"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* LWH in 3 columns - only for non-brochure types */}
                    {!hasBrochureFields && lwhFields.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {lwhFields.map((field: string) => {
                          const label = fieldLabels[field] || field
                          return (
                            <div key={field}>
                              <Label htmlFor={`content-${field}`} className="text-sm">
                                {label} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`content-${field}`}
                                type="number"
                                step="0.001"
                                min="0"
                                value={planDetails[field] || ''}
                                onChange={(e) => {
                                  handlePlanDetailChange(field, e.target.value)
                                  // For Crash Lock - auto-calculate Bottom Flap when Width changes
                                  if (field === 'SizeWidth' && isCrashLock) {
                                    const widthValue = parseFloat(e.target.value) || 0
                                    const bottomFlapPer = parseFloat(planDetails['SizeBottomflapPer']) || 70
                                    const bottomFlapValue = Math.round(widthValue * bottomFlapPer / 100)
                                    handlePlanDetailChange('SizeBottomflap', String(bottomFlapValue))
                                  }
                                }}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="text-sm h-10"
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Open Flap and Pasting Flap in 2 columns */}
                    {flapFields.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {flapFields.map((field: string) => {
                          const label = fieldLabels[field] || field
                          return (
                            <div key={field}>
                              <Label htmlFor={`content-${field}`} className="text-sm">
                                {label} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`content-${field}`}
                                type="number"
                                step="0.001"
                                min="0"
                                value={planDetails[field] || ''}
                                onChange={(e) => handlePlanDetailChange(field, e.target.value)}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="text-sm h-10"
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Crash Lock: Bottom Flap % and Bottom Flap fields */}
                    {isCrashLock && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <Label htmlFor="content-SizeBottomflapPer" className="text-sm">
                            Bottom Flap % <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="content-SizeBottomflapPer"
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={planDetails['SizeBottomflapPer'] || '70'}
                            onChange={(e) => {
                              const newPer = parseFloat(e.target.value) || 0
                              const widthValue = parseFloat(planDetails['SizeWidth']) || 0
                              const newBottomFlap = Math.round(widthValue * newPer / 100)
                              handlePlanDetailChange('SizeBottomflapPer', e.target.value)
                              handlePlanDetailChange('SizeBottomflap', String(newBottomFlap))
                            }}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="text-sm h-10"
                            placeholder="70"
                          />
                        </div>
                        <div>
                          <Label htmlFor="content-SizeBottomflap" className="text-sm">
                            Bottom Flap <span className="text-xs text-blue-600 ml-1">(Auto)</span>
                          </Label>
                          <Input
                            id="content-SizeBottomflap"
                            type="number"
                            step="0.001"
                            min="0"
                            readOnly
                            value={planDetails['SizeBottomflap'] || ''}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="text-sm h-10 bg-blue-50 text-blue-900"
                            placeholder="Width × Bottom Flap %"
                          />
                        </div>
                      </div>
                    )}

                    {/* Other fields in 2 columns (excluding handled fields) */}
                    {otherFields.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {otherFields.map((field: string) => {
                          const label = fieldLabels[field] || field
                          return (
                            <div key={field}>
                              <Label htmlFor={`content-${field}`} className="text-sm">
                                {label} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`content-${field}`}
                                type="number"
                                step="1"
                                min="0"
                                value={planDetails[field] || ''}
                                onChange={(e) => handlePlanDetailChange(field, e.target.value)}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="text-sm h-10"
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* Colors Section */}
          {selectedContentIds.length > 0 && (
            <div className="border rounded-lg p-3 md:p-4 mb-4">
              <span className="text-sm font-medium block mb-3">Colors</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="planFColor" className="text-sm">Front Color</Label>
                  <Input
                    id="planFColor"
                    type="number"
                    step="1"
                    min="0"
                    value={planDetails.PlanFColor || ''}
                    onChange={(e) => handlePlanDetailChange('PlanFColor', e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-sm h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="planBColor" className="text-sm">Back Color</Label>
                  <Input
                    id="planBColor"
                    type="number"
                    step="1"
                    min="0"
                    value={planDetails.PlanBColor || ''}
                    onChange={(e) => handlePlanDetailChange('PlanBColor', e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-sm h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="planSpeFColor" className="text-sm">S.Front Color</Label>
                  <Input
                    id="planSpeFColor"
                    type="number"
                    step="1"
                    min="0"
                    value={planDetails.PlanSpeFColor || ''}
                    onChange={(e) => handlePlanDetailChange('PlanSpeFColor', e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-sm h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="planSpeBColor" className="text-sm">S.Back Color</Label>
                  <Input
                    id="planSpeBColor"
                    type="number"
                    step="1"
                    min="0"
                    value={planDetails.PlanSpeBColor || ''}
                    onChange={(e) => handlePlanDetailChange('PlanSpeBColor', e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-sm h-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paper Details Section */}
          {selectedContentIds.length > 0 && (
            <div className="border rounded-lg p-3 md:p-4 mb-4">
              <span className="text-sm font-medium block mb-3">Paper Details</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0 overflow-hidden">
                  <Label htmlFor="itemPlanQuality" className="text-sm">
                    Board <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={planDetails.ItemPlanQuality || ''}
                    onValueChange={(value) => {
                      handlePlanDetailChange('ItemPlanQuality', value)
                      // Reset dependent fields
                      handlePlanDetailChange('ItemPlanGsm', '')
                      handlePlanDetailChange('ItemPlanMill', '')
                      handlePlanDetailChange('ItemPlanFinish', '')
                    }}
                  >
                    <SelectTrigger id="itemPlanQuality" className="text-sm h-10 w-full overflow-hidden">
                      <span className="truncate block max-w-[calc(100%-20px)]">{planDetails.ItemPlanQuality || 'Select board'}</span>
                    </SelectTrigger>
                    <SelectContent className="max-w-[250px] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                      <div className="px-2 py-2 border-b bg-white sticky top-0 z-10">
                        <Input
                          placeholder="Search board..."
                          value={qualitySearch}
                          onChange={(e) => setQualitySearch(e.target.value)}
                          className="h-8 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-[150px] overflow-y-auto">
                        {qualities.length > 0 ? (
                          qualities
                            .filter((quality) => {
                              const qualityValue = quality.Quality || quality
                              return qualityValue.toString().toLowerCase().includes(qualitySearch.toLowerCase())
                            })
                            .map((quality, index) => (
                              <SelectItem
                                key={index}
                                value={quality.Quality || quality}
                                className="max-w-[230px]"
                              >
                                <span className="truncate block max-w-[200px]" title={quality.Quality || quality}>
                                  {quality.Quality || quality}
                                </span>
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="loading" disabled>Loading qualities...</SelectItem>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <Label htmlFor="itemPlanGsm" className="text-sm">
                    GSM <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={planDetails.ItemPlanGsm || ''}
                    onValueChange={(value) => {
                      handlePlanDetailChange('ItemPlanGsm', value)
                      // Reset dependent fields
                      handlePlanDetailChange('ItemPlanMill', '')
                      handlePlanDetailChange('ItemPlanFinish', '')
                    }}
                    disabled={!planDetails.ItemPlanQuality}
                  >
                    <SelectTrigger id="itemPlanGsm" className="text-sm h-10 w-full overflow-hidden">
                      <span className="truncate block max-w-[calc(100%-20px)]">{planDetails.ItemPlanGsm || 'Select GSM'}</span>
                    </SelectTrigger>
                    <SelectContent className="max-w-[250px] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                      {gsmOptions.length > 0 && (
                        <div className="px-2 py-2 border-b bg-white sticky top-0 z-10">
                          <Input
                            placeholder="Search GSM..."
                            value={gsmSearch}
                            onChange={(e) => setGsmSearch(e.target.value)}
                            className="h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                      <div className="max-h-[150px] overflow-y-auto">
                        {gsmOptions.length > 0 ? (
                          gsmOptions
                            .filter((gsm) => {
                              const gsmValue = typeof gsm === 'object' ? ((gsm as any).gsm || (gsm as any).GSM) : gsm
                              const gsmDisplay = gsmValue?.toString() || (typeof gsm === 'object' ? JSON.stringify(gsm) : String(gsm))
                              return gsmDisplay && gsmDisplay !== '' && gsmDisplay !== 'undefined' && gsmDisplay !== 'null' && gsmDisplay.toLowerCase().includes(gsmSearch.toLowerCase())
                            })
                            .map((gsm, index) => {
                              // GSM can be a number directly or an object with gsm/GSM field
                              const gsmValue = typeof gsm === 'object' ? ((gsm as any).gsm || (gsm as any).GSM) : gsm
                              const gsmDisplay = gsmValue?.toString() || (typeof gsm === 'object' ? JSON.stringify(gsm) : String(gsm))

                              return (
                                <SelectItem key={index} value={gsmDisplay} className="max-w-[230px]">
                                  <span className="truncate block max-w-[200px]">{gsmDisplay}</span>
                                </SelectItem>
                              )
                            })
                        ) : (
                          <SelectItem value="loading" disabled>
                            {planDetails.ItemPlanQuality ? 'Loading GSM...' : 'Select board first'}
                          </SelectItem>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <Label htmlFor="itemPlanMill" className="text-sm">Mill</Label>
                  <Select
                    value={planDetails.ItemPlanMill || ''}
                    onValueChange={(value) => {
                      handlePlanDetailChange('ItemPlanMill', value)
                      // Reset dependent field
                      handlePlanDetailChange('ItemPlanFinish', '')
                    }}
                    disabled={!planDetails.ItemPlanGsm}
                  >
                    <SelectTrigger id="itemPlanMill" className="text-sm h-10 w-full overflow-hidden">
                      <span className="truncate block max-w-[calc(100%-20px)]">{planDetails.ItemPlanMill || 'Select mill'}</span>
                    </SelectTrigger>
                    <SelectContent className="max-w-[250px]">
                      <div className="max-h-[150px] overflow-y-auto">
                        {millOptions.length > 0 ? (
                          millOptions.map((mill, index) => {
                            try {
                              // Mill can be a string directly or an object with Mill/mill field
                              const millValue = typeof mill === 'object' ? ((mill as any).Mill || (mill as any).mill) : mill
                              const millDisplay = millValue?.toString() || (typeof mill === 'object' ? JSON.stringify(mill) : String(mill))

                              // Skip if we still have an object (shouldn't happen but safety check)
                              if (typeof millDisplay === 'object') {
                                return null
                              }

                              // Skip if empty or invalid
                              if (!millDisplay || millDisplay === '' || millDisplay === 'undefined' || millDisplay === 'null') {
                                return null
                              }

                              return (
                                <SelectItem key={index} value={millDisplay} className="max-w-[230px]">
                                  <span className="truncate block max-w-[200px]">{millDisplay}</span>
                                </SelectItem>
                              )
                            } catch (error) {
                              return null
                            }
                          }).filter(Boolean)
                        ) : (
                          <SelectItem value="loading" disabled>
                            {planDetails.ItemPlanGsm ? 'Loading mills...' : 'Select GSM first'}
                          </SelectItem>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <Label htmlFor="itemPlanFinish" className="text-sm">Finish</Label>
                  <Select
                    value={planDetails.ItemPlanFinish || ''}
                    onValueChange={(value) => handlePlanDetailChange('ItemPlanFinish', value)}
                    disabled={!planDetails.ItemPlanMill}
                  >
                    <SelectTrigger id="itemPlanFinish" className="text-sm h-10 w-full overflow-hidden">
                      <span className="truncate block max-w-[calc(100%-20px)]">{planDetails.ItemPlanFinish || 'Select finish'}</span>
                    </SelectTrigger>
                    <SelectContent className="max-w-[250px]">
                      <div className="max-h-[150px] overflow-y-auto">
                        {finishOptions.length > 0 ? (
                          finishOptions.map((finish, index) => {
                            // Finish can be a string directly or an object with Finish/finish field
                            const finishValue = typeof finish === 'object' ? ((finish as any).Finish || (finish as any).finish) : finish
                            const finishDisplay = finishValue?.toString() || (typeof finish === 'object' ? JSON.stringify(finish) : String(finish))

                            // Skip if empty or invalid
                            if (!finishDisplay || finishDisplay === '' || finishDisplay === 'undefined' || finishDisplay === 'null') {
                              return null
                            }

                            return (
                              <SelectItem key={index} value={finishDisplay} className="max-w-[230px]">
                                <span className="truncate block max-w-[200px]">{finishDisplay}</span>
                              </SelectItem>
                            )
                          }).filter(Boolean)
                        ) : (
                          <SelectItem value="loading" disabled>
                            {planDetails.ItemPlanMill ? 'Loading finishes...' : 'Select mill first'}
                          </SelectItem>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <Label htmlFor="planWastageType" className="text-sm">Wastage Type</Label>
                  <Select
                    value={planDetails.PlanWastageType || ''}
                    onValueChange={(value) => {
                      handlePlanDetailChange('PlanWastageType', value)
                      // Reset wastage value when type changes
                      handlePlanDetailChange('WastageValue', '')
                    }}
                  >
                    <SelectTrigger id="planWastageType" className="text-sm h-10 w-full overflow-hidden">
                      <span className="truncate block max-w-[calc(100%-20px)]">{planDetails.PlanWastageType || 'Select wastage type'}</span>
                    </SelectTrigger>
                    <SelectContent className="max-w-[250px]">
                      <div className="max-h-[150px] overflow-y-auto">
                        <SelectItem value="Machine Default" className="max-w-[230px]">
                          <span className="truncate block max-w-[200px]">Machine Default</span>
                        </SelectItem>
                        <SelectItem value="Category Process Wise Wastage" className="max-w-[230px]">
                          <span className="truncate block max-w-[200px]">Category Process Wise Wastage</span>
                        </SelectItem>
                        <SelectItem value="Percentage" className="max-w-[230px]">
                          <span className="truncate block max-w-[200px]">Percentage</span>
                        </SelectItem>
                        <SelectItem value="Sheets" className="max-w-[230px]">
                          <span className="truncate block max-w-[200px]">Sheets</span>
                        </SelectItem>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Conditional input for Percentage or Sheets - Outside grid for full width */}
              {planDetails.PlanWastageType === 'Percentage' && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="wastagePercentage" className="text-sm">
                      Value <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="wastagePercentage"
                      type="number"
                      placeholder="Enter percentage"
                      value={planDetails.WastageValue || ''}
                      onChange={(e) => handlePlanDetailChange('WastageValue', e.target.value)}
                      className="h-10 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                      max="100"
                      step="0.001"
                    />
                  </div>
                </div>
              )}
              {planDetails.PlanWastageType === 'Sheets' && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="wastageSheets" className="text-sm">
                      Value <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="wastageSheets"
                      type="number"
                      placeholder="Enter number of sheets"
                      value={planDetails.WastageValue || ''}
                      onChange={(e) => handlePlanDetailChange('WastageValue', e.target.value)}
                      className="h-10 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process Selection - Below Sizes */}
          <div className="border rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Add Process</span>
              <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedContentIds.length || availableProcesses.length === 0}
                    className="text-xs h-8"
                  >
                    {selectedProcesses.length > 0 ? `Edit (${selectedProcesses.length})` : 'Select'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader className="pb-3">
                    <DialogTitle className="text-base">Select Processes</DialogTitle>
                  </DialogHeader>
                  <div>
                    <Input
                      className="text-sm h-9"
                      value={processSearchTerm}
                      onChange={(e) => setProcessSearchTerm(e.target.value)}
                    />
                    <div className="mt-3 space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                      {loadingProcesses ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
                      ) : availableProcesses.length > 0 ? (
                        availableProcesses
                          .filter((p) => p.ProcessName?.toLowerCase().includes(processSearchTerm.toLowerCase()))
                          .sort((a, b) => (a.ProcessName || '').localeCompare(b.ProcessName || ''))
                          .map((process) => (
                            <label
                              key={process.ProcessID}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded cursor-pointer text-sm"
                            >
                              <Checkbox
                                checked={selectedProcesses.some(p => Number(p.ProcessID) === Number(process.ProcessID))}
                                onCheckedChange={() => handleProcessToggle({
                                  ProcessID: Number(process.ProcessID),
                                  ProcessName: process.ProcessName
                                })}
                              />
                              <span className="text-sm truncate">{process.ProcessName}</span>
                            </label>
                          ))
                      ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          {formData.contentType ? 'No processes available' : 'Select content first'}
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Display Selected Processes */}
            {selectedProcesses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedProcesses.map((process) => (
                  <div
                    key={process.ProcessID}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs max-w-full"
                  >
                    <span className="truncate">{process.ProcessName}</span>
                    <button
                      type="button"
                      onClick={() => handleProcessToggle(process)}
                      className="hover:bg-primary/20 rounded-full p-0.5 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-muted-foreground">
                {selectedContentIds.length > 0
                  ? 'No processes selected'
                  : 'Select a content type first'}
              </div>
            )}
          </div>

          {/* Apply Content Button */}
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={handleApplyContent}
              disabled={selectedContentIds.length === 0}
              className="bg-[#005180] hover:bg-[#004875]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Apply Content
            </Button>
          </div>

          {/* Applied Contents Cards */}
          {contentGridData.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Applied Contents ({contentGridData.length})</h4>
                {contentGridData.length > 2 && (
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary p-0 h-auto"
                    onClick={() => setViewAllContentsOpen(true)}
                  >
                    View All
                  </Button>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {contentGridData.slice(0, 2).map((content) => (
                  <div
                    key={content.id}
                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow min-w-[280px] flex-shrink-0"
                  >
                    {/* Card Header with Content Name and Actions */}
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-semibold text-base text-primary truncate max-w-[150px]" title={content.ContentName || content.contentName}>
                        {content.ContentName || content.contentName}
                      </h5>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContentEdit(content)}
                          className="h-7 w-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContentDuplicate(content)}
                          className="h-7 w-7 text-green-600 hover:text-green-800 hover:bg-green-50"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContentDelete(content.id)}
                          className="h-7 w-7 text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Card Body with Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium min-w-[70px]">Size:</span>
                        <span className="text-foreground">{content.Size || '-'}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium min-w-[70px]">Processes:</span>
                        <span className="text-foreground truncate max-w-[150px]" title={content.rawData?.processes?.length > 0 ? content.rawData.processes.map((p: any) => p.ProcessName).join(', ') : '-'}>
                          {content.rawData?.processes?.length > 0
                            ? content.rawData.processes.map((p: any) => p.ProcessName).join(', ')
                            : '-'
                          }
                        </span>
                      </div>

                      {/* Material Details */}
                      <div className="pt-2 border-t mt-2">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          {content.rawData?.planDetails?.ItemPlanQuality && (
                            <div>
                              <span className="text-muted-foreground">Board: </span>
                              <span className="font-medium">{content.rawData.planDetails.ItemPlanQuality}</span>
                            </div>
                          )}
                          {content.rawData?.planDetails?.ItemPlanGsm && (
                            <div>
                              <span className="text-muted-foreground">GSM: </span>
                              <span className="font-medium">{content.rawData.planDetails.ItemPlanGsm}</span>
                            </div>
                          )}
                          {content.rawData?.planDetails?.ItemPlanMill && (
                            <div>
                              <span className="text-muted-foreground">Mill: </span>
                              <span className="font-medium">{content.rawData.planDetails.ItemPlanMill}</span>
                            </div>
                          )}
                          {content.rawData?.planDetails?.ItemPlanFinish && content.rawData.planDetails.ItemPlanFinish !== '-' && (
                            <div>
                              <span className="text-muted-foreground">Finish: </span>
                              <span className="font-medium">{content.rawData.planDetails.ItemPlanFinish}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Contents Dialog */}
              <Dialog open={viewAllContentsOpen} onOpenChange={setViewAllContentsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>All Applied Contents ({contentGridData.length})</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto flex-1 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contentGridData.map((content) => (
                        <div
                          key={content.id}
                          className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Card Header with Content Name and Actions */}
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-semibold text-base text-primary truncate max-w-[200px]" title={content.ContentName || content.contentName}>
                              {content.ContentName || content.contentName}
                            </h5>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleContentEdit(content)
                                  setViewAllContentsOpen(false)
                                }}
                                className="h-7 w-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleContentDuplicate(content)
                                  setViewAllContentsOpen(false)
                                }}
                                className="h-7 w-7 text-green-600 hover:text-green-800 hover:bg-green-50"
                                title="Duplicate"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleContentDelete(content.id)}
                                className="h-7 w-7 text-red-600 hover:text-red-800 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Card Body with Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground font-medium min-w-[70px]">Size:</span>
                              <span className="text-foreground">{content.Size || '-'}</span>
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground font-medium min-w-[70px]">Processes:</span>
                              <span className="text-foreground">
                                {content.rawData?.processes?.length > 0
                                  ? content.rawData.processes.map((p: any) => p.ProcessName).join(', ')
                                  : '-'
                                }
                              </span>
                            </div>

                            {/* Material Details */}
                            <div className="pt-2 border-t mt-2">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                {content.rawData?.planDetails?.ItemPlanQuality && (
                                  <div>
                                    <span className="text-muted-foreground">Board: </span>
                                    <span className="font-medium">{content.rawData.planDetails.ItemPlanQuality}</span>
                                  </div>
                                )}
                                {content.rawData?.planDetails?.ItemPlanGsm && (
                                  <div>
                                    <span className="text-muted-foreground">GSM: </span>
                                    <span className="font-medium">{content.rawData.planDetails.ItemPlanGsm}</span>
                                  </div>
                                )}
                                {content.rawData?.planDetails?.ItemPlanMill && (
                                  <div>
                                    <span className="text-muted-foreground">Mill: </span>
                                    <span className="font-medium">{content.rawData.planDetails.ItemPlanMill}</span>
                                  </div>
                                )}
                                {content.rawData?.planDetails?.ItemPlanFinish && content.rawData.planDetails.ItemPlanFinish !== '-' && (
                                  <div>
                                    <span className="text-muted-foreground">Finish: </span>
                                    <span className="font-medium">{content.rawData.planDetails.ItemPlanFinish}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Section 6: Remark & Attachments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Remark & Attachments</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e) => handleInputChange("remark", e.target.value)}
                rows={4}
              />
            </div>
            <div className="md:col-span-5">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="space-y-2">
                <div className="border-2 border-dashed rounded-lg p-3 md:p-4 text-center">
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="attachments" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload files</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 10 files, 10MB each</p>
                  </label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="space-y-1">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-xs">
                        <span className="truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-save Status Indicator */}
      {!editMode && (formData.jobName !== '' || formData.clientName !== '') && (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground pb-2">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving draft...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Draft saved</span>
              {lastSaved && (
                <span className="text-muted-foreground">
                  {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span className="text-red-600">Failed to save draft</span>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pb-20 md:pb-6">
        <Button type="button" variant="outline" onClick={() => router.push("/inquiries")} disabled={isLoading} className="w-full sm:w-auto">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isFetchingEnquiryNo} className="bg-[#005180] hover:bg-[#004875] w-full sm:w-auto">
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              {editMode ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editMode ? 'Update Enquiry' : 'Create Enquiry'}
            </>
          )}
        </Button>
      </div>
    </form>
    <Toaster />
    </>
  )
}
