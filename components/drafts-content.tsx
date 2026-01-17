"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, AlertCircle, RefreshCw, Trash2, Edit2, FileText, Mic, MicOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table'
import { ThemeProvider } from '@mui/material/styles'
import { mrtTheme } from '@/lib/mrt-theme'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAllDrafts, getMockDrafts, loadDraft, deleteDraft, renameDraft, deleteOldDrafts, type DraftRecord } from "@/lib/drafts-api"
import { useToast } from "@/hooks/use-toast"
import { clientLogger } from "@/lib/logger"

export function DraftsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [draftRecords, setDraftRecords] = useState<DraftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [draftToDelete, setDraftToDelete] = useState<DraftRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [draftToRename, setDraftToRename] = useState<DraftRecord | null>(null)
  const [newDraftName, setNewDraftName] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  // Voice search state
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  const fetchDrafts = useCallback(async () => {
    setLoading(true)
    setError(null)
    setUsingMockData(false)
    try {
      const cleanupResult = await deleteOldDrafts(7)
      if (cleanupResult.deletedCount > 0) {
        clientLogger.log(`[Drafts Cleanup] Deleted ${cleanupResult.deletedCount} old drafts`)
      }

      const result = await getAllDrafts()
      if (result.success && result.data) {
        setDraftRecords(result.data)
      } else {
        clientLogger.warn('API failed, using mock data:', result.error)
        setDraftRecords(getMockDrafts())
        setUsingMockData(true)
        setError(`API Error: ${result.error} (showing sample data)`)
      }
    } catch (err: any) {
      clientLogger.warn('Error fetching drafts, using mock data:', err)
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setSearchQuery(transcript)
          setIsListening(false)
        }

        recognitionInstance.onerror = (event: any) => {
          clientLogger.error('Speech recognition error:', event.error)
          setIsListening(false)
          toast({
            variant: "destructive",
            title: "Voice Search Error",
            description: `Failed to recognize speech: ${event.error}`,
          })
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [toast])

  const handleVoiceSearch = () => {
    if (!recognition) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Voice search is not supported in your browser.",
      })
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      try {
        recognition.start()
        setIsListening(true)
      } catch (error) {
        clientLogger.error('Error starting recognition:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start voice search.",
        })
      }
    }
  }

  const filteredDrafts = useMemo(() => {
    return draftRecords.filter((record) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch = query === "" || (
        record.DraftName?.toLowerCase().includes(query) ||
        record.Module?.toLowerCase().includes(query) ||
        record.DraftID?.toString().includes(query)
      )
      return matchesSearch
    })
  }, [searchQuery, draftRecords])

  const handleLoadDraft = async (draft: DraftRecord) => {
    try {
      clientLogger.log('[Draft Load] Loading draft:', draft.DraftID)
      const result = await loadDraft(draft.DraftID)
      clientLogger.log('[Draft Load] API response:', result)

      if (result && result.success && result.data && result.data.DraftData) {
        const draftData = result.data.DraftData
        const draftId = result.data.DraftID
        clientLogger.log('[Draft Load] Draft data:', draftData)
        clientLogger.log('[Draft Load] Draft ID:', draftId)
        clientLogger.log('[Draft Load] Draft data FormType:', draftData.FormType)

        const draftDataWithId = {
          ...draftData,
          LoadedDraftID: draftId
        }

        if (draftData.FormType === 'DynamicFill') {
          sessionStorage.setItem('loadedDraft', JSON.stringify(draftDataWithId))
          clientLogger.log('[Draft Load] Navigating to Dynamic Fill with Draft ID:', draftId)
          router.push('/inquiries/new?mode=dynamic&loadDraft=true')
        } else if (draftData.FormType === 'ManualForm') {
          sessionStorage.setItem('loadedDraft', JSON.stringify(draftDataWithId))
          clientLogger.log('[Draft Load] Navigating to Manual Form with Draft ID:', draftId)
          router.push('/inquiries/new?mode=manual&loadDraft=true')
        } else {
          clientLogger.error('[Draft Load] Unknown FormType:', draftData.FormType)
          toast({
            variant: "destructive",
            title: "Unknown Form Type",
            description: "Unable to determine the form type for this draft.",
          })
        }
      } else {
        clientLogger.error('[Draft Load] Invalid response structure:', result)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid response from server.",
        })
      }
    } catch (error) {
      clientLogger.error('[Draft Load] Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  const handleDeleteClick = (draft: DraftRecord) => {
    setDraftToDelete(draft)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!draftToDelete) return

    setIsDeleting(true)
    try {
      await deleteDraft(draftToDelete.DraftID)
      toast({
        title: "Success",
        description: "Draft deleted successfully",
      })
      fetchDrafts()
      setDeleteDialogOpen(false)
      setDraftToDelete(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRenameClick = (draft: DraftRecord) => {
    setDraftToRename(draft)
    setNewDraftName(draft.DraftName)
    setRenameDialogOpen(true)
  }

  const handleRenameConfirm = async () => {
    if (!draftToRename || !newDraftName.trim()) return

    setIsRenaming(true)
    try {
      await renameDraft(draftToRename.DraftID, newDraftName.trim())
      toast({
        title: "Success",
        description: "Draft renamed successfully",
      })
      fetchDrafts()
      setRenameDialogOpen(false)
      setDraftToRename(null)
      setNewDraftName("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to rename draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsRenaming(false)
    }
  }

  // Define MRT columns
  const columns = useMemo<MRT_ColumnDef<DraftRecord>[]>(
    () => [
      {
        accessorKey: 'DraftID',
        header: 'DRAFT ID',
        size: 100,
      },
      {
        accessorKey: 'DraftName',
        header: 'DRAFT NAME',
        size: 200,
      },
      {
        accessorKey: 'Module',
        header: 'MODULE',
        size: 120,
        Cell: ({ cell }) => (
          <span className="uppercase tracking-wide text-sm font-semibold text-muted-foreground">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'IsAutoSave',
        header: 'AUTO SAVE',
        size: 100,
        Cell: ({ cell }) => (
          <Badge
            variant="outline"
            className={`${cell.getValue<boolean>()
                ? 'bg-green-10 text-green-700 border-green-40'
                : 'bg-blue-10 text-blue border-blue-40'
              } text-xs font-semibold uppercase`}
          >
            {cell.getValue<boolean>() ? 'Auto' : 'Manual'}
          </Badge>
        ),
      },
      {
        accessorKey: 'UpdatedAt',
        header: 'LAST UPDATED',
        size: 150,
        Cell: ({ cell }) => (
          <span className="text-sm font-medium">
            {new Date(cell.getValue<string>()).toLocaleString('en-IN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'ACTIONS',
        size: 180,
        Cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleLoadDraft(row.original)
              }}
              className="h-8 px-2 text-[#005180] hover:text-[#005180] hover:bg-[#005180]/10"
              title="Load draft"
            >
              <FileText className="h-4 w-4 mr-1" />
              Load
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleRenameClick(row.original)
              }}
              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Rename draft"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(row.original)
              }}
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete draft"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleLoadDraft, handleRenameClick, handleDeleteClick]
  )

  // Create MRT table instance
  const table = useMaterialReactTable({
    columns,
    data: filteredDrafts,
    enableColumnOrdering: false,
    enableSorting: true,
    enablePagination: true,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    initialState: {
      density: 'comfortable',
      pagination: { pageSize: 20, pageIndex: 0 },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#005180',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '14px 20px',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        '&:last-child': {
          borderRight: 'none',
        },
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: row.index % 2 === 0 ? 'white' : 'rgba(185, 34, 33, 0.05)',
        '&:hover': {
          backgroundColor: 'rgba(120, 190, 32, 0.2)',
        },
      },
    }),
    muiTableBodyCellProps: {
      sx: {
        padding: '16px',
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
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
          onClick={handleVoiceSearch}
          disabled={loading}
          title={isListening ? "Stop voice search" : "Start voice search"}
          className={isListening ? "bg-red-50 border-red-500 text-red-600" : ""}
        >
          {isListening ? (
            <MicOff className="h-4 w-4 animate-pulse" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Card className="overflow-hidden">
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
            <ThemeProvider theme={mrtTheme}>
              <MaterialReactTable table={table} />
            </ThemeProvider>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{draftToDelete?.DraftName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Draft</DialogTitle>
            <DialogDescription>
              Enter a new name for "{draftToRename?.DraftName}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newDraftName}
              onChange={(e) => setNewDraftName(e.target.value)}
              placeholder="Enter new draft name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newDraftName.trim()) {
                  handleRenameConfirm()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameConfirm}
              disabled={isRenaming || !newDraftName.trim()}
              className="bg-[#005180] hover:bg-[#004875]"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
