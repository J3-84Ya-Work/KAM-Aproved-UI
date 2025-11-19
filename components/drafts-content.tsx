"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllDrafts, getMockDrafts, type DraftRecord } from "@/lib/drafts-api"

export function DraftsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [draftRecords, setDraftRecords] = useState<DraftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  const fetchDrafts = useCallback(async () => {
    setLoading(true)
    setError(null)
    setUsingMockData(false)
    try {
      const result = await getAllDrafts()
      if (result.success && result.data) {
        setDraftRecords(result.data)
      } else {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data:', result.error)
        setDraftRecords(getMockDrafts())
        setUsingMockData(true)
        setError(`API Error: ${result.error} (showing sample data)`)
      }
    } catch (err) {
      // Fallback to mock data on error
      console.warn('Error fetching drafts, using mock data:', err)
      setDraftRecords(getMockDrafts())
      setUsingMockData(true)
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'} (showing sample data)`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  const filteredDrafts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return draftRecords
    return draftRecords.filter((record) => {
      return (
        record.DraftName?.toLowerCase().includes(query) ||
        record.Module?.toLowerCase().includes(query) ||
        record.DraftID?.toString().includes(query)
      )
    })
  }, [searchQuery, draftRecords])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by draft ID, name, or module..."
            className="pl-9"
            disabled={loading}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchDrafts}
          disabled={loading}
          title="Refresh drafts"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#005180]/10 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg font-bold text-foreground">Draft Inquiries</CardTitle>
            <div className="flex items-center gap-2">
              {usingMockData && (
                <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50">
                  Sample Data
                </Badge>
              )}
              <Badge variant="outline" className="border-blue-40 text-blue bg-blue-10">
                {filteredDrafts.length} Pending
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#005180] mb-3" />
              <p className="text-sm text-muted-foreground">Loading drafts...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDrafts}
                className="border-[#005180] text-[#005180] hover:bg-[#005180] hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#005180]">
                <TableRow className="[&_th]:text-white [&_th]:font-semibold">
                  <TableHead className="w-[120px]">Draft ID</TableHead>
                  <TableHead className="w-[250px]">Draft Name</TableHead>
                  <TableHead className="w-[150px]">Module</TableHead>
                  <TableHead className="w-[120px]">Auto Save</TableHead>
                  <TableHead className="w-[180px]">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrafts.map((draft) => (
                  <TableRow key={draft.DraftID} className="hover:bg-blue-5 transition-colors">
                    <TableCell className="font-semibold text-blue">{draft.DraftID}</TableCell>
                    <TableCell className="font-medium">{draft.DraftName}</TableCell>
                    <TableCell className="uppercase tracking-wide text-sm font-semibold text-muted-foreground">
                      {draft.Module}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${draft.IsAutoSave ? 'bg-green-10 text-green-700 border-green-40' : 'bg-blue-10 text-blue border-blue-40'} text-xs font-semibold uppercase`}
                      >
                        {draft.IsAutoSave ? 'Auto' : 'Manual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {new Date(draft.UpdatedAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDrafts.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      {searchQuery ? 'No draft inquiries match your search.' : 'No draft inquiries found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
