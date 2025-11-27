/**
 * Analytics API Module
 * Fetches and processes data for the analytics dashboard
 */

import { EnquiryAPI, QuotationsAPI, type EnquiryItem } from "@/lib/api/enquiry"
import { logger } from "@/lib/logger"

// Helper function to get date range
function getDateRange(period: 'month' | 'quarter' | 'year' = 'month') {
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return { startDate, endDate: now }
}

// Get KPI data for dashboard
export async function getAnalyticsKPIs(kamFilter?: string) {
  try {
    logger.log('🔍 Analytics API - Fetching KPIs, kamFilter:', kamFilter)

    // Get current financial year dates
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    // Fetch all inquiries
    const inquiriesResponse = await EnquiryAPI.getEnquiries({
      FromDate: `${currentYear}-01-01 00:00:00.000`,
      ToDate: `${nextYear}-12-31 23:59:59.999`,
      ApplydateFilter: 'True',
      RadioValue: 'All',
    }, null)

    const quotationsResponse = await QuotationsAPI.getQuotations({
      FilterSTR: 'All',
      FromDate: `${currentYear}-01-01 00:00:00.000`,
      ToDate: `${nextYear}-12-31 23:59:59.999`,
    }, null)

    logger.log('📊 Inquiries Response:', inquiriesResponse)
    logger.log('📊 Quotations Response:', quotationsResponse)

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

    // Completed = inquiries with quotations sent
    const completed = inquiries.filter(inq => {
      const status = (inq.Status || inq.Status1 || '').toLowerCase()
      return status.includes('complete') ||
             status.includes('quotation') ||
             status.includes('sent') ||
             status.includes('approved')
    }).length

    // Conversions = inquiries that became orders
    const conversions = inquiries.filter(inq => {
      const status = (inq.Status || inq.Status1 || '').toLowerCase()
      return status.includes('convert') ||
             status.includes('order') ||
             status.includes('won')
    }).length

    // Active clients = unique clients with inquiries
    const activeClients = new Set(inquiries.map(inq => inq.LedgerID)).size

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
    // Get current financial year dates
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    const inquiriesResponse = await EnquiryAPI.getEnquiries({
      FromDate: `${currentYear}-01-01 00:00:00.000`,
      ToDate: `${nextYear}-12-31 23:59:59.999`,
      ApplydateFilter: 'True',
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

      const monthConversions = monthInquiries.filter(inq =>
        inq.Status?.toLowerCase().includes('converted') ||
        inq.Status?.toLowerCase().includes('order')
      )

      monthlyData.push({
        month: monthName,
        inquiries: monthInquiries.length,
        quotations: Math.floor(monthInquiries.length * 0.65), // Estimate
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
    const kpisResponse = await getAnalyticsKPIs(kamFilter)

    if (!kpisResponse.success || !kpisResponse.data) {
      return { success: false, error: 'Failed to fetch KPIs' }
    }

    const { totalInquiries, completed, conversions } = kpisResponse.data

    // Estimate quotations sent (assuming 60-70% of inquiries get quoted)
    const quotations = Math.floor(totalInquiries * 0.65)

    // Estimate approved (assuming 70% of quotations get approved)
    const approved = Math.floor(quotations * 0.70)

    const funnelData = [
      {
        stage: "Inquiries",
        value: totalInquiries,
        percentage: 100
      },
      {
        stage: "Quotations",
        value: quotations,
        percentage: totalInquiries > 0 ? Math.round((quotations / totalInquiries) * 100) : 0
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
    // Get current financial year dates
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    const inquiriesResponse = await EnquiryAPI.getEnquiries({
      FromDate: `${currentYear}-01-01 00:00:00.000`,
      ToDate: `${nextYear}-12-31 23:59:59.999`,
      ApplydateFilter: 'True',
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
    // Get current financial year dates
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    const inquiriesResponse = await EnquiryAPI.getEnquiries({
      FromDate: `${currentYear}-01-01 00:00:00.000`,
      ToDate: `${nextYear}-12-31 23:59:59.999`,
      ApplydateFilter: 'True',
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

    // Count by category/type
    const typeCounts: Record<string, number> = {}
    inquiries.forEach(inq => {
      const type = inq.CategoryName || 'Other'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    const colors = ['#005180', '#78BE20', '#B92221', '#0066a1']
    const typeData = Object.entries(typeCounts).map(([type, count], index) => ({
      type,
      count,
      color: colors[index % colors.length]
    }))

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
