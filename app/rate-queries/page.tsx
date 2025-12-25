"use client"

import { useState, useCallback, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"
import { getAllRateRequests, provideRate, escalateRateRequest } from "@/lib/rate-queries-api"
import { updateItemRate } from "@/lib/api-config"
import { formatDistanceToNow, differenceInHours } from "date-fns"
import { clientLogger } from "@/lib/logger"

interface RateQuery {
  requestId: number
  requestorId: number
  requestorName?: string
  department: string
  requestMessage: string
  status?: string
  currentStatus: string
  rate?: number | string
  providedRate?: number | string
  createdAt: string
  respondedAt?: string
  userId?: number
  itemName?: string
  itemCode?: string
  itemID?: string
  plantID?: string
  requestNumber?: string
}

export default function RateQueriesPage() {
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [queries, setQueries] = useState<RateQuery[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<RateQuery | null>(null)
  const [rateValue, setRateValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [overdueThreshold] = useState(24) // hours - can be configured in settings page

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  // Get current user ID from localStorage
  useEffect(() => {
    const userAuth = localStorage.getItem('userAuth')
    if (userAuth) {
      try {
        const user = JSON.parse(userAuth)
        // For now, using a default ID for purchase users
        setCurrentUserId(4) // You can modify this based on your user ID system
      } catch (err) {
        clientLogger.error('Failed to parse user auth:', err)
      }
    }
  }, [])

  // Fetch rate queries
  const fetchRateQueries = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllRateRequests()
      if (result.success && result.data) {
        clientLogger.log('Rate queries data:', result.data.map(q => ({
          'Request ID': q.requestId,
          'Status': q.currentStatus,
          'Rate': q.providedRate || q.rate || 'No rate'
        })))
        setQueries(result.data)
      } else {
        clientLogger.error('Failed to fetch rate queries:', result.error)
      }
    } catch (error) {
      clientLogger.error('Error fetching rate queries:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRateQueries()
  }, [fetchRateQueries])

  const handleProvideRate = (query: RateQuery) => {
    setSelectedQuery(query)
    setRateValue(query.rate?.toString() || "")
    setShowDialog(true)
  }

  const handleSubmitRate = async () => {
    if (!selectedQuery || !currentUserId) return

    if (!rateValue.trim()) {
      alert('Please enter a rate')
      return
    }

    // Validate that only numbers are entered
    if (!/^\d+(\.\d+)?$/.test(rateValue.trim())) {
      alert('Please enter a valid number for the rate')
      return
    }

    // Show confirmation
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    if (!selectedQuery || !currentUserId) return

    setIsSubmitting(true)
    setShowConfirmation(false)

    try {
      // Call both APIs
      const [rateResult, itemRateResult] = await Promise.all([
        provideRate({
          requestId: selectedQuery.requestId,
          userId: currentUserId,
          rate: rateValue.trim()
        }),
        selectedQuery.itemCode && selectedQuery.itemID && selectedQuery.plantID
          ? updateItemRate({
              ItemCode: selectedQuery.itemCode,
              ItemID: selectedQuery.itemID,
              PlantID: selectedQuery.plantID,
              Rate: rateValue.trim()
            })
          : Promise.resolve({ success: true })
      ])

      if (rateResult.success) {
        alert('✅ Rate provided successfully!')
        setShowDialog(false)
        setSelectedQuery(null)
        setRateValue("")

        // Wait a moment for backend to finish processing
        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchRateQueries()
      } else {
        alert(`❌ Failed to provide rate: ${rateResult.error}`)
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEscalate = async (requestId: number) => {
    if (!confirm('Are you sure you want to escalate this request?')) return

    try {
      const result = await escalateRateRequest(requestId)
      if (result.success) {
        alert('✅ Request escalated successfully!')
        await fetchRateQueries()
      } else {
        alert(`❌ Failed to escalate: ${result.error}`)
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'responded':
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case 'escalated':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Escalated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingQueries = queries.filter(q => q.currentStatus?.toLowerCase() === 'pending')
  const completedQueries = queries.filter(q => q.currentStatus?.toLowerCase() !== 'pending')
  const overdueQueries = pendingQueries.filter(q => {
    if (!q.createdAt) return false
    const hoursSinceCreated = differenceInHours(new Date(), new Date(q.createdAt))
    return hoursSinceCreated > overdueThreshold
  })
  const escalatedQueries = queries.filter(q => q.currentStatus?.toLowerCase() === 'escalated')

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Rate Queries" onMenuClick={handleMenuClick} showBackButton={false} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 max-w-full overflow-auto">
          {/* Stats Cards - 2x2 grid on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingQueries.length}</div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-red-600">Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueQueries.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedQueries.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queries.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Queries */}
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Pending Rate Requests</CardTitle>
              <CardDescription>Answer KAM rate queries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : pendingQueries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending rate requests</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    {pendingQueries.map((query) => (
                      <div
                        key={query.requestId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Request #{query.requestId}
                              </h3>
                              {getStatusBadge(query.currentStatus)}
                              <Badge variant="outline" className="text-xs">
                                {query.department}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">From:</span> {query.requestorName || `User #${query.requestorId}`}
                            </p>
                            {query.itemName && (
                              <div className="mb-2 bg-blue-50 border border-blue-200 rounded p-2">
                                <p className="text-xs font-medium text-blue-900 mb-1">Item</p>
                                <p className="text-sm text-blue-800">{query.itemName}</p>
                              </div>
                            )}
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                              {query.requestMessage}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {query.createdAt ? formatDistanceToNow(new Date(query.createdAt), { addSuffix: true }) : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleProvideRate(query)}
                            className="bg-[#005180] hover:bg-[#004060]"
                          >
                            Provide Rate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEscalate(query.requestId)}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Escalate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Completed Queries */}
          {completedQueries.length > 0 && (
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Completed Requests</CardTitle>
                <CardDescription>Previously answered rate queries</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-4">
                    {completedQueries.map((query) => (
                      <div
                        key={query.requestId}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">Request #{query.requestId}</h4>
                              {getStatusBadge(query.currentStatus)}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{query.requestMessage}</p>
                            {(query.rate || query.providedRate) && (
                              <p className="text-sm font-semibold text-green-700">
                                Rate: {(() => {
                                  const rateValue = query.providedRate || query.rate
                                  return typeof rateValue === 'number' ? rateValue.toFixed(2) : rateValue
                                })()}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {query.respondedAt ? formatDistanceToNow(new Date(query.respondedAt), { addSuffix: true }) : 'Completed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* Provide Rate Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#005180] p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Provide Rate</DialogTitle>
                <DialogDescription className="text-sm">
                  Request #{selectedQuery?.requestId}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Request Details */}
            <div className="space-y-3">
              {selectedQuery?.itemName && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-green-900 mb-1">Item</p>
                  <p className="text-sm text-green-800 font-medium">{selectedQuery.itemName}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900 mb-1">Request Message</p>
                    <p className="text-sm text-blue-800">{selectedQuery?.requestMessage}</p>
                  </div>
                </div>
              </div>

              {/* Requestor Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Requestor</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedQuery?.requestorName || `User #${selectedQuery?.requestorId}`}
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Department</p>
                  <p className="text-sm font-medium text-gray-900">{selectedQuery?.department}</p>
                </div>
              </div>
            </div>

            {/* Rate Input */}
            <div className="space-y-2">
              <Label htmlFor="rate" className="text-base font-semibold">
                Rate Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="rate"
                  type="text"
                  placeholder="e.g., 520 or 23.50"
                  value={rateValue}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow numbers and decimal point
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setRateValue(value)
                    }
                  }}
                  className="text-lg h-12 pr-4"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {showConfirmation ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 mb-1">Confirm Rate Submission</p>
                    <p className="text-sm text-yellow-800">
                      Are you sure you want to submit the rate <span className="font-semibold">{rateValue}</span> for this request?
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="bg-[#005180] hover:bg-[#004060] w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm & Submit
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setRateValue("")
                }}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRate}
                disabled={isSubmitting || !rateValue.trim()}
                className="bg-[#005180] hover:bg-[#004060] w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Rate
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
