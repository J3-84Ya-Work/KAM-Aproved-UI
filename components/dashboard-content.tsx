"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from "recharts"
import { ArrowUpRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { CardSkeleton, TableSkeleton } from "@/components/loading-skeleton"
import Image from "next/image"

const inquiriesMonthlyData = [
  { week: "Week 1", inquiries: 18, color: "rgba(0, 81, 128, 0.45)" },
  { week: "Week 2", inquiries: 22, color: "rgba(0, 81, 128, 0.6)" },
  { week: "Week 3", inquiries: 27, color: "rgba(0, 81, 128, 0.75)" },
  { week: "Week 4", inquiries: 24, color: "rgba(0, 81, 128, 0.9)" },
]

const inquiryConversionData = [
  { week: "Week 1", inquiries: 18, pos: 6 },
  { week: "Week 2", inquiries: 22, pos: 9 },
  { week: "Week 3", inquiries: 27, pos: 11 },
  { week: "Week 4", inquiries: 24, pos: 10 },
]

const projectsDistributionData = [
  { type: "SDO", count: 24, color: "rgba(0, 81, 128, 0.8)" },
  { type: "JDO", count: 18, color: "rgba(120, 190, 32, 0.8)" },
  { type: "PO", count: 30, color: "rgba(185, 34, 33, 0.8)" },
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
  const [selectedChart, setSelectedChart] = useState("monthlyInquiries")

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
      title: "Approvals",
      value: "42",
      change: "+12%",
      icon: "/icons/approved.png",
      href: "/approvals",
      gradient: "from-burgundy-10 to-burgundy-5",
      iconBg: "bg-burgundy",
      changeColor: "text-burgundy",
    },
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
      title: "Inquiries",
      value: "87",
      change: "+25%",
      icon: "/icons/icons8-enquiry-100.png",
      href: "/inquiries",
      gradient: "from-blue-10 to-blue-5",
      iconBg: "bg-blue",
      changeColor: "text-blue",
    },
    {
      title: "POs",
      value: "56",
      change: "+15%",
      icon: "/icons/icons8-pos-terminal-80.png",
      href: "/projects",
      gradient: "from-blue-10 via-green-5 to-burgundy-5",
      iconBg: "gradient-blue-green",
      changeColor: "text-blue-80",
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
                    <div className={`flex items-center gap-0.5 text-xs md:text-sm font-bold md:font-extrabold ${stat.changeColor}`}>
                      {stat.change}
                      <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-2xl md:text-4xl font-extrabold text-foreground">{stat.value}</div>
                    <p className="text-xs md:text-base font-bold md:font-extrabold text-muted-foreground leading-tight">
                      {stat.title}
                    </p>
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
                <SelectItem value="monthlyInquiries">Monthly Inquiries</SelectItem>
                <SelectItem value="conversion">Inquiries Converted to POs</SelectItem>
                <SelectItem value="projects">Projects by Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-2">
          {selectedChart === "monthlyInquiries" && (
            <ChartContainer
              config={{
                inquiries: {
                  label: "Inquiries",
                  color: "#005180",
                },
              }}
              className="h-[240px] md:h-[320px] w-full border-0 aspect-auto max-h-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inquiriesMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="inquiries" fill="#005180" radius={[4, 4, 0, 0]} stroke="#005180" strokeWidth={1.5}>
                    {inquiriesMonthlyData.map((item) => (
                      <Cell key={item.week} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {selectedChart === "conversion" && (
            <ChartContainer
              config={{
                inquiries: {
                  label: "Inquiries",
                  color: "#78BE20",
                },
                pos: {
                  label: "POs",
                  color: "#B92221",
                },
              }}
              className="h-[240px] md:h-[320px] w-full border-0 aspect-auto max-h-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inquiryConversionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="inquiries"
                    stroke="rgba(120, 190, 32, 0.9)"
                    strokeWidth={3.5}
                    strokeOpacity={0.95}
                    dot={{ r: 6, fill: "rgba(120, 190, 32, 0.9)", stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pos"
                    stroke="rgba(185, 34, 33, 0.85)"
                    strokeWidth={3.5}
                    strokeOpacity={0.9}
                    dot={{ r: 6, fill: "rgba(185, 34, 33, 0.85)", stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {selectedChart === "projects" && (
            <ChartContainer
              config={{
                count: {
                  label: "Projects",
                  color: "#005180",
                },
              }}
              className="h-[240px] md:h-[320px] w-full border-0 aspect-auto max-h-none"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectsDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#005180" radius={[4, 4, 0, 0]} stroke="#02324f" strokeWidth={1.5}>
                    {projectsDistributionData.map((item) => (
                      <Cell key={item.type} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
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
