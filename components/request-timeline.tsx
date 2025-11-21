"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, User, ArrowRight, CheckCircle, AlertCircle, TrendingUp, FileText } from "lucide-react"
import { getRequestHistory } from "@/lib/rate-queries-api"
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
}

interface RequestTimelineProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: number
  requestMessage: string
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

export function RequestTimeline({ open, onOpenChange, requestId, requestMessage }: RequestTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        setTimeline(result.data)
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-1">Request Message</p>
              <p className="text-sm text-blue-800 break-words">{requestMessage}</p>
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
    </Dialog>
  )
}
