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
import { getItemMasterListAPI, updateBulkItemRate } from "@/lib/api-config"
import { formatDistanceToNow, differenceInHours } from "date-fns"
import { clientLogger } from "@/lib/logger"
import { MasterDataAPI } from "@/lib/api/enquiry"

// Parse request message to extract structured data
const parseRequestMessage = (message: string) => {
  const result: { itemGroup?: string; quality?: string; gsmRange?: string; mill?: string; question?: string } = {}
  const lines = message.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (line.startsWith('Item Group:')) result.itemGroup = line.replace('Item Group:', '').trim()
    else if (line.startsWith('Quality:')) result.quality = line.replace('Quality:', '').trim()
    else if (line.startsWith('GSM Range:')) result.gsmRange = line.replace('GSM Range:', '').trim()
    else if (line.startsWith('Mill:')) result.mill = line.replace('Mill:', '').trim()
    else if (line.startsWith('Question:')) result.question = line.replace('Question:', '').trim()
  }
  return result
}

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
  items?: Array<{
    ItemGroupID: number
    PlantID: number
    ItemID: number
    EstimationRate: number
  }>
}

interface FilteredItem {
  ItemID?: number
  itemID?: number
  itemId?: number
  ID?: number
  id?: number
  ItemCode?: string
  itemCode?: string
  ItemName?: string
  itemName?: string
  Name?: string
  PlantID?: number
  plantID?: number
  ItemGroupID?: number
  itemGroupID?: number
  Quality?: string
  quality?: string
  GSM?: number
  gsm?: number
  Mill?: string
  mill?: string
  Rate?: number
  rate?: number
  EstimationRate?: number
  estimationRate?: number
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
  const [showItemsDialog, setShowItemsDialog] = useState(false)
  const [selectedQueryForItems, setSelectedQueryForItems] = useState<RateQuery | null>(null)
  const [filteredItems, setFilteredItems] = useState<FilteredItem[]>([])
  const [itemsForRateSubmission, setItemsForRateSubmission] = useState<FilteredItem[]>([])
  const [selectedPlantId, setSelectedPlantId] = useState<number>(0)
  const [selectedItemGroupId, setSelectedItemGroupId] = useState<number>(0)
  const [loadingItems, setLoadingItems] = useState(false)
  const [itemGroups, setItemGroups] = useState<any[]>([])
  const [productionUnits, setProductionUnits] = useState<any[]>([])

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

  // Fetch item groups and production units for lookup
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Fetch Item Groups using same API as ask-rate page
        const groupsList = await getItemMasterListAPI()
        if (groupsList && groupsList.length > 0) {
          setItemGroups(groupsList)
          console.log('Item Groups loaded:', groupsList.length, groupsList[0])
        }

        // Fetch Production Units
        const unitsResult = await MasterDataAPI.getProductionUnits(null)
        if (unitsResult.success && unitsResult.data) {
          setProductionUnits(unitsResult.data)
          console.log('Production Units loaded:', unitsResult.data.length)
        }
      } catch (error) {
        clientLogger.error('Error fetching master data:', error)
      }
    }
    fetchMasterData()
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

  const handleProvideRate = async (query: RateQuery, itemsAlreadyLoaded = false) => {
    setSelectedQuery(query)
    setRateValue(query.rate?.toString() || "")
    setShowDialog(true)

    // If items are not already loaded (clicking directly from card, not from items dialog)
    // fetch items in the background for bulk rate update
    if (!itemsAlreadyLoaded) {
      const parsed = parseRequestMessage(query.requestMessage)
      if (parsed.quality) {
        try {
          // Parse GSM range
          let gsmFrom = "0"
          let gsmTo = "999"
          if (parsed.gsmRange) {
            const gsmMatch = parsed.gsmRange.match(/(\d+)\s*-\s*(\d+)/)
            if (gsmMatch) {
              gsmFrom = gsmMatch[1]
              gsmTo = gsmMatch[2]
            }
          }

          // Get ItemGroupID
          let itemGroupId = query.items?.[0]?.ItemGroupID || 0
          if (itemGroupId === 0 && parsed.itemGroup && itemGroups.length > 0) {
            const foundGroup = itemGroups.find(g => {
              const groupName = g.ItemGroupName || g.GroupName || g.Name || g.name || ''
              return groupName.toUpperCase() === parsed.itemGroup?.toUpperCase()
            })
            if (foundGroup) {
              itemGroupId = foundGroup.ItemGroupID || foundGroup.GroupID || foundGroup.id || foundGroup.ID || 0
            }
          }

          // Get PlantID
          let plantId = query.items?.[0]?.PlantID || parseInt(query.plantID || "0")
          if (plantId === 0 && productionUnits.length > 0) {
            plantId = productionUnits[0]?.PlantID || productionUnits[0]?.ProductionUnitID || 1
          }

          const requestBody = {
            ItemGroupID: itemGroupId,
            PlantID: plantId,
            Quality: parsed.quality,
            GSMFrom: gsmFrom,
            GSMTo: gsmTo,
            Mill: parsed.mill || ""
          }

          // Store the PlantID and ItemGroupID for bulk rate update
          setSelectedPlantId(plantId)
          setSelectedItemGroupId(itemGroupId)

          const result = await MasterDataAPI.getFilteredItemList(requestBody, null)
          if (result.success && result.data) {
            setItemsForRateSubmission(result.data)
            clientLogger.log('Fetched', result.data.length, 'items for rate submission')
          }
        } catch (error) {
          clientLogger.error('Error fetching items for rate submission:', error)
        }
      }
    }
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
      const rateNumber = parseFloat(rateValue.trim())

      // Prepare both API calls
      const apiCalls: Promise<{ success: boolean; data?: any; error?: string }>[] = []

      // 1. Bulk item rate update API (if we have items)
      if (itemsForRateSubmission.length > 0) {
        const bulkPayload = itemsForRateSubmission.map(item => ({
          ItemGroupID: item.ItemGroupID || item.itemGroupID || selectedItemGroupId || 0,
          PlantID: item.PlantID || item.plantID || selectedPlantId || 0,
          ItemID: item.ItemID || item.itemID || item.itemId || item.ID || item.id || 0,
          EstimationRate: rateNumber
        }))
        clientLogger.log('Calling updateBulkItemRate with', bulkPayload.length, 'items, PlantID:', selectedPlantId, 'ItemGroupID:', selectedItemGroupId)
        apiCalls.push(updateBulkItemRate(bulkPayload))
      }

      // 2. Provide rate API
      clientLogger.log('Calling provideRate API')
      apiCalls.push(provideRate({
        requestId: selectedQuery.requestId,
        userId: currentUserId,
        rate: rateValue.trim()
      }))

      // Call both APIs in parallel
      const results = await Promise.all(apiCalls)

      // Check results
      const bulkResult = itemsForRateSubmission.length > 0 ? results[0] : null
      const rateResult = itemsForRateSubmission.length > 0 ? results[1] : results[0]

      if (bulkResult && !bulkResult.success) {
        clientLogger.error('Bulk item rate update failed:', bulkResult.error)
      } else if (bulkResult) {
        clientLogger.log('Bulk item rate update successful')
      }

      if (rateResult.success) {
        alert('✅ Rate provided successfully!')
        setShowDialog(false)
        setSelectedQuery(null)
        setRateValue("")
        setItemsForRateSubmission([])

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

  const handleCardClick = async (query: RateQuery) => {
    setSelectedQueryForItems(query)
    setShowItemsDialog(true)
    setFilteredItems([])

    // Parse request message to get filter criteria
    const parsed = parseRequestMessage(query.requestMessage)

    // If we have quality (required for API), fetch items
    if (parsed.quality) {
      setLoadingItems(true)
      try {
        // Parse GSM range
        let gsmFrom = "0"
        let gsmTo = "999"
        if (parsed.gsmRange) {
          const gsmMatch = parsed.gsmRange.match(/(\d+)\s*-\s*(\d+)/)
          if (gsmMatch) {
            gsmFrom = gsmMatch[1]
            gsmTo = gsmMatch[2]
          }
        }

        // Get ItemGroupID from query items array or look up by name
        let itemGroupId = query.items?.[0]?.ItemGroupID || 0

        // If no ItemGroupID from items, try to look it up by name
        if (itemGroupId === 0 && parsed.itemGroup && itemGroups.length > 0) {
          console.log('Looking up ItemGroupID for:', parsed.itemGroup)
          console.log('Available groups sample:', itemGroups.slice(0, 3))

          const foundGroup = itemGroups.find(g => {
            const groupName = g.ItemGroupName || g.GroupName || g.Name || g.name || ''
            console.log('Comparing:', groupName.toUpperCase(), 'with', parsed.itemGroup?.toUpperCase())
            return groupName.toUpperCase() === parsed.itemGroup?.toUpperCase()
          })
          if (foundGroup) {
            itemGroupId = foundGroup.ItemGroupID || foundGroup.GroupID || foundGroup.id || foundGroup.ID || 0
            console.log('Found ItemGroupID by name:', itemGroupId, 'for', parsed.itemGroup, foundGroup)
          } else {
            console.log('No matching group found for:', parsed.itemGroup)
          }
        }

        // Get PlantID from query items array or use default (1)
        let plantId = query.items?.[0]?.PlantID || parseInt(query.plantID || "0")
        if (plantId === 0 && productionUnits.length > 0) {
          // Use first production unit as default
          plantId = productionUnits[0]?.PlantID || productionUnits[0]?.ProductionUnitID || 1
          console.log('Using default PlantID:', plantId)
        }

        const requestBody = {
          ItemGroupID: itemGroupId,
          PlantID: plantId,
          Quality: parsed.quality,
          GSMFrom: gsmFrom,
          GSMTo: gsmTo,
          Mill: parsed.mill || ""
        }

        // Store the PlantID and ItemGroupID for bulk rate update
        setSelectedPlantId(plantId)
        setSelectedItemGroupId(itemGroupId)

        console.log('Fetching items with:', requestBody)

        const result = await MasterDataAPI.getFilteredItemList(requestBody, null)

        if (result.success && result.data) {
          setFilteredItems(result.data)
        } else {
          console.log('Failed to fetch items:', result.error)
          setFilteredItems([])
        }
      } catch (error) {
        clientLogger.error('Error fetching items:', error)
        setFilteredItems([])
      } finally {
        setLoadingItems(false)
      }
    } else {
      setLoadingItems(false)
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
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Rate Queries" onMenuClick={handleMenuClick} showBackButton={false} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 max-w-full overflow-auto">
          {/* Stats Cards - 2x2 grid on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-[#005180]/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-[#005180]">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-[#005180]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#005180]">{pendingQueries.length}</div>
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

            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{completedQueries.length}</div>
              </CardContent>
            </Card>

            <Card className="border-[#005180]/20 bg-[#005180]/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-[#005180]">Total</CardTitle>
                  <MessageSquare className="h-4 w-4 text-[#005180]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#005180]">{queries.length}</div>
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
                    {pendingQueries.map((query) => {
                      const parsed = parseRequestMessage(query.requestMessage)
                      const hasStructuredData = parsed.itemGroup || parsed.quality || parsed.mill

                      return (
                        <div
                          key={query.requestId}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
                          onClick={() => handleCardClick(query)}
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

                              {hasStructuredData ? (
                                <div className="bg-[#005180]/5 border border-[#005180]/20 rounded-lg p-3 mb-2">
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {parsed.itemGroup && (
                                      <div>
                                        <span className="text-[#005180] font-medium">Item Group: </span>
                                        <span className="text-gray-900">{parsed.itemGroup}</span>
                                      </div>
                                    )}
                                    {parsed.quality && (
                                      <div>
                                        <span className="text-[#005180] font-medium">Quality: </span>
                                        <span className="text-gray-900">{parsed.quality}</span>
                                      </div>
                                    )}
                                    {parsed.gsmRange && (
                                      <div>
                                        <span className="text-[#005180] font-medium">GSM: </span>
                                        <span className="text-gray-900">{parsed.gsmRange}</span>
                                      </div>
                                    )}
                                    {parsed.mill && (
                                      <div>
                                        <span className="text-[#005180] font-medium">Mill: </span>
                                        <span className="text-gray-900">{parsed.mill}</span>
                                      </div>
                                    )}
                                  </div>
                                  {parsed.question && (
                                    <div className="mt-2 pt-2 border-t border-[#005180]/10">
                                      <span className="text-[#005180] font-medium text-sm">Question: </span>
                                      <span className="text-gray-700 text-sm">{parsed.question}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  {query.itemName && (
                                    <div className="mb-2 bg-[#005180]/5 border border-[#005180]/20 rounded p-2">
                                      <p className="text-xs font-medium text-[#005180] mb-1">Item</p>
                                      <p className="text-sm text-gray-900">{query.itemName}</p>
                                    </div>
                                  )}
                                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                                    {query.requestMessage}
                                  </p>
                                </>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {query.createdAt ? formatDistanceToNow(new Date(query.createdAt), { addSuffix: true }) : 'Recently'}
                                </p>
                                <p className="text-xs text-[#005180]">Tap to view items & details</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 relative z-10">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleProvideRate(query)
                              }}
                              className="bg-[#005180] hover:bg-[#004060]"
                            >
                              Provide Rate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEscalate(query.requestId)
                              }}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Escalate
                            </Button>
                          </div>
                        </div>
                      )
                    })}
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

      {/* Items List Dialog */}
      <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-4 pb-2 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#005180] p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Request #{selectedQueryForItems?.requestId}</DialogTitle>
                <DialogDescription className="text-sm">
                  Items matching the request criteria
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Request Info - Compact (Fixed) */}
            {selectedQueryForItems && (() => {
              const parsed = parseRequestMessage(selectedQueryForItems.requestMessage)
              return (
                <div className="bg-[#005180]/5 border-b border-[#005180]/20 p-3 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {parsed.itemGroup && (
                      <div>
                        <span className="text-[#005180] font-medium">Item Group: </span>
                        <span className="text-gray-900">{parsed.itemGroup}</span>
                      </div>
                    )}
                    {parsed.quality && (
                      <div>
                        <span className="text-[#005180] font-medium">Quality: </span>
                        <span className="text-gray-900">{parsed.quality}</span>
                      </div>
                    )}
                    {parsed.gsmRange && (
                      <div>
                        <span className="text-[#005180] font-medium">GSM: </span>
                        <span className="text-gray-900">{parsed.gsmRange}</span>
                      </div>
                    )}
                    {parsed.mill && (
                      <div>
                        <span className="text-[#005180] font-medium">Mill: </span>
                        <span className="text-gray-900">{parsed.mill}</span>
                      </div>
                    )}
                  </div>
                  {parsed.question && (
                    <div className="mt-2 pt-2 border-t border-[#005180]/10">
                      <span className="text-[#005180] font-medium text-sm">Question: </span>
                      <span className="text-gray-700 text-sm">{parsed.question}</span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Items List Header (Fixed) */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b flex-shrink-0">
              <h4 className="font-semibold text-[#005180]">Items</h4>
              <Badge className="bg-[#005180] text-white">{filteredItems.length} items</Badge>
            </div>

            {/* Items List (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 py-2" style={{ maxHeight: 'calc(80vh - 280px)' }}>
              {loadingItems ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#005180]" />
                  <p className="text-sm text-gray-500 mt-2">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No items found for this request</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item, index) => {
                    // Handle different property name cases from API
                    const itemName = item.ItemName || item.itemName || item.Name || '-'
                    const itemId = item.ItemID || item.itemId || item.ID || index
                    const gsm = item.GSM || item.gsm || null
                    const mill = item.Mill || item.mill || null
                    const rate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || null

                    return (
                      <div
                        key={itemId + '-' + index}
                        className="border border-[#005180]/20 rounded-lg p-3 bg-white hover:bg-[#005180]/5 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm text-gray-900 flex-1">
                            {itemName}
                          </p>
                          {rate && (
                            <span className="bg-[#005180] text-white px-2 py-0.5 rounded text-xs font-medium ml-2">
                              ₹{rate}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-600">
                          {gsm && <span className="bg-gray-100 px-2 py-0.5 rounded">GSM: {gsm}</span>}
                          {mill && <span className="bg-gray-100 px-2 py-0.5 rounded">Mill: {mill}</span>}
                          {!rate && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">No rate</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex-shrink-0 flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowItemsDialog(false)}
              className="flex-1 h-11"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                // Store filtered items for bulk rate update
                setItemsForRateSubmission(filteredItems)
                setShowItemsDialog(false)
                if (selectedQueryForItems) {
                  handleProvideRate(selectedQueryForItems, true) // Items already loaded
                }
              }}
              className="flex-1 h-11 bg-[#005180] hover:bg-[#004060]"
            >
              Provide Rate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
