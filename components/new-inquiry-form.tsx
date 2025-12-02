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
import { Plus, Save, X, Edit, Trash2, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EnquiryAPI, MasterDataAPI, formatDateForAPI, formatDateForDisplay, type BasicEnquiryData, type DetailedEnquiryData } from "@/lib/api/enquiry"
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

const UOM_OPTIONS = [
  { label: "PCS", value: "PCS" },
  { label: "KG", value: "KG" },
  { label: "PKT", value: "PKT" },
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

  // Track loaded draft ID for updates
  const [loadedDraftId, setLoadedDraftId] = useState<number | null>(null)

  // API data state
  const [categories, setCategories] = useState<any[]>([])
  const [contentTypes, setContentTypes] = useState<any[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [productionUnits, setProductionUnits] = useState<any[]>([])
  const [salesPersons, setSalesPersons] = useState<any[]>([])

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
    unit: "",
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
    if (editMode && initialData && categories.length > 0) {
      clientLogger.log('[Edit Mode] Populating form with initial data:', initialData)
      clientLogger.log('[Edit Mode] Available categories:', categories.length)
      clientLogger.log('[Edit Mode] Available clients:', clients.length)

      // Find the category to verify it exists
      const category = categories.find(c => c.CategoryId === initialData.categoryId)
      clientLogger.log('[Edit Mode] Found category:', category)

      // Populate basic form data
      setFormData(prev => ({
        ...prev,
        enquiryNo: initialData.id || '',
        enquiryDate: initialData.date || new Date().toISOString().split("T")[0],
        clientName: initialData.ledgerId?.toString() || '',
        jobName: initialData.job || '',
        productCode: initialData.sku || '',
        quantity: initialData.quantityRange?.toString() || '',
        unit: initialData.unit || 'PCS',
        categoryName: initialData.categoryId?.toString() || '',
        salesPerson: initialData.salesEmployeeId?.toString() || '',
        plant: initialData.productionUnitId?.toString() || '',
        remark: initialData.notes || '',
        expectCompletion: initialData.expectCompletion || '',
        typeOfPrinting: initialData.jobType || '',
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
      clientLogger.log('[Edit Mode] Has Detailed Data:', !!initialData.detailedData)
      clientLogger.log('[Edit Mode] ═══════════════════════════════════════')

      // Set category ID to trigger content types loading
      if (initialData.categoryId) {
        setSelectedCategoryId(initialData.categoryId)
      }

      // If detailed data is available, populate dimensions and other fields
      if (initialData.detailedData) {
        const detailedData = initialData.detailedData
        clientLogger.log('[Edit Mode] Detailed data found:', detailedData)

        // Populate plan details (dimensions) if available
        if (detailedData.DetailsData && detailedData.DetailsData.length > 0) {
          const details = detailedData.DetailsData[0]
          clientLogger.log('[Edit Mode] Details data:', details)

          // Parse ContentSizeValues to extract dimensions
          // Example: "SizeHeight=200AndOrSizeLength=100AndOrSizeWidth=100..."
          if (details.ContentSizeValues) {
            const sizeValues: Record<string, string> = {}
            const pairs = details.ContentSizeValues.split('AndOr')
            pairs.forEach((pair: string) => {
              const [key, value] = pair.split('=')
              if (key && value) {
                sizeValues[key] = value
              }
            })

            clientLogger.log('[Edit Mode] Raw ContentSizeValues:', details.ContentSizeValues)
            clientLogger.log('[Edit Mode] Parsed size values:', sizeValues)
            clientLogger.log('[Edit Mode] Number of parsed fields:', Object.keys(sizeValues).length)
            setPlanDetails(prev => ({ ...prev, ...sizeValues }))
          }

          // Store content type to be selected after content types are loaded
          if (details.PlanContentType || details.PlanContName) {
            const contentTypeToSelect = details.PlanContentType || details.PlanContName
            clientLogger.log('[Edit Mode] Content type to select:', contentTypeToSelect)
            // Store in a temporary state to select after content types load
            setFormData(prev => ({ ...prev, contentType: contentTypeToSelect }))
          }
        }

        // Populate selected processes if available
        if (detailedData.ProcessData && detailedData.ProcessData.length > 0) {
          const processes = detailedData.ProcessData.map((p: any) => ({
            ProcessID: p.ProcessID,
            ProcessName: p.ProcessName
          }))
          clientLogger.log('[Edit Mode] Processes to select:', processes)
          setSelectedProcesses(processes)
        }
      } else {
        clientLogger.log('[Edit Mode] No detailed data available')
      }

      setIsFetchingEnquiryNo(false)
    }
  }, [editMode, initialData, categories])

  // Select content type after content types are loaded (for edit mode)
  useEffect(() => {
    if (editMode && formData.contentType && contentTypes.length > 0 && selectedContentIds.length === 0) {
      clientLogger.log('[Edit Mode] Attempting to select content type:', formData.contentType)
      clientLogger.log('[Edit Mode] Available content types:', contentTypes.length)

      // Normalize the search term (remove spaces, dashes, underscores and convert to lowercase)
      const normalizeString = (str: string) => str?.replace(/[\s\-_]+/g, '').toLowerCase() || ''
      const searchTerm = normalizeString(formData.contentType)

      // Find content by PlanContentType or ContentCode or ContentName
      let matchingContent = contentTypes.find((c) => {
        const matches = (
          normalizeString(c.ContentDomainType) === searchTerm ||
          normalizeString(c.ContentCode) === searchTerm ||
          normalizeString(c.ContentName) === searchTerm ||
          c.ContentDomainType === formData.contentType ||
          c.ContentCode === formData.contentType ||
          c.ContentName === formData.contentType
        )

        return matches
      })

      // If no exact match, try partial matching (contains)
      if (!matchingContent) {
        matchingContent = contentTypes.find((c) => {
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

      if (matchingContent) {
        clientLogger.log('[Edit Mode] Found matching content:', matchingContent)
        setSelectedContentIds([matchingContent.ContentID])
        setSelectedContent(matchingContent)
      } else {
        clientLogger.log('[Edit Mode] No matching content found for:', formData.contentType)
      }
    }
  }, [editMode, formData.contentType, contentTypes, selectedContentIds])

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
    }
    fetchMasterData()
  }, [])

  // Fetch content types when category changes
  useEffect(() => {
    const fetchContentTypes = async () => {
      if (selectedCategoryId) {
        const response = await EnquiryAPI.getContentTypes(selectedCategoryId, null)
        if (response.success && response.data) {
          setContentTypes(response.data)
        }
      }
    }
    fetchContentTypes()
  }, [selectedCategoryId])

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

  const handleInputChange = (field: string, value: string) => {
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
    setSelectedContentIds((prev) => {
      // Only allow single selection
      if (prev.includes(contentId)) {
        // Deselect if clicking the same content
        return []
      }
      // Replace with new selection
      return [contentId]
    })
  }

  const handleProcessToggle = (process: {ProcessID: number, ProcessName: string}) => {
    setSelectedProcesses((prev) => {
      const isSelected = prev.some(p => p.ProcessID === process.ProcessID)
      if (isSelected) {
        return prev.filter((p) => p.ProcessID !== process.ProcessID)
      }
      return [...prev, process]
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

    const newContentData = selectedContents.map((content) => ({
      id: Date.now() + content.ContentID,
      contentName: content.ContentName,
      ContentName: content.ContentName,
      Size: `${planDetails.height || ""} x ${planDetails.length || ""} x ${planDetails.width || ""} MM`.trim(),
      OtherDetails: `GSM: ${planDetails.gsm || "N/A"}, Processes: ${selectedProcesses.length}`,
      rawData: {
        content,
        planDetails: { ...planDetails },
        processes: [...selectedProcesses],
      },
      // Add all plan details to the content data
      ...planDetails,
    }))

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const errors: Record<string, boolean> = {}

    if (!formData.clientName) errors.clientName = true
    if (!formData.jobName) errors.jobName = true
    if (!formData.quantity || Number(formData.quantity) === 0) errors.quantity = true
    if (!formData.salesPerson) errors.salesPerson = true
    if (!formData.categoryName) errors.categoryName = true
    if (!formData.plant) errors.plant = true
    if (!formData.unit) errors.unit = true

    // Annual Quantity is mandatory for detailed form
    if (formType === 'detailed' && (!formData.annualQuantity || Number(formData.annualQuantity) === 0)) {
      errors.annualQuantity = true
    }

    // Quality and GSM are mandatory for detailed form when content is selected
    if (formType === 'detailed' && selectedContentIds.length > 0) {
      if (!planDetails.ItemPlanQuality) {
        toast({
          variant: "destructive",
          title: "Quality Required",
          description: "Please select paper quality",
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
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all mandatory fields (highlighted in red)",
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
          EnquiryType: formData.enquiryType || '',
          SalesType: formData.salesType || '',
          Quantity: parseInt(formData.quantity) || 0,
          Source: "KAM APP",
          IsDetailed: 1,
        }

        // Build ContentSizeValues string
        const buildContentSizeValues = () => {
          const parts: string[] = []
          if (planDetails.SizeHeight) parts.push(`SizeHeight=${planDetails.SizeHeight}`)
          if (planDetails.SizeLength) parts.push(`SizeLength=${planDetails.SizeLength}`)
          if (planDetails.SizeWidth) parts.push(`SizeWidth=${planDetails.SizeWidth}`)
          if (planDetails.SizeOpenflap) parts.push(`SizeOpenflap=${planDetails.SizeOpenflap}`)
          if (planDetails.SizePastingflap) parts.push(`SizePastingflap=${planDetails.SizePastingflap}`)
          if (planDetails.JobUps) parts.push(`JobUps=${planDetails.JobUps}`)
          if (planDetails.PlanFColor) parts.push(`PlanFColor=${planDetails.PlanFColor}`)
          if (planDetails.PlanBColor) parts.push(`PlanBColor=${planDetails.PlanBColor}`)
          if (planDetails.PlanSpeFColor) parts.push(`PlanSpeFColor=${planDetails.PlanSpeFColor}`)
          if (planDetails.PlanSpeBColor) parts.push(`PlanSpeBColor=${planDetails.PlanSpeBColor}`)
          if (planDetails.ItemPlanQuality) parts.push(`ItemPlanQuality=${planDetails.ItemPlanQuality}`)
          if (planDetails.ItemPlanGsm) parts.push(`ItemPlanGsm=${planDetails.ItemPlanGsm}`)
          if (planDetails.ItemPlanMill) parts.push(`ItemPlanMill=${planDetails.ItemPlanMill}`)
          if (planDetails.ItemPlanFinish) parts.push(`ItemPlanFinish=${planDetails.ItemPlanFinish}`)
          if (planDetails.PlanWastageType) parts.push(`PlanWastageType=${planDetails.PlanWastageType}`)
          return parts.join('AndOr')
        }

        // Build Size string for display
        const buildSizeString = () => {
          const parts: string[] = []
          if (planDetails.SizeHeight) parts.push(`H=${planDetails.SizeHeight}`)
          if (planDetails.SizeLength) parts.push(`L=${planDetails.SizeLength}`)
          if (planDetails.SizeWidth) parts.push(`W=${planDetails.SizeWidth}`)
          if (planDetails.SizeOpenflap) parts.push(`OF=${planDetails.SizeOpenflap}`)
          if (planDetails.SizePastingflap) parts.push(`PF=${planDetails.SizePastingflap}`)
          return parts.length > 0 ? parts.join(', ') + ' (MM)' : ''
        }

        // Transform content and size data
        const detailsData = selectedContentItem ? [{
          PlanContName: selectedContentItem.ContentName || '',
          Size: buildSizeString(),
          PlanContentType: selectedContentItem.ContentName || '',
          ContentSizeValues: buildContentSizeValues(),
          valuesString: Object.values(planDetails).join(','),
          JobSizeInCM: buildSizeString(),
        }] : []

        // Transform selected processes to match API structure
        const processData = selectedContentItem ? selectedProcesses.map(process => ({
          ProcessID: process.ProcessID,
          ProcessName: process.ProcessName,
          PlanContName: selectedContentItem.ContentName || '',
          PlanContentType: selectedContentItem.ContentName || '',  // Use ContentName for both
        })) : []

        const detailedEnquiryData = {
          MainData: [mainData],
          DetailsData: detailsData,
          ProcessData: processData,
          Prefix: "EQ",
          Quantity: parseInt(formData.quantity) || 0,
          IsEdit: "false",
          LayerDetailArr: [],
          JsonObjectsUserApprovalProcessArray: [{
            ProductCode: mainData.ProductCode,
            LedgerID: mainData.LedgerID,
            SalesEmployeeID: mainData.SalesEmployeeID,
            CategoryID: mainData.CategoryID,
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
            Source: mainData.Source,
            IsDetailed: mainData.IsDetailed,
            LedgerName: clients.find(c => c.LedgerId === getLedgerID())?.LedgerName || '',
            CategoryName: categories.find(c => c.CategoryId === getCategoryID())?.CategoryName || '',
            Quantity: String(mainData.Quantity),
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
          // Add EnquiryID and IsEdit flag for update
          const updateData = {
            ...detailedEnquiryData,
            EnquiryID: initialData.enquiryId || initialData.EnquiryID || 0, // Get from initial data
            IsEdit: "True",
          }

          clientLogger.log('📝 === UPDATE ENQUIRY MODE ===')
          clientLogger.log('Enquiry ID:', updateData.EnquiryID)
          clientLogger.log('Update Data:', JSON.stringify(updateData, null, 2))
          clientLogger.log('🌐 Endpoint: POST /api/enquiry/updatmultipleenquiry')
          clientLogger.log('====================================')

          response = await (EnquiryAPI as any).updateMultipleEnquiry(updateData, null)

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
      SizeBottomflapPer: { label: "Bottom Flap %", placeholder: "0", key: "bottomFlapPer" },
    }

    return sizeFields.map((field: string) => fieldConfig[field]).filter(Boolean)
  })()

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
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
                  className="text-sm h-10"
                />
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

            {/* Row 3: Client Name - Full width */}
            <div className="w-full">
              <Label htmlFor="clientName" className="text-sm">
                Client Name <span className="text-red-500">*</span>
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
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
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
                  <Label htmlFor="concernPerson">Client Concern Person</Label>
                  <Input
                    id="concernPerson"
                    value={formData.concernPerson}
                    onChange={(e) => handleInputChange("concernPerson", e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="concernPersonMobile">Mobile No.</Label>
                  <Input
                    id="concernPersonMobile"
                    type="tel"
                    value={formData.concernPersonMobile}
                    onChange={(e) => handleInputChange("concernPersonMobile", e.target.value)}
                    className="h-10"
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
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                className={`h-10 ${validationErrors.quantity ? "border-red-500" : ""}`}
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
                  onChange={(e) => handleInputChange("annualQuantity", e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`h-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${validationErrors.annualQuantity ? "border-red-500" : ""}`}
                  required
                />
              </div>
            )}
            {/* Row: UOM & Division Name (same row on mobile) */}
            <div className={formType === 'basic' ? "col-span-1 md:col-span-4" : "col-span-1 md:col-span-2"}>
              <Label htmlFor="unit">
                UOM <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger id="unit" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UOM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div>
              <Label htmlFor="contentCategory" className="text-sm">
                Select Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryName}
                onValueChange={(value) => {
                  handleInputChange("categoryName", value)
                  // Find the selected category and set its ID
                  const category = categories.find(cat => cat?.CategoryId?.toString() === value)
                  if (category && category.CategoryId) {
                    setSelectedCategoryId(category.CategoryId)
                  }
                }}
              >
                <SelectTrigger id="contentCategory" className="text-sm h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories
                      .filter(category => category?.CategoryId && category?.CategoryName)
                      .map((category) => (
                        <SelectItem key={category.CategoryId} value={category.CategoryId.toString()}>
                          {category.CategoryName}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  )}
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
                      {selectedContentIds.length > 0
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

                // Separate LWH from other fields
                const lwh = ['SizeLength', 'SizeWidth', 'SizeHeight']
                const lwhFields = sizeFields.filter((f: string) => lwh.includes(f))
                const otherFields = sizeFields.filter((f: string) => !lwh.includes(f))

                // Map field names to labels without (MM)
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

                return (
                  <>
                    {/* LWH in 3 columns */}
                    {lwhFields.length > 0 && (
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
                                step="1"
                                min="0"
                                value={planDetails[field] || ''}
                                onChange={(e) => handlePlanDetailChange(field, e.target.value)}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="text-sm h-10"
                                required
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Other fields in 2 columns */}
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
                                required
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
                <div>
                  <Label htmlFor="itemPlanQuality" className="text-sm">
                    Quality <span className="text-red-500">*</span>
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
                    required
                  >
                    <SelectTrigger id="itemPlanQuality" className="text-sm h-10">
                      <SelectValue className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 pb-2 sticky top-0 bg-white z-10">
                        <Input
                          placeholder="Search quality..."
                          value={qualitySearch}
                          onChange={(e) => setQualitySearch(e.target.value)}
                          className="h-8 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
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
                              className="max-w-full"
                            >
                              <div className="truncate" title={quality.Quality || quality}>
                                {quality.Quality || quality}
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="loading" disabled>Loading qualities...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
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
                    required
                  >
                    <SelectTrigger id="itemPlanGsm" className="text-sm h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gsmOptions.length > 0 && (
                        <div className="px-2 pb-2 sticky top-0 bg-white z-10">
                          <Input
                            placeholder="Search GSM..."
                            value={gsmSearch}
                            onChange={(e) => setGsmSearch(e.target.value)}
                            className="h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
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
                              <SelectItem key={index} value={gsmDisplay}>
                                {gsmDisplay}
                              </SelectItem>
                            )
                          })
                      ) : (
                        <SelectItem value="loading" disabled>
                          {planDetails.ItemPlanQuality ? 'Loading GSM...' : 'Select quality first'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
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
                    <SelectTrigger id="itemPlanMill" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                              <SelectItem key={index} value={millDisplay}>
                                {millDisplay}
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="itemPlanFinish" className="text-sm">Finish</Label>
                  <Select
                    value={planDetails.ItemPlanFinish || ''}
                    onValueChange={(value) => handlePlanDetailChange('ItemPlanFinish', value)}
                    disabled={!planDetails.ItemPlanMill}
                  >
                    <SelectTrigger id="itemPlanFinish" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                            <SelectItem key={index} value={finishDisplay}>
                              {finishDisplay}
                            </SelectItem>
                          )
                        }).filter(Boolean)
                      ) : (
                        <SelectItem value="loading" disabled>
                          {planDetails.ItemPlanMill ? 'Loading finishes...' : 'Select mill first'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="planWastageType" className="text-sm">Wastage Type</Label>
                  <Select
                    value={planDetails.PlanWastageType || ''}
                    onValueChange={(value) => handlePlanDetailChange('PlanWastageType', value)}
                  >
                    <SelectTrigger id="planWastageType" className="text-sm h-10">
                      <SelectValue placeholder="Select wastage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Machine Default">Machine Default</SelectItem>
                      <SelectItem value="Category Process Wise Wastage">Category Process Wise Wastage</SelectItem>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                      <SelectItem value="Sheets">Sheets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                          .sort((a, b) => {
                            // Check if processes are selected
                            const aSelected = selectedProcesses.some(p => p.ProcessID === a.ProcessID)
                            const bSelected = selectedProcesses.some(p => p.ProcessID === b.ProcessID)

                            // Selected items come first
                            if (aSelected && !bSelected) return -1
                            if (!aSelected && bSelected) return 1

                            // Within same selection status, sort alphabetically
                            return (a.ProcessName || '').localeCompare(b.ProcessName || '')
                          })
                          .map((process) => (
                            <label
                              key={process.ProcessID}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded cursor-pointer text-sm"
                            >
                              <Checkbox
                                checked={selectedProcesses.some(p => p.ProcessID === process.ProcessID)}
                                onCheckedChange={() => handleProcessToggle({
                                  ProcessID: process.ProcessID,
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
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Enquiry
            </>
          )}
        </Button>
      </div>
    </form>
    <Toaster />
    </>
  )
}
