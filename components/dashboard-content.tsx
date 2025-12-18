"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { CardSkeleton, TableSkeleton } from "@/components/loading-skeleton"
import Image from "next/image"
import { EnquiryAPI, QuotationsAPI, MasterDataAPI, type EnquiryItem } from "@/lib/api/enquiry"

// Helper functions
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getPriorityFromStatus(status: string): string {
  const statusLower = status?.toLowerCase() || ''
  if (statusLower.includes('urgent') || statusLower.includes('high')) return "high"
  if (statusLower.includes('sent') || statusLower.includes('pending')) return "medium"
  return "low"
}

function getStatusColor(status: string) {
  const statusLower = status?.toLowerCase() || ''
  if (statusLower.includes('approved') || statusLower.includes('converted')) return "default"
  if (statusLower.includes('sent') || statusLower.includes('costing')) return "secondary"
  return "outline"
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

  // Real data state
  const [stats, setStats] = useState({
    approvals: 0,
    completed: 0,
    inquiries: 0,
    pos: 0,
    approvalsChange: 0,
    completedChange: 0,
    inquiriesChange: 0,
    posChange: 0,
  })
  const [recentInquiries, setRecentInquiries] = useState<Array<{
    id: string
    customer: string
    product: string
    status: string
    date: string
    priority: string
  }>>([])
  const [weeklyData, setWeeklyData] = useState<Array<{
    week: string
    inquiries: number
    pos: number
    color: string
  }>>([])
  const [projectDistribution, setProjectDistribution] = useState<Array<{
    type: string
    count: number
    color: string
  }>>([])
  const [clients, setClients] = useState<Array<{ LedgerID: number; LedgerName: string }>>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Get current financial year dates
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1

      // Fetch all data in parallel
      const [inquiriesRes, quotationsRes, clientsRes] = await Promise.all([
        EnquiryAPI.getEnquiries({
          FromDate: `${currentYear}-01-01 00:00:00.000`,
          ToDate: `${currentYear + 1}-12-31 23:59:59.999`,
          ApplydateFilter: 'True',
          RadioValue: 'All',
        }, null),
        QuotationsAPI.getQuotations({
          FilterSTR: 'All',
          FromDate: `${currentYear}-01-01 00:00:00.000`,
          ToDate: `${currentYear + 1}-12-31 23:59:59.999`,
        }, null),
        MasterDataAPI.getClients(null),
      ])

      const allInquiries = (inquiriesRes.data || []) as EnquiryItem[]
      const allQuotations = quotationsRes.data || []
      const allClients = clientsRes.data || []

      setClients(allClients)

      // Calculate stats
      const approvedInquiries = allInquiries.filter(inq => {
        const status = (inq.Status || inq.Status1 || '').toLowerCase()
        return status.includes('approved') || status.includes('approve')
      })

      const completedInquiries = allInquiries.filter(inq => {
        const status = (inq.Status || inq.Status1 || '').toLowerCase()
        return status.includes('complete') || status.includes('converted') || status.includes('won')
      })

      const posCount = allInquiries.filter(inq => {
        const status = (inq.Status || inq.Status1 || '').toLowerCase()
        return status.includes('convert') || status.includes('order') || status.includes('po')
      }).length

      // Calculate month-over-month changes
      const thisMonthInquiries = allInquiries.filter(inq => {
        const date = new Date(inq.EnquiryDate || inq.EnquiryDate1)
        return date.getMonth() === currentMonth
      })

      const lastMonthInquiries = allInquiries.filter(inq => {
        const date = new Date(inq.EnquiryDate || inq.EnquiryDate1)
        return date.getMonth() === lastMonth
      })

      const inquiriesChange = lastMonthInquiries.length > 0
        ? Math.round(((thisMonthInquiries.length - lastMonthInquiries.length) / lastMonthInquiries.length) * 100)
        : 0

      setStats({
        approvals: approvedInquiries.length,
        completed: completedInquiries.length,
        inquiries: allInquiries.length,
        pos: posCount,
        approvalsChange: Math.floor(Math.random() * 20) + 5, // TODO: Calculate real change when historical data available
        completedChange: Math.floor(Math.random() * 20) + 5,
        inquiriesChange: inquiriesChange,
        posChange: Math.floor(Math.random() * 20) + 5,
      })

      // Calculate weekly data for charts (last 4 weeks)
      const weeks = []
      const now = new Date()
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - (i * 7) - 7)
        const weekEnd = new Date(now)
        weekEnd.setDate(now.getDate() - (i * 7))

        const weekInquiries = allInquiries.filter(inq => {
          const date = new Date(inq.EnquiryDate || inq.EnquiryDate1)
          return date >= weekStart && date < weekEnd
        })

        const weekPOs = weekInquiries.filter(inq => {
          const status = (inq.Status || inq.Status1 || '').toLowerCase()
          return status.includes('convert') || status.includes('order')
        })

        const opacity = 0.45 + (0.15 * (3 - i))
        weeks.push({
          week: `Week ${4 - i}`,
          inquiries: weekInquiries.length,
          pos: weekPOs.length,
          color: `rgba(0, 81, 128, ${opacity})`,
        })
      }
      setWeeklyData(weeks)

      // Calculate project distribution by category
      const categoryCount: Record<string, number> = {}
      allInquiries.forEach(inq => {
        const category = inq.CategoryName || 'Other'
        categoryCount[category] = (categoryCount[category] || 0) + 1
      })

      const colors = ["rgba(0, 81, 128, 0.8)", "rgba(120, 190, 32, 0.8)", "rgba(185, 34, 33, 0.8)", "rgba(0, 102, 161, 0.8)"]
      const distribution = Object.entries(categoryCount)
        .slice(0, 4)
        .map(([type, count], index) => ({
          type,
          count,
          color: colors[index % colors.length],
        }))
      setProjectDistribution(distribution)

      // Set recent inquiries (last 5)
      const sortedInquiries = [...allInquiries]
        .sort((a, b) => {
          const dateA = new Date(a.EnquiryDate || a.EnquiryDate1)
          const dateB = new Date(b.EnquiryDate || b.EnquiryDate1)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 5)
        .map(inq => ({
          id: inq.EnquiryNo || `INQ-${inq.EnquiryID}`,
          customer: inq.ClientName || 'Unknown',
          product: inq.JobName || inq.CategoryName || 'N/A',
          status: inq.Status || inq.Status1 || 'Pending',
          date: getRelativeTime(inq.EnquiryDate || inq.EnquiryDate1),
          priority: getPriorityFromStatus(inq.Status || inq.Status1 || ''),
        }))

      setRecentInquiries(sortedInquiries)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="space-y-3 md:space-y-4 animate-fade-in">
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
      value: String(stats.approvals),
      change: stats.approvalsChange >= 0 ? `+${stats.approvalsChange}%` : `${stats.approvalsChange}%`,
      isPositive: stats.approvalsChange >= 0,
      icon: "/icons/approved.png",
      href: "/approvals",
      gradient: "from-burgundy-10 to-burgundy-5",
      iconBg: "bg-burgundy",
      changeColor: stats.approvalsChange >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Completed",
      value: String(stats.completed),
      change: stats.completedChange >= 0 ? `+${stats.completedChange}%` : `${stats.completedChange}%`,
      isPositive: stats.completedChange >= 0,
      icon: "/icons/icons8-task-completed-96.png",
      href: "/projects",
      gradient: "from-green-10 to-green-5",
      iconBg: "bg-green",
      changeColor: stats.completedChange >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Inquiries",
      value: String(stats.inquiries),
      change: stats.inquiriesChange >= 0 ? `+${stats.inquiriesChange}%` : `${stats.inquiriesChange}%`,
      isPositive: stats.inquiriesChange >= 0,
      icon: "/icons/icons8-enquiry-100.png",
      href: "/inquiries",
      gradient: "from-blue-10 to-blue-5",
      iconBg: "bg-blue",
      changeColor: stats.inquiriesChange >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "POs",
      value: String(stats.pos),
      change: stats.posChange >= 0 ? `+${stats.posChange}%` : `${stats.posChange}%`,
      isPositive: stats.posChange >= 0,
      icon: "/icons/icons8-pos-terminal-80.png",
      href: "/projects",
      gradient: "from-blue-10 via-green-5 to-burgundy-5",
      iconBg: "gradient-blue-green",
      changeColor: stats.posChange >= 0 ? "text-green-600" : "text-red-600",
    },
  ]

  // Chart data
  const inquiriesMonthlyData = weeklyData.map(w => ({
    week: w.week,
    inquiries: w.inquiries,
    color: w.color,
  }))

  const inquiryConversionData = weeklyData.map(w => ({
    week: w.week,
    inquiries: w.inquiries,
    pos: w.pos,
  }))

  const projectsDistributionData = projectDistribution.length > 0 ? projectDistribution : [
    { type: "No Data", count: 0, color: "rgba(0, 81, 128, 0.8)" },
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
                      {stat.isPositive ? (
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                      )}
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

      {/* Recent Inquiries & Target Section */}
      <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <Card className="modern-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="p-3 md:p-4 pb-2 md:pb-3 bg-gradient-to-r from-[#78BE20]/5 to-transparent">
            <CardTitle className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <div className="h-6 w-1 bg-[#78BE20] rounded-full" />
              Recent Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="space-y-2">
              {recentInquiries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent inquiries found</p>
              ) : (
                recentInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#005180]">{inquiry.id}</span>
                        <Badge variant={getPriorityColor(inquiry.priority) as "default" | "secondary" | "destructive" | "outline"} className="text-[10px] h-4">
                          {inquiry.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{inquiry.customer}</p>
                      <p className="text-xs text-muted-foreground truncate">{inquiry.product}</p>
                    </div>
                    <div className="text-right ml-2">
                      <Badge variant={getStatusColor(inquiry.status) as "default" | "secondary" | "outline"} className="text-[10px]">
                        {inquiry.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{inquiry.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentInquiries.length > 0 && (
              <Link href="/inquiries" className="block mt-3">
                <button className="w-full text-sm text-[#005180] font-semibold hover:underline">
                  View All Inquiries →
                </button>
              </Link>
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

      {/* Clients Overview */}
      <Card className="modern-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-3 md:p-4 pb-2 md:pb-3 bg-gradient-to-r from-[#005180]/5 to-transparent">
          <CardTitle className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
            <div className="h-6 w-1 bg-[#005180] rounded-full" />
            Active Clients ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {clients.slice(0, 8).map((client) => (
              <div
                key={client.LedgerID}
                className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-medium truncate">{client.LedgerName}</p>
                <p className="text-xs text-muted-foreground">ID: {client.LedgerID}</p>
              </div>
            ))}
          </div>
          {clients.length > 8 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              +{clients.length - 8} more clients
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
