"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useReactToPrint } from 'react-to-print'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { ClientDropdown } from "@/components/ui/client-dropdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Search,
  Calculator,
  Package,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Scissors,
  Settings,
  X,
  Plus,
  Save,
  Share2,
  Filter,
  Download,
  Printer,
  Eraser,
  Trash2,
} from "lucide-react"

type Costs = {
  basicCost: number
  paperCost: number
  printingCost: number
  bindingCost: number
  packagingCost: number
  freightCost: number
  margin: number
  discount: number
  grandTotal: number
  unitCost: number
  finalCost: number
}

interface JobData {
  clientType: "existing" | "new"
  clientName: string
  jobName: string
  quantity: string
  cartonType: string
  dimensions: {
    height: string
    length: string
    width: string
    openFlap: string
    pastingFlap: string
    unit: "mm" | "cm"
    trimming: {
      top: string
      bottom: string
      left: string
      right: string
    }
    bottomFlap?: string
    bottomFlapPer?: string
    die: string
  }
  paperDetails: {
    quality: string
    qualityId?: string | number
    gsm: string
    mill: string
    finish: string
    specialSize: boolean
    purchaseRate: string
    landedRate: string
    chargeRate: string
    frontColor: string
    backColor: string
    specialFrontColor: string
    specialBackColor: string
    stripping: boolean
    gripper: boolean
    colorStrip: boolean
    printingStyle: string
  }
  processes: Array<{operID: string, processName: string}>
  machine: string
  machineId?: string
  machineName?: string
  wastage: number
  grainDirection: "along" | "across" | "both"
  selectedPlan: any
  costs: Costs
  quantities: Array<{
    qty: number
    costs: Costs
  }>
}

const steps = [
  "Job Details",
  "Carton Type",
  "Size",
  "Paper & Color",
  "Processes",
  "Best Plans",
  "Final Cost",
]

// Helper function to get image path for content type
function getContentImagePath(contentName: string): string {
  // Map content type names to actual image filenames (with spaces)
  const imageMap: Record<string, string> = {
    'ReverseTuckIn': 'Reverse Tuck In.jpg',
    'Reverse Tuck In': 'Reverse Tuck In.jpg',
    'ReverseTuckAndTongue': 'Reverse Tuck And Tongue.jpg',
    'StandardStraightTuckIn': 'Standard Straight Tuck In.jpg',
    'StandardStraightTuckInNested': 'Standard Straight Tuck In Nested.jpg',
    'CrashLockWithPasting': 'Crash Lock With Pasting.jpg',
    'CrashLockWithoutPasting': 'Crash Lock Without Pasting.jpg',
    'FourCornerBox': 'Four Corner Box.jpg',
    'FourCornerHingedLid': 'Four Corner Hinged Lid.jpg',
    'Four Corner Hinged Lid': 'Four Corner Hinged Lid.jpg',
    'FourCorner HingedLid': 'Four Corner Hinged Lid.jpg',
    'Four CornerHingedLid': 'Four Corner Hinged Lid.jpg',
    'SixCornerBox': '6 Corner Box.jpg',
    'InnerTray': 'Inner Tray.jpg',
    'TuckToFrontOpenTop': 'Tuck To Front Open Top.jpg',
    'UniversalCarton': 'Universal Carton.jpg',
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
    'UniversalOpenCrashLockWithPasting': 'Universal Open Crash Lock With Pasting.jpg',
    'RingFlap': 'Ring Flap.jpg',
  }

  let imageName: string;

  // Check if we have a specific mapping
  if (imageMap[contentName]) {
    imageName = imageMap[contentName];
  } else {
    // Try with .jpg extension directly
    imageName = `${contentName}.jpg`;
  }

  // Return the path directly - Next.js handles spaces in filenames without encoding
  return `/images/${imageName}`;
}

interface PrintingWizardProps {
  onStepChange?: (stepName: string) => void
  onToggleSidebar?: () => void
  onNavigateToClientMaster?: () => void // Added prop for navigation to client master
}

export function PrintingWizard({ onStepChange, onToggleSidebar, onNavigateToClientMaster }: PrintingWizardProps = {}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showDetailedCosting, setShowDetailedCosting] = useState<number | null>(null)
  const stepNavRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)

  // Show toast notification
  const showToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000) // Auto hide after 4 seconds
  }

  // Local storage key for persistence
  const LOCAL_STORAGE_KEY = 'printingWizard.jobData.v1'

  const DEFAULT_JOB_DATA: JobData = {
    clientType: "existing",
    clientName: "",
    jobName: "",
    quantity: "",
    cartonType: "",
    dimensions: {
      height: "",
      length: "",
      width: "",
      openFlap: "",
      pastingFlap: "",
      unit: "mm",
      trimming: {
        top: "",
        bottom: "",
        left: "",
        right: "",
      },
      die: "",
    },
    paperDetails: {
      quality: "",
      qualityId: "",
      gsm: "",
      mill: "",
      finish: "",
      specialSize: true,
      purchaseRate: "",
      landedRate: "",
      chargeRate: "",
      frontColor: "",
      backColor: "",
      specialFrontColor: "",
      specialBackColor: "",
      stripping: false,
      gripper: false,
      colorStrip: false,
      printingStyle: "Offset",
    },
  processes: [],
  machine: "",
  machineId: "",
  machineName: "",
    wastage: 6,
    grainDirection: "both",
    selectedPlan: null,
    costs: {
      basicCost: 0,
      paperCost: 0,
      printingCost: 0,
      bindingCost: 0,
      packagingCost: 0,
      freightCost: 0,
      margin: 0,
      discount: 0,
      grandTotal: 0,
      unitCost: 0,
      finalCost: 0,
    },
    quantities: [],
  }

  const [jobData, setJobData] = useState<JobData>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          // prefer saved arrays/objects where present (avoid shallow-merge losing arrays)
          return {
            ...DEFAULT_JOB_DATA,
            ...parsed,
            processes: Array.isArray(parsed.processes) ? parsed.processes : DEFAULT_JOB_DATA.processes,
            paperDetails: { ...DEFAULT_JOB_DATA.paperDetails, ...(parsed.paperDetails ?? {}) },
            dimensions: { ...DEFAULT_JOB_DATA.dimensions, ...(parsed.dimensions ?? {}) },
          }
        }
      }
    } catch (e) {
      console.error('Failed to hydrate jobData from localStorage', e)
    }
    return DEFAULT_JOB_DATA
  })

  const [showQuantityDialog, setShowQuantityDialog] = useState(false)
  const [newQuantity, setNewQuantity] = useState("")
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const [quantityCostingLoading, setQuantityCostingLoading] = useState(false)
  const [quantityCostResults, setQuantityCostResults] = useState<Map<number, any>>(new Map())

  const [categories, setCategories] = useState<any[]>([])
  const [contents, setContents] = useState<any[]>([])
  const [loadingContents, setLoadingContents] = useState(false)
  const [operations, setOperations] = useState<any[]>([])
  const [loadingOperations, setLoadingOperations] = useState(false)
  const [operationsError, setOperationsError] = useState<string | null>(null)
  const [machinesList, setMachinesList] = useState<any[]>([])
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [machinesError, setMachinesError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [categorySearch, setCategorySearch] = useState<string>("")
  const [contentSearch, setContentSearch] = useState<string>("")
  const [processSearch, setProcessSearch] = useState<string>("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [qualities, setQualities] = useState<Array<{ Quality?: string; QualityID?: number }>>([])
  const [gsms, setGsms] = useState<Array<{ GSM?: string; GSMID?: number }>>([])
  const [mills, setMills] = useState<Array<{ Mill?: string; MillID?: number }>>([])
  const [finishes, setFinishes] = useState<Array<{ Finish?: string; FinishID?: number }>>([])
  const [loadingQualities, setLoadingQualities] = useState(false)
  const [loadingGsm, setLoadingGsm] = useState(false)
  const [loadingMill, setLoadingMill] = useState(false)
  const [loadingFinish, setLoadingFinish] = useState(false)
  const [qualitiesError, setQualitiesError] = useState<string | null>(null)
  const [gsmError, setGsmError] = useState<string | null>(null)
  const [millError, setMillError] = useState<string | null>(null)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [lastQualitiesContentType, setLastQualitiesContentType] = useState<string | null>(null)

  // Persist jobData to localStorage (debounced)
  useEffect(() => {
    const LOCAL_STORAGE_KEY = 'printingWizard.jobData.v1'
    const handle = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobData))
        }
      } catch (e) {
        console.error('Failed to save jobData to localStorage', e)
      }
    }, 700)

    return () => clearTimeout(handle)
  }, [jobData])
  const [showJsonPreview, setShowJsonPreview] = useState(false)

  // Load qualities for the selected content (reusable for retry)
  const loadQualitiesForSelection = useCallback(async (overrideContentType?: string) => {
    const cart = overrideContentType ?? jobData.cartonType
    if (!cart) {
      setQualities([])
      setQualitiesError(null)
      setLastQualitiesContentType(null)
      return []
    }

    try {
      setLoadingQualities(true)
      setQualitiesError(null)

      const selectedContent = contents.find((c: any) =>
        String(c.ContentName) === String(cart) || String(c.ContentID) === String(cart)
      )

      const contentType = selectedContent?.ContentName ?? selectedContent?.ContentDomainType ?? String(cart)
      setLastQualitiesContentType(contentType)

  const { getQualitiesAPI, API_CONFIG, getDefaultHeaders } = await import('@/lib/api-config')
  const res = await getQualitiesAPI(contentType)


      if (Array.isArray(res) && res.length > 0) {
        setQualities(res)
      } else {
        setQualities([])
      }
      return Array.isArray(res) ? res : []
    } catch (err: any) {
      console.error('Failed to load qualities', err)
      setQualities([])
      setQualitiesError(err?.message ? String(err.message) : 'Failed to load qualities')
      return []
    } finally {
      setLoadingQualities(false)
    }
  }, [contents, jobData.cartonType])

  useEffect(() => {
    loadQualitiesForSelection()
  }, [jobData.cartonType, contents, loadQualitiesForSelection])

  // Load operations for current domain (derived from selected content / cartonType)
  const loadOperationsForDomain = useCallback(async (domainType?: string, processPurpose?: string) => {
    const domain = domainType ?? (contents.find((c: any) => c.ContentName === jobData.cartonType)?.ContentDomainType) ?? jobData.cartonType
    if (!domain) {
      setOperations([])
      setOperationsError(null)
      return []
    }

    try {
      setLoadingOperations(true)
      setOperationsError(null)
      const { getLoadOperationsAPI } = await import('@/lib/api-config')
      const res = await getLoadOperationsAPI(String(domain), processPurpose)
      if (Array.isArray(res) && res.length > 0) setOperations(res)
      else setOperations([])
      return Array.isArray(res) ? res : []
    } catch (err: any) {
      console.error('Failed to load operations', err)
      setOperations([])
      setOperationsError(err?.message ? String(err.message) : 'Failed to load operations')
      return []
    } finally {
      setLoadingOperations(false)
    }
  }, [contents, jobData.cartonType])

  // Load machines list
  const loadMachines = useCallback(async () => {
    try {
      setLoadingMachines(true)
      setMachinesError(null)
      const { getAllMachinesAPI } = await import('@/lib/api-config')
      const res = await getAllMachinesAPI()
      if (Array.isArray(res) && res.length > 0) setMachinesList(res)
      else setMachinesList([])
      return Array.isArray(res) ? res : []
    } catch (err: any) {
      console.error('Failed to load machines', err)
      setMachinesList([])
      setMachinesError(err?.message ? String(err.message) : 'Failed to load machines')
      return []
    } finally {
      setLoadingMachines(false)
    }
  }, [])

  // Load GSM options for selected contentType and quality
  const loadGsmForSelection = useCallback(async (overrideContentType?: string, overrideQuality?: string, overrideThickness?: string) => {
    const content = overrideContentType ?? jobData.cartonType
    const quality = overrideQuality ?? jobData.paperDetails.quality
    const thickness = overrideThickness ?? '0'

    if (!content || !quality) {
      setGsms([])
      setGsmError(null)
      return []
    }

    try {
      setLoadingGsm(true)
      setGsmError(null)
      const { getGsmAPI, API_CONFIG, getDefaultHeaders } = await import('@/lib/api-config')
      const contentType = (contents.find((c: any) => c.ContentName === content)?.ContentName) ?? content
      const res = await getGsmAPI(contentType, String(quality), String(thickness))
      if (Array.isArray(res) && res.length > 0) {
        setGsms(res)
      } else {
        setGsms([])
      }
      return Array.isArray(res) ? res : []
    } catch (err: any) {
      console.error('Failed to load GSM options', err)
      setGsms([])
      setGsmError(err?.message ? String(err.message) : 'Failed to load GSM')
      return []
    } finally {
      setLoadingGsm(false)
    }
  }, [contents, jobData.cartonType, jobData.paperDetails.quality])

  useEffect(() => {
    // refresh GSM when quality changes
    loadGsmForSelection()
  }, [jobData.paperDetails.quality, jobData.cartonType, loadGsmForSelection])

  // Load Mill options for selected contentType, quality and gsm
  const loadMillForSelection = useCallback(async (overrideContentType?: string, overrideQuality?: string, overrideGsm?: string, overrideThickness?: string) => {
    const content = overrideContentType ?? jobData.cartonType
    const quality = overrideQuality ?? jobData.paperDetails.quality
    const gsm = overrideGsm ?? jobData.paperDetails.gsm
    const thickness = overrideThickness ?? '0'

    if (!content || !quality || !gsm) {
      setMills([])
      setMillError(null)
      return []
    }

    try {
      setLoadingMill(true)
      setMillError(null)
      const { getMillAPI } = await import('@/lib/api-config')
      const contentType = (contents.find((c: any) => c.ContentName === content)?.ContentName) ?? content
      console.log('Loading mills with:', { contentType, quality, gsm, thickness })
      const res = await getMillAPI(contentType, String(quality), String(gsm), String(thickness))
      console.log('Mill API response:', res)
      if (Array.isArray(res) && res.length > 0) setMills(res)
      else setMills([])
      return Array.isArray(res) ? res : []
    } catch (err: any) {
      console.error('Failed to load mills', err)
      setMills([])
      setMillError(err?.message ? String(err.message) : 'Failed to load mills')
      return []
    } finally {
      setLoadingMill(false)
    }
  }, [contents, jobData.cartonType, jobData.paperDetails.quality, jobData.paperDetails.gsm])

  useEffect(() => {
    // refresh mills when gsm or quality changes
    loadMillForSelection()
  }, [jobData.paperDetails.quality, jobData.paperDetails.gsm, jobData.cartonType, loadMillForSelection])

  // If selected mill is not present in the fetched mills, clear it (to avoid stale selection)
  useEffect(() => {
    if (jobData.paperDetails.mill && mills && mills.length > 0) {
      const found = mills.find((m) => String(m.Mill) === String(jobData.paperDetails.mill) || String(m.MillID) === String(jobData.paperDetails.mill))
      if (!found) {
        setJobData((prev) => ({ ...prev, paperDetails: { ...prev.paperDetails, mill: '' } }))
      }
    }
  }, [mills, jobData.paperDetails.mill])

  // Load Finish options for selected quality, gsm and mill
  const loadFinishForSelection = useCallback(async (overrideQuality?: string, overrideGsm?: string, overrideMill?: string) => {
    const quality = overrideQuality ?? jobData.paperDetails.quality
    const gsm = overrideGsm ?? jobData.paperDetails.gsm
    const mill = overrideMill ?? jobData.paperDetails.mill

    if (!quality || !gsm || !mill) {
      setFinishes([])
      setFinishError(null)
      return []
    }

    try {
      setLoadingFinish(true)
      setFinishError(null)
      const { getFinishAPI } = await import('@/lib/api-config')
      console.log('Loading finishes with:', { quality, gsm, mill })
      const res = await getFinishAPI(String(quality), String(gsm), String(mill))
      console.log('Finish API response:', res)
      if (Array.isArray(res) && res.length > 0) setFinishes(res)
      else setFinishes([])
      return Array.isArray(res) ? res : []
    } catch (err: any) {
      console.error('Failed to load finishes', err)
      setFinishes([])
      setFinishError(err?.message ? String(err.message) : 'Failed to load finishes')
      return []
    } finally {
      setLoadingFinish(false)
    }
  }, [jobData.paperDetails.quality, jobData.paperDetails.gsm, jobData.paperDetails.mill])

  useEffect(() => {
    // refresh finishes when quality, gsm or mill changes
    loadFinishForSelection()
  }, [jobData.paperDetails.quality, jobData.paperDetails.gsm, jobData.paperDetails.mill, loadFinishForSelection])

  // If selected finish is not present in the fetched finishes, clear it
  useEffect(() => {
    if (jobData.paperDetails.finish && finishes && finishes.length > 0) {
      const found = finishes.find((f) => String(f.Finish) === String(jobData.paperDetails.finish) || String(f.FinishID) === String(jobData.paperDetails.finish))
      if (!found) {
        setJobData((prev) => ({ ...prev, paperDetails: { ...prev.paperDetails, finish: '' } }))
      }
    }
  }, [finishes, jobData.paperDetails.finish])

  // Load operations when user navigates to Processes step
  useEffect(() => {
    const processesIndex = steps.indexOf('Processes')
    if (currentStep === processesIndex) {
      loadOperationsForDomain()
    }
  }, [currentStep, loadOperationsForDomain])

  // Machines step removed - load machines on mount if needed
  useEffect(() => {
    loadMachines()
  }, [loadMachines])

  // Fetch categories once on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // When selectedCategoryId changes (including '0'), fetch contents
  useEffect(() => {
    if (selectedCategoryId !== undefined && selectedCategoryId !== null && selectedCategoryId !== '') {
      fetchContents(selectedCategoryId)
    } else {
      setContents([])
    }
  }, [selectedCategoryId])

  // Load categories from API and normalize
  async function fetchCategories() {
    try {
      const { apiClient } = await import('@/lib/api-config')
      const data = await apiClient.get('api/planwindow/GetSbCategory')

      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((cat: any, idx: number) => {
          const id = (
            cat.CategoryID ?? cat.CategoryId ?? cat.categoryID ?? cat.categoryId ??
            cat.ContentID ?? cat.contentID ?? cat.Id ?? cat.id ?? idx
          )?.toString()
          const name = cat.CategoryName ?? cat.categoryName ?? cat.ContentName ?? cat.contentName ?? cat.Name ?? cat.name ?? `Category ${idx + 1}`
          return { id, name, raw: cat }
        })

        setCategories(normalized)
        // Do NOT auto-select the first category. User must explicitly pick a category.
      } else {
        setCategories([])
      }
    } catch (e) {
      console.error('Error fetching categories:', e)
      setCategories([])
    }
  }

  // Fetch contents for a category and normalize
  async function fetchContents(categoryId: string | number) {
    try {
      setLoadingContents(true)
      const { fetchCategoryContents } = await import('@/lib/api-config')
      const data = await fetchCategoryContents(categoryId)

      // Normalize response into an array of items
      let items: any[] = []
      if (!data) items = []
      else if (Array.isArray(data)) items = data
      else if (data?.data && Array.isArray(data.data)) items = data.data
      else if (data?.Data && Array.isArray(data.Data)) items = data.Data
      else if (data?.d && Array.isArray(data.d)) items = data.d
      else if (typeof data === 'object') {
        const firstArray = Object.values(data).find((v) => Array.isArray(v))
        if (Array.isArray(firstArray)) items = firstArray as any[]
      }

      setContents(items)
    } catch (error) {
      console.error('Error fetching contents:', error)
      setContents([])
    } finally {
      setLoadingContents(false)
    }
  }

  const nextStep = async () => {
    console.log('=== nextStep called ===', { currentStep, stepName: steps[currentStep] })

    // Validate mandatory fields before moving to next step
    const currentStepName = steps[currentStep]

    if (currentStepName === 'Job Details') {
      const missing = []
      if (!jobData.clientName) missing.push('Client Name')
      if (!jobData.jobName) missing.push('Job Name')
      if (!jobData.quantity) missing.push('Quantity')

      if (missing.length > 0) {
        showToast(`Please fill: ${missing.join(', ')}`, 'error')
        return
      }
    } else if (currentStepName === 'Carton Type') {
      if (!jobData.cartonType) {
        showToast('Please select a Carton Type', 'error')
        return
      }
    } else if (currentStepName === 'Size') {
      const dims = jobData.dimensions
      const missing = []
      if (!dims.length) missing.push('Length')
      if (!dims.width) missing.push('Width')
      if (!dims.height) missing.push('Height')
      if (!dims.openFlap) missing.push('Open Flap')
      if (!dims.pastingFlap) missing.push('Pasting Flap')

      if (missing.length > 0) {
        showToast(`Please fill: ${missing.join(', ')}`, 'error')
        return
      }
    } else if (currentStepName === 'Paper & Color') {
      const missing = []
      if (!jobData.paperDetails.quality) missing.push('Quality')
      if (!jobData.paperDetails.gsm) missing.push('GSM')

      if (missing.length > 0) {
        showToast(`Please fill: ${missing.join(', ')}`, 'error')
        return
      }
    }

    if (currentStep < steps.length - 1) {
      const processesIndex = steps.indexOf('Processes')
      const bestPlansIndex = steps.indexOf('Best Plans')

      // If we're on Processes and moving to Best Plans, run planning first and wait
      if (currentStep === processesIndex) {
        console.log('=== On Processes step, triggering planning ===')
        try {
          setPlanningError(null)
          const ok = await runPlanning()
          console.log('=== Planning result ===', { ok })
          if (ok) {
            const newStep = currentStep + 1
            setCurrentStep(newStep)
            onStepChange?.(steps[newStep])
          } else {
            console.log('=== Planning failed, staying on Processes step ===')
            // planning failed, remain on processes step
          }
        } catch (e: any) {
          console.error('Planning failed during nextStep navigation', e)
          setPlanningError(e?.message ? String(e.message) : 'Planning failed')
        }
      } else if (currentStep === bestPlansIndex) {
        // If on Best Plans, create booking first, then get quotation details
        console.log('=== On Best Plans step, creating quotation ===')

        // Check if a plan is selected
        console.log('=== Checking selectedPlan ===', selectedPlan)
        if (!selectedPlan) {
          console.error('=== No plan selected ===')
          setPlanningError('Please select a plan first')
          return
        }

        try {
          setPlanningLoading(true)
          setPlanningError(null)

          const { createBooking, getQuotationDetail } = await import('@/lib/api-config')

          // Step 1: Call directcosting API to get quotation number
          console.log('\n' + '='.repeat(80))
          console.log('CREATE QUOTATION BUTTON CLICKED')
          console.log('='.repeat(80))
          console.log('STEP 1: Getting Quotation Number via DirectCosting API')
          console.log('='.repeat(80) + '\n')

          // Build CostignParams and EnquiryData
          const dims = jobData.dimensions || {}
          const paper = jobData.paperDetails || {}

          const costingParams = {
            SizeHeight: parseFloat(dims.height) || 0,
            SizeLength: parseFloat(dims.length) || 0,
            SizeWidth: parseFloat(dims.width) || 0,
            SizeOpenflap: parseFloat(dims.openFlap) || 0,
            SizePastingflap: parseFloat(dims.pastingFlap) || 0,
            SizeBottomflap: 0,
            JobNoOfPages: 0,
            JobUps: 0,
            JobFlapHeight: 0,
            JobTongHeight: 0,
            JobFoldedH: 0,
            JobFoldedL: 0,
            PlanContentType: jobData.cartonType ? jobData.cartonType.replace(/\s+/g, '') : '',
            PlanFColor: Number(paper.frontColor) || 0,
            PlanBColor: Number(paper.backColor) || 0,
            PlanColorStrip: 0,
            PlanGripper: 0,
            PlanPrintingStyle: (() => {
              const hasFront = Number(paper.frontColor) > 0
              const hasBack = Number(paper.backColor) > 0
              if (hasFront && hasBack) return 'Choose Best'
              if (hasFront || hasBack) return 'Single Side'
              return 'Choose Best'
            })(),
            PlanWastageValue: 0,
            Trimmingleft: 0,
            Trimmingright: 0,
            Trimmingtop: 0,
            Trimmingbottom: 0,
            Stripingleft: 0,
            Stripingright: 0,
            Stripingtop: 0,
            Stripingbottom: 0,
            PlanPrintingGrain: 'Both',
            ItemPlanQuality: paper.quality || '',
            ItemPlanGsm: Number(paper.gsm) || 0,
            ItemPlanMill: '',
            PlanPlateType: 'CTP Plate',
            PlanWastageType: 'Machine Default',
            PlanContQty: Number(jobData.quantity) || 0,
            PlanSpeFColor: 0,
            PlanSpeBColor: 0,
            PlanContName: jobData.cartonType || '',
            ItemPlanFinish: '',
            OperId: resolveOperIdFromProcesses(jobData),
            JobBottomPerc: 0,
            JobPrePlan: `H:${dims.height || 0},L:${dims.length || 0},W:${dims.width || 0},OF:${dims.openFlap || 0},PF:${dims.pastingFlap || 0}`,
            ChkPlanInSpecialSizePaper: false,
            ChkPlanInStandardSizePaper: false,
            MachineId: '',
            PlanOnlineCoating: '',
            PaperTrimleft: 0,
            PaperTrimright: 0,
            PaperTrimtop: 0,
            PaperTrimbottom: 0,
            ChkPaperByClient: false,
            JobFoldInL: 1,
            JobFoldInH: 1,
            ChkPlanInAvailableStock: false,
            PlanPlateBearer: 0,
            PlanStandardARGap: 0,
            PlanStandardACGap: 0,
            PlanContDomainType: 'Offset',
            Planlabeltype: null,
            Planwindingdirection: 0,
            Planfinishedformat: null,
            Plandietype: '',
            PlanPcsPerRoll: 0,
            PlanCoreInnerDia: 0,
            PlanCoreOuterDia: 0,
            EstimationQuantityUnit: 'PCS',
            ItemPlanThickness: 0,
            SizeCenterSeal: 0,
            SizeSideSeal: 0,
            SizeTopSeal: 0,
            SizeBottomGusset: 0,
            PlanMakeReadyWastage: 0,
            CategoryID: 2,
            BookSpine: 0,
            BookHinge: 0,
            BookCoverTurnIn: 0,
            BookExtension: 0,
            BookLoops: 0,
            PlanOtherMaterialGSM: 0,
            PlanOtherMaterialGSMSettingJSON: '',
            MaterialWetGSMConfigJSON: '',
            PlanPunchingType: null,
            ChkBackToBackPastingRequired: false,
            JobAcrossUps: 0,
            JobAroundUps: 0,
            SizeBottomflapPer: 0,
            SizeZipperLength: 0,
            ZipperWeightPerMeter: 0,
            JobSizeInputUnit: 'MM',
            LedgerID: 0
          }

          const enquiryData = {
            ProductCode: planningResults?.[0]?.ProductCode || '',
            LedgerID: planningResults?.[0]?.LedgerID || 4,
            SalesEmployeeID: planningResults?.[0]?.SalesEmployeeID || 52,
            CategoryID: 2,
            Quantity: Number(jobData.quantity) || 0,
            ConcernPersonID: null,
            JobName: jobData.jobName || '',
            ClientName: jobData.clientName || '',
            FileName: '',
            EnquiryDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            EstimationUnit: 'PCS',
            ExpectCompletion: '10',
            Remark: planningResults?.[0]?.Remark || '',
            TypeOfJob: null,
            TypeOfPrinting: null,
            EnquiryType: 'Bid',
            SalesType: 'Export',
            EnquiryNumber: enquiryNumber || '', // Add enquiry number from SaveMultipleEnquiry
          }

          console.log('\n' + '='.repeat(80))
          console.log('API CALL #1: DirectCosting (to get BookingID)')
          console.log('='.repeat(80))
          console.log('Endpoint: POST /api/parksons/directcosting')
          console.log('Request Body:')
          console.log(JSON.stringify({
            CostignParams: costingParams,
            EnquiryData: enquiryData
          }, null, 2))
          console.log('='.repeat(80) + '\n')

          const bookingResponse = await createBooking(costingParams, enquiryData)

          console.log('\n' + '='.repeat(80))
          console.log('DirectCosting Response:')
          console.log('='.repeat(80))
          console.log(JSON.stringify(bookingResponse, null, 2))
          console.log('='.repeat(80) + '\n')

          // Extract Quotation Number from response (API returns just a number like "117")
          let quotationNum = 'N/A'
          if (typeof bookingResponse === 'string' || typeof bookingResponse === 'number') {
            quotationNum = String(bookingResponse)
          } else if (bookingResponse?.data) {
            quotationNum = String(bookingResponse.data)
          } else if (bookingResponse?.QuotationNumber) {
            quotationNum = String(bookingResponse.QuotationNumber)
          } else if (bookingResponse?.data?.QuotationNumber) {
            quotationNum = String(bookingResponse.data.QuotationNumber)
          }

          if (!quotationNum || quotationNum === 'N/A') {
            throw new Error('Quotation number not received from DirectCosting API')
          }

          console.log('\n' + '='.repeat(80))
          console.log('Quotation Number Extracted: ' + quotationNum)
          console.log('='.repeat(80) + '\n')

          // Step 2: Get quotation details using quotation number
          console.log('\n' + '='.repeat(80))
          console.log('STEP 2: Getting Quotation Details')
          console.log('='.repeat(80))
          console.log('API CALL #2: GetQuotationDetail')
          console.log('Endpoint: GET /api/planwindow/getquotationDetail/' + quotationNum)
          console.log('='.repeat(80) + '\n')

          const quotationData = await getQuotationDetail(quotationNum)

          console.log('\n' + '='.repeat(80))
          console.log('GetQuotationDetail Response:')
          console.log('='.repeat(80))
          console.log(JSON.stringify(quotationData, null, 2))
          console.log('='.repeat(80) + '\n')

          setQuotationNumber(quotationNum)
          setQuotationData(quotationData)
          console.log('=== Quotation Number ===', quotationNum)
          console.log('=== Quotation Data stored in state ===')

          // Clear all cached form data
          localStorage.removeItem(LOCAL_STORAGE_KEY)
          console.log('=== Cleared cached form data ===')

          // Move to next step on success
          const newStep = currentStep + 1
          setCurrentStep(newStep)
          onStepChange?.(steps[newStep])
        } catch (e: any) {
          console.error('Create quotation failed', e)
          setPlanningError(e?.message ? String(e.message) : 'Failed to create quotation')
        } finally {
          setPlanningLoading(false)
        }
        return
      }

      // Old directcosting code (kept for reference, not used)
      if (false) {
        const dims = jobData.dimensions || {}
        const paper = jobData.paperDetails || {}

        const costingParams = {
          SizeHeight: parseFloat(dims.height) || 0,
          SizeLength: parseFloat(dims.length) || 0,
          SizeWidth: parseFloat(dims.width) || 0,
          SizeOpenflap: parseFloat(dims.openFlap) || 0,
          SizePastingflap: parseFloat(dims.pastingFlap) || 0,
          SizeBottomflap: 0,
          JobNoOfPages: 0,
          JobUps: 0,
          JobFlapHeight: 0,
          JobTongHeight: 0,
          JobFoldedH: 0,
          JobFoldedL: 0,
          PlanContentType: jobData.cartonType ? jobData.cartonType.replace(/\s+/g, '') : '',
          PlanFColor: Number(paper.frontColor) || 0,
          PlanBColor: Number(paper.backColor) || 0,
          PlanColorStrip: 0,
          PlanGripper: 0,
          PlanPrintingStyle: (() => {
            const hasFront = Number(paper.frontColor) > 0
            const hasBack = Number(paper.backColor) > 0
            if (hasFront && hasBack) return 'Choose Best'
            if (hasFront || hasBack) return 'Single Side'
            return 'Choose Best'
          })(),
          PlanWastageValue: 0,
          Trimmingleft: 0,
          Trimmingright: 0,
          Trimmingtop: 0,
          Trimmingbottom: 0,
          Stripingleft: 0,
          Stripingright: 0,
          Stripingtop: 0,
          Stripingbottom: 0,
          PlanPrintingGrain: 'Both',
          ItemPlanQuality: paper.quality || '',
          ItemPlanGsm: Number(paper.gsm) || 0,
          ItemPlanMill: '',
          PlanPlateType: 'CTP Plate',
          PlanWastageType: 'Machine Default',
          PlanContQty: Number(jobData.quantity) || 0,
          PlanSpeFColor: 0,
          PlanSpeBColor: 0,
          PlanContName: jobData.cartonType || '',
          ItemPlanFinish: '',
          OperId: '',
          JobBottomPerc: 0,
          JobPrePlan: `H:${dims.height || 0},L:${dims.length || 0},W:${dims.width || 0},OF:${dims.openFlap || 0},PF:${dims.pastingFlap || 0}`,
          ChkPlanInSpecialSizePaper: false,
          ChkPlanInStandardSizePaper: false,
          MachineId: '',
          PlanOnlineCoating: '',
          PaperTrimleft: 0,
          PaperTrimright: 0,
          PaperTrimtop: 0,
          PaperTrimbottom: 0,
          ChkPaperByClient: false,
          JobFoldInL: 1,
          JobFoldInH: 1,
          ChkPlanInAvailableStock: false,
          PlanPlateBearer: 0,
          PlanStandardARGap: 0,
          PlanStandardACGap: 0,
          PlanContDomainType: 'Offset',
          Planlabeltype: null,
          Planwindingdirection: 0,
          Planfinishedformat: null,
          Plandietype: '',
          PlanPcsPerRoll: 0,
          PlanCoreInnerDia: 0,
          PlanCoreOuterDia: 0,
          EstimationQuantityUnit: 'PCS',
          ItemPlanThickness: 0,
          SizeCenterSeal: 0,
          SizeSideSeal: 0,
          SizeTopSeal: 0,
          SizeBottomGusset: 0,
          PlanMakeReadyWastage: 0,
          CategoryID: 2,
          BookSpine: 0,
          BookHinge: 0,
          BookCoverTurnIn: 0,
          BookExtension: 0,
          BookLoops: 0,
          PlanOtherMaterialGSM: 0,
          PlanOtherMaterialGSMSettingJSON: '',
          MaterialWetGSMConfigJSON: '',
          PlanPunchingType: null,
          ChkBackToBackPastingRequired: false,
          JobAcrossUps: 0,
          JobAroundUps: 0,
          SizeBottomflapPer: 0,
          SizeZipperLength: 0,
          ZipperWeightPerMeter: 0,
          JobSizeInputUnit: 'MM',
          LedgerID: 4
        }

        // Build enquiry data - exact format matching API spec
        const enquiryData = {
          ProductCode: planningResults?.[0]?.ProductCode || '',
          LedgerID: 4,
          SalesEmployeeID: planningResults?.[0]?.SalesEmployeeID || 52,
          CategoryID: 2,
          Quantity: Number(jobData.quantity) || 0,
          ConcernPersonID: null,
          JobName: jobData.jobName || '',
          ClientName: jobData.clientName || '',
          FileName: '',
          EnquiryDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          EstimationUnit: 'PCS',
          ExpectCompletion: '10',
          Remark: planningResults?.[0]?.Remark || '',
          TypeOfJob: null,
          TypeOfPrinting: null,
          EnquiryType: 'Bid',
          SalesType: 'Export',
        }

        console.log('=== Quotation Body ===')
        console.log('CostignParams:', JSON.stringify(costingParams, null, 2))
        console.log('EnquiryData:', JSON.stringify(enquiryData, null, 2))

        try {
          setPlanningLoading(true)
          setPlanningError(null)

          const { postDirectCosting } = await import('@/lib/api-config')

          console.log('=== Calling directcosting API ===')
          const res = await postDirectCosting(costingParams, enquiryData)
          console.log('=== DirectCosting response ===', JSON.stringify(res, null, 2))

          // Extract quotation number from response - handle both object and direct number
          let quotationNum = 'N/A'
          if (typeof res === 'number') {
            quotationNum = String(res)
          } else if (res?.data?.QuotationNumber) {
            quotationNum = String(res.data.QuotationNumber)
          } else if (res?.QuotationNumber) {
            quotationNum = String(res.QuotationNumber)
          } else if (res?.data?.quotationNumber) {
            quotationNum = String(res.data.quotationNumber)
          } else if (res?.data) {
            // If data is just a number
            quotationNum = String(res.data)
          }

          setQuotationNumber(quotationNum)
          console.log('=== Quotation Number ===', quotationNum)

          // Clear all cached form data
          localStorage.removeItem(LOCAL_STORAGE_KEY)
          console.log('=== Cleared cached form data ===')

          // Move to next step on success
          const newStep = currentStep + 1
          setCurrentStep(newStep)
          onStepChange?.(steps[newStep])
        } catch (e: any) {
          console.error('DirectCosting failed', e)
          setPlanningError(e?.message ? String(e.message) : 'Failed to create quotation')
        } finally {
          setPlanningLoading(false)
        }
      } else {
        const newStep = currentStep + 1
        setCurrentStep(newStep)
        onStepChange?.(steps[newStep])
      }
    }
  }

  // Track previous step so we can trigger actions when moving between specific steps
  const prevStepRef = useRef<number>(currentStep)

  useEffect(() => {
    const prev = prevStepRef.current
    const processesIndex = steps.indexOf('Processes')
    const bestPlansIndex = steps.indexOf('Best Plans')
    // If user moved from Processes -> Best Plans, run planning/costing automatically
    if (prev === processesIndex && currentStep === bestPlansIndex) {
      // runPlanning is declared later but will be initialized before this effect runs
      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        runPlanning()
      } catch (e) {
        console.error('Failed to auto-run planning on step change', e)
      }
    }
    prevStepRef.current = currentStep
  }, [currentStep])

  // Auto-scroll step navigation to keep current step visible
  useEffect(() => {
    if (stepNavRef.current && stepRefs.current[currentStep]) {
      const navContainer = stepNavRef.current
      const currentStepElement = stepRefs.current[currentStep]

      if (currentStepElement) {
        const containerRect = navContainer.getBoundingClientRect()
        const stepRect = currentStepElement.getBoundingClientRect()

        // Calculate scroll position to center the current step
        const scrollLeft = currentStepElement.offsetLeft - (navContainer.offsetWidth / 2) + (currentStepElement.offsetWidth / 2)

        navContainer.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [currentStep])

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(steps[newStep])
    }
  }

  const handleStepClick = async (stepIndex: number) => {
    // Prevent forward navigation - only allow going back to previous steps
    if (stepIndex > currentStep) {
      showToast('Please use the Next button to proceed forward', 'warning')
      return
    }

    const processesIndex = steps.indexOf('Processes')
    const bestPlansIndex = steps.indexOf('Best Plans')

    // If user clicks directly from Processes -> Best Plans, run planning first
    if (stepIndex === bestPlansIndex && currentStep === processesIndex) {
      try {
        setPlanningError(null)
        const ok = await runPlanning()
        if (ok) {
          setCurrentStep(stepIndex)
          onStepChange?.(steps[stepIndex])
        }
      } catch (e: any) {
        console.error('Planning failed during handleStepClick navigation', e)
        setPlanningError(e?.message ? String(e.message) : 'Planning failed')
        // do not navigate
      }
      return
    }

    setCurrentStep(stepIndex)
    onStepChange?.(steps[stepIndex])
  }

  // Reusable header without back button
  const renderStepHeader = (title?: string, showAddQty: boolean = false) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {title && <h2 className="text-lg font-semibold text-[#005180]">{title}</h2>}
      </div>
      {/* Add Quantity button removed as per user request */}
      {/* {showAddQty && selectedPlan && (
        <Button
          variant="outline"
          size="sm"
          className="border-[#005180] text-[#005180] hover:bg-[#005180]/10"
          onClick={() => setShowQuantityDialog(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Quantity
        </Button>
      )} */}
    </div>
  )

  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center gap-1 py-2 bg-white">
      {steps.map((step, index) => (
        <div key={index} className="relative group">
          <button
            onClick={() => handleStepClick(index)}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer ${
              index === currentStep ? "bg-[#005180] w-8 md:w-10" : index < currentStep ? "bg-green-500" : "bg-slate-300"
            }`}
          />
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
            {step}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-slate-800"></div>
          </div>
        </div>
      ))}
    </div>
  )

  // JSON export helpers (moved here so render functions can use them)
  const getExportJson = () => {
    // deep difference: return only keys from obj that differ from base
    const deepDiff = (base: any, obj: any): any => {
      if (base === obj) return undefined
      if (typeof base !== 'object' || base === null) {
        // primitive base
        return obj === undefined ? undefined : obj
      }

      if (typeof obj !== 'object' || obj === null) {
        return obj
      }

      const out: any = Array.isArray(obj) ? [] : {}
      const keys = new Set([...Object.keys(base || {}), ...Object.keys(obj || {})])
      keys.forEach((k) => {
        const b = base ? base[k] : undefined
        const o = obj ? obj[k] : undefined
        if (Array.isArray(o)) {
          // For arrays, include only if length differs or any element differs shallowly
          const arrDiff = (b && Array.isArray(b) && b.length === o.length && o.every((v: any, i: number) => JSON.stringify(b[i]) === JSON.stringify(v))) ? undefined : o
          if (arrDiff !== undefined) out[k] = arrDiff
          return
        }

        if (typeof o === 'object' && o !== null) {
          const child = deepDiff(b, o)
          if (child !== undefined && (typeof child !== 'object' || (Object.keys(child).length > 0 || Array.isArray(child) && child.length > 0))) {
            out[k] = child
          }
        } else {
          if (o !== b && o !== undefined && o !== null && o !== '') {
            out[k] = o
          }
        }
      })

      // normalize empty objects to undefined
      if (!Array.isArray(out) && Object.keys(out).length === 0) return undefined
      if (Array.isArray(out) && out.length === 0) return undefined
      return out
    }

    const jobDelta = deepDiff(DEFAULT_JOB_DATA, jobData) || {}

    const exportObj = {
      jobData: jobDelta,
      ui: {
        currentStep,
        showQuantityDialog,
        showOnlyDifferences,
      },
      // Include categories/contents only when user explicitly selected them
      categories: selectedCategoryId ? categories : undefined,
      contents: jobData.cartonType ? contents : undefined,
      selectedCategoryId: selectedCategoryId || undefined,
      qualities: qualities.length ? qualities : undefined,
    }

    // Remove undefined values when stringifying
    return JSON.stringify(exportObj, (k, v) => (v === undefined ? undefined : v), 2)
  }

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getExportJson())
    } catch (e) {
      console.error('Clipboard write failed', e)
    }
  }

  const downloadJson = () => {
    const dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(getExportJson())
    const a = document.createElement('a')
    a.href = dataStr
    a.download = `${(jobData.jobName || 'job').replace(/\s+/g, '_')}_export.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const clearJobDetailsFields = () => {
    setJobData({
      ...jobData,
      clientName: '',
      jobName: '',
      quantity: ''
    })
  }

  const renderJobDetails = () => {
    return (
    <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 animate-fade-in max-h-[calc(100vh-200px)] overflow-y-auto">
      {renderStepHeader("Job Details", false)}

      {/* Header with clear button */}
      <div className="flex items-center justify-between py-1 sm:py-2">
        <div className="flex items-center gap-2 flex-1">
          <Package className="w-6 h-6 text-[#005180]" />
          <p className="text-slate-600 text-sm">Let's get started with your project</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearJobDetailsFields}
            className="flex items-center gap-1.5 h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Clear</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('This will clear all stored data and reset the form. Continue?')) {
                localStorage.removeItem(LOCAL_STORAGE_KEY)
                setJobData(DEFAULT_JOB_DATA)
                setCurrentStep(0)
                setEnquiryNumber(null) // Reset enquiry number
                setPlanningResults(null) // Reset planning results
                setQuotationNumber(null) // Reset quotation number
                showToast('All stored data cleared', 'success')
              }
            }}
            className="flex items-center gap-1.5 h-8 px-3 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Clear Store</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="clientName" className="text-sm font-medium text-slate-700">
            Client Name <span className="text-red-600 font-bold text-xl ml-1">*</span>
          </Label>
          <ClientDropdown
            value={jobData.clientName}
            onValueChange={(value) => setJobData({ ...jobData, clientName: value })}
          />
        </div>

        {[
          { key: "jobName", label: "Job Name" },
          { key: "quantity", label: "Quantity" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={key} className="text-sm font-medium text-slate-700">
              {label} <span className="text-red-600 font-bold text-xl ml-1">*</span>
            </Label>
            <Input
              id={key}
              value={jobData[key as keyof JobData] as string}
              onChange={(e) => setJobData({ ...jobData, [key]: e.target.value })}
              className="h-10 border border-slate-300 focus:border-[#005180] transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
    )
  }

  const renderCartonType = () => {
    const selectedCategory = categories.find((c: any) => String(c.id) === String(selectedCategoryId))
    const selectedCategoryName = selectedCategory?.name || "Select Category"

    // Filter categories and contents based on search
    const filteredCategories = categories.filter((category: any) => {
      const categoryName = category.name || category.raw?.CategoryName || category.raw?.ContentName || ""
      return categoryName.toLowerCase().includes(categorySearch.toLowerCase())
    })

    const filteredContents = contents.filter(content =>
      content.ContentName?.toLowerCase().includes(contentSearch.toLowerCase()) ||
      content.ContentDomainType?.toLowerCase().includes(contentSearch.toLowerCase())
    )

    return (
      <div className="p-2 sm:p-3 space-y-3 animate-fade-in max-h-[calc(100vh-200px)] overflow-y-auto">
        {renderStepHeader("Category & Carton Type", false)}
        <div className="text-center py-2">
          <p className="text-slate-600 text-sm">First select category, then choose the perfect box style</p>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 text-lg">1. Select Category <span className="text-red-500 font-bold text-lg ml-1">*</span></Label>
          <Select
            value={selectedCategoryId || ""}
            onValueChange={(value) => {
              if (value) {
                setSelectedCategoryId(value)
                fetchContents(value)
              }
            }}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {categories.map((category: any) => {
                const raw = category.raw ?? category
                const resolvedId =
                  category.id ??
                  raw?.CategoryID ??
                  raw?.CategoryId ??
                  raw?.categoryID ??
                  raw?.ContentID ??
                  raw?.contentID ??
                  raw?.Id ??
                  raw?.id

                const categoryId = resolvedId !== undefined && resolvedId !== null ? String(resolvedId) : undefined
                const categoryName = category.name ?? raw?.CategoryName ?? raw?.ContentName ?? raw?.name ?? `Category`

                return (
                  <SelectItem key={categoryId ?? Math.random()} value={categoryId || ""}>
                    {categoryName}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Content Search */}
        {contents.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search content items..."
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        )}

        {loadingContents ? (
          <div className="flex justify-center items-center py-8">
            <svg className="w-8 h-8 animate-spin text-[#005180]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        ) : (
          <>
            {filteredContents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {contentSearch ? "No results found" : selectedCategoryId ? "No content available for this category" : "Please select a category"}
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 text-lg">
                  2. Select Carton Type <span className="text-red-500 font-bold text-lg ml-1">*</span> {contentSearch && `(${filteredContents.length} results)`}
                </Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredContents.map((content) => (
                    <Card
                      key={content.ContentID}
                      className={`w-full p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        jobData.cartonType === content.ContentName
                          ? "border-2 border-[#005180] bg-[#005180]/10 shadow-md"
                          : "border border-slate-200 hover:border-[#005180]"
                      }`}
                      onClick={async () => {
                          // set carton type immediately
                          setJobData({ ...jobData, cartonType: content.ContentName })

                          try {
                            // load qualities for this content type and auto-fill paper details from API (first quality)
                            const fetched = await loadQualitiesForSelection(content.ContentName)
                            if (Array.isArray(fetched) && fetched.length > 0) {
                              const firstQ = fetched[0]
                              setJobData((prev) => ({ ...prev, paperDetails: { ...prev.paperDetails, quality: firstQ.Quality ?? String(firstQ.QualityID ?? ''), qualityId: firstQ.QualityID ?? firstQ.Quality ?? '' } }))
                            }
                          } catch (e) {
                          }

                          setTimeout(() => {
                            nextStep()
                          }, 300)
                        }}
                    >
                      <div className="space-y-2 sm:space-y-3 min-w-0">
                        <div className="relative">
                          <div className="w-full h-24 sm:h-32 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                            <img
                              src={getContentImagePath(content.ContentName)}
                              alt={content.ContentName}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                // Fallback to default image if content image doesn't exist
                                const target = e.target as HTMLImageElement
                                target.src = '/images/default.png'
                              }}
                            />
                          </div>
                          {jobData.cartonType === content.ContentName && (
                            <CheckCircle2 className="absolute top-2 right-2 text-[#78BE20] w-5 h-5 flex-shrink-0 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 mb-1 sm:mb-2 break-words">
                            {content.ContentName}
                          </h3>
                          <div className="space-y-1 min-w-0">
                            {content.ContentDomainType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 truncate max-w-full">
                                {content.ContentDomainType}
                              </span>
                            )}
                            {content.ContentL && content.ContentH && (
                              <div className="text-xs text-slate-500 mt-1 truncate">
                                📏 {content.ContentL} × {content.ContentH}
                                {content.ContentW && ` × ${content.ContentW}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
    </div>
    )
  }

  const renderSize = () => (
    <div className="p-2 sm:p-3 space-y-3 animate-fade-in max-h-[calc(100vh-200px)] overflow-y-auto">
      {renderStepHeader("Box Size (mm)", false)}

      <div className="space-y-3">
        {
          // Determine selected content from contents array
        }
        {(() => {
          const selected = contents.find((c: any) => String(c.ContentID) === String(jobData.cartonType) || String(c.ContentName) === String(jobData.cartonType) || String(c.ContentID) === String(selectedCategoryId))
          // Fallback: if a content is selected by name in jobData.cartonType, try to find it
          const content = selected ?? contents[0]

          const sizesCsv = content?.ContentSizes ?? content?.ContentSize ?? ''
          // sizesCsv example: "SizeHeight,SizeLength,SizeWidth,SizeOpenflap,SizePastingflap,SizeBottomflap,SizeBottomflapPer"
          const fields = sizesCsv ? sizesCsv.split(',').map((s: string) => s.trim()) : [
            'SizeHeight', 'SizeLength', 'SizeWidth', 'SizeOpenflap', 'SizePastingflap'
          ]

          const mapField = (f: string) => {
            const fname = f.toLowerCase()
            if (fname.includes('height')) return { key: 'height', label: 'Height', icon: '📏' }
            if (fname.includes('length')) return { key: 'length', label: 'Length', icon: '📐' }
            if (fname.includes('width')) return { key: 'width', label: 'Width', icon: '📏' }
            if (fname.includes('open')) return { key: 'openFlap', label: 'Open Flap', icon: '📋' }
            if (fname.includes('pasting')) return { key: 'pastingFlap', label: 'Pasting Flap', icon: '📋' }
            if (fname.includes('bottomflapper') || fname.includes('bottomflapper')) return { key: 'bottomFlapPer', label: 'Bottom Flap %', icon: '📐' }
            if (fname.includes('bottomflap') || fname.includes('bottom_flap')) return { key: 'bottomFlap', label: 'Bottom Flap', icon: '📐' }
            return { key: f, label: f, icon: '📏' }
          }

          // Group fields: LWH in one row, OP/PF in another row, rest individually
          const lwh = ['length', 'width', 'height']
          const flaps = ['openFlap', 'pastingFlap']

          const lwhFields = fields.filter((f: string) => {
            const { key } = mapField(f)
            return lwh.includes(key)
          })

          const flapFields = fields.filter((f: string) => {
            const { key } = mapField(f)
            return flaps.includes(key)
          })

          const otherFields = fields.filter((f: string) => {
            const { key } = mapField(f)
            return !lwh.includes(key) && !flaps.includes(key)
          })

          return (
            <>
              {/* Length, Width, Height in one row */}
              {lwhFields.length > 0 && (
                <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-3 border border-slate-200">
                  {lwhFields.map((f: string) => {
                    const { key, label } = mapField(f)
                    return (
                      <div key={f} className="flex flex-col gap-1">
                        <Label className="text-sm font-medium text-slate-700">
                          {label} <span className="text-red-500 font-bold text-lg ml-1">*</span>
                        </Label>
                        <Input
                          value={String((jobData.dimensions as any)[key] ?? '')}
                          onChange={(e) =>
                            setJobData({
                              ...jobData,
                              dimensions: { ...(jobData.dimensions as any), [key]: e.target.value },
                            })
                          }
                          className="h-8 border-slate-300 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Open Flap and Pasting Flap in one row */}
              {flapFields.length > 0 && (
                <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-3 border border-slate-200">
                  {flapFields.map((f: string) => {
                    const { key, label } = mapField(f)
                    return (
                      <div key={f} className="flex flex-col gap-1">
                        <Label className="text-sm font-medium text-slate-700">
                          {label} <span className="text-red-500 font-bold text-lg ml-1">*</span>
                        </Label>
                        <Input
                          value={String((jobData.dimensions as any)[key] ?? '')}
                          onChange={(e) =>
                            setJobData({
                              ...jobData,
                              dimensions: { ...(jobData.dimensions as any), [key]: e.target.value },
                            })
                          }
                          className="h-8 border-slate-300 focus:border-blue-400 transition-colors"
                        />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Other fields individually */}
              {otherFields.map((f: string) => {
                const { key, label, icon } = mapField(f)
                return (
                  <div key={f} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200">
                    <div className="text-lg">{icon}</div>
                    <Label className="w-28 text-sm font-medium text-slate-700">{label} <span className="text-red-500 font-bold text-lg ml-1">*</span></Label>
                    <Input
                      value={String((jobData.dimensions as any)[key] ?? '')}
                      onChange={(e) =>
                        setJobData({
                          ...jobData,
                          dimensions: { ...(jobData.dimensions as any), [key]: e.target.value },
                        })
                      }
                      className="flex-1 h-8 border-slate-300 focus:border-blue-400 transition-colors"
                      placeholder="0"
                    />
                    <span className="text-xs text-slate-500 w-6">{jobData.dimensions.unit}</span>
                  </div>
                )
              })}
            </>
          )
        })()}
      </div>

      <Card className="p-4 bg-white border border-slate-200" data-trimming>
        <Label className="text-sm font-medium text-slate-700 mb-3 block">Trimming:</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "top", label: "Top (T)" },
            { key: "bottom", label: "Bottom (B)" },
            { key: "left", label: "Left (L)" },
            { key: "right", label: "Right (R)" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-slate-600">{label}</Label>
              <Input
                value={jobData.dimensions.trimming[key as keyof typeof jobData.dimensions.trimming]}
                onChange={(e) =>
                  setJobData({
                    ...jobData,
                    dimensions: {
                      ...jobData.dimensions,
                      trimming: {
                        ...jobData.dimensions.trimming,
                        [key]: e.target.value,
                      },
                    },
                  })
                }
                className="h-8 border-slate-300 focus:border-blue-400 transition-colors"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </Card>

    </div>
  )

  const renderPaperDetails = () => (
    <div className="p-2 sm:p-3 space-y-3 animate-fade-in max-h-[calc(100vh-200px)] overflow-y-auto">
      {renderStepHeader("Paper & Color Details", false)}
      <div className="text-center py-2">
        <p className="text-slate-600 text-sm">Choose your specifications</p>
      </div>

      <div className="space-y-4">
        {/* Paper Quality and GSM in first row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Quality <span className="text-red-500 font-bold text-lg ml-1">*</span></Label>
            <Select
              value={String(jobData.paperDetails.qualityId ?? jobData.paperDetails.quality)}
              onValueChange={(value) => {
                // try to find selected quality by ID or name
                const matched = qualities.find((q) => String(q.QualityID) === String(value) || String(q.Quality) === String(value))
                if (matched) {
                  setJobData({
                    ...jobData,
                    paperDetails: { ...jobData.paperDetails, quality: matched.Quality ?? String(value), qualityId: matched.QualityID ?? String(value) },
                  })
                } else {
                  setJobData({ ...jobData, paperDetails: { ...jobData.paperDetails, quality: String(value), qualityId: value } })
                }
              }}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {qualities && qualities.length > 0 ? (
                  qualities.map((q) => {
                    const qualityValue = String(q.QualityID ?? q.Quality ?? '')
                    // Skip if empty or invalid
                    if (!qualityValue || qualityValue === '' || qualityValue === 'undefined' || qualityValue === 'null') {
                      return null
                    }
                    return (
                      <SelectItem
                        key={String(q.QualityID ?? q.Quality ?? Math.random())}
                        value={qualityValue}
                        className="truncate max-w-[250px]"
                        title={q.Quality ?? `Quality ${q.QualityID}`}
                      >
                        <span className="truncate block">{q.Quality ?? `Quality ${q.QualityID}`}</span>
                      </SelectItem>
                    )
                  }).filter(Boolean)
                ) : (
                  <>
                    <SelectItem value="Art Paper">Art Paper</SelectItem>
                    <SelectItem value="Duplex Board">Duplex Board</SelectItem>
                    <SelectItem value="Kraft Paper">Kraft Paper</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <div className="mt-2 text-xs text-red-600">
              {qualitiesError && (
                <div className="flex items-center justify-between">
                  <div>{qualitiesError}</div>
                  <Button size="sm" variant="ghost" onClick={() => loadQualitiesForSelection(lastQualitiesContentType ?? undefined)}>
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">GSM <span className="text-red-500 font-bold text-lg ml-1">*</span></Label>
            <div className="flex items-center gap-2">
              <Select
                value={String(jobData.paperDetails.gsm ?? '')}
                onValueChange={(value) => setJobData({ ...jobData, paperDetails: { ...jobData.paperDetails, gsm: String(value) } })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {loadingGsm ? (
                    <SelectItem value="__loading" disabled>Loading...</SelectItem>
                  ) : gsms && gsms.length > 0 ? (
                    gsms.map((g) => {
                      const gsmValue = String(g.GSM ?? g.GSMID ?? '')
                      // Skip if empty or invalid
                      if (!gsmValue || gsmValue === '' || gsmValue === 'undefined' || gsmValue === 'null') {
                        return null
                      }
                      return (
                        <SelectItem key={String(g.GSMID ?? g.GSM ?? Math.random())} value={gsmValue} className="truncate" title={g.GSM ?? `GSM ${g.GSMID}`}>
                          <span className="truncate block">{g.GSM ?? `GSM ${g.GSMID}`}</span>
                        </SelectItem>
                      )
                    }).filter(Boolean)
                  ) : (
                    <>
                      <SelectItem value="130">130</SelectItem>
                      <SelectItem value="170">170</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <div className="text-xs text-red-600">
                {gsmError && (
                  <div className="flex items-center gap-2">
                    <div>{gsmError}</div>
                    <Button size="sm" variant="ghost" onClick={() => loadGsmForSelection()}>
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mill and Finish in second row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Mill</Label>
            <div className="flex items-center gap-2">
              <Select
                value={String(jobData.paperDetails.mill ?? '')}
                onValueChange={(value) =>
                  setJobData({ ...jobData, paperDetails: { ...jobData.paperDetails, mill: String(value) } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {loadingMill ? (
                    <SelectItem value="__loading" disabled>Loading...</SelectItem>
                  ) : mills && mills.length > 0 ? (
                    mills.map((m) => {
                      const millValue = String(m.Mill ?? m.MillID ?? '')
                      // Skip if empty or invalid
                      if (!millValue || millValue === '' || millValue === 'undefined' || millValue === 'null') {
                        return null
                      }
                      return (
                        <SelectItem key={String(m.MillID ?? m.Mill ?? Math.random())} value={millValue} className="truncate" title={m.Mill ?? `Mill ${m.MillID}`}>
                          <span className="truncate block">{m.Mill ?? `Mill ${m.MillID}`}</span>
                        </SelectItem>
                      )
                    }).filter(Boolean)
                  ) : (
                    <>
                      <SelectItem value="Ballapur">Ballapur</SelectItem>
                      <SelectItem value="JK Paper">JK Paper</SelectItem>
                      <SelectItem value="West Coast">West Coast</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <div className="text-xs text-red-600">
                {millError && (
                  <div className="flex items-center gap-2">
                    <div>{millError}</div>
                    <Button size="sm" variant="ghost" onClick={() => loadMillForSelection()}>
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Finish</Label>
            <div className="flex items-center gap-2">
              <Select
                value={jobData.paperDetails.finish}
                onValueChange={(value) =>
                  setJobData({ ...jobData, paperDetails: { ...jobData.paperDetails, finish: value } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select finish" className="truncate" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {loadingFinish ? (
                    <SelectItem value="__loading" disabled>Loading...</SelectItem>
                  ) : finishes && finishes.length > 0 ? (
                    finishes.map((f) => {
                      const finishValue = String(f.Finish ?? f.FinishID ?? '')
                      // Skip if empty or invalid
                      if (!finishValue || finishValue === '' || finishValue === 'undefined' || finishValue === 'null') {
                        return null
                      }
                      return (
                        <SelectItem key={String(f.FinishID ?? f.Finish ?? Math.random())} value={finishValue} className="truncate" title={f.Finish ?? `Finish ${f.FinishID}`}>
                          <span className="truncate block">{f.Finish ?? `Finish ${f.FinishID}`}</span>
                        </SelectItem>
                      )
                    }).filter(Boolean)
                  ) : (
                    <>
                      <SelectItem value="Coated">Coated</SelectItem>
                      <SelectItem value="Uncoated">Uncoated</SelectItem>
                      <SelectItem value="Matt">Matt</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <div className="text-xs text-red-600">
                {finishError && (
                  <div className="flex items-center gap-2">
                    <div>{finishError}</div>
                    <Button size="sm" variant="ghost" onClick={() => loadFinishForSelection()}>
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grain Direction */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <Label className="text-sm font-medium text-slate-700 mb-3 block">Grain Direction</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Both', value: 'both' },
              { label: 'With Grain', value: 'along' },
              { label: 'Across Grain', value: 'across' },
            ].map((d) => (
              <Button
                key={d.value}
                variant={jobData.grainDirection === d.value ? 'default' : 'outline'}
                onClick={() => setJobData({ ...jobData, grainDirection: d.value as 'along' | 'across' | 'both' })}
                className={`h-10 text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  jobData.grainDirection === d.value ? 'bg-[#005180] text-white' : 'border border-slate-300 hover:border-[#005180]'
                }`}
              >
                {d.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Color Details Section */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[#005180] mb-3">Color Details</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "frontColor", label: "Front Color" },
              { key: "backColor", label: "Back Color" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">{label}</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="0"
                  value={String(jobData.paperDetails[key as keyof typeof jobData.paperDetails] ?? '')}
                  onChange={(e) =>
                    setJobData({ ...jobData, paperDetails: { ...jobData.paperDetails, [key]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "specialFrontColor", label: "SP. Front Color" },
              { key: "specialBackColor", label: "SP. Back Color" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">{label}</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="0"
                  value={String(jobData.paperDetails[key as keyof typeof jobData.paperDetails] ?? '')}
                  onChange={(e) =>
                    setJobData({ ...jobData, paperDetails: { ...jobData.paperDetails, [key]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )

  const renderProcesses = () => {
    // Filter operations based on search
    const filteredOperations = operations.filter((op: any) => {
      const name = op.DisplayProcessName ?? op.ProcessName ?? String(op)
      const operId = String(op.ProcessID ?? op.ProcessId ?? '')
      return name.toLowerCase().includes(processSearch.toLowerCase()) ||
             operId.toLowerCase().includes(processSearch.toLowerCase())
    })

    // Filter fallback list
    const fallbackProcesses = [
      "Printing",
      "Lamination- Matt",
      "Lamination- Gloss",
      "Die Cutting",
      "Stripping / Blanking",
      "Folding & Gluing",
    ]
    const filteredFallback = fallbackProcesses.filter(process =>
      process.toLowerCase().includes(processSearch.toLowerCase())
    )

    return (
      <div className="p-2 sm:p-3 space-y-3 animate-fade-in max-h-[calc(100vh-200px)] overflow-y-auto">
        {renderStepHeader("Printing Processes", false)}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search processes..."
            value={processSearch}
            onChange={(e) => setProcessSearch(e.target.value)}
            className="pl-10 h-10 border border-slate-300 focus:border-blue-400 transition-all"
          />
        </div>

        <div className="space-y-2">
          {loadingOperations ? (
            <div className="flex items-center justify-center py-6">
              <svg className="w-6 h-6 animate-spin text-[#005180]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          ) : operationsError ? (
            <div className="text-sm text-red-600">
              <div className="flex items-center justify-between">
                <div>{operationsError}</div>
                <Button size="sm" variant="ghost" onClick={() => loadOperationsForDomain()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (operations && operations.length > 0 ? (
            filteredOperations.length > 0 ? (
              filteredOperations.map((op: any) => {
            const name = op.DisplayProcessName ?? op.ProcessName ?? String(op)
            const operId = String(op.ProcessID ?? op.ProcessId ?? '')
            const key = operId || name
            const isSelected = jobData.processes.some(p => p.operID === operId || p.processName === name)

            const typeOfCharge = op.TypeofCharges || op.TypeOfCharges || 'N/A'
            const rate = op.Rate || op.OperRate || '—'

            return (
              <div key={key} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 min-w-0 shadow-sm">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Checkbox
                    id={key}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setJobData({
                          ...jobData,
                          processes: [...jobData.processes, { operID: operId, processName: name }]
                        })
                      } else {
                        setJobData({
                          ...jobData,
                          processes: jobData.processes.filter((p) => p.operID !== operId && p.processName !== name)
                        })
                      }
                    }}
                    className="flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <Label htmlFor={key} className="text-sm font-semibold text-slate-800 truncate cursor-pointer" title={name}>{name}</Label>
                    <div className="flex gap-3 text-xs mt-1.5">
                      <span className="truncate text-blue-700 font-medium" title={typeOfCharge}>{typeOfCharge}</span>
                      <span className="truncate text-emerald-700 font-medium" title={`Rate: ${rate}`}>Rate: {rate}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-sm text-slate-500 text-center py-4">
            No processes match "{processSearch}"
          </div>
        )
        ) : (
          filteredFallback.length > 0 ? (
            filteredFallback.map((process) => {
              const isSelected = jobData.processes.some(p => p.processName === process)
              return (
                <div
                  key={process}
                  className="flex items-center justify-between py-3 px-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={process}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setJobData({
                            ...jobData,
                            processes: [...jobData.processes, { operID: '', processName: process }]
                          })
                        } else {
                          setJobData({
                            ...jobData,
                            processes: jobData.processes.filter((p) => p.processName !== process)
                          })
                        }
                      }}
                    />
                    <Label htmlFor={process} className="text-sm font-medium text-slate-700">
                      {process}
                    </Label>
                  </div>
                  {isSelected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobData({
                        ...jobData,
                        processes: jobData.processes.filter((p) => p.processName !== process)
                      })}
                      className="h-6 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-sm text-slate-500 text-center py-4">
              No processes match "{processSearch}"
            </div>
          )
        )
      )}
        </div>
      </div>
    )
  }



  const renderBestPlans = () => {
    // Apply filters to planning results
    const filteredResults = planningResults ? planningResults.filter((plan: any) => {
      const unitCost = plan.UnitPrice || plan.TotalPlanCost || 0
      const ups = plan.TotalUps || plan.Ups || 0

      const matchesUnitCost = filterUnitCost === "" || unitCost <= parseFloat(filterUnitCost)
      const matchesUps = filterUps === "" || ups >= parseFloat(filterUps)

      return matchesUnitCost && matchesUps
    }) : null

    // Structured rendering to avoid nested ternaries and JSX parsing issues
    const header = (
      <div className="text-center py-2">
        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
        <p className="text-slate-600 text-sm">Optimized cost solutions</p>
      </div>
    )

    const controlRow = (
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => runPlanning()} disabled={planningLoading}>
              {planningLoading ? 'Running...' : 'Run Planning'}
            </Button>
        </div>
      </div>
    )

    const errorNode = planningError ? <div className="text-sm text-red-600">{planningError}</div> : null

    const spinner = (
      <div className="flex items-center justify-center py-6">
        <svg className="w-6 h-6 animate-spin text-[#005180]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
    )

    const resultsNode = filteredResults && filteredResults.length > 0 ? (
      <div className="space-y-2">
        {filteredResults.map((p: any, idx: number) => {
          const unitCost = p.UnitPrice || p.TotalPlanCost || 0
          const quantity = Number(jobData.quantity) || 1000
          const totalCost = unitCost * quantity

          // Create unique identifier by combining multiple properties
          // This ensures each plan combination is unique even if they have same machine
          const planId = JSON.stringify({
            machine: p.MachineID || p.MachineId || p.MachineName,
            paperSize: p.PaperSize || p.SheetSize,
            ups: p.TotalUps || p.Ups,
            unitCost: unitCost,
            idx: idx
          })

          const selectedId = selectedPlan ? JSON.stringify({
            machine: selectedPlan.MachineID || selectedPlan.MachineId || selectedPlan.MachineName,
            paperSize: selectedPlan.PaperSize || selectedPlan.SheetSize,
            ups: selectedPlan.TotalUps || selectedPlan.Ups,
            unitCost: (selectedPlan.UnitPrice || selectedPlan.TotalPlanCost || 0),
            idx: filteredResults.findIndex((fp: any) => fp === selectedPlan)
          }) : null

          const isSelected = selectedId === planId

          return (
            <Card
              key={p.MachineID ?? p.MachineName ?? idx}
              className={`p-4 border-2 cursor-pointer transition-all ${
                isSelected ? 'border-[#005180] bg-[#005180]/10' : 'border-slate-200 hover:border-[#005180]'
              }`}
              onClick={() => setSelectedPlan(p)}
            >
              <div className="space-y-3 min-w-0">
                {/* Header with selection and machine name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-[#005180] bg-[#005180] shadow-md' : 'border-slate-400 bg-white'
                  }`}>
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className={`text-base font-semibold truncate ${isSelected ? 'text-[#004875]' : 'text-slate-800'}`} title={p.MachineName ?? p.MachineID ?? `Plan ${idx + 1}`}>
                      {p.MachineName ?? p.MachineID ?? `Plan ${idx + 1}`}
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-[#005180] text-white rounded-full flex-shrink-0">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-slate-500">Unit Price</div>
                    <div className={`text-lg font-bold ${isSelected ? 'text-[#004875]' : 'text-[#005180]'}`}>
                      ₹ {unitCost.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Paper Size:</span>
                    <span className="font-medium text-slate-800">{p.PaperSize || p.SheetSize || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cut Size:</span>
                    <span className="font-medium text-slate-800">{p.CutSize || p.JobSize || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">UPS:</span>
                    <span className="font-medium text-slate-800">{p.TotalUps ?? p.Ups ?? '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Print Cost:</span>
                    <span className="font-medium text-slate-800">₹ {p.PrintCost || p.PrintingCost || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Wastage:</span>
                    <span className="font-medium text-slate-800">{p.Wastage || p.WastagePerc || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Paper Weight:</span>
                    <span className="font-medium text-slate-800">{p.PaperWeight || p.PaperGSM || '-'}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-slate-600">Paper Amount:</span>
                    <span className="font-medium text-slate-800">₹ {p.PaperAmount || p.PaperCost || 0}</span>
                  </div>
                </div>

                {/* Total calculation */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Total Cost ({quantity} units)</span>
                    <span className="text-sm font-semibold text-green-600">₹ {totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    ) : planningResults && planningResults.length > 0 ? (
      <div className="text-sm text-slate-500 text-center py-4">
        No plans match the current filters. Try adjusting the filter values.
      </div>
    ) : null

    const emptyStateNode = (
      <Card className="p-8 text-center border-2 border-dashed border-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 mb-1">No Plans Available</h3>
            <p className="text-sm text-slate-500">Click "Run Planning" to generate cost plans</p>
          </div>
        </div>
      </Card>
    )

    // Display actual plans with costings
    const plansDisplay = planningResults && planningResults.length > 0 ? (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600 mb-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Select a plan to create quotation</span>
        </div>

        {planningResults.map((plan: any, index: number) => {
          const unitPrice = plan.UnitPrice || plan.unitPrice || 0
          const totalAmount = plan.TotalAmount || plan.totalAmount || 0
          const finalQuantity = plan.FinalQuantity || plan.finalQuantity || Number(jobData.quantity) || 0
          const machineName = plan.MachineName || plan.MachineType || 'N/A'
          const ups = plan.NoOfSets || plan.TotalUps || 0
          const printingStyle = plan.PrintingStyle || 'N/A'

          // Check if this plan is selected
          const isSelected = selectedPlan === plan

          return (
            <Card
              key={index}
              className={`p-4 transition-all cursor-pointer border-2 ${
                isSelected
                  ? 'border-[#005180] bg-[#005180]/5 shadow-lg'
                  : 'border-slate-200 hover:border-[#005180] hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedPlan(plan)
                console.log('=== Plan selected ===', plan)
              }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-[#005180] bg-[#005180]' : 'border-slate-400'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Plan {index + 1}</div>
                      <div className="text-sm text-slate-600">{machineName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#005180]">₹{unitPrice.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">per unit</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Quantity</div>
                    <div className="font-semibold text-slate-800">{finalQuantity.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">UPS</div>
                    <div className="font-semibold text-slate-800">{ups}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Printing Style</div>
                    <div className="font-semibold text-slate-800">{printingStyle}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total Amount</div>
                    <div className="font-semibold text-green-600">₹{totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Additional Info */}
                {plan.GrantAmount && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Grant Amount</span>
                      <span className="font-semibold text-slate-800">₹{plan.GrantAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    ) : null

    return (
      <div className="p-2 sm:p-3 space-y-3 animate-fade-in max-h-[calc(100vh-200px)] overflow-y-auto">
        {renderStepHeader("Best Plans", true)}
        {plansDisplay}
        {errorNode}
        {planningLoading && spinner}
      </div>
    )
  }

  // Planning: state and runner
  const [planningResults, setPlanningResults] = useState<any[] | null>(null)
  const [planningLoading, setPlanningLoading] = useState(false)
  const [planningError, setPlanningError] = useState<string | null>(null)
  const [quotationNumber, setQuotationNumber] = useState<string | null>(null)
  const [quotationData, setQuotationData] = useState<any | null>(null)
  const [enquiryNumber, setEnquiryNumber] = useState<string | null>(null) // Track SaveMultipleEnquiry response
  const quotationPrintRef = useRef<HTMLDivElement>(null)

  // Print handler using ref directly
  const reactToPrintFn = useReactToPrint({
    contentRef: quotationPrintRef,
  })

  const handlePrint = useCallback(() => {
    console.log('handlePrint called, quotationPrintRef.current:', quotationPrintRef.current)
    if (!quotationPrintRef.current) {
      console.error('Cannot print: quotationPrintRef is null')
      showToast('Unable to print. Please try again.', 'error')
      return
    }
    reactToPrintFn()
  }, [reactToPrintFn, showToast])

  const [filterUnitCost, setFilterUnitCost] = useState<string>("")
  const [filterUps, setFilterUps] = useState<string>("")
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)
  // Explicitly chosen OperId by user (preferred over name-match resolution)
  const [selectedOperId, setSelectedOperId] = useState<string>('')

  // Resolve OperId(s) for payload. If user explicitly picked `selectedOperId`, prefer that.
  // Otherwise, extract OperIDs from the processes array (which now stores {operID, processName} objects).
  // If multiple processes are selected, return a comma-separated list of OperIDs.
  const resolveOperIdFromProcesses = (jd: JobData) => {
    // prefer explicit selection
    if (selectedOperId && String(selectedOperId).trim()) {
      return String(selectedOperId).trim()
    }

    const procs = Array.isArray(jd.processes) ? jd.processes : []
    if (procs.length === 0) return ''

    // Extract OperIDs from process objects
    const ids: string[] = []
    procs.forEach((p) => {
      if (p && p.operID && String(p.operID).trim()) {
        ids.push(String(p.operID).trim())
      }
    })

    // Deduplicate and join with commas
    const unique = Array.from(new Set(ids.filter(Boolean)))
    return unique.join(',')
  }

  // Get comma-separated process names for display/logging
  const getProcessNames = (jd: JobData) => {
    const procs = Array.isArray(jd.processes) ? jd.processes : []
    if (procs.length === 0) return ''
    return procs.map(p => p.processName).filter(Boolean).join(', ')
  }

  // Build a full raw payload (all fields with safe defaults) - EXACT API FORMAT
  const buildRawShirinPayload = (jd: JobData) => {
    const dims = jd.dimensions || {}
    const pd = jd.paperDetails || {}

    // Determine domain type from content
    const selectedContent = contents.find((c: any) =>
      String(c.ContentName) === String(jd.cartonType) ||
      String(c.ContentID) === String(jd.cartonType)
    )
    const domainType = selectedContent?.ContentDomainType || 'Offset'

    const payload = {
      // Size dimensions - USER PROVIDED
      SizeHeight: Number(dims.height) || 0,
      SizeLength: Number(dims.length) || 0,
      SizeWidth: Number(dims.width) || 0,
      SizeOpenflap: Number(dims.openFlap) || 0,
      SizePastingflap: Number(dims.pastingFlap) || 0,
      SizeBottomflap: Number(dims.bottomFlap) || 0,

      // Job specs - DEFAULTS (not used in current UI)
      JobNoOfPages: 0,
      JobUps: 0,
      JobFlapHeight: 0,
      JobTongHeight: 0,
      JobFoldedH: 0,
      JobFoldedL: 0,

      // Content & printing details - USER PROVIDED
      PlanContentType: jd.cartonType || '',
      PlanFColor: Number(pd.frontColor) || 0,
      PlanBColor: Number(pd.backColor) || 0,
      PlanSpeFColor: Number(pd.specialFrontColor) || 0,
      PlanSpeBColor: Number(pd.specialBackColor) || 0,
      PlanColorStrip: 0,  // DEFAULT - not in UI
      PlanGripper: 0,     // DEFAULT - not in UI
      // PlanPrintingStyle logic: "Single Side" if only front OR back, "Choose Best" if both
      PlanPrintingStyle: (() => {
        const hasFront = Number(pd.frontColor) > 0
        const hasBack = Number(pd.backColor) > 0
        if (hasFront && hasBack) return 'Choose Best'
        if (hasFront || hasBack) return 'Single Side'
        return pd.printingStyle || 'Choose Best'
      })(),
      PlanWastageValue: Number(jd.wastage) || 5,             // USER PROVIDED or default 5

      // Trimming - USER PROVIDED
      Trimmingleft: Number(dims.trimming?.left) || 0,
      Trimmingright: Number(dims.trimming?.right) || 0,
      Trimmingtop: Number(dims.trimming?.top) || 0,
      Trimmingbottom: Number(dims.trimming?.bottom) || 0,

      // Stripping - DEFAULTS (not in UI)
      Stripingleft: 0,
      Stripingright: 0,
      Stripingtop: 0,
      Stripingbottom: 0,

      // Grain direction - USER PROVIDED
      // Options: "Both", "With Grain", "Across Grain"
      PlanPrintingGrain: jd.grainDirection === 'along' ? 'With Grain' :
                         jd.grainDirection === 'across' ? 'Across Grain' : 'Both',

      // Material details - USER PROVIDED
      ItemPlanQuality: pd.quality || '',
      ItemPlanGsm: Number(pd.gsm) || 0,
      ItemPlanMill: pd.mill || '-',
      PlanPlateType: 'CTP Plate',  // DEFAULT
      PlanWastageType: 'Percentage',  // DEFAULT
      PlanContQty: Number(jd.quantity) || 1000,  // USER PROVIDED or default
      PlanContName: jd.cartonType || '',
      ItemPlanFinish: pd.finish || '',

      // Operations - USER PROVIDED (resolved from processes)
      OperId: '',  // Will be set from resolveOperIdFromProcesses

      // Job bottom percentage - DEFAULT
      JobBottomPerc: 0,

      // Pre-plan string - GENERATED from user dimensions
      JobPrePlan: `H:${dims.height || 0},L:${dims.length || 0},W:${dims.width || 0},OF:${dims.openFlap || 0},PF:${dims.pastingFlap || 0}`,

      // Paper size preferences - DEFAULTS
      ChkPlanInSpecialSizePaper: pd.specialSize ?? true,
      ChkPlanInStandardSizePaper: false,

      // Machine - USER PROVIDED
      MachineId: String(jd.machineId || jd.machine || ''),

      // Online coating - DEFAULT
      PlanOnlineCoating: '',

      // Paper trim (same as trimming) - USER PROVIDED
      PaperTrimleft: Number(dims.trimming?.left) || 0,
      PaperTrimright: Number(dims.trimming?.right) || 0,
      PaperTrimtop: Number(dims.trimming?.top) || 0,
      PaperTrimbottom: Number(dims.trimming?.bottom) || 0,

      // Paper by client flag - DEFAULT
      ChkPaperByClient: false,

      // Folding - DEFAULTS (not in UI)
      JobFoldInL: 1,
      JobFoldInH: 1,

      // Stock check - DEFAULT
      ChkPlanInAvailableStock: false,

      // Plate & gap settings - DEFAULTS
      PlanPlateBearer: 0,
      PlanStandardARGap: 0,
      PlanStandardACGap: 0,

      // Domain type - DERIVED from content
      PlanContDomainType: domainType,

      // Label & flexo specific - DEFAULTS (not used in offset)
      Planlabeltype: null,
      Planwindingdirection: 0,
      Planfinishedformat: null,
      Plandietype: '',
      PlanPcsPerRoll: 0,
      PlanCoreInnerDia: 0,
      PlanCoreOuterDia: 0,

      // Quantity unit - DEFAULT
      EstimationQuantityUnit: 'PCS',

      // Thickness - USER PROVIDED or default
      ItemPlanThickness: 0,

      // Pouch/bag specific - DEFAULTS (not in UI)
      SizeCenterSeal: 0,
      SizeSideSeal: 0,
      SizeTopSeal: 0,
      SizeBottomGusset: 0,

      // Make ready wastage - DEFAULT
      PlanMakeReadyWastage: 100,

      // Category - DEFAULT
      CategoryID: 0,

      // Book binding specific - DEFAULTS (not in UI)
      BookSpine: 0,
      BookHinge: 0,
      BookCoverTurnIn: 0,
      BookExtension: 0,
      BookLoops: 0,

      // Other material - DEFAULTS
      PlanOtherMaterialGSM: 0,
      PlanOtherMaterialGSMSettingJSON: '',
      MaterialWetGSMConfigJSON: '',

      // Punching - DEFAULT
      PlanPunchingType: null,

      // Pasting - DEFAULT
      ChkBackToBackPastingRequired: false,

      // UPS (Units Per Sheet) - DEFAULTS
      JobAcrossUps: 0,
      JobAroundUps: 0,

      // Bottom flap percentage - USER PROVIDED or default
      SizeBottomflapPer: Number(dims.bottomFlapPer) || 0,

      // Zipper - DEFAULTS (not in UI)
      SizeZipperLength: 0,
      ZipperWeightPerMeter: 0,

      // Input unit - USER PROVIDED or default
      JobSizeInputUnit: (jd.dimensions?.unit || 'MM').toString().toUpperCase(),

      // Ledger (client) ID - DEFAULT (can be enhanced later)
      LedgerID: 0,

      // Plan display limit - DEFAULT
      ShowPlanUptoWastePercent: 30,
    }

    return payload
  }


  const runPlanning = async () => {
    console.log('=== runPlanning started (SaveMultipleEnquiry) ===')
    setPlanningLoading(true)
    setPlanningError(null)
    setPlanningResults(null)
    try {
      const { saveMultipleEnquiry, postShirinJob } = await import('@/lib/api-config')

      let currentEnquiryNumber = enquiryNumber

      // Only call SaveMultipleEnquiry if we don't have an enquiry number yet
      if (!currentEnquiryNumber) {
        console.log('=== No existing enquiry number, calling SaveMultipleEnquiry ===')

        // Build the enquiry data
        const enquiryData = {
          clientName: jobData.clientName,
          clientId: 0, // Will use default value
          jobName: jobData.jobName,
          quantity: jobData.quantity,
          cartonType: jobData.cartonType,
          dimensions: jobData.dimensions,
          paperDetails: jobData.paperDetails,
          processes: jobData.processes,
          productCode: '',
          salesEmployeeId: 0,
          categoryId: 0,
          categoryName: '',
          fileName: '',
          remark: '',
        }

        console.log('\n' + '='.repeat(80))
        console.log('GET PLAN BUTTON CLICKED - API CALL #1: SaveMultipleEnquiry')
        console.log('='.repeat(80))
        console.log('Endpoint: POST /api/parksons/SaveMultipleEnquiry')
        console.log('Request Body:', JSON.stringify(enquiryData, null, 2))
        console.log('='.repeat(80) + '\n')

        const res = await saveMultipleEnquiry(enquiryData)

        console.log('\n' + '='.repeat(80))
        console.log('SaveMultipleEnquiry Response:')
        console.log('='.repeat(80))
        console.log(JSON.stringify(res, null, 2))
        console.log('='.repeat(80) + '\n')

        // Store the enquiry number from response
        currentEnquiryNumber = res?.EnquiryNo || res?.enquiryNo || res?.EnquiryNumber || null
        if (currentEnquiryNumber) {
          setEnquiryNumber(currentEnquiryNumber)
          console.log('=== Stored Enquiry Number:', currentEnquiryNumber, '===')
        }
      } else {
        console.log('=== Using existing Enquiry Number:', currentEnquiryNumber, '===')
        console.log('=== Skipping SaveMultipleEnquiry call (already called) ===')
      }

      // Call Shirin Job API when Get Plan is clicked
      const dims = jobData.dimensions || {}
      const paper = jobData.paperDetails || {}

      const shrinkJobParams = {
        SizeHeight: parseFloat(dims.height) || 0,
        SizeLength: parseFloat(dims.length) || 0,
        SizeWidth: parseFloat(dims.width) || 0,
        SizeOpenflap: parseFloat(dims.openFlap) || 0,
        SizePastingflap: parseFloat(dims.pastingFlap) || 0,
        SizeBottomflap: 0,
        JobNoOfPages: 0,
        JobUps: 0,
        JobFlapHeight: 0,
        JobTongHeight: 0,
        JobFoldedH: 0,
        JobFoldedL: 0,
        PlanContentType: jobData.cartonType ? jobData.cartonType.replace(/\s+/g, '') : '',
        PlanFColor: Number(paper.frontColor) || 0,
        PlanBColor: Number(paper.backColor) || 0,
        PlanColorStrip: 0,
        PlanGripper: 0,
        PlanPrintingStyle: (() => {
          const hasFront = Number(paper.frontColor) > 0
          const hasBack = Number(paper.backColor) > 0
          if (hasFront && hasBack) return 'Choose Best'
          if (hasFront || hasBack) return 'Single Side'
          return 'Choose Best'
        })(),
        PlanWastageValue: 0,
        Trimmingleft: 0,
        Trimmingright: 0,
        Trimmingtop: 0,
        Trimmingbottom: 0,
        Stripingleft: 0,
        Stripingright: 0,
        Stripingtop: 0,
        Stripingbottom: 0,
        PlanPrintingGrain: 'Both',
        ItemPlanQuality: paper.quality || '',
        ItemPlanGsm: Number(paper.gsm) || 0,
        ItemPlanMill: '',
        PlanPlateType: 'CTP Plate',
        PlanWastageType: 'Machine Default',
        PlanContQty: Number(jobData.quantity) || 0,
        PlanSpeFColor: 0,
        PlanSpeBColor: 0,
        PlanContName: jobData.cartonType || '',
        ItemPlanFinish: '',
        OperId: resolveOperIdFromProcesses(jobData),
        JobBottomPerc: 0,
        JobPrePlan: `H:${dims.height || 0},L:${dims.length || 0},W:${dims.width || 0},OF:${dims.openFlap || 0},PF:${dims.pastingFlap || 0}`,
        ChkPlanInSpecialSizePaper: false,
        ChkPlanInStandardSizePaper: false,
        MachineId: '',
        PlanOnlineCoating: '',
        PaperTrimleft: 0,
        PaperTrimright: 0,
        PaperTrimtop: 0,
        PaperTrimbottom: 0,
        ChkPaperByClient: false,
        JobFoldInL: 1,
        JobFoldInH: 1,
        ChkPlanInAvailableStock: false,
        PlanPlateBearer: 0,
        PlanStandardARGap: 0,
        PlanStandardACGap: 0,
        PlanContDomainType: 'Offset',
        Planlabeltype: null,
        Planwindingdirection: 0,
        Planfinishedformat: null,
        Plandietype: '',
        PlanPcsPerRoll: 0,
        PlanCoreInnerDia: 0,
        PlanCoreOuterDia: 0,
        EstimationQuantityUnit: 'PCS',
        ItemPlanThickness: 0,
        SizeCenterSeal: 0,
        SizeSideSeal: 0,
        SizeTopSeal: 0,
        SizeBottomGusset: 0,
        PlanMakeReadyWastage: 0,
        CategoryID: 2,
        BookSpine: 0,
        BookHinge: 0,
        BookCoverTurnIn: 0,
        BookExtension: 0,
        BookLoops: 0,
        PlanOtherMaterialGSM: 0,
        PlanOtherMaterialGSMSettingJSON: '',
        MaterialWetGSMConfigJSON: '',
        PlanPunchingType: null,
        ChkBackToBackPastingRequired: false,
        JobAcrossUps: 0,
        JobAroundUps: 0,
        SizeBottomflapPer: 0,
        SizeZipperLength: 0,
        ZipperWeightPerMeter: 0,
        JobSizeInputUnit: 'MM',
        LedgerID: 4
      }

      console.log('=== Resolved OperIDs for Shirin Job ===', resolveOperIdFromProcesses(jobData))
      console.log('=== Process Names ===', getProcessNames(jobData))

      // Call Shirin Job API (non-blocking - don't fail planning if this fails)
      console.log('\n' + '='.repeat(80))
      console.log('GET PLAN BUTTON CLICKED - API CALL #2: ShirinJob')
      console.log('='.repeat(80))
      console.log('Endpoint: POST /api/planwindow/Shirin_Job')
      console.log('Request Body:', JSON.stringify(shrinkJobParams, null, 2))
      console.log('='.repeat(80) + '\n')

      try {
        const shrinkJobRes = await postShirinJob(shrinkJobParams)

        console.log('\n' + '='.repeat(80))
        console.log('ShirinJob Response:')
        console.log('='.repeat(80))
        console.log(JSON.stringify(shrinkJobRes, null, 2))
        console.log('='.repeat(80) + '\n')

        // If we got plans from Shirin Job, use them
        if (shrinkJobRes && Array.isArray(shrinkJobRes) && shrinkJobRes.length > 0) {
          console.log('=== Setting planning results from ShirinJob ===')
          setPlanningResults(shrinkJobRes)
        } else {
          // Set mock planning results to show success and allow progression
          setPlanningResults([{
            success: true,
            message: 'Enquiry saved successfully',
            MachineID: 1,
            MachineName: 'Default Machine',
            UnitPrice: 0,
            TotalPlanCost: 0,
            TotalUps: 1
          }])
        }
      } catch (shirinErr: any) {
        console.error('=== ShirinJob API failed (non-blocking) ===', shirinErr)
        // Set mock results even if Shirin Job fails
        setPlanningResults([{
          success: true,
          message: 'Enquiry saved successfully',
          MachineID: 1,
          MachineName: 'Default Machine',
          UnitPrice: 0,
          TotalPlanCost: 0,
          TotalUps: 1
        }])
      }

      return true
    } catch (err: any) {
      console.error('=== SaveMultipleEnquiry failed ===', err)
      setPlanningError(err?.message ?? 'Failed to save enquiry')
      return false
    } finally {
      setPlanningLoading(false)
      console.log('=== runPlanning completed ===')
    }
  }

  // Call costing API for a specific quantity with the selected machine
  const getCostingForQuantity = async (quantity: number) => {
    if (!selectedPlan) {
      console.error('No plan selected')
      return null
    }

    try {
      const { postShirinJob } = await import('@/lib/api-config')

      // Build payload with the new quantity and selected machine
      const payload = buildRawShirinPayload(jobData)
      payload.PlanContQty = quantity
      payload.MachineId = String(selectedPlan.MachineID || selectedPlan.MachineId || '')

      // Ensure OperId resolved
      try {
        payload.OperId = String(selectedOperId || payload.OperId || resolveOperIdFromProcesses(jobData) || '')
      } catch (e) {
        // OperId resolution failed, continue with empty
      }

      const res = await postShirinJob(payload)

      // Return the first result (since we're requesting for a specific machine)
      return res && res.length > 0 ? res[0] : null
    } catch (err: any) {
      console.error('Costing failed for quantity', quantity, err)
      return null
    }
  }

  // Save/Export handlers
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSaveQuotation = async () => {
    try {
      setSaveLoading(true)
      setSaveError(null)
      setSaveSuccess(false)

      const { saveQuotation } = await import('@/lib/api-config')

      // Prepare quotation data
      const quotationData = {
        clientName: jobData.clientName,
        jobName: jobData.jobName,
        cartonType: jobData.cartonType,
        dimensions: jobData.dimensions,
        paperDetails: jobData.paperDetails,
        processes: jobData.processes,
        machine: jobData.machine,
        machineId: jobData.machineId,
        machineName: jobData.machineName,
        wastage: jobData.wastage,
        grainDirection: jobData.grainDirection,
        selectedPlan: jobData.selectedPlan,
        quantities: jobData.quantities,
        planningResults: planningResults,
        totalCost: jobData.quantities.reduce((sum, q) => sum + q.costs.finalCost, 0),
        createdAt: new Date().toISOString(),
      }

      await saveQuotation(quotationData)
      setSaveSuccess(true)

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      console.error('Failed to save quotation', err)
      setSaveError(err?.message ?? 'Failed to save quotation')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleShareQuotation = async () => {
    try {
      const quotationText = `
Quotation Details
================
Client: ${jobData.clientName || 'N/A'}
Job: ${jobData.jobName || 'N/A'}
Carton Type: ${jobData.cartonType || 'N/A'}

Quantities & Pricing:
${jobData.quantities.map((q, i) => `
  Qty ${q.qty}: ₹${q.costs.finalCost.toLocaleString()} (₹${(q.costs.finalCost / q.qty).toFixed(2)}/unit)
`).join('')}

Total: ₹${jobData.quantities.reduce((sum, q) => sum + q.costs.finalCost, 0).toLocaleString()}

Generated with KAM Printing Wizard
      `.trim()

      if (navigator.share) {
        await navigator.share({
          title: `Quotation - ${jobData.jobName || 'Job'}`,
          text: quotationText,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(quotationText)
        showToast('Quotation copied to clipboard!', 'success')
      }
    } catch (err: any) {
      console.error('Failed to share quotation', err)
      // Silently fail if user cancels share dialog
    }
  }

  const [saveEnquiryLoading, setSaveEnquiryLoading] = useState(false)
  const [saveEnquiryError, setSaveEnquiryError] = useState<string | null>(null)
  const [saveEnquirySuccess, setSaveEnquirySuccess] = useState(false)

  const handleSaveEnquiry = async () => {
    try {
      setSaveEnquiryLoading(true)
      setSaveEnquiryError(null)
      setSaveEnquirySuccess(false)

      const { saveMultipleEnquiry } = await import('@/lib/api-config')

      // Prepare enquiry data
      const enquiryData = {
        clientName: jobData.clientName,
        clientId: 0, // Default - would need to get from client selection
        jobName: jobData.jobName,
        quantity: jobData.quantity,
        cartonType: jobData.cartonType,
        dimensions: jobData.dimensions,
        paperDetails: jobData.paperDetails,
        processes: jobData.processes,
        productCode: '',
        salesEmployeeId: 0,
        categoryId: 0,
        categoryName: '',
        fileName: '',
        remark: '',
      }

      console.log('=== SAVE ENQUIRY DATA ===')
      console.log('enquiryData:', JSON.stringify(enquiryData, null, 2))

      const response = await saveMultipleEnquiry(enquiryData)

      console.log('=== SAVE ENQUIRY RESPONSE ===')
      console.log('response:', JSON.stringify(response, null, 2))

      setSaveEnquirySuccess(true)
      showToast('Enquiry saved successfully!', 'success')

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveEnquirySuccess(false), 3000)
    } catch (err: any) {
      console.error('Failed to save enquiry', err)
      setSaveEnquiryError(err?.message ?? 'Failed to save enquiry')
      showToast(`Failed to save enquiry: ${err?.message}`, 'error')
    } finally {
      setSaveEnquiryLoading(false)
    }
  }

  const renderFinalCost = () => {
    // If quotation data exists, show detailed quotation
    if (quotationNumber && quotationData) {
      const mainData = quotationData?.Main?.[0] || {}
      const detailsData = quotationData?.Datails?.[0] || {}
      const priceData = quotationData?.Price?.[0] || {}

      // Download as PDF handler
      const handleDownloadPDF = async () => {
        try {
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          })

          let yPos = 15

          // Company Header (if available)
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
            } else {
              yPos += 5
            }
          }

          // Title
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          pdf.text('QUOTATION', 105, yPos, { align: 'center' })
          yPos += 10

          // Quotation Number and Booking Number
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`Quotation No: ${quotationNumber || 'N/A'}`, 15, yPos)
          if (mainData.BookingNo) {
            pdf.text(`Booking No: ${mainData.BookingNo}`, 140, yPos)
          }
          yPos += 5
          pdf.text(`Date: ${mainData.Job_Date || mainData.EnquiryDate || new Date().toLocaleDateString()}`, 15, yPos)
          yPos += 8

          // Client Information Table
          autoTable(pdf, {
            startY: yPos,
            head: [],
            body: [
              ['Client Name', ':', mainData.LedgerName || 'N/A'],
              ['To,', ':', mainData.LedgerName || 'N/A'],
              ['', '', `${mainData.Address1 || ''}${mainData.CityName ? ', ' + mainData.CityName : ''}${mainData.PinCode ? ' - ' + mainData.PinCode : ''}`],
              ['Subject', ':', `Quotation For : ${mainData.JobName || 'N/A'}`],
              ['Kind Attention', ':', mainData.ContactPerson || ''],
              ['Email', ':', mainData.LedgerEmail || ''],
              ['Phone', ':', mainData.LedgerContactNo || ''],
            ].filter(row => row[2] !== ''), // Filter out empty rows
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1 },
            columnStyles: {
              0: { cellWidth: 35, fontStyle: 'bold' },
              1: { cellWidth: 5 },
              2: { cellWidth: 150 }
            }
          })

          yPos = (pdf as any).lastAutoTable.finalY + 5

          // Intro Text
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')
          pdf.text('Dear Sir / Madam,', 15, yPos)
          yPos += 5
          pdf.text('This has reference of your inquiry regarding your printing job.', 15, yPos)
          yPos += 5
          pdf.text('Please find below details and our most competitive rates as under.', 15, yPos)
          yPos += 8

          // Product Description Header
          autoTable(pdf, {
            startY: yPos,
            head: [['Product Description', 'Currency', 'Tax Type', 'Tax%']],
            body: [[
              mainData.JobName || 'N/A',
              priceData.CurrencySymbol || 'INR',
              priceData.TaxInorExClusive || 'Exclusive',
              `${priceData.TaxPercentage || 0}%`
            ]],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [200, 220, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] },
            columnStyles: {
              0: { cellWidth: 100 },
              1: { cellWidth: 30 },
              2: { cellWidth: 30 },
              3: { cellWidth: 30 }
            }
          })

          yPos = (pdf as any).lastAutoTable.finalY + 2

          // Product Details Table
          autoTable(pdf, {
            startY: yPos,
            body: [
              ['Product Name', ':', mainData.JobName || 'N/A', 'Quantity', (priceData.PlanContQty || 0).toLocaleString()],
              ['Product Code', ':', detailsData.ProductCode || 'N/A', 'Unit Cost', `${priceData.CurrencySymbol || '₹'} ${(priceData.UnitCost || 0).toFixed(2)}`],
              ['Category', ':', detailsData.CategoryName || mainData.CategoryName || 'N/A', 'Sub Total', `${priceData.CurrencySymbol || '₹'} ${(priceData.TotalCost || priceData.GrandTotalCost || 0).toLocaleString()}`],
              ['Carton Type', ':', detailsData.CartonTypeName || 'N/A', 'Tax Amount', `${priceData.CurrencySymbol || '₹'} ${(priceData.TaxAmount || 0).toLocaleString()}`],
              ['Domain', ':', mainData.DomainName || detailsData.DomainName || 'N/A', 'Grand Total', `${priceData.CurrencySymbol || '₹'} ${(priceData.GrandTotalCost || 0).toLocaleString()}`]
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

          yPos = (pdf as any).lastAutoTable.finalY + 5

          // Content Details and Job Size Details
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Technical Specifications', 15, yPos)
          yPos += 5

          autoTable(pdf, {
            startY: yPos,
            body: [
              ['Content Name', ':', detailsData.ContentName || 'N/A', 'Job Size (mm)', `${detailsData.JobSizeH || 0} x ${detailsData.JobSizeL || 0}`],
              ['Color Details', ':', `Front: ${detailsData.PlanFColor || 0} + ${detailsData.PlanFSpColor || 0} | Back: ${detailsData.PlanBColor || 0} + ${detailsData.PlanBSpColor || 0}`, 'Job Size (Inch)', `H: ${detailsData.SizeHeight || 0}" L: ${detailsData.SizeLength || 0}"`],
              ['Quality', ':', detailsData.QualityName || 'N/A', 'Paper GSM', detailsData.PaperGSM || 'N/A'],
              ['Mill', ':', detailsData.MillName || 'N/A', 'Finish', detailsData.FinishName || 'N/A'],
              ['Grain Direction', ':', detailsData.GrainDirection || 'N/A', 'Box Weight (Kg)', (detailsData.BoxWeight || 0).toFixed(2)],
              ['Material Details', ':', detailsData.MaterialDetails || `${detailsData.QualityName || ''} ${detailsData.PaperGSM || ''}GSM`, 'Supplied By', mainData.CompanyName || 'Client'],
              ['Operations', ':', detailsData.Operations || 'N/A', 'Printing Type', detailsData.PrintingType || 'N/A'],
              ['Ups (Per Sheet)', ':', detailsData.TotalUps || detailsData.Ups || 'N/A', 'Plan Type', detailsData.PlanType || 'N/A']
            ],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [240, 240, 240] },
            columnStyles: {
              0: { fontStyle: 'bold', cellWidth: 30 },
              1: { cellWidth: 5 },
              2: { cellWidth: 55 },
              3: { fontStyle: 'bold', cellWidth: 30 },
              4: { cellWidth: 40 }
            }
          })

          yPos = (pdf as any).lastAutoTable.finalY + 5

          // Ply Details Table (if available)
          if (detailsData.PlyDetails && Array.isArray(detailsData.PlyDetails)) {
            const plyData = detailsData.PlyDetails.map((ply: any) => [
              ply.PlyNo || '',
              ply.FluteName || 'None',
              ply.ItemDetails || ''
            ])

            autoTable(pdf, {
              startY: yPos,
              head: [['PlyNo', 'Flute', 'Item Details']],
              body: plyData,
              theme: 'grid',
              styles: { fontSize: 9, cellPadding: 2 },
              headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
            })

            yPos = (pdf as any).lastAutoTable.finalY + 5
          }

          // Terms & Conditions / Remarks Section
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Terms & Conditions:', 15, yPos)
          yPos += 5

          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')

          const remarks = mainData.Remark || mainData.TermsAndConditions || 'Minimum Quantity: 1,00,000 boxes per product. The rates shall vary with a change in ordered quantity.\n\nPacking: Corrugated boxes - stretch wrapped.\n\nDelivery charges: Extra at actual.\n\nGST: 12% Extra.\n\nPayment Terms: 50% advance, 50% before delivery.\n\nDelivery: Within 15-20 working days from the date of order confirmation.'
          const remarkLines = pdf.splitTextToSize(remarks, 180)
          pdf.text(remarkLines, 15, yPos)
          yPos += remarkLines.length * 5 + 10

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
          yPos += 10

          // Footer with contact details
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'italic')
          const footerText = [
            `Prepared By: ${mainData.CreatedByName || 'Admin'}`,
            mainData.ContactNO ? `Contact: ${mainData.ContactNO}` : '',
            mainData.CompanyEmail ? `Email: ${mainData.CompanyEmail}` : '',
            `Date: ${new Date().toLocaleDateString()}`
          ].filter(Boolean).join(' | ')
          pdf.text(footerText, 105, yPos, { align: 'center' })

          // Save PDF
          pdf.save(`Quotation-${quotationNumber}.pdf`)
        } catch (error) {
          console.error('Failed to generate PDF:', error)
          showToast(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
        }
      }

      return (
        <div className="p-3 space-y-3 animate-fade-in max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderStepHeader("Quotation Details", true)}

          {/* Printable Quotation Content */}
          <div ref={quotationPrintRef} className="bg-white">
            <style>{`
              @media print {
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

          {/* Header Section - Blue Card */}
          <Card className="p-6 bg-[#005180] text-white rounded-2xl shadow-lg mb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm opacity-80 mb-1">Quotation Number</div>
                <div className="text-5xl font-bold tracking-tight">{quotationNumber}</div>
                <div className="text-sm opacity-80 mt-2">{mainData.Job_Date || mainData.EnquiryDate}</div>
                {mainData.BookingNo && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-sm opacity-80">Booking No</div>
                    <div className="text-2xl font-bold tracking-tight">{mainData.BookingNo}</div>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80 mb-1">Company</div>
                <div className="text-xl font-bold">{mainData.CompanyName || 'Parksons'}</div>
              </div>
            </div>
          </Card>

          {/* Client & Job Information */}
          <Card className="p-4 mb-4 border-2 border-slate-200">
            <h3 className="font-bold text-[#005180] mb-3 flex items-center gap-2 text-base">
              <Package className="w-5 h-5" />
              Client & Job Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Client Name</div>
                <div className="font-bold text-slate-900 text-sm">{mainData.LedgerName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Job Name</div>
                <div className="font-bold text-slate-900 text-sm">{mainData.JobName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Contact</div>
                <div className="font-bold text-slate-900 text-sm">{mainData.ContactNO || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">GST IN</div>
                <div className="font-bold text-slate-900 text-sm">{mainData.GSTIN || 'N/A'}</div>
              </div>
            </div>
            {mainData.Remark && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Remark</div>
                <div className="text-sm text-slate-700 font-medium">{mainData.Remark}</div>
              </div>
            )}
          </Card>


          {/* Pricing Information */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
            <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2 text-base">
              <Calculator className="w-5 h-5" />
              Pricing Details
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Quantity</div>
                  <div className="text-xl font-bold text-slate-900">{(priceData.PlanContQty || 0).toLocaleString()} PCS</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Unit Cost</div>
                  <div className="text-xl font-bold text-[#005180]">₹ {(priceData.UnitCost || 0).toFixed(2)}</div>
                </div>
              </div>

              {priceData.UnitCost1000 && (
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm text-slate-600">Cost per 1000:</span>
                  <span className="font-bold text-slate-900">₹ {priceData.UnitCost1000.toLocaleString()}</span>
                </div>
              )}

              {priceData.QuotedCost && (
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm text-slate-600">Quoted Cost:</span>
                  <span className="font-bold text-slate-900">₹ {priceData.QuotedCost.toFixed(2)}</span>
                </div>
              )}

              {priceData.Amount && (
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm text-slate-600">Amount:</span>
                  <span className="font-bold text-slate-900">₹ {priceData.Amount.toLocaleString()}</span>
                </div>
              )}

              {priceData.TaxPercentage !== undefined && (
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-sm text-slate-600">Tax ({priceData.TaxInorExClusive}):</span>
                  <span className="font-bold text-slate-900">{priceData.TaxPercentage}%</span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t-2 border-green-400">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-700">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-600">₹ {(priceData.GrandTotalCost || 0).toLocaleString()}</span>
                </div>
                <div className="text-xs text-slate-500 text-right mt-1">{priceData.CurrencySymbol || 'INR'}</div>
              </div>
            </div>
          </Card>
          </div>

          {/* Actions - Not printed */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 no-print">
            <Button
              className="flex-1 bg-[#005180] hover:bg-[#004875] text-white"
              onClick={() => {
                // Reset wizard to start
                setCurrentStep(0)
                setQuotationNumber(null)
                setQuotationData(null)
                setJobData(DEFAULT_JOB_DATA)
                setPlanningResults(null)
                onStepChange?.(steps[0])
              }}
            >
              Create New Inquiry
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-[#005180] text-[#005180] hover:bg-[#005180]/10"
              onClick={() => {
                try {
                  const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                  })

                  let yPos = 15

                  // Title
                  pdf.setFontSize(16)
                  pdf.setFont('helvetica', 'bold')
                  pdf.text('QUOTATION', 105, yPos, { align: 'center' })
                  yPos += 10

                  // Client Information Table
                  autoTable(pdf, {
                    startY: yPos,
                    head: [],
                    body: [
                      ['Client Name', ':', mainData.LedgerName || 'N/A'],
                      ['To,', ':', mainData.LedgerName || 'N/A'],
                      ['', '', `${mainData.Address1 || ''}${mainData.CityName ? ', ' + mainData.CityName : ''}${mainData.PinCode ? ' - ' + mainData.PinCode : ''}`],
                      ['Subject', ':', `Quotation For : ${mainData.JobName || 'N/A'}`],
                      ['Kind Attention', ':', ''],
                    ],
                    theme: 'plain',
                    styles: { fontSize: 9, cellPadding: 1 },
                    columnStyles: {
                      0: { cellWidth: 35, fontStyle: 'bold' },
                      1: { cellWidth: 5 },
                      2: { cellWidth: 150 }
                    }
                  })

                  yPos = (pdf as any).lastAutoTable.finalY + 5

                  // Intro Text
                  pdf.setFontSize(9)
                  pdf.setFont('helvetica', 'normal')
                  pdf.text('Dear Sir / Madam,', 15, yPos)
                  yPos += 5
                  pdf.text('This has reference of your inquiry regarding your printing job.', 15, yPos)
                  yPos += 5
                  pdf.text('Please find below details and our most competitive rates as under.', 15, yPos)
                  yPos += 8

                  // Product Description Header
                  autoTable(pdf, {
                    startY: yPos,
                    head: [['Product Description', 'Quotation No', 'Date', 'Quantity Wise Rate', 'Tax', 'Tax%']],
                    body: [[
                      '',
                      quotationNumber || '',
                      mainData.Job_Date || mainData.EnquiryDate || '',
                      priceData.CurrencySymbol || 'INR',
                      priceData.TaxInorExClusive || 'Exclusive',
                      (priceData.TaxPercentage || 0).toString()
                    ]],
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 2 },
                    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0] },
                    columnStyles: {
                      0: { cellWidth: 50 },
                      1: { cellWidth: 30 },
                      2: { cellWidth: 30 },
                      3: { cellWidth: 35 },
                      4: { cellWidth: 25 },
                      5: { cellWidth: 20 }
                    }
                  })

                  yPos = (pdf as any).lastAutoTable.finalY + 2

                  // Product Details Table
                  autoTable(pdf, {
                    startY: yPos,
                    body: [
                      ['Product Name', ':', mainData.JobName || 'N/A', 'Quantity', (priceData.PlanContQty || 0).toLocaleString(), 'Rate', (priceData.UnitCost || 0).toFixed(2), 'Rate Type', 'UnitCost'],
                      ['Product Code', ':', detailsData.ProductCode || '', '', '', '', '', '', ''],
                      ['Category', ':', detailsData.CategoryName || mainData.CategoryName || '', 'Total Amount', '', '', (priceData.GrandTotalCost || 0).toLocaleString(), '', '']
                    ],
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 2 },
                    columnStyles: {
                      0: { fontStyle: 'bold', cellWidth: 30 },
                      1: { cellWidth: 5 },
                      2: { cellWidth: 60 },
                      3: { fontStyle: 'bold', cellWidth: 25 },
                      4: { cellWidth: 20 },
                      5: { cellWidth: 15 },
                      6: { cellWidth: 15 },
                      7: { cellWidth: 20 },
                      8: { cellWidth: 15 }
                    }
                  })

                  yPos = (pdf as any).lastAutoTable.finalY + 5

                  // Content Details and Job Size Details
                  pdf.setFontSize(10)
                  pdf.setFont('helvetica', 'bold')
                  pdf.text('Content Details :-', 15, yPos)
                  pdf.text('Job Size Details', 105, yPos)
                  yPos += 2

                  autoTable(pdf, {
                    startY: yPos,
                    body: [
                      ['Content Name', ':', detailsData.ContentName || 'N/A'],
                      ['Color Details', ':', `F:${detailsData.PlanFColor || 0} / B:${detailsData.PlanBColor || 0}, SF:${detailsData.PlanFSpColor || 0} / SB:${detailsData.PlanBSpColor || 0}`],
                      ['Job Size', ':', `${detailsData.JobSizeH || 0} x ${detailsData.JobSizeL || 0}`],
                      ['Job Size(Inch)', ':', `H:${detailsData.SizeHeight || 0}, L:${detailsData.SizeLength || 0}`],
                      ['Material Details', ':', detailsData.MaterialDetails || `Quality:${detailsData.QualityName || ''}, GSM:${detailsData.PaperGSM || ''}`, 'Supplied By :', mainData.CompanyName || 'N/A'],
                      ['Operations', ':', detailsData.Operations || 'N/A'],
                      ['BoxWeight', ':', (detailsData.BoxWeight || 0).toFixed(2)]
                    ],
                    theme: 'plain',
                    styles: { fontSize: 9, cellPadding: 1 },
                    columnStyles: {
                      0: { fontStyle: 'bold', cellWidth: 35 },
                      1: { cellWidth: 5 },
                      2: { cellWidth: 90 },
                      3: { fontStyle: 'bold', cellWidth: 30 },
                      4: { cellWidth: 30 }
                    }
                  })

                  yPos = (pdf as any).lastAutoTable.finalY + 5

                  // Ply Details Table (if available)
                  if (detailsData.PlyDetails && Array.isArray(detailsData.PlyDetails)) {
                    const plyData = detailsData.PlyDetails.map((ply: any) => [
                      ply.PlyNo || '',
                      ply.FluteName || 'None',
                      ply.ItemDetails || ''
                    ])

                    autoTable(pdf, {
                      startY: yPos,
                      head: [['PlyNo', 'Flute', 'Item Details']],
                      body: plyData,
                      theme: 'grid',
                      styles: { fontSize: 9, cellPadding: 2 },
                      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
                    })

                    yPos = (pdf as any).lastAutoTable.finalY + 5
                  }

                  // Remark Section
                  pdf.setFontSize(10)
                  pdf.setFont('helvetica', 'bold')
                  pdf.text('Remark', 15, yPos)
                  pdf.text(':', 50, yPos)
                  yPos += 5

                  pdf.setFontSize(9)
                  pdf.setFont('helvetica', 'normal')

                  const remarks = mainData.Remark || 'Minimum Quantity: 1,00,000 boxes per product. The rates shall vary with a change in ordered quantity\n\nPacking: Corrugated boxes - stretch wrapped.\n\nDelivery charges: Extra at actual\n\nGST: 12% Extra.\n\nPayment Terms: 50% advance 50% before delivery'
                  const remarkLines = pdf.splitTextToSize(remarks, 180)
                  pdf.text(remarkLines, 15, yPos)
                  yPos += remarkLines.length * 5 + 5

                  // Footer
                  pdf.setFontSize(9)
                  pdf.setFont('helvetica', 'normal')
                  pdf.text(mainData.CompanyName || 'ABC company pvt ltd', 15, yPos)
                  yPos += 5
                  pdf.text(mainData.CreatedByName || 'Admin', 15, yPos)
                  yPos += 5
                  pdf.text(mainData.ContactNO || '', 15, yPos)

                  // Open print dialog
                  pdf.autoPrint()
                  window.open(pdf.output('bloburl'), '_blank')
                } catch (error) {
                  console.error('Failed to print:', error)
                  showToast(`Failed to print: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
                }
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Quotation
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => {
                console.log('Download PDF button clicked!')
                handleDownloadPDF()
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      )
    }

    // Otherwise show the original Final Cost page
    return (
    <div className="p-2 sm:p-3 space-y-4 animate-fade-in">
      {renderStepHeader("Final Cost", true)}

      {/* Selected Plan Details */}
      {selectedPlan && (() => {
        const unitCost = selectedPlan.UnitPrice || selectedPlan.TotalPlanCost || 0
        const planQuantity = selectedPlan.PlanContQty || selectedPlan.Quantity || Number(jobData.quantity) || 0
        const totalCost = unitCost * planQuantity

        return (
          <Card className="p-4 bg-gradient-to-br from-[#005180]/10 to-white border-2 border-[#005180]/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-slate-800">Selected Plan</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500">Machine</div>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedPlan.MachineName || selectedPlan.MachineID || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">UPS</div>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedPlan.TotalUps || selectedPlan.Ups || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Unit Cost</div>
                <div className="text-sm font-semibold text-[#005180]">
                  ₹ {unitCost.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Quantity</div>
                <div className="text-sm font-semibold text-slate-800">
                  {planQuantity.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#005180]/30">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">Total Cost (Unit Cost × Quantity)</div>
                <div className="text-xl font-bold text-green-600">
                  ₹ {totalCost.toFixed(2)}
                </div>
              </div>
              <div className="text-xs text-slate-400 text-right mt-1">
                ({unitCost.toFixed(2)} × {planQuantity.toLocaleString()})
              </div>
            </div>
          </Card>
        )
      })()}

      {!selectedPlan && (
        <Card className="p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700">
            <div className="text-sm">⚠️ No plan selected. Please go back to "Best Plans" and select a plan.</div>
          </div>
        </Card>
      )}

      {/* Quantity Tabs - Hidden as per user request */}
      {/* {jobData.quantities.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2 overflow-x-auto">
            {jobData.quantities.map((qty, index) => (
            <div key={index} className="relative flex-shrink-0">
              <div
                className={`p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                  index === 0
                    ? "bg-[#005180] text-white border-[#005180]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-[#005180]"
                }`}
              >
                <div className="text-xs opacity-80">Qty</div>
                <div className="font-bold">{qty.qty}</div>
              </div>
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 text-red-500 hover:bg-red-50 rounded-full bg-white border border-red-200"
                  onClick={() => {
                    const newQuantities = jobData.quantities.filter((_, i) => i !== index)
                    setJobData({ ...jobData, quantities: newQuantities })
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border border-[#005180] text-[#005180] hover:bg-[#005180]/10 text-sm bg-transparent flex-shrink-0"
          onClick={() => setShowQuantityDialog(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add More Qty
        </Button>
      </div>
      )} */}

      {/* Show only differences toggle */}
      {/* {jobData.quantities.length > 1 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showDifferences"
            checked={showOnlyDifferences}
            onChange={(e) => setShowOnlyDifferences(e.target.checked)}
            className="rounded border-slate-300"
          />
          <label htmlFor="showDifferences" className="text-sm text-slate-600">
            Show only differences
          </label>
        </div>
      )} */}

      {/* Reducing final cost card padding */}
      {jobData.quantities.length === 0 ? (
        <Card className="p-6 text-center border-2 border-dashed border-slate-300">
          <div className="text-slate-600">
            <p className="mb-2">No quantities added yet.</p>
            <p className="text-sm">The selected plan's quantity will be automatically added when you navigate here.</p>
          </div>
        </Card>
      ) : jobData.quantities.length === 1 ? (
        // Single quantity view
        <Card className="p-3 sm:p-6 space-y-2 sm:space-y-4 bg-gradient-to-br from-white to-blue-50">
          <div className="text-center mb-2 sm:mb-4">
            <h3 className="font-semibold text-slate-800 text-lg sm:text-xl">Final Cost</h3>
            <p className="text-slate-600 text-sm">
              {jobData.clientName && `Client: ${jobData.clientName} • `}Qty: {jobData.quantities[0].qty}
            </p>
          </div>

          <div className="text-center mb-3 sm:mb-6">
            <div className="text-2xl sm:text-3xl font-bold text-[#005180]">
              ₹{jobData.quantities[0].costs.finalCost.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">
              ₹{(jobData.quantities[0].costs.finalCost / jobData.quantities[0].qty).toFixed(2)} per unit
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {[
              { label: "Basic Cost", value: jobData.quantities[0].costs.basicCost },
              { label: "Paper Cost", value: jobData.quantities[0].costs.paperCost },
              { label: "Printing Cost", value: jobData.quantities[0].costs.printingCost },
              { label: "Binding & Finishing", value: jobData.quantities[0].costs.bindingCost },
              { label: "Packaging Cost", value: jobData.quantities[0].costs.packagingCost },
              { label: "Freight Cost", value: jobData.quantities[0].costs.freightCost },
            ].map((item, index) => (
              <div key={index} className="flex justify-between text-sm py-1.5 sm:py-2 border-b border-slate-200">
                <span className="text-slate-600 truncate">{item.label}</span>
                <span className="font-medium text-slate-700 ml-2">₹{item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Horizontal Scrolling Grid */}
          <Card className="p-4">
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div
                  className="grid gap-1 mb-1"
                  style={{ gridTemplateColumns: `200px repeat(${Math.min(jobData.quantities.length, 4)}, 120px)` }}
                >
                  <div className="font-semibold text-slate-800 py-0.5">Cost Details</div>
                  {jobData.quantities.slice(0, 4).map((quantity, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-[#005180] text-white p-1.5 rounded-lg">
                        <div className="text-xs opacity-90">Qty</div>
                        <div className="font-bold">{quantity.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="grid gap-1 mb-1 pb-1 border-b border-slate-200"
                  style={{ gridTemplateColumns: `200px repeat(${Math.min(jobData.quantities.length, 4)}, 120px)` }}
                >
                  <div className="font-medium text-slate-700 py-0.5">Final Cost</div>
                  {jobData.quantities.slice(0, 4).map((quantity, index) => (
                    <div
                      key={index}
                      className="text-center bg-gradient-to-br from-[#005180]/10 to-slate-50 p-1.5 rounded-lg"
                    >
                      <div className="text-lg font-bold text-[#005180]">
                        ₹{quantity.costs.finalCost.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        ₹{(quantity.costs.finalCost / quantity.qty).toFixed(2)}/unit
                      </div>
                    </div>
                  ))}
                </div>

                {[
                  { label: "Basic Cost", key: "basicCost" },
                  { label: "Paper Cost", key: "paperCost" },
                  { label: "Printing Cost", key: "printingCost" },
                  { label: "Binding & Finishing", key: "bindingCost" },
                  { label: "Packaging Cost", key: "packagingCost" },
                  { label: "Freight Cost", key: "freightCost" },
                ].map((item) => {
                  const values = jobData.quantities.slice(0, 4).map((q) => q.costs[item.key as keyof typeof q.costs])
                  const hasVariation = new Set(values).size > 1

                  if (showOnlyDifferences && !hasVariation) return null

                  return (
                    <div
                      key={item.key}
                      className="grid gap-1 py-0.5 border-b border-slate-100"
                      style={{ gridTemplateColumns: `200px repeat(${Math.min(jobData.quantities.length, 4)}, 120px)` }}
                    >
                      <div className="text-sm text-slate-600 py-0.5">{item.label}</div>
                      {jobData.quantities.slice(0, 4).map((quantity, index) => (
                        <div key={index} className="text-center bg-slate-50 p-1 rounded">
                          <div className="text-sm font-medium text-slate-700">
                            ₹{(quantity.costs[item.key as keyof typeof quantity.costs] as number).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}

                <div
                  className="grid gap-1 mt-1 pt-1 border-t border-slate-200"
                  style={{ gridTemplateColumns: `200px repeat(${Math.min(jobData.quantities.length, 4)}, 120px)` }}
                >
                  <div className="font-medium text-slate-700 py-0.5">Savings</div>
                  {jobData.quantities.slice(0, 4).map((quantity, index) => {
                    if (index === 0) {
                      return (
                        <div key={index} className="text-center bg-slate-100 p-1 rounded">
                          <div className="text-xs text-slate-500">Base</div>
                        </div>
                      )
                    }
                    const baseUnitCost = jobData.quantities[0].costs.finalCost / jobData.quantities[0].qty
                    const currentUnitCost = quantity.costs.finalCost / quantity.qty
                    const savings = ((baseUnitCost - currentUnitCost) / baseUnitCost) * 100
                    return (
                      <div
                        key={index}
                        className={`text-center p-1.5 rounded ${savings > 0 ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <div className={`text-sm font-medium ${savings > 0 ? "text-green-600" : "text-red-600"}`}>
                          {savings > 0 ? "+" : ""}
                          {Math.abs(savings).toFixed(1)}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Best Value Recommendation */}
          <Card className="p-4 bg-gradient-to-r from-[#005180]/10 to-green-50 border-[#005180]/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-lg">💡</div>
              <h4 className="font-semibold text-slate-800">Best Value</h4>
            </div>
            <p className="text-sm text-slate-700">
              {(() => {
                const bestValue = jobData.quantities.reduce((best, current) => {
                  const bestUnitCost = best.costs.finalCost / best.qty
                  const currentUnitCost = current.costs.finalCost / current.qty
                  return currentUnitCost < bestUnitCost ? current : best
                })
                return `Qty ${bestValue.qty} offers the best value at ₹${(bestValue.costs.finalCost / bestValue.qty).toFixed(2)} per unit`
              })()}
            </p>
          </Card>
        </div>
      )}

      {/* Save/Share Status Messages */}
      {saveSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ Quotation saved successfully!
        </div>
      )}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Error: {saveError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
            onClick={handleSaveQuotation}
            disabled={saveLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveLoading ? 'Saving...' : 'Save Quote'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-[#005180] text-[#005180] hover:bg-[#005180]/10 bg-transparent"
            onClick={handleShareQuotation}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
        <Button
          className="w-full bg-[#005180] hover:bg-[#004875] text-white disabled:opacity-50"
          onClick={handleSaveEnquiry}
          disabled={saveEnquiryLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {saveEnquiryLoading ? 'Saving Enquiry...' : 'Save Enquiry'}
        </Button>
        {saveEnquiryError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Error: {saveEnquiryError}
          </div>
        )}
        {saveEnquirySuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Enquiry saved successfully!
          </div>
        )}
      </div>
    </div>
    )
  }

  const renderRoadmapNavigation = () => (
    <div ref={stepNavRef} className="flex items-center gap-0.5 sm:gap-1 px-1 overflow-x-auto scrollbar-hide max-w-full scroll-smooth">
      {steps.map((step, index) => (
        <div
          key={index}
          ref={(el) => {
            stepRefs.current[index] = el
          }}
          className="flex items-center flex-shrink-0"
        >
          <div className="relative group">
            <button
              onClick={() => handleStepClick(index)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
                index === currentStep
                  ? "bg-[#005180] text-white shadow-md"
                  : index < currentStep
                    ? "bg-[#78BE20] text-white hover:bg-[#6BA81B]"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {index + 1}
            </button>
            {/* Tooltip for step name on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
              {step}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-1 sm:w-2 h-0.5 mx-0.5 ${index < currentStep ? "bg-[#78BE20]" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  )

  // ... existing code for other render functions ...

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="p-3 space-y-3 animate-fade-in">
            <div className="text-center mb-4">
              <Package className="w-12 h-12 text-[#005180] mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Let's get started with your project</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="clientName" className="text-sm font-medium text-slate-700">
                  Client Name
                </Label>
                <ClientDropdown
                  value={jobData.clientName}
                  onValueChange={(value) => setJobData({ ...jobData, clientName: value })}
                  placeholder="Select existing client"
                />
              </div>

              {[
                { key: "jobName", label: "Job Name", placeholder: "Enter job name" },
                { key: "quantity", label: "Quantity", placeholder: "Enter quantity" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key} className="text-sm font-medium text-slate-700">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    value={jobData[key as keyof JobData] as string}
                    onChange={(e) => setJobData({ ...jobData, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="h-10 border border-slate-300 focus:border-[#005180] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )
      case 1:
        return renderCartonType()
      case 2:
        return renderSize()
      case 3:
        return renderPaperDetails()
      case 4:
        return renderProcesses()
      case 5:
        return renderBestPlans()
      case 6:
        return renderFinalCost()
      default:
        return renderJobDetails()
    }
  }

  const handleAddQuantity = async () => {
    if (newQuantity && Number.parseInt(newQuantity) > 0) {
      const qtyValue = Number.parseInt(newQuantity)

      // Show loading state
      setQuantityCostingLoading(true)
      setNewQuantity("")
      setShowQuantityDialog(false)

      // Call API to get costing for this quantity
      const costingResult = await getCostingForQuantity(qtyValue)

      if (costingResult) {
        // Store the API result
        const newResults = new Map(quantityCostResults)
        newResults.set(qtyValue, costingResult)
        setQuantityCostResults(newResults)

        // Calculate costs from API response
        const unitCost = costingResult.UnitPrice || costingResult.TotalPlanCost || 0
        const finalCost = unitCost * qtyValue

        const newQty = {
          qty: qtyValue,
          costs: {
            basicCost: costingResult.BasicCost || 0,
            paperCost: costingResult.PaperCost || 0,
            printingCost: costingResult.PrintingCost || 0,
            bindingCost: costingResult.BindingCost || 0,
            packagingCost: costingResult.PackagingCost || 0,
            freightCost: costingResult.FreightCost || 0,
            margin: 0,
            discount: 0,
            grandTotal: costingResult.TotalCost || finalCost,
            unitCost: unitCost,
            finalCost: finalCost,
          },
        }

        setJobData({
          ...jobData,
          quantities: [...jobData.quantities, newQty],
        })
      } else {
        // Fallback: Add with placeholder data if API fails
        const newQty = {
          qty: qtyValue,
          costs: {
            basicCost: 0,
            paperCost: 0,
            printingCost: 0,
            bindingCost: 0,
            packagingCost: 0,
            freightCost: 0,
            margin: 0,
            discount: 0,
            grandTotal: 0,
            unitCost: 0,
            finalCost: 0,
          },
        }
        setJobData({
          ...jobData,
          quantities: [...jobData.quantities, newQty],
        })
      }

      setQuantityCostingLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-16">{renderCurrentStep()}</div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#005180]/20 py-2 px-2 sm:px-3 z-40 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 max-w-full">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="bg-transparent hover:bg-[#005180]/10 border-[#005180] hover:border-[#005180] text-xs sm:text-sm text-[#005180] px-3 sm:px-4 py-2.5 sm:py-3 min-w-[80px] sm:min-w-[90px] flex-shrink-0 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </Button>

          <div className="flex-1 flex justify-center min-w-0">
            {renderRoadmapNavigation()}
          </div>

          <Button
            onClick={() => {
              // If on Final Cost step with quotation, redirect to inquiries
              if (currentStep === steps.length - 1 && quotationNumber && quotationData) {
                router.push('/inquiries')
              } else {
                nextStep()
              }
            }}
            disabled={(currentStep === steps.length - 1 && !quotationNumber) || planningLoading}
            className="bg-[#005180] hover:bg-[#004875] text-white text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 min-w-[80px] sm:min-w-[90px] flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {currentStep === steps.length - 1 ? (
              quotationNumber && quotationData ? "Done" : "Complete"
            ) : planningLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Costing...</span>
              </>
            ) : currentStep === steps.indexOf('Processes') ? (
              'Get Plans'
            ) : currentStep === steps.indexOf('Best Plans') ? (
              'Create Quotation'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>



      {/* Quantity Dialog */}
      {showQuantityDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/20 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-4 flex items-center justify-between">
              <h3 className="font-semibold">Add Quantity</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowQuantityDialog(false)} className="p-1">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <Input
                type="number"
                placeholder="Enter quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="h-10"
              />
              <Button className="w-full" onClick={handleAddQuantity}>
                Add Quantity
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay when fetching quantity costs */}
      {quantityCostingLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4">
            <svg className="w-12 h-12 animate-spin text-[#005180]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="text-center">
              <div className="font-semibold text-slate-800">Calculating costs...</div>
              <div className="text-sm text-slate-600">Fetching pricing for the selected machine</div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification - Centered */}
      {toast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className={`bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 ${
            toast.type === 'error' ? 'border-2 border-red-500' :
            toast.type === 'success' ? 'border-2 border-green-500' :
            'border-2 border-yellow-500'
          }`}>
            <div className="text-center">
              {toast.type === 'error' && (
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-4">
                  <X className="w-6 h-6 text-white" />
                </div>
              )}
              {toast.type === 'success' && (
                <div className="mx-auto w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              )}
              {toast.type === 'warning' && (
                <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">!</span>
                </div>
              )}
              <p className={`text-lg font-bold mb-2 ${
                toast.type === 'error' ? 'text-red-600' :
                toast.type === 'success' ? 'text-green-600' :
                'text-yellow-600'
              }`}>
                {toast.type === 'error' ? 'Required Fields Missing' :
                 toast.type === 'success' ? 'Success' :
                 'Warning'}
              </p>
              <p className="text-slate-700 text-sm mb-4">
                {toast.message}
              </p>
              <Button
                onClick={() => setToast(null)}
                className={`w-full ${
                  toast.type === 'error' ? 'bg-red-500 hover:bg-red-600' :
                  toast.type === 'success' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-yellow-500 hover:bg-yellow-600'
                } text-white`}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
