"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { CardSkeleton, TableSkeleton } from "@/components/loading-skeleton"
import Image from "next/image"

const salesData = [
  { month: "Jan", sales: 45000, target: 50000 },
  { month: "Feb", sales: 52000, target: 50000 },
  { month: "Mar", sales: 48000, target: 55000 },
  { month: "Apr", sales: 61000, target: 55000 },
  { month: "May", sales: 55000, target: 60000 },
  { month: "Jun", sales: 67000, target: 60000 },
]

const pipelineData = [
  { stage: "Draft", count: 15 },
  { stage: "Costing", count: 12 },
  { stage: "Approved", count: 8 },
  { stage: "Quoted", count: 18 },
  { stage: "Won", count: 10 },
]

const conversionData = [
  { stage: "Inquiries", value: 100, percentage: 100 },
  { stage: "Quotations", value: 65, percentage: 65 },
  { stage: "Orders", value: 35, percentage: 35 },
]

const recentInquiries = [
  {
    id: "INQ-001",
    customer: "Acme Corp",
    product: "Packaging Box",
    status: "Costing",
    date: "2h ago",
    priority: "high",
  },
  {
    id: "INQ-002",
    customer: "TechStart Inc",
    product: "Labels",
    status: "Quoted",
    date: "5h ago",
    priority: "medium",
  },
  {
    id: "INQ-003",
    customer: "Global Traders",
    product: "Sheets",
    status: "Draft",
    date: "1d ago",
    priority: "low",
  },
]

const pendingApprovals = [
  {
    id: "QUO-045",
    customer: "Metro Supplies",
    amount: "₹2.45L",
    margin: 12.5,
    validTill: "3d",
  },
  {
    id: "QUO-046",
    customer: "Prime Packaging",
    amount: "₹1.85L",
    margin: 8.2,
    validTill: "5d",
  },
  {
    id: "QUO-047",
    customer: "Swift Logistics",
    amount: "₹3.20L",
    margin: 15.8,
    validTill: "7d",
  },
]

function getMarginColor(margin: number) {
  if (margin >= 15) return "text-green"
  if (margin >= 10) return "text-blue-80"
  return "text-burgundy"
}

function getMarginBadge(margin: number) {
  if (margin >= 15) return "default"
  if (margin >= 10) return "secondary"
  return "destructive"
}

function getStatusColor(status: string) {
  switch (status) {
    case "Quoted":
      return "default"
    case "Costing":
      return "secondary"
    case "Draft":
      return "outline"
    default:
      return "outline"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "outline"
  }
}

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [targetPeriod, setTargetPeriod] = useState("monthly")
  const [selectedChart, setSelectedChart] = useState("sales")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Target data based on period
  const targetData = {
    monthly: {
      target: "₹50L",
      actual: "₹42.5L",
      percentage: 85,
    },
    annual: {
      target: "₹6Cr",
      actual: "₹4.8Cr",
      percentage: 80,
    },
  }

  if (isLoading) {
    return (
      <div className="space-y-3 md:space-y-4 animate-fade-in fixed inset-0">
        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
          <div className="modern-card p-3 md:p-4">
            <TableSkeleton />
          </div>
          <div className="modern-card p-3 md:p-4">
            <TableSkeleton />
          </div>
        </div>
      </div>
    )
  }

  const updatedStats = [
    {
      title: "Completed",
      value: "142",
      change: "+18%",
      icon: "/icons/icons8-task-completed-96.png",
      href: "/projects",
      gradient: "from-green-10 to-green-5",
      iconBg: "bg-green",
      changeColor: "text-green",
    },
    {
      title: "No. Enquiries",
      value: "87",
      change: "+25%",
      icon: "/icons/icons8-enquiry-100.png",
      href: "/inquiries",
      gradient: "from-blue-10 to-blue-5",
      iconBg: "bg-blue",
      changeColor: "text-blue",
    },
    {
      title: "No. POs",
      value: "56",
      change: "+15%",
      icon: "/icons/icons8-pos-terminal-80.png",
      href: "/projects",
      gradient: "from-blue-10 via-green-5 to-burgundy-5",
      iconBg: "gradient-blue-green",
      changeColor: "text-blue-80",
    },
    {
      title: "Approvals",
      value: "42",
      change: "+12%",
      icon: "/icons/approved.png",
      href: "/approvals",
      gradient: "from-burgundy-10 to-burgundy-5",
      iconBg: "bg-burgundy",
      changeColor: "text-burgundy",
    },
  ]

  return (
    <div className="space-y-3 md:space-y-4 animate-slide-up">
      {/* Stats Cards - Mobile optimized */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
        {updatedStats.map((stat, index) => (
          <Link
            key={stat.title}
            href={stat.href}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-slide-up"
          >
            <Card className={`modern-card card-hover-blue h-full overflow-hidden relative group`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
              <CardContent className="p-3 md:p-4 relative z-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="p-1.5 md:p-2">
                      <Image
                        src={stat.icon || "/placeholder.svg"}
                        alt={stat.title}
                        width={32}
                        height={32}
                        className="h-8 w-8 md:h-10 md:w-10 object-contain"
                        priority
                      />
                    </div>
                    <div className={`flex items-center gap-0.5 text-[10px] md:text-sm font-bold ${stat.changeColor}`}>
                      {stat.change}
                      <TrendingUp className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-[10px] md:text-sm font-bold text-muted-foreground leading-tight">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Performance Charts */}
      <Card className="modern-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-3 md:p-4 pb-2 md:pb-3 bg-gradient-to-r from-[#005180]/5 to-transparent">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <div className="h-6 w-1 bg-[#005180] rounded-full" />
              Performance Charts
            </CardTitle>
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger className="w-[140px] md:w-[180px] h-8 text-xs font-semibold">
                <SelectValue placeholder="Select Chart" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales vs Target</SelectItem>
                <SelectItem value="pipeline">Inquiry Pipeline</SelectItem>
                <SelectItem value="conversion">Conversion Funnel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-2">
          {selectedChart === "sales" && (
            <ChartContainer
              config={{
                sales: {
                  label: "Sales",
                  color: "#78BE20",
                },
                target: {
                  label: "Target",
                  color: "#B92221",
                },
              }}
              className="h-[200px] md:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="sales" fill="#78BE20" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#B92221" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {selectedChart === "pipeline" && (
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "#005180",
                },
              }}
              className="h-[200px] md:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="stage" type="category" width={60} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#005180" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {selectedChart === "conversion" && (
            <ChartContainer
              config={{
                value: {
                  label: "Conversion",
                  color: "#005180",
                },
              }}
              className="h-[200px] md:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="stage" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#005180"
                    strokeWidth={3}
                    dot={{ r: 6, fill: "#005180" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Target Card */}
      <Card className="modern-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#78BE20]/5 via-transparent to-[#005180]/5 -z-10" />
        <CardHeader className="p-3 md:p-4 pb-2 md:pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <div className="h-6 w-1 bg-[#78BE20] rounded-full" />
              Target
            </CardTitle>
            <Select value={targetPeriod} onValueChange={setTargetPeriod}>
              <SelectTrigger className="w-[100px] md:w-[120px] h-8 text-xs font-semibold">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          <div className="grid gap-2 md:gap-4 grid-cols-3">
            <div className="space-y-1 md:space-y-2 p-2 md:p-3 rounded-lg bg-[#005180]/5 border-l-4 border-[#005180]">
              <p className="text-[9px] md:text-xs font-bold text-muted-foreground">Target</p>
              <p className="text-base md:text-2xl font-bold text-[#005180]">
                {targetData[targetPeriod as keyof typeof targetData].target}
              </p>
            </div>
            <div className="space-y-1 md:space-y-2 p-2 md:p-3 rounded-lg bg-[#78BE20]/5 border-l-4 border-[#78BE20]">
              <p className="text-[9px] md:text-xs font-bold text-muted-foreground">Actual</p>
              <p className="text-base md:text-2xl font-bold text-[#78BE20]">
                {targetData[targetPeriod as keyof typeof targetData].actual}
              </p>
            </div>
            <div className="space-y-1 md:space-y-2 p-2 md:p-3 rounded-lg bg-gradient-to-br from-[#78BE20]/10 to-[#005180]/10 border-l-4 border-[#78BE20]">
              <p className="text-[9px] md:text-xs font-bold text-muted-foreground">Achievement</p>
              <div className="flex items-baseline gap-1">
                <p className="text-base md:text-2xl font-bold text-foreground">
                  {targetData[targetPeriod as keyof typeof targetData].percentage}%
                </p>
                <Badge
                  variant="default"
                  className="h-4 md:h-6 bg-[#78BE20] hover:bg-[#78BE20]/90 text-[8px] md:text-[10px] font-bold px-1 md:px-2"
                >
                  <TrendingUp className="mr-0.5 h-2 w-2 md:h-3 md:w-3" />
                  <span className="hidden md:inline">Track</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <div className="h-2 md:h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-muted to-muted/50 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#005180] via-[#78BE20] to-[#78BE20] transition-all duration-1000 ease-out rounded-full shadow-lg relative overflow-hidden"
                style={{ width: `${targetData[targetPeriod as keyof typeof targetData].percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
