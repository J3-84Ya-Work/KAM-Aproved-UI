"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell, Area, AreaChart, Pie, PieChart } from "recharts"
import { ArrowUpRight, TrendingUp, TrendingDown, Download, Calendar, Target, DollarSign, Package, Users, FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getViewableKAMs, getCurrentUserHODName, isHOD, isKAM } from "@/lib/permissions"
import { getAnalyticsKPIs, getMonthlyTrends, getConversionFunnel, getProjectsByType } from "@/lib/analytics-api"

// KPI Data - Base data for all KAMs combined
const baseKpiData: Record<string, any> = {
  all: [
    {
      title: "Total Inquiries",
      value: "234",
      change: "-4%",
      trend: "down",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-[#005180]/5 to-[#005180]/10",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "189",
      change: "+18%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "142",
      change: "-6%",
      trend: "down",
      icon: Package,
      color: "#005180",
      bgGradient: "from-[#005180]/10 to-[#005180]/15",
      comparison: "conversion rate 60.7%",
    },
    {
      title: "Active Clients",
      value: "87",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
      comparison: "active this month",
    },
  ],
  "Rajesh Kumar": [
    {
      title: "Total Inquiries",
      value: "62",
      change: "-5%",
      trend: "down",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-[#005180]/5 to-[#005180]/10",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "51",
      change: "+20%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "38",
      change: "-8%",
      trend: "down",
      icon: Package,
      color: "#005180",
      bgGradient: "from-[#005180]/10 to-[#005180]/15",
      comparison: "conversion rate 61.3%",
    },
    {
      title: "Active Clients",
      value: "23",
      change: "+6%",
      trend: "up",
      icon: Users,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
      comparison: "active this month",
    },
  ],
  "Amit Patel": [
    {
      title: "Total Inquiries",
      value: "58",
      change: "-8%",
      trend: "down",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-[#005180]/5 to-[#005180]/10",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "47",
      change: "+16%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "35",
      change: "-10%",
      trend: "down",
      icon: Package,
      color: "#005180",
      bgGradient: "from-[#005180]/10 to-[#005180]/15",
      comparison: "conversion rate 60.3%",
    },
    {
      title: "Active Clients",
      value: "21",
      change: "+4%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
      comparison: "active this month",
    },
  ],
  "Priya Sharma": [
    {
      title: "Total Inquiries",
      value: "65",
      change: "+14%",
      trend: "up",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-[#005180]/5 to-[#005180]/10",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "52",
      change: "-5%",
      trend: "down",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "39",
      change: "+26%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-[#005180]/10 to-[#005180]/15",
      comparison: "conversion rate 60.0%",
    },
    {
      title: "Active Clients",
      value: "24",
      change: "-3%",
      trend: "down",
      icon: Users,
      color: "#005180",
      bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
      comparison: "active this month",
    },
  ],
  "Sneha Gupta": [
    {
      title: "Total Inquiries",
      value: "49",
      change: "-12%",
      trend: "down",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-[#005180]/5 to-[#005180]/10",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "39",
      change: "+15%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "30",
      change: "-7%",
      trend: "down",
      icon: Package,
      color: "#005180",
      bgGradient: "from-[#005180]/10 to-[#005180]/15",
      comparison: "conversion rate 61.2%",
    },
    {
      title: "Active Clients",
      value: "19",
      change: "-2%",
      trend: "down",
      icon: Users,
      color: "#005180",
      bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
      comparison: "active this month",
    },
  ],
  "Suresh Menon Team": [
    {
      title: "Total Inquiries",
      value: "120",
      change: "+13%",
      trend: "up",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-[#005180]/5 to-[#005180]/10",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "98",
      change: "+18%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "73",
      change: "+25%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-[#005180]/10 to-[#005180]/15",
      comparison: "conversion rate 60.8%",
    },
    {
      title: "Active Clients",
      value: "44",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
      comparison: "active this month",
    },
  ],
  "Kavita Reddy Team": [
    {
      title: "Total Inquiries",
      value: "114",
      change: "+11%",
      trend: "up",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-[#005180]/5 to-[#005180]/10",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "91",
      change: "+17%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "69",
      change: "+25%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-[#005180]/10 to-[#005180]/15",
      comparison: "conversion rate 60.5%",
    },
    {
      title: "Active Clients",
      value: "43",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
      comparison: "active this month",
    },
  ],
} as Record<string, typeof baseKpiData.all>

// Status Legend Data
const statusLegend = [
  { name: "Converted", color: "#78BE20", count: 45 },
  { name: "Sent to Customer", color: "#005180", count: 62 },
  { name: "Approved", color: "#10b981", count: 28 },
  { name: "Disapprove", color: "#ef4444", count: 12 },
  { name: "Commercial Release", color: "#f59e0b", count: 18 },
]

// Chart Data - Base data structures
const baseMonthlyInquiriesData: Record<string, any> = {
  all: [
    { month: "Jan", inquiries: 45, quotations: 30, conversions: 18 },
    { month: "Feb", inquiries: 52, quotations: 35, conversions: 22 },
    { month: "Mar", inquiries: 48, quotations: 32, conversions: 20 },
    { month: "Apr", inquiries: 61, quotations: 42, conversions: 28 },
    { month: "May", inquiries: 55, quotations: 38, conversions: 24 },
    { month: "Jun", inquiries: 67, quotations: 45, conversions: 30 },
  ],
  "Rajesh Kumar": [
    { month: "Jan", inquiries: 12, quotations: 8, conversions: 5 },
    { month: "Feb", inquiries: 14, quotations: 9, conversions: 6 },
    { month: "Mar", inquiries: 13, quotations: 9, conversions: 5 },
    { month: "Apr", inquiries: 16, quotations: 11, conversions: 7 },
    { month: "May", inquiries: 15, quotations: 10, conversions: 6 },
    { month: "Jun", inquiries: 18, quotations: 12, conversions: 8 },
  ],
  "Amit Patel": [
    { month: "Jan", inquiries: 11, quotations: 7, conversions: 4 },
    { month: "Feb", inquiries: 13, quotations: 9, conversions: 5 },
    { month: "Mar", inquiries: 12, quotations: 8, conversions: 5 },
    { month: "Apr", inquiries: 15, quotations: 10, conversions: 7 },
    { month: "May", inquiries: 13, quotations: 9, conversions: 6 },
    { month: "Jun", inquiries: 16, quotations: 11, conversions: 7 },
  ],
  "Priya Sharma": [
    { month: "Jan", inquiries: 13, quotations: 8, conversions: 5 },
    { month: "Feb", inquiries: 14, quotations: 10, conversions: 6 },
    { month: "Mar", inquiries: 13, quotations: 9, conversions: 6 },
    { month: "Apr", inquiries: 17, quotations: 12, conversions: 8 },
    { month: "May", inquiries: 15, quotations: 10, conversions: 7 },
    { month: "Jun", inquiries: 18, quotations: 12, conversions: 8 },
  ],
  "Sneha Gupta": [
    { month: "Jan", inquiries: 9, quotations: 7, conversions: 4 },
    { month: "Feb", inquiries: 11, quotations: 7, conversions: 5 },
    { month: "Mar", inquiries: 10, quotations: 6, conversions: 4 },
    { month: "Apr", inquiries: 13, quotations: 9, conversions: 6 },
    { month: "May", inquiries: 12, quotations: 9, conversions: 5 },
    { month: "Jun", inquiries: 15, quotations: 10, conversions: 7 },
  ],
  "Suresh Menon Team": [
    { month: "Jan", inquiries: 23, quotations: 15, conversions: 9 },
    { month: "Feb", inquiries: 27, quotations: 18, conversions: 11 },
    { month: "Mar", inquiries: 25, quotations: 17, conversions: 10 },
    { month: "Apr", inquiries: 31, quotations: 21, conversions: 14 },
    { month: "May", inquiries: 28, quotations: 19, conversions: 12 },
    { month: "Jun", inquiries: 34, quotations: 23, conversions: 15 },
  ],
  "Kavita Reddy Team": [
    { month: "Jan", inquiries: 22, quotations: 15, conversions: 9 },
    { month: "Feb", inquiries: 25, quotations: 17, conversions: 11 },
    { month: "Mar", inquiries: 23, quotations: 15, conversions: 10 },
    { month: "Apr", inquiries: 30, quotations: 21, conversions: 14 },
    { month: "May", inquiries: 27, quotations: 19, conversions: 12 },
    { month: "Jun", inquiries: 33, quotations: 22, conversions: 15 },
  ],
}

const baseSalesVsTargetData: Record<string, any> = {
  all: [
    { month: "Jan", sales: 3.2, target: 3.5 },
    { month: "Feb", sales: 3.8, target: 3.5 },
    { month: "Mar", sales: 3.5, target: 4.0 },
    { month: "Apr", sales: 4.2, target: 4.0 },
    { month: "May", sales: 3.9, target: 4.5 },
    { month: "Jun", sales: 4.8, target: 4.5 },
  ],
  "Rajesh Kumar": [
    { month: "Jan", sales: 0.85, target: 0.9 },
    { month: "Feb", sales: 1.0, target: 0.9 },
    { month: "Mar", sales: 0.92, target: 1.0 },
    { month: "Apr", sales: 1.1, target: 1.0 },
    { month: "May", sales: 1.02, target: 1.1 },
    { month: "Jun", sales: 1.25, target: 1.1 },
  ],
  "Amit Patel": [
    { month: "Jan", sales: 0.78, target: 0.85 },
    { month: "Feb", sales: 0.92, target: 0.85 },
    { month: "Mar", sales: 0.85, target: 0.95 },
    { month: "Apr", sales: 1.02, target: 0.95 },
    { month: "May", sales: 0.95, target: 1.1 },
    { month: "Jun", sales: 1.15, target: 1.1 },
  ],
  "Priya Sharma": [
    { month: "Jan", sales: 0.88, target: 0.9 },
    { month: "Feb", sales: 1.05, target: 0.9 },
    { month: "Mar", sales: 0.95, target: 1.0 },
    { month: "Apr", sales: 1.15, target: 1.0 },
    { month: "May", sales: 1.08, target: 1.15 },
    { month: "Jun", sales: 1.32, target: 1.15 },
  ],
  "Sneha Gupta": [
    { month: "Jan", sales: 0.69, target: 0.75 },
    { month: "Feb", sales: 0.83, target: 0.75 },
    { month: "Mar", sales: 0.78, target: 0.85 },
    { month: "Apr", sales: 0.93, target: 0.85 },
    { month: "May", sales: 0.85, target: 1.0 },
    { month: "Jun", sales: 1.08, target: 1.0 },
  ],
  "Suresh Menon Team": [
    { month: "Jan", sales: 1.63, target: 1.75 },
    { month: "Feb", sales: 1.92, target: 1.75 },
    { month: "Mar", sales: 1.77, target: 1.95 },
    { month: "Apr", sales: 2.12, target: 1.95 },
    { month: "May", sales: 1.97, target: 2.2 },
    { month: "Jun", sales: 2.4, target: 2.2 },
  ],
  "Kavita Reddy Team": [
    { month: "Jan", sales: 1.57, target: 1.65 },
    { month: "Feb", sales: 1.88, target: 1.65 },
    { month: "Mar", sales: 1.73, target: 1.85 },
    { month: "Apr", sales: 2.08, target: 1.85 },
    { month: "May", sales: 1.93, target: 2.15 },
    { month: "Jun", sales: 2.4, target: 2.15 },
  ],
}

const baseConversionFunnelData: Record<string, any> = {
  all: [
    { stage: "Inquiries", value: 234, percentage: 100 },
    { stage: "Quotations", value: 142, percentage: 60.7 },
    { stage: "Approved", value: 98, percentage: 41.9 },
    { stage: "Orders", value: 72, percentage: 30.8 },
  ],
  "Rajesh Kumar": [
    { stage: "Inquiries", value: 62, percentage: 100 },
    { stage: "Quotations", value: 38, percentage: 61.3 },
    { stage: "Approved", value: 26, percentage: 41.9 },
    { stage: "Orders", value: 19, percentage: 30.6 },
  ],
  "Amit Patel": [
    { stage: "Inquiries", value: 58, percentage: 100 },
    { stage: "Quotations", value: 35, percentage: 60.3 },
    { stage: "Approved", value: 24, percentage: 41.4 },
    { stage: "Orders", value: 18, percentage: 31.0 },
  ],
  "Priya Sharma": [
    { stage: "Inquiries", value: 65, percentage: 100 },
    { stage: "Quotations", value: 39, percentage: 60.0 },
    { stage: "Approved", value: 27, percentage: 41.5 },
    { stage: "Orders", value: 20, percentage: 30.8 },
  ],
  "Sneha Gupta": [
    { stage: "Inquiries", value: 49, percentage: 100 },
    { stage: "Quotations", value: 30, percentage: 61.2 },
    { stage: "Approved", value: 21, percentage: 42.9 },
    { stage: "Orders", value: 15, percentage: 30.6 },
  ],
  "Suresh Menon Team": [
    { stage: "Inquiries", value: 120, percentage: 100 },
    { stage: "Quotations", value: 73, percentage: 60.8 },
    { stage: "Approved", value: 50, percentage: 41.7 },
    { stage: "Orders", value: 37, percentage: 30.8 },
  ],
  "Kavita Reddy Team": [
    { stage: "Inquiries", value: 114, percentage: 100 },
    { stage: "Quotations", value: 69, percentage: 60.5 },
    { stage: "Approved", value: 48, percentage: 42.1 },
    { stage: "Orders", value: 35, percentage: 30.7 },
  ],
} as Record<string, typeof baseConversionFunnelData.all>

const projectsByTypeData = [
  { type: "SDO", count: 42, color: "#005180" },
  { type: "JDO", count: 35, color: "#78BE20" },
  { type: "Commercial", count: 58, color: "#B92221" },
  { type: "PN", count: 28, color: "#005180" },
]

const customerSegmentData = [
  { segment: "Enterprise", value: 45, color: "#005180" },
  { segment: "SMB", value: 30, color: "#78BE20" },
  { segment: "Startup", value: 12, color: "#0066a1" },
]

const marginAnalysisData = [
  { range: "<5%", count: 12, color: "#ef4444" },
  { range: "5-10%", count: 28, color: "#f59e0b" },
  { range: "10-15%", count: 45, color: "#78BE20" },
  { range: ">15%", count: 38, color: "#10b981" },
]

const weeklyPerformanceData = [
  { week: "W1", performance: 85, target: 80 },
  { week: "W2", performance: 92, target: 85 },
  { week: "W3", performance: 88, target: 85 },
  { week: "W4", performance: 95, target: 90 },
]

const regionalSalesData = [
  { region: "North", sales: 1.2 },
  { region: "South", sales: 1.5 },
  { region: "East", sales: 0.8 },
  { region: "West", sales: 1.3 },
]

const topCustomersData = [
  { name: "Acme Corp", revenue: 0.85, orders: 24 },
  { name: "TechStart Inc", revenue: 0.72, orders: 18 },
  { name: "Global Traders", revenue: 0.68, orders: 22 },
]

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedHod, setSelectedHod] = useState("all")
  const [selectedKam, setSelectedKam] = useState("all")
  const [realKpiData, setRealKpiData] = useState<any>(null)
  const [realMonthlyData, setRealMonthlyData] = useState<any>(null)
  const [realConversionData, setRealConversionData] = useState<any>(null)
  const [realProjectsData, setRealProjectsData] = useState<any>(null)

  // Get viewable KAMs based on user role
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const currentUserHod = getCurrentUserHODName()
  const isHODUser = isHOD() // Check if user is HOD
  const isKAMUser = isKAM() // Check if user is KAM

  // HOD-KAM mapping
  const hodKamMapping = {
    "Suresh Menon": ["Rajesh Kumar", "Amit Patel"],
    "Kavita Reddy": ["Priya Sharma", "Sneha Gupta"],
  } as const

  const hodNames = ["Suresh Menon", "Kavita Reddy"]

  // Get KAMs based on selected HOD or user role
  const getAvailableKams = () => {
    // If user is restricted (KAM or HOD), only show their viewable KAMs
    if (isRestrictedUser) {
      return viewableKams
    }

    // Vertical Head can filter by any HOD
    if (selectedHod === "all") {
      return ["Rajesh Kumar", "Amit Patel", "Priya Sharma", "Sneha Gupta"]
    }
    const kams = hodKamMapping[selectedHod as keyof typeof hodKamMapping]
    return kams ? [...kams] : []
  }

  const availableKams: string[] = getAvailableKams()

  // Auto-select HOD/KAM for restricted users
  useEffect(() => {
    // If user is a HOD, set their name as selected HOD
    if (currentUserHod) {
      setSelectedHod(currentUserHod)
    }

    // If user is a KAM (single viewable KAM), auto-select that KAM
    if (viewableKams.length === 1) {
      setSelectedKam(viewableKams[0])
    }
  }, [currentUserHod, viewableKams])

  // Reset KAM selection when HOD changes and selected KAM is not in the new HOD's team
  useEffect(() => {
    if (selectedHod !== "all" && selectedKam !== "all" && !availableKams.includes(selectedKam)) {
      setSelectedKam("all")
    }
  }, [selectedHod, selectedKam, availableKams])

  // Auto-update HOD when KAM is selected (for Vertical Head only)
  useEffect(() => {
    // Only for Vertical Head users (not restricted)
    if (!isRestrictedUser && selectedKam !== "all") {
      // Find which HOD this KAM belongs to
      for (const [hod, kams] of Object.entries(hodKamMapping)) {
        if ((kams as readonly string[]).includes(selectedKam)) {
          setSelectedHod(hod)
          break
        }
      }
    }
  }, [selectedKam, isRestrictedUser, hodKamMapping])

  // Auto-update KAM to "all" when "All HODs" is selected (for Vertical Head only)
  useEffect(() => {
    // Only for Vertical Head users (not restricted)
    if (!isRestrictedUser && selectedHod === "all") {
      setSelectedKam("all")
    }
  }, [selectedHod, isRestrictedUser])

  // Get filtered data based on selected HOD and KAM
  const getFilteredData = () => {
    console.log('📊 getFilteredData called - realKpiData:', realKpiData)
    console.log('📊 getFilteredData called - realMonthlyData:', realMonthlyData)
    console.log('📊 getFilteredData called - realConversionData:', realConversionData)

    // Use real data if available
    if (realKpiData && realMonthlyData && realConversionData) {
      console.log('✅ Using real data for dashboard')
      // Build KPI data from real analytics
      const kpiData = [
        {
          title: "Total Inquiries",
          value: String(realKpiData.totalInquiries || 0),
          change: `${realKpiData.inquiryChange || 0}%`,
          trend: (realKpiData.inquiryChange || 0) >= 0 ? "up" : "down",
          icon: FileText,
          color: "#005180",
          bgGradient: "from-[#005180]/5 to-[#005180]/10",
          comparison: "vs last month",
        },
        {
          title: "Completed",
          value: String(realKpiData.completed || 0),
          change: "+0%",
          trend: "up",
          icon: CheckCircle,
          color: "#78BE20",
          bgGradient: "from-[#78BE20]/5 to-[#78BE20]/10",
          comparison: "vs last month",
        },
        {
          title: "Conversions",
          value: String(realKpiData.conversions || 0),
          change: "0%",
          trend: "up",
          icon: Package,
          color: "#005180",
          bgGradient: "from-[#005180]/10 to-[#005180]/15",
          comparison: `conversion rate ${realKpiData.conversionRate}%`,
        },
        {
          title: "Active Clients",
          value: String(realKpiData.activeClients || 0),
          change: "+0%",
          trend: "up",
          icon: Users,
          color: "#78BE20",
          bgGradient: "from-[#78BE20]/10 to-[#78BE20]/15",
          comparison: "active this month",
        },
      ]

      const result = {
        kpiData,
        monthlyInquiriesData: realMonthlyData || baseMonthlyInquiriesData.all,
        salesVsTargetData: baseSalesVsTargetData.all, // Keep using base data for sales (not in API yet)
        conversionFunnelData: realConversionData || baseConversionFunnelData.all,
      }
      console.log('📤 Returning real data result:', result)
      return result
    }

    console.log('⚠️ Fallback to base data - real data not loaded yet')
    // Fallback to base data if real data not loaded yet
    // If individual KAM is selected, show their data
    if (selectedKam !== "all") {
      return {
        kpiData: baseKpiData[selectedKam] || baseKpiData.all,
        monthlyInquiriesData: baseMonthlyInquiriesData[selectedKam] || baseMonthlyInquiriesData.all,
        salesVsTargetData: baseSalesVsTargetData[selectedKam] || baseSalesVsTargetData.all,
        conversionFunnelData: baseConversionFunnelData[selectedKam] || baseConversionFunnelData.all,
      }
    }

    // Check if HOD user and return team-specific combined data
    if (isHODUser && currentUserHod) {
      const teamKey = `${currentUserHod} Team`
      return {
        kpiData: baseKpiData[teamKey] || baseKpiData.all,
        monthlyInquiriesData: baseMonthlyInquiriesData[teamKey] || baseMonthlyInquiriesData.all,
        salesVsTargetData: baseSalesVsTargetData[teamKey] || baseSalesVsTargetData.all,
        conversionFunnelData: baseConversionFunnelData[teamKey] || baseConversionFunnelData.all,
      }
    }

    // Check if Vertical Head has selected a specific HOD
    if (!isRestrictedUser && selectedHod !== "all") {
      const teamKey = `${selectedHod} Team`
      return {
        kpiData: baseKpiData[teamKey] || baseKpiData.all,
        monthlyInquiriesData: baseMonthlyInquiriesData[teamKey] || baseMonthlyInquiriesData.all,
        salesVsTargetData: baseSalesVsTargetData[teamKey] || baseSalesVsTargetData.all,
        conversionFunnelData: baseConversionFunnelData[teamKey] || baseConversionFunnelData.all,
      }
    }

    // Vertical Head with "All HODs" selected or others see all data
    return {
      kpiData: baseKpiData.all,
      monthlyInquiriesData: baseMonthlyInquiriesData.all,
      salesVsTargetData: baseSalesVsTargetData.all,
      conversionFunnelData: baseConversionFunnelData.all,
    }
  }

  const { kpiData, monthlyInquiriesData, salesVsTargetData, conversionFunnelData } = getFilteredData()

  // Use real projects data if available
  const projectsByTypeData = realProjectsData || [
    { type: "SDO", count: 42, color: "#005180" },
    { type: "JDO", count: 35, color: "#78BE20" },
    { type: "Commercial", count: 58, color: "#B92221" },
    { type: "PN", count: 28, color: "#0066a1" },
  ]

  // Fetch real analytics data
  useEffect(() => {
    const fetchRealData = async () => {
      console.log('🔄 Dashboard - Starting data fetch for selectedKam:', selectedKam)
      setIsLoading(true)
      try {
        // Determine which KAM to filter by
        let kamFilter: string | undefined = undefined
        if (selectedKam !== 'all') {
          kamFilter = selectedKam
        }

        console.log('🔍 Dashboard - Fetching with kamFilter:', kamFilter)

        // Fetch all data in parallel
        const [kpisResponse, monthlyResponse, conversionResponse, projectsResponse] = await Promise.all([
          getAnalyticsKPIs(kamFilter),
          getMonthlyTrends(kamFilter),
          getConversionFunnel(kamFilter),
          getProjectsByType(kamFilter)
        ])

        console.log('📥 Dashboard - KPIs Response:', kpisResponse)
        console.log('📥 Dashboard - Monthly Response:', monthlyResponse)
        console.log('📥 Dashboard - Conversion Response:', conversionResponse)
        console.log('📥 Dashboard - Projects Response:', projectsResponse)

        if (kpisResponse.success && kpisResponse.data) {
          console.log('✅ Setting realKpiData:', kpisResponse.data)
          setRealKpiData(kpisResponse.data)
        } else {
          console.error('❌ KPIs fetch failed or no data')
        }

        if (monthlyResponse.success && monthlyResponse.data) {
          console.log('✅ Setting realMonthlyData:', monthlyResponse.data)
          setRealMonthlyData(monthlyResponse.data)
        } else {
          console.error('❌ Monthly data fetch failed or no data')
        }

        if (conversionResponse.success && conversionResponse.data) {
          console.log('✅ Setting realConversionData:', conversionResponse.data)
          setRealConversionData(conversionResponse.data)
        } else {
          console.error('❌ Conversion data fetch failed or no data')
        }

        if (projectsResponse.success && projectsResponse.data) {
          console.log('✅ Setting realProjectsData:', projectsResponse.data)
          setRealProjectsData(projectsResponse.data)
        } else {
          console.error('❌ Projects data fetch failed or no data')
        }
      } catch (error) {
        console.error('❌ Error fetching analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealData()
  }, [selectedKam])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#005180] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-3 bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20 min-h-screen px-2 pb-2 pt-4">
      {/* HOD and KAM Filters */}
      {!isKAMUser && (
        <div className="flex items-center gap-2 px-2">
          {/* HOD Filter - Only for Vertical Head */}
          {!isRestrictedUser && (
            <div className="flex items-center gap-2 flex-1">
              <Users className="h-5 w-5 text-[#005180] flex-shrink-0" />
              <Select value={selectedHod} onValueChange={setSelectedHod}>
                <SelectTrigger className="w-full h-11 rounded-2xl border-2 border-[#005180]/30 bg-white/90 backdrop-blur-sm hover:border-[#005180] transition-all shadow-sm">
                  <SelectValue placeholder="Select HOD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All HODs</SelectItem>
                  {hodNames.map(hodName => (
                    <SelectItem key={hodName} value={hodName}>{hodName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* KAM Filter - For both Vertical Head and HOD */}
          <div className="flex items-center gap-2 flex-1">
            <Users className="h-5 w-5 text-[#78BE20] flex-shrink-0" />
            <Select value={selectedKam} onValueChange={setSelectedKam}>
              <SelectTrigger className="w-full h-11 rounded-2xl border-2 border-[#78BE20]/30 bg-white/90 backdrop-blur-sm hover:border-[#78BE20] transition-all shadow-sm">
                <SelectValue placeholder="Select KAM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {selectedHod === "all" ? "All KAMs" : `All KAMs (${selectedHod})`}
                </SelectItem>
                {availableKams.map(kamName => (
                  <SelectItem key={kamName} value={kamName}>{kamName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* KPI Tiles - 4 Cards: 2 per row on mobile, 4 in one row on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiData.map((kpi: any, index: number) => {
          // Define color scheme based on card type - using only brand colors with blue text for Card 2
          const colorSchemes = [
            { bg: "bg-gradient-to-br from-blue-50 to-[#005180]/10", iconBg: "bg-[#005180]/15", iconColor: "text-[#005180]", borderColor: "border-[#005180]/30", valueColor: "text-[#005180]", titleColor: "text-[#005180]/80" },
            { bg: "bg-gradient-to-br from-emerald-50 to-[#78BE20]/10", iconBg: "bg-[#78BE20]/15", iconColor: "text-[#78BE20]", borderColor: "border-[#78BE20]/30", valueColor: "text-[#005180]", titleColor: "text-[#005180]/70" },
            { bg: "bg-gradient-to-br from-cyan-50 to-[#005180]/5", iconBg: "bg-[#005180]/12", iconColor: "text-[#005180]", borderColor: "border-[#005180]/25", valueColor: "text-[#005180]", titleColor: "text-[#005180]/70" },
            { bg: "bg-gradient-to-br from-slate-50 to-gray-100", iconBg: "bg-gray-500/15", iconColor: "text-gray-700", borderColor: "border-gray-300", valueColor: "text-gray-800", titleColor: "text-gray-600" },
          ]
          const scheme = colorSchemes[index]

          return (
            <Card
              key={kpi.title}
              className={`${scheme.bg} border-2 ${scheme.borderColor} shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] overflow-hidden relative`}
            >
              <CardContent className="p-4 h-full flex flex-col justify-between relative">
                {/* Icon in top left */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${scheme.iconBg} ${scheme.iconColor} shadow-sm`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>

                  {/* Change percentage badge */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                    kpi.trend === "up"
                      ? "bg-[#78BE20]/20 text-[#78BE20] border border-[#78BE20]/40"
                      : "bg-[#B92221]/20 text-[#B92221] border border-[#B92221]/40"
                  }`}>
                    {kpi.change}
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>

                {/* Value and title */}
                <div className="space-y-1.5">
                  <h3 className={`text-3xl font-bold ${scheme.valueColor} leading-none tracking-tight`}>{kpi.value}</h3>
                  <p className={`text-xs font-semibold ${scheme.titleColor} leading-tight`}>{kpi.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Row 1: Sales vs Target & Conversion Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Chart: Sales vs Target */}
        <Card
          className="border-0 shadow-md bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          style={{
            animationDelay: '400ms',
            animationDuration: '600ms',
            animationFillMode: 'forwards'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Sales vs Target</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ChartContainer config={{ sales: { label: "Sales", color: "#005180" }, target: { label: "Target", color: "#78BE20" } }} className="h-[280px] w-full">
              <ResponsiveContainer>
                <BarChart data={salesVsTargetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="sales" fill="#005180" fillOpacity={1} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" fill="#78BE20" fillOpacity={0.7} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart: Conversion Funnel */}
        <Card
          className="border-0 shadow-md bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          style={{
            animationDelay: '500ms',
            animationDuration: '600ms',
            animationFillMode: 'forwards'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ChartContainer config={{ value: { label: "Count", color: "#005180" } }} className="h-[280px] w-full">
              <ResponsiveContainer>
                <BarChart data={conversionFunnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="stage" type="category" className="text-xs" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#005180" radius={[0, 6, 6, 0]}>
                    {conversionFunnelData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`rgba(0, 81, 128, ${1 - index * 0.2})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Projects by Type & Monthly Inquiries vs Conversions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Chart: Projects by Type */}
        <Card
          className="border-0 shadow-md bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          style={{
            animationDelay: '600ms',
            animationDuration: '600ms',
            animationFillMode: 'forwards'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Projects by Type</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ChartContainer config={{ count: { label: "Projects", color: "#005180" } }} className="h-[280px] w-full">
              <ResponsiveContainer>
                <BarChart data={projectsByTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {projectsByTypeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart: Monthly Inquiries vs Conversions */}
        <Card
          className="border-0 shadow-md bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          style={{
            animationDelay: '700ms',
            animationDuration: '600ms',
            animationFillMode: 'forwards'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Monthly Inquiries vs Conversions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ChartContainer config={{ inquiries: { label: "Inquiries", color: "#005180" }, conversions: { label: "Conversions", color: "#78BE20" } }} className="h-[280px] w-full">
              <ResponsiveContainer>
                <AreaChart data={monthlyInquiriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="inquiries" stackId="1" stroke="#005180" fill="#005180" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="conversions" stackId="2" stroke="#78BE20" fill="#78BE20" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
