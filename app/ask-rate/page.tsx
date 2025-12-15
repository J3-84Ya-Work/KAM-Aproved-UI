"use client"

import { useState, useCallback, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageSquare, Clock, CheckCircle, RefreshCw, AlertCircle } from "lucide-react"
import { getUserRateRequests, createRateRequest } from "@/lib/rate-queries-api"
import { getCurrentUser } from "@/lib/permissions"
import { formatDistanceToNow, differenceInHours } from "date-fns"
import { RequestTimeline } from "@/components/request-timeline"
import { clientLogger } from "@/lib/logger"
import { getItemsListAPI, getItemMasterListAPI } from "@/lib/api-config"

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
}

// Team members list with their departments
const TEAM_MEMBERS = [
  { id: 'bhumika', name: 'Bhumika', email: 'bhumika.indusanalytics@gmail.com', department: 'Purchase' },
  { id: 'rajesh', name: 'Rajesh Kumar', email: 'rajesh@example.com', department: 'Purchase' },
  { id: 'amit', name: 'Amit Sharma', email: 'amit@example.com', department: 'Operations' },
  { id: 'priya', name: 'Priya Singh', email: 'priya@example.com', department: 'Operations' },
] as const

export default function AskRatePage() {
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string>("")
  const [department, setDepartment] = useState<"Purchase" | "Operations" | "Sales">("Purchase")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myRequests, setMyRequests] = useState<RateQuery[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [selectedRequestForTimeline, setSelectedRequestForTimeline] = useState<RateQuery | null>(null)
  const [requestFilter, setRequestFilter] = useState<"all" | "answered" | "unanswered">("all")
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [items, setItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<string>("")
  const [loadingItems, setLoadingItems] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [loadingGroups, setLoadingGroups] = useState(false)

  // Auto-set department when person is selected
  const handlePersonChange = (personId: string) => {
    setSelectedPerson(personId)
    const person = TEAM_MEMBERS.find(p => p.id === personId)
    if (person) {
      setDepartment(person.department as "Purchase" | "Operations" | "Sales")
    }
  }

  // Clear item selection when group changes
  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId)
    setSelectedItem("") // Clear item when group changes
  }

  // Get selected group name for display
  const getSelectedGroupName = () => {
    if (!selectedGroup) return ""
    const group = groups.find(g => String(g.ItemGroupID || g.GroupID || g.id) === selectedGroup)
    if (!group) return ""
    const groupName = group.ItemGroupName || group.GroupName || group.Name || group.name || ""
    return groupName.replace(/^[-,\s]+/, '').trim()
  }

  // Get selected item name for display
  const getSelectedItemName = () => {
    if (!selectedItem) return ""
    const item = items.find(i => String(i.ItemID || i.id) === selectedItem)
    if (!item) return ""
    // Use ItemName field from the API response
    const itemName = item.ItemName || item.Name || item.name || ""
    return itemName.replace(/^[-,\s]+/, '').trim()
  }

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) {
      toggleMenu()
    }
  }

  // Get current user
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Fetch items list when group is selected
  useEffect(() => {
    if (!selectedGroup) {
      setItems([])
      return
    }

    const fetchItems = async () => {
      setLoadingItems(true)
      try {
        const itemsList = await getItemsListAPI(selectedGroup)
        setItems(itemsList)
        clientLogger.log('Items list fetched for group:', selectedGroup, itemsList)
      } catch (error) {
        clientLogger.error('Error fetching items:', error)
      } finally {
        setLoadingItems(false)
      }
    }

    fetchItems()
  }, [selectedGroup])

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

  // Fetch user's rate requests
  const fetchMyRequests = useCallback(async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      // Use user ID 2 as default for KAM users (you can map this to actual user IDs)
      const userId = 2
      const result = await getUserRateRequests(userId)
      if (result.success && result.data) {
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

    if (!selectedItem) {
      alert('Please select an item')
      return
    }

    if (!selectedGroup) {
      alert('Please select a group')
      return
    }

    setIsSubmitting(true)
    try {
      // Get selected item details
      const selectedItemData = items.find(i => String(i.ItemID || i.id) === selectedItem)

      const result = await createRateRequest({
        requestorId: 2, // You can map this to actual user ID
        department: department,
        requestMessage: message.trim(),
        ItemCode: selectedItemData?.ItemCode || selectedItemData?.Code || "",
        ItemID: selectedItem,
        ItemName: selectedItemData?.ItemName || selectedItemData?.Name || selectedItemData?.name || "",
        PlantID: "2" // Default plant ID, can be made dynamic if needed
      })

      if (result.success) {
        alert('✅ Rate request sent successfully!')
        setMessage("")
        setSelectedPerson("")
        setSelectedItem("")
        setSelectedGroup("")
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
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader pageName="Ask Rate" onMenuClick={handleMenuClick} showBackButton={false} />
        <div className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6 max-w-full overflow-x-hidden">
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
                <div>
                  <Label htmlFor="person">Select Person *</Label>
                  <Select value={selectedPerson} onValueChange={handlePersonChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{person.name}</span>
                            <span className="text-xs text-gray-500">({person.email})</span>
                          </div>
                        </SelectItem>
                      ))}
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

                {/* Group and Item in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="group">Select Group *</Label>
                    <Select value={selectedGroup} onValueChange={handleGroupChange} disabled={loadingGroups}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingGroups ? "Loading groups..." : "Choose a group"}>
                        {selectedGroup ? getSelectedGroupName() : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-w-md">
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
                      <div className="overflow-x-auto">
                        {groups.map((group, index) => {
                          const groupName = group.ItemGroupName || group.GroupName || group.Name || group.name || `Group ${index + 1}`
                          // Remove leading "-, " or "-" and trim whitespace
                          const cleanedName = groupName.replace(/^[-,\s]+/, '').trim()

                          return (
                            <SelectItem
                              key={group.ItemGroupID || group.GroupID || group.id || index}
                              value={String(group.ItemGroupID || group.GroupID || group.id || index)}
                              className="whitespace-nowrap"
                            >
                              {cleanedName}
                            </SelectItem>
                          )
                        })}
                      </div>
                    </SelectContent>
                  </Select>
                  </div>

                  <div>
                    <Label htmlFor="item">Select Item *</Label>
                    <Select value={selectedItem} onValueChange={setSelectedItem} disabled={!selectedGroup || loadingItems}>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedGroup ? "Select group first" : loadingItems ? "Loading items..." : "Choose an item"}>
                          {selectedItem ? getSelectedItemName() : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-w-md">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                          <input
                            type="text"
                            placeholder="Search items..."
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
                        <div className="overflow-x-auto">
                          {items.map((item, index) => {
                            // Use ItemName field from the API response
                            const itemName = item.ItemName || item.Name || item.name || `Item ${index + 1}`
                            // Remove leading "-, " or "-" and trim whitespace
                            const cleanedName = itemName.replace(/^[-,\s]+/, '').trim()

                            return (
                              <SelectItem
                                key={item.ItemID || item.id || index}
                                value={String(item.ItemID || item.id || index)}
                                className="whitespace-nowrap"
                              >
                                {cleanedName}
                              </SelectItem>
                            )
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Your Question</Label>
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
                  disabled={isSubmitting || !message.trim() || !selectedPerson}
                  className="w-full bg-[#005180] hover:bg-[#004060]"
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
                      {filteredRequests.map((request) => (
                      <div
                        key={request.requestId}
                        onClick={() => {
                          setSelectedRequestForTimeline(request)
                          setShowTimeline(true)
                        }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          request.status?.toLowerCase() === 'pending'
                            ? 'border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50/50'
                            : 'border-green-200 bg-green-50/30 hover:bg-green-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Request #{request.requestId}
                              </h3>
                              {getStatusBadge(request.currentStatus)}
                              <Badge variant="outline" className="text-xs">
                                {request.department}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{request.requestMessage}</p>
                            <p className="text-xs text-gray-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {request.createdAt
                                ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })
                                : 'Recently'}
                            </p>
                          </div>
                        </div>

                        {(request.rate || request.providedRate) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-green-700 font-semibold">
                              <span className="text-lg">Rate: {(() => {
                                const rate = request.providedRate || request.rate
                                return typeof rate === 'number' ? rate.toFixed(2) : rate
                              })()}</span>
                            </div>
                            {request.respondedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Answered {formatDistanceToNow(new Date(request.respondedAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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
        />
      )}
    </SidebarProvider>
  )
}
