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
import { Plus, Save, X, Edit, Trash2, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EnquiryAPI, MasterDataAPI, formatDateForAPI, formatDateForDisplay, type BasicEnquiryData, type DetailedEnquiryData } from "@/lib/api/enquiry"

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
    'CrashLockWithPasting': 'Crash Lock With Pasting.jpg',
    'CrashLockWithoutPasting': 'Crash Lock Without Pasting.jpg',
    'FourCornerBox': 'Four Corner Box.jpg',
    'SixCornerBox': '6 Corner Box.jpg',
    'InnerTray': 'Inner Tray.jpg',
    'TuckToFrontOpenTop': 'Tuck To Front Open Top.jpg',
    'UniversalCarton': 'Universal Carton.jpg',
    'FourCornerHingedLid': 'Four Corner Hinged Lid.jpg',
    'TurnOverEndTray': 'Turn Over End Tray.jpg',
    'WebbedSelfLockingTray': 'Webbed Self Locking Tray.jpg',
    'PillowPouch': 'Pillow Pouch.jpg',
    'ThreeSideSealPouch': 'Three Side Seal Pouch.jpg',
    'CenterSealPouch': 'Center Seal Pouch.jpg',
    'StandUpPouch': 'Stand Up Pouch.jpg',
    'FlatBottomPouch': 'Flat Bottom Pouch.jpg',
    'SpoutPouch': 'Spout Pouch.jpg',
    'FourSideSealPouch': 'Four Side Seal Pouch.jpg',
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
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  const [formType, setFormType] = useState<InquiryFormType>('detailed') // Default to detailed for edit
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingEnquiryNo, setIsFetchingEnquiryNo] = useState(!editMode) // Don't fetch if editing

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
    divisionName: "",
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
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([])
  const [processSearchTerm, setProcessSearchTerm] = useState("")
  const [availableProcesses, setAvailableProcesses] = useState<any[]>([]) // Processes from API with IDs

  // Size inputs state (for selected content type)
  const [sizeInputs, setSizeInputs] = useState<Record<string, string>>({})
  const [selectedContent, setSelectedContent] = useState<any>(null)

  // Dropdown data for material properties
  const [qualities, setQualities] = useState<any[]>([])
  const [gsmOptions, setGsmOptions] = useState<any[]>([])
  const [millOptions, setMillOptions] = useState<any[]>([])
  const [finishOptions, setFinishOptions] = useState<any[]>([])

  // Set form type based on selected form type (Basic or Detailed)
  useEffect(() => {
    if (formType === 'basic') {
      setFormData(prev => ({ ...prev, formType: 'Basic' }))
    } else {
      setFormData(prev => ({ ...prev, formType: 'Detailed' }))
    }
  }, [formType])

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (editMode && initialData && categories.length > 0) {
      console.log('📝 Populating form with initial data:', initialData)
      console.log('📂 Available categories:', categories)

      // Find the category to verify it exists
      const category = categories.find(c => c.CategoryId === initialData.categoryId)
      console.log('📂 Found category:', category)

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

      // Set category ID to trigger content types loading
      if (initialData.categoryId) {
        console.log('📂 Setting category ID:', initialData.categoryId)
        setSelectedCategoryId(initialData.categoryId)
      }

      // If detailed data is available, populate dimensions and other fields
      if (initialData.detailedData) {
        const detailedData = initialData.detailedData
        console.log('📐 Populating detailed data (dimensions, processes):', detailedData)

        // Populate plan details (dimensions) if available
        if (detailedData.DetailsData && detailedData.DetailsData.length > 0) {
          const details = detailedData.DetailsData[0]

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

            console.log('📐 Parsed dimensions:', sizeValues)
            setPlanDetails(sizeValues)
          }

          // Store content type to be selected after content types are loaded
          if (details.PlanContentType || details.PlanContName) {
            const contentTypeToSelect = details.PlanContentType || details.PlanContName
            console.log('📦 Content Type to select:', contentTypeToSelect)
            console.log('📦 Full details data:', details)
            // Store in a temporary state to select after content types load
            setFormData(prev => ({ ...prev, contentType: contentTypeToSelect }))
          }
        }

        // Populate selected processes if available
        if (detailedData.ProcessData && detailedData.ProcessData.length > 0) {
          const processNames = detailedData.ProcessData.map((p: any) => p.ProcessName)
          setSelectedProcesses(processNames)
          console.log('⚙️ Selected processes:', processNames)
        }
      }

      setIsFetchingEnquiryNo(false)
    }
  }, [editMode, initialData, categories])

  // Select content type after content types are loaded (for edit mode)
  useEffect(() => {
    if (editMode && formData.contentType && contentTypes.length > 0 && selectedContentIds.length === 0) {
      console.log('📦 Attempting to select content type:', formData.contentType)
      console.log('📦 Available content types:', contentTypes.map(c => ({
        id: c.ContentID,
        name: c.ContentName,
        code: c.ContentCode,
        domainType: c.ContentDomainType
      })))

      // Normalize the search term (remove spaces, dashes, underscores and convert to lowercase)
      const normalizeString = (str: string) => str?.replace(/[\s\-_]+/g, '').toLowerCase() || ''
      const searchTerm = normalizeString(formData.contentType)

      console.log('🔍 Searching for normalized term:', searchTerm)

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

        if (matches) {
          console.log('🎯 Match found on:', c.ContentName, {
            domainType: c.ContentDomainType,
            code: c.ContentCode,
            name: c.ContentName
          })
        }

        return matches
      })

      // If no exact match, try partial matching (contains)
      if (!matchingContent) {
        console.log('🔍 No exact match, trying partial match...')
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

        if (matchingContent) {
          console.log('✅ Partial match found:', matchingContent.ContentName)
        }
      }

      if (matchingContent) {
        console.log('✅ Selecting content:', matchingContent)
        setSelectedContentIds([matchingContent.ContentID])
        setSelectedContent(matchingContent)
      } else {
        console.warn('⚠️ No matching content found for:', formData.contentType)
        console.warn('⚠️ Searched with normalized term:', searchTerm)
        console.warn('⚠️ Tried matching against: ContentDomainType, ContentCode, ContentName')
        console.warn('⚠️ Available normalized names:', contentTypes.map(c => normalizeString(c.ContentName)))
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
        console.log('═══════════════════════════════════════════════════════')
        console.log('🔍 USER SELECTED CONTENT')
        console.log('ContentID:', selectedContentItem?.ContentID)
        console.log('ContentName (what user sees):', selectedContentItem?.ContentName)
        console.log('ContentCode:', selectedContentItem?.ContentCode)
        console.log('ContentDomainType (for API):', selectedContentItem?.ContentDomainType)
        console.log('Full Content Item:', selectedContentItem)
        console.log('═══════════════════════════════════════════════════════')

        if (selectedContentItem?.ContentCode || selectedContentItem?.ContentName) {
          // Use ContentCode (like "RTI") or ContentName - NOT ContentDomainType
          const contentTypeForAPI = selectedContentItem.ContentCode || selectedContentItem.ContentName
          console.log('✅ Using ContentCode for API:', contentTypeForAPI)

          const response = await MasterDataAPI.getItemQualities(contentTypeForAPI, null)
          console.log('📦 Qualities Response:', response)
          if (response.success && response.data) {
            console.log('✅ Setting qualities:', response.data)
            setQualities(response.data)
            // Auto-fill if only one option
            if (response.data.length === 1) {
              const qualityValue = response.data[0].Quality || response.data[0]
              handlePlanDetailChange('ItemPlanQuality', qualityValue)
              console.log('✅ Auto-filled Quality (only 1 option):', qualityValue)
            }
          } else {
            console.error('❌ Failed to fetch qualities:', response.error)
          }
        } else {
          console.warn('⚠️ No ContentDomainType found in selected content')
        }
      } else {
        console.log('ℹ️ No content selected, clearing qualities')
        setQualities([])
      }
    }
    fetchQualities()
  }, [selectedContentIds, contentTypes])

  // Fetch GSM when quality is selected
  useEffect(() => {
    const fetchGSM = async () => {
      console.log('═══════════════════════════════════════════════════════')
      console.log('🟩 GSM FETCH TRIGGERED')
      console.log('Quality value:', planDetails.ItemPlanQuality)
      console.log('Quality type:', typeof planDetails.ItemPlanQuality)
      console.log('Has content selected?', selectedContentIds.length > 0)

      if (selectedContentIds.length > 0 && planDetails.ItemPlanQuality) {
        const selectedContentItem = contentTypes.find((c) => c.ContentID === selectedContentIds[0])
        console.log('Selected content item:', selectedContentItem)

        if (selectedContentItem?.ContentCode || selectedContentItem?.ContentName) {
          // Use ContentCode or ContentName - NOT ContentDomainType
          const contentTypeForAPI = selectedContentItem.ContentCode || selectedContentItem.ContentName
          console.log('✅ Calling GSM API with:')
          console.log('   ContentType:', contentTypeForAPI)
          console.log('   Quality:', planDetails.ItemPlanQuality)

          const response = await MasterDataAPI.getGSMData(
            contentTypeForAPI,
            planDetails.ItemPlanQuality,
            null
          )
          if (response.success && response.data) {
            setGsmOptions(response.data)
            // Auto-fill if only one option
            if (response.data.length === 1) {
              const gsmValue = typeof response.data[0] === 'object' ? ((response.data[0] as any).gsm || (response.data[0] as any).GSM) : response.data[0]
              handlePlanDetailChange('ItemPlanGsm', gsmValue?.toString() || response.data[0].toString())
              console.log('✅ Auto-filled GSM (only 1 option):', gsmValue)
            }
          } else {
            console.error('❌ GSM API failed:', response.error)
          }
        } else {
          console.warn('⚠️  No ContentCode or ContentName found')
        }
      } else {
        console.log('⚠️  Not fetching GSM - missing requirements')
        setGsmOptions([])
      }
      console.log('═══════════════════════════════════════════════════════')
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
          console.log('🟨 Fetching Mill - ContentType:', contentTypeForAPI, 'Quality:', planDetails.ItemPlanQuality, 'GSM:', planDetails.ItemPlanGsm)

          const response = await MasterDataAPI.getMillData(
            contentTypeForAPI,
            planDetails.ItemPlanQuality,
            parseInt(planDetails.ItemPlanGsm),
            null
          )
          if (response.success && response.data) {
            console.log('🟨 Mill data received:', response.data)
            console.log('🟨 Mill data type:', typeof response.data)
            console.log('🟨 Is array?', Array.isArray(response.data))
            if (Array.isArray(response.data) && response.data.length > 0) {
              console.log('🟨 First mill item:', response.data[0], 'Type:', typeof response.data[0])
            }
            setMillOptions(response.data)
            // Auto-fill if only one option
            if (response.data.length === 1) {
              const millValue = typeof response.data[0] === 'object' ? ((response.data[0] as any).Mill || (response.data[0] as any).mill) : response.data[0]
              handlePlanDetailChange('ItemPlanMill', millValue?.toString() || response.data[0].toString())
              console.log('✅ Auto-filled Mill (only 1 option):', millValue)
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
          // Auto-fill if only one option
          if (response.data.length === 1) {
            const finishValue = typeof response.data[0] === 'object' ? ((response.data[0] as any).Finish || (response.data[0] as any).finish) : response.data[0]
            handlePlanDetailChange('ItemPlanFinish', finishValue?.toString() || response.data[0].toString())
            console.log('✅ Auto-filled Finish (only 1 option):', finishValue)
          }
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

  const handleProcessToggle = (process: string) => {
    setSelectedProcesses((prev) => {
      if (prev.includes(process)) {
        return prev.filter((p) => p !== process)
      }
      return [...prev, process]
    })
  }

  const handlePlanDetailChange = (field: string, value: string) => {
    setPlanDetails((prev) => ({ ...prev, [field]: value }))
  }

  const handleApplyContent = () => {
    if (selectedContentIds.length === 0) {
      alert("Please select at least one content")
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

    alert(`${newContentData.length} content(s) added successfully`)
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

    // File name validation
    const invalidPattern = /[^A-Za-z0-9._\-\s()]/g
    for (const file of formData.attachments) {
      if (invalidPattern.test(file.name)) {
        alert(
          `File name contains unsupported special characters (only letters, numbers, _, -, . are allowed): ${file.name}`
        )
        return
      }
      if (file.name.length > 65) {
        alert(`File name must not exceed 60 characters (including extension): ${file.name}`)
        return
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      alert("Please fill in all mandatory fields (highlighted in red)")
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

        console.log('🚀 === BASIC ENQUIRY SUBMISSION ===')
        console.log('📤 Sending data to API:', JSON.stringify([basicEnquiryData], null, 2))
        console.table([basicEnquiryData])
        console.log('🌐 Endpoint: POST /api/enquiry/saveeqdata')
        console.log('📋 Additional Header - ProductionUnitID:', getProductionUnitID())
        console.log('====================================')

        const response = await EnquiryAPI.saveBasicEnquiry([basicEnquiryData], null, getProductionUnitID())

        if (response.success) {
          alert("Enquiry created successfully!")
          router.push("/inquiries")
        } else {
          alert(`Failed to save enquiry: ${response.error}`)
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
          PlanContentType: '',
          ContentSizeValues: buildContentSizeValues(),
          valuesString: Object.values(planDetails).join(','),
          JobSizeInCM: buildSizeString(),
        }] : []

        // Transform selected processes - map process names to IDs
        const processData = selectedContentItem ? selectedProcesses.map(processName => {
          const processInfo = availableProcesses.find(p => p.ProcessName === processName)
          return {
            ProcessID: processInfo?.ProcessID || 0,
            ProcessName: processName,
            PlanContName: selectedContentItem.ContentName || '',
            PlanContentType: selectedContentItem.ContentCode || '',
          }
        }) : []

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
            LedgerName: clients.find(c => c.LedgerId === getLedgerID())?.LedgerName || '',
            CategoryName: categories.find(c => c.CategoryId === getCategoryID())?.CategoryName || '',
          }],
        }

        console.log('🚀 === DETAILED ENQUIRY SUBMISSION ===')
        console.log('📤 Sending data to API:', JSON.stringify(detailedEnquiryData, null, 2))
        console.log('📋 Main Data:')
        console.table([mainData])
        console.log('📋 Details Data:', detailsData)
        console.log('📋 Process Data:', processData)
        console.log('🌐 Endpoint: POST /api/enquiry/SaveMultipleEnquiry')
        console.log('====================================')

        // Use update API if in edit mode, otherwise create new
        let response
        if (editMode && initialData) {
          // Add EnquiryID and IsEdit flag for update
          const updateData = {
            ...detailedEnquiryData,
            EnquiryID: initialData.enquiryId || 0, // Get from initial data
            IsEdit: "True",
          }
          console.log('📝 === UPDATING ENQUIRY ===')
          console.log('📤 Update data:', JSON.stringify(updateData, null, 2))
          response = await (EnquiryAPI as any).updateMultipleEnquiry(updateData, null)
        } else {
          response = await EnquiryAPI.saveDetailedEnquiry(detailedEnquiryData as any, null)
        }

        if (response.success) {
          alert(editMode ? "Enquiry updated successfully!" : "Enquiry created successfully!")
          if (onSaveSuccess) {
            onSaveSuccess()
          } else {
            router.push("/inquiries")
          }
        } else {
          alert(`Failed to ${editMode ? 'update' : 'save'} enquiry: ${response.error}`)
        }
      }
    } catch (error: any) {
      alert(`An error occurred: ${error.message}`)
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
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      {/* Form Type Toggle - Hide in edit mode */}
      {!editMode && (
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <Label className="text-base font-semibold text-[#005180] whitespace-nowrap">Form Type:</Label>
          <div className="inline-flex rounded-lg border-2 border-[#005180] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setFormType('basic')}
              className={`px-4 md:px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                formType === 'basic'
                  ? 'bg-[#78BE20] text-white shadow-md'
                  : 'text-[#005180] hover:bg-[#005180]/10'
              }`}
            >
              Basic Form
            </button>
            <button
              type="button"
            onClick={() => setFormType('detailed')}
            className={`px-4 md:px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              formType === 'detailed'
                ? 'bg-[#78BE20] text-white shadow-md'
                : 'text-[#005180] hover:bg-[#005180]/10'
            }`}
          >
            Detailed Form
          </button>
        </div>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="enquiryNo">Enquiry No</Label>
              <Input
                id="enquiryNo"
                value={isFetchingEnquiryNo ? "Loading..." : (formData.enquiryNo || "")}
                disabled
                placeholder="Fetching..."
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="enquiryDate">Enquiry Date</Label>
              <Input
                id="enquiryDate"
                type="date"
                value={formData.enquiryDate}
                onChange={(e) => handleInputChange("enquiryDate", e.target.value)}
              />
            </div>
            {formType === 'detailed' && (
              <>
                <div className="md:col-span-2">
                  <Label htmlFor="salesType">Sales Type *</Label>
                  <Select value={formData.salesType} onValueChange={(value) => handleInputChange("salesType", value)}>
                    <SelectTrigger id="salesType">
                      <SelectValue placeholder="Select Sales Type" />
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
                <div className="md:col-span-2">
                  <Label htmlFor="enquiryType">Enquiry Type *</Label>
                  <Select value={formData.enquiryType} onValueChange={(value) => handleInputChange("enquiryType", value)}>
                    <SelectTrigger id="enquiryType">
                      <SelectValue placeholder="Select Enquiry Type" />
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
              </>
            )}
            <div className={formType === 'basic' ? "md:col-span-8" : "md:col-span-4"}>
              <Label htmlFor="clientName">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.clientName}
                onValueChange={(value) => handleInputChange("clientName", value)}
              >
                <SelectTrigger id="clientName" className={validationErrors.clientName ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Client" />
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
                  <Label htmlFor="concernPerson">Concerned Person</Label>
                  <Input
                    id="concernPerson"
                    value={formData.concernPerson}
                    onChange={(e) => handleInputChange("concernPerson", e.target.value)}
                    placeholder="Enter Concerned Person"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="concernPersonMobile">Mobile No.</Label>
                  <Input
                    id="concernPersonMobile"
                    value={formData.concernPersonMobile}
                    onChange={(e) => handleInputChange("concernPersonMobile", e.target.value)}
                    placeholder="Mobile Number"
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
                placeholder="Enter Job Name"
                className={validationErrors.jobName ? "border-red-500" : ""}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
            {formType === 'detailed' && (
              <div className="md:col-span-2">
                <Label htmlFor="productCode">Product Code</Label>
                <Input
                  id="productCode"
                  value={formData.productCode}
                  onChange={(e) => handleInputChange("productCode", e.target.value)}
                  placeholder="Enter Product Code"
                />
              </div>
            )}
            <div className={formType === 'basic' ? "md:col-span-3" : "md:col-span-1"}>
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="Quantity"
                className={validationErrors.quantity ? "border-red-500" : ""}
              />
            </div>
            {formType === 'detailed' && (
              <div className="md:col-span-2">
                <Label htmlFor="annualQuantity">Annual Quantity</Label>
                <Input
                  id="annualQuantity"
                  type="number"
                  value={formData.annualQuantity}
                  onChange={(e) => handleInputChange("annualQuantity", e.target.value)}
                  placeholder="Annual Quantity"
                />
              </div>
            )}
            <div className={formType === 'basic' ? "md:col-span-3" : "md:col-span-2"}>
              <Label htmlFor="unit">
                UOM <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select UOM" />
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
                <div className="md:col-span-3">
                  <Label htmlFor="divisionName">Division Name</Label>
                  <Input
                    id="divisionName"
                    value={formData.divisionName}
                    onChange={(e) => handleInputChange("divisionName", e.target.value)}
                    placeholder="Select Division"
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
                <SelectTrigger id="plant" className={validationErrors.plant ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Production Unit" />
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
                    placeholder="Enter Location"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                    placeholder="Payment Terms"
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
                <SelectTrigger id="salesPerson" className={validationErrors.salesPerson ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Sales Person" />
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
                  value={formData.expectCompletion}
                  onChange={(e) => handleInputChange("expectCompletion", e.target.value)}
                  placeholder="Days"
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
            <CardTitle className="text-lg md:text-xl">Content Selection & Configuration</CardTitle>
          </CardHeader>
        <CardContent className="pt-0">
          {/* Category Selection */}
          <div className="mb-4">
            <Label htmlFor="contentCategory">
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
              <SelectTrigger id="contentCategory">
                <SelectValue placeholder="Select Category" />
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

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 border rounded-lg p-3 md:p-4">
            {/* Left Panel: Content Selection */}
            <div className="lg:border-r lg:pr-4 pb-4 lg:pb-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Select Content</span>
                {selectedContentIds.length > 0 && (
                  <span className="text-xs text-green-600 font-medium">✓ Selected</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
                {contentTypes.length > 0 ? (
                  contentTypes.map((content) => (
                    <button
                      key={content.ContentID}
                      type="button"
                      onClick={() => handleContentSelect(content.ContentID)}
                      className={`relative rounded-lg border-2 p-2 transition-all hover:shadow-md ${
                        selectedContentIds.includes(content.ContentID)
                          ? "border-[#005180] bg-[#005180]/5"
                          : "border-border hover:border-[#005180]/50"
                      }`}
                    >
                      {selectedContentIds.includes(content.ContentID) && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#005180] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-2 overflow-hidden">
                        <img
                          src={getContentImagePath(content.ContentName)}
                          alt={content.ContentName}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            // Fallback to default image if specific image not found
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default.png';
                          }}
                        />
                      </div>
                      <p
                        className="text-xs text-center font-medium line-clamp-2"
                        title={content.ContentName}
                      >
                        {content.ContentName}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 sm:col-span-3 lg:col-span-4 flex items-center justify-center h-32 text-sm text-muted-foreground">
                    {selectedCategoryId ? 'Loading content types...' : 'Please select a category first'}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Process Selection */}
            <div>
              <span className="text-sm font-medium block mb-3">Add Allowed Process</span>
              <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto">
                <Input
                  placeholder="Search processes..."
                  className="mb-2"
                  value={processSearchTerm}
                  onChange={(e) => setProcessSearchTerm(e.target.value)}
                />
                <div className="space-y-1">
                  {(availableProcesses.length > 0 ? availableProcesses : AVAILABLE_PROCESSES.map(name => ({ ProcessName: name })))
                    .filter((p) => p.ProcessName.toLowerCase().includes(processSearchTerm.toLowerCase()))
                    .map((process, index) => (
                      <label
                        key={`${process.ProcessName}-${index}`}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedProcesses.includes(process.ProcessName)}
                          onCheckedChange={() => handleProcessToggle(process.ProcessName)}
                        />
                        <span className="text-xs">{process.ProcessName}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Section 5.5: Sizes (Dynamic based on Selected Content) - Only for Detailed Form */}
      {formType === 'detailed' && selectedContentIds.length > 0 && (() => {
        const firstSelectedContent = contentTypes.find((c) => selectedContentIds.includes(c.ContentID))
        return firstSelectedContent && firstSelectedContent.ContentSizes
      })() && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Sizes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {(() => {
                const firstSelectedContent = contentTypes.find((c) => selectedContentIds.includes(c.ContentID))
                if (!firstSelectedContent?.ContentSizes) return null

                return firstSelectedContent.ContentSizes.split(',').map((sizeField: string) => {
                  const field = sizeField.trim()

                  // Map field names to labels
                  const fieldLabels: Record<string, string> = {
                    'SizeHeight': 'Height (MM)',
                    'SizeLength': 'Length (MM)',
                    'SizeWidth': 'Width (MM)',
                    'SizeOpenflap': 'Open Flap (MM)',
                    'SizePastingflap': 'Pasting Flap (MM)',
                    'JobUps': 'Job Ups',
                    'SizeDiameter': 'Diameter (MM)',
                    'SizeDepth': 'Depth (MM)',
                  }

                  const label = fieldLabels[field] || field

                  return (
                    <div key={field}>
                      <Label htmlFor={`content-${field}`}>{label}</Label>
                      <Input
                        id={`content-${field}`}
                        type="number"
                        value={planDetails[field] || ''}
                        onChange={(e) => handlePlanDetailChange(field, e.target.value)}
                        placeholder="Enter value"
                      />
                    </div>
                  )
                })
              })()}

              {/* Additional fields for colors, quality, GSM, etc. */}
              <div>
                <Label htmlFor="planFColor">Front Color</Label>
                <Input
                  id="planFColor"
                  type="number"
                  value={planDetails.PlanFColor || ''}
                  onChange={(e) => handlePlanDetailChange('PlanFColor', e.target.value)}
                  placeholder="Enter front color count"
                />
              </div>
              <div>
                <Label htmlFor="planBColor">Back Color</Label>
                <Input
                  id="planBColor"
                  type="number"
                  value={planDetails.PlanBColor || ''}
                  onChange={(e) => handlePlanDetailChange('PlanBColor', e.target.value)}
                  placeholder="Enter back color count"
                />
              </div>
              <div>
                <Label htmlFor="planSpeFColor">Special Front Color</Label>
                <Input
                  id="planSpeFColor"
                  type="number"
                  value={planDetails.PlanSpeFColor || ''}
                  onChange={(e) => handlePlanDetailChange('PlanSpeFColor', e.target.value)}
                  placeholder="Enter special front color"
                />
              </div>
              <div>
                <Label htmlFor="planSpeBColor">Special Back Color</Label>
                <Input
                  id="planSpeBColor"
                  type="number"
                  value={planDetails.PlanSpeBColor || ''}
                  onChange={(e) => handlePlanDetailChange('PlanSpeBColor', e.target.value)}
                  placeholder="Enter special back color"
                />
              </div>
              <div>
                <Label htmlFor="itemPlanQuality">Quality</Label>
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
                  <SelectTrigger id="itemPlanQuality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.length > 0 ? (
                      qualities.map((quality, index) => (
                        <SelectItem key={index} value={quality.Quality || quality}>
                          {quality.Quality || quality}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>Loading qualities...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="itemPlanGsm">GSM</Label>
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
                  <SelectTrigger id="itemPlanGsm">
                    <SelectValue placeholder="Select GSM" />
                  </SelectTrigger>
                  <SelectContent>
                    {gsmOptions.length > 0 ? (
                      gsmOptions.map((gsm, index) => {
                        // GSM can be a number directly or an object with gsm/GSM field
                        const gsmValue = typeof gsm === 'object' ? ((gsm as any).gsm || (gsm as any).GSM) : gsm
                        const gsmDisplay = gsmValue?.toString() || (typeof gsm === 'object' ? JSON.stringify(gsm) : String(gsm))

                        // Skip if empty or invalid
                        if (!gsmDisplay || gsmDisplay === '' || gsmDisplay === 'undefined' || gsmDisplay === 'null') {
                          return null
                        }

                        return (
                          <SelectItem key={index} value={gsmDisplay}>
                            {gsmDisplay}
                          </SelectItem>
                        )
                      }).filter(Boolean)
                    ) : (
                      <SelectItem value="loading" disabled>
                        {planDetails.ItemPlanQuality ? 'Loading GSM...' : 'Select quality first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="itemPlanMill">Mill</Label>
                <Select
                  value={planDetails.ItemPlanMill || ''}
                  onValueChange={(value) => {
                    handlePlanDetailChange('ItemPlanMill', value)
                    // Reset dependent field
                    handlePlanDetailChange('ItemPlanFinish', '')
                  }}
                  disabled={!planDetails.ItemPlanGsm}
                >
                  <SelectTrigger id="itemPlanMill">
                    <SelectValue placeholder="Select mill" />
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
                            console.error('Mill item is still an object:', mill)
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
                          console.error('Error rendering mill item:', mill, error)
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
                <Label htmlFor="itemPlanFinish">Finish</Label>
                <Select
                  value={planDetails.ItemPlanFinish || ''}
                  onValueChange={(value) => handlePlanDetailChange('ItemPlanFinish', value)}
                  disabled={!planDetails.ItemPlanMill}
                >
                  <SelectTrigger id="itemPlanFinish">
                    <SelectValue placeholder="Select finish" />
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
                <Label htmlFor="planWastageType">Wastage Type</Label>
                <Input
                  id="planWastageType"
                  type="text"
                  value={planDetails.PlanWastageType || ''}
                  onChange={(e) => handlePlanDetailChange('PlanWastageType', e.target.value)}
                  placeholder="Enter wastage type"
                />
              </div>
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
                placeholder="Enter Remark"
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
  )
}
