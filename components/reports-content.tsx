"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Monthly Sales vs Target data
const salesData = [
  { month: "Jan", sales: 45000, target: 50000 },
  { month: "Feb", sales: 52000, target: 50000 },
  { month: "Mar", sales: 48000, target: 55000 },
  { month: "Apr", sales: 61000, target: 55000 },
  { month: "May", sales: 55000, target: 60000 },
  { month: "Jun", sales: 67000, target: 60000 },
]

// Conversion funnel data
const conversionData = [
  { stage: "Inquiries", value: 100, percentage: 100 },
  { stage: "Quotations", value: 65, percentage: 65 },
  { stage: "Orders", value: 35, percentage: 35 },
]

// Inquiry details status comparison
const inquiryDetailsData = [
  { status: "Quotation Converted", count: 45 },
  { status: "Sent to Customer", count: 62 },
  { status: "Approved", count: 28 },
]

export function ReportsContent() {
  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header with export button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Reports</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your sales performance and pipeline metrics
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      {/* Monthly Sales vs Target */}
      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Monthly Sales vs Target</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Comparison of actual sales against monthly targets
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                color: "rgba(0,81,128,0.8)",
              },
              target: {
                label: "Target",
                color: "rgba(185,34,33,0.8)",
              },
            }}
            className="h-[260px] md:h-[360px] min-w-[300px] aspect-auto max-h-none border-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs md:text-sm" />
                <YAxis className="text-xs md:text-sm" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="sales" fill="rgba(0,81,128,0.8)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="rgba(185,34,33,0.8)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" style={{ color: "rgba(0,81,128,0.8)" }} />
            <span className="text-sm md:text-base text-muted-foreground">Sales up 12% compared to last quarter</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 max-w-full">
        {/* Inquiry Details */}
        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Inquiry Details</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Quotation converted vs sent to customer vs approved
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "rgba(0,81,128,0.65)",
                },
              }}
              className="h-[240px] md:h-[320px] min-w-[280px] aspect-auto max-h-none border-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inquiryDetailsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs md:text-sm" interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis className="text-xs md:text-sm" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="rgba(0,81,128,0.65)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Conversion Funnel</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Track conversion rates from inquiry to order
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <ChartContainer
            config={{
              value: {
                label: "Conversion",
                color: "rgba(185,34,33,0.85)",
              },
            }}
            className="h-[240px] md:h-[320px] min-w-[300px] aspect-auto max-h-none border-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="stage" className="text-xs md:text-sm" />
                <YAxis className="text-xs md:text-sm" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgba(185,34,33,0.85)"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "rgba(185,34,33,0.85)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: "rgba(0,81,128,0.9)" }}>100%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Inquiries</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: "rgba(0,81,128,0.6)" }}>65%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Quoted</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: "rgba(185,34,33,0.85)" }}>35%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Converted</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
