"use client"

import { useState, useCallback, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageSquare, Clock, CheckCircle, AlertCircle, Package, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getUserRateRequests, createRateRequest } from "@/lib/rate-queries-api"
import { getCurrentUser } from "@/lib/permissions"
import { formatDistanceToNow, differenceInHours } from "date-fns"
import { RequestTimeline } from "@/components/request-timeline"
import { clientLogger } from "@/lib/logger"
import { getItemMasterListAPI, getUsersAPI } from "@/lib/api-config"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MasterDataAPI } from "@/lib/api/enquiry"

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
  itemCode?: string
  itemID?: string | number
  itemName?: string
  plantID?: string
}

// Team member interface
interface TeamMember {
  id: string
  name: string
  email: string
  department: string
  designation?: string
}

export default function AskRatePage() {
  const [selectedPerson, setSelectedPerson] = useState<string>("")
  const [department, setDepartment] = useState<"Purchase" | "Operations" | "Sales">("Purchase")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myRequests, setMyRequests] = useState<RateQuery[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [selectedRequestForTimeline, setSelectedRequestForTimeline] = useState<RateQuery | null>(null)
  const [requestFilter, setRequestFilter] = useState<"all" | "answered" | "unanswered">("all")
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  // New cascading dropdown states
  const [productionUnits, setProductionUnits] = useState<any[]>([])
  const [selectedProductionUnit, setSelectedProductionUnit] = useState<string>("")
  const [loadingProductionUnits, setLoadingProductionUnits] = useState(false)

  const [qualities, setQualities] = useState<any[]>([])
  const [selectedQuality, setSelectedQuality] = useState<string>("")
  const [loadingQualities, setLoadingQualities] = useState(false)

  const [gsmList, setGsmList] = useState<any[]>([])
  const [selectedGsmFrom, setSelectedGsmFrom] = useState<string>("")
  const [selectedGsmTo, setSelectedGsmTo] = useState<string>("")
  const [loadingGsm, setLoadingGsm] = useState(false)

  const [mills, setMills] = useState<any[]>([])
  const [selectedMill, setSelectedMill] = useState<string>("")
  const [loadingMills, setLoadingMills] = useState(false)

  // Items popup state
  const [showItemsPopup, setShowItemsPopup] = useState(false)
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoadingTeamMembers(true)
      try {
        const users = await getUsersAPI()
        setTeamMembers(users)
        clientLogger.log('Team members fetched:', users.length, 'users')
      } catch (error) {
        clientLogger.error('Error fetching team members:', error)
      } finally {
        setLoadingTeamMembers(false)
      }
    }

    fetchTeamMembers()
  }, [])

  // Auto-set department when person is selected
  const handlePersonChange = (personId: string) => {
    setSelectedPerson(personId)
    const person = teamMembers.find(p => p.id === personId)
    if (person) {
      setDepartment(person.department as "Purchase" | "Operations" | "Sales")
    }
  }

  // Clear cascading selections when group changes
  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId)
    setSelectedQuality("") // Clear quality when group changes
    setSelectedGsmFrom("") // Clear GSM from when group changes
    setSelectedGsmTo("") // Clear GSM to when group changes
    setSelectedMill("") // Clear mill when group changes
  }

  // Clear GSM and Mill when quality changes
  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality)
    setSelectedGsmFrom("")
    setSelectedGsmTo("")
    setSelectedMill("")
  }

  // Get selected quality name for display
  const getSelectedQualityName = () => {
    if (!selectedQuality) return ""
    const quality = qualities.find(q => {
      const qualityValue = q.Quality || q.quality || q.Name || q
      return qualityValue === selectedQuality
    })
    if (!quality) return selectedQuality
    return quality.Quality || quality.quality || quality.Name || selectedQuality
  }

  // Get selected group name for display
  const getSelectedGroupName = () => {
    if (!selectedGroup) return ""
    const group = groups.find(g => String(g.ItemGroupID || g.GroupID || g.id) === selectedGroup)
    if (!group) return ""
    const groupName = group.ItemGroupName || group.GroupName || group.Name || group.name || ""
    return groupName.replace(/^[-,\s]+/, '').trim()
  }

  // Get current user
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Fetch groups list for dropdown
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true)
      try {
        const groupsList = await getItemMasterListAPI()
        setGroups(groupsList)
        clientLogger.log('Groups list fetched:', groupsList)
      } catch (error) {
        clientLogger.error('Error fetching groups:', error)
      } finally {
        setLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [])

  // Fetch production units on mount
  useEffect(() => {
    const fetchProductionUnits = async () => {
      setLoadingProductionUnits(true)
      try {
        const result = await MasterDataAPI.getProductionUnits(null)
        if (result.success) {
          setProductionUnits(result.data)
          clientLogger.log('Production units fetched:', result.data)
        }
      } catch (error) {
        clientLogger.error('Error fetching production units:', error)
      } finally {
        setLoadingProductionUnits(false)
      }
    }

    fetchProductionUnits()
  }, [])

  // Fetch qualities when Item Group is selected
  useEffect(() => {
    if (!selectedGroup) {
      setQualities([])
      setSelectedQuality("")
      return
    }

    // If NA is selected, don't fetch but allow quality selection
    if (selectedGroup === "NA") {
      setQualities([])
      return
    }

    const fetchQualities = async () => {
      setLoadingQualities(true)
      try {
        const result = await MasterDataAPI.getQualitiesByItemGroup(parseInt(selectedGroup), null)
        if (result.success) {
          setQualities(result.data)
          clientLogger.log('Qualities fetched for group:', selectedGroup, result.data)
        }
      } catch (error) {
        clientLogger.error('Error fetching qualities:', error)
      } finally {
        setLoadingQualities(false)
      }
    }

    fetchQualities()
  }, [selectedGroup])

  // Fetch GSM and Mills when Quality is selected
  useEffect(() => {
    if (!selectedGroup || !selectedQuality) {
      setGsmList([])
      setMills([])
      setSelectedGsmFrom("")
      setSelectedGsmTo("")
      setSelectedMill("")
      return
    }

    // If NA is selected for group or quality, don't fetch but allow selections
    if (selectedGroup === "NA" || selectedQuality === "NA") {
      setGsmList([])
      setMills([])
      return
    }

    const fetchGsmAndMills = async () => {
      setLoadingGsm(true)
      setLoadingMills(true)

      try {
        // Fetch GSM values
        const gsmResult = await MasterDataAPI.getGSMByItemGroupAndQuality(
          parseInt(selectedGroup),
          selectedQuality,
          null
        )
        if (gsmResult.success) {
          setGsmList(gsmResult.data)
          clientLogger.log('GSM values fetched:', gsmResult.data)
        }

        // Fetch Mill values
        const millResult = await MasterDataAPI.getMillByItemGroupAndQuality(
          parseInt(selectedGroup),
          selectedQuality,
          null
        )
        console.log('Mill API result:', millResult)
        if (millResult.success && millResult.data) {
          // Handle different response formats for mills
          let millData = millResult.data
          // If response is an object with a nested array, extract it
          if (!Array.isArray(millData) && typeof millData === 'object') {
            millData = millData.data || millData.Data || millData.mills || millData.Mills || [millData]
          }
          // If it's still not an array, wrap it
          if (!Array.isArray(millData)) {
            millData = [millData]
          }
          console.log('Processed mills data:', millData)
          setMills(millData)
          clientLogger.log('Mills fetched:', millData)
        } else {
          console.log('Mill API failed or no data:', millResult.error)
          setMills([])
        }
      } catch (error) {
        clientLogger.error('Error fetching GSM/Mills:', error)
      } finally {
        setLoadingGsm(false)
        setLoadingMills(false)
      }
    }

    fetchGsmAndMills()
  }, [selectedGroup, selectedQuality])

  // Fetch user's rate requests
  const fetchMyRequests = useCallback(async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      // Use user ID 2 as default for KAM users (you can map this to actual user IDs)
      const userId = 2
      const result = await getUserRateRequests(userId)
      if (result.success && result.data) {
        clientLogger.log('📋 Ask Rate - Fetched requests:', result.data)
        clientLogger.log('📋 Ask Rate - First request:', result.data[0])
        setMyRequests(result.data)
      }
    } catch (error) {
      clientLogger.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      fetchMyRequests()
    }
  }, [currentUser, fetchMyRequests])

  // Handle Show Items button click
  const handleShowItems = async () => {
    // Check if any required selection is missing (NA is a valid selection)
    if (!selectedGroup || !selectedProductionUnit || !selectedQuality || !selectedGsmFrom || !selectedGsmTo) {
      alert('Please select Item Group, Production Unit, Quality, and GSM Range first (or select NA)')
      return
    }

    // If all selections are NA, show a message
    if (selectedGroup === "NA" && selectedProductionUnit === "NA" && selectedQuality === "NA" && selectedGsmFrom === "NA" && selectedGsmTo === "NA") {
      alert('Please select at least one filter criteria (not all NA)')
      return
    }

    setLoadingItems(true)
    setShowItemsPopup(true)

    try {
      const requestBody = {
        ItemGroupID: selectedGroup === "NA" ? 0 : parseInt(selectedGroup),
        PlantID: selectedProductionUnit === "NA" ? 0 : parseInt(selectedProductionUnit),
        Quality: selectedQuality === "NA" ? "" : selectedQuality,
        GSMFrom: selectedGsmFrom === "NA" ? "" : selectedGsmFrom,
        GSMTo: selectedGsmTo === "NA" ? "" : selectedGsmTo,
        Mill: selectedMill === "NA" ? "" : (selectedMill || "")
      }

      console.log('Show Items Request:', requestBody)

      const result = await MasterDataAPI.getFilteredItemList(requestBody, null)

      if (result.success) {
        setFilteredItems(result.data)
      } else {
        console.error('Failed to fetch items:', result.error)
        setFilteredItems([])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      setFilteredItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !currentUser) {
      alert('Please enter your question')
      return
    }

    if (!selectedPerson) {
      alert('Please select a person')
      return
    }

    if (!selectedProductionUnit) {
      alert('Please select a production unit or NA')
      return
    }

    if (!selectedGroup) {
      alert('Please select an item group or NA')
      return
    }

    if (!selectedQuality) {
      alert('Please select a quality or NA')
      return
    }

    if (!selectedGsmFrom || !selectedGsmTo) {
      alert('Please select GSM range (from and to) or NA')
      return
    }

    setIsSubmitting(true)
    try {
      // Get selected group details
      const selectedGroupData = selectedGroup !== "NA" ? groups.find(g => String(g.ItemGroupID || g.GroupID || g.id) === selectedGroup) : null
      const groupName = selectedGroup === "NA" ? "NA" : (selectedGroupData?.ItemGroupName || selectedGroupData?.GroupName || selectedGroupData?.Name || "")

      // Build items array from filtered items (if available) or fetch them
      let itemsArray: Array<{
        ItemGroupID: number
        PlantID: number
        ItemID: number
        EstimationRate: number
      }> = []

      // Only fetch items if not all values are NA
      const hasNonNAValues = selectedGroup !== "NA" || selectedProductionUnit !== "NA" || selectedQuality !== "NA" || selectedGsmFrom !== "NA" || selectedGsmTo !== "NA"

      // If we have filtered items from "Show Items", use them
      if (filteredItems.length > 0 && hasNonNAValues) {
        itemsArray = filteredItems.map(item => ({
          ItemGroupID: selectedGroup === "NA" ? 0 : parseInt(selectedGroup),
          PlantID: selectedProductionUnit === "NA" ? 0 : parseInt(selectedProductionUnit),
          ItemID: item.ItemID || item.itemId || item.ID || item.id || 0,
          EstimationRate: 0 // Rate will be provided by purchase team
        }))
      } else if (hasNonNAValues) {
        // Fetch items if not already fetched
        const requestBody = {
          ItemGroupID: selectedGroup === "NA" ? 0 : parseInt(selectedGroup),
          PlantID: selectedProductionUnit === "NA" ? 0 : parseInt(selectedProductionUnit),
          Quality: selectedQuality === "NA" ? "" : selectedQuality,
          GSMFrom: selectedGsmFrom === "NA" ? "" : selectedGsmFrom,
          GSMTo: selectedGsmTo === "NA" ? "" : selectedGsmTo,
          Mill: selectedMill === "NA" ? "" : (selectedMill || "")
        }
        const itemsResult = await MasterDataAPI.getFilteredItemList(requestBody, null)
        if (itemsResult.success && itemsResult.data.length > 0) {
          itemsArray = itemsResult.data.map((item: any) => ({
            ItemGroupID: selectedGroup === "NA" ? 0 : parseInt(selectedGroup),
            PlantID: selectedProductionUnit === "NA" ? 0 : parseInt(selectedProductionUnit),
            ItemID: item.ItemID || item.itemId || item.ID || item.id || 0,
            EstimationRate: 0
          }))
        }
      }

      // Log the request body to console
      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📤 RATE REQUEST BODY:')
      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📋 Selection Details:')
      console.log('  - Item Group:', groupName, '(ID:', selectedGroup, ')')
      console.log('  - Production Unit ID:', selectedProductionUnit)
      console.log('  - Quality:', selectedQuality)
      console.log('  - GSM Range:', selectedGsmFrom, '-', selectedGsmTo)
      console.log('  - Mill:', selectedMill || 'Not selected')
      console.log('  - Question:', message.trim())
      console.log('  - Total Items:', itemsArray.length)
      console.log('═══════════════════════════════════════════════════════════════')
      console.log('📦 Items Array:')
      console.log(JSON.stringify(itemsArray, null, 2))
      console.log('═══════════════════════════════════════════════════════════════')

      // Build the request message with all the selected details
      const qualityDisplay = selectedQuality === "NA" ? "NA" : selectedQuality
      const gsmFromDisplay = selectedGsmFrom === "NA" ? "NA" : selectedGsmFrom
      const gsmToDisplay = selectedGsmTo === "NA" ? "NA" : selectedGsmTo
      const millDisplay = selectedMill === "NA" ? "NA" : selectedMill

      const fullMessage = `
Item Group: ${groupName}
Quality: ${qualityDisplay}
GSM Range: ${gsmFromDisplay} - ${gsmToDisplay}
${millDisplay && millDisplay !== "NA" ? `Mill: ${millDisplay}` : (millDisplay === "NA" ? 'Mill: NA' : '')}

Question: ${message.trim()}
      `.trim()

      // Get selected person's email for assignedToEmail
      const selectedPersonData = teamMembers.find(p => p.id === selectedPerson)
      const assignedToEmail = selectedPersonData?.email || ""

      const requestPayload = {
        requestorId: 2, // You can map this to actual user ID
        department: department,
        requestMessage: fullMessage,
        assignedToEmail: assignedToEmail,
        ItemCode: "",
        ItemID: itemsArray.length > 0 ? String(itemsArray[0].ItemID) : "",
        ItemName: groupName,
        PlantID: selectedProductionUnit === "NA" ? "0" : selectedProductionUnit,
        items: itemsArray
      }

      console.log('📤 FULL REQUEST PAYLOAD:')
      console.log(JSON.stringify(requestPayload, null, 2))
      console.log('═══════════════════════════════════════════════════════════════')

      const result = await createRateRequest(requestPayload)

      if (result.success) {
        alert('✅ Rate request sent successfully!')
        setMessage("")
        setSelectedPerson("")
        setSelectedProductionUnit("")
        setSelectedGroup("")
        setSelectedQuality("")
        setSelectedGsmFrom("")
        setSelectedGsmTo("")
        setSelectedMill("")
        setDepartment("Purchase")
        await fetchMyRequests()
      } else {
        alert(`❌ Failed to send request: ${result.error}`)
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'responded':
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Answered</Badge>
      case 'escalated':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Escalated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Parse request message to extract structured data
  const parseRequestMessage = (message: string) => {
    const result: { itemGroup?: string; quality?: string; gsmRange?: string; mill?: string; question?: string } = {}

    const lines = message.split('\n').map(l => l.trim()).filter(Boolean)

    for (const line of lines) {
      if (line.startsWith('Item Group:')) {
        result.itemGroup = line.replace('Item Group:', '').trim()
      } else if (line.startsWith('Quality:')) {
        result.quality = line.replace('Quality:', '').trim()
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

  const pendingRequests = myRequests.filter(r => r.currentStatus?.toLowerCase() === 'pending')
  const answeredRequests = myRequests.filter(r => r.currentStatus?.toLowerCase() !== 'pending')

  // Calculate overdue requests (pending for more than 24 hours)
  const overdueRequests = pendingRequests.filter(q => {
    if (!q.createdAt) return false
    const hoursSinceCreated = differenceInHours(new Date(), new Date(q.createdAt))
    return hoursSinceCreated > 24
  })

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader pageName="Ask Rate" showBackButton={false} onMenuClick={handleMenuClick} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 max-w-full overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-red-600">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueRequests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Answered</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{answeredRequests.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myRequests.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Ask New Rate Form */}
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Ask Purchase Department</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Select Person & Production Unit */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="min-w-0">
                    <Label htmlFor="person" className="text-sm">Select Person <span className="text-red-500">*</span></Label>
                    <Select value={selectedPerson} onValueChange={handlePersonChange}>
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder="Choose team member" />
                      </SelectTrigger>
                      <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <input
                            type="text"
                            placeholder="Search persons..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                              const searchValue = e.target.value.toLowerCase()
                              const selectContent = e.target.closest('[role="listbox"]')
                              if (selectContent) {
                                const items = selectContent.querySelectorAll('[role="option"]')
                                items.forEach((item) => {
                                  const text = item.textContent?.toLowerCase() || ''
                                  if (text.includes(searchValue)) {
                                    (item as HTMLElement).style.display = ''
                                  } else {
                                    (item as HTMLElement).style.display = 'none'
                                  }
                                })
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {teamMembers.map((person) => (
                            <SelectItem key={person.id} value={person.id} className="truncate">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-medium truncate">{person.name}</span>
                                <span className="text-xs text-gray-500 truncate hidden sm:inline">({person.email})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    {selectedPerson && (
                      <Badge
                        variant="outline"
                        className={`mt-2 ${
                          department === "Purchase"
                            ? "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                            : "bg-purple-50 text-purple-700 border-purple-200 font-medium"
                        }`}
                      >
                        {department}
                      </Badge>
                    )}
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="productionUnit" className="text-sm">Production Unit <span className="text-red-500">*</span></Label>
                    <Select value={selectedProductionUnit} onValueChange={setSelectedProductionUnit} disabled={loadingProductionUnits}>
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder={loadingProductionUnits ? "Loading..." : "Select production unit"} />
                      </SelectTrigger>
                      <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <input
                            type="text"
                            placeholder="Search production units..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                              const searchValue = e.target.value.toLowerCase()
                              const selectContent = e.target.closest('[role="listbox"]')
                              if (selectContent) {
                                const items = selectContent.querySelectorAll('[role="option"]')
                                items.forEach((item) => {
                                  const text = item.textContent?.toLowerCase() || ''
                                  if (text.includes(searchValue)) {
                                    (item as HTMLElement).style.display = ''
                                  } else {
                                    (item as HTMLElement).style.display = 'none'
                                  }
                                })
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          <SelectItem value="NA" className="truncate font-medium text-gray-500">
                            NA (Not Applicable)
                          </SelectItem>
                          {productionUnits.map((unit, index) => {
                            const unitName = unit.ProductionUnitName || unit.Name || unit.name || `Unit ${index + 1}`
                            return (
                              <SelectItem
                                key={unit.ProductionUnitID || unit.id || index}
                                value={String(unit.ProductionUnitID || unit.id || index)}
                                className="truncate"
                              >
                                {unitName}
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Item Group & Qualities */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="min-w-0">
                    <Label htmlFor="group" className="text-sm">Item Group <span className="text-red-500">*</span></Label>
                    <Select value={selectedGroup} onValueChange={handleGroupChange} disabled={loadingGroups}>
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder={loadingGroups ? "Loading..." : "Select item group"}>
                          {selectedGroup ? getSelectedGroupName() : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <input
                            type="text"
                            placeholder="Search groups..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                              const searchValue = e.target.value.toLowerCase()
                              const selectContent = e.target.closest('[role="listbox"]')
                              if (selectContent) {
                                const items = selectContent.querySelectorAll('[role="option"]')
                                items.forEach((item) => {
                                  const text = item.textContent?.toLowerCase() || ''
                                  if (text.includes(searchValue)) {
                                    (item as HTMLElement).style.display = ''
                                  } else {
                                    (item as HTMLElement).style.display = 'none'
                                  }
                                })
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          <SelectItem value="NA" className="truncate font-medium text-gray-500">
                            NA (Not Applicable)
                          </SelectItem>
                          {groups.map((group, index) => {
                            const groupName = group.ItemGroupName || group.GroupName || group.Name || group.name || `Group ${index + 1}`
                            const cleanedName = groupName.replace(/^[-,\s]+/, '').trim()
                            return (
                              <SelectItem
                                key={group.ItemGroupID || group.GroupID || group.id || index}
                                value={String(group.ItemGroupID || group.GroupID || group.id || index)}
                                className="truncate"
                              >
                                {cleanedName}
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="quality" className="text-sm">Qualities <span className="text-red-500">*</span></Label>
                    <Select
                      value={selectedQuality}
                      onValueChange={handleQualityChange}
                      disabled={!selectedGroup || (loadingQualities && selectedGroup !== "NA")}
                    >
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder={!selectedGroup ? "Select group first" : loadingQualities ? "Loading..." : "Select quality"}>
                          {selectedQuality ? getSelectedQualityName() : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <input
                            type="text"
                            placeholder="Search qualities..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                              const searchValue = e.target.value.toLowerCase()
                              const selectContent = e.target.closest('[role="listbox"]')
                              if (selectContent) {
                                const items = selectContent.querySelectorAll('[role="option"]')
                                items.forEach((item) => {
                                  const text = item.textContent?.toLowerCase() || ''
                                  if (text.includes(searchValue)) {
                                    (item as HTMLElement).style.display = ''
                                  } else {
                                    (item as HTMLElement).style.display = 'none'
                                  }
                                })
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          <SelectItem value="NA" className="truncate font-medium text-gray-500">
                            NA (Not Applicable)
                          </SelectItem>
                          {qualities.map((quality, index) => {
                            const qualityValue = quality.Quality || quality.quality || quality.Name || quality
                            return (
                              <SelectItem
                                key={qualityValue + '-' + index}
                                value={String(qualityValue)}
                                className="truncate"
                              >
                                {qualityValue}
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: GSM From & GSM To */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="min-w-0">
                    <Label htmlFor="gsmFrom" className="text-sm">GSM From <span className="text-red-500">*</span></Label>
                    <Select
                      value={selectedGsmFrom}
                      onValueChange={setSelectedGsmFrom}
                      disabled={!selectedQuality || (loadingGsm && selectedQuality !== "NA")}
                    >
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder={!selectedQuality ? "Select quality first" : loadingGsm ? "Loading..." : "Select GSM from"} />
                      </SelectTrigger>
                      <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <input
                            type="text"
                            placeholder="Search GSM..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                              const searchValue = e.target.value.toLowerCase()
                              const selectContent = e.target.closest('[role="listbox"]')
                              if (selectContent) {
                                const items = selectContent.querySelectorAll('[role="option"]')
                                items.forEach((item) => {
                                  const text = item.textContent?.toLowerCase() || ''
                                  if (text.includes(searchValue)) {
                                    (item as HTMLElement).style.display = ''
                                  } else {
                                    (item as HTMLElement).style.display = 'none'
                                  }
                                })
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          <SelectItem value="NA" className="truncate font-medium text-gray-500">
                            NA (Not Applicable)
                          </SelectItem>
                          {gsmList.map((gsm, index) => {
                            const gsmValue = gsm.GSM || gsm.gsm || gsm
                            return (
                              <SelectItem
                                key={'from-' + gsmValue + '-' + index}
                                value={String(gsmValue)}
                              >
                                {gsmValue}
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0">
                    <Label htmlFor="gsmTo" className="text-sm">GSM To <span className="text-red-500">*</span></Label>
                    <Select
                      value={selectedGsmTo}
                      onValueChange={setSelectedGsmTo}
                      disabled={!selectedQuality || (loadingGsm && selectedQuality !== "NA")}
                    >
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder={!selectedQuality ? "Select quality first" : loadingGsm ? "Loading..." : "Select GSM to"} />
                      </SelectTrigger>
                      <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <input
                            type="text"
                            placeholder="Search GSM..."
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                              const searchValue = e.target.value.toLowerCase()
                              const selectContent = e.target.closest('[role="listbox"]')
                              if (selectContent) {
                                const items = selectContent.querySelectorAll('[role="option"]')
                                items.forEach((item) => {
                                  const text = item.textContent?.toLowerCase() || ''
                                  if (text.includes(searchValue)) {
                                    (item as HTMLElement).style.display = ''
                                  } else {
                                    (item as HTMLElement).style.display = 'none'
                                  }
                                })
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          <SelectItem value="NA" className="truncate font-medium text-gray-500">
                            NA (Not Applicable)
                          </SelectItem>
                          {gsmList.map((gsm, index) => {
                            const gsmValue = gsm.GSM || gsm.gsm || gsm
                            return (
                              <SelectItem
                                key={'to-' + gsmValue + '-' + index}
                                value={String(gsmValue)}
                              >
                                {gsmValue}
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 4: Mill (Optional) */}
                <div className="min-w-0">
                  <Label htmlFor="mill" className="text-sm">Mill</Label>
                  <Select
                    value={selectedMill}
                    onValueChange={setSelectedMill}
                    disabled={!selectedQuality || (loadingMills && selectedQuality !== "NA")}
                  >
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder={!selectedQuality ? "Select quality first" : loadingMills ? "Loading..." : "Select mill (optional)"} />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                      <div className="p-2 border-b sticky top-0 bg-white z-10">
                        <input
                          type="text"
                          placeholder="Search mills..."
                          className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            const searchValue = e.target.value.toLowerCase()
                            const selectContent = e.target.closest('[role="listbox"]')
                            if (selectContent) {
                              const items = selectContent.querySelectorAll('[role="option"]')
                              items.forEach((item) => {
                                const text = item.textContent?.toLowerCase() || ''
                                if (text.includes(searchValue)) {
                                  (item as HTMLElement).style.display = ''
                                } else {
                                  (item as HTMLElement).style.display = 'none'
                                }
                              })
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        <SelectItem value="NA" className="truncate font-medium text-gray-500">
                          NA (Not Applicable)
                        </SelectItem>
                        {mills.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500 text-center">No mills available</div>
                        ) : (
                          mills.map((mill, index) => {
                            // Handle different possible property names for mill value
                            const millValue = mill?.Mill || mill?.mill || mill?.MillName || mill?.millName ||
                                             mill?.Name || mill?.name || mill?.Value || mill?.value ||
                                             (typeof mill === 'string' ? mill : JSON.stringify(mill))
                            return (
                              <SelectItem
                                key={millValue + '-' + index}
                                value={String(millValue)}
                                className="truncate"
                              >
                                {millValue}
                              </SelectItem>
                            )
                          })
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show Items Button */}
                <div className="min-w-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleShowItems}
                    disabled={!selectedGroup || !selectedProductionUnit || !selectedQuality || !selectedGsmFrom || !selectedGsmTo || loadingItems}
                    className="w-full border-[#005180] text-[#005180] hover:bg-[#005180] hover:text-white"
                  >
                    {loadingItems ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 mr-2" />
                        Show Items
                      </>
                    )}
                  </Button>
                </div>

                <div className="min-w-0">
                  <Label htmlFor="message" className="text-sm">Your Question <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="message"
                    placeholder="E.g., Need urgent rate for Product ABC - Customer XYZ"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !message.trim() || !selectedPerson || !selectedProductionUnit || !selectedGroup || !selectedQuality || !selectedGsmFrom || !selectedGsmTo}
                  className="w-full bg-[#005180] hover:bg-[#004060]"
                  title={!selectedPerson ? "Please select a team member" : ""}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Requests */}
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-3">My Rate Requests</CardTitle>
              <div className="flex gap-2">
                <Select value={requestFilter} onValueChange={(value: "all" | "answered" | "unanswered") => setRequestFilter(value)}>
                  <SelectTrigger className="w-[140px] sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                    <SelectItem value="unanswered">Unanswered</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: "latest" | "oldest") => setSortOrder(value)}>
                  <SelectTrigger className="w-[140px] sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No rate requests yet</p>
                  <p className="text-sm mt-2">Submit your first question above</p>
                </div>
              ) : (() => {
                // Filter requests based on selection
                const filteredRequests = myRequests
                  .filter(request => {
                    const isAnswered = !!(request.rate || request.providedRate || request.currentStatus?.toLowerCase() === 'responded')

                    if (requestFilter === 'answered') {
                      return isAnswered
                    } else if (requestFilter === 'unanswered') {
                      return !isAnswered
                    }
                    return true // 'all'
                  })
                  .sort((a, b) => {
                    // Sort by requestId (higher ID = newer request)
                    if (sortOrder === 'latest') {
                      return b.requestId - a.requestId // Newest first (higher IDs first)
                    } else {
                      return a.requestId - b.requestId // Oldest first (lower IDs first)
                    }
                  })

                if (filteredRequests.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No {requestFilter === 'all' ? '' : requestFilter} requests found</p>
                    </div>
                  )
                }

                return (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {filteredRequests.map((request) => {
                        const parsed = parseRequestMessage(request.requestMessage || '')
                        return (
                          <div
                            key={request.requestId}
                            onClick={() => {
                              clientLogger.log('📋 Ask Rate - Opening timeline for request:', request)
                              setSelectedRequestForTimeline(request)
                              setShowTimeline(true)
                            }}
                            className="border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg bg-white"
                          >
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">#{request.requestId}</span>
                                {getStatusBadge(request.currentStatus)}
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  {request.department}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {request.createdAt
                                  ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })
                                  : 'Recently'}
                              </span>
                            </div>

                            {/* Requestor */}
                            {request.requestorName && (
                              <p className="text-xs text-gray-500 mb-3">From: <span className="font-medium text-gray-700">{request.requestorName}</span></p>
                            )}

                            {/* Item Details Grid */}
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-blue-600 text-xs">Item Group</span>
                                  <p className="font-semibold text-blue-900">{parsed.itemGroup || request.itemName || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-blue-600 text-xs">Quality</span>
                                  <p className="font-semibold text-blue-900">{parsed.quality || '-'}</p>
                                </div>
                                {parsed.mill && (
                                  <div>
                                    <span className="text-blue-600 text-xs">Mill</span>
                                    <p className="font-semibold text-blue-900">{parsed.mill}</p>
                                  </div>
                                )}
                              </div>
                              {parsed.gsmRange && (
                                <div className="mt-2 pt-2 border-t border-blue-100">
                                  <span className="text-blue-600 text-xs">GSM Range</span>
                                  <p className="font-semibold text-blue-900">{parsed.gsmRange}</p>
                                </div>
                              )}
                            </div>

                            {/* Question */}
                            {parsed.question && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <span className="text-gray-500 text-xs">Question</span>
                                <p className="text-sm text-gray-700">{parsed.question}</p>
                              </div>
                            )}

                            {/* Rate Response (if answered) */}
                            {(request.rate || request.providedRate) && (
                              <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-green-600 mb-1">Provided Rate</p>
                                  <p className="text-xl font-bold text-green-700">
                                    ₹{(() => {
                                      const rate = request.providedRate || request.rate
                                      return typeof rate === 'number' ? rate.toFixed(2) : rate
                                    })()}
                                  </p>
                                </div>
                                {request.respondedAt && (
                                  <p className="text-xs text-green-600">
                                    {formatDistanceToNow(new Date(request.respondedAt), { addSuffix: true })}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Click hint */}
                            <p className="text-xs text-gray-400 mt-2 text-center">Tap to view items & details</p>
                          </div>
                        )
                      })}
                  </div>
                </ScrollArea>
                )
              })()}
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>

      {/* Request Timeline Dialog */}
      {selectedRequestForTimeline && (
        <RequestTimeline
          open={showTimeline}
          onOpenChange={setShowTimeline}
          requestId={selectedRequestForTimeline.requestId}
          requestMessage={selectedRequestForTimeline.requestMessage}
          itemName={selectedRequestForTimeline.itemName}
          itemCode={selectedRequestForTimeline.itemCode}
        />
      )}

      {/* Items Popup Dialog */}
      <Dialog open={showItemsPopup} onOpenChange={setShowItemsPopup}>
        <DialogContent className="sm:max-w-[600px] p-0" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <DialogHeader className="p-4 pb-2 border-b" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div className="bg-[#005180] p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg">Filtered Items</DialogTitle>
                <p className="text-sm text-gray-500">Items matching your selection criteria</p>
              </div>
            </div>
          </DialogHeader>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Selection Info - Fixed */}
            <div className="bg-[#005180]/5 border-b border-[#005180]/20 p-3" style={{ flexShrink: 0 }}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[#005180] text-xs font-medium">Item Group</span>
                  <p className="font-semibold text-gray-900 truncate">{getSelectedGroupName() || '-'}</p>
                </div>
                <div>
                  <span className="text-[#005180] text-xs font-medium">Quality</span>
                  <p className="font-semibold text-gray-900 truncate">{getSelectedQualityName() || '-'}</p>
                </div>
                <div>
                  <span className="text-[#005180] text-xs font-medium">GSM Range</span>
                  <p className="font-semibold text-gray-900">{selectedGsmFrom && selectedGsmTo ? `${selectedGsmFrom} - ${selectedGsmTo}` : '-'}</p>
                </div>
                {selectedMill && (
                  <div>
                    <span className="text-[#005180] text-xs font-medium">Mill</span>
                    <p className="font-semibold text-gray-900 truncate">{selectedMill}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Header - Fixed */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b" style={{ flexShrink: 0 }}>
              <h4 className="font-semibold text-[#005180]">Items</h4>
              <Badge className="bg-[#005180] text-white">{filteredItems.length} items</Badge>
            </div>

            {/* Items List - Scrollable */}
            <div className="px-4 py-2" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {loadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#005180]" />
                  <span className="ml-3 text-gray-600">Loading items...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No items found for the selected criteria</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item, index) => {
                    const rate = item.Rate || item.rate || item.EstimationRate || item.estimationRate || null
                    const rawName = item.ItemName || item.itemName || item.Name || '-'

                    // Extract GSM from item properties or from name
                    // Name format: "ART PAPER, 150, , -, 585X915" where 150 is GSM
                    let gsm = item.GSM || item.gsm || null

                    // If GSM not in properties, try to extract from name (second part after first comma)
                    if (!gsm && rawName.includes(',')) {
                      const parts = rawName.split(',')
                      if (parts.length >= 2) {
                        const potentialGsm = parts[1].trim()
                        // Check if it's a number (GSM value)
                        if (/^\d+$/.test(potentialGsm)) {
                          gsm = potentialGsm
                        }
                      }
                    }

                    // Clean up item name - keep only the quality/product name
                    // Pattern: "ART PAPER, 150, , -, 585X915" -> "ART PAPER"
                    let displayName = rawName
                      // Take only the first part (before first comma) which is the quality name
                      .split(',')[0]
                      .trim()

                    // If name is empty or just dashes, use quality from selection
                    if (!displayName || displayName === '-') {
                      displayName = getSelectedQualityName() || '-'
                    }

                    return (
                      <div
                        key={item.ItemID || item.itemId || index}
                        className="border border-[#005180]/20 rounded-lg p-3 bg-white hover:bg-[#005180]/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {displayName}
                            </p>
                            {gsm && (
                              <span className="bg-[#005180]/10 text-[#005180] px-2 py-0.5 rounded text-xs font-semibold">
                                GSM: {gsm}
                              </span>
                            )}
                          </div>
                          {rate && (
                            <span className="bg-[#005180] text-white px-2 py-0.5 rounded text-xs font-medium ml-2">
                              ₹{rate}
                            </span>
                          )}
                        </div>
                        {!rate && (
                          <div className="mt-1.5">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">No rate</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Always visible at bottom */}
          <div className="p-4 border-t bg-white" style={{ flexShrink: 0 }}>
            <Button
              variant="outline"
              onClick={() => setShowItemsPopup(false)}
              className="w-full border-[#005180] text-[#005180] hover:bg-[#005180] hover:text-white h-11"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
