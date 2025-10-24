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

// KPI Data - Base data for all KAMs combined
const baseKpiData = {
  all: [
    {
      title: "Total Inquiries",
      value: "234",
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-blue-50 to-blue-100",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "189",
      change: "+18%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-green-50 to-green-100",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "142",
      change: "+25%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-indigo-50 to-indigo-100",
      comparison: "conversion rate 60.7%",
    },
    {
      title: "Active Clients",
      value: "87",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-violet-50 to-violet-100",
      comparison: "active this month",
    },
  ],
  "Rajesh Kumar": [
    {
      title: "Total Inquiries",
      value: "62",
      change: "+15%",
      trend: "up",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-blue-50 to-blue-100",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "51",
      change: "+20%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-green-50 to-green-100",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "38",
      change: "+28%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-indigo-50 to-indigo-100",
      comparison: "conversion rate 61.3%",
    },
    {
      title: "Active Clients",
      value: "23",
      change: "+6%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-violet-50 to-violet-100",
      comparison: "active this month",
    },
  ],
  "Amit Patel": [
    {
      title: "Total Inquiries",
      value: "58",
      change: "+10%",
      trend: "up",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-blue-50 to-blue-100",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "47",
      change: "+16%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-green-50 to-green-100",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "35",
      change: "+22%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-indigo-50 to-indigo-100",
      comparison: "conversion rate 60.3%",
    },
    {
      title: "Active Clients",
      value: "21",
      change: "+4%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-violet-50 to-violet-100",
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
      bgGradient: "from-blue-50 to-blue-100",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "52",
      change: "+19%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-green-50 to-green-100",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "39",
      change: "+26%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-indigo-50 to-indigo-100",
      comparison: "conversion rate 60.0%",
    },
    {
      title: "Active Clients",
      value: "24",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-violet-50 to-violet-100",
      comparison: "active this month",
    },
  ],
  "Sneha Gupta": [
    {
      title: "Total Inquiries",
      value: "49",
      change: "+8%",
      trend: "up",
      icon: FileText,
      color: "#005180",
      bgGradient: "from-blue-50 to-blue-100",
      comparison: "vs last month",
    },
    {
      title: "Completed",
      value: "39",
      change: "+15%",
      trend: "up",
      icon: CheckCircle,
      color: "#78BE20",
      bgGradient: "from-green-50 to-green-100",
      comparison: "vs last month",
    },
    {
      title: "Conversions",
      value: "30",
      change: "+23%",
      trend: "up",
      icon: Package,
      color: "#005180",
      bgGradient: "from-indigo-50 to-indigo-100",
      comparison: "conversion rate 61.2%",
    },
    {
      title: "Active Clients",
      value: "19",
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "#005180",
      bgGradient: "from-violet-50 to-violet-100",
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
const baseMonthlyInquiriesData = {
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
} as Record<string, typeof baseMonthlyInquiriesData.all>

const baseSalesVsTargetData = {
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
} as Record<string, typeof baseSalesVsTargetData.all>

const baseConversionFunnelData = {
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
} as Record<string, typeof baseConversionFunnelData.all>

const projectsByTypeData = [
  { type: "SDO", count: 42, color: "#005180" },
  { type: "JDO", count: 35, color: "#5a9518" },
  { type: "Commercial", count: 58, color: "#991b1b" },
  { type: "PN", count: 28, color: "#c2410c" },
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

  // HOD-KAM mapping
  const hodKamMapping = {
    "Suresh Menon": ["Rajesh Kumar", "Amit Patel"],
    "Kavita Reddy": ["Priya Sharma", "Sneha Gupta"],
  } as const

  const hodNames = ["Suresh Menon", "Kavita Reddy"]

  // Get KAMs based on selected HOD
  const getAvailableKams = () => {
    if (selectedHod === "all") {
      return ["Rajesh Kumar", "Amit Patel", "Priya Sharma", "Sneha Gupta"]
    }
    return hodKamMapping[selectedHod as keyof typeof hodKamMapping] || []
  }

  const availableKams = getAvailableKams()

  // Reset KAM selection when HOD changes and selected KAM is not in the new HOD's team
  useEffect(() => {
    if (selectedHod !== "all" && selectedKam !== "all" && !availableKams.includes(selectedKam)) {
      setSelectedKam("all")
    }
  }, [selectedHod])

  // Get filtered data based on selected HOD and KAM
  const getFilteredData = () => {
    // If individual KAM is selected, show their data
    if (selectedKam !== "all") {
      return {
        kpiData: baseKpiData[selectedKam] || baseKpiData.all,
        monthlyInquiriesData: baseMonthlyInquiriesData[selectedKam] || baseMonthlyInquiriesData.all,
        salesVsTargetData: baseSalesVsTargetData[selectedKam] || baseSalesVsTargetData.all,
        conversionFunnelData: baseConversionFunnelData[selectedKam] || baseConversionFunnelData.all,
      }
    }

    // If HOD is selected (but no specific KAM), aggregate all KAMs under that HOD
    if (selectedHod !== "all") {
      const kamsUnderHod = hodKamMapping[selectedHod as keyof typeof hodKamMapping]
      // For now, show the first KAM's data as a placeholder
      // In production, you would aggregate the data from all KAMs under this HOD
      const firstKam = kamsUnderHod[0]
      return {
        kpiData: baseKpiData[firstKam] || baseKpiData.all,
        monthlyInquiriesData: baseMonthlyInquiriesData[firstKam] || baseMonthlyInquiriesData.all,
        salesVsTargetData: baseSalesVsTargetData[firstKam] || baseSalesVsTargetData.all,
        conversionFunnelData: baseConversionFunnelData[firstKam] || baseConversionFunnelData.all,
      }
    }

    // Show all data
    return {
      kpiData: baseKpiData.all,
      monthlyInquiriesData: baseMonthlyInquiriesData.all,
      salesVsTargetData: baseSalesVsTargetData.all,
      conversionFunnelData: baseConversionFunnelData.all,
    }
  }

  const { kpiData, monthlyInquiriesData, salesVsTargetData, conversionFunnelData } = getFilteredData()

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
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 px-2">
        {/* HOD Filter */}
        <div className="flex items-center gap-2 flex-1">
          <Users className="h-5 w-5 text-[#005180]" />
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

        {/* KAM Filter */}
        <div className="flex items-center gap-2 flex-1">
          <Users className="h-5 w-5 text-[#78BE20]" />
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

      {/* KPI Tiles - 4 Square Cards in 2 per row */}
      <div className="grid grid-cols-2 gap-2">
        {kpiData.map((kpi, index) => (
          <Card key={kpi.title} className={`bg-gradient-to-br ${kpi.bgGradient} border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-3 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className={`p-1.5 rounded-lg`} style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-bold whitespace-nowrap ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {kpi.change}
                  {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                </div>
              </div>
              <div className="space-y-0.5 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 leading-none">{kpi.value}</h3>
                <p className="text-xs font-medium text-gray-700 leading-tight">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid - Top 3 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Chart 2: Sales vs Target */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
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

        {/* Chart 3: Conversion Funnel */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
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
                    {conversionFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`rgba(0, 81, 128, ${1 - index * 0.2})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Projects by Type */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
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
                    {projectsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Chart 1: Monthly Inquiries vs Conversions */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
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

      {/* Status Legends - At Bottom */}
      <Card className="border-0 shadow-md bg-white/90 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 gap-2">
            {statusLegend.map((status) => (
              <div key={status.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: status.color }} />
                  <span className="text-sm font-medium text-gray-700">{status.name}</span>
                </div>
                <Badge
                  className="h-6 px-3 text-xs font-bold shadow-sm"
                  style={{ backgroundColor: `${status.color}20`, color: status.color, border: `1px solid ${status.color}40` }}
                >
                  {status.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
