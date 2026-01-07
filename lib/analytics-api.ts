/**
 * Analytics API Module
 * Fetches and processes data for the analytics dashboard
 */

import { EnquiryAPI, QuotationsAPI, MasterDataAPI, type EnquiryItem } from "@/lib/api/enquiry"
import { logger } from "@/lib/logger"

// Get KPI data for dashboard
export async function getAnalyticsKPIs(kamFilter?: string) {
  try {
    logger.log('🔍 Analytics API - Fetching KPIs, kamFilter:', kamFilter)

    // Fetch all data without date filter to match side panel counts
    const [inquiriesResponse, quotationsResponse, customersResponse] = await Promise.all([
      EnquiryAPI.getEnquiries({
        FromDate: '2024-01-01',
        ToDate: '2027-12-31',
        ApplydateFilter: 'N',
        RadioValue: 'All',
      }, null),
      QuotationsAPI.getQuotations({
        FilterSTR: 'All',
        FromDate: '2024-01-01',
        ToDate: '2027-12-31',
      }, null),
      MasterDataAPI.getClients(null)
    ])

    logger.log('📊 Inquiries Response:', inquiriesResponse)
    logger.log('📊 Quotations Response:', quotationsResponse)
    logger.log('📊 Customers Response:', customersResponse)

    if (!inquiriesResponse.success || !inquiriesResponse.data) {
      logger.error('❌ Failed to fetch inquiries:', inquiriesResponse)
      return { success: false, error: 'Failed to fetch inquiries' }
    }

    const allInquiries = inquiriesResponse.data as EnquiryItem[]
    const allQuotations = quotationsResponse.success ? (quotationsResponse.data || []) : []

    logger.log('📋 Total inquiries fetched:', allInquiries.length)
    logger.log('📋 Total quotations fetched:', allQuotations.length)

    // Filter by KAM if specified
    const inquiries = kamFilter
      ? allInquiries.filter(inq => inq.SalesRepresentative === kamFilter)
      : allInquiries

    logger.log('📋 Filtered inquiries:', inquiries.length)

    // Calculate KPIs
    const totalInquiries = inquiries.length

    // Log unique status values to understand what's in the data
    const uniqueStatuses = new Set(inquiries.map(inq => inq.Status || inq.Status1).filter(Boolean))
    logger.log('📋 Unique Status values in data:', Array.from(uniqueStatuses))

    // Completed = count of quotations (inquiries that have quotations)
    const completed = allQuotations.length

    // Conversions = inquiries that became orders (check various status patterns)
    const conversions = inquiries.filter(inq => {
      const status = (inq.Status || inq.Status1 || '').toLowerCase()
      return status.includes('convert') ||
             status.includes('order') ||
             status.includes('won') ||
             status.includes('booked')
    }).length

    // Active Customer = total customers from the clients API (to match side panel)
    const allCustomers = customersResponse.success ? (customersResponse.data || []) : []
    const activeClients = allCustomers.length > 0
      ? allCustomers.length
      : new Set(inquiries.map(inq => inq.LedgerID)).size

    // Calculate previous period for comparison
    const currentMonth = new Date().getMonth()
    const thisMonthInquiries = inquiries.filter(inq => {
      const date = new Date(inq.EnquiryDate || inq.EnquiryDate1)
      return date.getMonth() === currentMonth
    })

    const lastMonthInquiries = inquiries.filter(inq => {
      const date = new Date(inq.EnquiryDate || inq.EnquiryDate1)
      return date.getMonth() === currentMonth - 1
    })

    // Calculate change percentages
    const inquiryChange = lastMonthInquiries.length > 0
      ? Math.round(((thisMonthInquiries.length - lastMonthInquiries.length) / lastMonthInquiries.length) * 100)
      : 0

    const conversionRate = totalInquiries > 0
      ? ((conversions / totalInquiries) * 100).toFixed(1)
      : "0.0"

    const kpiData = {
      totalInquiries,
      completed,
      conversions,
      activeClients,
      inquiryChange,
      conversionRate,
      rawInquiries: inquiries,
      rawQuotations: allQuotations
    }

    logger.log('✅ KPI Data calculated:', {
      totalInquiries,
      completed,
      conversions,
      activeClients,
      inquiryChange,
      conversionRate: Number(conversionRate)
    })

    return {
      success: true,
      data: kpiData
    }
  } catch (error: any) {
    logger.error('Error fetching analytics KPIs:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch analytics data'
    }
  }
}

// Get monthly trend data
export async function getMonthlyTrends(kamFilter?: string) {
  try {
    // Fetch both inquiries and quotations without date filter
    const [inquiriesResponse, quotationsResponse] = await Promise.all([
      EnquiryAPI.getEnquiries({
        FromDate: '2024-01-01',
        ToDate: '2027-12-31',
        ApplydateFilter: 'N',
        RadioValue: 'All',
      }, null),
      QuotationsAPI.getQuotations({
        FilterSTR: 'All',
        FromDate: '2024-01-01',
        ToDate: '2027-12-31',
      }, null)
    ])

    if (!inquiriesResponse.success || !inquiriesResponse.data) {
      return { success: false, error: 'Failed to fetch inquiries' }
    }

    const allInquiries = inquiriesResponse.data as EnquiryItem[]
    const allQuotations = quotationsResponse.success ? (quotationsResponse.data || []) : []

    // Filter by KAM if specified
    const inquiries = kamFilter
      ? allInquiries.filter(inq => inq.SalesRepresentative === kamFilter)
      : allInquiries

    const quotations = kamFilter
      ? allQuotations.filter((q: any) => q.SalesRepresentative === kamFilter || q.SalesEmployeeName === kamFilter)
      : allQuotations

    // Group by month (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const monthlyData = []

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]

      const monthInquiries = inquiries.filter(inq => {
        const date = new Date(inq.EnquiryDate || inq.EnquiryDate1)
        return date.getMonth() === monthIndex
      })

      // Count actual quotations for this month
      const monthQuotations = quotations.filter((q: any) => {
        const date = new Date(q.BookingDate || q.QuotationDate)
        return date.getMonth() === monthIndex
      })

      const monthConversions = monthInquiries.filter(inq => {
        const status = (inq.Status || inq.Status1 || '').toLowerCase()
        return status.includes('convert') || status.includes('order') || status.includes('won')
      })

      monthlyData.push({
        month: monthName,
        inquiries: monthInquiries.length,
        quotations: monthQuotations.length,
        conversions: monthConversions.length
      })
    }

    return {
      success: true,
      data: monthlyData
    }
  } catch (error: any) {
    logger.error('Error fetching monthly trends:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch monthly trends'
    }
  }
}

// Get conversion funnel data
export async function getConversionFunnel(kamFilter?: string) {
  try {
    // Fetch both inquiries and quotations without date filter
    const [inquiriesResponse, quotationsResponse] = await Promise.all([
      EnquiryAPI.getEnquiries({
        FromDate: '2024-01-01',
        ToDate: '2027-12-31',
        ApplydateFilter: 'N',
        RadioValue: 'All',
      }, null),
      QuotationsAPI.getQuotations({
        FilterSTR: 'All',
        FromDate: '2024-01-01',
        ToDate: '2027-12-31',
      }, null)
    ])

    if (!inquiriesResponse.success || !inquiriesResponse.data) {
      return { success: false, error: 'Failed to fetch data' }
    }

    const allInquiries = inquiriesResponse.data as EnquiryItem[]
    const allQuotations = quotationsResponse.success ? (quotationsResponse.data || []) : []

    // Filter by KAM if specified
    const inquiries = kamFilter
      ? allInquiries.filter(inq => inq.SalesRepresentative === kamFilter)
      : allInquiries

    const quotations = kamFilter
      ? allQuotations.filter((q: any) => q.SalesRepresentative === kamFilter || q.SalesEmployeeName === kamFilter)
      : allQuotations

    const totalInquiries = inquiries.length

    // Count actual quotations
    const quotationsCount = quotations.length

    // Count approved quotations (status contains 'approved' or 'approve')
    const approved = quotations.filter((q: any) => {
      const status = (q.Status || q.BookingStatus || '').toLowerCase()
      return status.includes('approv') && !status.includes('disapprov')
    }).length

    // Count conversions/orders
    const conversions = inquiries.filter(inq => {
      const status = (inq.Status || inq.Status1 || '').toLowerCase()
      return status.includes('convert') || status.includes('order') || status.includes('won')
    }).length

    const funnelData = [
      {
        stage: "Inquiries",
        value: totalInquiries,
        percentage: 100
      },
      {
        stage: "Quotations",
        value: quotationsCount,
        percentage: totalInquiries > 0 ? Math.round((quotationsCount / totalInquiries) * 100) : 0
      },
      {
        stage: "Approved",
        value: approved,
        percentage: totalInquiries > 0 ? Math.round((approved / totalInquiries) * 100) : 0
      },
      {
        stage: "Orders",
        value: conversions,
        percentage: totalInquiries > 0 ? Math.round((conversions / totalInquiries) * 100) : 0
      }
    ]

    return {
      success: true,
      data: funnelData
    }
  } catch (error: any) {
    logger.error('Error fetching conversion funnel:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch conversion funnel'
    }
  }
}

// Get sales vs target data (mock for now, needs sales data API)
export async function getSalesVsTarget(kamFilter?: string) {
  try {
    // This would need actual sales/revenue data from your backend
    // For now, returning structure that can be populated later
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentMonth = new Date().getMonth()
    const salesData = []

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      salesData.push({
        month: months[monthIndex],
        sales: 0, // TODO: Replace with actual sales data
        target: 0 // TODO: Replace with actual target data
      })
    }

    return {
      success: true,
      data: salesData,
      note: 'Sales data needs to be connected to revenue API'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch sales data'
    }
  }
}

// Get status distribution
export async function getStatusDistribution(kamFilter?: string) {
  try {
    // Fetch all inquiries without date filter
    const inquiriesResponse = await EnquiryAPI.getEnquiries({
      FromDate: '2024-01-01',
      ToDate: '2027-12-31',
      ApplydateFilter: 'N',
      RadioValue: 'All',
    }, null)

    if (!inquiriesResponse.success || !inquiriesResponse.data) {
      return { success: false, error: 'Failed to fetch inquiries' }
    }

    const allInquiries = inquiriesResponse.data as EnquiryItem[]

    // Filter by KAM if specified
    const inquiries = kamFilter
      ? allInquiries.filter(inq => inq.SalesRepresentative === kamFilter)
      : allInquiries

    // Count by status
    const statusCounts: Record<string, number> = {}
    inquiries.forEach(inq => {
      const status = inq.Status || inq.Status1 || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    // Map to dashboard format
    const statusData = Object.entries(statusCounts).map(([name, count]) => {
      // Assign colors based on status
      let color = '#005180'
      if (name.toLowerCase().includes('convert')) color = '#78BE20'
      else if (name.toLowerCase().includes('sent')) color = '#005180'
      else if (name.toLowerCase().includes('approve')) color = '#10b981'
      else if (name.toLowerCase().includes('disapprove')) color = '#ef4444'
      else if (name.toLowerCase().includes('commercial')) color = '#f59e0b'

      return { name, count, color }
    })

    return {
      success: true,
      data: statusData
    }
  } catch (error: any) {
    logger.error('Error fetching status distribution:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch status distribution'
    }
  }
}

// Get projects by type distribution
export async function getProjectsByType(kamFilter?: string) {
  try {
    // Fetch all inquiries without date filter
    const inquiriesResponse = await EnquiryAPI.getEnquiries({
      FromDate: '2024-01-01',
      ToDate: '2027-12-31',
      ApplydateFilter: 'N',
      RadioValue: 'All',
    }, null)

    if (!inquiriesResponse.success || !inquiriesResponse.data) {
      return { success: false, error: 'Failed to fetch inquiries' }
    }

    const allInquiries = inquiriesResponse.data as EnquiryItem[]

    // Filter by KAM if specified
    const inquiries = kamFilter
      ? allInquiries.filter(inq => inq.SalesRepresentative === kamFilter)
      : allInquiries

    // Count by EnquiryType (SDO, JDO, etc.) or CategoryName as fallback
    const typeCounts: Record<string, number> = {}
    inquiries.forEach(inq => {
      // Use EnquiryType first (for SDO/JDO), then SalesType, then CategoryName
      const type = inq.EnquiryType || inq.SalesType || inq.CategoryName || 'Other'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    // Define fixed colors for known project types
    const typeColors: Record<string, string> = {
      'SDO': '#005180',
      'JDO': '#78BE20',
      'Commercial': '#B92221',
      'PN': '#0066a1',
      'Sample': '#f59e0b',
      'New': '#10b981',
      'Repeat': '#6366f1',
    }

    const defaultColors = ['#005180', '#78BE20', '#B92221', '#0066a1', '#f59e0b', '#10b981']
    let colorIndex = 0

    const typeData = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      color: typeColors[type] || defaultColors[colorIndex++ % defaultColors.length]
    }))

    // Sort by count descending
    typeData.sort((a, b) => b.count - a.count)

    return {
      success: true,
      data: typeData
    }
  } catch (error: any) {
    logger.error('Error fetching projects by type:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch projects by type'
    }
  }
}
