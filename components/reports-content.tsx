"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

// Monthly Sales vs Target data
const salesData = [
  { month: "Jan", sales: 45000, target: 50000 },
  { month: "Feb", sales: 52000, target: 50000 },
  { month: "Mar", sales: 48000, target: 55000 },
  { month: "Apr", sales: 61000, target: 55000 },
  { month: "May", sales: 55000, target: 60000 },
  { month: "Jun", sales: 67000, target: 60000 },
]

// Pipeline of Inquiries (stage-wise)
const pipelineData = [
  { stage: "Draft", count: 15 },
  { stage: "Costing", count: 12 },
  { stage: "Approved", count: 8 },
  { stage: "Quoted", count: 18 },
  { stage: "Won", count: 10 },
]

// Conversion funnel data
const conversionData = [
  { stage: "Inquiries", value: 100, percentage: 100 },
  { stage: "Quotations", value: 65, percentage: 65 },
  { stage: "Orders", value: 35, percentage: 35 },
]

// Export vs Domestic split
const businessSplitData = [
  { name: "Export", value: 62, color: "#8b5cf6" },
  { name: "Domestic", value: 38, color: "#ec4899" },
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
                color: "#10b981",
              },
              target: {
                label: "Target",
                color: "#f59e0b",
              },
            }}
            className="h-[250px] md:h-[350px] min-w-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs md:text-sm" />
                <YAxis className="text-xs md:text-sm" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm md:text-base text-muted-foreground">Sales up 12% compared to last quarter</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 max-w-full">
        {/* Pipeline of Inquiries */}
        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Inquiry Pipeline</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Stage-wise breakdown of current inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "#3b82f6",
                },
              }}
              className="h-[250px] md:h-[300px] min-w-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs md:text-sm" />
                  <YAxis dataKey="stage" type="category" width={60} className="text-xs md:text-sm" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Export vs Domestic Split */}
        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Business Split</CardTitle>
            <CardDescription className="text-sm md:text-base">Export vs Domestic revenue distribution</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ChartContainer
              config={{
                export: {
                  label: "Export",
                  color: "#8b5cf6",
                },
                domestic: {
                  label: "Domestic",
                  color: "#ec4899",
                },
              }}
              className="h-[250px] md:h-[300px] min-w-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Export", value: 62, color: "#8b5cf6" },
                      { name: "Domestic", value: 38, color: "#ec4899" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xl md:text-2xl font-bold" style={{ color: "#8b5cf6" }}>
                  62%
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Export</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold" style={{ color: "#ec4899" }}>
                  38%
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Domestic</p>
              </div>
            </div>
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
                color: "#06b6d4",
              },
            }}
            className="h-[250px] md:h-[300px] min-w-[300px]"
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
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#06b6d4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl md:text-2xl font-bold text-blue-600">100%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Inquiries</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-orange-600">65%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Quoted</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-green-600">35%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Converted</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
