"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell, Area, AreaChart, Pie, PieChart } from "recharts"
import { ArrowUpRight, TrendingUp, TrendingDown, Download, Calendar, Target, DollarSign, Package, Users, FileText, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// KPI Data
const kpiData = [
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
]

// Status Legend Data
const statusLegend = [
  { name: "Converted", color: "#78BE20", count: 45 },
  { name: "Sent to Customer", color: "#005180", count: 62 },
  { name: "Approved", color: "#10b981", count: 28 },
  { name: "Disapprove", color: "#ef4444", count: 12 },
  { name: "Commercial Release", color: "#f59e0b", count: 18 },
]

// Chart Data
const monthlyInquiriesData = [
  { month: "Jan", inquiries: 45, quotations: 30, conversions: 18 },
  { month: "Feb", inquiries: 52, quotations: 35, conversions: 22 },
  { month: "Mar", inquiries: 48, quotations: 32, conversions: 20 },
  { month: "Apr", inquiries: 61, quotations: 42, conversions: 28 },
  { month: "May", inquiries: 55, quotations: 38, conversions: 24 },
  { month: "Jun", inquiries: 67, quotations: 45, conversions: 30 },
]

const salesVsTargetData = [
  { month: "Jan", sales: 3.2, target: 3.5 },
  { month: "Feb", sales: 3.8, target: 3.5 },
  { month: "Mar", sales: 3.5, target: 4.0 },
  { month: "Apr", sales: 4.2, target: 4.0 },
  { month: "May", sales: 3.9, target: 4.5 },
  { month: "Jun", sales: 4.8, target: 4.5 },
]

const conversionFunnelData = [
  { stage: "Inquiries", value: 234, percentage: 100 },
  { stage: "Quotations", value: 142, percentage: 60.7 },
  { stage: "Approved", value: 98, percentage: 41.9 },
  { stage: "Orders", value: 72, percentage: 30.8 },
]

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
