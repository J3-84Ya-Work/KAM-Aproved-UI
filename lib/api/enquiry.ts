/**
 * Enquiry API Module
 * Based on ENQUIRY_API_DOCUMENTATION.txt
 */

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.indusanalytics.co.in'

// Helper function to get headers
const getHeaders = (session?: any) => {
  // Use default values if no session
  const companyId = session?.CompanyID?.toString() || '2'
  const userId = session?.UserID?.toString() || '2'
  const fyear = session?.Fyear || '2025-2026'
  const productionUnitId = session?.ProductionUnitID?.toString() || '1'

  return {
    'CompanyID': companyId,
    'UserID': userId,
    'Fyear': fyear,
    'ProductionUnitID': productionUnitId,
    'Authorization': `Basic ${btoa('parksonsnew:parksonsnew')}`,
    'Content-Type': 'application/json',
  }
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
      const response = await fetch(`${API_BASE_URL}/api/enquiry/getmshowlistdata`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(request),
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
      let enquiries = []
      if (Array.isArray(data)) {
        // If response is directly an array
        enquiries = data
      } else if (data.data && Array.isArray(data.data)) {
        // If response has data property with array
        enquiries = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        // If response has Data property with array (capital D)
        enquiries = data.Data
      } else if (typeof data === 'string') {
        // Try to parse again if still a string
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed)) {
            enquiries = parsed
          }
        } catch (e) {
          // Parsing failed
        }
      }

      return {
        success: response.ok,
        data: enquiries,
        error: data.error || null,
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
      console.log('🌐 API Call: saveDetailedEnquiry')
      console.log('📍 URL:', `${API_BASE_URL}/api/enquiry/SaveMultipleEnquiry`)
      console.log('📋 Headers:', getHeaders(session))
      console.log('📦 Request Body (Full):', JSON.stringify(enquiryData, null, 2))
      console.log('📊 MainData:', enquiryData.MainData)
      console.log('📊 DetailsData:', enquiryData.DetailsData)
      console.log('📊 ProcessData:', enquiryData.ProcessData)
      console.log('📊 Quantity:', (enquiryData as any).Quantity)
      console.log('📊 Prefix:', (enquiryData as any).Prefix)
      console.log('📊 IsEdit:', (enquiryData as any).IsEdit)

      const response = await fetch(`${API_BASE_URL}/api/enquiry/SaveMultipleEnquiry`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(enquiryData),
      })

      console.log('📥 Response Status:', response.status, response.statusText)
      console.log('📥 Response OK:', response.ok)

      const data = await response.json()
      console.log('📥 Response Data:', data)

      return {
        success: response.ok,
        data: data.data || data || 'Enquiry saved successfully',
        error: response.ok ? null : (data.error || 'Failed to save enquiry'),
      }
    } catch (error: any) {
      console.error('❌ API Error:', error)
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
      console.log('🔧 ========== PROCESS API CALL START ==========')
      console.log('🔧 URL:', url)
      console.log('🔧 ContentType:', contentType)
      console.log('🔧 Headers:', getHeaders(session))

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(session),
      })

      console.log('🔧 Response Status:', response.status)
      console.log('🔧 Response OK:', response.ok)
      console.log('🔧 Response Headers:', Object.fromEntries(response.headers.entries()))

      const rawText = await response.text()
      console.log('🔧 Raw Response Text:', rawText)
      console.log('🔧 Raw Response Length:', rawText.length)

      let data
      try {
        data = JSON.parse(rawText)
        console.log('🔧 Parsed JSON successfully')
      } catch (e) {
        console.error('🔧 Failed to parse JSON:', e)
        console.log('🔧 First 500 chars of response:', rawText.substring(0, 500))
        throw new Error('Invalid JSON response')
      }

      console.log('🔧 Parsed data type:', typeof data)
      console.log('🔧 Parsed data:', JSON.stringify(data, null, 2))

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

      console.log('🔧 Parsed process data after', parseAttempts, 'attempts:', data)

      // Extract process array from response
      let processes: any[] = []
      if (Array.isArray(data)) {
        processes = data
      } else if (data?.data && Array.isArray(data.data)) {
        processes = data.data
      } else if (data?.Data && Array.isArray(data.Data)) {
        processes = data.Data
      }

      console.log('🔧 Extracted processes array:', processes)
      console.log('🔧 Number of processes:', processes.length)

      if (processes.length > 0) {
        console.log('🔧 Sample process (first item):', processes[0])
        console.log('🔧 Process fields:', Object.keys(processes[0]))
      }

      const result = {
        success: response.ok,
        data: processes,
        error: response.ok ? null : 'Failed to fetch processes',
      }

      console.log('🔧 Final return value:', result)
      console.log('🔧 ========== PROCESS API CALL END ==========')

      return result
    } catch (error: any) {
      console.error('🔧 ========== PROCESS API ERROR ==========')
      console.error('🔧 Error fetching processes:', error)
      console.error('🔧 Error stack:', error.stack)
      console.error('🔧 ========================================')
      return {
        success: false,
        data: [],
        error: `Failed to fetch processes: ${error.message}`,
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

      const response = await fetch(`${API_BASE_URL}/api/planwindow/GetSbClient`, {
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
      let clients = []
      if (Array.isArray(data)) {
        clients = data
      } else if (data.data && Array.isArray(data.data)) {
        clients = data.data
      } else if (data.Data && Array.isArray(data.Data)) {
        clients = data.Data
      } else {
      }

      if (clients.length > 0) {
      }

      return {
        success: response.ok,
        data: clients,
        error: data.error || null,
      }
    } catch (error: any) {
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
   * Update Quotation Status (Approve/Disapprove)
   * Endpoint: POST /api/planwindow/updateqoutestatus
   */
  static async updateQuotationStatus(request: {
    BookingID: string
    Status: string
  }, session: any) {
    try {

      const response = await fetch(`${API_BASE_URL}/api/planwindow/updateqoutestatus`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(request),
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

      return {
        success: response.ok,
        data: data,
        error: response.ok ? null : 'Failed to update quotation status',
      }
    } catch (error: any) {
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
   * Endpoint: GET /api/enquiry/getenquirydetails?enquiryId={enquiryId}
   */
  static async getEnquiryDetails(enquiryId: number, session: any) {
    try {

      const response = await fetch(`${API_BASE_URL}/api/enquiry/getenquirydetails?enquiryId=${enquiryId}`, {
        method: 'GET',
        headers: getHeaders(session),
      })

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: `Failed to fetch enquiry details: ${response.status} ${response.statusText}`,
        }
      }

      const data = await response.json()


      return {
        success: true,
        data: data,
        error: null,
      }
    } catch (error: any) {
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
      const response = await fetch(`${API_BASE_URL}/api/enquiry/updatmultipleenquiry`, {
        method: 'POST',
        headers: getHeaders(session),
        body: JSON.stringify(data),
      })

      const result = await response.json()

      return {
        success: response.ok && result === "Success",
        data: result,
        error: response.ok ? null : `Failed to update enquiry: ${response.status}`,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `Failed to update enquiry: ${error.message}`,
      }
    }
  }
}
