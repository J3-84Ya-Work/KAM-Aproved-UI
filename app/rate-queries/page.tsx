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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllRateRequests, provideRate, escalateRateRequest } from "@/lib/rate-queries-api"
import { getItemMasterListAPI, updateBulkItemRate } from "@/lib/api-config"
import { formatDistanceToNow, differenceInHours } from "date-fns"
import { clientLogger } from "@/lib/logger"
import { MasterDataAPI } from "@/lib/api/enquiry"

// Parse request message to extract structured data (supports old single + new multi-value formats)
const parseRequestMessage = (message: string) => {
  const result: {
    itemGroup?: string; itemGroups?: string[];
    quality?: string; qualities?: string[];
    gsmRange?: string; gsms?: string[];
    mill?: string; question?: string;
    productionUnits?: string[];
  } = {}
  const lines = message.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (line.startsWith('Item Groups:')) {
      result.itemGroups = line.replace('Item Groups:', '').trim().split(',').map(s => s.trim())
      result.itemGroup = result.itemGroups.join(', ')
    } else if (line.startsWith('Item Group:')) {
      result.itemGroup = line.replace('Item Group:', '').trim()
      result.itemGroups = [result.itemGroup]
    } else if (line.startsWith('Production Units:')) {
      result.productionUnits = line.replace('Production Units:', '').trim().split(',').map(s => s.trim())
    } else if (line.startsWith('Production Unit:')) {
      result.productionUnits = [line.replace('Production Unit:', '').trim()]
    } else if (line.startsWith('Qualities:')) {
      result.qualities = line.replace('Qualities:', '').trim().split(',').map(s => s.trim())
      result.quality = result.qualities.join(', ')
    } else if (line.startsWith('Quality:')) {
      result.quality = line.replace('Quality:', '').trim()
      result.qualities = [result.quality]
    } else if (line.startsWith('GSM Ranges:')) {
      // New format: "GSM Ranges: 200-280, 150-200, 300-350"
      const ranges = line.replace('GSM Ranges:', '').trim().split(',').map(s => s.trim())
      const allNums: number[] = []
      for (const r of ranges) {
        const match = r.match(/(\d+)\s*-\s*(\d+)/)
        if (match) { allNums.push(parseInt(match[1]), parseInt(match[2])) }
        else if (/^\d+$/.test(r)) { allNums.push(parseInt(r)) }
      }
      allNums.sort((a, b) => a - b)
      result.gsmRange = allNums.length > 0 ? `${allNums[0]} - ${allNums[allNums.length - 1]}` : ranges.join(', ')
      result.gsms = [...new Set(allNums)].map(String)
    } else if (line.startsWith('GSMs:')) {
      result.gsms = line.replace('GSMs:', '').trim().split(',').map(s => s.trim())
      const nums = result.gsms.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b)
      result.gsmRange = nums.length > 0 ? `${nums[0]} - ${nums[nums.length - 1]}` : result.gsms.join(', ')
    } else if (line.startsWith('GSM Range:')) {
      result.gsmRange = line.replace('GSM Range:', '').trim()
    } else if (line.startsWith('Mill:')) {
      result.mill = line.replace('Mill:', '').trim()
    } else if (line.startsWith('Question:')) {
      result.question = line.replace('Question:', '').trim()
    }
  }
  return result
}

// Helper to extract numeric GSM from an item
const extractGsmFromItem = (item: any): number => {
  if (item.GSM || item.gsm) return parseInt(String(item.GSM || item.gsm))
  const rawName = item.ItemName || item.itemName || item.Name || ''
  if (rawName.includes(',')) {
    const parts = rawName.split(',')
    if (parts.length >= 2) {
      const potentialGsm = parts[1].trim()
      if (/^\d+$/.test(potentialGsm)) return parseInt(potentialGsm)
    }
  }
  return 0
}

// Helper to create a unique key based on item specifications (for deduplication)
const getItemSpecKey = (item: any): string => {
  const rawName = item.ItemName || item.itemName || item.Name || ''
  const parts = rawName.split(',').map((p: string) => p.trim())
  const quality = parts[0] || ''
  const gsm = extractGsmFromItem(item)
  const mill = item.Mill || item.mill || (parts.length >= 3 ? parts[2] : '')
  const size = parts.length >= 4 ? parts.slice(3).join('x') : ''
  const itemCode = item.ItemCode || item.itemCode || ''

  // Create unique key from specifications (normalize to lowercase and remove extra spaces)
  return `${quality.toLowerCase()}_${gsm}_${mill.toLowerCase()}_${size.toLowerCase()}_${itemCode.toLowerCase()}`.replace(/\s+/g, '')
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
  const { toast } = useToast()
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [queries, setQueries] = useState<RateQuery[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<RateQuery | null>(null)
  const [rateValue, setRateValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  // Granular per-item rate state: Map<index, { checked, rate }> - index-based to handle duplicate/zero IDs
  const [itemRates, setItemRates] = useState<Map<number, { checked: boolean; rate: string }>>(new Map())
  const [bulkRate, setBulkRate] = useState("")
  const [gsmRangeFrom, setGsmRangeFrom] = useState("")
  const [gsmRangeTo, setGsmRangeTo] = useState("")
  // Combination filter & search for Provide Rate dialog
  const [filterQuality, setFilterQuality] = useState<string>("all")
  const [filterGsm, setFilterGsm] = useState<string>("all")
  const [filterRate, setFilterRate] = useState<string>("all")
  const [itemSearch, setItemSearch] = useState<string>("")
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

  // Auto-initialize itemRates map whenever itemsForRateSubmission changes
  useEffect(() => {
    if (itemsForRateSubmission.length > 0) {
      const map = new Map<number, { checked: boolean; rate: string }>()
      itemsForRateSubmission.forEach((_, index) => {
        map.set(index, { checked: true, rate: "" })
      })
      setItemRates(map)
      // Reset filters
      setFilterQuality("all")
      setFilterGsm("all")
      setFilterRate("all")
      setItemSearch("")
    }
  }, [itemsForRateSubmission])

  // Get unique qualities from items for filter dropdown
  const getUniqueQualities = (): string[] => {
    const set = new Set<string>()
    for (const item of itemsForRateSubmission) {
      const name = (item.ItemName || item.itemName || item.Name || '').split(',')[0].trim()
      if (name && name !== '-') set.add(name)
    }
    return [...set].sort()
  }

  // Get unique GSM values from items for filter dropdown
  const getUniqueGsms = (): number[] => {
    const set = new Set<number>()
    for (const item of itemsForRateSubmission) {
      const gsm = extractGsmFromItem(item)
      if (gsm > 0) set.add(gsm)
    }
    return [...set].sort((a, b) => a - b)
  }

  // Filter items based on current filters - returns items with their original index for Map lookup
  // Selected (checked) items are always sorted to the top
  const getFilteredRateItems = (): Array<{ item: FilteredItem; originalIndex: number }> => {
    const filtered = itemsForRateSubmission.map((item, index) => ({ item, originalIndex: index })).filter(({ item }) => {
      const name = (item.ItemName || item.itemName || item.Name || '').split(',')[0].trim()
      const gsm = extractGsmFromItem(item)
      const currentRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || 0

      // Quality filter
      if (filterQuality !== "all" && name !== filterQuality) return false

      // GSM filter
      if (filterGsm !== "all" && String(gsm) !== filterGsm) return false

      // Current rate filter
      if (filterRate === "has-rate" && !currentRate) return false
      if (filterRate === "no-rate" && currentRate) return false

      // Search filter - checks parsed fields individually (quality name, mill, gsm, rate, item code)
      if (itemSearch) {
        const search = itemSearch.toLowerCase()
        const qualityName = (item.ItemName || item.itemName || item.Name || '').split(',')[0].trim().toLowerCase()
        const mill = (item.Mill || item.mill || '').toLowerCase()
        const itemCode = (item.ItemCode || item.itemCode || '').toLowerCase()
        const rateStr = currentRate ? String(currentRate) : ''
        if (!qualityName.includes(search) && !mill.includes(search) && !String(gsm).includes(search) && !rateStr.includes(search) && !itemCode.includes(search)) return false
      }

      return true
    })

    // Sort: selected (checked) items first
    filtered.sort((a, b) => {
      const aChecked = itemRates.get(a.originalIndex)?.checked ? 1 : 0
      const bChecked = itemRates.get(b.originalIndex)?.checked ? 1 : 0
      return bChecked - aChecked
    })

    return filtered
  }

  // Toggle individual item checkbox (index-based)
  const toggleItemCheck = (idx: number) => {
    const updated = new Map(itemRates)
    const entry = updated.get(idx)
    if (entry) {
      updated.set(idx, { ...entry, checked: !entry.checked })
      setItemRates(updated)
    }
  }

  // Set individual item rate (index-based)
  const setItemRate = (idx: number, rate: string) => {
    const updated = new Map(itemRates)
    const entry = updated.get(idx)
    if (entry) {
      updated.set(idx, { ...entry, rate })
      setItemRates(updated)
    }
  }

  // Select all / deselect all items
  const toggleAllItems = (checked: boolean) => {
    const updated = new Map(itemRates)
    for (const [id, entry] of updated) {
      updated.set(id, { ...entry, checked })
    }
    setItemRates(updated)
  }

  // Apply rate to a GSM range (index-based)
  const applyRateToRange = () => {
    if (!bulkRate || !gsmRangeFrom || !gsmRangeTo) return
    const from = parseInt(gsmRangeFrom)
    const to = parseInt(gsmRangeTo)
    if (isNaN(from) || isNaN(to)) return

    const updated = new Map(itemRates)
    itemsForRateSubmission.forEach((item, index) => {
      const gsm = extractGsmFromItem(item)
      if (gsm >= from && gsm <= to) {
        updated.set(index, { checked: true, rate: bulkRate })
      }
    })
    setItemRates(updated)
  }

  // Apply rate to all selected items
  const applyRateToAllSelected = () => {
    if (!bulkRate) return
    const updated = new Map(itemRates)
    for (const [id, entry] of updated) {
      if (entry.checked) {
        updated.set(id, { ...entry, rate: bulkRate })
      }
    }
    setItemRates(updated)
  }

  // Count checked items with rates
  const getCheckedWithRateCount = () => {
    let count = 0
    for (const [, entry] of itemRates) {
      if (entry.checked && entry.rate && parseFloat(entry.rate) > 0) count++
    }
    return count
  }

  const handleProvideRate = async (query: RateQuery, itemsAlreadyLoaded = false) => {
    setSelectedQuery(query)
    setRateValue(query.rate?.toString() || "")
    setBulkRate("")
    setGsmRangeFrom("")
    setGsmRangeTo("")
    setShowDialog(true)

    // If items already loaded from items dialog, useEffect will auto-initialize
    if (itemsAlreadyLoaded) {
      return
    }

    // Fetch items for this request
    const parsed = parseRequestMessage(query.requestMessage)
    const qualityList = parsed.qualities || (parsed.quality ? [parsed.quality] : [])

    if (qualityList.length === 0 && !parsed.quality) return

    try {
      // Parse GSM range
      let gsmFrom = "0"
      let gsmTo = "999"
      if (parsed.gsms && parsed.gsms.length > 0) {
        const nums = parsed.gsms.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b)
        if (nums.length > 0) { gsmFrom = String(nums[0]); gsmTo = String(nums[nums.length - 1]) }
      } else if (parsed.gsmRange) {
        const gsmMatch = parsed.gsmRange.match(/(\d+)\s*-\s*(\d+)/)
        if (gsmMatch) { gsmFrom = gsmMatch[1]; gsmTo = gsmMatch[2] }
      }

      // Resolve item group IDs (using cleaned name comparison)
      const groupNames = parsed.itemGroups || (parsed.itemGroup ? [parsed.itemGroup] : [])
      const fallbackGroupId = query.items?.[0]?.ItemGroupID || 0
      const resolvedGroupIds: number[] = []
      for (const gName of groupNames) {
        const gId = resolveGroupId(gName, fallbackGroupId)
        if (gId > 0 && !resolvedGroupIds.includes(gId)) resolvedGroupIds.push(gId)
      }
      if (resolvedGroupIds.length === 0 && fallbackGroupId > 0) resolvedGroupIds.push(fallbackGroupId)

      // Get PlantID
      let plantId = query.items?.[0]?.PlantID || parseInt(query.plantID || "0")
      if (plantId === 0 && productionUnits.length > 0) {
        plantId = productionUnits[0]?.PlantID || productionUnits[0]?.ProductionUnitID || 1
      }
      setSelectedPlantId(plantId)
      setSelectedItemGroupId(resolvedGroupIds[0] || 0)

      // Build all combos of (groupId, quality)
      const groupIds = resolvedGroupIds.length > 0 ? resolvedGroupIds : [0]
      const combos: Array<{ ItemGroupID: number; PlantID: number; Quality: string; GSMFrom: string; GSMTo: string; Mill: string }> = []
      for (const gId of groupIds) {
        for (const q of qualityList) {
          combos.push({
            ItemGroupID: gId,
            PlantID: plantId,
            Quality: q,
            GSMFrom: gsmFrom,
            GSMTo: gsmTo,
            Mill: parsed.mill || ""
          })
        }
      }

      // Fetch items for all combos in parallel
      const results = await Promise.all(combos.map(c => MasterDataAPI.getFilteredItemList(c, null)))
      const itemMap = new Map()
      for (const r of results) {
        if (r.success) {
          for (const item of r.data) {
            // Use specification-based key for deduplication (handles duplicate/zero ItemIDs)
            const specKey = getItemSpecKey(item)
            if (!itemMap.has(specKey)) {
              itemMap.set(specKey, item)
            } else {
              // If duplicate spec, prefer item with rate
              const existing = itemMap.get(specKey)
              const existingRate = existing.Rate || existing.rate || existing.EstimationRate || existing.estimationRate || 0
              const newRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || 0
              if (newRate > 0 && existingRate === 0) {
                itemMap.set(specKey, item)
              }
            }
          }
        }
      }

      // Fallback: if individual qualities returned 0 items, try combined quality string
      if (itemMap.size === 0 && qualityList.length > 1 && parsed.quality) {
        clientLogger.log('Individual qualities returned 0 items, trying combined quality:', parsed.quality)
        for (const gId of groupIds) {
          const fallbackResult = await MasterDataAPI.getFilteredItemList({
            ItemGroupID: gId,
            PlantID: plantId,
            Quality: parsed.quality,
            GSMFrom: gsmFrom,
            GSMTo: gsmTo,
            Mill: parsed.mill || ""
          }, null)
          if (fallbackResult.success && fallbackResult.data) {
            for (const item of fallbackResult.data) {
              const specKey = getItemSpecKey(item)
              if (!itemMap.has(specKey)) {
                itemMap.set(specKey, item)
              } else {
                const existing = itemMap.get(specKey)
                const existingRate = existing.Rate || existing.rate || existing.EstimationRate || existing.estimationRate || 0
                const newRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || 0
                if (newRate > 0 && existingRate === 0) {
                  itemMap.set(specKey, item)
                }
              }
            }
          }
        }
      }

      // Fallback 2: if still 0 items and mill has commas, try without mill
      if (itemMap.size === 0 && parsed.mill && parsed.mill.includes(',')) {
        clientLogger.log('Still 0 items, trying without mill filter')
        for (const gId of groupIds) {
          for (const q of qualityList) {
            const noMillResult = await MasterDataAPI.getFilteredItemList({
              ItemGroupID: gId,
              PlantID: plantId,
              Quality: q,
              GSMFrom: gsmFrom,
              GSMTo: gsmTo,
              Mill: ""
            }, null)
            if (noMillResult.success && noMillResult.data) {
              for (const item of noMillResult.data) {
                const specKey = getItemSpecKey(item)
                if (!itemMap.has(specKey)) {
                  itemMap.set(specKey, item)
                } else {
                  const existing = itemMap.get(specKey)
                  const existingRate = existing.Rate || existing.rate || existing.EstimationRate || existing.estimationRate || 0
                  const newRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || 0
                  if (newRate > 0 && existingRate === 0) {
                    itemMap.set(specKey, item)
                  }
                }
              }
            }
          }
        }
      }
      const allItems = Array.from(itemMap.values())
      setItemsForRateSubmission(allItems) // useEffect will auto-initialize itemRates
      clientLogger.log('Fetched', allItems.length, 'unique items (deduplicated by specs) for rate submission from', combos.length, 'combos')
    } catch (error) {
      clientLogger.error('Error fetching items for rate submission:', error)
    }
  }

  const handleSubmitRate = async () => {
    if (!selectedQuery || !currentUserId) return

    const checkedCount = getCheckedWithRateCount()
    if (checkedCount === 0) {
      toast({ variant: "destructive", title: "No Rates", description: "Please select at least one item and provide a rate" })
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
      // Build payload from only checked items with rates (index-based lookup)
      const bulkPayload: Array<{ ItemGroupID: number; PlantID: number; ItemID: number; EstimationRate: number }> = []

      itemsForRateSubmission.forEach((item, index) => {
        const id = item.ItemID || item.itemID || item.itemId || item.ID || item.id || 0
        const entry = itemRates.get(index)
        if (entry?.checked && entry?.rate && parseFloat(entry.rate) > 0) {
          bulkPayload.push({
            ItemGroupID: item.ItemGroupID || item.itemGroupID || selectedItemGroupId || 0,
            PlantID: item.PlantID || item.plantID || selectedPlantId || 0,
            ItemID: id,
            EstimationRate: parseFloat(entry.rate)
          })
        }
      })

      if (bulkPayload.length === 0) {
        toast({ variant: "destructive", title: "No Items", description: "No items with valid rates to submit" })
        setIsSubmitting(false)
        return
      }

      const apiCalls: Promise<{ success: boolean; data?: any; error?: string }>[] = []

      // 1. Bulk item rate update with individual rates
      clientLogger.log('Calling updateBulkItemRate with', bulkPayload.length, 'items (individual rates)')
      apiCalls.push(updateBulkItemRate(bulkPayload))

      // 2. Provide rate API - send average as summary
      const rates = bulkPayload.map(i => i.EstimationRate)
      const avgRate = (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2)
      clientLogger.log('Calling provideRate API with average rate:', avgRate)
      apiCalls.push(provideRate({
        requestId: selectedQuery.requestId,
        userId: currentUserId,
        rate: avgRate
      }))

      const results = await Promise.all(apiCalls)

      const bulkResult = results[0]
      const rateResult = results[1]

      if (bulkResult && !bulkResult.success) {
        clientLogger.error('Bulk item rate update failed:', bulkResult.error)
      } else if (bulkResult) {
        clientLogger.log('Bulk item rate update successful')
      }

      if (rateResult.success) {
        setShowDialog(false)
        setSelectedQuery(null)
        setRateValue("")
        setItemsForRateSubmission([])
        setItemRates(new Map())
        setBulkRate("")

        toast({
          title: "Rates Submitted Successfully",
          description: `Rates provided for ${bulkPayload.length} items.`,
        })

        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchRateQueries()
      } else {
        toast({ variant: "destructive", title: "Failed", description: `Failed to provide rate: ${rateResult.error}` })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEscalate = async (requestId: number) => {
    if (!confirm('Are you sure you want to escalate this request?')) return

    try {
      const result = await escalateRateRequest(requestId)
      if (result.success) {
        toast({ title: "Escalated", description: "Request escalated successfully!" })
        await fetchRateQueries()
      } else {
        toast({ variant: "destructive", title: "Failed", description: `Failed to escalate: ${result.error}` })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  // Helper to clean group name for comparison (removes leading dashes/commas/spaces)
  const cleanGroupName = (name: string) => (name || '').replace(/^[-,\s]+/, '').trim().toUpperCase()

  // Helper to resolve ItemGroupID from name
  const resolveGroupId = (name: string, fallbackId: number): number => {
    if (fallbackId > 0) return fallbackId
    if (!name || itemGroups.length === 0) return 0
    const cleanedInput = cleanGroupName(name)
    const found = itemGroups.find(g => {
      const n = g.ItemGroupName || g.GroupName || g.Name || g.name || ''
      return cleanGroupName(n) === cleanedInput
    })
    return found ? (found.ItemGroupID || found.GroupID || found.id || found.ID || 0) : 0
  }

  const handleCardClick = async (query: RateQuery) => {
    setSelectedQueryForItems(query)
    setShowItemsDialog(true)
    setFilteredItems([])

    // Parse request message to get filter criteria
    const parsed = parseRequestMessage(query.requestMessage)

    // Need at least quality to fetch items
    const qualityList = parsed.qualities || (parsed.quality ? [parsed.quality] : [])
    if (qualityList.length === 0) {
      setLoadingItems(false)
      return
    }

    setLoadingItems(true)
    try {
      // Parse GSM range
      let gsmFrom = "0"
      let gsmTo = "999"
      if (parsed.gsms && parsed.gsms.length > 0) {
        const nums = parsed.gsms.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b)
        if (nums.length > 0) { gsmFrom = String(nums[0]); gsmTo = String(nums[nums.length - 1]) }
      } else if (parsed.gsmRange) {
        const gsmMatch = parsed.gsmRange.match(/(\d+)\s*-\s*(\d+)/)
        if (gsmMatch) { gsmFrom = gsmMatch[1]; gsmTo = gsmMatch[2] }
      }

      // Resolve item group IDs
      const groupNames = parsed.itemGroups || (parsed.itemGroup ? [parsed.itemGroup] : [])
      const fallbackGroupId = query.items?.[0]?.ItemGroupID || 0
      const resolvedGroupIds: number[] = []
      for (const gName of groupNames) {
        const gId = resolveGroupId(gName, fallbackGroupId)
        if (gId > 0 && !resolvedGroupIds.includes(gId)) resolvedGroupIds.push(gId)
      }
      if (resolvedGroupIds.length === 0 && fallbackGroupId > 0) resolvedGroupIds.push(fallbackGroupId)

      // Get PlantID
      let plantId = query.items?.[0]?.PlantID || parseInt(query.plantID || "0")
      if (plantId === 0 && productionUnits.length > 0) {
        plantId = productionUnits[0]?.PlantID || productionUnits[0]?.ProductionUnitID || 1
      }
      setSelectedPlantId(plantId)
      setSelectedItemGroupId(resolvedGroupIds[0] || 0)

      // Build combos - try individual qualities first, then fallback to combined
      const combos: Array<{ ItemGroupID: number; PlantID: number; Quality: string; GSMFrom: string; GSMTo: string; Mill: string }> = []
      const groupIds = resolvedGroupIds.length > 0 ? resolvedGroupIds : [0]

      for (const gId of groupIds) {
        for (const q of qualityList) {
          combos.push({
            ItemGroupID: gId,
            PlantID: plantId,
            Quality: q,
            GSMFrom: gsmFrom,
            GSMTo: gsmTo,
            Mill: parsed.mill || ""
          })
        }
      }

      console.log('Fetching items for', combos.length, 'combos:', combos)
      const results = await Promise.all(combos.map(c => MasterDataAPI.getFilteredItemList(c, null)))
      const itemMap = new Map()
      for (const r of results) {
        if (r.success && r.data) {
          for (const item of r.data) {
            // Use specification-based key for deduplication (handles duplicate/zero ItemIDs)
            const specKey = getItemSpecKey(item)
            if (!itemMap.has(specKey)) {
              itemMap.set(specKey, item)
            } else {
              // If duplicate spec, prefer item with rate
              const existing = itemMap.get(specKey)
              const existingRate = existing.Rate || existing.rate || existing.EstimationRate || existing.estimationRate || 0
              const newRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || 0
              if (newRate > 0 && existingRate === 0) {
                itemMap.set(specKey, item)
              }
            }
          }
        }
      }

      // Fallback: if individual qualities returned 0 items, try with combined quality string
      if (itemMap.size === 0 && qualityList.length > 1 && parsed.quality) {
        console.log('Individual qualities returned 0 items, trying combined quality:', parsed.quality)
        for (const gId of groupIds) {
          const fallbackResult = await MasterDataAPI.getFilteredItemList({
            ItemGroupID: gId,
            PlantID: plantId,
            Quality: parsed.quality,
            GSMFrom: gsmFrom,
            GSMTo: gsmTo,
            Mill: parsed.mill || ""
          }, null)
          if (fallbackResult.success && fallbackResult.data) {
            for (const item of fallbackResult.data) {
              const specKey = getItemSpecKey(item)
              if (!itemMap.has(specKey)) {
                itemMap.set(specKey, item)
              } else {
                const existing = itemMap.get(specKey)
                const existingRate = existing.Rate || existing.rate || existing.EstimationRate || existing.estimationRate || 0
                const newRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || 0
                if (newRate > 0 && existingRate === 0) {
                  itemMap.set(specKey, item)
                }
              }
            }
          }
        }
      }

      // Fallback 2: if still 0 items and mill has commas, try without mill
      if (itemMap.size === 0 && parsed.mill && parsed.mill.includes(',')) {
        console.log('Still 0 items, trying without mill filter')
        for (const gId of groupIds) {
          for (const q of qualityList) {
            const noMillResult = await MasterDataAPI.getFilteredItemList({
              ItemGroupID: gId,
              PlantID: plantId,
              Quality: q,
              GSMFrom: gsmFrom,
              GSMTo: gsmTo,
              Mill: ""
            }, null)
            if (noMillResult.success && noMillResult.data) {
              for (const item of noMillResult.data) {
                const specKey = getItemSpecKey(item)
                if (!itemMap.has(specKey)) {
                  itemMap.set(specKey, item)
                } else {
                  const existing = itemMap.get(specKey)
                  const existingRate = existing.Rate || existing.rate || existing.EstimationRate || existing.estimationRate || 0
                  const newRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || 0
                  if (newRate > 0 && existingRate === 0) {
                    itemMap.set(specKey, item)
                  }
                }
              }
            }
          }
        }
      }

      const allItems = Array.from(itemMap.values())
      setFilteredItems(allItems)
      console.log('Fetched', allItems.length, 'unique items (deduplicated by specs) from combos (with fallbacks)')
    } catch (error) {
      clientLogger.error('Error fetching items:', error)
      setFilteredItems([])
    } finally {
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

      {/* Provide Rate Dialog - Granular per-item rates */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setShowConfirmation(false); setBulkRate(""); } }}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 flex flex-col">
          <DialogHeader className="p-4 pb-2 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#005180] p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Provide Rate</DialogTitle>
                <DialogDescription className="text-sm">
                  Request #{selectedQuery?.requestId} - {selectedQuery?.requestorName || `User #${selectedQuery?.requestorId}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Request summary with combinations */}
            {selectedQuery && (() => {
              const parsed = parseRequestMessage(selectedQuery.requestMessage)
              const qualityList = parsed.qualities || (parsed.quality ? parsed.quality.split(',').map((q: string) => q.trim()).filter(Boolean) : [])
              const productionUnitList = parsed.productionUnits || []
              return (
                <div className="bg-[#005180]/5 border-b border-[#005180]/20 p-3 flex-shrink-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {parsed.itemGroup && (
                      <Badge variant="outline" className="border-[#005180] text-[#005180] text-xs font-medium">{parsed.itemGroup}</Badge>
                    )}
                    {parsed.gsmRange && (
                      <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs">GSM: {parsed.gsmRange}</Badge>
                    )}
                    {parsed.mill && (
                      <Badge variant="outline" className="border-gray-400 text-gray-600 text-xs">Mill: {parsed.mill}</Badge>
                    )}
                    {productionUnitList.length > 0 && productionUnitList.map((pu: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-green-500 text-green-600 text-xs">Unit: {pu}</Badge>
                    ))}
                  </div>
                  {qualityList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[#005180] text-xs font-medium mr-1">Qualities:</span>
                      {qualityList.map((q: string, i: number) => (
                        <Badge key={i} className="bg-[#005180]/10 text-[#005180] border-[#005180]/30 text-xs">{q}</Badge>
                      ))}
                    </div>
                  )}
                  {parsed.question && (
                    <p className="text-xs text-gray-600"><span className="font-medium text-[#005180]">Q: </span>{parsed.question}</p>
                  )}
                </div>
              )
            })()}

            {/* Combination Filter & Quick Actions */}
            <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0 space-y-2">
              {/* Filter row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={filterQuality} onValueChange={setFilterQuality}>
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue placeholder="All Qualities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Qualities</SelectItem>
                    {getUniqueQualities().map((q, i) => (
                      <SelectItem key={q + i} value={q} className="text-xs">{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterGsm} onValueChange={setFilterGsm}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue placeholder="All GSM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All GSM</SelectItem>
                    {getUniqueGsms().map((g) => (
                      <SelectItem key={g} value={String(g)} className="text-xs">{g} GSM</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterRate} onValueChange={setFilterRate}>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="All Rates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Rates</SelectItem>
                    <SelectItem value="has-rate" className="text-xs">Has Rate</SelectItem>
                    <SelectItem value="no-rate" className="text-xs">No Rate</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  placeholder="Search items, rate..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="h-8 flex-1 min-w-[120px] text-xs"
                />
              </div>

              {/* Select/Deselect All + stats */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => toggleAllItems(true)} className="text-xs text-[#005180] hover:underline font-medium">Select All</button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={() => toggleAllItems(false)} className="text-xs text-gray-500 hover:underline">Deselect All</button>
                <span className="ml-auto text-xs text-gray-500">{getCheckedWithRateCount()} of {itemsForRateSubmission.length} with rates</span>
              </div>

              {/* Apply rate to GSM range */}
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-xs font-medium text-gray-700 whitespace-nowrap">Apply rate</Label>
                <Input
                  type="text"
                  placeholder="Rate"
                  value={bulkRate}
                  onChange={(e) => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setBulkRate(e.target.value) }}
                  className="h-8 w-20 text-xs"
                />
                <Label className="text-xs text-gray-500">to GSM</Label>
                <Input
                  type="text"
                  placeholder="From"
                  value={gsmRangeFrom}
                  onChange={(e) => setGsmRangeFrom(e.target.value)}
                  className="h-8 w-16 text-xs"
                />
                <span className="text-xs text-gray-400">-</span>
                <Input
                  type="text"
                  placeholder="To"
                  value={gsmRangeTo}
                  onChange={(e) => setGsmRangeTo(e.target.value)}
                  className="h-8 w-16 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={applyRateToRange}
                  disabled={!bulkRate || !gsmRangeFrom || !gsmRangeTo}
                  className="h-8 text-xs border-[#005180] text-[#005180]"
                >
                  Apply Range
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={applyRateToAllSelected}
                  disabled={!bulkRate}
                  className="h-8 text-xs bg-[#005180] hover:bg-[#004060]"
                >
                  Apply All
                </Button>
              </div>
            </div>

            {/* Items list header */}
            {(() => {
              const displayed = getFilteredRateItems()
              return (
                <>
                  <div className="flex items-center justify-between px-4 py-2 bg-white border-b flex-shrink-0">
                    <h4 className="font-semibold text-sm text-[#005180]">Items</h4>
                    <div className="flex items-center gap-2">
                      {(filterQuality !== "all" || filterGsm !== "all" || filterRate !== "all" || itemSearch) && (
                        <span className="text-xs text-gray-500">Showing {displayed.length} of {itemsForRateSubmission.length}</span>
                      )}
                      <Badge className="bg-[#005180] text-white">{displayed.length} items</Badge>
                    </div>
                  </div>

                  {/* Items grid - scrollable */}
                  <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                    {itemsForRateSubmission.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#005180]" />
                        <p className="text-sm mt-2">Loading items...</p>
                      </div>
                    ) : displayed.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No items match the current filter</p>
                        <button type="button" onClick={() => { setFilterQuality("all"); setFilterGsm("all"); setFilterRate("all"); setItemSearch(""); }} className="text-xs text-[#005180] hover:underline mt-2">Clear filters</button>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr className="text-xs text-gray-500 border-b">
                            <th className="py-2 px-3 text-left w-8"></th>
                            <th className="py-2 px-3 text-left">Item</th>
                            <th className="py-2 px-3 text-center w-20">GSM</th>
                            <th className="py-2 px-3 text-left w-24">Mill</th>
                            <th className="py-2 px-3 text-right w-20">Current</th>
                            <th className="py-2 px-3 text-right w-24">New Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayed.map(({ item, originalIndex }) => {
                            const entry = itemRates.get(originalIndex)
                            const rawName = item.ItemName || item.itemName || item.Name || '-'
                            // Parse "QUALITY,GSM,MILL,SIZE..." format
                            const nameParts = rawName.split(',').map((p: string) => p.trim())
                            const qualityName = nameParts[0] || '-'
                            const gsm = extractGsmFromItem(item)
                            // Mill: prefer item.Mill field, fallback to 3rd part of name (just the mill name)
                            const mill = item.Mill || item.mill || (nameParts.length >= 3 && nameParts[2] !== '-' ? nameParts[2] : null)
                            // Size info from 4th+ parts if available
                            const sizeInfo = nameParts.length >= 4 ? nameParts.slice(3).filter((p: string) => p && p !== '-').join(' x ') : null
                            const currentRate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || null
                            const itemCode = item.ItemCode || item.itemCode || null

                            return (
                              <tr
                                key={originalIndex}
                                className={`border-b transition-colors ${entry?.checked ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-50'}`}
                              >
                                <td className="py-2 px-3">
                                  <Checkbox
                                    checked={entry?.checked || false}
                                    onCheckedChange={() => toggleItemCheck(originalIndex)}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <div>
                                    <span className="font-medium text-gray-900 text-xs">{qualityName}</span>
                                    {itemCode && <span className="text-[10px] text-gray-400 ml-1.5">({itemCode})</span>}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {gsm > 0 && (
                                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">{gsm}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {mill && <span className="text-xs text-gray-600">{mill}</span>}
                                  {sizeInfo && <span className="text-[10px] text-gray-400 block">{sizeInfo}</span>}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {currentRate && <span className="text-xs text-gray-400">{currentRate}</span>}
                                </td>
                                <td className="py-2 px-3">
                                  <Input
                                    type="text"
                                    placeholder="Rate"
                                    value={entry?.rate || ''}
                                    onChange={(e) => {
                                      if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
                                        setItemRate(originalIndex, e.target.value)
                                      }
                                    }}
                                    className="h-7 w-full text-xs text-right"
                                    disabled={!entry?.checked}
                                  />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )
            })()}
          </div>

          {/* Footer */}
          {showConfirmation ? (
            <div className="p-4 border-t bg-gray-50 flex-shrink-0 space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Submit rates for <span className="font-semibold">{getCheckedWithRateCount()}</span> items?
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isSubmitting} className="flex-1 h-11">
                  Go Back
                </Button>
                <Button onClick={handleConfirmSubmit} disabled={isSubmitting} className="flex-1 h-11 bg-[#005180] hover:bg-[#004060]">
                  {isSubmitting ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4 mr-2" />Confirm & Submit</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t bg-gray-50 flex-shrink-0 flex gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowDialog(false); setRateValue(""); setBulkRate(""); setItemRates(new Map()); }}
                disabled={isSubmitting}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRate}
                disabled={isSubmitting || getCheckedWithRateCount() === 0}
                className="flex-1 h-11 bg-[#005180] hover:bg-[#004060]"
              >
                {isSubmitting ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  <><CheckCircle className="h-4 w-4 mr-2" />Submit {getCheckedWithRateCount()} Rates</>
                )}
              </Button>
            </div>
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
              const qualities = parsed.qualities || (parsed.quality ? parsed.quality.split(',').map(s => s.trim()) : [])
              const groups = parsed.itemGroups || (parsed.itemGroup ? parsed.itemGroup.split(',').map(s => s.trim()) : [])
              const units = parsed.productionUnits || []
              return (
                <div className="bg-[#005180]/5 border-b border-[#005180]/20 p-3 flex-shrink-0">
                  {/* Summary fields */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    {groups.length > 0 && (
                      <div>
                        <span className="text-[#005180] font-medium">Item Group: </span>
                        <span className="text-gray-900">{groups.join(', ')}</span>
                      </div>
                    )}
                    {units.length > 0 && (
                      <div>
                        <span className="text-[#005180] font-medium">Production Unit: </span>
                        <span className="text-gray-900">{units.join(', ')}</span>
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
                  {/* Qualities list */}
                  {qualities.length > 0 && (
                    <div className="mt-1.5">
                      <span className="text-[#005180] font-medium text-sm">Qualities: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {qualities.map((q, i) => (
                          <span key={i} className="bg-white border border-[#005180]/20 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                    const rawName = item.ItemName || item.itemName || item.Name || '-'
                    const itemId = item.ItemID || item.itemId || item.ID || index
                    const mill = item.Mill || item.mill || null
                    const rate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || null

                    // Extract GSM from item properties or from name (second part after comma)
                    let gsm = item.GSM || item.gsm || null
                    if (!gsm && rawName.includes(',')) {
                      const parts = rawName.split(',')
                      if (parts.length >= 2) {
                        const potentialGsm = parts[1].trim()
                        if (/^\d+$/.test(potentialGsm)) {
                          gsm = parseInt(potentialGsm)
                        }
                      }
                    }

                    // Extract just the quality name (first part before comma) - removes sheet/reel size
                    const displayName = rawName.split(',')[0].trim()

                    return (
                      <div
                        key={itemId + '-' + index}
                        className="border border-[#005180]/20 rounded-lg p-3 bg-white hover:bg-[#005180]/5 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {displayName}
                            </p>
                            {gsm && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                {gsm} GSM
                              </span>
                            )}
                          </div>
                          {rate && (
                            <span className="bg-[#005180] text-white px-2 py-0.5 rounded text-xs font-medium ml-2">
                              ₹{rate}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-600">
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
