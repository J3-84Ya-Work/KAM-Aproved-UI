"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, ArrowRight, CheckCircle, AlertCircle, TrendingUp, FileText, Package, RefreshCw } from "lucide-react"
import { getRequestHistory } from "@/lib/rate-queries-api"
import { getItemMasterListAPI } from "@/lib/api-config"
import { MasterDataAPI } from "@/lib/api/enquiry"
import { formatDistanceToNow, format } from "date-fns"

interface TimelineEntry {
  logId: number
  escalationLevel: number
  action: string
  actionDate: string
  remarks?: string
  fromUserName?: string
  fromUserEmail?: string
  fromUserRole?: string
  toUserName?: string
  toUserEmail?: string
  toUserRole?: string
  itemName?: string
  itemCode?: string
  itemID?: string | number
}

interface FilteredItem {
  ItemID?: number
  itemID?: number
  itemId?: number
  ItemName?: string
  itemName?: string
  Name?: string
  GSM?: number
  gsm?: number
  Mill?: string
  mill?: string
  Rate?: number
  rate?: number
  EstimationRate?: number
  estimationRate?: number
}

interface RequestTimelineProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: number
  requestMessage: string
  itemName?: string
  itemCode?: string
}

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

const getActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case 'created':
      return <FileText className="h-5 w-5 text-blue-500" />
    case 'escalated':
      return <TrendingUp className="h-5 w-5 text-orange-500" />
    case 'rate provided':
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'rejected':
      return <AlertCircle className="h-5 w-5 text-red-500" />
    default:
      return <Clock className="h-5 w-5 text-gray-500" />
  }
}

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'created':
      return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'escalated':
      return 'bg-orange-50 border-orange-200 text-orange-700'
    case 'rate provided':
    case 'completed':
      return 'bg-green-50 border-green-200 text-green-700'
    case 'rejected':
      return 'bg-red-50 border-red-200 text-red-700'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700'
  }
}

const getLevelBadge = (level: number) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
  ]
  return colors[level - 1] || colors[0]
}

export function RequestTimeline({ open, onOpenChange, requestId, requestMessage, itemName, itemCode }: RequestTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedItemName, setDetectedItemName] = useState<string | undefined>(itemName)
  const [detectedItemCode, setDetectedItemCode] = useState<string | undefined>(itemCode)

  // Items popup state
  const [showItemsDialog, setShowItemsDialog] = useState(false)
  const [filteredItems, setFilteredItems] = useState<FilteredItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [itemGroups, setItemGroups] = useState<any[]>([])
  const [productionUnits, setProductionUnits] = useState<any[]>([])

  // Update detected item details when props change
  useEffect(() => {
    console.log('🔍 RequestTimeline - Props received:', {
      requestId,
      requestMessage,
      itemName,
      itemCode
    })
    if (itemName) setDetectedItemName(itemName)
    if (itemCode) setDetectedItemCode(itemCode)
  }, [requestId, requestMessage, itemName, itemCode])

  // Fetch master data for item lookup
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const groupsList = await getItemMasterListAPI()
        if (groupsList && groupsList.length > 0) {
          setItemGroups(groupsList)
        }
        const unitsResult = await MasterDataAPI.getProductionUnits(null)
        if (unitsResult.success && unitsResult.data) {
          setProductionUnits(unitsResult.data)
        }
      } catch (error) {
        console.error('Error fetching master data:', error)
      }
    }
    if (open) {
      fetchMasterData()
    }
  }, [open])

  // Handle View Items click
  const handleViewItems = async () => {
    setShowItemsDialog(true)
    setFilteredItems([])
    setLoadingItems(true)

    const parsed = parseRequestMessage(requestMessage)

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

        // Get ItemGroupID by name
        let itemGroupId = 0
        if (parsed.itemGroup && itemGroups.length > 0) {
          const foundGroup = itemGroups.find(g => {
            const groupName = g.ItemGroupName || g.GroupName || g.Name || g.name || ''
            return groupName.toUpperCase() === parsed.itemGroup?.toUpperCase()
          })
          if (foundGroup) {
            itemGroupId = foundGroup.ItemGroupID || foundGroup.GroupID || foundGroup.id || foundGroup.ID || 0
          }
        }

        // Get PlantID
        let plantId = 1
        if (productionUnits.length > 0) {
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

        console.log('Fetching items with:', requestBody)

        const result = await MasterDataAPI.getFilteredItemList(requestBody, null)

        if (result.success && result.data) {
          setFilteredItems(result.data)
        } else {
          setFilteredItems([])
        }
      } catch (error) {
        console.error('Error fetching items:', error)
        setFilteredItems([])
      }
    }
    setLoadingItems(false)
  }

  useEffect(() => {
    if (open && requestId) {
      fetchTimeline()
    }
  }, [open, requestId])

  const fetchTimeline = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getRequestHistory(requestId)
      if (result.success && result.data) {
        console.log('📋 Timeline data received:', result.data)
        setTimeline(result.data)

        // Try to extract item details from the timeline data if not provided as props
        if (!itemName || !itemCode) {
          const firstEntry = result.data[0]
          if (firstEntry) {
            console.log('📋 First timeline entry:', firstEntry)
            if (firstEntry.itemName) setDetectedItemName(firstEntry.itemName)
            if (firstEntry.itemCode) setDetectedItemCode(firstEntry.itemCode)
          }
        }
      } else {
        setError(result.error || 'Failed to load timeline')
      }
    } catch (err: any) {
      setError(err.message || 'Error loading timeline')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] w-[95vw] sm:w-full flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-[#005180] p-2 rounded-lg flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-bold truncate">Request Timeline</DialogTitle>
                <p className="text-xs sm:text-sm text-gray-500">Request #{requestId}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-1">Request Message</p>
                <p className="text-sm text-blue-800 break-words">{requestMessage}</p>
              </div>
              {(detectedItemName || detectedItemCode) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-purple-900 mb-1">Item Details</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {detectedItemName && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-purple-800">Item:</span>
                        <span className="text-sm text-purple-900">{detectedItemName}</span>
                      </div>
                    )}
                    {detectedItemCode && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-purple-800">Code:</span>
                        <span className="text-sm text-purple-900 font-mono">{detectedItemCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View Items Button */}
              <Button
                onClick={handleViewItems}
                className="w-full bg-[#005180] hover:bg-[#004060] text-white"
              >
                <Package className="h-4 w-4 mr-2" />
                View Items
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005180]"></div>
              <span className="ml-3 text-gray-600">Loading timeline...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-12 w-12 mb-3" />
              <p>{error}</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mb-3 text-gray-300" />
              <p>No history available</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#005180] via-blue-200 to-gray-200"></div>

              <div className="space-y-4 sm:space-y-6">
                {timeline.map((entry) => (
                  <div key={entry.logId} className="relative pl-12 sm:pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-0 flex items-center justify-center">
                      <div className="bg-white border-4 border-[#005180]/20 rounded-full p-1.5 sm:p-2.5 shadow-md">
                        {getActionIcon(entry.action)}
                      </div>
                    </div>

                    {/* Timeline content */}
                    <div className={`border-2 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow ${getActionColor(entry.action)}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`${getLevelBadge(entry.escalationLevel)} font-semibold text-xs`}>
                            Level {entry.escalationLevel}
                          </Badge>
                          <h3 className="font-bold text-sm sm:text-base">{entry.action}</h3>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {format(new Date(entry.actionDate), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>

                      {entry.remarks && (
                        <div className="bg-white/50 border border-gray-200 rounded-lg p-2 sm:p-3 mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Remarks</p>
                          <p className="text-xs sm:text-sm italic text-gray-800 break-words">{entry.remarks}</p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm">
                        {/* Show from/to users only if they are different, or show single user for certain actions */}
                        {entry.fromUserName && entry.toUserName && entry.fromUserName !== entry.toUserName ? (
                          <>
                            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 w-full sm:w-auto">
                              <User className="h-4 w-4 text-[#005180] flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{entry.fromUserName}</p>
                                <p className="text-xs text-gray-600 truncate">{entry.fromUserRole}</p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-[#005180] hidden sm:block flex-shrink-0" />
                            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 w-full sm:w-auto">
                              <User className="h-4 w-4 text-[#005180] flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{entry.toUserName}</p>
                                <p className="text-xs text-gray-600 truncate">{entry.toUserRole}</p>
                              </div>
                            </div>
                          </>
                        ) : entry.fromUserName ? (
                          <div className="flex items-center gap-2 bg-white/60 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 w-full sm:w-auto">
                            <User className="h-4 w-4 text-[#005180] flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{entry.fromUserName}</p>
                              <p className="text-xs text-gray-600 truncate">{entry.fromUserRole}</p>
                            </div>
                          </div>
                        ) : entry.toUserName ? (
                          <div className="flex items-center gap-2 bg-white/60 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 w-full sm:w-auto">
                            <User className="h-4 w-4 text-[#005180] flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{entry.toUserName}</p>
                              <p className="text-xs text-gray-600 truncate">{entry.toUserRole}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200">
                        <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gray-500 flex-shrink-0" />
                        <p className="text-xs font-medium text-gray-600">
                          {formatDistanceToNow(new Date(entry.actionDate), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Items List Dialog */}
      <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#005180] p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg">Request #{requestId} - Items</DialogTitle>
                <p className="text-sm text-gray-500">Items matching the request criteria</p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col overflow-hidden" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {/* Request Info - Compact (Fixed) */}
            {(() => {
              const parsed = parseRequestMessage(requestMessage)
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
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {loadingItems ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#005180]" />
                  <p className="text-sm text-gray-500 mt-2">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No items found for this request</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item, index) => {
                    const itemName = item.ItemName || item.itemName || item.Name || '-'
                    const itemId = item.ItemID || item.itemID || item.itemId || index
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

          <DialogFooter className="p-4 border-t bg-gray-50 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowItemsDialog(false)}
              className="w-full border-[#005180] text-[#005180] hover:bg-[#005180] hover:text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
