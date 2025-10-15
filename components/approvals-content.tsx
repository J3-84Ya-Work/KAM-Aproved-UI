"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const pendingApprovals = [
  {
    id: "QUO-2024-045",
    customer: "Metro Supplies",
    product: "Folding Cartons",
    amount: 245000,
    margin: 12.5,
    validTill: "3 days",
    level: "L1",
    requestedBy: "John Doe",
    requestedDate: "2024-01-15",
    urgency: "normal",
  },
  {
    id: "QUO-2024-046",
    customer: "Prime Packaging",
    product: "Die-Cut Boxes",
    amount: 185000,
    margin: 8.2,
    validTill: "5 days",
    level: "L2",
    requestedBy: "Jane Smith",
    requestedDate: "2024-01-14",
    urgency: "high",
  },
  {
    id: "QUO-2024-050",
    customer: "Tech Solutions",
    product: "Custom Cartons",
    amount: 150000,
    margin: 7.5,
    validTill: "2 days",
    level: "L2",
    requestedBy: "Mike Johnson",
    requestedDate: "2024-01-16",
    urgency: "urgent",
  },
]

const approvalHistory = [
  {
    id: "QUO-2024-047",
    customer: "Swift Logistics",
    product: "Corrugated Sheets",
    amount: 320000,
    margin: 15.8,
    status: "Approved",
    approvedBy: "Senior Manager",
    approvedDate: "2024-01-13",
    level: "L1",
  },
  {
    id: "QUO-2024-049",
    customer: "Global Traders",
    product: "Printed Labels",
    amount: 95000,
    margin: 6.5,
    status: "Rejected",
    approvedBy: "Director",
    approvedDate: "2024-01-11",
    level: "L2",
  },
]

function getMarginColor(margin: number) {
  if (margin >= 15) return "text-success"
  if (margin >= 10) return "text-warning"
  return "text-destructive"
}

function getMarginBadge(margin: number) {
  if (margin >= 15) return "default"
  if (margin >= 10) return "secondary"
  return "destructive"
}

function getUrgencyBadge(urgency: string) {
  switch (urgency) {
    case "urgent":
      return "destructive"
    case "high":
      return "secondary"
    default:
      return "outline"
  }
}

export function ApprovalsContent() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {pendingApprovals.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.map((approval) => (
                <Card key={approval.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">{approval.id}</p>
                            <Badge variant={getUrgencyBadge(approval.urgency)}>{approval.urgency}</Badge>
                            <Badge variant="outline">{approval.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{approval.customer}</p>
                          <p className="text-sm">{approval.product}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">₹{approval.amount.toLocaleString("en-IN")}</p>
                          <Badge variant={getMarginBadge(approval.margin)} className="mt-1">
                            <span className={getMarginColor(approval.margin)}>{approval.margin}%</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">By</p>
                          <p className="font-medium">{approval.requestedBy}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{approval.requestedDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valid</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <p className="font-medium">{approval.validTill}</p>
                          </div>
                        </div>
                      </div>

                      {approval.margin < 10 && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <div className="text-sm">
                            <p className="font-medium text-destructive">Low Margin</p>
                            <p className="text-muted-foreground">Below 10% - requires {approval.level} approval</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button size="sm">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvalHistory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.id}</p>
                          <Badge variant="outline">{item.level}</Badge>
                          {item.status === "Approved" ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.customer}</p>
                        <p className="text-sm">{item.product}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>
                            {item.status} by {item.approvedBy} on {item.approvedDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{item.amount.toLocaleString("en-IN")}</p>
                        <Badge variant={getMarginBadge(item.margin)} className="mt-1">
                          <span className={getMarginColor(item.margin)}>{item.margin}%</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
