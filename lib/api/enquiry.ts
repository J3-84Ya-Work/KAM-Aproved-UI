import { logger } from "@/lib/logger"
/**
 * Enquiry API Module
 * Based on ENQUIRY_API_DOCUMENTATION.txt
 */

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.indusanalytics.co.in'

// Helper function to get user auth data from localStorage
const getUserAuthData = () => {
  if (typeof window === 'undefined') return null
  try {
    const authData = localStorage.getItem('userAuth')
    if (authData) {
      return JSON.parse(authData)
    }
  } catch (error) {
    console.error('Error reading user auth data:', error)
  }
  return null
}

// Helper function to get headers - all values are dynamic from localStorage
const getHeaders = (session?: any) => {
  // Get user auth data from localStorage
  const authData = getUserAuthData()

  // Use localStorage values first, then session, then defaults
  const companyId = authData?.companyId?.toString() || session?.CompanyID?.toString() || '2'
  const userId = authData?.userId?.toString() || session?.UserID?.toString() || '2'
  const fyear = authData?.fyear || session?.Fyear || '2025-2026'
  const productionUnitId = authData?.productionUnitId?.toString() || session?.ProductionUnitID?.toString() || '1'

  const headers = {
    'CompanyID': companyId,
    'UserID': userId,
    'Fyear': fyear,
    'ProductionUnitID': productionUnitId,
    'Authorization': `Basic ${btoa('parksonsnew:parksonsnew')}`,
    'Content-Type': 'application/json',
  }

  console.log('📋 API Headers:', headers)

  return headers
}

// Helper function to get headers for approvals (fetch all quotations)
const getHeadersForApprovals = (session?: any) => {
  // Get user auth data from localStorage
  const authData = getUserAuthData()

  // Use localStorage values first, then session, then defaults
  const companyId = authData?.companyId?.toString() || session?.CompanyID?.toString() || '2'
  const userId = authData?.userId?.toString() || session?.UserID?.toString() || '2'
  const fyear = authData?.fyear || session?.Fyear || '2025-2026'
  const productionUnitId = authData?.productionUnitId?.toString() || session?.ProductionUnitID?.toString() || '1'

  const headers = {
    'CompanyID': companyId,
    'UserID': userId,
    'Fyear': fyear,
    'ProductionUnitID': productionUnitId,
    'Authorization': `Basic ${btoa('parksonsnew:parksonsnew')}`,
    'Content-Type': 'application/json',
  }

  return headers
}

// Date formatting helpers
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

// Types
export interface EnquiryItem {
  EnquiryID: number
  EnquiryNo: string
  EnquiryDate: string
  EnquiryDate1: string
  Fyear: string
  CompanyID: number
  CompanyName: string
  LedgerID: number
  ClientName: string
  JobName: string
  CategoryID: number
  CategoryName: string
  ProductCode: string
  Quantity: string
  EstimationUnit: string
  ProductionUnitID: number
  ProductionUnitName: string
  EmployeeID: number
  SalesEmployeeID?: number
  SalesRepresentative: string
  UserName: string
  Status: string
  Status1: string
  TypeOfJob: string
  TypeOfPrinting: string
  EnquiryType: string
  SalesType: string
  SegmentID: number
  SegmentName: string
  ExpectCompletion: number
  Remark: string
  Mobile: string
  ConcernPersonID: number
  ConcernPerson?: string
  ConcernPersonName?: string
  ContactPerson?: string
  AnnualQuantity?: number
  DivisionName?: string
  SupplyLocation?: string
  PaymentTerms?: string
  FileName: string
}

export interface BasicEnquiryData {
  ProductCode?: string
  LedgerID: number
  JObName: string
  FileName?: string
  Quantity: number
  EnquiryDate: string
  Remark?: string
  SalesEmployeeID: number
  TypeOfJob?: string
  UnitCost: number
  Status?: string
  CategoryID?: number
}

export interface DetailedEnquiryData {
  MainData: BasicEnquiryData[]
  DetailsData: ContentDetailsData[]
  ProcessData: ProcessData[]
}

export interface ContentDetailsData {
  EnquiryNo: string
  ContentName: string
  Length?: number
  Width?: number
  Height?: number
  Quality?: string
  GSM?: number
  Mill?: string
  Finish?: string
  FColor?: number
  BColor?: number
  SfColor?: number
  SbColor?: number
  Coating?: string
  Remark?: string
}

export interface ProcessData {
  EnquiryNo: string
  ProcessID: number
  ProcessName: string
  Remark?: string
}

// Dropdown Options
export const TYPE_OF_JOB_OPTIONS = [
  { label: 'New', value: 'New' },
  { label: 'Repeat', value: 'Repeat' },
  { label: 'Sample', value: 'Sample' },
]

export const TYPE_OF_PRINTING_OPTIONS = [
  { label: 'Offset', value: 'Offset' },
  { label: 'Flexo', value: 'Flexo' },
  { label: 'Digital', value: 'Digital' },
  { label: 'Outsource', value: 'Outsource' },
  { label: 'Others', value: 'Others' },
]

export const UOM_OPTIONS = [
  { label: 'PCS', value: 'PCS' },
  { label: 'KG', value: 'KG' },
  { label: 'PKT', value: 'PKT' },
]

// API Functions
export class EnquiryAPI {
  /**
   * 2.1 Get Enquiries List
   * Endpoint: POST /api/enquiry/getmshowlistdata
   */
  static async getEnquiries(
    request: {
      FromDate: string
      ToDate: string
      ApplydateFilter: string
      RadioValue: string
    },
    session: any
  ) {
    try {
      const url = `${API_BASE_URL}/api/enquiry/getmshowlistdata`
      const headers = getHeaders(session)

      console.log('🔍 Enquiry API Request:', {
        url,
        headers: { ...headers, Authorization: '***' },
        body: request
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(request),
      })

      console.log('🔍 Enquiry API Response Status:', response.status, response.statusText)

      if (!response.ok) {
        console.error('❌ Enquiry API Error:', response.status, response.statusText)
        return {
          success: false,
          data: [],
          error: `API returned ${response.status}: ${response.statusText}`,
        }
      }

      let data = await response.json()
      console.log('🔍 Enquiry API Raw Response Type:', typeof data)

      // Handle multiple levels of JSON encoding (can be triple or more)
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
          console.log('🔍 Enquiry API Parse attempt', parseAttempts, '- Type:', typeof data, '- IsArray:', Array.isArray(data))
        } catch (e) {
          console.log('🔍 Enquiry API Parse failed at attempt', parseAttempts)
          break
        }
      }

      // Handle different response formats
      let enquiries = []
      if (Array.isArray(data)) {
        enquiries = data
        console.log('🔍 Enquiry API - Found', enquiries.length, 'enquiries')
      } else if (data && data.data && Array.isArray(data.data)) {
        enquiries = data.data
      } else if (data && data.Data && Array.isArray(data.Data)) {
        enquiries = data.Data
      }

      console.log('🔍 Enquiry API Final Result:', enquiries.length, 'enquiries')

      return {
        success: response.ok,
        data: enquiries,
        error: null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch enquiries: ${error.message}`,
      }
    }
  }

  /**
   * 2.2 Get Enquiry Number
   * Endpoint: GET /api/enquiry/getenquiryno
   */
  static async getEnquiryNo(session: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/enquiry/getenquiryno`, {
        method: 'GET',
        headers: getHeaders(session),
      })

      const data = await response.json()
      return {
        success: response.ok,
        data: data.data || '',
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: '',
        error: `Failed to fetch enquiry number: ${error.message}`,
      }
    }
  }

  /**
   * 2.3 Get Allowed Processes (deprecated - use getProcesses instead)
   * Endpoint: POST /api/enquiry/editprocessgrid
   */
  static async getAllowedProcesses(session: any) {
    // Fetch all processes without content type filter
    return this.getProcesses('', session)
  }

  /**
   * 2.4 Get Enquiry Categories
   * Endpoint: GET /api/enquiry/getsbcategory
   */
  static async getEnquiryCategories(session: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/enquiry/getsbcategory`, {
        method: 'GET',
        headers: getHeaders(session),
      })

      let data = await response.json()

      // Handle double-encoded JSON string response
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          // If parsing fails, keep as is
        }
      }

      // Handle different response formats
      let categories = []
      if (Array.isArray(data)) {
        // If response is directly an array
        categories = data
      } else if (data.data && Array.isArray(data.data)) {
        // If response has data property with array
        categories = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        // If response has Data property with array (capital D)
        categories = data.Data
      } else if (typeof data === 'string') {
        // Try to parse again if still a string
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed)) {
            categories = parsed
          }
        } catch (e) {
          // Parsing failed
        }
      }

      return {
        success: response.ok,
        data: categories,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch enquiry categories: ${error.message}`,
      }
    }
  }

  /**
   * 2.4.1 Get Content Types (Content Items)
   * Endpoint: GET /api/planwindow/GetCategoryAllocatedContents/{categoryID}
   */
  static async getContentTypes(categoryID: number, session: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/planwindow/GetCategoryAllocatedContents/${categoryID}`, {
        method: 'GET',
        headers: getHeaders(session),
      })

      let data = await response.json()

      // Handle double-encoded JSON string response
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          // If parsing fails, keep as is
        }
      }

      // Handle different response formats
      let contentTypes = []
      if (Array.isArray(data)) {
        contentTypes = data
      } else if (data.data && Array.isArray(data.data)) {
        contentTypes = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        contentTypes = data.Data
      } else if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed)) {
            contentTypes = parsed
          }
        } catch (e) {
          // Parsing failed
        }
      }

      return {
        success: response.ok,
        data: contentTypes,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch content types: ${error.message}`,
      }
    }
  }

  /**
   * 2.5 Save Basic Enquiry
   * Endpoint: POST /api/enquiry/saveeqdata
   */
  static async saveBasicEnquiry(enquiryData: BasicEnquiryData[], session: any, productionUnitID?: number) {
    try {
      const headers = {
        ...getHeaders(session),
        ...(productionUnitID && { 'ProductionUnitID': productionUnitID.toString() })
      }

      const response = await fetch(`${API_BASE_URL}/api/enquiry/saveeqdata`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(enquiryData),
      })

      const data = await response.json()
      return {
        success: response.ok,
        data: data.data || 'Enquiry saved successfully',
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `Failed to save basic enquiry: ${error.message}`,
      }
    }
  }

  /**
   * 2.6 Save Detailed Enquiry
   * Endpoint: POST /api/enquiry/SaveMultipleEnquiry
   */
  static async saveDetailedEnquiry(enquiryData: DetailedEnquiryData, session: any) {
    try {
      const url = `${API_BASE_URL}/api/enquiry/SaveMultipleEnquiry`

      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📡 API CALL: SaveMultipleEnquiry (saveDetailedEnquiry)')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('🔗 URL:', url)
      console.log('📋 Method: POST')
      console.log('📦 Request Body:')
      console.log(JSON.stringify(enquiryData, null, 2))
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📋 MainData:', enquiryData.MainData)
      console.log('📋 DetailsData:', enquiryData.DetailsData)
      console.log('📋 ProcessData:', enquiryData.ProcessData)
      console.log('📋 Quantity:', (enquiryData as any).Quantity)
      console.log('📋 Prefix:', (enquiryData as any).Prefix)
      console.log('📋 IsEdit:', (enquiryData as any).IsEdit)
      console.log('📋 EnquiryID:', (enquiryData as any).EnquiryID)
      console.log('═══════════════════════════════════════════════════════════════')

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(enquiryData),
      })

      const data = await response.json()

      console.log('═══════════════════════════════════════════════════════════════')
      console.log('✅ API RESPONSE: SaveMultipleEnquiry')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📊 Status:', response.status, response.statusText)
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))
      console.log('═══════════════════════════════════════════════════════════════')

      return {
        success: response.ok,
        data: data.data || data || 'Enquiry saved successfully',
        error: response.ok ? null : (data.error || 'Failed to save enquiry'),
      }
    } catch (error: any) {
      console.log('❌ API Exception:', error.message)
      return {
        success: false,
        data: null,
        error: `Failed to save detailed enquiry: ${error.message}`,
      }
    }
  }

  /**
   * Get Processes for Content Type
   * Endpoint: GET /api/enquiry/editprocessgrid?ContentType={contentType}
   */
  static async getProcesses(contentType: string, session: any) {
    try {
      const url = `${API_BASE_URL}/api/enquiry/editprocessgrid?ContentType=${encodeURIComponent(contentType)}`
      logger.log('🔧 ========== PROCESS API CALL START ==========')
      logger.log('🔧 URL:', url)
      logger.log('🔧 ContentType:', contentType)
      logger.log('🔧 Headers:', getHeaders(session))

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(session),
      })

      logger.log('🔧 Response Status:', response.status)
      logger.log('🔧 Response OK:', response.ok)
      logger.log('🔧 Response Headers:', Object.fromEntries(response.headers.entries()))

      const rawText = await response.text()
      logger.log('🔧 Raw Response Text:', rawText)
      logger.log('🔧 Raw Response Length:', rawText.length)

      let data
      try {
        data = JSON.parse(rawText)
        logger.log('🔧 Parsed JSON successfully')
      } catch (e) {
        logger.error('🔧 Failed to parse JSON:', e)
        logger.log('🔧 First 500 chars of response:', rawText.substring(0, 500))
        throw new Error('Invalid JSON response')
      }

      logger.log('🔧 Parsed data type:', typeof data)
      logger.log('🔧 Parsed data:', JSON.stringify(data, null, 2))

      // Handle multiple levels of JSON encoding
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }

      logger.log('🔧 Parsed process data after', parseAttempts, 'attempts:', data)

      // Extract process array from response
      let processes: any[] = []
      if (Array.isArray(data)) {
        processes = data
      } else if (data?.data && Array.isArray(data.data)) {
        processes = data.data
      } else if (data?.Data && Array.isArray(data.Data)) {
        processes = data.Data
      }

      logger.log('🔧 Extracted processes array:', processes)
      logger.log('🔧 Number of processes:', processes.length)

      if (processes.length > 0) {
        logger.log('🔧 Sample process (first item):', processes[0])
        logger.log('🔧 Process fields:', Object.keys(processes[0]))
      }

      const result = {
        success: response.ok,
        data: processes,
        error: response.ok ? null : 'Failed to fetch processes',
      }

      logger.log('🔧 Final return value:', result)
      logger.log('🔧 ========== PROCESS API CALL END ==========')

      return result
    } catch (error: any) {
      logger.error('🔧 ========== PROCESS API ERROR ==========')
      logger.error('🔧 Error fetching processes:', error)
      logger.error('🔧 Error stack:', error.stack)
      logger.error('🔧 ========================================')
      return {
        success: false,
        data: [],
        error: `Failed to fetch processes: ${error.message}`,
      }
    }
  }

  /**
   * Update Enquiry Status
   * Endpoint: POST /api/enquiry/updatestatus
   * Used to update enquiry status (e.g., to "Quoted" when quotation is created)
   */
  static async updateEnquiryStatus(enquiryId: number, status: string, session: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/enquiry/updatestatus`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify({
          EnquiryID: enquiryId,
          Status: status
        }),
      })

      const result = await response.json()

      return {
        success: response.ok && result === "Updated",
        data: result,
        error: response.ok ? null : `Failed to update enquiry status: ${response.status}`,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `Failed to update enquiry status: ${error.message}`,
      }
    }
  }
}

// Master Data APIs
export class MasterDataAPI {
  /**
   * Get Production Units
   * Endpoint: GET /api/othermaster/getproductionunits
   */
  static async getProductionUnits(session: any) {
    try {

      const response = await fetch(`${API_BASE_URL}/api/othermaster/getproductionunits`, {
        method: 'GET',
        headers: getHeaders(session),
      })


      let data = await response.json()

      // Handle double-encoded JSON string response
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)

          // Check if it's still a string after first parse (triple-encoded)
          if (typeof data === 'string') {
            data = JSON.parse(data)
          }
        } catch (e) {
        }
      }

      // Handle different response formats
      let units = []
      if (Array.isArray(data)) {
        units = data
      } else if (data.data && Array.isArray(data.data)) {
        units = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        units = data.Data
      } else {
      }


      return {
        success: response.ok,
        data: units,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch production units: ${error.message}`,
      }
    }
  }

  /**
   * Get Clients
   * Endpoint: GET /api/planwindow/GetSbClient
   */
  static async getClients(session: any) {
    try {
      console.log('🔵 EnquiryAPI.getClients - Starting fetch...')
      console.log('🔵 EnquiryAPI.getClients - Session:', session)
      console.log('🔵 EnquiryAPI.getClients - Headers:', getHeaders(session))

      const response = await fetch(`${API_BASE_URL}/api/planwindow/GetSbClient`, {
        method: 'GET',
        headers: getHeaders(session),
      })

      console.log('🔵 EnquiryAPI.getClients - Response status:', response.ok, response.status)

      let data = await response.json()
      console.log('🔵 EnquiryAPI.getClients - Raw data (first parse):', data)
      console.log('🔵 EnquiryAPI.getClients - Data type:', typeof data)

      // Handle double-encoded JSON string response
      if (typeof data === 'string') {
        try {
          console.log('🔵 EnquiryAPI.getClients - Parsing first level...')
          data = JSON.parse(data)
          console.log('🔵 EnquiryAPI.getClients - After first parse:', data)
          console.log('🔵 EnquiryAPI.getClients - Type after first parse:', typeof data)

          // Check if it's still a string after first parse (triple-encoded)
          if (typeof data === 'string') {
            console.log('🔵 EnquiryAPI.getClients - Parsing second level (triple-encoded)...')
            data = JSON.parse(data)
            console.log('🔵 EnquiryAPI.getClients - After second parse:', data)
            console.log('🔵 EnquiryAPI.getClients - Type after second parse:', typeof data)
          }
        } catch (e) {
          console.error('🔵 EnquiryAPI.getClients - Parse error:', e)
        }
      }

      // Handle different response formats
      let clients = []
      if (Array.isArray(data)) {
        console.log('🔵 EnquiryAPI.getClients - Data is array, length:', data.length)
        clients = data
      } else if (data.data && Array.isArray(data.data)) {
        console.log('🔵 EnquiryAPI.getClients - Found data.data array, length:', data.data.length)
        clients = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        console.log('🔵 EnquiryAPI.getClients - Found data.Data array, length:', data.Data.length)
        clients = data.Data
      } else {
        console.log('🔵 EnquiryAPI.getClients - No array found, data:', data)
      }

      console.log('🔵 EnquiryAPI.getClients - Final clients array:', clients)
      console.log('🔵 EnquiryAPI.getClients - Final clients count:', clients.length)

      return {
        success: response.ok,
        data: clients,
        error: data.error || null,
      }
    } catch (error: any) {
      console.error('🔵 EnquiryAPI.getClients - Error:', error)
      return {
        success: false,
        data: [],
        error: `Failed to fetch clients: ${error.message}`,
      }
    }
  }

  /**
   * Get Sales Persons
   * Endpoint: GET /api/planwindow/getsbsalesperson
   */
  static async getSalesPersons(session: any) {
    try {

      const response = await fetch(`${API_BASE_URL}/api/planwindow/getsbsalesperson`, {
        method: 'GET',
        headers: getHeaders(session),
      })


      let data = await response.json()

      // Handle double-encoded JSON string response
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)

          // Check if it's still a string after first parse (triple-encoded)
          if (typeof data === 'string') {
            data = JSON.parse(data)
          }
        } catch (e) {
        }
      }

      // Handle different response formats
      let salesPersons = []
      if (Array.isArray(data)) {
        salesPersons = data
      } else if (data.data && Array.isArray(data.data)) {
        salesPersons = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        salesPersons = data.Data
      } else {
      }

      if (salesPersons.length > 0) {
      }

      return {
        success: response.ok,
        data: salesPersons,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch sales persons: ${error.message}`,
      }
    }
  }

  /**
   * Get Item Quality Data
   * Endpoint: GET /api/planwindow/quality/{contenttype}
   */
  static async getItemQualities(contentType: string, session: any) {
    try {
      const url = `${API_BASE_URL}/api/planwindow/quality/${contentType}`

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(session),
      })


      let data = await response.json()

      // Handle multiple levels of JSON encoding (can be triple or more)
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }


      // Handle different response formats
      let qualities = []
      if (Array.isArray(data)) {
        qualities = data
      } else if (data.data && Array.isArray(data.data)) {
        qualities = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        qualities = data.Data
      }

      if (qualities.length > 0) {
        qualities.forEach((q: any, i: number) => {
          const qualityValue = q.Quality || q
        })
      }

      return {
        success: response.ok,
        data: qualities,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch item qualities: ${error.message}`,
      }
    }
  }

  /**
   * Get GSM Data
   * Endpoint: GET /api/planwindow/gsm/{contenttype}/{quality}/{thickness}
   */
  static async getGSMData(contentType: string, quality: string, session: any) {
    try {
      // Always use 0 as default thickness
      const thickness = '0'
      // Build raw URL - send parameters exactly as-is without encoding
      const url = `${API_BASE_URL}/api/planwindow/gsm/${contentType}/${quality}/${thickness}`


      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(session),
      })


      let data = await response.json()

      // Handle multiple levels of JSON encoding
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }


      // Handle different response formats
      let gsmData = []
      if (Array.isArray(data)) {
        gsmData = data
      } else if (data.data && Array.isArray(data.data)) {
        gsmData = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        gsmData = data.Data
      }


      // The API returns structure like [{"gsm":[150,200]}]
      // We need to flatten it to extract the actual GSM values
      let flattenedGsmValues: number[] = []
      if (gsmData.length > 0 && gsmData[0].gsm && Array.isArray(gsmData[0].gsm)) {
        flattenedGsmValues = gsmData[0].gsm
      } else if (gsmData.length > 0 && gsmData[0].GSM && Array.isArray(gsmData[0].GSM)) {
        flattenedGsmValues = gsmData[0].GSM
      } else {
        // Fallback: use the data as-is
        flattenedGsmValues = gsmData
      }


      return {
        success: response.ok,
        data: flattenedGsmValues,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch GSM data: ${error.message}`,
      }
    }
  }

  /**
   * Get Mill Data
   * Endpoint: GET /api/planwindow/mill/{contenttype}/{quality}/{gsm}/{thickness}
   */
  static async getMillData(contentType: string, quality: string, gsm: number, session: any) {
    try {
      // Always use 0 as default thickness
      const thickness = '0'
      // Build raw URL - send parameters exactly as-is without encoding
      const url = `${API_BASE_URL}/api/planwindow/mill/${contentType}/${quality}/${gsm}/${thickness}`


      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(session),
      })


      let data = await response.json()

      // Handle multiple levels of JSON encoding
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }


      // Handle different response formats
      let millData = []
      if (Array.isArray(data)) {
        millData = data
      } else if (data.data && Array.isArray(data.data)) {
        millData = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        millData = data.Data
      }

      if (millData.length > 0) {
      }

      // The API returns structure like [{"Mill":["Mill1","Mill2"]}]
      // We need to flatten it to extract the actual Mill values
      let flattenedMillValues: string[] = []
      if (millData.length > 0 && typeof millData[0] === 'object' && millData[0] !== null) {
        // Check for Mill field (capital M)
        if (millData[0].Mill && Array.isArray(millData[0].Mill)) {
          flattenedMillValues = millData[0].Mill
        }
        // Check for mill field (lowercase m)
        else if (millData[0].mill && Array.isArray(millData[0].mill)) {
          flattenedMillValues = millData[0].mill
        }
        // If it's an object but no Mill/mill field, it might be the wrong structure
        else {
          flattenedMillValues = millData
        }
      } else {
        // Data is already an array of strings
        flattenedMillValues = millData
      }


      return {
        success: response.ok,
        data: flattenedMillValues,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch mill data: ${error.message}`,
      }
    }
  }

  /**
   * Get Finish Data
   * Endpoint: GET /api/planwindow/finish/{quality}/{gsm}/{mill}
   */
  static async getFinishData(quality: string, gsm: number, mill: string, session: any) {
    try {
      // Build URL without encoding - API expects plain text
      const url = `${API_BASE_URL}/api/planwindow/finish/${quality}/${gsm}/${mill}`


      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(session),
      })


      let data = await response.json()

      // Handle multiple levels of JSON encoding
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }


      // Handle different response formats
      let finishData = []
      if (Array.isArray(data)) {
        finishData = data
      } else if (data.data && Array.isArray(data.data)) {
        finishData = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        finishData = data.Data
      }


      // The API may return structure like [{"Finish":["Finish1","Finish2"]}]
      // We need to flatten it to extract the actual Finish values
      let flattenedFinishValues: string[] = []
      if (finishData.length > 0 && finishData[0].Finish && Array.isArray(finishData[0].Finish)) {
        flattenedFinishValues = finishData[0].Finish
      } else if (finishData.length > 0 && finishData[0].finish && Array.isArray(finishData[0].finish)) {
        flattenedFinishValues = finishData[0].finish
      } else {
        // Fallback: use the data as-is
        flattenedFinishValues = finishData
      }


      return {
        success: response.ok,
        data: flattenedFinishValues,
        error: data.error || null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch finish data: ${error.message}`,
      }
    }
  }
}

// Quotations API
export class QuotationsAPI {
  /**
   * Get Quotations/Booking Data
   * Endpoint: POST /api/planwindow/getbookingdata
   */
  static async getQuotations(request: {
    FilterSTR: string
    FromDate: string
    ToDate: string
  }, session: any) {
    try {

      const response = await fetch(`${API_BASE_URL}/api/planwindow/getbookingdata`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(request),
      })

      let data = await response.json()


      // Handle multiple levels of JSON encoding (can be triple or more)
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }

      return {
        success: response.ok,
        data: Array.isArray(data) ? data : [],
        error: response.ok ? null : 'Failed to fetch quotations',
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch quotations: ${error.message}`,
      }
    }
  }

  /**
   * Get All Quotations for Approvals (without UserID filtering)
   * Endpoint: POST /api/planwindow/getbookingdata
   */
  static async getAllQuotationsForApproval(request: {
    FilterSTR: string
    FromDate: string
    ToDate: string
  }, session: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/planwindow/getbookingdata`, {
        method: 'POST',
        headers: getHeadersForApprovals(session),
        body: JSON.stringify(request),
      })

      let data = await response.json()

      // Handle multiple levels of JSON encoding (can be triple or more)
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }

      return {
        success: response.ok,
        data: Array.isArray(data) ? data : [],
        error: response.ok ? null : 'Failed to fetch quotations for approval',
      }
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch quotations for approval: ${error.message}`,
      }
    }
  }

  /**
   * Update Quotation Status (Approve/Disapprove)
   * Endpoint: POST /api/planwindow/updateqoutestatus
   */
  static async updateQuotationStatus(request: {
    BookingID: string
    Status: string
  }, session: any) {
    try {
      logger.log('\n[API] updateQuotationStatus')
      logger.log('URL:', `${API_BASE_URL}/api/planwindow/updateqoutestatus`)
      logger.log('Method: POST')
      logger.log('Body:', JSON.stringify(request, null, 2))
      logger.log('Headers:', JSON.stringify(getHeaders(session), null, 2))

      const response = await fetch(`${API_BASE_URL}/api/planwindow/updateqoutestatus`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(request),
      })

      logger.log('\n[Response]')
      logger.log('Status:', response.status, response.statusText)
      logger.log('OK:', response.ok)

      const rawText = await response.text()
      logger.log('Body:', rawText)

      let data
      try {
        data = JSON.parse(rawText)
      } catch (e) {
        logger.error('Failed to parse response as JSON')
        // If it's just "Success" or "Updated" string, treat as success
        if (rawText.toLowerCase().includes('success') || rawText.toLowerCase().includes('updated')) {
          logger.log('Detected success message in plain text')
          return {
            success: true,
            data: rawText,
            error: null,
          }
        }
        throw new Error('Invalid JSON response from API')
      }

      // Handle multiple levels of JSON encoding
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          logger.log(`Parsing nested JSON (attempt ${parseAttempts + 1})`)
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          break
        }
      }

      logger.log('\n[Parsed]')
      logger.log('Data:', data)
      logger.log('Type:', typeof data)

      // Check if response indicates success even if response.ok is false
      const isSuccess = response.ok ||
                       (typeof data === 'string' && (data.toLowerCase().includes('success') || data.toLowerCase().includes('updated'))) ||
                       (data && typeof data === 'object' && (data.success === true || data.Success === true))

      logger.log('Success:', isSuccess)

      return {
        success: isSuccess,
        data: data,
        error: isSuccess ? null : (data?.error || data?.message || 'Failed to update quotation status'),
      }
    } catch (error: any) {
      logger.error('Exception in updateQuotationStatus:', error)
      return {
        success: false,
        data: null,
        error: `Failed to update quotation status: ${error.message}`,
      }
    }
  }

  /**
   * Send Quotation for Internal Approval
   * Updates the quotation status to "Sent to HOD" or "Sent to Vertical Head"
   * Endpoint: POST /api/enquiry/updateqoutestatus
   */
  static async sendForApproval(request: {
    BookingID: string
    ApprovalType: 'HOD' | 'VerticalHead'
  }, session: any) {
    try {

      // Determine the status based on approval type
      const status = request.ApprovalType === 'VerticalHead' ? 'Sent to Vertical Head' : 'Sent to HOD'

      const requestBody = {
        BookingID: request.BookingID,
        Status: status
      }

      const response = await fetch(`${API_BASE_URL}/api/planwindow/updateqoutestatus`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(requestBody),
      })

      let data = await response.json()

      // Handle multiple levels of JSON encoding
      // Some APIs return simple strings like "Updated" which are valid responses
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          data = JSON.parse(data)
          parseAttempts++
        } catch (e) {
          // If parsing fails, it's likely a simple string response like "Updated"
          // This is valid, so we just break and use the string as-is
          break
        }
      }

      return {
        success: response.ok,
        data: data,
        error: response.ok ? null : `Failed to send quotation for approval: ${response.status} ${response.statusText}`,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `Failed to send quotation for approval: ${error.message}`,
      }
    }
  }

  /**
   * Get Raw Email Body
   * Fetches the raw email body from the database using EmailEnquiryId
   * Endpoint: GET /api/enquiries/{emailEnquiryId}/raw-email
   *
   * Response format:
   * {
   *   "enquiryId": 45,
   *   "companyName": "Test Company",
   *   "email": "jatin.indusanalytics@gmail.com",
   *   "originalEmailSubject": "Testing Reply Detection",
   *   "originalMessageId": null,
   *   "rawEmailBody": "Hi,\r\n\r\nI need boxes...",
   *   "receivedDate": "2025-11-05T13:26:48",
   *   "processedDate": "2025-11-05T13:27:37.572637"
   * }
   */
  static async getRawEmailBody(emailEnquiryId: number, session: any) {
    try {

      const response = await fetch(`http://localhost:5000/api/enquiries/${emailEnquiryId}/raw-email`, {
        method: 'GET',
        headers: getHeaders(session),
      })

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: `Failed to fetch raw email body: ${response.status} ${response.statusText}`,
        }
      }

      const data = await response.json()


      // Return the entire response object so the component can extract what it needs
      return {
        success: true,
        data: data,
        error: null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `Failed to fetch raw email body: ${error.message}`,
      }
    }
  }

  /**
   * Get Detailed Enquiry Data
   * Fetches complete enquiry details including dimensions and processes
   * Endpoint: GET /api/planwindow/GetEnquiryContentData/{EnquiryID}
   */
  static async getEnquiryDetails(enquiryId: number, session: any) {
    try {
      const url = `${API_BASE_URL}/api/planwindow/GetEnquiryContentData/${enquiryId}`

      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📡 API CALL: getEnquiryDetails (GetEnquiryContentData)')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('🔗 URL:', url)
      console.log('📋 Method: GET')
      console.log('📦 Parameters: { enquiryId:', enquiryId, '}')
      console.log('═══════════════════════════════════════════════════════════════')

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(session),
      })

      if (!response.ok) {
        console.log('❌ API Response Error:', response.status, response.statusText)
        return {
          success: false,
          data: null,
          error: `Failed to fetch enquiry details: ${response.status} ${response.statusText}`,
        }
      }

      let data = await response.json()
      console.log('📦 Raw response type:', typeof data)
      console.log('📦 Raw response (first 200 chars):', typeof data === 'string' ? data.substring(0, 200) : 'not a string')

      // Handle multiple levels of JSON encoding (API returns triple-encoded JSON)
      let parseAttempts = 0
      while (typeof data === 'string' && parseAttempts < 5) {
        try {
          console.log(`📦 Parse attempt ${parseAttempts + 1}, current type: ${typeof data}`)
          data = JSON.parse(data)
          parseAttempts++
          console.log(`📦 After parse ${parseAttempts}, type: ${typeof data}`)
        } catch (e) {
          console.log(`📦 Parse failed at attempt ${parseAttempts + 1}:`, e)
          break
        }
      }

      console.log('═══════════════════════════════════════════════════════════════')
      console.log('✅ API RESPONSE: getEnquiryDetails (GetEnquiryContentData)')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📦 Final parsed data type:', typeof data)
      console.log('📦 Parse attempts:', parseAttempts)
      if (data && typeof data === 'object') {
        console.log('📦 TblBookingContents:', data.TblBookingContents?.length || 0, 'items')
        console.log('📦 TblBookingProcess:', data.TblBookingProcess?.length || 0, 'items')
        if (data.TblBookingProcess?.length > 0) {
          console.log('📦 First process:', data.TblBookingProcess[0])
        }
      }
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))
      console.log('═══════════════════════════════════════════════════════════════')

      return {
        success: true,
        data: data,
        error: null,
      }
    } catch (error: any) {
      console.log('❌ API Exception:', error.message)
      return {
        success: false,
        data: null,
        error: `Failed to fetch enquiry details: ${error.message}`,
      }
    }
  }

  /**
   * Update Multiple Enquiry (Detailed Enquiry)
   * Updates enquiry with main data, details, processes, and quantities
   */
  static async updateMultipleEnquiry(data: {
    MainData: Array<{
      ProductCode: string
      LedgerID: number
      SalesEmployeeID: number
      CategoryID: number
      ConcernPersonID: number | null
      JobName: string
      FileName: string
      EnquiryDate: string
      EstimationUnit: string
      ExpectCompletion: string
      Remark: string
      TypeOfJob: string | null
      TypeOfPrinting: string | null
      EnquiryType: string
      SalesType: string
      ProductionUnitID?: number
      PlantID: number
    }>
    DetailsData: Array<{
      PlanContName: string
      Size: string
      PlanContentType: string
      ContentSizeValues: string
      valuesString: string
      JobSizeInCM: string
    }>
    ProcessData: Array<{
      ProcessID: number
      ProcessName: string
      PlanContName: string
      PlanContentType: string
    }>
    Quantity: number
    IsEdit: string
    EnquiryID: number
    LayerDetailArr: any[]
    JsonObjectsUserApprovalProcessArray: Array<{
      ProductCode: string
      LedgerID: number
      LedgerName: string
      SalesEmployeeID: number
      CategoryName: string
      ConcernPersonID: number | null
      JobName: string
      FileName: string
      EnquiryDate: string
      EstimationUnit: string
      ExpectCompletion: string
      Remark: string
      TypeOfJob: string | null
      TypeOfPrinting: string | null
      EnquiryType: string
      SalesType: string
      Quantity: string
    }>
  }, session: any) {
    try {
      const url = `${API_BASE_URL}/api/enquiry/updatmultipleenquiry`

      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📡 API CALL: updateMultipleEnquiry')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('🔗 URL:', url)
      console.log('📋 Method: POST')
      console.log('📦 Request Body:')
      console.log(JSON.stringify(data, null, 2))
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📋 MainData:', data.MainData)
      console.log('📋 DetailsData:', data.DetailsData)
      console.log('📋 ProcessData:', data.ProcessData)
      console.log('📋 Quantity:', data.Quantity)
      console.log('📋 IsEdit:', data.IsEdit)
      console.log('📋 EnquiryID:', data.EnquiryID)
      console.log('═══════════════════════════════════════════════════════════════')

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(data),
      })

      console.log('📡 Response status:', response.status, response.statusText)

      const rawText = await response.text()
      console.log('📡 Raw response text:', rawText)

      let result
      try {
        result = JSON.parse(rawText)
      } catch {
        // Response might be plain text like "Success"
        result = rawText
      }

      console.log('📡 Parsed result:', result)

      // "Success" means updated successfully - check both response.ok and the result text
      // Also accept if response is OK even if result is different
      const isSuccess = (result === "Success" || result === "Exist" || result === '"Success"' || result === '"Exist"') ||
                        (response.ok && typeof result === 'string' && result.toLowerCase().includes('success'))

      console.log('═══════════════════════════════════════════════════════════════')
      console.log('✅ API RESPONSE: updateMultipleEnquiry')
      console.log('─────────────────────────────────────────────────────────────')
      console.log('📊 Status:', response.status, response.statusText)
      console.log('📊 Response OK:', response.ok)
      console.log('📊 Is Success:', isSuccess)
      console.log('📦 Result:', result)
      console.log('═══════════════════════════════════════════════════════════════')

      return {
        success: isSuccess,
        data: result,
        error: isSuccess ? null : `Failed to update enquiry: ${result || response.status}`,
      }
    } catch (error: any) {
      console.log('❌ API Exception:', error.message)
      return {
        success: false,
        data: null,
        error: `Failed to update enquiry: ${error.message}`,
      }
    }
  }
}
